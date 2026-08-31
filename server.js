require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const { runTurn } = require("./src/claude");
const { runTurnMock } = require("./src/mock");
const { classifyObjection, draftSuggestedReply, CATEGORIES } = require("./src/objections");
const {
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendRescheduleToCustomer,
  sendRevisedOfferToCustomer,
  sendReplyToCustomer,
  sendFollowupToCustomer,
  sendBookingConfirmation,
  sendInstallRequestNotification,
  sendReferralNotification,
} = require("./src/notifications");
const store = require("./src/store");
const { recordTrialAttempt } = require("./src/leads");
const whatsapp = require("./src/whatsapp");
const { getCompanyBySlug } = require("./src/companies");
const defaultPricing = require("./docs/pricing.json");

const MOCK_MODE = process.env.MOCK_MODE === "true";

const app = express();
// Vercel (and most PaaS hosts) sit behind a proxy — without this, req.protocol
// always reports "http" even on a real https deployment, and the links built
// into notification emails (counteroffer.html, offer.html) would use the
// wrong scheme.
app.set("trust proxy", 1);
// `verify` stashes the raw request bytes on req.rawBody — needed to check
// Meta's X-Hub-Signature-256 on the WhatsApp webhook (see src/whatsapp.js's
// verifySignature). Harmless for every other route, which never reads it.
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.static(path.join(__dirname, "docs")));

// The public URL this server is reachable at, for links built into e-mails
// (counteroffer.html?token=..., offer.html?token=...). APP_BASE_URL is an
// explicit override; otherwise this is derived from the incoming request
// itself, so it's automatically correct on any deployment (Vercel prod,
// Vercel preview URLs, a custom domain, localhost) with zero configuration —
// no more emails linking to a hardcoded "http://localhost:3000" that only
// works on the developer's own machine.
function requestBaseUrl(req) {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

// Allows /api/* and /pricing.json to be called from a client's own website
// when embed.js is loaded there (a different origin than this server) —
// required for the generic embed snippet to work cross-origin at all.
// Wide open (*) is fine for this single-tenant demo; a real multi-tenant
// deployment should allow-list each client's actual domain instead.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Powers the "Essayer sur WhatsApp" card on docs/demo.html — unlike the
// website chat demo, this has NO lead-gate at all: a visitor just messages
// the trial number directly on their own WhatsApp, the same frictionless
// way their own future customers would message them. Nothing to configure
// on the visitor's side, and no extra backend work either — the trial
// number IS the existing default/demo company (see src/companies.js's
// fallback), it just needs to be reachable as a real wa.me link. Returns
// `enabled: false` (card stays hidden client-side) until
// WHATSAPP_TRIAL_NUMBER_E164 is set — this must be the SAME physical
// number registered as WHATSAPP_PHONE_NUMBER_ID, just in public E.164
// digits-only form instead of Meta's internal id.
app.get("/api/whatsapp-trial", (req, res) => {
  const number = process.env.WHATSAPP_TRIAL_NUMBER_E164;
  if (!number) return res.json({ enabled: false });
  const prefill = "Bonjour, je voudrais un devis de nettoyage";
  res.json({ enabled: true, waLink: `https://wa.me/${number}?text=${encodeURIComponent(prefill)}` });
});

// Gate in front of the public demo widget (docs/demo.html + docs/lead-gate.js)
// — records who's trying it and caps free trials, so the demo doesn't run up
// real Anthropic API cost from unlimited anonymous use. See src/leads.js.
app.post("/api/lead", async (req, res) => {
  try {
    const { email, phone, companyName } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "E-mail professionnel requis" });
    }
    const result = await recordTrialAttempt({ email, phone: phone || "", companyName: companyName || "" });

    // Fire-and-forget: if this e-mail matches an existing CRM prospect
    // (e.g. an outbound FREN target trying the real demo on their own),
    // flip their demo_tested flag. Never blocks or fails the lead-gate
    // response — same posture as the install-request forward.
    if (process.env.CRM_DEMO_TESTED_URL && process.env.CRM_INBOUND_SECRET) {
      fetch(process.env.CRM_DEMO_TESTED_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Inbound-Secret": process.env.CRM_INBOUND_SECRET },
        body: JSON.stringify({ email }),
      }).catch((err) => console.error("[lead] CRM demo_tested forward failed:", err.message));
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// Submitted by docs/contact-flow.js (#contact's install-request flow) when
// someone finishes the whole conversational form. Two independent side
// effects — an e-mail to the Dealz team, and forwarding the lead into the
// CRM's pipeline — each wrapped separately so one failing doesn't hide the
// other, and neither ever surfaces as an error to the visitor: the same
// graceful-degradation posture as everywhere else in this codebase. The CRM
// forward is skipped (not an error) when CRM_INBOUND_URL isn't configured.
app.post("/api/install-request", async (req, res) => {
  const {
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    websiteUrl,
    planChoice,
    billingChoice,
    teamSize,
    mainProblem,
    requestSources,
  } = req.body || {};

  if (!contactEmail) {
    return res.status(400).json({ error: "contactEmail requis" });
  }

  const payload = {
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    websiteUrl,
    planChoice,
    billingChoice,
    teamSize,
    mainProblem,
    requestSources,
  };

  const [emailResult, crmResult] = await Promise.allSettled([
    sendInstallRequestNotification(payload),
    (async () => {
      if (!process.env.CRM_INBOUND_URL || !process.env.CRM_INBOUND_SECRET) {
        return { skipped: "CRM_INBOUND_URL/CRM_INBOUND_SECRET not configured" };
      }
      const resp = await fetch(process.env.CRM_INBOUND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Inbound-Secret": process.env.CRM_INBOUND_SECRET },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `CRM responded ${resp.status}`);
      return data;
    })(),
  ]);

  if (emailResult.status === "rejected") {
    console.error("[install-request] notification e-mail failed:", emailResult.reason);
  }
  if (crmResult.status === "rejected") {
    console.error("[install-request] CRM forward failed:", crmResult.reason);
  }

  res.json({ ok: true });
});

// Submitted by docs/parrainage.html when a client nominates a colleague.
// Same two-side-effects, never-block-the-visitor posture as install-request
// above: an internal notification e-mail, and forwarding into the CRM so
// the referred colleague becomes a real prospect (source: "referral").
app.post("/api/referral", async (req, res) => {
  const { referredById, companyName, contactEmail, contactPhone, note } = req.body || {};

  if (!referredById) {
    return res.status(400).json({ error: "referredById requis" });
  }
  if (!contactEmail) {
    return res.status(400).json({ error: "E-mail du confrère requis" });
  }

  const payload = { referredById, companyName, contactEmail, contactPhone, note };

  const [emailResult, crmResult] = await Promise.allSettled([
    sendReferralNotification(payload),
    (async () => {
      if (!process.env.CRM_REFERRAL_URL || !process.env.CRM_INBOUND_SECRET) {
        return { skipped: "CRM_REFERRAL_URL/CRM_INBOUND_SECRET not configured" };
      }
      const resp = await fetch(process.env.CRM_REFERRAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Inbound-Secret": process.env.CRM_INBOUND_SECRET },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `CRM responded ${resp.status}`);
      return data;
    })(),
  ]);

  if (emailResult.status === "rejected") {
    console.error("[referral] notification e-mail failed:", emailResult.reason);
  }
  if (crmResult.status === "rejected") {
    console.error("[referral] CRM forward failed:", crmResult.reason);
    // Unlike install-request, a failed CRM forward here means the referred
    // lead was NOT recorded anywhere — surface this as a real error rather
    // than a silent success, so the visitor knows to try again.
    return res.status(502).json({ error: "Une erreur est survenue — réessayez dans un instant." });
  }

  res.json({ ok: true });
});

// Called by docs/referral-form.js when someone lands on parrainage.html
// without a personalized ?ref=<id> link (e.g. via the generic referral
// link in the site footer rather than their own welcome email) — resolves
// their e-mail to their own client id via the CRM, so the form can still
// attribute the referral correctly. Relayed straight through to the CRM;
// nothing here needs to know how that lookup works.
app.post("/api/referral-identify", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "E-mail requis" });
    if (!process.env.CRM_REFERRAL_IDENTIFY_URL || !process.env.CRM_INBOUND_SECRET) {
      return res.status(503).json({ error: "Service indisponible pour le moment." });
    }
    const resp = await fetch(process.env.CRM_REFERRAL_IDENTIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Inbound-Secret": process.env.CRM_INBOUND_SECRET },
      body: JSON.stringify({ email }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || `CRM responded ${resp.status}`);
    res.json(data);
  } catch (err) {
    console.error("[referral-identify] CRM lookup failed:", err.message);
    res.status(502).json({ error: "Une erreur est survenue — réessayez dans un instant." });
  }
});

// ---- WhatsApp channel (Meta Cloud API) — same quote engine as /api/chat,
// reached over WhatsApp instead of the website widget. See src/whatsapp.js.

// Meta calls this once, at setup time in the Meta App Dashboard, to prove
// this endpoint is really under your control before it'll deliver any
// messages here.
app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (whatsapp.verifyWebhookChallenge(mode, token)) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post("/api/whatsapp/webhook", async (req, res) => {
  if (!whatsapp.verifySignature(req)) {
    console.warn("[whatsapp webhook] invalid or missing signature — rejecting");
    return res.sendStatus(401);
  }
  // Meta expects a fast 200 regardless of what we do with the payload, and
  // will retry (or eventually disable the webhook) if it doesn't get one —
  // acknowledge first, then process.
  res.sendStatus(200);
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message) return; // delivery/read receipts and other non-message events

    // Which of (potentially many) companies' own WhatsApp numbers this
    // message came in on — src/companies.js resolves it to that company's
    // name/pricing, and replies get sent from this same number.
    const phoneNumberId = value?.metadata?.phone_number_id;
    const from = message.from;
    let text = "";
    if (message.type === "text") {
      text = message.text?.body || "";
    } else if (message.type === "interactive") {
      text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
    } else {
      await whatsapp.sendWhatsAppText(
        from,
        "Merci de nous écrire votre demande sous forme de texte — je ne peux pas encore traiter les photos, notes vocales ou fichiers.",
        phoneNumberId
      );
      return;
    }

    await whatsapp.handleIncomingMessage(phoneNumberId, from, text);
  } catch (err) {
    console.error("[whatsapp webhook]", err);
  }
});

// Company-aware pricing lookup — docs/quote-app.js's loadPricing() calls
// this instead of the static /pricing.json whenever a data-dealz-company
// slug is present (see docs/embed.js), so the client-side quote math
// (docs/pricing-engine-client.js, used for the offline/no-backend static
// fallback) also uses the right tenant's numbers. No slug, or an
// unrecognized one, falls back to the single-tenant demo grid.
app.get("/api/pricing", async (req, res) => {
  try {
    const company = await getCompanyBySlug(req.query.company);
    res.json(company ? company.pricing : defaultPricing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// Separate from /api/pricing on purpose — that route's response shape
// (the raw pricing object) is consumed directly by pricing-engine-client.js
// and can't grow extra fields without breaking it. This one exists purely
// so docs/embed.js can show a real "[Company] · Devis" panel header (like
// demo.html's "SwissClean · Devis") instead of a generic one.
app.get("/api/company-info", async (req, res) => {
  try {
    const company = await getCompanyBySlug(req.query.company);
    res.json({
      name: company?.name || null,
      logoUrl: company?.logoUrl || null,
      tagline: company?.tagline || null,
      website: company?.website || null,
      brandColor: company?.brandColor || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const history = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "messages[] is required" });
    }

    // `company` is the slug docs/embed.js reads from data-dealz-company="..."
    // — resolves to that tenant's own name + pricing grid (see
    // src/companies.js). Unset or unrecognized falls back to the original
    // single-tenant demo (SwissClean Sàrl + docs/pricing.json), same as
    // every caller that predates multi-tenant support.
    const company = (await getCompanyBySlug(req.body.company)) || undefined;
    // "fr" (default), "en" or "de" — set by the page/widget the visitor is
    // on (window.DEALZ_LANG in quote-app.js). Only affects item.label text
    // in the returned quote and the assistant's own copy; the pricing math
    // is identical regardless of language.
    const lang = ["en", "de"].includes(req.body.lang) ? req.body.lang : "fr";

    if (MOCK_MODE) {
      return res.json(await runTurnMock(history, company, lang));
    }

    // A visitor on the live demo should never see a broken conversation just
    // because the Anthropic account behind it ran out of credit, hit a rate
    // limit, or had a transient outage — fall back to the same scripted
    // engine MOCK_MODE uses, silently, and log it so the developer notices
    // and can fix the underlying account issue.
    try {
      return res.json(await runTurn(history, company, lang));
    } catch (apiErr) {
      console.warn(
        "[/api/chat] Real Claude call failed — falling back to the scripted demo engine. " +
          "Fix the underlying issue (e.g. add Anthropic credit) to restore the real assistant. " +
          `Error: ${apiErr.message}`
      );
      return res.json(await runTurnMock(history, company, lang));
    }
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal error" });
  }
});

// ---- Decline -> objection -> counteroffer -> re-offer -> accept loop ----

app.post("/api/decline", async (req, res) => {
  try {
    const { quote, category, text, customer, companyEmail } = req.body;
    if (!quote || !quote.items) return res.status(400).json({ error: "quote is required" });

    // `company` (a data-dealz-company slug) is the real-tenant path; the
    // demo's session-captured companyEmail (see docs/lead-gate.js) still
    // wins if both are somehow present, since that's an explicit visitor
    // override on the single-tenant demo, not something a real embed sends.
    const company = await getCompanyBySlug(req.body.company);
    const resolvedNotifyEmail = companyEmail || company?.notifyEmail || undefined;
    const resolvedCompanyName = company?.name;
    const resolvedSignature = company?.signature;
    const resolvedLogoUrl = company?.logoUrl;
    const resolvedTagline = company?.tagline;
    // The language the customer was actually talking to the widget in
    // (window.DEALZ_LANG on the page) — every customer-facing email in this
    // decline → counteroffer → accept chain re-reads this off the stored
    // token, so it stays consistent through the whole flow.
    const lang = ["en", "de"].includes(req.body.lang) ? req.body.lang : "fr";

    let finalCategory = category;
    let summary = text || "";
    if (!finalCategory || !CATEGORIES[finalCategory]) {
      const classified = await classifyObjection(text || "");
      finalCategory = classified.category;
      summary = classified.summary;
    }

    const suggestedReply = await draftSuggestedReply({
      category: finalCategory,
      summary,
      rawText: text || "",
      quote,
      customer: customer || {},
    });

    const declineToken = await store.put({
      type: "decline",
      quote,
      category: finalCategory,
      summary,
      rawText: text || "",
      customer: customer || {},
      suggestedReply,
      companyEmail: resolvedNotifyEmail || null,
      companyName: resolvedCompanyName || null,
      signature: resolvedSignature || null,
      logoUrl: resolvedLogoUrl || null,
      tagline: resolvedTagline || null,
      lang,
      status: "pending",
    });

    const emailResult = await sendDeclineNotification({
      quote,
      category: finalCategory,
      summary,
      rawText: text || "",
      customer: customer || {},
      declineToken,
      suggestedReply,
      baseUrl: requestBaseUrl(req),
      notifyEmail: resolvedNotifyEmail,
    });

    res.json({
      ok: true,
      category: finalCategory,
      categoryLabel: CATEGORIES[finalCategory].label,
      emailPreview: emailResult.preview || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.get("/api/counteroffer/:token", async (req, res) => {
  try {
    const entry = await store.get(req.params.token);
    if (!entry || entry.type !== "decline") return res.status(404).json({ error: "Introuvable ou expiré" });
    const cfg = CATEGORIES[entry.category] || CATEGORIES.other;
    res.json({
      quote: entry.quote,
      category: entry.category,
      categoryLabel: cfg.label,
      emoji: cfg.emoji,
      action: cfg.action,
      primaryCta: cfg.primaryCta,
      secondaryCta: cfg.secondaryCta || null,
      showTotal: cfg.showTotal,
      summary: entry.summary,
      rawText: entry.rawText,
      customer: entry.customer,
      status: entry.status,
      suggestedReply: entry.suggestedReply || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// One endpoint, branching by the objection's configured action — this is
// the owner's entire interface for every objection type, no dashboard.
app.post("/api/counteroffer/:token", async (req, res) => {
  try {
    const entry = await store.get(req.params.token);
    if (!entry || entry.type !== "decline") return res.status(404).json({ error: "Introuvable ou expiré" });

    const cfg = CATEGORIES[entry.category] || CATEGORIES.other;
    const message = req.body.message || "";
    const customer = entry.customer;

    // The secondary CTA ("Maintenir le prix") on price/competitor objections
    // — the owner reviewed and chose not to negotiate. No customer email;
    // just closes the loop. Distinct from the primary action for that
    // category, so it's checked first regardless of cfg.action.
    if (req.body.action === "keep") {
      await store.update(req.params.token, { status: "kept" });
      return res.json({ ok: true });
    }

    // The "Réponse suggérée" block on every decline notification, however
    // it was categorized — the owner edits the AI-drafted reply and sends
    // it as-is, independent of whatever category-specific action (revise,
    // counteroffer, etc.) also applies. Checked before cfg.action for the
    // same reason as "keep" above.
    if (req.body.action === "send-reply") {
      if (!message.trim()) return res.status(400).json({ error: "Message requis" });
      const emailResult = await sendReplyToCustomer({ message, customer, companyName: entry.companyName, companyEmail: entry.companyEmail, signature: entry.signature, logoUrl: entry.logoUrl, tagline: entry.tagline, lang: entry.lang });
      await store.update(req.params.token, { status: "replied" });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "reply") {
      if (!message.trim()) return res.status(400).json({ error: "Message requis" });
      const emailResult = await sendReplyToCustomer({ message, customer, companyName: entry.companyName, companyEmail: entry.companyEmail, signature: entry.signature, logoUrl: entry.logoUrl, tagline: entry.tagline, lang: entry.lang });
      await store.update(req.params.token, { status: "replied" });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "close" || cfg.action === "review") {
      await store.update(req.params.token, { status: "closed" });
      return res.json({ ok: true });
    }

    if (cfg.action === "counteroffer") {
      const amount = Number(req.body.amount);
      if (!amount || amount <= 0) return res.status(400).json({ error: "Montant invalide" });
      const offerToken = await store.put({
        type: "offer",
        kind: "price",
        originalQuote: entry.quote,
        amount,
        message,
        customer,
        companyEmail: entry.companyEmail,
        companyName: entry.companyName,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      await store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendCounterofferToCustomer({
        quote: entry.quote,
        amount,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName,
        companyEmail: entry.companyEmail,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "reschedule") {
      const date = (req.body.date || "").trim();
      if (!date) return res.status(400).json({ error: "Date requise" });
      const offerToken = await store.put({
        type: "offer",
        kind: "date",
        originalQuote: entry.quote,
        amount: entry.quote.total,
        date,
        message,
        customer,
        companyEmail: entry.companyEmail,
        companyName: entry.companyName,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      await store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendRescheduleToCustomer({
        date,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName,
        companyEmail: entry.companyEmail,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "revise") {
      const removeLabels = Array.isArray(req.body.removeItems) ? req.body.removeItems : [];
      const items = entry.quote.items.filter((i) => !removeLabels.includes(i.label));
      const total = items.reduce((sum, i) => sum + i.amount, 0);
      const revisedQuote = { currency: entry.quote.currency, items, total };
      const offerToken = await store.put({
        type: "offer",
        kind: "revise",
        originalQuote: entry.quote,
        revisedQuote,
        amount: total,
        message,
        customer,
        companyEmail: entry.companyEmail,
        companyName: entry.companyName,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      await store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendRevisedOfferToCustomer({
        quote: revisedQuote,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName,
        companyEmail: entry.companyEmail,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "followup") {
      const offerToken = await store.put({
        type: "offer",
        kind: "followup",
        originalQuote: entry.quote,
        amount: entry.quote.total,
        customer,
        companyEmail: entry.companyEmail,
        companyName: entry.companyName,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      await store.update(req.params.token, { status: "followup-sent" });
      const emailResult = await sendFollowupToCustomer({
        quote: entry.quote,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName,
        companyEmail: entry.companyEmail,
        signature: entry.signature,
        logoUrl: entry.logoUrl,
        tagline: entry.tagline,
        lang: entry.lang,
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    return res.status(400).json({ error: "Action inconnue pour ce motif" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.get("/api/offer/:token", async (req, res) => {
  try {
    const entry = await store.get(req.params.token);
    if (!entry || entry.type !== "offer") return res.status(404).json({ error: "Introuvable ou expiré" });
    res.json({
      kind: entry.kind,
      amount: entry.amount,
      date: entry.date,
      revisedQuote: entry.revisedQuote,
      originalQuote: entry.originalQuote,
      message: entry.message,
      customer: entry.customer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.post("/api/offer/:token/respond", async (req, res) => {
  try {
    const entry = await store.get(req.params.token);
    if (!entry || entry.type !== "offer") return res.status(404).json({ error: "Introuvable ou expiré" });

    const action = req.body.action;
    if (action === "decline") {
      await store.update(req.params.token, { status: "declined" });
      return res.json({ ok: true });
    }

    const customer = { ...entry.customer, ...(req.body.customer || {}) };
    const quote =
      entry.kind === "revise" && entry.revisedQuote
        ? entry.revisedQuote
        : {
            currency: entry.originalQuote.currency,
            items: [{ label: "Prestation", amount: entry.amount }],
            total: entry.amount,
          };

    const result = await sendBookingConfirmation({
      quote,
      customer,
      notifyEmail: entry.companyEmail || undefined,
      companyName: entry.companyName || undefined,
      signature: entry.signature || undefined,
      logoUrl: entry.logoUrl || undefined,
      tagline: entry.tagline || undefined,
      lang: entry.lang || undefined,
    });
    await store.update(req.params.token, { status: "accepted" });

    res.json({
      ok: true,
      calendarLink: result.calendarLink,
      emailPreview: result.customerEmail.preview || result.companyEmail.preview || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.post("/api/accept", async (req, res) => {
  try {
    const { quote, customer, companyEmail } = req.body;
    if (!quote || !quote.items) return res.status(400).json({ error: "quote is required" });

    const company = await getCompanyBySlug(req.body.company);
    const lang = ["en", "de"].includes(req.body.lang) ? req.body.lang : "fr";

    const result = await sendBookingConfirmation({
      quote,
      customer: customer || {},
      notifyEmail: companyEmail || company?.notifyEmail || undefined,
      companyName: company?.name || undefined,
      signature: company?.signature || undefined,
      logoUrl: company?.logoUrl || undefined,
      tagline: company?.tagline || undefined,
      lang,
    });
    res.json({
      ok: true,
      calendarLink: result.calendarLink,
      emailPreview: result.customerEmail.preview || result.companyEmail.preview || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Cleaning Quote demo running at http://localhost:${PORT}`);
  if (MOCK_MODE) {
    console.log("→ MOCK_MODE is on: no Anthropic API key or credit needed.");
  } else if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY is not set — requests to /api/chat will fail.");
    console.warn("  Set MOCK_MODE=true in .env to try the demo without an API key.");
  }
  if (!whatsapp.isConfigured()) {
    console.log("→ WhatsApp not configured: inbound messages will be logged to this console instead of replied to for real.");
    console.log("  Set WHATSAPP_ACCESS_TOKEN in .env and add each company's number to src/companies.js (see .env.example).");
  }
  if (!process.env.WHATSAPP_APP_SECRET) {
    console.warn("⚠ WHATSAPP_APP_SECRET is not set — the WhatsApp webhook will accept unsigned requests from anyone.");
  }
});
