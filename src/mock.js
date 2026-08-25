const { calculateQuote } = require("./pricingEngine");
const pricing = require("../docs/pricing.json");

/**
 * Offline stand-in for src/claude.js — same runTurn(history) shape, no API
 * key or credit required. Lets you click through the full quote → accept
 * flow without spending anything. Enable with MOCK_MODE=true in .env.
 */

function countUserTurns(history) {
  return history.filter((m) => m.role === "user" && typeof m.content === "string").length;
}

function extractHints(history) {
  // Only ever read what the customer typed — the bot's own canned questions
  // mention words like "régulier" and "frigo" as example options, and would
  // otherwise be misread as the customer's answer.
  const text = history
    .filter((m) => m.role === "user" && typeof m.content === "string")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  const addons = [];
  if (/\bfour\b|oven/.test(text)) addons.push("oven");
  if (/vitre|fen[êe]tre|window/.test(text)) addons.push("windows");
  if (/frigo|fridge/.test(text)) addons.push("fridge");

  const roomsMatch = text.match(/(\d(?:[.,]5)?)\s*(?:pi[èe]ces?|rooms?)/);
  const rooms = roomsMatch ? roomsMatch[1].replace(",", ".") : null;

  const isRegular = /r[ée]gulier|hebdomadaire|par semaine|\bregular\b/.test(text);

  return { addons, rooms, isRegular };
}

const QUESTIONS = [
  "Bien sûr ! Pouvez-vous me préciser la taille de votre logement (nombre de pièces, par ex. « 3.5 pièces ») et le type de nettoyage souhaité (nettoyage régulier ou fin de bail) ?",
  "Merci ! Souhaitez-vous ajouter des options comme le nettoyage du four, des vitres ou du frigo ?",
];

async function runTurnMock(history) {
  const turn = countUserTurns(history);

  if (turn < QUESTIONS.length + 1) {
    return {
      messages: [{ role: "assistant", content: QUESTIONS[turn - 1] }],
      quote: null,
      model: "mode-demo",
      currency: pricing.currency,
    };
  }

  const hints = extractHints(history);
  const input = {
    service_type: hints.isRegular ? "regular_cleaning" : "end_of_tenancy",
    rooms: hints.rooms || "3",
    hours: hints.isRegular ? 4 : undefined,
    addons: hints.addons.length ? hints.addons : ["oven", "windows"],
  };

  const quote = calculateQuote(input);
  const text =
    "Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous.";

  return {
    messages: [{ role: "assistant", content: text }],
    quote,
    model: "mode-demo",
    currency: pricing.currency,
  };
}

module.exports = { runTurnMock };
