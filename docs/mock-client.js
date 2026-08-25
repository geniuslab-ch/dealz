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

    const userMessages = history.filter((m) => m.role === "user" && typeof m.content === "string");
    const contactAnswer = (userMessages[userMessages.length - 1] || {}).content || "";
    const customer = extractContact(contactAnswer);

    const quote = window.DealzPricingEngine.calculateQuote(pricing, input);
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

  // ---- Email preview (static fallback only) ----
  // Mirrors src/notifications.js + src/objections.js closely enough to show
  // a representative preview when there is no backend to actually send from.
  const CATEGORY_META = {
    price: { label: "Prix trop élevé", emoji: "🔴", showTotal: true },
    timing: { label: "Date indisponible", emoji: "📅", showTotal: true },
    scope: { label: "Périmètre du service", emoji: "🧹", showTotal: true },
    conditions: { label: "Conditions / détails du nettoyage", emoji: "🏠", showTotal: true },
    competitor: { label: "A choisi un autre prestataire", emoji: "🆚", showTotal: true },
    information: { label: "A besoin d'informations", emoji: "❓", showTotal: false },
    thinking: { label: "A besoin de réfléchir", emoji: "🟡", showTotal: true },
    not_needed: { label: "N'a plus besoin du service", emoji: "⚪", showTotal: false },
    other: { label: "Autre raison", emoji: "⚠️", showTotal: true },
  };

  function fmtCHF(n) {
    return `CHF ${Number(n).toFixed(2)}`;
  }

  function quoteItemsHtml(quote) {
    return quote.items
      .map((i) => `<tr><td>${i.label}</td><td style="text-align:right">${fmtCHF(i.amount)}</td></tr>`)
      .join("");
  }

  function buildDeclineEmailPreview({ quote, category, rawText, customer }) {
    const cfg = CATEGORY_META[category] || CATEGORY_META.other;
    const parts = [`${cfg.emoji} Devis refusé`, cfg.label, customer.name || "un client"];
    if (cfg.showTotal && quote && quote.total) parts.push(fmtCHF(quote.total));
    const subject = parts.join(" — ");
    const html = `
      <h2>${cfg.emoji} Devis refusé — action possible</h2>
      <p><b>Client :</b> ${customer.name || "(non fourni)"}<br/>
         <b>E-mail :</b> ${customer.email || "(non fourni)"}<br/>
         <b>Téléphone :</b> ${customer.phone || "(non fourni)"}<br/>
         <b>Adresse :</b> ${customer.address || "(non fournie)"}</p>
      ${cfg.showTotal ? `<p><b>Devis original :</b> ${fmtCHF(quote.total)}</p><table>${quoteItemsHtml(quote)}</table>` : ""}
      <p><b>Motif du refus :</b> ${cfg.label}</p>
      ${rawText ? `<p><b>Message du client :</b><br/>« ${rawText} »</p>` : ""}
      <p><i>Bouton d'action (« ${cfg.emoji === "❓" ? "Répondre au client" : "agir"} ») inclus dans le vrai e-mail.</i></p>
    `;
    return { to: "reservations@swissclean.demo", subject, html };
  }

  function buildBookingConfirmationPreview({ quote, customer }) {
    const html = `
      <h2>✓ Réservation confirmée</h2>
      <p>Merci ${customer.name || ""} ! Votre nettoyage est confirmé pour <b>${fmtCHF(quote.total)}</b>.</p>
      <table>${quoteItemsHtml(quote)}</table>
      <p><i>Lien « Ajouter à mon Google Agenda » inclus dans le vrai e-mail.</i></p>
    `;
    return { to: customer.email || "(non fourni)", subject: "✓ Réservation confirmée", html };
  }

  window.DealzMock = { runTurnMock, buildDeclineEmailPreview, buildBookingConfirmationPreview };
})();
