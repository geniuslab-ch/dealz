require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const fs = require("fs");
const { runTurn } = require("./src/claude");
const { runTurnMock } = require("./src/mock");
const { classifyObjection, draftSuggestedReply, CATEGORIES, categoryConfig } = require("./src/objections");
const {
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendRescheduleToCustomer,
  sendRevisedOfferToCustomer,
  sendReplyToCustomer,
  sendFollowupToCustomer,
  sendBookingConfirmation,
  sendInstallRequestNotification,
  sectorLabel,
  sendReferralNotification,
  errorText,
} = require("./src/notifications");
const store = require("./src/store");
const { getSector, platformName } = require("./src/sectors");
const { recordTrialAttempt } = require("./src/leads");
const whatsapp = require("./src/whatsapp");
const whatsappDemo = require("./src/whatsappSector");
const { getCompanyBySlug } = require("./src/companies");
const { hasFeature } = require("./src/plans");
const scale = require("./src/scale");
const billing = require("./src/billing");
const crm = require("./src/crm");
const { rateLimit } = require("./src/rateLimit");
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

// Cache-busts every same-origin CSS/JS reference in served HTML with a
// version tag (the deployed commit on Vercel, or this process's boot time
// locally) — one new value per deploy. Without this, a browser or edge node
// can pair fresh HTML from a new deploy with a stylesheet/script it already
// cached from the previous one (most visible right after a deploy, or a
// burst of them): missing styles, a half-built menu, dead buttons. Giving
// every asset URL a new query string each deploy means there is nothing
// stale to reuse — not a caching *policy* change, just a cache-miss by
// construction. Runs ahead of express.static, which still serves every
// non-HTML request (and ignores the query string, so the underlying file on
// disk is unaffected); HTML requests it can't resolve fall through to it too.
const DOCS_DIR = path.join(__dirname, "docs");
const ASSET_VERSION = (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 10);
const ASSET_REF_RE = /((?:href|src)=")(\/[\w\-./]+\.(?:css|js))(")/g;
function versionAssets(html) {
  return html.replace(ASSET_REF_RE, (m, pre, assetPath, post) => `${pre}${assetPath}?v=${ASSET_VERSION}${post}`);
}
app.get("*", (req, res, next) => {
  if (req.method !== "GET" || req.path.includes("..")) return next();
  const rel = req.path.endsWith("/") ? req.path + "index.html" : req.path;
  if (!/\.html$/.test(rel)) return next();
  const filePath = path.join(DOCS_DIR, rel);
  if (!filePath.startsWith(DOCS_DIR)) return next();
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) return next();
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(versionAssets(html));
  });
});
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

// Absolute URL for an asset path, for e-mails (which can't resolve "/…").
function publicUrl(p) {
  if (!p) return undefined;
  return (process.env.APP_BASE_URL || "https://dealz.website").replace(/\/$/, "") + p;
}

// What really happened to one e-mail, for the demo to show: "sent",
// "failed" (with the SMTP error), "simulated" (no SMTP configured) or
// "skipped" (no address). Without this a failed send looked like a success.
function deliveryOf(result, to) {
  if (!result) return { state: "skipped", to: to || null };
  if (result.failed) return { state: "failed", to: to || null, error: result.error || null };
  if (result.skipped) return { state: "skipped", to: to || null };
  if (result.simulated) return { state: "simulated", to: to || null };
  return { state: "sent", to: result.to || to || null };
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
// The visitor's country, for docs/currency.js (prices in CHF / EUR / GBP /
// USD). Vercel sets x-vercel-ip-country on every request; locally there is
// none and the page falls back to the browser's language.
app.get("/api/geo", (req, res) => {
  res.set("Cache-Control", "private, no-store");
  res.json({ country: req.get("x-vercel-ip-country") || null });
});

app.get("/api/whatsapp-trial", (req, res) => {
  const number = process.env.WHATSAPP_TRIAL_NUMBER_E164;
  if (!number) return res.json({ enabled: false });
  // The pre-filled message names the trade and the page's language, so the
  // WhatsApp demo bot (src/whatsappSector.js) starts the right sector demo.
  const prefill = whatsappDemo.prefillText(req.query.sector, req.query.lang);
  res.json({ enabled: true, waLink: `https://wa.me/${number}?text=${encodeURIComponent(prefill)}` });
});

// Gate in front of the public demo widget (docs/demo.html + docs/lead-gate.js)
// — records who's trying it and caps free trials, so the demo doesn't run up
// real Anthropic API cost from unlimited anonymous use. See src/leads.js.
// Records a demo trial and tells the CRM — shared by the website lead gate
// and the WhatsApp demo bot (which asks for the tester's e-mail instead).
async function recordLead({ email, phone, companyName, sector }) {
  const result = await recordTrialAttempt({ email, phone: phone || "", companyName: companyName || "" });

  // If this e-mail matches an existing CRM prospect (e.g. an outbound FREN
  // target trying the real demo on their own), the CRM flips their
  // demo_tested flag. Awaited (see src/crm.js) but never fails the
  // lead-gate response — same posture as the install-request forward.
  await crm
    .post("demoTested", {
      email,
      // Sector demos also hand the CRM who tried it and which trade, so
      // the visitor shows up as a lead tagged with its sector.
      ...(sector ? { companyName: companyName || "", phone: phone || "", sector: sector.slug, sectorLabel: sector.label } : {}),
    })
    .catch((err) => console.error("[lead] CRM demo_tested forward failed:", err.message));
  return result;
}

app.post("/api/lead", rateLimit("lead", 30), async (req, res) => {
  try {
    const { email, phone, companyName } = req.body;
    const sector = getSector(req.body.sector);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "E-mail professionnel requis" });
    }
    res.json(await recordLead({ email, phone, companyName, sector }));
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
app.post("/api/install-request", rateLimit("install-request", 5), async (req, res) => {
  const {
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    websiteUrl,
    planChoice,
    billingChoice,
    whatsappAddon,
    teamSize,
    mainProblem,
    requestSources,
    sector,
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
    whatsappAddon: !!whatsappAddon,
    teamSize,
    mainProblem,
    requestSources,
    sector: sectorLabel(sector) ? sector : "",
    sectorLabel: sectorLabel(sector),
  };

  const [emailResult, crmResult] = await Promise.allSettled([
    sendInstallRequestNotification(payload),
    crm.post("inboundLeads", payload),
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
app.post("/api/referral", rateLimit("referral", 5), async (req, res) => {
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
    crm.post("referral", payload),
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
app.post("/api/referral-identify", rateLimit("referral-identify", 10), async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "E-mail requis" });
    if (!crm.isConfigured("referralIdentify")) {
      return res.status(503).json({ error: "Service indisponible pour le moment." });
    }
    res.json(await crm.post("referralIdentify", { email }));
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
  // On Vercel nothing may run after the response is sent, so the message is
  // handled first (a few seconds at most) and acknowledged after. Meta
  // retries unacknowledged deliveries, so each message id is handled once.
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message) return res.sendStatus(200); // delivery/read receipts and other non-message events

    const seenKey = "wa-msg:" + message.id;
    if (message.id && (await store.getKey(seenKey))) return res.sendStatus(200);
    if (message.id) await store.setKey(seenKey, { at: Date.now() });

    // Which of (potentially many) companies' own WhatsApp numbers this
    // message came in on — replies get sent from this same number.
    const phoneNumberId = value?.metadata?.phone_number_id;
    const from = message.from;
    const name = value?.contacts?.[0]?.profile?.name || "";
    const reply = (body) => whatsapp.sendWhatsAppText(from, body, phoneNumberId);
    // Dealz's own trial number runs the sector demos; a real company's
    // number (src/companies.js) keeps its own quote assistant.
    const isDemoNumber = !!phoneNumberId && phoneNumberId === process.env.WHATSAPP_PHONE_NUMBER_ID;

    let text = "";
    if (message.type === "text") {
      text = message.text?.body || "";
    } else if (message.type === "interactive") {
      text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
    } else if (message.type === "button") {
      text = message.button?.text || "";
    } else {
      await reply(isDemoNumber ? whatsappDemo.textOnlyReply() : "Merci de nous écrire votre demande sous forme de texte — je ne peux pas encore traiter les photos, notes vocales ou fichiers.");
      return res.sendStatus(200);
    }

    // One message per sender at a time: both handlers load the conversation,
    // run a turn and save it, so two overlapping messages would overwrite
    // each other's state (see store.withLock).
    await store.withLock(`wa-lock:${phoneNumberId}:${from}`, () =>
      isDemoNumber
        ? whatsappDemo.handleIncoming({ phoneNumberId, from, text, name }, reply)
        : whatsapp.handleIncomingMessage(phoneNumberId, from, text)
    );
  } catch (err) {
    console.error("[whatsapp webhook]", err);
  }
  res.sendStatus(200);
});

// Company-aware pricing lookup — docs/quote-app.js's loadPricing() calls
// this instead of the static /pricing.json whenever a data-dealz-company
// slug is present (see docs/embed.js), so the client-side quote math
// (docs/pricing-engine-client.js, used for the offline/no-backend static
// fallback) also uses the right tenant's numbers. No slug, or an
// unrecognized one, falls back to the single-tenant demo grid.
// A client company with the price grid its widget asked for: SCALE
// companies can give each team/location its own grid (data-dealz-grid).
async function companyWithGrid(slug, grid) {
  const company = await getCompanyBySlug(slug);
  if (!company || !grid) return company;
  return { ...company, pricing: await scale.pricingFor(company, String(grid)) };
}

app.get("/api/pricing", async (req, res) => {
  try {
    const company = await companyWithGrid(req.query.company, req.query.grid);
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
    const company = (await companyWithGrid(req.body.company, req.body.grid)) || undefined;
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

// ---- Sector demos: real e-mails + CRM trail ----
function htmlToText(html) {
  const links = [...String(html || "").matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((u) => /^https?:/.test(u));
  const text = String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|h2|tr|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return links.length ? text + "\n\nLien(s) : " + links.join(" · ") : text;
}

// Tells the CRM a sector-demo e-mail went out, so the prospect's thread
// shows what was sent and when. Never throws: a CRM hiccup must not break
// the demo.
async function logDemoActivity({ email, sector, event, result }) {
  if (!email || !sector) return;
  const sent = (result && (result.preview || result)) || {};
  await crm
    .post("demoActivity", {
      email,
      sector: sector.slug,
      sectorLabel: sector.label,
      companyName: sector.company.name,
      event,
      subject: sent.subject || "",
      text: htmlToText(sent.html),
      sentAt: new Date().toISOString(),
      simulated: !!(result && result.simulated),
    })
    .catch((err) => console.error("[demo-activity] CRM forward failed:", err.message));
}

// The whole decline step — classify, draft a reply, store the token, e-mail
// the company — shared by the website widget (POST /api/decline) and the
// WhatsApp demo bot (src/whatsappSector.js), so both send the same e-mails.
async function processDecline(body, baseUrl) {
    const { quote, category, text, customer, companyEmail } = body;
    const req = { body };

    // `company` (a data-dealz-company slug) is the real-tenant path; the
    // demo's session-captured companyEmail (see docs/lead-gate.js) still
    // wins if both are somehow present, since that's an explicit visitor
    // override on the single-tenant demo, not something a real embed sends.
    const company = await getCompanyBySlug(req.body.company);
    // Sector demos (docs/secteurs/<slug>/demo.html): the visitor plays the
    // fictional company of that trade — its name and the trade's own
    // vocabulary are used all through the decline → counteroffer chain.
    const sector = getSector(req.body.sector, req.body.lang);
    const resolvedNotifyEmail = companyEmail || company?.notifyEmail || undefined;
    const resolvedCompanyName = sector ? sector.company.name : company?.name;
    const serviceNoun = sector ? sector.emailNoun : undefined;
    const resolvedSignature = company?.signature;
    // Sector demos sign with the fictional company's own logo.
    const resolvedLogoUrl = sector ? publicUrl(sector.company.logo) : company?.logoUrl;
    const resolvedTagline = company?.tagline;
    // The language the customer was actually talking to the widget in
    // (window.DEALZ_LANG on the page) — every customer-facing email in this
    // decline → counteroffer → accept chain re-reads this off the stored
    // token, so it stays consistent through the whole flow.
    const lang = ["en", "de"].includes(req.body.lang) ? req.body.lang : "fr";

    // CAPTURE plan: a plain "quote declined" e-mail, without the recovery
    // flow (reason analysis, suggested reply, counter-offer) that CLOSE adds.
    if (company && !hasFeature(company, "recovery")) {
      let basicResult;
      try {
        basicResult = await sendDeclineNotification({ quote, customer: customer || {}, notifyEmail: resolvedNotifyEmail, lang, basic: true });
      } catch (err) {
        console.error("[decline] company notification failed:", err);
        basicResult = { simulated: true, failed: true, error: errorText(err) };
      }
      return {
        ok: true,
        category: null,
        emailPreview: basicResult.preview || null,
        sentTo: basicResult.simulated ? null : resolvedNotifyEmail || null,
        delivery: { company: deliveryOf(basicResult, resolvedNotifyEmail) },
      };
    }

    let finalCategory = category;
    let summary = text || "";
    if (!finalCategory || !CATEGORIES[finalCategory]) {
      const classified = await classifyObjection(text || "", { sectorLabel: sector?.label });
      finalCategory = classified.category;
      summary = classified.summary;
    }

    const suggestedReply = await draftSuggestedReply({
      category: finalCategory,
      summary,
      rawText: text || "",
      quote,
      customer: customer || {},
      context: { sectorLabel: sector?.label },
      lang,
    });

    const declineToken = await store.put({
      type: "decline",
      quote,
      category: finalCategory,
      summary,
      rawText: text || "",
      customer: customer || {},
      suggestedReply,
      // Lets the offer the company sends back become a booking of theirs.
      companyId: company?.id || null,
      companyEmail: resolvedNotifyEmail || null,
      companyName: resolvedCompanyName || null,
      signature: resolvedSignature || null,
      logoUrl: resolvedLogoUrl || null,
      tagline: resolvedTagline || null,
      lang,
      serviceNoun: serviceNoun || null,
      status: "pending",
    });

    // A failed send must not turn into a 500: the decline itself is stored,
    // and the demo shows the SMTP error next to the "thanks" message.
    let emailResult;
    try {
      emailResult = await sendDeclineNotification({
        quote,
        category: finalCategory,
        summary,
        rawText: text || "",
        customer: customer || {},
        declineToken,
        suggestedReply,
        baseUrl,
        notifyEmail: resolvedNotifyEmail,
        sectorLabel: sector?.label,
        companyName: sector ? resolvedCompanyName : undefined,
        platformName: sector ? platformName(req.body.platform) : undefined,
        lang,
      });
    } catch (err) {
      console.error("[decline] company notification failed:", err);
      emailResult = { simulated: true, failed: true, error: errorText(err) };
    }

    if (sector && companyEmail) await logDemoActivity({ email: companyEmail, sector, event: "decline", result: emailResult });

    return {
      ok: true,
      category: finalCategory,
      categoryLabel: categoryConfig(finalCategory, lang).label,
      emailPreview: emailResult.preview || null,
      sentTo: emailResult.simulated ? null : resolvedNotifyEmail || null,
      delivery: { company: deliveryOf(emailResult, resolvedNotifyEmail) },
    };
}

app.post("/api/decline", async (req, res) => {
  try {
    if (!req.body.quote || !req.body.quote.items) return res.status(400).json({ error: "quote is required" });
    res.json(await processDecline(req.body, requestBaseUrl(req)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.get("/api/counteroffer/:token", async (req, res) => {
  try {
    const entry = await store.get(req.params.token);
    if (!entry || entry.type !== "decline") return res.status(404).json({ error: "Introuvable ou expiré" });
    // Same language as the decline e-mail that linked here (entry.lang).
    const cfg = categoryConfig(entry.category, entry.lang);
    res.json({
      lang: entry.lang || "fr",
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
      const emailResult = await sendReplyToCustomer({ message, customer, companyName: entry.companyName || undefined, companyEmail: entry.companyEmail || undefined, signature: entry.signature || undefined, logoUrl: entry.logoUrl || undefined, tagline: entry.tagline || undefined, lang: entry.lang });
      await store.update(req.params.token, { status: "replied" });
      await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "reply", companyName: entry.companyName || undefined, message }, whatsapp.sendWhatsAppText);
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "reply") {
      if (!message.trim()) return res.status(400).json({ error: "Message requis" });
      const emailResult = await sendReplyToCustomer({ message, customer, companyName: entry.companyName || undefined, companyEmail: entry.companyEmail || undefined, signature: entry.signature || undefined, logoUrl: entry.logoUrl || undefined, tagline: entry.tagline || undefined, lang: entry.lang });
      await store.update(req.params.token, { status: "replied" });
      await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "reply", companyName: entry.companyName || undefined, message }, whatsapp.sendWhatsAppText);
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
        companyId: entry.companyId || undefined,
        kind: "price",
        originalQuote: entry.quote,
        amount,
        message,
        customer,
        companyEmail: entry.companyEmail || undefined,
        companyName: entry.companyName || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendCounterofferToCustomer({
        quote: entry.quote,
        amount,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName || undefined,
        companyEmail: entry.companyEmail || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "price", companyName: entry.companyName || undefined, amount, message, url: `${requestBaseUrl(req)}/offer.html?token=${offerToken}` }, whatsapp.sendWhatsAppText);
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "reschedule") {
      const date = (req.body.date || "").trim();
      if (!date) return res.status(400).json({ error: "Date requise" });
      const offerToken = await store.put({
        type: "offer",
        companyId: entry.companyId || undefined,
        kind: "date",
        originalQuote: entry.quote,
        amount: entry.quote.total,
        date,
        message,
        customer,
        companyEmail: entry.companyEmail || undefined,
        companyName: entry.companyName || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendRescheduleToCustomer({
        date,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName || undefined,
        companyEmail: entry.companyEmail || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "date", companyName: entry.companyName || undefined, date, message, url: `${requestBaseUrl(req)}/offer.html?token=${offerToken}` }, whatsapp.sendWhatsAppText);
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "revise") {
      const removeLabels = Array.isArray(req.body.removeItems) ? req.body.removeItems : [];
      const items = entry.quote.items.filter((i) => !removeLabels.includes(i.label));
      const total = items.reduce((sum, i) => sum + i.amount, 0);
      const revisedQuote = { currency: entry.quote.currency, items, total };
      const offerToken = await store.put({
        type: "offer",
        companyId: entry.companyId || undefined,
        kind: "revise",
        originalQuote: entry.quote,
        revisedQuote,
        amount: total,
        message,
        customer,
        companyEmail: entry.companyEmail || undefined,
        companyName: entry.companyName || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendRevisedOfferToCustomer({
        quote: revisedQuote,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName || undefined,
        companyEmail: entry.companyEmail || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "revise", companyName: entry.companyName || undefined, amount: total, message, url: `${requestBaseUrl(req)}/offer.html?token=${offerToken}` }, whatsapp.sendWhatsAppText);
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "followup") {
      const offerToken = await store.put({
        type: "offer",
        companyId: entry.companyId || undefined,
        kind: "followup",
        originalQuote: entry.quote,
        amount: entry.quote.total,
        customer,
        companyEmail: entry.companyEmail || undefined,
        companyName: entry.companyName || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await store.update(req.params.token, { status: "followup-sent" });
      const emailResult = await sendFollowupToCustomer({
        quote: entry.quote,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
        companyName: entry.companyName || undefined,
        companyEmail: entry.companyEmail || undefined,
        signature: entry.signature || undefined,
        logoUrl: entry.logoUrl || undefined,
        tagline: entry.tagline || undefined,
        lang: entry.lang,
        serviceNoun: entry.serviceNoun || undefined,
      });
      await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "followup", companyName: entry.companyName || undefined, url: `${requestBaseUrl(req)}/offer.html?token=${offerToken}` }, whatsapp.sendWhatsAppText);
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
      // Sector demos and real tenants make offers under their own name.
      companyName: entry.companyName || null,
      logoUrl: entry.logoUrl || null,
      lang: entry.lang || "fr",
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
            items: [{ label: { en: "Service", de: "Leistung" }[entry.lang] || "Prestation", amount: entry.amount }],
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
      serviceNoun: entry.serviceNoun || undefined,
    });
    await store.update(req.params.token, { status: "accepted" });
    if (entry.companyId) {
      const company = await getCompanyBySlug(entry.companyId);
      const date = scale.bookingDate(entry.originalQuote);
      if (company) await scale.createBooking({ company, quote: { ...quote, date }, customer, source: "offer", lang: entry.lang });
    }
    await whatsappDemo.notifyCustomer({ customer, lang: entry.lang, kind: "booked", companyName: entry.companyName }, whatsapp.sendWhatsAppText);

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

// Booking confirmation e-mails (customer + company) — shared by the website
// widget (POST /api/accept) and the WhatsApp demo bot.
async function processAccept(body) {
    const { quote, customer, companyEmail } = body;
    const req = { body };

    const company = await getCompanyBySlug(req.body.company);
    const sector = getSector(req.body.sector, req.body.lang);
    const lang = ["en", "de"].includes(req.body.lang) ? req.body.lang : "fr";

    const result = await sendBookingConfirmation({
      quote,
      customer: customer || {},
      date: scale.bookingDate(quote),
      notifyEmail: companyEmail || company?.notifyEmail || undefined,
      companyName: sector ? sector.company.name : company?.name || undefined,
      serviceNoun: sector ? sector.emailNoun : undefined,
      signature: company?.signature || undefined,
      logoUrl: (sector ? publicUrl(sector.company.logo) : company?.logoUrl) || undefined,
      tagline: company?.tagline || undefined,
      lang,
    });

    if (sector && companyEmail) await logDemoActivity({ email: companyEmail, sector, event: "accept", result: result.companyEmail });
    // Real client companies: record the booking (and route it on SCALE).
    if (company) await scale.createBooking({ company, quote, customer: customer || {}, source: "web", lang, gridSlug: body.grid });

    return {
      ok: true,
      calendarLink: result.calendarLink,
      emailPreview: result.customerEmail.preview || result.companyEmail.preview || null,
      sentTo: result.companyEmail.simulated ? null : companyEmail || company?.notifyEmail || null,
      delivery: {
        company: deliveryOf(result.companyEmail, companyEmail || company?.notifyEmail),
        customer: deliveryOf(result.customerEmail, (customer || {}).email),
      },
    };
}

app.post("/api/accept", async (req, res) => {
  try {
    if (!req.body.quote || !req.body.quote.items) return res.status(400).json({ error: "quote is required" });
    res.json(await processAccept(req.body));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// ---- Stripe: paying for Dealz itself (src/billing.js) ----

// A Checkout Session for the plan chosen in the "Request my Dealz setup"
// chat. The currency follows the visitor's country, like the prices shown.
app.post("/api/stripe/checkout", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contactEmail)) return res.status(400).json({ error: "E-mail requis" });
    const currency = billing.currencyForCountry(req.get("x-vercel-ip-country")) || String(b.currency || "").toLowerCase();
    const session = await billing.createCheckout({
      plan: b.plan,
      billing: b.billing,
      whatsapp: !!b.whatsapp,
      currency,
      lang: b.lang,
      baseUrl: process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`,
      lead: { companyName: b.companyName, contactName: b.contactName, contactEmail: b.contactEmail, contactPhone: b.contactPhone, websiteUrl: b.websiteUrl },
    });
    res.json(session);
  } catch (err) {
    console.error("[stripe checkout]", err);
    res.status(err.status || 500).json({ error: err.status ? err.message : "Paiement indisponible pour le moment." });
  }
});

// Stripe's events, verified with STRIPE_WEBHOOK_SECRET on the raw body.
app.post("/api/stripe/webhook", async (req, res) => {
  try {
    res.json(await billing.handleWebhook(req.rawBody, req.get("stripe-signature")));
  } catch (err) {
    console.error("[stripe webhook]", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Shared agenda (SCALE): an iCalendar feed per company or staff member,
// behind the secret token shown in the CRM. Subscribed to from Google
// Calendar / Outlook / Apple Calendar.
app.get("/api/calendar/:token.ics", async (req, res) => {
  try {
    const ics = await scale.calendarFeed(req.params.token);
    if (!ics) return res.status(404).send("Not found");
    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.set("Cache-Control", "private, max-age=300");
    res.send(ics);
  } catch (err) {
    console.error("[calendar feed]", err);
    res.status(500).send("Error");
  }
});

// Automatic follow-up of a decline the company left unanswered — the same
// e-mail as the "Follow up" button on the counter-offer page.
async function autoFollowup(entry, token) {
  const offerToken = await store.put({
    type: "offer",
    kind: "followup",
    companyId: entry.companyId || undefined,
    originalQuote: entry.quote,
    amount: entry.quote.total,
    customer: entry.customer,
    companyEmail: entry.companyEmail || undefined,
    companyName: entry.companyName || undefined,
    signature: entry.signature || undefined,
    logoUrl: entry.logoUrl || undefined,
    tagline: entry.tagline || undefined,
    lang: entry.lang,
    serviceNoun: entry.serviceNoun || undefined,
  });
  await store.update(token, { status: "followup-auto" });
  await sendFollowupToCustomer({
    quote: entry.quote,
    customer: entry.customer,
    offerToken,
    baseUrl: process.env.APP_BASE_URL || "https://dealz.website",
    companyName: entry.companyName || undefined,
    companyEmail: entry.companyEmail || undefined,
    signature: entry.signature || undefined,
    logoUrl: entry.logoUrl || undefined,
    tagline: entry.tagline || undefined,
    lang: entry.lang,
    serviceNoun: entry.serviceNoun || undefined,
  });
}

// Daily SCALE automations (reminders, automatic follow-ups), called by
// Vercel Cron (vercel.json). Vercel sends "Authorization: Bearer
// $CRON_SECRET" when that variable is set; without it the route is closed.
app.get("/api/cron/daily", async (req, res) => {
  if (!process.env.CRON_SECRET || req.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return res.sendStatus(401);
  try {
    const out = await scale.runDailyAutomations({ followup: autoFollowup });
    out.rateLimitKeysPurged = await store.purgeRateLimitKeys();
    res.json(out);
  } catch (err) {
    console.error("[cron daily]", err);
    res.status(500).json({ error: err.message });
  }
});

whatsappDemo.configure({
  processDecline,
  processAccept,
  recordLead,
  baseUrl: () => process.env.APP_BASE_URL || "https://dealz.website",
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
    console.warn("⚠ WHATSAPP_APP_SECRET is not set — the WhatsApp webhook accepts unsigned requests locally (and refuses all of them in production).");
  }
});
