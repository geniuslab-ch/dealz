/**
 * The onboarding form (docs/integration.html, /en/…, /de/…): everything
 * Dealz needs to set a new client up, asked once, step by step, with a
 * progress bar. The client gets the link by e-mail right after paying
 * (src/billing.js → src/onboarding.js). With ?s=<Stripe Checkout Session>
 * the answers already known (company, contact, plan, website, currency)
 * are filled in; without it, the form works on its own.
 *
 * Answers are kept on this device as the client types (localStorage), so
 * closing the page loses nothing. Sent to POST /api/onboarding.
 */
(function () {
  const LANG = ["en", "de"].includes(window.DEALZ_LANG) ? window.DEALZ_LANG : "fr";
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[LANG] || o.fr);
  const t = (fr, en, de) => ({ fr, en, de });
  const SESSION = new URLSearchParams(location.search).get("s") || "";
  const DRAFT_KEY = "dealz-onboarding:" + (SESSION || "open");

  const UI = {
    start: t("Commencer", "Start", "Starten"),
    next: t("Continuer", "Continue", "Weiter"),
    back: t("Retour", "Back", "Zurück"),
    send: t("Envoyer mes réponses", "Send my answers", "Antworten senden"),
    sending: t("Envoi…", "Sending…", "Wird gesendet…"),
    step: t("Étape {i} sur {n}", "Step {i} of {n}", "Schritt {i} von {n}"),
    required: t("Merci de remplir les champs marqués d'un astérisque.", "Please fill in the fields marked with an asterisk.", "Bitte füllen Sie die mit einem Sternchen markierten Felder aus."),
    badEmail: t("Cette adresse e-mail ne semble pas valide.", "This email address does not look valid.", "Diese E-Mail-Adresse scheint ungültig zu sein."),
    error: t("Une erreur est survenue. Vos réponses sont gardées : réessayez dans un instant.", "Something went wrong. Your answers are saved: please try again in a moment.", "Etwas ist schiefgelaufen. Ihre Antworten sind gespeichert: Bitte versuchen Sie es gleich nochmals."),
    other: t("Précisez…", "Please specify…", "Bitte präzisieren…"),
    optional: t("facultatif", "optional", "optional"),
    recapTitle: t("Récapitulatif", "Summary", "Zusammenfassung"),
    recapIntro: t("Relisez vos réponses. Vous pouvez revenir à une étape pour corriger.", "Check your answers. You can go back to any step to correct them.", "Prüfen Sie Ihre Antworten. Sie können zu jedem Schritt zurückkehren."),
    edit: t("Modifier", "Edit", "Ändern"),
    saved: t("Enregistré sur cet appareil", "Saved on this device", "Auf diesem Gerät gespeichert"),
    doneTitle: t("Merci, c'est reçu !", "Thank you, we have it!", "Danke, alles erhalten!"),
    doneText: t(
      "Nous préparons votre Dealz avec ces informations et revenons vers vous très vite pour la réunion de 30 minutes. Une copie vous est envoyée par e-mail.",
      "We are preparing your Dealz with this information and will come back to you very soon for the 30-minute meeting. A copy is on its way to your inbox.",
      "Wir richten Ihr Dealz mit diesen Angaben ein und melden uns sehr bald für das 30-minütige Gespräch. Eine Kopie erhalten Sie per E-Mail."
    ),
    empty: "—",
  };

  const OTHER = { id: "other", label: t("Autre", "Other", "Andere"), other: true };
  const isPlan = (a, ...plans) => plans.includes(a.plan);
  const noSite = (a) => a.integration === "nosite";

  // ---- the questions ----
  const STEPS = [
    {
      id: "company",
      title: t("Votre entreprise", "Your company", "Ihr Unternehmen"),
      fields: [
        { id: "company", type: "text", required: true, label: t("Nom de l'entreprise, tel qu'il doit apparaître sur les devis", "Company name, as it should appear on quotes", "Firmenname, wie er auf den Offerten erscheinen soll") },
        { id: "contact_name", type: "text", required: true, label: t("Votre nom", "Your name", "Ihr Name") },
        { id: "contact_email", type: "email", required: true, label: t("Votre e-mail", "Your email", "Ihre E-Mail") },
        { id: "contact_phone", type: "tel", label: t("Votre téléphone", "Your phone", "Ihre Telefonnummer") },
        { id: "alert_emails", type: "text", label: t("E-mail(s) qui reçoivent les alertes de devis acceptés ou refusés", "Email(s) that receive alerts for accepted or declined quotes", "E-Mail(s), die Benachrichtigungen zu angenommenen oder abgelehnten Offerten erhalten"), hint: t("Séparés par une virgule. Vide = votre e-mail.", "Comma-separated. Empty = your email.", "Durch Komma getrennt. Leer = Ihre E-Mail.") },
        { id: "decision_maker", type: "text", label: t("Qui d'autre doit valider les prix ou les messages ?", "Who else needs to approve prices or messages?", "Wer muss Preise oder Nachrichten sonst noch freigeben?"), hint: t("Nom et rôle, si ce n'est pas seulement vous.", "Name and role, if not only you.", "Name und Funktion, falls nicht nur Sie.") },
        {
          id: "plan", type: "single", required: true, label: t("Votre formule", "Your plan", "Ihr Paket"),
          options: [
            { id: "CAPTURE", label: "CAPTURE" },
            { id: "CLOSE", label: "CLOSE" },
            { id: "SCALE", label: "SCALE" },
            { id: "unknown", label: t("Je ne sais plus", "Not sure", "Weiss ich nicht mehr") },
          ],
        },
      ],
    },
    {
      id: "customers",
      title: t("Votre activité et vos clients", "Your business and customers", "Ihre Tätigkeit und Ihre Kunden"),
      fields: [
        { id: "sector", type: "select", required: true, label: t("Votre secteur", "Your sector", "Ihre Branche"), optionsFrom: "sectors", withOther: true },
        {
          id: "currency", type: "single", required: true, label: t("Devise de vos prix", "Currency of your prices", "Währung Ihrer Preise"),
          options: ["CHF", "EUR", "GBP", "USD"].map((c) => ({ id: c, label: c })),
        },
        {
          id: "customer_langs", type: "multi", required: true, label: t("Langues de vos clients", "Your customers' languages", "Sprachen Ihrer Kunden"),
          options: [
            { id: "fr", label: t("Français", "French", "Französisch") },
            { id: "de", label: t("Allemand", "German", "Deutsch") },
            { id: "it", label: t("Italien", "Italian", "Italienisch") },
            { id: "en", label: t("Anglais", "English", "Englisch") },
            OTHER,
          ],
        },
        {
          id: "address_form", type: "single", label: t("Comment s'adresser à vos clients ?", "How should we address your customers?", "Wie sollen Ihre Kunden angesprochen werden?"),
          options: [
            { id: "formal", label: t("Vouvoiement", "Formal", "Sie (formell)") },
            { id: "informal", label: t("Tutoiement", "Informal, first name", "Du (informell)") },
          ],
        },
        {
          id: "request_volume", type: "single", label: t("Combien de demandes de devis recevez-vous par mois ?", "How many quote requests do you get per month?", "Wie viele Offertanfragen erhalten Sie pro Monat?"),
          options: [
            { id: "lt20", label: t("Moins de 20", "Fewer than 20", "Weniger als 20") },
            { id: "20-50", label: "20–50" },
            { id: "50-150", label: "50–150" },
            { id: "gt150", label: t("Plus de 150", "More than 150", "Mehr als 150") },
          ],
        },
      ],
    },
    {
      id: "services",
      title: t("Vos prestations", "Your services", "Ihre Leistungen"),
      intro: t("Commencez par les 2 ou 3 prestations les plus demandées : on pourra ajouter les autres après le lancement.", "Start with your 2 or 3 most requested services: the others can be added after launch.", "Beginnen Sie mit den 2 oder 3 meistgefragten Leistungen: Weitere können nach dem Start ergänzt werden."),
      fields: [
        { id: "services", type: "textarea", required: true, label: t("Prestations que Dealz doit chiffrer", "Services Dealz should quote", "Leistungen, die Dealz offerieren soll"), hint: t("Une par ligne, les plus demandées d'abord.", "One per line, most requested first.", "Eine pro Zeile, die gefragtesten zuerst.") },
        { id: "excluded", type: "textarea", label: t("Prestations que Dealz ne doit jamais chiffrer", "Services Dealz should never quote", "Leistungen, die Dealz nie offerieren soll"), hint: t("Par exemple celles qui demandent toujours une visite.", "For example those that always need a site visit.", "Zum Beispiel solche, die immer eine Besichtigung brauchen.") },
      ],
    },
    {
      id: "prices",
      title: t("Vos prix", "Your prices", "Ihre Preise"),
      intro: t("C'est l'étape la plus importante : c'est ce qui rend vos devis Dealz justes.", "This is the most important step: it is what makes your Dealz quotes accurate.", "Das ist der wichtigste Schritt: Er macht Ihre Dealz-Offerten genau."),
      fields: [
        {
          id: "pricing_method", type: "multi", required: true, label: t("Comment calculez-vous vos prix ?", "How do you calculate your prices?", "Wie berechnen Sie Ihre Preise?"),
          options: [
            { id: "m2", label: t("Au m²", "Per m² / sq ft", "Pro m²") },
            { id: "hour", label: t("À l'heure", "Per hour", "Pro Stunde") },
            { id: "unit", label: t("À la pièce ou à l'unité", "Per room or unit", "Pro Zimmer oder Einheit") },
            { id: "flat", label: t("Au forfait", "Flat rate", "Pauschal") },
            OTHER,
          ],
        },
        { id: "price_list", type: "textarea", required: true, rows: 6, label: t("Vos tarifs", "Your rates", "Ihre Tarife"), hint: t("Collez votre grille ou décrivez vos prix. Exemple : « Nettoyage fin de bail 3,5 pièces : 430 ».", "Paste your price list or describe your prices. Example: \"End-of-tenancy cleaning, 2-bed flat: 380\".", "Fügen Sie Ihre Preisliste ein oder beschreiben Sie Ihre Preise. Beispiel: «Endreinigung 3,5 Zimmer: 430».") },
        { id: "price_link", type: "url", label: t("Lien vers votre grille ou un ancien devis", "Link to your price list or a past quote", "Link zu Ihrer Preisliste oder einer früheren Offerte"), hint: t("Google Drive, Dropbox… ou envoyez-le à info@dealz.website.", "Google Drive, Dropbox… or send it to info@dealz.website.", "Google Drive, Dropbox… oder senden Sie es an info@dealz.website.") },
        { id: "minimum", type: "number", required: true, label: t("Prix minimum d'une intervention", "Minimum price for a job", "Mindestpreis pro Auftrag"), hint: t("En dessous, vous ne vous déplacez pas.", "Below this, you don't take the job.", "Darunter nehmen Sie den Auftrag nicht an.") },
        { id: "options", type: "textarea", label: t("Options et suppléments, avec leur prix", "Add-ons and extras, with their price", "Optionen und Zuschläge, mit Preis"), hint: t("Exemple : « Four : 40 · Vitres : 60 ».", "Example: \"Oven: 40 · Windows: 60\".", "Beispiel: «Backofen: 40 · Fenster: 60».") },
        {
          id: "surcharges", type: "multi", label: t("Majorations que vous appliquez", "Surcharges you apply", "Zuschläge, die Sie verrechnen"),
          options: [
            { id: "condition", label: t("État (très sale, encombré…)", "Condition (very dirty, cluttered…)", "Zustand (sehr schmutzig, vollgestellt…)") },
            { id: "access", label: t("Accès difficile", "Difficult access", "Schwieriger Zugang") },
            { id: "floor", label: t("Étage sans ascenseur", "Floor without lift", "Stockwerk ohne Lift") },
            { id: "urgent", label: t("Urgence", "Urgent job", "Dringend") },
            { id: "evening", label: t("Soir ou week-end", "Evening or weekend", "Abend oder Wochenende") },
            { id: "none", label: t("Aucune", "None", "Keine"), exclusive: true },
          ],
        },
        { id: "surcharges_detail", type: "textarea", label: t("Montant de chaque majoration", "Amount of each surcharge", "Höhe jedes Zuschlags"), show: (a) => (a.surcharges || []).some((x) => x !== "none") },
        {
          id: "vat", type: "single", required: true, label: t("Vos prix sont…", "Your prices are…", "Ihre Preise sind…"),
          options: [
            { id: "incl", label: t("TVA comprise (TTC)", "Tax included", "inkl. MWST") },
            { id: "excl", label: t("Hors TVA (HT)", "Excluding tax", "exkl. MWST") },
            { id: "none", label: t("Non assujetti à la TVA", "Not subject to tax", "Nicht MWST-pflichtig") },
          ],
        },
        { id: "vat_rate", type: "text", label: t("Taux de TVA appliqué", "Tax rate applied", "Angewandter MWST-Satz"), show: (a) => a.vat === "excl" },
        { id: "accuracy", type: "check", required: true, label: t("J'accepte que les devis Dealz soient fermes si les réponses du client sont exactes, et ajustables si la situation sur place est différente.", "I agree that Dealz quotes are firm if the customer's answers are accurate, and may be adjusted if the situation on site differs.", "Ich bin einverstanden, dass Dealz-Offerten verbindlich sind, wenn die Angaben des Kunden stimmen, und angepasst werden können, wenn die Situation vor Ort abweicht.") },
      ],
    },
    {
      id: "zone",
      title: t("Zone et disponibilités", "Area and availability", "Gebiet und Verfügbarkeit"),
      fields: [
        { id: "zone", type: "textarea", required: true, label: t("Zone couverte", "Area covered", "Einsatzgebiet"), hint: t("Villes, codes postaux, ou un rayon en km autour de votre adresse.", "Towns, postcodes, or a radius in km/miles around your address.", "Orte, Postleitzahlen oder ein Umkreis in km um Ihre Adresse.") },
        { id: "free_km", type: "number", label: t("Déplacement gratuit jusqu'à (km)", "Free travel up to (km/miles)", "Anfahrt gratis bis (km)") },
        { id: "travel_fee", type: "text", label: t("Frais de déplacement au-delà", "Travel fee beyond that", "Anfahrtskosten darüber hinaus"), hint: t("Exemple : « 30 jusqu'à 40 km, puis 60 ».", "Example: \"30 up to 25 miles, then 60\".", "Beispiel: «30 bis 40 km, danach 60».") },
        {
          id: "lead_time", type: "single", required: true, label: t("Délai minimum entre la demande et l'intervention", "Minimum notice between request and job", "Mindestvorlauf zwischen Anfrage und Einsatz"),
          options: [
            { id: "24h", label: "24 h" },
            { id: "48h", label: "48 h" },
            { id: "1w", label: t("1 semaine", "1 week", "1 Woche") },
            OTHER,
          ],
        },
        {
          id: "days", type: "multi", required: true, label: t("Jours de travail", "Working days", "Arbeitstage"),
          options: [
            t("Lun", "Mon", "Mo"), t("Mar", "Tue", "Di"), t("Mer", "Wed", "Mi"), t("Jeu", "Thu", "Do"),
            t("Ven", "Fri", "Fr"), t("Sam", "Sat", "Sa"), t("Dim", "Sun", "So"),
          ].map((label, i) => ({ id: "d" + (i + 1), label })),
        },
        { id: "hours", type: "text", label: t("Horaires", "Hours", "Arbeitszeiten"), hint: t("Exemple : « 7h30–18h ».", "Example: \"7:30am–6pm\".", "Beispiel: «7.30–18 Uhr».") },
        { id: "closures", type: "text", label: t("Fermetures prévues", "Planned closures", "Geplante Schliessungen"), hint: t("Vacances, jours fériés…", "Holidays…", "Ferien, Feiertage…") },
      ],
    },
    {
      id: "after",
      title: t("Après le devis", "After the quote", "Nach der Offerte"),
      fields: [
        {
          id: "confirmation", type: "single", required: true, label: t("Quand un client accepte le devis…", "When a customer accepts the quote…", "Wenn ein Kunde die Offerte annimmt…"),
          options: [
            { id: "auto", label: t("La date est bloquée directement", "The date is booked right away", "Der Termin wird direkt gebucht") },
            { id: "call", label: t("Je rappelle le client avant de bloquer la date", "I call the customer before booking the date", "Ich rufe den Kunden an, bevor der Termin gebucht wird") },
          ],
        },
        {
          id: "deposit", type: "single", label: t("Demandez-vous un acompte ?", "Do you ask for a deposit?", "Verlangen Sie eine Anzahlung?"),
          options: [
            { id: "no", label: t("Non", "No", "Nein") },
            { id: "yes", label: t("Oui", "Yes", "Ja") },
          ],
        },
        { id: "deposit_detail", type: "text", label: t("Montant ou pourcentage de l'acompte", "Deposit amount or percentage", "Betrag oder Prozentsatz der Anzahlung"), show: (a) => a.deposit === "yes" },
        { id: "max_discount", type: "text", label: t("Quand un client refuse, jusqu'à quelle remise pouvez-vous aller ?", "When a customer declines, how much discount can you offer?", "Wenn ein Kunde ablehnt: Wie viel Rabatt können Sie gewähren?"), hint: t("Exemple : « 10 % maximum ».", "Example: \"10% maximum\".", "Beispiel: «maximal 10 %».") , show: (a) => isPlan(a, "CLOSE", "SCALE", "unknown") },
        { id: "never_concede", type: "text", label: t("Ce sur quoi vous ne cédez jamais", "What you never give in on", "Worauf Sie nie verzichten"), show: (a) => isPlan(a, "CLOSE", "SCALE", "unknown") },
        { id: "teams", type: "textarea", label: t("Vos équipes : nom, membres et zones couvertes", "Your teams: name, members and areas covered", "Ihre Teams: Name, Mitglieder und Gebiete"), show: (a) => isPlan(a, "SCALE") },
        { id: "max_jobs", type: "number", label: t("Nombre maximum d'interventions par personne et par jour", "Maximum jobs per person per day", "Maximale Einsätze pro Person und Tag"), show: (a) => isPlan(a, "SCALE") },
      ],
    },
    {
      id: "channels",
      title: t("WhatsApp et votre site", "WhatsApp and your website", "WhatsApp und Ihre Website"),
      fields: [
        {
          id: "wa_status", type: "single", required: true, label: t("Votre numéro WhatsApp professionnel", "Your business WhatsApp number", "Ihre geschäftliche WhatsApp-Nummer"),
          options: [
            { id: "business", label: t("Il est déjà sur WhatsApp Business", "It is already on WhatsApp Business", "Sie ist bereits auf WhatsApp Business") },
            { id: "personal", label: t("Il est sur WhatsApp normal (téléphone perso)", "It is on regular WhatsApp (personal phone)", "Sie ist auf normalem WhatsApp (privates Handy)") },
            { id: "none", label: t("Je n'ai pas encore WhatsApp", "I'm not on WhatsApp yet", "Ich habe noch kein WhatsApp") },
            { id: "new", label: t("Je veux un nouveau numéro", "I want a new number", "Ich möchte eine neue Nummer") },
          ],
        },
        { id: "wa_number", type: "tel", required: true, label: t("Numéro WhatsApp que vos clients doivent écrire", "WhatsApp number your customers should message", "WhatsApp-Nummer, an die Ihre Kunden schreiben sollen"), show: (a) => a.wa_status === "business" || a.wa_status === "personal" },
        {
          id: "integration", type: "single", required: true, label: t("Sur votre site, vous voulez…", "On your website, you want…", "Auf Ihrer Website möchten Sie…"),
          options: [
            { id: "wa", label: t("Le bouton WhatsApp seul", "The WhatsApp button only", "Nur den WhatsApp-Button") },
            { id: "wa_widget", label: t("Le bouton WhatsApp + un widget de devis pour les clients sans WhatsApp", "The WhatsApp button + a quote widget for customers without WhatsApp", "Den WhatsApp-Button + ein Offerten-Widget für Kunden ohne WhatsApp") },
            { id: "nosite", label: t("Je n'ai pas de site", "I don't have a website", "Ich habe keine Website") },
          ],
        },
        { id: "website", type: "url", required: true, label: t("Adresse de votre site", "Your website address", "Adresse Ihrer Website"), show: (a) => !noSite(a) },
        {
          id: "site_manager", type: "single", label: t("Qui gère votre site ?", "Who manages your website?", "Wer betreut Ihre Website?"), show: (a) => !noSite(a), withOther: true,
          options: [
            { id: "me", label: t("Moi", "Me", "Ich") },
            { id: "agency", label: t("Une agence", "An agency", "Eine Agentur") },
            { id: "wix", label: "Wix" },
            { id: "wordpress", label: "WordPress" },
            { id: "shopify", label: "Shopify" },
            { id: "squarespace", label: "Squarespace" },
          ],
        },
        { id: "logo_link", type: "url", label: t("Lien vers votre logo (PNG)", "Link to your logo (PNG)", "Link zu Ihrem Logo (PNG)"), hint: t("Ou envoyez-le à info@dealz.website.", "Or send it to info@dealz.website.", "Oder senden Sie es an info@dealz.website.") },
        { id: "brand_color", type: "color", label: t("Votre couleur principale", "Your main colour", "Ihre Hauptfarbe") },
        { id: "signature", type: "textarea", label: t("Signature en bas de vos devis", "Signature at the bottom of your quotes", "Signatur unter Ihren Offerten"), hint: t("Nom, adresse, téléphone, site…", "Name, address, phone, website…", "Name, Adresse, Telefon, Website…") },
      ],
    },
    {
      id: "finish",
      title: t("Pour finir", "To finish", "Zum Schluss"),
      fields: [
        { id: "success", type: "textarea", label: t("Dans un mois, qu'est-ce qui vous ferait dire que Dealz vaut le coup ?", "In a month, what would make you say Dealz was worth it?", "Was müsste in einem Monat passiert sein, damit sich Dealz für Sie gelohnt hat?") },
        { id: "availability", type: "textarea", required: true, label: t("Vos disponibilités pour la réunion de 30 minutes", "Your availability for the 30-minute meeting", "Ihre Verfügbarkeit für das 30-minütige Gespräch"), hint: t("Exemple : « mardi ou jeudi matin ».", "Example: \"Tuesday or Thursday morning\".", "Beispiel: «Dienstag oder Donnerstag Vormittag».") },
        { id: "notes", type: "textarea", label: t("Autre chose à nous dire ?", "Anything else we should know?", "Möchten Sie uns sonst noch etwas sagen?") },
      ],
    },
  ];

  // ---- state ----
  let answers = {};
  let stepIndex = -1; // -1 = welcome, STEPS.length = recap
  let sectors = [];
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (saved && saved.answers) answers = saved.answers;
  } catch (e) {}
  function save() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, at: Date.now() })); } catch (e) {}
  }

  const root = document.getElementById("onboarding");
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const visible = (f) => !f.show || f.show(answers);
  function optionsOf(f) {
    let opts = f.optionsFrom === "sectors" ? sectors : f.options || [];
    if (f.withOther && !opts.some((o) => o.other)) opts = opts.concat([OTHER]);
    return opts;
  }
  function isEmpty(v) {
    return v == null || v === "" || v === false || (Array.isArray(v) && v.length === 0);
  }
  function needsOther(f) {
    const v = answers[f.id];
    return Array.isArray(v) ? v.includes("other") : v === "other";
  }

  // Human-readable answer, in the given language (FR for the Dealz team).
  function display(f, lang) {
    const v = answers[f.id];
    const pick = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] || o.fr);
    if (f.type === "check") return v ? pick(t("Oui", "Yes", "Ja")) : "";
    if (f.type === "single" || f.type === "multi" || f.type === "select") {
      const ids = Array.isArray(v) ? v : v ? [v] : [];
      const opts = optionsOf(f);
      return ids
        .map((id) => {
          if (id === "other") return pick(OTHER.label) + (answers[f.id + "_other"] ? " : " + answers[f.id + "_other"] : "");
          const o = opts.find((x) => x.id === id);
          return o ? pick(o.label) : id;
        })
        .join(", ");
    }
    return v == null ? "" : String(v);
  }

  // ---- rendering ----
  function header() {
    const head = el("div", "onb-head");
    const total = STEPS.length;
    const i = Math.min(stepIndex + 1, total);
    const label = stepIndex >= STEPS.length ? L(UI.recapTitle) : L(UI.step).replace("{i}", i).replace("{n}", total) + " · " + L(STEPS[stepIndex].title);
    head.appendChild(el("div", "onb-progress-label", label));
    const bar = el("div", "onb-progress");
    const fill = el("div", "onb-progress-fill");
    fill.style.width = Math.round((stepIndex >= STEPS.length ? 1 : stepIndex / total) * 100) + "%";
    bar.appendChild(fill);
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(total));
    bar.setAttribute("aria-valuenow", String(Math.min(stepIndex, total)));
    head.appendChild(bar);
    return head;
  }

  function fieldLabel(f) {
    const lab = el("label", "onb-label");
    lab.textContent = L(f.label);
    if (f.required) lab.appendChild(el("span", "onb-req", " *"));
    return lab;
  }

  function renderField(f) {
    const wrap = el("div", "onb-field");
    wrap.dataset.field = f.id;
    const inputId = "onb-" + f.id;

    if (f.type === "check") {
      const lab = el("label", "onb-check");
      const box = el("input");
      box.type = "checkbox";
      box.checked = !!answers[f.id];
      box.addEventListener("change", () => { answers[f.id] = box.checked; save(); });
      lab.appendChild(box);
      const span = el("span", null, L(f.label));
      if (f.required) span.appendChild(el("span", "onb-req", " *"));
      lab.appendChild(span);
      wrap.appendChild(lab);
      return wrap;
    }

    const lab = fieldLabel(f);
    lab.htmlFor = inputId;
    wrap.appendChild(lab);
    if (f.hint) wrap.appendChild(el("div", "onb-hint", L(f.hint)));

    if (f.type === "single" || f.type === "multi") {
      const chips = el("div", "dop-chips onb-chips");
      chips.setAttribute("role", f.type === "single" ? "radiogroup" : "group");
      const otherInput = el("input", "dcf-input onb-other");
      otherInput.placeholder = L(UI.other);
      otherInput.value = answers[f.id + "_other"] || "";
      otherInput.addEventListener("input", () => { answers[f.id + "_other"] = otherInput.value; save(); });
      const sync = () => {
        const v = answers[f.id];
        chips.querySelectorAll("button").forEach((b) => {
          const on = Array.isArray(v) ? v.includes(b.dataset.id) : v === b.dataset.id;
          b.classList.toggle("selected", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        otherInput.style.display = needsOther(f) ? "" : "none";
      };
      optionsOf(f).forEach((o) => {
        const b = el("button", "dop-chip", L(o.label));
        b.type = "button";
        b.dataset.id = o.id;
        b.addEventListener("click", () => {
          if (f.type === "single") {
            answers[f.id] = o.id;
          } else {
            let v = Array.isArray(answers[f.id]) ? answers[f.id].slice() : [];
            if (v.includes(o.id)) v = v.filter((x) => x !== o.id);
            else if (o.exclusive) v = [o.id];
            else v = v.filter((x) => !optionsOf(f).some((p) => p.exclusive && p.id === x)).concat(o.id);
            answers[f.id] = v;
          }
          save();
          sync();
          refreshConditional();
          if (needsOther(f) && o.other) otherInput.focus();
        });
        chips.appendChild(b);
      });
      wrap.appendChild(chips);
      wrap.appendChild(otherInput);
      sync();
      return wrap;
    }

    // A long list (sectors): a dropdown instead of chips.
    if (f.type === "select") {
      const sel = el("select", "dcf-input onb-select");
      sel.id = inputId;
      const ph = el("option", null, L(t("Choisissez…", "Choose…", "Bitte wählen…")));
      ph.value = "";
      sel.appendChild(ph);
      optionsOf(f).forEach((o) => {
        const opt = el("option", null, L(o.label));
        opt.value = o.id;
        sel.appendChild(opt);
      });
      sel.value = answers[f.id] || "";
      const otherInput = el("input", "dcf-input onb-other");
      otherInput.placeholder = L(UI.other);
      otherInput.value = answers[f.id + "_other"] || "";
      otherInput.addEventListener("input", () => { answers[f.id + "_other"] = otherInput.value; save(); });
      const sync = () => { otherInput.style.display = needsOther(f) ? "" : "none"; };
      sel.addEventListener("change", () => { answers[f.id] = sel.value; save(); sync(); if (needsOther(f)) otherInput.focus(); });
      wrap.appendChild(sel);
      wrap.appendChild(otherInput);
      sync();
      return wrap;
    }

    let input;
    if (f.type === "textarea") {
      input = el("textarea", "dcf-input onb-textarea");
      input.rows = f.rows || 3;
    } else {
      input = el("input", "dcf-input");
      input.type = f.type === "number" ? "number" : f.type === "color" ? "color" : f.type;
      if (f.type === "number") { input.min = "0"; input.step = "any"; input.inputMode = "decimal"; }
      if (f.type === "url") input.placeholder = "https://";
      if (f.type === "email") input.autocomplete = "email";
      if (f.type === "tel") input.autocomplete = "tel";
      if (f.type === "color") input.className = "onb-color";
    }
    input.id = inputId;
    if (f.type === "color") input.value = answers[f.id] || "#0b5fff";
    else input.value = answers[f.id] || "";
    input.addEventListener("input", () => { answers[f.id] = input.value; save(); });
    if (f.type === "color" && !answers[f.id]) answers[f.id] = "";
    wrap.appendChild(input);
    return wrap;
  }

  let currentFields = null;
  function refreshConditional() {
    if (!currentFields) return;
    STEPS[stepIndex].fields.forEach((f) => {
      const node = currentFields.querySelector(`[data-field="${f.id}"]`);
      if (node) node.style.display = visible(f) ? "" : "none";
    });
  }

  function navButtons(onNext, nextLabel) {
    const nav = el("div", "onb-nav");
    if (stepIndex >= 0) {
      const back = el("button", "onb-back", "← " + L(UI.back));
      back.type = "button";
      back.addEventListener("click", () => go(stepIndex - 1));
      nav.appendChild(back);
    }
    const next = el("button", "dcf-submit onb-next", nextLabel + " →");
    next.type = "button";
    next.addEventListener("click", onNext);
    nav.appendChild(next);
    return nav;
  }

  function msgBox() {
    const m = el("p", "dlg-msg");
    m.setAttribute("aria-live", "polite");
    return m;
  }
  function showMsg(m, text, isError) {
    m.textContent = text;
    m.className = "dlg-msg show" + (isError ? " err" : " ok");
  }

  function validate(step) {
    for (const f of step.fields) {
      if (!visible(f)) continue;
      const v = answers[f.id];
      if (f.required && (isEmpty(v) || (needsOther(f) && !String(answers[f.id + "_other"] || "").trim()))) return { field: f.id, msg: L(UI.required) };
      if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())) return { field: f.id, msg: L(UI.badEmail) };
    }
    return null;
  }

  function go(i) {
    stepIndex = Math.max(-1, Math.min(i, STEPS.length));
    render();
    const top = root.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }

  function renderWelcome(body) {
    body.appendChild(el("h2", "onb-title", L(t("Préparons votre Dealz", "Let's prepare your Dealz", "Bereiten wir Ihr Dealz vor"))));
    body.appendChild(el("p", "onb-intro", L(t(
      "8 étapes courtes, environ 10 minutes. Avec vos réponses, notre réunion d'intégration tient en 30 minutes et votre Dealz est prêt plus vite.",
      "8 short steps, about 10 minutes. With your answers, our onboarding meeting takes only 30 minutes and your Dealz is ready sooner.",
      "8 kurze Schritte, etwa 10 Minuten. Mit Ihren Antworten dauert unser Einführungsgespräch nur 30 Minuten und Ihr Dealz ist schneller bereit."
    ))));
    const list = el("ul", "onb-list");
    [
      t("Gardez vos prix sous la main (grille, ancien devis).", "Keep your prices at hand (price list, a past quote).", "Halten Sie Ihre Preise bereit (Preisliste, frühere Offerte)."),
      t("Vos réponses sont enregistrées sur cet appareil : vous pouvez reprendre plus tard.", "Your answers are saved on this device: you can come back later.", "Ihre Antworten werden auf diesem Gerät gespeichert: Sie können später weitermachen."),
      t("Pas sûr d'une réponse ? Laissez vide, on en parlera en réunion.", "Not sure about an answer? Leave it blank, we'll cover it in the meeting.", "Unsicher bei einer Antwort? Leer lassen, wir besprechen es im Gespräch."),
    ].forEach((x) => list.appendChild(el("li", null, L(x))));
    body.appendChild(list);
    body.appendChild(navButtons(() => go(0), L(UI.start)));
  }

  function renderStep(body) {
    const step = STEPS[stepIndex];
    body.appendChild(el("h2", "onb-title", L(step.title)));
    if (step.intro) body.appendChild(el("p", "onb-intro", L(step.intro)));
    const fields = el("div", "onb-fields");
    step.fields.forEach((f) => fields.appendChild(renderField(f)));
    currentFields = fields;
    body.appendChild(fields);
    refreshConditional();
    const m = msgBox();
    body.appendChild(navButtons(() => {
      const err = validate(step);
      if (err) {
        showMsg(m, err.msg, true);
        const node = fields.querySelector(`[data-field="${err.field}"]`);
        if (node) {
          node.classList.add("onb-invalid");
          node.scrollIntoView({ block: "center", behavior: "smooth" });
          const inp = node.querySelector("input, textarea, select, button");
          if (inp) inp.focus({ preventScroll: true });
        }
        return;
      }
      go(stepIndex + 1);
    }, L(UI.next)));
    body.appendChild(m);
  }

  function summary(lang) {
    return STEPS.map((s) => ({
      title: s.title[lang] || s.title.fr,
      rows: s.fields.filter(visible).map((f) => [f.label[lang] || f.label.fr, display(f, lang)]),
    }));
  }

  function renderRecap(body) {
    body.appendChild(el("h2", "onb-title", L(UI.recapTitle)));
    body.appendChild(el("p", "onb-intro", L(UI.recapIntro)));
    STEPS.forEach((s, i) => {
      const sec = el("div", "onb-recap-section");
      const h = el("div", "onb-recap-head");
      h.appendChild(el("span", null, L(s.title)));
      const edit = el("button", "onb-back", L(UI.edit));
      edit.type = "button";
      edit.addEventListener("click", () => go(i));
      h.appendChild(edit);
      sec.appendChild(h);
      const dl = el("dl", "onb-recap");
      s.fields.filter(visible).forEach((f) => {
        dl.appendChild(el("dt", null, L(f.label)));
        dl.appendChild(el("dd", null, display(f, LANG) || UI.empty));
      });
      sec.appendChild(dl);
      body.appendChild(sec);
    });
    const m = msgBox();
    const nav = navButtons(async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (validate(STEPS[i])) return go(i);
      }
      const btn = nav.querySelector(".onb-next");
      btn.disabled = true;
      btn.textContent = L(UI.sending);
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: SESSION, lang: LANG, answers, summary: summary("fr"), clientSummary: summary(LANG) }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        renderDone();
      } catch (err) {
        btn.disabled = false;
        btn.textContent = L(UI.send) + " →";
        showMsg(m, L(UI.error), true);
      }
    }, L(UI.send));
    body.appendChild(nav);
    body.appendChild(m);
  }

  function renderDone() {
    root.innerHTML = "";
    const card = el("div", "referral-card onb-card");
    const body = el("div", "onb-body onb-done");
    body.appendChild(el("div", "onb-done-icon", "✓"));
    body.appendChild(el("h2", "onb-title", L(UI.doneTitle)));
    body.appendChild(el("p", "onb-intro", L(UI.doneText)));
    card.appendChild(body);
    root.appendChild(card);
  }

  function render() {
    root.innerHTML = "";
    currentFields = null;
    const card = el("div", "referral-card onb-card");
    if (stepIndex >= 0) card.appendChild(header());
    const body = el("div", "onb-body");
    if (stepIndex < 0) renderWelcome(body);
    else if (stepIndex < STEPS.length) renderStep(body);
    else renderRecap(body);
    card.appendChild(body);
    root.appendChild(card);
  }

  // Clear the red outline as soon as the client edits that field.
  root.addEventListener("input", (e) => { const f = e.target.closest(".onb-invalid"); if (f) f.classList.remove("onb-invalid"); });
  root.addEventListener("click", (e) => { const f = e.target.closest(".onb-invalid"); if (f && e.target.closest("button.dop-chip")) f.classList.remove("onb-invalid"); });

  // ---- start: sectors + what Stripe already knows ----
  async function init() {
    render();
    try {
      const res = await fetch("/api/onboarding/prefill?lang=" + LANG + (SESSION ? "&s=" + encodeURIComponent(SESSION) : ""));
      if (res.ok) {
        const data = await res.json();
        sectors = (data.sectors || []).map((s) => ({ id: s.slug, label: s.label }));
        const known = data.prefill || {};
        Object.keys(known).forEach((k) => {
          if (isEmpty(answers[k]) && !isEmpty(known[k])) answers[k] = known[k];
        });
        save();
        render();
      }
    } catch (e) {}
  }
  init();
})();
