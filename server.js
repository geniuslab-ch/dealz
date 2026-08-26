require("dotenv").config();
const express = require("express");
const path = require("path");
const { runTurn } = require("./src/claude");
const { runTurnMock } = require("./src/mock");
const { classifyObjection, CATEGORIES } = require("./src/objections");
const {
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendRescheduleToCustomer,
  sendRevisedOfferToCustomer,
  sendReplyToCustomer,
  sendFollowupToCustomer,
  sendBookingConfirmation,
  sendInstallRequestNotification,
} = require("./src/notifications");
const store = require("./src/store");
const { recordTrialAttempt } = require("./src/leads");

const MOCK_MODE = process.env.MOCK_MODE === "true";

const app = express();
// Vercel (and most PaaS hosts) sit behind a proxy — without this, req.protocol
// always reports "http" even on a real https deployment, and the links built
// into notification emails (counteroffer.html, offer.html) would use the
// wrong scheme.
app.set("trust proxy", 1);
app.use(express.json());
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

app.post("/api/chat", async (req, res) => {
  try {
    const history = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "messages[] is required" });
    }

    if (MOCK_MODE) {
      return res.json(await runTurnMock(history));
    }

    // A visitor on the live demo should never see a broken conversation just
    // because the Anthropic account behind it ran out of credit, hit a rate
    // limit, or had a transient outage — fall back to the same scripted
    // engine MOCK_MODE uses, silently, and log it so the developer notices
    // and can fix the underlying account issue.
    try {
      return res.json(await runTurn(history));
    } catch (apiErr) {
      console.warn(
        "[/api/chat] Real Claude call failed — falling back to the scripted demo engine. " +
          "Fix the underlying issue (e.g. add Anthropic credit) to restore the real assistant. " +
          `Error: ${apiErr.message}`
      );
      return res.json(await runTurnMock(history));
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

    let finalCategory = category;
    let summary = text || "";
    if (!finalCategory || !CATEGORIES[finalCategory]) {
      const classified = await classifyObjection(text || "");
      finalCategory = classified.category;
      summary = classified.summary;
    }

    const declineToken = store.put({
      type: "decline",
      quote,
      category: finalCategory,
      summary,
      rawText: text || "",
      customer: customer || {},
      status: "pending",
    });

    const emailResult = await sendDeclineNotification({
      quote,
      category: finalCategory,
      summary,
      rawText: text || "",
      customer: customer || {},
      declineToken,
      baseUrl: requestBaseUrl(req),
      notifyEmail: companyEmail || undefined,
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

app.get("/api/counteroffer/:token", (req, res) => {
  const entry = store.get(req.params.token);
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
  });
});

// One endpoint, branching by the objection's configured action — this is
// the owner's entire interface for every objection type, no dashboard.
app.post("/api/counteroffer/:token", async (req, res) => {
  try {
    const entry = store.get(req.params.token);
    if (!entry || entry.type !== "decline") return res.status(404).json({ error: "Introuvable ou expiré" });

    const cfg = CATEGORIES[entry.category] || CATEGORIES.other;
    const message = req.body.message || "";
    const customer = entry.customer;

    // The secondary CTA ("Maintenir le prix") on price/competitor objections
    // — the owner reviewed and chose not to negotiate. No customer email;
    // just closes the loop. Distinct from the primary action for that
    // category, so it's checked first regardless of cfg.action.
    if (req.body.action === "keep") {
      store.update(req.params.token, { status: "kept" });
      return res.json({ ok: true });
    }

    if (cfg.action === "reply") {
      if (!message.trim()) return res.status(400).json({ error: "Message requis" });
      const emailResult = await sendReplyToCustomer({ message, customer });
      store.update(req.params.token, { status: "replied" });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "close" || cfg.action === "review") {
      store.update(req.params.token, { status: "closed" });
      return res.json({ ok: true });
    }

    if (cfg.action === "counteroffer") {
      const amount = Number(req.body.amount);
      if (!amount || amount <= 0) return res.status(400).json({ error: "Montant invalide" });
      const offerToken = store.put({
        type: "offer",
        kind: "price",
        originalQuote: entry.quote,
        amount,
        message,
        customer,
      });
      store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendCounterofferToCustomer({
        quote: entry.quote,
        amount,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "reschedule") {
      const date = (req.body.date || "").trim();
      if (!date) return res.status(400).json({ error: "Date requise" });
      const offerToken = store.put({
        type: "offer",
        kind: "date",
        originalQuote: entry.quote,
        amount: entry.quote.total,
        date,
        message,
        customer,
      });
      store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendRescheduleToCustomer({
        date,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "revise") {
      const removeLabels = Array.isArray(req.body.removeItems) ? req.body.removeItems : [];
      const items = entry.quote.items.filter((i) => !removeLabels.includes(i.label));
      const total = items.reduce((sum, i) => sum + i.amount, 0);
      const revisedQuote = { currency: entry.quote.currency, items, total };
      const offerToken = store.put({
        type: "offer",
        kind: "revise",
        originalQuote: entry.quote,
        revisedQuote,
        amount: total,
        message,
        customer,
      });
      store.update(req.params.token, { status: "counter-sent" });
      const emailResult = await sendRevisedOfferToCustomer({
        quote: revisedQuote,
        message,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    if (cfg.action === "followup") {
      const offerToken = store.put({
        type: "offer",
        kind: "followup",
        originalQuote: entry.quote,
        amount: entry.quote.total,
        customer,
      });
      store.update(req.params.token, { status: "followup-sent" });
      const emailResult = await sendFollowupToCustomer({
        quote: entry.quote,
        customer,
        offerToken,
        baseUrl: requestBaseUrl(req),
      });
      return res.json({ ok: true, emailPreview: emailResult.preview || null });
    }

    return res.status(400).json({ error: "Action inconnue pour ce motif" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.get("/api/offer/:token", (req, res) => {
  const entry = store.get(req.params.token);
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
});

app.post("/api/offer/:token/respond", async (req, res) => {
  try {
    const entry = store.get(req.params.token);
    if (!entry || entry.type !== "offer") return res.status(404).json({ error: "Introuvable ou expiré" });

    const action = req.body.action;
    if (action === "decline") {
      store.update(req.params.token, { status: "declined" });
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

    const result = await sendBookingConfirmation({ quote, customer });
    store.update(req.params.token, { status: "accepted" });

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

    const result = await sendBookingConfirmation({
      quote,
      customer: customer || {},
      notifyEmail: companyEmail || undefined,
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
});
