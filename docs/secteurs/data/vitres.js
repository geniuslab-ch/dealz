/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "vitres",
    icon: "🪟",
    needsAddress: true,
    colors: { main: "#228be6", dark: "#1971c2", light: "#d0ebff", accent: "#12b886", accentDark: "#0ca678", bg: "#f8fbff" },

    quote: {
      minimum: 90,
      questions: [
        { id: "building", type: "single", options: [{ id: "house", k: 1 }, { id: "flat", k: 0.9 }, { id: "building", k: 1.1 }, { id: "shop", k: 1.2 }, { id: "office", k: 1.05 }] },
        { id: "count", type: "single", options: [{ id: "n1", n: 7 }, { id: "n2", n: 15 }, { id: "n3", n: 30 }, { id: "n4", n: 50 }] },
        { id: "types", type: "multi", options: [{ id: "large" }, { id: "veranda" }, { id: "shutters" }, { id: "frames" }] },
        { id: "height", type: "single", options: [{ id: "ground", k: 1, lift: 0 }, { id: "mid", k: 1.25, lift: 0 }, { id: "high", k: 1.6, lift: 280 }] },
        { id: "freq", type: "single", options: [{ id: "once", disc: 0 }, { id: "quarterly", disc: 0.1 }, { id: "monthly", disc: 0.18 }] },
        { id: "date", type: "date", minDays: 3 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var n = a.count.n;
        var base = H.round5(n * 9.5 * a.building.k * a.height.k);
        items.push({ label: L("windows", { n: n }), amount: base });
        (a.types || []).forEach(function (t) {
          if (t.id === "large") items.push({ label: L("large"), amount: H.round5(n * 0.25 * 28) });
          if (t.id === "veranda") items.push({ label: L("veranda"), amount: 140 });
          if (t.id === "shutters") items.push({ label: L("shutters", { n: n }), amount: H.round5(n * 3.8) });
          if (t.id === "frames") items.push({ label: L("frames", { n: n }), amount: H.round5(n * 2.5) });
        });
        if (a.height.lift) items.push({ label: L("lift"), amount: a.height.lift });
        var sub = items.reduce(function (s, i) { return s + i.amount; }, 0);
        if (a.freq.disc) items.push({ label: L("discount", { pct: Math.round(a.freq.disc * 100) }), amount: -H.round5(sub * a.freq.disc) });
        return items;
      },
    },

    fr: {
      label: "Nettoyage de vitres",
      forWho: "entreprises de nettoyage de vitres",
      pitch: "Chiffrez le nombre de vitres, la hauteur et la fréquence en quelques clics.",
      emailNoun: "le nettoyage de vos vitres",
      landing: {
        h1: ["VOUS LAVEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de nettoyage de vitres perdez-vous parce que vous êtes sur une nacelle ?",
        text: "Le client veut un prix pour ses vitres avant de décider. Dealz lui répond à toute heure, pose les bonnes questions (nombre de vitres, hauteur, baies, fréquence), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour nettoyer les 15 vitres de ma maison ?",
        values: [
          { icon: "🪟", title: "Un prix à la vitre", text: "Nombre de vitres, type de bâtiment et hauteur : vos coefficients s'appliquent automatiquement." },
          { icon: "🧗", title: "Nacelle et accès difficiles chiffrés", text: "Au-delà du troisième étage, le forfait nacelle ou cordes s'ajoute sans négociation." },
          { icon: "🔁", title: "Des contrats récurrents faciles à vendre", text: "Trimestriel, mensuel : vos remises de fréquence sont proposées d'emblée." },
          { icon: "🧽", title: "Baies, vérandas, stores en options", text: "Chaque surface spéciale est une ligne de devis claire." },
        ],
        step1: "Importez vos tarifs : prix à la vitre, coefficients par bâtiment et par hauteur, forfaits nacelle, remises de fréquence. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de bâtiments, vos surfaces spéciales, vos hauteurs d'intervention et vos fréquences.",
        excel: { file: "tarifs-vitres.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Nettoyage des vitres", "15 vitres · maison", "CHF 145"], ["Baies vitrées", "Grandes surfaces", "CHF 105"], ["Cadres et rebords", "15 vitres", "CHF 40"]] },
        chat: ["« Je voudrais faire nettoyer les vitres de ma maison. »", "« Combien de vitres, et jusqu'à quel étage ? »", "« Avez-vous des baies vitrées ou des cadres à nettoyer aussi ? »"],
        offer: { company: "ClairVue Vitrerie Services", rows: [["Nettoyage des vitres (15)", 145], ["Baies vitrées / grandes surfaces", 105], ["Cadres et rebords (15)", 40]] },
        roi: "Un seul contrat trimestriel supplémentaire peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "ClairVue",
        eyebrow: "Vevey & Riviera · Exemple fictif",
        hero: { h1: "Des vitres impeccables, sans les traces.", text: "Nettoyage de vitres, baies vitrées, vérandas et vitrines pour particuliers et professionnels — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "9 000+", lbl: "FAÇADES NETTOYÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous nettoyons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🏠", title: "Vitres de maison", text: "Intérieur et extérieur, sans traces.", tag: "dès CHF 9.50/vitre" },
          { icon: "🪟", title: "Baies vitrées", text: "Grandes surfaces et portes-fenêtres.", tag: "dès CHF 28/baie" },
          { icon: "🏢", title: "Immeubles", text: "Parties communes et façades vitrées.", tag: "sur devis" },
          { icon: "🛍️", title: "Vitrines de commerce", text: "Passage régulier avant ouverture.", tag: "dès CHF 90" },
          { icon: "🌿", title: "Vérandas et toits vitrés", text: "Nettoyage soigné des surfaces vitrées.", tag: "CHF 140" },
          { icon: "🧗", title: "Nacelle / cordes", text: "Accès aux étages élevés en sécurité.", tag: "CHF 280" },
        ],
        about: {
          title: "Des laveurs de vitres qualifiés",
          text: "ClairVue Vitrerie Services entretient vitres et façades vitrées de particuliers, régies et commerces entre Vevey et la Riviera depuis 2011. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Matériel professionnel", "eau pure et raclettes pour un résultat sans traces."], ["Travail en hauteur sécurisé", "équipes formées et assurées."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 14", email: "hello@clairvue.demo", zone: "Vevey, Riviera, Chablais", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur vos vitres — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos vitres…",
        pdfCompany: { name: "ClairVue Vitrerie Services", address: "Rue du Simplon 40, 1800 Vevey", phone: "021 000 00 14", email: "hello@clairvue.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos vitres, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du bâtiment (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, par passage. Intervention sous réserve de conditions météo compatibles pour l'extérieur. TVA suisse incluse le cas échéant.",
        q: {
          building: { text: "De quel type de bâtiment s'agit-il ?", short: "Bâtiment", opts: { house: "Maison / villa", flat: "Appartement", building: "Immeuble (parties communes)", shop: "Commerce / vitrine", office: "Bureaux" } },
          count: { text: "Combien de vitres environ ?", short: "Vitres", opts: { n1: "Moins de 10 vitres", n2: "10 à 20 vitres", n3: "20 à 40 vitres", n4: "Plus de 40 vitres" } },
          types: { text: "Y a-t-il des surfaces particulières ?", short: "Surfaces", none: "Vitres standard uniquement", opts: { large: "Baies vitrées / grandes surfaces", veranda: "Véranda / toit vitré", shutters: "Stores et volets", frames: "Cadres et rebords" } },
          height: { text: "À quelle hauteur se trouvent les vitres ?", short: "Hauteur", opts: { ground: "Rez-de-chaussée et 1er étage", mid: "Jusqu'au 3e étage", high: "Plus haut (nacelle ou cordes)" } },
          freq: { text: "Souhaitez-vous un passage unique ou régulier ?", short: "Fréquence", opts: { once: "Passage unique", quarterly: "Trimestriel (4 passages par an)", monthly: "Mensuel (12 passages par an)" } },
          date: { text: "Pour quelle date souhaitez-vous le premier passage ?", short: "Date souhaitée" },
        },
        items: {
          windows: "Nettoyage des vitres ({n}, intérieur et extérieur)",
          large: "Baies vitrées / grandes surfaces",
          veranda: "Véranda / toit vitré",
          shutters: "Stores et volets ({n})",
          frames: "Cadres et rebords ({n})",
          lift: "Nacelle / accès par cordes",
          discount: "Remise de fréquence ({pct} %)",
        },
      },
    },
    en: {
      label: "Window cleaning",
      forWho: "window cleaning companies",
      pitch: "Price window count, height and frequency in a few clicks.",
      emailNoun: "your window cleaning",
      landing: {
        h1: ["YOU CLEAN.", "DEALZ PRICES."],
        question: "How many window cleaning requests do you lose because you're up on a cherry picker?",
        text: "Customers want a price for their windows before deciding. Dealz answers them around the clock, asks the right questions (number of windows, height, picture windows, frequency), calculates your price from your rates and prepares the quote.",
        clientQ: "How much to clean the 15 windows of my house?",
        values: [
          { icon: "🪟", title: "A price per window", text: "Number of windows, building type and height: your coefficients apply automatically." },
          { icon: "🧗", title: "Cherry picker and hard access priced", text: "Above the third floor, the cherry picker or rope access fee is added without haggling." },
          { icon: "🔁", title: "Recurring contracts that are easy to sell", text: "Quarterly, monthly: your frequency discounts are offered from the start." },
          { icon: "🧽", title: "Picture windows, conservatories, blinds as options", text: "Each special surface is a clear quote line." },
        ],
        step1: "Import your rates: price per window, coefficients per building and height, cherry picker fees, frequency discounts. Your Excel stays your working tool.",
        step2: "The engine understands your building types, special surfaces, working heights and frequencies.",
        excel: { file: "window-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Window cleaning", "15 windows · house", "CHF 145"], ["Picture windows", "Large surfaces", "CHF 105"], ["Frames and sills", "15 windows", "CHF 40"]] },
        chat: ["“I'd like to have the windows of my house cleaned.”", "“How many windows, and up to which floor?”", "“Do you also have picture windows or frames to clean?”"],
        offer: { company: "ClairVue Vitrerie Services", rows: [["Window cleaning (15)", 145], ["Picture windows / large surfaces", 105], ["Frames and sills (15)", 40]] },
        roi: "A single extra quarterly contract can already pay for your subscription.",
      },
      demo: {
        brand: "ClairVue",
        eyebrow: "Vevey & Riviera · Fictional example",
        hero: { h1: "Spotless windows, without the streaks.", text: "Cleaning of windows, picture windows, conservatories and shop fronts for homes and businesses — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "9,000+", lbl: "FACADES CLEANED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we clean",
        servicesSub: "Pick a service, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "🏠", title: "House windows", text: "Inside and out, streak-free.", tag: "from CHF 9.50/window" },
          { icon: "🪟", title: "Picture windows", text: "Large surfaces and French doors.", tag: "from CHF 28/window" },
          { icon: "🏢", title: "Buildings", text: "Common areas and glass facades.", tag: "on quote" },
          { icon: "🛍️", title: "Shop fronts", text: "Regular visits before opening.", tag: "from CHF 90" },
          { icon: "🌿", title: "Conservatories and glass roofs", text: "Careful cleaning of glazed surfaces.", tag: "CHF 140" },
          { icon: "🧗", title: "Cherry picker / ropes", text: "Safe access to upper floors.", tag: "CHF 280" },
        ],
        about: {
          title: "Qualified window cleaners",
          text: "ClairVue Vitrerie Services has been cleaning windows and glass facades for homes, property managers and shops between Vevey and the Riviera since 2011. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Professional equipment", "pure water and squeegees for a streak-free finish."], ["Safe work at height", "trained and insured teams."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 14", email: "hello@clairvue.demo", zone: "Vevey, Riviera, Chablais", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your windows — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your windows…",
        pdfCompany: { name: "ClairVue Vitrerie Services", address: "Rue du Simplon 40, 1800 Vevey", phone: "021 000 00 14", email: "hello@clairvue.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your windows, then put together a firm quote right away.",
        addressPlaceholder: "Building address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, per visit. Exterior work subject to suitable weather. Swiss VAT included where applicable.",
        q: {
          building: { text: "What type of building is it?", short: "Building", opts: { house: "House / villa", flat: "Flat", building: "Apartment building (common areas)", shop: "Shop / shop front", office: "Offices" } },
          count: { text: "Roughly how many windows?", short: "Windows", opts: { n1: "Fewer than 10 windows", n2: "10 to 20 windows", n3: "20 to 40 windows", n4: "More than 40 windows" } },
          types: { text: "Are there any special surfaces?", short: "Surfaces", none: "Standard windows only", opts: { large: "Picture windows / large surfaces", veranda: "Conservatory / glass roof", shutters: "Blinds and shutters", frames: "Frames and sills" } },
          height: { text: "How high are the windows?", short: "Height", opts: { ground: "Ground and 1st floor", mid: "Up to the 3rd floor", high: "Higher (cherry picker or ropes)" } },
          freq: { text: "Would you like a one-off or regular visit?", short: "Frequency", opts: { once: "One-off visit", quarterly: "Quarterly (4 visits a year)", monthly: "Monthly (12 visits a year)" } },
          date: { text: "What date would you like the first visit?", short: "Preferred date" },
        },
        items: {
          windows: "Window cleaning ({n}, inside and out)",
          large: "Picture windows / large surfaces",
          veranda: "Conservatory / glass roof",
          shutters: "Blinds and shutters ({n})",
          frames: "Frames and sills ({n})",
          lift: "Cherry picker / rope access",
          discount: "Frequency discount ({pct}%)",
        },
      },
    },
    de: {
      label: "Fensterreinigung",
      forWho: "Fensterreinigungsfirmen",
      pitch: "Anzahl Fenster, Höhe und Häufigkeit mit wenigen Klicks berechnen.",
      emailNoun: "Ihre Fensterreinigung",
      landing: {
        h1: ["SIE PUTZEN.", "DEALZ RECHNET."],
        question: "Wie viele Anfragen für Fensterreinigung verlieren Sie, weil Sie gerade auf der Hebebühne stehen?",
        text: "Der Kunde will einen Preis für seine Fenster, bevor er entscheidet. Dealz antwortet ihm rund um die Uhr, stellt die richtigen Fragen (Anzahl Fenster, Höhe, Fensterfronten, Häufigkeit), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Reinigung der 15 Fenster meines Hauses?",
        values: [
          { icon: "🪟", title: "Ein Preis pro Fenster", text: "Anzahl Fenster, Gebäudetyp und Höhe: Ihre Faktoren werden automatisch angewendet." },
          { icon: "🧗", title: "Hebebühne und schwieriger Zugang berechnet", text: "Ab dem dritten Stock wird die Pauschale für Hebebühne oder Seilzugang ohne Diskussion hinzugefügt." },
          { icon: "🔁", title: "Wiederkehrende Verträge leicht verkauft", text: "Vierteljährlich, monatlich: Ihre Häufigkeitsrabatte werden von Anfang an angeboten." },
          { icon: "🧽", title: "Fensterfronten, Wintergärten, Storen als Optionen", text: "Jede Spezialfläche ist eine klare Offertposition." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Fenster, Faktoren pro Gebäude und Höhe, Hebebühnenpauschalen, Häufigkeitsrabatte. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Gebäudetypen, Spezialflächen, Arbeitshöhen und Häufigkeiten.",
        excel: { file: "tarife-fenster.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Fensterreinigung", "15 Fenster · Haus", "CHF 145"], ["Fensterfronten", "Grosse Flächen", "CHF 105"], ["Rahmen und Simse", "15 Fenster", "CHF 40"]] },
        chat: ["«Ich möchte die Fenster meines Hauses reinigen lassen.»", "«Wie viele Fenster, und bis zu welchem Stockwerk?»", "«Haben Sie auch Fensterfronten oder Rahmen zu reinigen?»"],
        offer: { company: "ClairVue Vitrerie Services", rows: [["Fensterreinigung (15)", 145], ["Fensterfronten / grosse Flächen", 105], ["Rahmen und Simse (15)", 40]] },
        roi: "Ein einziger zusätzlicher Vierteljahresvertrag kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "ClairVue",
        eyebrow: "Vevey & Riviera · Fiktives Beispiel",
        hero: { h1: "Makellose Fenster, ohne Streifen.", text: "Reinigung von Fenstern, Fensterfronten, Wintergärten und Schaufenstern für Privatpersonen und Unternehmen — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "9'000+", lbl: "GEREINIGTE FASSADEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir reinigen",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihren Bedarf einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🏠", title: "Hausfenster", text: "Innen und aussen, streifenfrei.", tag: "ab CHF 9.50/Fenster" },
          { icon: "🪟", title: "Fensterfronten", text: "Grosse Flächen und Fenstertüren.", tag: "ab CHF 28/Front" },
          { icon: "🏢", title: "Mehrfamilienhäuser", text: "Allgemeinflächen und Glasfassaden.", tag: "auf Offerte" },
          { icon: "🛍️", title: "Schaufenster", text: "Regelmässiger Einsatz vor Ladenöffnung.", tag: "ab CHF 90" },
          { icon: "🌿", title: "Wintergärten und Glasdächer", text: "Sorgfältige Reinigung der Glasflächen.", tag: "CHF 140" },
          { icon: "🧗", title: "Hebebühne / Seile", text: "Sicherer Zugang zu oberen Stockwerken.", tag: "CHF 280" },
        ],
        about: {
          title: "Qualifizierte Fensterreiniger",
          text: "ClairVue Vitrerie Services pflegt seit 2011 Fenster und Glasfassaden von Privatpersonen, Verwaltungen und Geschäften zwischen Vevey und der Riviera. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Profi-Ausrüstung", "Reinwasser und Abzieher für ein streifenfreies Resultat."], ["Sichere Höhenarbeit", "geschulte und versicherte Teams."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 00 14", email: "hello@clairvue.demo", zone: "Vevey, Riviera, Chablais", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Fenstern — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Fenster…",
        pdfCompany: { name: "ClairVue Vitrerie Services", address: "Rue du Simplon 40, 1800 Vevey", phone: "021 000 00 14", email: "hello@clairvue.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Fenstern und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse des Gebäudes (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, pro Einsatz. Aussenarbeiten vorbehaltlich geeigneter Witterung. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          building: { text: "Um welchen Gebäudetyp handelt es sich?", short: "Gebäude", opts: { house: "Haus / Villa", flat: "Wohnung", building: "Mehrfamilienhaus (Allgemeinflächen)", shop: "Geschäft / Schaufenster", office: "Büros" } },
          count: { text: "Wie viele Fenster ungefähr?", short: "Fenster", opts: { n1: "Weniger als 10 Fenster", n2: "10 bis 20 Fenster", n3: "20 bis 40 Fenster", n4: "Mehr als 40 Fenster" } },
          types: { text: "Gibt es besondere Flächen?", short: "Flächen", none: "Nur Standardfenster", opts: { large: "Fensterfronten / grosse Flächen", veranda: "Wintergarten / Glasdach", shutters: "Storen und Fensterläden", frames: "Rahmen und Simse" } },
          height: { text: "In welcher Höhe befinden sich die Fenster?", short: "Höhe", opts: { ground: "Erdgeschoss und 1. Stock", mid: "Bis zum 3. Stock", high: "Höher (Hebebühne oder Seile)" } },
          freq: { text: "Wünschen Sie einen einmaligen oder regelmässigen Einsatz?", short: "Häufigkeit", opts: { once: "Einmaliger Einsatz", quarterly: "Vierteljährlich (4 Einsätze pro Jahr)", monthly: "Monatlich (12 Einsätze pro Jahr)" } },
          date: { text: "Für welches Datum wünschen Sie den ersten Einsatz?", short: "Wunschdatum" },
        },
        items: {
          windows: "Fensterreinigung ({n}, innen und aussen)",
          large: "Fensterfronten / grosse Flächen",
          veranda: "Wintergarten / Glasdach",
          shutters: "Storen und Fensterläden ({n})",
          frames: "Rahmen und Simse ({n})",
          lift: "Hebebühne / Seilzugang",
          discount: "Häufigkeitsrabatt ({pct} %)",
        },
      },
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else {
    window.DEALZ_SECTORS = window.DEALZ_SECTORS || {};
    window.DEALZ_SECTORS[S.slug] = S;
  }
})();
