require("dotenv").config();
const express = require("express");
const path = require("path");
const { runTurn } = require("./src/claude");
const { runTurnMock } = require("./src/mock");

const MOCK_MODE = process.env.MOCK_MODE === "true";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
