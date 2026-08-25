/**
 * Client-side port of src/mock.js — same 25-category clickable-MCQ question
 * bank, kept in sync by hand. Used only as a fallback when there is no
 * backend to talk to (e.g. this site hosted as static files on GitHub
 * Pages, with no Express server and no Anthropic API key behind it).
 */
(function () {
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

  const lbl = (text) => (text || "").trim();
  const yes = (text) => /^oui\b/i.test((text || "").trim());

  function parseCount(text, fallback) {
    const m = (text || "").match(/(\d+)/);
    return m ? parseInt(m[1], 10) : fallback;
  }

  const KITCHEN_APPLIANCE_KEYS = {
    Hotte: "hood",
    "Plaques de cuisson": "stovetop",
    "Micro-ondes": "microwave",
    "Lave-vaisselle": "dishwasher",
    Congélateur: "freezer",
  };
  const TEXTILE_KEYS = {
    Canapé: "sofa",
    Fauteuil: "armchair",
    Matelas: "mattress",
    Rideaux: "curtains",
  };

  function parseMultiKeys(text, table) {
    return (text || "")
      .split(",")
      .map((s) => s.trim())
      .map((s) => table[s])
      .filter(Boolean);
  }

  const ROOM_TIERS = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
  const HOURS_OPTIONS = [
    { label: "1–2 heures", value: "1-2" },
    { label: "2–3 heures", value: "2-3" },
    { label: "3–4 heures", value: "3-4" },
    { label: "4–5 heures", value: "4-5" },
    { label: "Plus de 5 heures", value: "5+" },
  ];
  function parseHours(text) {
    const t = (text || "").toLowerCase();
    if (/1\D+2/.test(t)) return 1.5;
    if (/2\D+3/.test(t)) return 2.5;
    if (/3\D+4/.test(t)) return 3.5;
    if (/4\D+5/.test(t)) return 4.5;
    if (/plus de 5|5\+/.test(t)) return 5;
    const m = t.match(/(\d+(?:[.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(",", ".")) : 4;
  }

  // The earliest bookable date, as an ISO "YYYY-MM-DD" string — how far in
  // advance a booking must be made is a per-company setting
  // (pricing.min_lead_time_hours), set once during onboarding: some
  // companies can send someone the same day, others need 24-72h notice.
  function computeMinDate(pricingConfig) {
    const leadHours = Number(pricingConfig.min_lead_time_hours) || 0;
    const min = new Date(Date.now() + leadHours * 60 * 60 * 1000);
    return min.toISOString().slice(0, 10);
  }

  // Defensive clamp in case a client bypasses the date picker's own `min`
  // attribute — never accept a date before what the company's lead time
  // allows.
  function clampDate(text, minDate) {
    const value = (text || "").trim();
    return value && value >= minDate ? value : minDate;
  }

  const Q_TYPE_NETTOYAGE = "Quel type de nettoyage souhaitez-vous ?";
  const TYPE_NETTOYAGE_MAP = {
    "Nettoyage régulier": "regular",
    "Nettoyage ponctuel": "ponctuel",
    "Nettoyage en profondeur": "profondeur",
    "Nettoyage de fin de bail / état des lieux": "fin_de_bail",
    "Nettoyage après déménagement": "demenagement",
    "Nettoyage après travaux": "apres_travaux",
    "Nettoyage professionnel / bureau": "bureau",
  };

  const STEPS = [
    {
      id: "type_nettoyage",
      question: Q_TYPE_NETTOYAGE,
      type: "single",
      options: () => Object.keys(TYPE_NETTOYAGE_MAP).map((l) => ({ label: l, value: TYPE_NETTOYAGE_MAP[l] })),
      parse: (text) => TYPE_NETTOYAGE_MAP[lbl(text)] || "ponctuel",
      applies: () => true,
    },
    {
      id: "type_bien",
      question: "Quel type de bien souhaitez-vous faire nettoyer ?",
      type: "single",
      options: () =>
        ["Appartement", "Maison", "Studio", "Bureau", "Commerce / local professionnel", "Villa"].map((l) => ({
          label: l,
          value: l,
        })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "rooms",
      question: "Combien de pièces compte votre logement ?",
      type: "single",
      options: () => ROOM_TIERS.map((r) => ({ label: `${r} pièce${r === "1" ? "" : "s"}`, value: r })),
      parse: (text) => {
        const m = (text || "").match(/(\d(?:[.,]5)?)/);
        return m ? m[1].replace(",", ".") : "3";
      },
      applies: () => true,
    },
    {
      id: "surface",
      question: "Quelle est approximativement la surface du logement ?",
      type: "single",
      options: () =>
        ["Moins de 50 m²", "50–75 m²", "75–100 m²", "100–150 m²", "150–200 m²", "Plus de 200 m²", "Je ne sais pas"].map(
          (l) => ({ label: l, value: l })
        ),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "etages_niveaux",
      question: "Le logement comporte-t-il plusieurs niveaux ?",
      type: "single",
      options: () =>
        ["Un seul niveau", "2 niveaux", "3 niveaux ou plus", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "etages_nombre",
      question: "Combien d'étages faut-il nettoyer ?",
      type: "single",
      options: () => ["2", "3", "4", "5+"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.etages_niveaux === "2 niveaux" || a.etages_niveaux === "3 niveaux ou plus",
    },
    {
      id: "salles_bain",
      question: "Combien de salles de bains et de WC faut-il nettoyer ?",
      type: "single",
      options: () => ["1", "2", "3", "4", "5+"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "cuisine",
      question: "Y a-t-il une cuisine à nettoyer ?",
      type: "single",
      options: () =>
        ["Oui", "Non", "Cuisine ouverte", "Cuisine fermée", "Plusieurs cuisines"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "condition",
      question: "Dans quel état se trouve actuellement le logement ?",
      type: "single",
      options: () =>
        [
          "Entretien normal",
          "Peu sale",
          "Très poussiéreux",
          "Très sale",
          "Très encrassé",
          "Nécessite un nettoyage en profondeur",
        ].map((l) => ({ label: l, value: l })),
      parse: (text) => {
        const t = (text || "").toLowerCase();
        if (/tr[èe]s sale|encrass[ée]|nettoyage en profondeur/.test(t)) return "very_dirty";
        if (/peu sale|poussi[èe]reux/.test(t)) return "dirty";
        return "normal";
      },
      applies: () => true,
    },
    {
      id: "logement_vide",
      question: "Le logement sera-t-il vide au moment du nettoyage ?",
      type: "single",
      options: () =>
        ["Oui, complètement vide", "Partiellement vide", "Non, il sera encore occupé", "Je ne sais pas"].map((l) => ({
          label: l,
          value: l,
        })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "fenetres",
      question: "Souhaitez-vous inclure le nettoyage des fenêtres ?",
      type: "single",
      options: () => ["Oui", "Non", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: (text) => yes(text),
      applies: () => true,
    },
    {
      id: "fenetres_type",
      question: "Quel type de nettoyage des fenêtres souhaitez-vous ?",
      type: "single",
      options: () =>
        ["Intérieur uniquement", "Intérieur + extérieur", "Vitres + cadres + rebords", "Nettoyage complet"].map(
          (l) => ({ label: l, value: l })
        ),
      parse: lbl,
      applies: (a) => a.fenetres === true,
    },
    {
      id: "fenetres_nombre",
      question: "Combien de fenêtres environ ?",
      type: "single",
      options: () =>
        ["1–5", "6–10", "11–15", "16–20", "Plus de 20", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.fenetres === true,
    },
    {
      id: "fenetres_difficiles",
      question: "Les vitres sont-elles difficiles d'accès (baies vitrées, hauteur, etc.) ?",
      type: "single",
      options: () => ["Oui", "Non"].map((l) => ({ label: l, value: l })),
      parse: (text) => yes(text),
      applies: (a) => a.fenetres === true,
    },
    {
      id: "four",
      question: "Souhaitez-vous inclure le nettoyage du four ?",
      type: "single",
      options: () => ["Oui", "Non", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: (text) => yes(text),
      applies: () => true,
    },
    {
      id: "four_etat",
      question: "Dans quel état est le four ?",
      type: "single",
      options: () =>
        ["Entretien normal", "Très graisseux", "Très encrassé", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.four === true,
    },
    {
      id: "frigo",
      question: "Souhaitez-vous inclure le nettoyage du réfrigérateur ?",
      type: "single",
      options: () =>
        ["Oui", "Non", "Réfrigérateur + congélateur", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "autres_appareils",
      question: "Souhaitez-vous nettoyer d'autres appareils de cuisine ?",
      type: "multi",
      options: () =>
        Object.keys(KITCHEN_APPLIANCE_KEYS)
          .map((l) => ({ label: l, value: KITCHEN_APPLIANCE_KEYS[l] }))
          .concat([{ label: "Aucun", value: "none" }]),
      parse: (text) => parseMultiKeys(text, KITCHEN_APPLIANCE_KEYS),
      applies: () => true,
    },
    {
      id: "tapis_moquette",
      question: "Souhaitez-vous un nettoyage de tapis ou de moquette ?",
      type: "single",
      options: () =>
        ["Non", "Tapis", "Moquette", "Tapis + moquette", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: (text) => ["Tapis", "Moquette", "Tapis + moquette"].includes(lbl(text)),
      applies: () => true,
    },
    {
      id: "tapis_pieces",
      question: "Quelle est approximativement la surface concernée (en nombre de pièces) ?",
      type: "single",
      options: () => ["1", "2", "3", "4+"].map((l) => ({ label: l, value: l })),
      parse: (text) => parseCount(text, 1),
      applies: (a) => a.tapis_moquette === true,
    },
    {
      id: "textiles",
      question: "Souhaitez-vous nettoyer des textiles ou du mobilier ?",
      type: "multi",
      options: () =>
        Object.keys(TEXTILE_KEYS)
          .map((l) => ({ label: l, value: TEXTILE_KEYS[l] }))
          .concat([{ label: "Aucun", value: "none" }]),
      parse: (text) => parseMultiKeys(text, TEXTILE_KEYS),
      applies: () => true,
    },
    {
      id: "floors_no_elevator",
      question: "Le logement est-il accessible sans ascenseur ?",
      type: "single",
      options: () => [
        { label: "Rez-de-chaussée ou ascenseur", value: "0" },
        { label: "1 étage sans ascenseur", value: "1" },
        { label: "2 étages sans ascenseur", value: "2" },
        { label: "3 étages ou plus sans ascenseur", value: "3" },
      ],
      parse: (text) => {
        const t = (text || "").toLowerCase();
        if (/rez|ascenseur/.test(t) && !/sans ascenseur/.test(t)) return 0;
        const m = t.match(/(\d+)/);
        return m ? Math.min(parseInt(m[1], 10), 3) : 0;
      },
      applies: () => true,
    },
    {
      id: "acces_logement",
      question: "Comment l'équipe pourra-t-elle accéder au logement ?",
      type: "single",
      options: () =>
        ["Je serai présent(e)", "Clés remises à l'équipe", "Boîte à clés", "Concierge / réception"].map((l) => ({
          label: l,
          value: l,
        })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "stationnement",
      question: "Y a-t-il une possibilité de stationner facilement à proximité du logement ?",
      type: "single",
      options: () =>
        ["Oui", "Non", "Parking privé", "Parking public", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "date_nettoyage",
      question: (a) =>
        a.type_nettoyage === "regular"
          ? "À partir de quelle date souhaitez-vous démarrer le nettoyage régulier ?"
          : "Quand souhaitez-vous effectuer le nettoyage ?",
      type: "date",
      applies: () => true,
    },
    {
      id: "date_imperative",
      question: (a) =>
        a.type_nettoyage === "regular"
          ? "Cette date de démarrage est-elle impérative ?"
          : "Cette date est-elle impérative ?",
      type: "single",
      options: () => ["Oui", "Non, je suis flexible"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "travaux_type",
      question: "Quels travaux ont été réalisés ?",
      type: "single",
      options: () =>
        ["Peinture", "Rénovation", "Construction", "Travaux de cuisine", "Travaux de salle de bains", "Rénovation complète"].map(
          (l) => ({ label: l, value: l })
        ),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "apres_travaux",
    },
    {
      id: "niveau_poussiere",
      question: "Quel est le niveau de poussière ou de saleté après les travaux ?",
      type: "single",
      options: () => ["Léger", "Moyen", "Important", "Très important"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "apres_travaux",
    },
    {
      id: "frequence",
      question: "À quelle fréquence souhaitez-vous le nettoyage ?",
      type: "single",
      options: () =>
        ["Chaque semaine", "Toutes les 2 semaines", "Toutes les 3 semaines", "Une fois par mois", "Ponctuellement"].map(
          (l) => ({ label: l, value: l })
        ),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "regular",
    },
    {
      id: "jour_semaine",
      question: "Quel jour de la semaine préférez-vous pour le passage de l'équipe ?",
      type: "single",
      options: () =>
        ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "regular",
    },
    {
      id: "heure_passage",
      question: "À quelle heure de la journée souhaitez-vous que l'équipe passe ?",
      type: "single",
      options: () =>
        ["Matin (8h–12h)", "Après-midi (12h–17h)", "Fin de journée (17h–19h)"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "regular",
    },
    {
      id: "hours",
      question: "Combien de temps souhaitez-vous prévoir pour chaque nettoyage ?",
      type: "single",
      options: () => HOURS_OPTIONS,
      parse: parseHours,
      applies: (a) => a.type_nettoyage === "regular",
    },
    {
      id: "vide_avant",
      question: "Le logement sera-t-il complètement vidé avant le nettoyage ?",
      type: "single",
      options: () => ["Oui", "Non", "Partiellement", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "fin_de_bail",
    },
    {
      id: "date_etat_des_lieux",
      question: "Quand aura lieu votre état des lieux ?",
      type: "text",
      parse: lbl,
      applies: (a) => a.type_nettoyage === "fin_de_bail",
    },
    {
      id: "garantie_remise_etat",
      question: "Avez-vous besoin d'un nettoyage avec garantie de remise en état pour l'état des lieux ?",
      type: "single",
      options: () => ["Oui", "Non", "Je ne sais pas"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: (a) => a.type_nettoyage === "fin_de_bail",
    },
    {
      id: "animaux",
      question: "Y a-t-il des animaux dans le logement ?",
      type: "single",
      options: () => ["Non", "Chien", "Chat", "Plusieurs animaux"].map((l) => ({ label: l, value: l })),
      parse: lbl,
      applies: () => true,
    },
    {
      id: "situations_particulieres",
      question: "Y a-t-il une situation particulière dont notre équipe devrait tenir compte ?",
      type: "multi",
      options: () =>
        [
          "Aucune",
          "Forte accumulation de poussière",
          "Fumée / odeurs",
          "Beaucoup de poils",
          "Logement très encombré",
          "Taches importantes",
          "Moisissures visibles",
        ].map((l) => ({ label: l, value: l })),
      // Deliberately never auto-priced (e.g. moisissures can need a real
      // procedure, not just a generic surcharge) — recorded for the owner
      // to review, per the brief's explicit instruction on this category.
      parse: (text) => (text || "").split(",").map((s) => s.trim()).filter(Boolean),
      applies: () => true,
    },
    {
      id: "contact",
      question:
        "Parfait ! Pour finaliser votre devis, quel est votre nom, votre e-mail, votre téléphone, et l'adresse du logement à nettoyer ? " +
        "(Vous testez cette démo pour votre entreprise ? Indiquez ici les coordonnées fictives d'un de vos clients — pas les vôtres.)",
      type: "text",
      parse: (text) => text,
      applies: () => true,
    },
  ];

  // Unlike a fixed question-by-turn-number script, this walks a fixed,
  // ordered list of steps — each asked exactly once as chips (or free text
  // for open-ended ones like dates and contact info) — with conditional
  // branches (fin-de-bail-specific, régulier-specific, etc.) only applying
  // when relevant. See src/mock.js for the full design note.
  function runTurnMock(pricing, history) {
    const answers = {};

    for (const step of STEPS) {
      if (!step.applies(answers)) continue;

      const questionText = typeof step.question === "function" ? step.question(answers) : step.question;

      if (!alreadyAsked(history, questionText)) {
        let question = null;
        if (step.type === "single" || step.type === "multi") {
          question = { type: step.type, options: step.options() };
        } else if (step.type === "date") {
          question = { type: "date", minDate: computeMinDate(pricing) };
        }
        return ask(questionText, question, pricing);
      }

      const rawAnswer = answerFollowing(history, questionText);
      answers[step.id] =
        step.type === "date" ? clampDate(rawAnswer, computeMinDate(pricing)) : step.parse(rawAnswer, answers);
    }

    const addons = []
      .concat(answers.four ? ["oven"] : [])
      .concat(answers.fenetres ? ["windows"] : [])
      .concat(answers.frigo === "Oui" || answers.frigo === "Réfrigérateur + congélateur" ? ["fridge"] : [])
      .concat(answers.frigo === "Réfrigérateur + congélateur" ? ["freezer"] : [])
      .concat(answers.tapis_moquette ? ["carpet_shampoo"] : [])
      .concat(answers.autres_appareils || [])
      .concat(answers.textiles || []);

    const input = {
      service_type: answers.type_nettoyage === "regular" ? "regular_cleaning" : "end_of_tenancy",
      rooms: answers.rooms || "3",
      hours: answers.type_nettoyage === "regular" ? answers.hours : undefined,
      addons: Array.from(new Set(addons)),
      carpet_rooms: answers.tapis_pieces,
      condition: answers.condition || "normal",
      difficult_access_windows: !!answers.fenetres_difficiles,
      floors_no_elevator: answers.floors_no_elevator || 0,
    };

    const quote = window.DealzPricingEngine.calculateQuote(pricing, input);
    quote.customer = extractContact(answers.contact || "");
    quote.details = answers;

    const text = quote.customer.name
      ? `Merci ${quote.customer.name} ! Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous.`
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
