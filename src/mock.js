const { calculateQuote } = require("./pricingEngine");
const pricing = require("../docs/pricing.json");

/**
 * Offline stand-in for src/claude.js — same runTurn(history) shape, no API
 * key or credit required. Lets you click through the full quote → accept
 * flow without spending anything. Enable with MOCK_MODE=true in .env.
 *
 * Unlike a fixed question-by-turn-number script, every turn re-reads
 * everything the customer has said so far and only asks about what's still
 * missing — so giving several details up front (or all of them in one
 * message) skips straight ahead instead of being asked to repeat them.
 */

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

// The contact answer is whichever customer message actually contains an
// e-mail address (the clearest signal it's the "here are my details"
// message) — not just the most recent message, so a stray "merci" sent
// afterwards doesn't wipe out contact info that was already given.
function extractContactFromHistory(userMessages) {
  const emailRe = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  const contactMsg = [...userMessages].reverse().find((m) => emailRe.test(m.content));
  return contactMsg ? extractContact(contactMsg.content) : { name: "", email: "", phone: "", address: "" };
}

const Q_SIZE_TYPE =
  "Bien sûr ! Pouvez-vous me préciser la taille de votre logement (nombre de pièces, par ex. « 3.5 pièces ») et le type de nettoyage souhaité (nettoyage régulier ou fin de bail) ?";
const Q_ADDONS =
  "Merci ! Souhaitez-vous ajouter des options comme le nettoyage du four, des vitres ou du frigo ?";
const Q_CONTACT =
  "Parfait ! Pour finaliser votre devis, quel est votre nom, votre e-mail, votre téléphone, et l'adresse du logement à nettoyer ?";

function alreadyAsked(history, question) {
  return history.some(
    (m) => m.role === "assistant" && typeof m.content === "string" && m.content === question
  );
}

function ask(question) {
  return {
    messages: [{ role: "assistant", content: question }],
    quote: null,
    model: "mode-demo",
    currency: pricing.currency,
  };
}

async function runTurnMock(history) {
  const hints = extractHints(history);
  const userMessages = history.filter((m) => m.role === "user" && typeof m.content === "string");

  const sizeTypeKnown = hints.isRegular || !!hints.rooms;
  if (!sizeTypeKnown && !alreadyAsked(history, Q_SIZE_TYPE)) {
    return ask(Q_SIZE_TYPE);
  }

  if (!hints.addons.length && !alreadyAsked(history, Q_ADDONS)) {
    return ask(Q_ADDONS);
  }

  const customer = extractContactFromHistory(userMessages);
  if (!customer.email && !alreadyAsked(history, Q_CONTACT)) {
    return ask(Q_CONTACT);
  }

  const input = {
    service_type: hints.isRegular ? "regular_cleaning" : "end_of_tenancy",
    rooms: hints.rooms || "3",
    hours: hints.isRegular ? 4 : undefined,
    addons: hints.addons.length ? hints.addons : ["oven", "windows"],
  };

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
