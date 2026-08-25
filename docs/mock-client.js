/**
 * Client-side port of src/mock.js — same scripted conversation, kept in sync
 * by hand. Used only as a fallback when there is no backend to talk to (e.g.
 * this site hosted as static files on GitHub Pages, with no Express server
 * and no Anthropic API key behind it).
 */
(function () {
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
    if (/moquette|tapis|carpet/.test(text)) addons.push("carpet_shampoo");

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

  // The contact answer is whichever customer message actually contains an
  // e-mail address (the clearest signal it's the "here are my details"
  // message) — not just the most recent message, so a stray "merci" sent
  // afterwards doesn't wipe out contact info that was already given.
  function extractContactFromHistory(userMessages) {
    const emailRe = /[\w.+-]+@[\w-]+\.[\w.-]+/;
    const contactMsg = [...userMessages].reverse().find((m) => emailRe.test(m.content));
    return contactMsg ? extractContact(contactMsg.content) : { name: "", email: "", phone: "", address: "" };
  }

  function alreadyAsked(history, questionText) {
    return history.some(
      (m) => m.role === "assistant" && typeof m.content === "string" && m.content === questionText
    );
  }

  // The answer to an already-asked question is whichever customer message
  // comes right after it in the conversation.
  function answerFollowing(history, questionText) {
    const idx = history.findIndex(
      (m) => m.role === "assistant" && typeof m.content === "string" && m.content === questionText
    );
    if (idx === -1) return "";
    const next = history.slice(idx + 1).find((m) => m.role === "user" && typeof m.content === "string");
    return next ? next.content : "";
  }

  function ask(questionText, question, pricing) {
    return {
      messages: [{ role: "assistant", content: questionText }],
      quote: null,
      model: "mode-demo",
      currency: pricing.currency,
      question: question || null,
    };
  }

  const ROOM_TIERS = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];

  const Q_TYPE_SIZE =
    "Bien sûr ! Quel type de nettoyage souhaitez-vous, et pour quelle taille de logement ?";
  const Q_HOURS = "Combien de temps environ souhaitez-vous prévoir pour chaque nettoyage ?";
  const Q_CONDITION = "Dans quel état est le logement aujourd'hui ?";
  const Q_FLOORS = "Le logement est-il accessible sans ascenseur ?";
  const Q_ADDONS = "Souhaitez-vous ajouter des options ? Vous pouvez en choisir plusieurs.";
  const Q_WINDOWS_ACCESS = "Les vitres sont-elles difficiles d'accès (baies vitrées, hauteur, etc.) ?";
  const Q_CARPET_ROOMS = "Combien de pièces avec moquette ou tapis à shampouiner ?";
  const Q_CONTACT =
    "Parfait ! Pour finaliser votre devis, quel est votre nom, votre e-mail, votre téléphone, et l'adresse du logement à nettoyer ?";

  function parseHours(text) {
    const t = text.toLowerCase();
    if (/1\D+2/.test(t)) return 1.5;
    if (/2\D+3/.test(t)) return 2.5;
    if (/3\D+4/.test(t)) return 3.5;
    if (/4\D+5/.test(t)) return 4.5;
    if (/plus de 5|5\+/.test(t)) return 5;
    const m = t.match(/(\d+(?:[.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(",", ".")) : 4;
  }

  function parseCondition(text) {
    const t = text.toLowerCase();
    if (/tr[èe]s sale|encombr[ée]/.test(t)) return "very_dirty";
    if (/sale|poussi[èe]reux|plut[ôo]t/.test(t)) return "dirty";
    return "normal";
  }

  function parseFloors(text) {
    const t = text.toLowerCase();
    if (/rez|ascenseur/.test(t) && !/sans ascenseur/.test(t)) return 0;
    const m = t.match(/(\d+)/);
    return m ? Math.min(parseInt(m[1], 10), 3) : 0;
  }

  function parseWindowsAccess(text) {
    return /^oui\b/i.test(text.trim()) || /difficile/i.test(text);
  }

  function parseCarpetRooms(text) {
    const m = text.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  // Unlike a fixed question-by-turn-number script, every turn re-reads
  // everything the customer has said so far and only asks about what's
  // still missing — so giving several details up front (or all of them in
  // one message) skips straight ahead instead of being asked to repeat them.
  function runTurnMock(pricing, history) {
    const hints = extractHints(history);
    const userMessages = history.filter((m) => m.role === "user" && typeof m.content === "string");

    const sizeTypeKnown = hints.isRegular || !!hints.rooms;
    if (!sizeTypeKnown && !alreadyAsked(history, Q_TYPE_SIZE)) {
      return ask(
        Q_TYPE_SIZE,
        {
          type: "single",
          options: [
            ...ROOM_TIERS.map((r) => ({ label: `${r} pièce${r === "1" ? "" : "s"}`, value: r })),
            { label: "Nettoyage régulier", value: "regular" },
          ],
        },
        pricing
      );
    }

    if (hints.isRegular && !alreadyAsked(history, Q_HOURS)) {
      return ask(
        Q_HOURS,
        {
          type: "single",
          options: [
            { label: "1–2 heures", value: "1-2" },
            { label: "2–3 heures", value: "2-3" },
            { label: "3–4 heures", value: "3-4" },
            { label: "4–5 heures", value: "4-5" },
            { label: "Plus de 5 heures", value: "5+" },
          ],
        },
        pricing
      );
    }
    const hours = hints.isRegular ? parseHours(answerFollowing(history, Q_HOURS)) : undefined;

    if (!alreadyAsked(history, Q_CONDITION)) {
      return ask(
        Q_CONDITION,
        {
          type: "single",
          options: [
            { label: "État normal", value: "normal" },
            { label: "Plutôt sale", value: "dirty" },
            { label: "Très sale / encombré", value: "very_dirty" },
          ],
        },
        pricing
      );
    }
    const condition = parseCondition(answerFollowing(history, Q_CONDITION));

    if (!alreadyAsked(history, Q_FLOORS)) {
      return ask(
        Q_FLOORS,
        {
          type: "single",
          options: [
            { label: "Rez-de-chaussée ou ascenseur", value: "0" },
            { label: "1 étage sans ascenseur", value: "1" },
            { label: "2 étages sans ascenseur", value: "2" },
            { label: "3 étages ou plus sans ascenseur", value: "3" },
          ],
        },
        pricing
      );
    }
    const floorsNoElevator = parseFloors(answerFollowing(history, Q_FLOORS));

    if (!hints.addons.length && !alreadyAsked(history, Q_ADDONS)) {
      return ask(
        Q_ADDONS,
        {
          type: "multi",
          options: [
            { label: "Four", value: "oven" },
            { label: "Vitres", value: "windows" },
            { label: "Frigo", value: "fridge" },
            { label: "Moquette", value: "carpet_shampoo" },
            { label: "Aucune option", value: "none" },
          ],
        },
        pricing
      );
    }

    if (hints.addons.includes("windows") && !alreadyAsked(history, Q_WINDOWS_ACCESS)) {
      return ask(
        Q_WINDOWS_ACCESS,
        {
          type: "single",
          options: [
            { label: "Oui", value: "yes" },
            { label: "Non", value: "no" },
          ],
        },
        pricing
      );
    }
    const difficultAccessWindows = hints.addons.includes("windows")
      ? parseWindowsAccess(answerFollowing(history, Q_WINDOWS_ACCESS))
      : false;

    if (hints.addons.includes("carpet_shampoo") && !alreadyAsked(history, Q_CARPET_ROOMS)) {
      return ask(
        Q_CARPET_ROOMS,
        {
          type: "single",
          options: [
            { label: "1 pièce", value: "1" },
            { label: "2 pièces", value: "2" },
            { label: "3 pièces", value: "3" },
            { label: "4 pièces ou plus", value: "4" },
          ],
        },
        pricing
      );
    }
    const carpetRooms = hints.addons.includes("carpet_shampoo")
      ? parseCarpetRooms(answerFollowing(history, Q_CARPET_ROOMS))
      : undefined;

    const customer = extractContactFromHistory(userMessages);
    if (!customer.email && !alreadyAsked(history, Q_CONTACT)) {
      return ask(Q_CONTACT, null, pricing);
    }

    const input = {
      service_type: hints.isRegular ? "regular_cleaning" : "end_of_tenancy",
      rooms: hints.rooms || "3",
      hours,
      addons: hints.addons,
      carpet_rooms: carpetRooms,
      condition,
      difficult_access_windows: difficultAccessWindows,
      floors_no_elevator: floorsNoElevator,
    };

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
      question: null,
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
