/**
 * Conversational contact/qualification flow for index.html's #contact
 * section — replaces a static lead form with a mini Dealz-style experience:
 * a few chip-based questions, a plan recommendation, and a recap before
 * submitting. Deliberately mirrors the visual language and interaction
 * patterns already built for the real widget (docs/quote-app.js /
 * docs/mock-client.js) — same message bubbles, same chip styling, same
 * "always-available free-text input" fallback — rather than inventing a
 * new component language.
 *
 * On submit, POSTs to /api/install-request (server.js) — fire-and-forget,
 * the confirmation bubble always shows regardless of the network result.
 * That endpoint e-mails the Dealz team and forwards the lead into the CRM
 * (see src/notifications.js / dealz-crm's /api/inbound-leads).
 */
(function () {
  // WhatsApp is included in every plan. Amounts come from the visitor's
  // currency price list (docs/prices.js through docs/currency.js).
  const PLANS = {
    CAPTURE: { tagline: "Ne manquez plus aucune demande." },
    CLOSE: { tagline: "Ne laissez plus un « non » devenir une vente perdue." },
    SCALE: { tagline: "Plus de demandes sans plus de gestion." },
  };
  const SITE_PLANS = ["CAPTURE", "CLOSE", "SCALE"];
  const price = (key) => (window.DealzCurrency ? window.DealzCurrency.price(key) : NaN);
  const setupFee = () => (window.DealzCurrency ? window.DealzCurrency.setup : 290);
  const monthlyOf = (plan) => price(plan);
  const yearlyOf = (plan) => price(plan + ".year");
  const onceOf = (plan) => price(plan + ".once");

  // The price picker on the page (docs/pricing.js) stores the visitor's pick in
  // window.DEALZ_PICK = { plan, whatsapp, billing } and fires "dealz-pick". The
  // plan, billing and WhatsApp questions are then answered for them, once;
  // going back to change an answer asks the question normally.
  const pickUsed = {};
  function pickFor(kind) {
    const pick = window.DEALZ_PICK;
    if (!pick || pickUsed[kind]) return null;
    if (kind === "plan" && PLANS[pick.plan]) return pick;
    if (kind === "billing" && ["monthly", "yearly", "onetime"].includes(pick.billing) && (pick.billing !== "onetime" || oneTimeOpen())) return pick;
    return null;
  }

  // Lifetime access, as a launch offer: offered until the end of 2026 only.
  const ONE_TIME_UNTIL = new Date("2027-01-01T00:00:00+01:00");
  const oneTimeOpen = () => new Date() < ONE_TIME_UNTIL;

  // Prices are shown in the visitor's currency (docs/currency.js), each
  // with its own price list. Texts say "{setup}" / "{extra}" where an
  // amount goes and money() fills it in when displayed.
  const fmt = (n) => (window.DealzCurrency ? window.DealzCurrency.format(n) : "CHF " + n);
  function money(s) {
    if (typeof s !== "string") return s;
    return s.replace(/\{setup\}/g, () => fmt(setupFee())).replace(/\{extra\}/g, () => fmt(price("extra")));
  }

  const STEPS = [
    {
      id: "company_name",
      kind: "text",
      question: "Quel est le nom de votre entreprise ?",
      placeholder: "Nom de votre entreprise",
    },
    {
      id: "team_size",
      kind: "single",
      question: "Combien de personnes prennent actuellement les demandes ou réservations ?",
      options: ["👤 Moi uniquement", "👥 2–5 personnes", "👥 6–15 personnes", "🏢 Plus de 15", "Autre"],
      allowOther: true,
    },
    {
      id: "request_sources",
      kind: "multi",
      question: "Comment recevez-vous actuellement vos demandes ?",
      options: ["🌐 Site web", "📧 Email", "📞 Téléphone", "💬 WhatsApp", "📱 Réseaux sociaux", "Autre"],
      allowOther: true,
    },
    {
      id: "main_problem",
      kind: "single",
      question: "Quel est votre principal problème aujourd'hui ?",
      options: [
        "❌ Je manque parfois des demandes",
        "⏰ Je réponds trop tard",
        "🧮 Les devis me prennent trop de temps",
        "💸 Des clients refusent mes devis",
        "🔄 Je dois gérer les contre-offres manuellement",
        "👥 Nous sommes plusieurs à gérer les réservations",
        "📅 La gestion des agendas est compliquée",
        "Autre",
      ],
      allowOther: true,
    },
    { id: "plan_choice", kind: "plan", question: "Quelle formule vous intéresse ?" },
    { id: "billing_choice", kind: "billing", question: "Comment souhaitez-vous commencer ?" },
    {
      id: "website_url",
      kind: "url",
      question: "Avez-vous un site internet ? Nous y ajoutons votre bouton WhatsApp Dealz.",
      placeholder: "https://www.votreentreprise.ch",
      skipLabel: "Je n'ai pas de site internet",
    },
    {
      id: "contact_info",
      kind: "contact_form",
      question: "Et où pouvons-nous vous envoyer votre récapitulatif ?",
    },
  ];

  // No website: the visitor said so on the website step.
  const NO_WEBSITE = "—";
  const hasWebsite = () => !!state.answers.website_url && state.answers.website_url !== NO_WEBSITE;

  function recommendPlan(answers) {
    const team = answers.team_size || "";
    const problem = answers.main_problem || "";
    if (/6–15|Plus de 15/.test(team)) return "SCALE";
    if (/plusieurs à gérer|agendas/.test(problem)) return "SCALE";
    if (/refusent mes devis|contre-offres/.test(problem)) return "CLOSE";
    return "CAPTURE";
  }

  function recommendReason(plan) {
    if (plan === "SCALE") {
      return "Vous êtes plusieurs à gérer les réservations, ou la gestion des agendas devient compliquée — SCALE ajoute les collaborateurs, les agendas partagés et la répartition automatique dont vous avez besoin.";
    }
    if (plan === "CLOSE") {
      return "Vous recevez déjà des demandes, mais votre principal problème semble être la récupération des devis refusés ou des contre-offres. CLOSE est donc probablement la formule la plus adaptée.";
    }
    return "Votre priorité aujourd'hui est de ne manquer aucune demande — CAPTURE couvre exactement ce besoin, sans rien de superflu.";
  }

  // Display-only translation, same safe pattern as docs/quote-app.js: the
  // *stored* answer (state.answers, submitted to /api/install-request and
  // recommendPlan()'s own French-keyword matching) always stays the
  // original French string — only what's rendered on screen is translated.
  // Zero risk to the plan-recommendation logic or the internal Dealz-team
  // notification email, which stays French either way.
  const I18N = {
    "Quel est le nom de votre entreprise ?": { en: "What's the name of your company?", de: "Wie heisst Ihr Unternehmen?" },
    "Nom de votre entreprise": { en: "Your company name", de: "Name Ihres Unternehmens" },
    "Combien de personnes prennent actuellement les demandes ou réservations ?": { en: "How many people currently handle enquiries or bookings?", de: "Wie viele Personen bearbeiten derzeit Anfragen oder Buchungen?" },
    "👤 Moi uniquement": { en: "👤 Just me", de: "👤 Nur ich" },
    "👥 2–5 personnes": { en: "👥 2–5 people", de: "👥 2–5 Personen" },
    "👥 6–15 personnes": { en: "👥 6–15 people", de: "👥 6–15 Personen" },
    "🏢 Plus de 15": { en: "🏢 More than 15", de: "🏢 Mehr als 15" },
    "Autre": { en: "Other", de: "Andere" },
    "Comment recevez-vous actuellement vos demandes ?": { en: "How do you currently receive enquiries?", de: "Wie erhalten Sie derzeit Ihre Anfragen?" },
    "🌐 Site web": { en: "🌐 Website", de: "🌐 Website" },
    "📧 Email": { en: "📧 Email", de: "📧 E-Mail" },
    "📞 Téléphone": { en: "📞 Phone", de: "📞 Telefon" },
    "💬 WhatsApp": { en: "💬 WhatsApp", de: "💬 WhatsApp" },
    "📱 Réseaux sociaux": { en: "📱 Social media", de: "📱 Soziale Medien" },
    "Quel est votre principal problème aujourd'hui ?": { en: "What's your main problem today?", de: "Was ist heute Ihr grösstes Problem?" },
    "❌ Je manque parfois des demandes": { en: "❌ I sometimes miss enquiries", de: "❌ Mir entgehen manchmal Anfragen" },
    "⏰ Je réponds trop tard": { en: "⏰ I reply too late", de: "⏰ Ich antworte zu spät" },
    "🧮 Les devis me prennent trop de temps": { en: "🧮 Quotes take too much of my time", de: "🧮 Offerten kosten mich zu viel Zeit" },
    "💸 Des clients refusent mes devis": { en: "💸 Customers decline my quotes", de: "💸 Kunden lehnen meine Offerten ab" },
    "🔄 Je dois gérer les contre-offres manuellement": { en: "🔄 I have to handle counter-offers manually", de: "🔄 Ich muss Gegenangebote manuell bearbeiten" },
    "👥 Nous sommes plusieurs à gérer les réservations": { en: "👥 Several of us handle bookings", de: "👥 Mehrere von uns verwalten Buchungen" },
    "📅 La gestion des agendas est compliquée": { en: "📅 Managing calendars is complicated", de: "📅 Die Terminverwaltung ist kompliziert" },
    "Quelle formule vous intéresse ?": { en: "Which plan are you interested in?", de: "Welcher Plan interessiert Sie?" },
    "Comment souhaitez-vous commencer ?": { en: "How would you like to get started?", de: "Wie möchten Sie starten?" },
    "Avez-vous un site internet ? Nous y ajoutons votre bouton WhatsApp Dealz.": {
      en: "Do you have a website? We'll add your Dealz WhatsApp button to it.",
      de: "Haben Sie eine Website? Wir fügen dort Ihren Dealz-WhatsApp-Button hinzu.",
    },
    "Je n'ai pas de site internet": { en: "I don't have a website", de: "Ich habe keine Website" },
    "Et où pouvons-nous vous envoyer votre récapitulatif ?": { en: "And where can we send your summary?", de: "Und wohin dürfen wir Ihnen Ihre Zusammenfassung senden?" },
    "Quelques questions rapides": { en: "A few quick questions", de: "Ein paar kurze Fragen" },
    "C'est prêt": { en: "All set", de: "Bereit" },
    "Écrivez votre réponse…": { en: "Type your answer…", de: "Schreiben Sie Ihre Antwort…" },
    "Répondez ci-dessus…": { en: "Answer above…", de: "Oben antworten…" },
    "← Modifier la réponse précédente": { en: "← Edit the previous answer", de: "← Vorherige Antwort ändern" },
    "Vous pouvez préciser :": { en: "Feel free to specify:", de: "Sie können es näher erläutern:" },
    "Votre précision…": { en: "Your details…", de: "Ihre Angabe…" },
    "Valider mes choix": { en: "Confirm my choices", de: "Auswahl bestätigen" },
    "Aucune de ces réponses": { en: "None of these", de: "Keine dieser Antworten" },
    "RECOMMANDÉ": { en: "RECOMMENDED", de: "EMPFOHLEN" },
    "CLOSE ⭐": { en: "CLOSE ⭐", de: "CLOSE ⭐" },
    "Choisir CLOSE ⭐": { en: "Choose CLOSE ⭐", de: "CLOSE ⭐ wählen" },
    "Choisir CAPTURE": { en: "Choose CAPTURE", de: "CAPTURE wählen" },
    "Choisir SCALE": { en: "Choose SCALE", de: "SCALE wählen" },
    "💡 Pas sûr ? Laissez Dealz vous recommander une formule.": { en: "💡 Not sure? Let Dealz recommend a plan for you.", de: "💡 Unsicher? Lassen Sie sich von Dealz einen Plan empfehlen." },
    "Mensuel": { en: "Monthly", de: "Monatlich" },
    "Annuel": { en: "Yearly", de: "Jährlich" },
    "Choisir mensuel": { en: "Choose monthly", de: "Monatlich wählen" },
    "Choisir annuel": { en: "Choose yearly", de: "Jährlich wählen" },
    "WhatsApp est inclus : un bouton suffit, sur votre site, votre fiche Google ou un QR code. Rien à changer sur votre site.": {
      en: "WhatsApp is included: a button is all it takes, on your site, your Google profile or a QR code. Nothing to change on your site.",
      de: "WhatsApp ist inbegriffen: Ein Button genügt, auf Ihrer Website, Ihrem Google-Profil oder als QR-Code. An Ihrer Website ändert sich nichts.",
    },
    "Prénom / Nom": { en: "First / last name", de: "Vorname / Name" },
    "E-mail professionnel": { en: "Work email", de: "Geschäftliche E-Mail" },
    "Téléphone (optionnel)": { en: "Phone (optional)", de: "Telefon (optional)" },
    "Continuer →": { en: "Continue →", de: "Weiter →" },
    "Tout est bon ?": { en: "Everything look good?", de: "Passt alles?" },
    "VOTRE DEMANDE DEALZ": { en: "YOUR DEALZ REQUEST", de: "IHRE DEALZ-ANFRAGE" },
    "Entreprise": { en: "Company", de: "Unternehmen" },
    "Formule": { en: "Plan", de: "Plan" },
    "Facturation": { en: "Billing", de: "Abrechnung" },
    "Annuelle": { en: "Yearly", de: "Jährlich" },
    "Mensuelle": { en: "Monthly", de: "Monatlich" },
    "Abonnement": { en: "Subscription", de: "Abonnement" },
    "Installation": { en: "Setup", de: "Einrichtung" },
    "OFFERTE": { en: "FREE", de: "GRATIS" },
    "Site": { en: "Website", de: "Website" },
    "Votre objectif": { en: "Your goal", de: "Ihr Ziel" },
    "🚀 Demander mon installation Dealz": { en: "🚀 Request my Dealz setup", de: "🚀 Meine Dealz-Einrichtung anfragen" },
    "Modifier mes réponses": { en: "Edit my answers", de: "Meine Antworten ändern" },
    "Demande envoyée ✓": { en: "Request sent ✓", de: "Anfrage gesendet ✓" },
    "👋 Bonjour ! Je suis Dealz. Je peux vous aider à voir quelle formule correspond le mieux à votre entreprise. On commence ?": {
      en: "👋 Hi! I'm Dealz. I can help you see which plan fits your business best. Shall we get started?",
      de: "👋 Hallo! Ich bin Dealz. Ich helfe Ihnen gerne herauszufinden, welcher Plan am besten zu Ihrem Unternehmen passt. Fangen wir an?",
    },
    "Oui, allons-y →": { en: "Yes, let's go →", de: "Ja, los geht's →" },
    "Hmm, cette adresse ne ressemble pas tout à fait à une URL — vous pouvez réessayer ?": {
      en: "Hmm, that doesn't quite look like a URL — could you try again?",
      de: "Hmm, das sieht nicht ganz nach einer URL aus — können Sie es nochmals versuchen?",
    },
    "Merci ! Votre demande est bien enregistrée. Nous allons examiner votre site et votre configuration afin de préparer l'installation de Dealz. Vous recevrez votre récapitulatif par e-mail.": {
      en: "Thank you! Your request has been recorded. We'll review your site and setup to prepare your Dealz installation. You'll receive your summary by email.",
      de: "Vielen Dank! Ihre Anfrage wurde erfasst. Wir prüfen Ihre Website und Konfiguration, um die Installation von Dealz vorzubereiten. Sie erhalten Ihre Zusammenfassung per E-Mail.",
    },
    "+ {setup} d'installation unique": { en: "+ {setup} one-time setup fee", de: "+ {setup} einmalige Einrichtungsgebühr" },
    "Sans frais d'installation": { en: "No setup fee", de: "Keine Einrichtungsgebühr" },
    "← Modifier": { en: "← Edit", de: "← Ändern" },
    "💳 Payer et démarrer": { en: "💳 Pay and get started", de: "💳 Bezahlen und starten" },
    "Redirection vers le paiement sécurisé…": { en: "Redirecting to secure payment…", de: "Weiterleitung zur sicheren Zahlung…" },
    "Le paiement n'a pas pu démarrer — votre demande est bien enregistrée, nous vous recontactons.": {
      en: "The payment couldn't start — your request has been recorded, we'll get back to you.",
      de: "Die Zahlung konnte nicht gestartet werden — Ihre Anfrage ist erfasst, wir melden uns.",
    },
    "✅ Paiement reçu, merci ! Bienvenue chez Dealz. Vous recevez la confirmation de Stripe par e-mail, et nous vous contactons très vite pour l'installation.": {
      en: "✅ Payment received, thank you! Welcome to Dealz. You'll get Stripe's confirmation by email, and we'll contact you very soon about the setup.",
      de: "✅ Zahlung erhalten, vielen Dank! Willkommen bei Dealz. Sie erhalten die Bestätigung von Stripe per E-Mail, und wir melden uns sehr bald für die Einrichtung.",
    },
    "Paiement annulé — rien n'a été débité. Votre demande est enregistrée : vous pouvez reprendre quand vous voulez.": {
      en: "Payment cancelled — nothing was charged. Your request is recorded: you can pick it up whenever you like.",
      de: "Zahlung abgebrochen — es wurde nichts belastet. Ihre Anfrage ist erfasst: Sie können jederzeit fortfahren.",
    },
    "🚀 OFFRE DE LANCEMENT": { en: "🚀 LAUNCH OFFER", de: "🚀 EINFÜHRUNGSANGEBOT" },
    "Jusqu'au 31 décembre 2026.": { en: "Until 31 December 2026.", de: "Bis 31. Dezember 2026." },
    "2 mois offerts, et {setup} d'installation économisés.": { en: "2 months free, and you save {setup} on setup.", de: "2 Monate gratis, und Sie sparen {setup} bei der Einrichtung." },
    "2 mois offerts.": { en: "2 months free.", de: "2 Monate gratis." },
    "Vous êtes plusieurs à gérer les réservations, ou la gestion des agendas devient compliquée — SCALE ajoute les collaborateurs, les agendas partagés et la répartition automatique dont vous avez besoin.": {
      en: "Several of you manage bookings, or calendar management is becoming complicated — SCALE adds the team members, shared calendars, and automatic assignment you need.",
      de: "Mehrere Personen verwalten bei Ihnen Buchungen, oder die Terminverwaltung wird kompliziert — SCALE bietet die Mitarbeiterkonten, geteilten Kalender und automatische Zuteilung, die Sie brauchen.",
    },
    "Vous recevez déjà des demandes, mais votre principal problème semble être la récupération des devis refusés ou des contre-offres. CLOSE est donc probablement la formule la plus adaptée.": {
      en: "You're already receiving enquiries, but your main issue seems to be recovering declined quotes or counter-offers. CLOSE is likely the best fit for you.",
      de: "Sie erhalten bereits Anfragen, aber Ihr Hauptproblem scheint die Nachverfolgung abgelehnter Offerten oder Gegenangebote zu sein. CLOSE ist daher wahrscheinlich der passende Plan.",
    },
    "Votre priorité aujourd'hui est de ne manquer aucune demande — CAPTURE couvre exactement ce besoin, sans rien de superflu.": {
      en: "Your priority today is not missing a single enquiry — CAPTURE covers exactly that, without anything extra.",
      de: "Ihre Priorität ist es, keine Anfrage mehr zu verpassen — CAPTURE deckt genau das ab, ohne unnötigen Schnickschnack.",
    },
    "Ne manquez plus aucune demande.": { en: "Never miss another enquiry.", de: "Verpassen Sie keine Anfrage mehr." },
    "Ne laissez plus un « non » devenir une vente perdue.": {
      en: "Stop letting a \"no\" become a lost sale.",
      de: "Lassen Sie ein „Nein“ nicht mehr zu einem verlorenen Verkauf werden.",
    },
    "Plus de demandes sans plus de gestion.": { en: "More enquiries without more admin.", de: "Mehr Anfragen ohne mehr Verwaltungsaufwand." },
    "Paiement unique": { en: "One-time payment", de: "Einmalzahlung" },
    "Accès à vie, sans abonnement.": { en: "Lifetime access, no subscription.", de: "Lebenslanger Zugang, kein Abo." },
    "Choisir paiement unique": { en: "Choose one-time payment", de: "Einmalzahlung wählen" },
    "Unique": { en: "One-time", de: "Einmalig" },
    "Paiement": { en: "Payment", de: "Zahlung" },
    "WhatsApp Business": { en: "WhatsApp Business", de: "WhatsApp Business" },
    "Merci ! Votre demande est bien enregistrée. Nous allons préparer l'installation de Dealz sur WhatsApp et revenir vers vous pour connecter votre numéro WhatsApp Business. Vous recevrez votre récapitulatif par e-mail.": {
      en: "Thank you! Your request has been recorded. We'll prepare your Dealz installation on WhatsApp and come back to you to connect your WhatsApp Business number. You'll receive your summary by email.",
      de: "Vielen Dank! Ihre Anfrage wurde erfasst. Wir bereiten die Dealz-Einrichtung auf WhatsApp vor und melden uns, um Ihre WhatsApp-Business-Nummer anzubinden. Sie erhalten Ihre Zusammenfassung per E-Mail.",
    },
  };

  function T(fr) {
    return money(translate(fr));
  }
  function translate(fr) {
    const lang = window.DEALZ_LANG;
    if (!lang || lang === "fr" || !fr) return fr;
    const entry = I18N[fr];
    return (entry && entry[lang]) || fr;
  }

  // ---- Small lang-aware helpers for strings built with interpolation,
  // which a plain T() exact-match lookup can't catch. ----
  function perMonth(n) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `${fmt(n)} / month`;
    if (lang === "de") return `${fmt(n)} / Monat`;
    return `${fmt(n)} / mois`;
  }
  function perYear(n) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `${fmt(n)} / year`;
    if (lang === "de") return `${fmt(n)} / Jahr`;
    return `${fmt(n)} / an`;
  }
  function chooseLabel(plan) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `Choose ${plan} →`;
    if (lang === "de") return `${plan} wählen →`;
    return `Choisir ${plan} →`;
  }
  function planLabel(key) {
    return key;
  }
  function recommendedSuffix(key) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `${key} (recommended by Dealz)`;
    if (lang === "de") return `${key} (von Dealz empfohlen)`;
    return `${key} (recommandé par Dealz)`;
  }
  function recommendLabel(plan) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `🤖 Dealz recommends: ${plan}`;
    if (lang === "de") return `🤖 Dealz empfiehlt: ${plan}`;
    return `🤖 Dealz vous recommande : ${plan}`;
  }
  function stepProgress(i, total) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `Step ${i} of ${total}`;
    if (lang === "de") return `Schritt ${i} von ${total}`;
    return `Étape ${i} sur ${total}`;
  }
  function billingLine(mode, monthly, yearly, onetime) {
    const lang = window.DEALZ_LANG;
    if (mode === "onetime") {
      if (lang === "en") return money(`One-time — ${fmt(onetime)} (lifetime access, no subscription)`);
      if (lang === "de") return money(`Einmalig — ${fmt(onetime)} (lebenslanger Zugang, kein Abo)`);
      return money(`Paiement unique — ${fmt(onetime)} (accès à vie, sans abonnement)`);
    }
    if (mode === "yearly") {
      if (lang === "en") return money(`Yearly — ${fmt(yearly)}/year (2 months free)`);
      if (lang === "de") return money(`Jährlich — ${fmt(yearly)}/Jahr (2 Monate gratis)`);
      return money(`Annuel — ${fmt(yearly)}/an (2 mois offerts)`);
    }
    const noSetup = !setupFee();
    if (lang === "en") return money(`Monthly — ${fmt(monthly)}/month` + (noSetup ? ", no setup fee" : " + {setup} setup"));
    if (lang === "de") return money(`Monatlich — ${fmt(monthly)}/Monat` + (noSetup ? ", keine Einrichtungsgebühr" : " + {setup} Einrichtung"));
    return money(`Mensuel — ${fmt(monthly)}/mois` + (noSetup ? ", sans frais d'installation" : " + {setup} installation"));
  }
  function oneTimeLabel(n) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `${fmt(n)} (one-time)`;
    if (lang === "de") return `${fmt(n)} (einmalig)`;
    return `${fmt(n)} (paiement unique)`;
  }
  function installedLine() {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return money("<s>{setup} setup</s> — <b>FREE</b>");
    if (lang === "de") return money("<s>{setup} Einrichtung</s> — <b>GRATIS</b>");
    return money("<s>{setup} installation</s> — <b>OFFERTE</b>");
  }
  function whatsappIncludedValue() {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return money("Included (100 conversations / month, then {extra} each)");
    if (lang === "de") return money("Inbegriffen (100 Gespräche / Monat, danach {extra} pro Gespräch)");
    return money("Inclus (100 conversations / mois, puis {extra} l'une)");
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = T(text);
    return e;
  }

  // On a phone the chat grows with the page (styles.css) instead of
  // scrolling inside its box: then bring the newest message into view —
  // only once the visitor has interacted, so the page never jumps on load.
  var chatTouched = false;
  document.addEventListener("pointerdown", function (e) { if (e.target.closest && e.target.closest(".quote-panel, .contact-panel")) chatTouched = true; }, true);
  document.addEventListener("keydown", function (e) { if (e.target.closest && e.target.closest(".quote-panel, .contact-panel")) chatTouched = true; }, true);
  function followChat(c) {
    c.scrollTop = c.scrollHeight;
    if (!chatTouched || c.scrollHeight > c.clientHeight + 1 || !c.lastElementChild) return;
    var bar = c.parentElement && c.parentElement.querySelector(".dealz-inputbar");
    var r = c.lastElementChild.getBoundingClientRect();
    var bottom = window.innerHeight - (bar ? bar.offsetHeight : 0) - 12;
    if (r.bottom > bottom) window.scrollBy({ top: r.bottom - bottom, behavior: "smooth" });
  }
  function scrollToBottom(c) {
    followChat(c);
  }

  function assistantBubble(text) {
    return el("div", "dealz-msg assistant", text);
  }
  function userBubble(text) {
    return el("div", "dealz-msg user", text);
  }

  const state = { answers: {}, stepIndex: -1, blocks: [] };
  let container, input, sendBtn, progressEl;
  let pendingText = null; // { onSubmit(value) } — set whenever the shared input bar should act on the next Enter/Envoyer
  let started = false;

  function updateProgress() {
    if (!started) {
      progressEl.textContent = T("Quelques questions rapides");
      return;
    }
    if (state.stepIndex >= STEPS.length) {
      progressEl.textContent = T("C'est prêt");
      return;
    }
    progressEl.textContent = stepProgress(state.stepIndex + 1, STEPS.length);
  }

  function setInputMode(mode, placeholder) {
    // mode: 'text' (free-text expected) or 'off' (chips/cards handle this step)
    if (mode === "text") {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = T(placeholder) || T("Écrivez votre réponse…");
      input.focus();
    } else {
      input.disabled = true;
      sendBtn.disabled = true;
      input.value = "";
      input.placeholder = T("Répondez ci-dessus…");
    }
  }

  function disableBlock(wrap) {
    wrap.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
  }

  function backLink(wrap) {
    if (state.stepIndex <= 0) return;
    const back = el("button", "flow-back", "← Modifier la réponse précédente");
    back.type = "button";
    back.addEventListener("click", goBack);
    wrap.appendChild(back);
  }

  // Called from the "← Modifier" link on the *current*, not-yet-answered
  // step: drop that empty block, then drop the previous step's block and
  // its recorded answer so it can be redone.
  function goBack() {
    if (state.stepIndex <= 0) return;
    const currentBlock = state.blocks[state.stepIndex];
    if (currentBlock) currentBlock.remove();
    state.blocks[state.stepIndex] = null;

    const prevIndex = state.stepIndex - 1;
    const prevBlock = state.blocks[prevIndex];
    if (prevBlock) prevBlock.remove();
    state.blocks[prevIndex] = null;
    if (STEPS[prevIndex]) delete state.answers[STEPS[prevIndex].id];

    advanceTo(prevIndex);
  }

  function goToStep(index) {
    for (let i = state.blocks.length - 1; i >= index; i--) {
      if (state.blocks[i]) {
        state.blocks[i].remove();
        state.blocks[i] = null;
      }
      if (STEPS[i]) delete state.answers[STEPS[i].id];
    }
    state.stepIndex = index;
    renderStep(index);
  }

  function advanceTo(nextIndex) {
    state.stepIndex = nextIndex;
    renderStep(nextIndex);
  }

  // ---- "Autre" precision follow-up, shared by single/multi steps ----
  function needsOtherDetail(step, rawAnswer) {
    if (!step.allowOther) return false;
    return Array.isArray(rawAnswer) ? rawAnswer.includes("Autre") : rawAnswer === "Autre";
  }

  function askOtherDetail(wrap, step, rawAnswer) {
    wrap.appendChild(assistantBubble("Vous pouvez préciser :"));
    setInputMode("text", "Votre précision…");
    pendingText = {
      onSubmit: (detail) => {
        wrap.appendChild(userBubble(detail));
        const merged = Array.isArray(rawAnswer)
          ? rawAnswer.map((v) => (v === "Autre" ? `Autre : ${detail}` : v))
          : `Autre : ${detail}`;
        state.answers[step.id] = merged;
        setInputMode("off");
        advanceTo(state.stepIndex + 1);
      },
    };
  }

  // ---- Chip rendering (single / multi) — mirrors docs/quote-app.js ----
  function renderChipsInto(wrap, step) {
    const picker = el("div", "dop-chips flow-chips");
    const selected = new Set();

    step.options.forEach((label) => {
      const btn = el("button", "dop-chip", label);
      btn.type = "button";
      btn.addEventListener("click", () => {
        if (step.kind === "multi") {
          btn.classList.toggle("selected");
          if (selected.has(label)) selected.delete(label);
          else selected.add(label);
        } else {
          disableBlock(wrap);
          wrap.appendChild(userBubble(label));
          if (needsOtherDetail(step, label)) {
            askOtherDetail(wrap, step, label);
          } else {
            state.answers[step.id] = label;
            advanceTo(state.stepIndex + 1);
          }
        }
      });
      picker.appendChild(btn);
    });
    wrap.appendChild(picker);

    if (step.kind === "multi") {
      const confirmBtn = el("button", "dcf-submit", "Valider mes choix");
      confirmBtn.type = "button";
      confirmBtn.addEventListener("click", () => {
        const chosen = Array.from(selected);
        disableBlock(wrap);
        wrap.appendChild(userBubble(chosen.length ? chosen.map(T).join(", ") : "Aucune de ces réponses"));
        if (needsOtherDetail(step, chosen)) {
          askOtherDetail(wrap, step, chosen);
        } else {
          state.answers[step.id] = chosen;
          advanceTo(state.stepIndex + 1);
        }
      });
      wrap.appendChild(confirmBtn);
    }
  }

  // ---- Plan choice ----
  function renderPlanChoice(wrap) {
    const grid = el("div", "flow-plan-grid");
    SITE_PLANS.forEach((key) => {
      const plan = PLANS[key];
      const card = el("div", "flow-plan-card" + (key === "CLOSE" ? " featured" : ""));
      if (key === "CLOSE") card.appendChild(el("span", "flow-plan-badge", "RECOMMANDÉ"));
      card.appendChild(el("div", "flow-plan-name", key === "CLOSE" ? "CLOSE ⭐" : key));
      card.appendChild(el("div", "flow-plan-price", perMonth(monthlyOf(key))));
      card.appendChild(el("div", "flow-plan-tagline", plan.tagline));
      const pick = el("button", "btn btn-secondary flow-plan-pick", key === "CLOSE" ? "Choisir CLOSE ⭐" : `Choisir ${key}`);
      pick.type = "button";
      pick.addEventListener("click", () => choosePlan(wrap, key, false));
      card.appendChild(pick);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    const helper = el("div", "flow-recommend-prompt");
    const helperBtn = el("button", "flow-recommend-btn", "💡 Pas sûr ? Laissez Dealz vous recommander une formule.");
    helperBtn.type = "button";
    helperBtn.addEventListener("click", () => {
      helper.remove();
      showRecommendation(wrap);
    });
    helper.appendChild(helperBtn);
    wrap.appendChild(helper);
  }

  function showRecommendation(wrap) {
    const plan = recommendPlan(state.answers);
    const box = el("div", "flow-recommendation");
    box.appendChild(el("div", "flow-recommendation-label", recommendLabel(plan)));
    box.appendChild(el("p", "flow-recommendation-reason", recommendReason(plan)));
    box.appendChild(el("div", "flow-recommendation-price", perMonth(monthlyOf(plan))));
    const pick = el("button", "btn btn-primary", chooseLabel(plan));
    pick.type = "button";
    pick.addEventListener("click", () => choosePlan(wrap, plan, true));
    box.appendChild(pick);
    wrap.appendChild(box);
    scrollToBottom(container);
  }

  function choosePlan(wrap, key, wasRecommended) {
    disableBlock(wrap);
    wrap.appendChild(userBubble(wasRecommended ? recommendedSuffix(key) : planLabel(key)));
    state.answers.plan_choice = key;
    advanceTo(state.stepIndex + 1);
  }

  // ---- Billing choice ----
  function renderBillingChoice(wrap) {
    const plan = state.answers.plan_choice || "CAPTURE";
    const monthly = monthlyOf(plan);
    const yearly = yearlyOf(plan);
    const onetime = onceOf(plan);
    const noSetup = !setupFee();

    const grid = el("div", "flow-billing-grid");

    const monthlyCard = el("div", "flow-billing-card");
    monthlyCard.appendChild(el("div", "flow-billing-label", "Mensuel"));
    monthlyCard.appendChild(el("div", "flow-billing-price", perMonth(monthly)));
    monthlyCard.appendChild(el("div", "flow-billing-line", noSetup ? "Sans frais d'installation" : "+ {setup} d'installation unique"));
    const pickMonthly = el("button", "btn btn-secondary flow-billing-pick", "Choisir mensuel");
    pickMonthly.type = "button";
    pickMonthly.addEventListener("click", () => chooseBilling(wrap, "monthly", monthly, yearly, onetime));
    monthlyCard.appendChild(pickMonthly);
    grid.appendChild(monthlyCard);

    const yearlyCard = el("div", "flow-billing-card highlight");
    yearlyCard.appendChild(el("span", "flow-plan-badge", "RECOMMANDÉ"));
    yearlyCard.appendChild(el("div", "flow-billing-label", "Annuel"));
    yearlyCard.appendChild(el("div", "flow-billing-price", perYear(yearly)));
    if (!noSetup) {
      const line = el("div", "flow-billing-line");
      line.innerHTML = installedLine();
      yearlyCard.appendChild(line);
    }
    yearlyCard.appendChild(el("div", "flow-billing-save", noSetup ? "2 mois offerts." : "2 mois offerts, et {setup} d'installation économisés."));
    const pickYearly = el("button", "btn btn-primary flow-billing-pick", "Choisir annuel");
    pickYearly.type = "button";
    pickYearly.addEventListener("click", () => chooseBilling(wrap, "yearly", monthly, yearly, onetime));
    yearlyCard.appendChild(pickYearly);
    grid.appendChild(yearlyCard);

    if (!oneTimeOpen()) {
      wrap.appendChild(grid);
      return;
    }
    const onetimeCard = el("div", "flow-billing-card");
    onetimeCard.appendChild(el("span", "flow-plan-badge", "🚀 OFFRE DE LANCEMENT"));
    onetimeCard.appendChild(el("div", "flow-billing-label", "Paiement unique"));
    onetimeCard.appendChild(el("div", "flow-billing-price", oneTimeLabel(onetime)));
    onetimeCard.appendChild(el("div", "flow-billing-line", "Accès à vie, sans abonnement."));
    onetimeCard.appendChild(el("div", "flow-billing-line", "Jusqu'au 31 décembre 2026."));
    const pickOnetime = el("button", "btn btn-secondary flow-billing-pick", "Choisir paiement unique");
    pickOnetime.type = "button";
    pickOnetime.addEventListener("click", () => chooseBilling(wrap, "onetime", monthly, yearly, onetime));
    onetimeCard.appendChild(pickOnetime);
    grid.appendChild(onetimeCard);

    wrap.appendChild(grid);
  }

  function chooseBilling(wrap, mode, monthly, yearly, onetime) {
    disableBlock(wrap);
    wrap.appendChild(userBubble(billingLine(mode, monthly, yearly, onetime)));
    state.answers.billing_choice = mode;
    state.answers.billing_monthly = monthly;
    state.answers.billing_yearly = yearly;
    state.answers.billing_onetime = onetime;
    advanceTo(state.stepIndex + 1);
  }

  // ---- Contact info (reuses the demo widget's contact-form styling) ----
  function renderContactFields(wrap) {
    const form = el("div", "dealz-contact-form");
    form.appendChild(
      el(
        "p",
        "dcf-intro",
        "WhatsApp est inclus : un bouton suffit, sur votre site, votre fiche Google ou un QR code. Rien à changer sur votre site."
      )
    );

    const nameInput = el("input", "dcf-input");
    nameInput.placeholder = T("Prénom / Nom");
    const emailInput = el("input", "dcf-input");
    emailInput.type = "email";
    emailInput.placeholder = T("E-mail professionnel");
    emailInput.required = true;
    const phoneInput = el("input", "dcf-input");
    phoneInput.placeholder = T("Téléphone (optionnel)");

    form.appendChild(nameInput);
    form.appendChild(emailInput);
    form.appendChild(phoneInput);

    const submit = el("button", "dcf-submit", "Continuer →");
    submit.type = "button";
    submit.addEventListener("click", () => {
      if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.focus();
        return;
      }
      disableBlock(wrap);
      form.querySelectorAll("input").forEach((i) => (i.disabled = true));
      wrap.appendChild(
        userBubble(
          [nameInput.value.trim(), emailInput.value.trim(), phoneInput.value.trim()].filter(Boolean).join(" · ")
        )
      );
      state.answers.contact_name = nameInput.value.trim();
      state.answers.contact_email = emailInput.value.trim();
      state.answers.contact_phone = phoneInput.value.trim();
      advanceTo(state.stepIndex + 1);
    });
    form.appendChild(submit);

    wrap.appendChild(form);
  }

  // ---- Summary ----
  // Fire-and-forget: the confirmation bubble always shows regardless of
  // whether this succeeds, matching this whole flow's original "no
  // backend, never break the visible confirmation" posture — the
  // difference now is a real notification actually goes out when the
  // network call succeeds, instead of nothing happening at all.
  function submitInstallRequest(a) {
    fetch("/api/install-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: a.company_name || "",
        contactName: a.contact_name || "",
        contactEmail: a.contact_email || "",
        contactPhone: a.contact_phone || "",
        websiteUrl: hasWebsite() ? a.website_url : "",
        planChoice: a.plan_choice || "",
        billingChoice: a.billing_choice || "",
        // WhatsApp is part of every plan now.
        whatsappAddon: true,
        currency: window.DealzCurrency ? window.DealzCurrency.code : "CHF",
        teamSize: a.team_size || "",
        mainProblem: a.main_problem || "",
        requestSources: a.request_sources || "",
        sector: window.DEALZ_SECTOR || "",
      }),
    }).catch((err) => console.error("[install-request] failed to submit:", err));
  }

  function renderSummary() {
    updateProgress();
    setInputMode("off");
    const wrap = el("div", "flow-block");
    container.appendChild(wrap);
    state.blocks[STEPS.length] = wrap;

    wrap.appendChild(assistantBubble("Tout est bon ?"));

    const a = state.answers;
    const card = el("div", "flow-summary-card");
    card.appendChild(el("div", "flow-summary-title", "VOTRE DEMANDE DEALZ"));

    const billingLabel =
      a.billing_choice === "yearly" ? "Annuelle" : a.billing_choice === "onetime" ? "Unique" : "Mensuelle";
    const amountRowLabel = a.billing_choice === "onetime" ? "Paiement" : "Abonnement";
    const amountRowValue =
      a.billing_choice === "yearly"
        ? perYear(a.billing_yearly)
        : a.billing_choice === "onetime"
        ? oneTimeLabel(a.billing_onetime)
        : perMonth(a.billing_monthly);
    const installationValue = a.billing_choice === "monthly" && setupFee() ? fmt(setupFee()) : "OFFERTE";

    const rows = [
      ["Entreprise", a.company_name || "—"],
      ["Formule", a.plan_choice ? planLabel(a.plan_choice) : "—"],
      ["Facturation", billingLabel],
      [amountRowLabel, amountRowValue],
      ["Installation", installationValue],
    ];
    rows.push(["WhatsApp Business", whatsappIncludedValue()]);
    rows.push(["Site", hasWebsite() ? a.website_url : "—"]);
    rows.push(["Votre objectif", a.main_problem || "—"]);
    rows.forEach(([label, value]) => {
      const row = el("div", "flow-summary-row");
      row.appendChild(el("span", "flow-summary-label", label));
      row.appendChild(el("span", "flow-summary-value", value));
      card.appendChild(row);
    });
    wrap.appendChild(card);

    const actions = el("div", "flow-summary-actions");
    // Pay now with Stripe Checkout (src/billing.js). The request is sent
    // first too, so the lead is never lost if the payment is abandoned.
    const payBtn = el("button", "btn btn-primary", "💳 Payer et démarrer");
    payBtn.type = "button";
    payBtn.addEventListener("click", () => startCheckout(a, actions, payBtn));
    actions.appendChild(payBtn);
    const submitBtn = el("button", "btn btn-secondary", "🚀 Demander mon installation Dealz");
    submitBtn.type = "button";
    submitBtn.addEventListener("click", () => {
      actions.querySelectorAll("button").forEach((b) => (b.disabled = true));
      submitInstallRequest(a);
      renderConfirmation();
    });
    const editBtn = el("button", "btn btn-secondary", "Modifier mes réponses");
    editBtn.type = "button";
    editBtn.addEventListener("click", () => goToStep(STEPS.length - 1));
    actions.appendChild(submitBtn);
    actions.appendChild(editBtn);
    wrap.appendChild(actions);

    scrollToBottom(container);
  }

  async function startCheckout(a, actions, payBtn) {
    actions.querySelectorAll("button").forEach((b) => (b.disabled = true));
    payBtn.textContent = T("Redirection vers le paiement sécurisé…");
    submitInstallRequest(a);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: a.plan_choice,
          billing: a.billing_choice,
          currency: window.DealzCurrency ? window.DealzCurrency.code.toLowerCase() : "chf",
          lang: window.DEALZ_LANG || "fr",
          companyName: a.company_name || "",
          contactName: a.contact_name || "",
          contactEmail: a.contact_email || "",
          contactPhone: a.contact_phone || "",
          websiteUrl: hasWebsite() ? a.website_url : "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Paiement indisponible");
      window.location.href = data.url;
    } catch (err) {
      container.appendChild(el("div", "dealz-msg system-decline", T("Le paiement n'a pas pu démarrer — votre demande est bien enregistrée, nous vous recontactons.")));
      scrollToBottom(container);
      payBtn.textContent = T("💳 Payer et démarrer");
    }
  }

  // Back from Stripe Checkout (?checkout=success|cancel on this page).
  function showCheckoutReturn() {
    const status = new URLSearchParams(location.search).get("checkout");
    if (!status || !container) return;
    const ok = status === "success";
    container.appendChild(
      el(
        "div",
        ok ? "dealz-msg system-success" : "dealz-msg system-decline",
        ok
          ? "✅ Paiement reçu, merci ! Bienvenue chez Dealz. Vous recevez la confirmation de Stripe par e-mail, et nous vous contactons très vite pour l'installation."
          : "Paiement annulé — rien n'a été débité. Votre demande est enregistrée : vous pouvez reprendre quand vous voulez."
      )
    );
    scrollToBottom(container);
  }

  function renderConfirmation() {
    const msg = el(
      "div",
      "dealz-msg system-success",
      !hasWebsite()
        ? "Merci ! Votre demande est bien enregistrée. Nous allons préparer l'installation de Dealz sur WhatsApp et revenir vers vous pour connecter votre numéro WhatsApp Business. Vous recevrez votre récapitulatif par e-mail."
        : "Merci ! Votre demande est bien enregistrée. Nous allons examiner votre site et votre configuration afin de préparer l'installation de Dealz. Vous recevrez votre récapitulatif par e-mail."
    );
    container.appendChild(msg);
    scrollToBottom(container);
    progressEl.textContent = T("Demande envoyée ✓");
  }

  // ---- text/url step rendering ----
  function renderTextStep(wrap, step) {
    setInputMode("text", step.placeholder);
    const handler = {
      onSubmit: (value) => {
        let stored = value;
        if (step.kind === "url") {
          let v = value.trim();
          if (!/^https?:\/\//i.test(v)) v = "https://" + v;
          if (!/^https?:\/\/[^\s]+\.[^\s]{2,}/i.test(v)) {
            wrap.appendChild(assistantBubble("Hmm, cette adresse ne ressemble pas tout à fait à une URL — vous pouvez réessayer ?"));
            scrollToBottom(container);
            pendingText = handler; // re-arm — the failed attempt must not brick the input
            return;
          }
          stored = v;
        }
        wrap.appendChild(userBubble(stored));
        state.answers[step.id] = stored;
        setInputMode("off");
        advanceTo(state.stepIndex + 1);
      },
    };
    pendingText = handler;

    // Optional step (website): a chip to answer "none" instead of typing.
    if (step.skipLabel) {
      const picker = el("div", "dop-chips flow-chips");
      const skip = el("button", "dop-chip", step.skipLabel);
      skip.type = "button";
      skip.addEventListener("click", () => {
        if (pendingText !== handler) return;
        pendingText = null;
        disableBlock(wrap);
        wrap.appendChild(userBubble(step.skipLabel));
        state.answers[step.id] = NO_WEBSITE;
        setInputMode("off");
        advanceTo(state.stepIndex + 1);
      });
      picker.appendChild(skip);
      wrap.appendChild(picker);
    }
  }

  // The price picker already told us the plan / billing / WhatsApp choice:
  // show it as the visitor's answer and move on.
  function answerFromPick(wrap, step) {
    if (step.kind === "plan" && pickFor("plan")) {
      pickUsed.plan = true;
      const key = window.DEALZ_PICK.plan;
      wrap.appendChild(userBubble(planLabel(key)));
      state.answers.plan_choice = key;
      advanceTo(state.stepIndex + 1);
      return true;
    }
    if (step.kind === "billing" && pickFor("billing")) {
      pickUsed.billing = true;
      const plan = state.answers.plan_choice || "CAPTURE";
      chooseBilling(wrap, window.DEALZ_PICK.billing, monthlyOf(plan), yearlyOf(plan), onceOf(plan));
      return true;
    }
    return false;
  }

  function renderStep(index) {
    started = true;
    updateProgress();
    if (index >= STEPS.length) return renderSummary();
    const step = STEPS[index];

    const wrap = el("div", "flow-block");
    container.appendChild(wrap);
    state.blocks[index] = wrap;

    wrap.appendChild(assistantBubble(step.question));
    if (answerFromPick(wrap, step)) return;

    if (step.kind === "text" || step.kind === "url") {
      renderTextStep(wrap, step);
    } else if (step.kind === "single" || step.kind === "multi") {
      renderChipsInto(wrap, step);
    } else if (step.kind === "plan") {
      renderPlanChoice(wrap);
    } else if (step.kind === "billing") {
      renderBillingChoice(wrap);
    } else if (step.kind === "contact_form") {
      renderContactFields(wrap);
    }

    backLink(wrap);
    scrollToBottom(container);
  }

  // "I'm Dealz, let's find your plan" — or, once the price picker has a choice,
  // a line that says we already know it.
  function introText() {
    const pick = window.DEALZ_PICK;
    if (!pick || !PLANS[pick.plan]) return T("👋 Bonjour ! Je suis Dealz. Je peux vous aider à voir quelle formule correspond le mieux à votre entreprise. On commence ?");
    const lang = window.DEALZ_LANG;
    const what = pick.plan;
    if (lang === "en") return `👋 Hi! I'm Dealz. You picked ${what}: a few quick questions and your request is ready. Shall we get started?`;
    if (lang === "de") return `👋 Hallo! Ich bin Dealz. Sie haben ${what} gewählt: ein paar kurze Fragen, dann ist Ihre Anfrage bereit. Fangen wir an?`;
    return `👋 Bonjour ! Je suis Dealz. Vous avez choisi ${what} : quelques questions rapides et votre demande est prête. On commence ?`;
  }
  let introBubble = null;

  function renderIntro() {
    introBubble = assistantBubble(introText());
    container.appendChild(introBubble);
    const startBtn = el("button", "btn btn-primary", "Oui, allons-y →");
    startBtn.type = "button";
    const wrap = el("div", "flow-block");
    wrap.appendChild(startBtn);
    container.appendChild(wrap);
    startBtn.addEventListener("click", () => {
      startBtn.disabled = true;
      advanceTo(0);
    });
    setInputMode("off");
    scrollToBottom(container);
    window.addEventListener("dealz-pick", () => {
      if (!started && introBubble) introBubble.textContent = introText();
    });
  }

  function submitPendingText() {
    const value = input.value.trim();
    if (!value || !pendingText) return;
    const handler = pendingText;
    pendingText = null;
    handler.onSubmit(value);
    input.value = "";
  }

  function init() {
    container = document.getElementById("contact-messages");
    input = document.getElementById("contact-input");
    sendBtn = document.getElementById("contact-send");
    progressEl = document.getElementById("contact-progress");
    if (!container || !input || !sendBtn) return;

    sendBtn.addEventListener("click", submitPendingText);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitPendingText();
    });

    showCheckoutReturn();
    renderIntro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
