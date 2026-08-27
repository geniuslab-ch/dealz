const crypto = require("crypto");
const { runTurn } = require("./claude");
const { runTurnMock } = require("./mock");
const { classifyObjection, draftSuggestedReply } = require("./objections");
const { sendBookingConfirmation, sendDeclineNotification } = require("./notifications");
const store = require("./store");
const { getCompanyByPhoneNumberId } = require("./companies");

/**
 * WhatsApp channel for the same quote engine the website chat widget uses
 * (src/claude.js's runTurn / src/mock.js's runTurnMock) — talks to Meta's
 * WhatsApp Cloud API directly (no Twilio or other paid middleman). The
 * Cloud API itself has no platform fee, and every message here is a
 * customer-initiated "service" reply — Meta's own free category, not
 * billed at all (see docs/companies.js's onboarding notes for the numbers).
 *
 * Multi-tenant: many cleaning companies' own WhatsApp numbers can share one
 * Meta Business Account (WABA) and one access token — Meta's webhook payload
 * tells us which number received each message (metadata.phone_number_id),
 * which src/companies.js resolves to that company's own name + pricing
 * grid. A single ACCESS_TOKEN sends on behalf of any of them by just
 * targeting the right phone_number_id per call.
 *
 * The server has no session/database, so per-sender conversation state
 * (the same `messages[]` array the website keeps in a browser-side closure)
 * lives in an in-memory Map here instead, keyed by (receiving number,
 * customer number) — same fine-for-a-single-process-demo tradeoff as
 * src/store.js.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
const MOCK_MODE = process.env.MOCK_MODE === "true";

function isConfigured() {
  return !!process.env.WHATSAPP_ACCESS_TOKEN;
}

async function sendWhatsAppText(to, body, fromPhoneNumberId) {
  if (!isConfigured() || !fromPhoneNumberId) {
    console.log(`\n===== [WHATSAPP SIMULÉ — configurez WHATSAPP_ACCESS_TOKEN (et un numéro dans src/companies.js)] =====`);
    console.log(`De : ${fromPhoneNumberId || "(non configuré)"}\nÀ : ${to}\n${body}`);
    console.log("=====\n");
    return { simulated: true };
  }
  const url = `https://graph.facebook.com/${API_VERSION}/${fromPhoneNumberId}/messages`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `WhatsApp API responded ${resp.status}`);
  return data;
}

// ---- Meta webhook handshake + request authenticity ----

// Meta calls GET once, at setup time, with a token you chose yourself when
// configuring the webhook in the Meta App Dashboard — echoing back the
// challenge proves you control this endpoint.
function verifyWebhookChallenge(mode, token) {
  return mode === "subscribe" && !!token && token === process.env.WHATSAPP_VERIFY_TOKEN;
}

// Every real POST from Meta is signed with your app's secret — without
// this check, anyone who finds the webhook URL could feed it fake messages
// (each one triggers a real WhatsApp send and, on a decline, a real e-mail).
// Requires the raw request body bytes, captured by server.js's
// express.json({verify}) option. Skips the check (with a console warning)
// if WHATSAPP_APP_SECRET isn't set, so local testing without it still works.
function verifySignature(req) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !req.rawBody) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- Per-sender conversation state ----
// Keyed by (receiving company number, customer number) — the same customer
// phone messaging two different companies' numbers gets two independent
// conversations.

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6h of silence starts a fresh conversation

function sessionKey(phoneNumberId, from) {
  return `${phoneNumberId}:${from}`;
}
function getSession(phoneNumberId, from) {
  const key = sessionKey(phoneNumberId, from);
  const existing = sessions.get(key);
  if (existing && Date.now() - existing.updatedAt < SESSION_TTL_MS) return existing;
  const fresh = { messages: [], pendingOptions: null, pendingQuote: null, updatedAt: Date.now() };
  sessions.set(key, fresh);
  return fresh;
}
function touchSession(session) {
  session.updatedAt = Date.now();
}
function clearSession(phoneNumberId, from) {
  sessions.delete(sessionKey(phoneNumberId, from));
}

// ---- Formatting helpers ----

// Assistant turns from runTurn/runTurnMock use the raw Anthropic content
// shape — either a plain string (mock engine, and tool-result echoes) or a
// content-block array (real Claude responses) mixing text and tool_use
// blocks. Only the text blocks are ever shown to the customer.
function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  }
  return "";
}

function formatQuoteText(quote) {
  const lines = quote.items.map((i) => `• ${i.label} : ${quote.currency} ${i.amount.toFixed(2)}`);
  const warn = quote.warnings && quote.warnings.length ? `\n\n⚠️ ${quote.warnings.join(" ")}` : "";
  return (
    `Voici votre devis, ferme et détaillé :\n\n${lines.join("\n")}\n\n` +
    `Total : ${quote.currency} ${quote.total.toFixed(2)}${warn}\n\n` +
    `Répondez *OUI* pour confirmer la réservation, ou *NON* pour la refuser.`
  );
}

function formatOptionsText(options) {
  const lines = options.map((o, i) => `${i + 1}. ${o.label}`);
  return `${lines.join("\n")}\n\n(Répondez avec le numéro, ou tapez directement votre réponse.)`;
}

const YES_RE = /^(oui|ok|d['’]accord|confirm[ée]|j['’]accepte|yes)\b/i;
const NO_RE = /^(non|annul|refus|no)\b/i;

// ---- Main orchestrator — one inbound WhatsApp text in, zero or more
// outbound WhatsApp sends out. Reuses runTurn/runTurnMock exactly as
// /api/chat does (real Claude, silently falling back to the scripted
// engine on any API error), plus the same accept/decline notification
// logic as /api/accept and /api/decline — just triggered by a WhatsApp
// reply instead of a website button click. `phoneNumberId` is the company's
// own WhatsApp number that received the message (Meta's metadata.
// phone_number_id) — resolved to that company's config via
// src/companies.js, so replies go out from the same number, priced with
// that company's own grid.
async function handleIncomingMessage(phoneNumberId, from, rawText) {
  const company = getCompanyByPhoneNumberId(phoneNumberId);
  if (!company) {
    console.warn(`[whatsapp] Message reçu sur un numéro non configuré (phone_number_id=${phoneNumberId}) — ignoré.`);
    return;
  }
  const reply = (body) => sendWhatsAppText(from, body, phoneNumberId);

  const session = getSession(phoneNumberId, from);
  touchSession(session);
  const text = (rawText || "").trim();
  if (!text) return;

  if (session.pendingQuote) {
    const quote = session.pendingQuote;

    if (YES_RE.test(text)) {
      session.pendingQuote = null;
      try {
        const result = await sendBookingConfirmation({
          quote,
          customer: quote.customer || {},
          notifyEmail: company.notifyEmail,
        });
        await reply(
          "Réservation confirmée ! 🎉\n\nNous revenons vers vous rapidement pour planifier l'intervention." +
            (result.calendarLink ? `\n\nAjouter à votre agenda : ${result.calendarLink}` : "")
        );
      } catch (err) {
        console.error("[whatsapp] booking confirmation failed:", err);
        await reply("Un souci technique est survenu lors de la confirmation — nous vous recontactons directement.");
      }
      clearSession(phoneNumberId, from);
      return;
    }

    if (NO_RE.test(text)) {
      session.pendingQuote = null;
      try {
        const classified = await classifyObjection(text);
        const declineToken = store.put({
          type: "decline",
          quote,
          category: classified.category,
          summary: classified.summary,
          rawText: text,
          customer: quote.customer || {},
          status: "pending",
        });
        const suggestedReply = await draftSuggestedReply({
          category: classified.category,
          summary: classified.summary,
          rawText: text,
          quote,
          customer: quote.customer || {},
        });
        await sendDeclineNotification({
          quote,
          category: classified.category,
          summary: classified.summary,
          rawText: text,
          customer: quote.customer || {},
          declineToken,
          suggestedReply,
          notifyEmail: company.notifyEmail,
        });
      } catch (err) {
        console.error("[whatsapp] decline notification failed:", err);
      }
      await reply("Compris, merci pour votre retour — nous en tenons compte. N'hésitez pas à nous recontacter si vous changez d'avis.");
      clearSession(phoneNumberId, from);
      return;
    }

    await reply("Je n'ai pas bien compris — répondez *OUI* pour confirmer ce devis, ou *NON* pour le refuser.");
    return;
  }

  // A numbered chip question was pending — resolve a bare number back to the
  // exact option label, since the scripted engine matches the customer's
  // reply against the question's exact text (src/mock.js's alreadyAsked/
  // answerFollowing), the way a website chip click would send it.
  let effectiveText = text;
  if (session.pendingOptions) {
    const n = parseInt(text, 10);
    if (Number.isInteger(n) && session.pendingOptions[n - 1]) {
      effectiveText = session.pendingOptions[n - 1].label;
    }
    session.pendingOptions = null;
  }

  session.messages.push({ role: "user", content: effectiveText });

  let data;
  try {
    data = MOCK_MODE ? await runTurnMock(session.messages, company) : await runTurn(session.messages, company);
  } catch (err) {
    console.warn("[whatsapp] Real Claude call failed — falling back to the scripted demo engine:", err.message);
    data = await runTurnMock(session.messages, company);
  }

  session.messages.push(...data.messages);
  touchSession(session);

  for (const m of data.messages) {
    if (m.role !== "assistant") continue;
    const t = extractText(m.content);
    if (t) await reply(t);
  }

  if (data.quote) {
    if (!data.quote.customer) data.quote.customer = {};
    if (!data.quote.customer.phone) data.quote.customer.phone = from;
    session.pendingQuote = data.quote;
    await reply(formatQuoteText(data.quote));
  } else if (data.question?.type === "single" || data.question?.type === "multi") {
    session.pendingOptions = data.question.options;
    await reply(formatOptionsText(data.question.options));
  } else if (data.question?.type === "date") {
    await reply(`Merci d'indiquer une date (à partir du ${data.question.minDate}).`);
  } else if (data.question?.type === "contact_form") {
    await reply("Par exemple : Jean Dupont, jean.dupont@email.com, 079 123 45 67, Rue de la Gare 5, 1000 Lausanne");
  }
}

module.exports = {
  isConfigured,
  sendWhatsAppText,
  verifyWebhookChallenge,
  verifySignature,
  handleIncomingMessage,
};
