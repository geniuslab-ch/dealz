/**
 * Client-side port of src/mock.js — same scripted conversation, kept in sync
 * by hand. Used only as a fallback when there is no backend to talk to (e.g.
 * this site hosted as static files on GitHub Pages, with no Express server
 * and no Anthropic API key behind it).
 */
(function () {
  function countUserTurns(history) {
    return history.filter((m) => m.role === "user" && typeof m.content === "string").length;
  }

  function extractHints(history) {
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

  function runTurnMock(pricing, history) {
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

    const quote = window.DealzPricingEngine.calculateQuote(pricing, input);
    const text =
      "Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous.";

    return {
      messages: [{ role: "assistant", content: text }],
      quote,
      model: "mode-demo",
      currency: pricing.currency,
    };
  }

  window.DealzMock = { runTurnMock };
})();
