require("dotenv").config();
const express = require("express");
const path = require("path");
const { runTurn } = require("./src/claude");
const { runTurnMock } = require("./src/mock");
const { classifyObjection, CATEGORIES } = require("./src/objections");
const {
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendBookingConfirmation,
} = require("./src/notifications");
const store = require("./src/store");

const MOCK_MODE = process.env.MOCK_MODE === "true";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "docs")));

app.post("/api/chat", async (req, res) => {
  try {
    const history = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (history.length === 0) {
      return res.status(400).json({ error: "messages[] is required" });
    }
    const result = MOCK_MODE ? await runTurnMock(history) : await runTurn(history);
    res.json(result);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal error" });
  }
});

// ---- Decline -> objection -> counteroffer -> re-offer -> accept loop ----

app.post("/api/decline", async (req, res) => {
  try {
    const { quote, category, text, customer } = req.body;
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

    await sendDeclineNotification({
      quote,
      category: finalCategory,
      summary,
      rawText: text || "",
      customer: customer || {},
      declineToken,
    });

    res.json({ ok: true, category: finalCategory, categoryLabel: CATEGORIES[finalCategory] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.get("/api/counteroffer/:token", (req, res) => {
  const entry = store.get(req.params.token);
  if (!entry || entry.type !== "decline") return res.status(404).json({ error: "Introuvable ou expiré" });
  res.json({
    quote: entry.quote,
    category: entry.category,
    categoryLabel: CATEGORIES[entry.category] || entry.category,
    summary: entry.summary,
    rawText: entry.rawText,
    customer: entry.customer,
    status: entry.status,
  });
});

app.post("/api/counteroffer/:token", async (req, res) => {
  try {
    const entry = store.get(req.params.token);
    if (!entry || entry.type !== "decline") return res.status(404).json({ error: "Introuvable ou expiré" });

    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Montant invalide" });
    const message = req.body.message || "";

    const offerToken = store.put({
      type: "offer",
      originalQuote: entry.quote,
      amount,
      message,
      customer: entry.customer,
    });

    store.update(req.params.token, { status: "counter-sent" });

    await sendCounterofferToCustomer({
      quote: entry.quote,
      amount,
      message,
      customer: entry.customer,
      offerToken,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.get("/api/offer/:token", (req, res) => {
  const entry = store.get(req.params.token);
  if (!entry || entry.type !== "offer") return res.status(404).json({ error: "Introuvable ou expiré" });
  res.json({ amount: entry.amount, message: entry.message, customer: entry.customer, originalQuote: entry.originalQuote });
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
    const quote = {
      currency: entry.originalQuote.currency,
      items: [{ label: "Prestation (offre négociée)", amount: entry.amount }],
      total: entry.amount,
    };

    const result = await sendBookingConfirmation({ quote, customer });
    store.update(req.params.token, { status: "accepted" });

    res.json({ ok: true, calendarLink: result.calendarLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

app.post("/api/accept", async (req, res) => {
  try {
    const { quote, customer } = req.body;
    if (!quote || !quote.items) return res.status(400).json({ error: "quote is required" });

    const result = await sendBookingConfirmation({ quote, customer: customer || {} });
    res.json({ ok: true, calendarLink: result.calendarLink });
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
