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

// Best-effort parse of the customer's free-text answer to the contact
// question — good enough for the scripted demo, not a real NLU system.
function extractContact(text) {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(\+?\d[\d\s.-]{7,}\d)/);
  let rest = text;
  if (emailMatch) rest = rest.replace(emailMatch[0], " ");
  if (phoneMatch) rest = rest.replace(phoneMatch[0], " ");
  rest = rest.replace(/[,;]/g, " ").replace(/\s+/g, " ").trim();

  const words = rest.split(" ").filter(Boolean);
  const name = words.slice(0, 2).join(" ") || "";
  const address = words.slice(2).join(" ") || rest;

  return {
    name,
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    address,
  };
}

const QUESTIONS = [
  "Bien sûr ! Pouvez-vous me préciser la taille de votre logement (nombre de pièces, par ex. « 3.5 pièces ») et le type de nettoyage souhaité (nettoyage régulier ou fin de bail) ?",
  "Merci ! Souhaitez-vous ajouter des options comme le nettoyage du four, des vitres ou du frigo ?",
  "Parfait ! Pour finaliser votre devis, quel est votre nom, votre e-mail, votre téléphone, et l'adresse du logement à nettoyer ?",
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

  // The contact question was the last assistant turn — its answer is the
  // most recent user message.
  const userMessages = history.filter((m) => m.role === "user" && typeof m.content === "string");
  const contactAnswer = userMessages[userMessages.length - 1]?.content || "";
  const customer = extractContact(contactAnswer);

  const quote = calculateQuote(input);
  quote.customer = customer;

  const text = customer.name
    ? `Merci ${customer.name} ! Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous.`
    : "Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous.";

  return {
    messages: [{ role: "assistant", content: text }],
    quote,
    model: "mode-demo",
    currency: pricing.currency,
  };
}

module.exports = { runTurnMock };
