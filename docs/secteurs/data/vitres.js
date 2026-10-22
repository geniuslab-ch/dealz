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

    // ---- English texts ----
    en: {
      label: "Window Cleaning",
      forWho: "window cleaning companies",
      pitch: "Price window count, height and frequency in a few clicks.",
      emailNoun: "your window cleaning",
      landing: {
        h1: ["YOU CLEAN.", "DEALZ PRICES IT."],
        question: "How many window cleaning requests are you losing because you're up on a lift?",
        text: "The client wants a price for their windows before deciding. Dealz replies any time of day, asks the right questions (window count, height, bay windows, frequency), calculates your price from your own rates and prepares the quote.",
        clientQ: "How much to clean the 15 windows of my house?",
        values: [
          { icon: "🪟", title: "A price per window", text: "Window count, building type and height: your coefficients apply automatically." },
          { icon: "🧗", title: "Lift and difficult access priced", text: "Above the third floor, the lift or rope-access fee is added without negotiation." },
          { icon: "🔁", title: "Recurring contracts easy to sell", text: "Quarterly, monthly: your frequency discounts are offered right away." },
          { icon: "🧽", title: "Bay windows, conservatories, shutters as options", text: "Every special surface is a clear quote line." },
        ],
        step1: "Import your rates: price per window, coefficients by building and by height, lift fees, frequency discounts. Your Excel sheet stays your working tool.",
        step2: "The engine understands your building types, your special surfaces, your working heights and your frequencies.",
        excel: { file: "window-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Window cleaning", "15 windows · house", "CHF 145"], ["Bay windows", "Large surfaces", "CHF 105"], ["Frames and sills", "15 windows", "CHF 40"]] },
        chat: ["\"I'd like to have my house windows cleaned.\"", "\"How many windows, and up to what floor?\"", "\"Do you have bay windows or frames to clean as well?\""],
        offer: { company: "ClairVue Vitrerie Services", rows: [["Window cleaning (15)", 145], ["Bay windows / large surfaces", 105], ["Frames and sills (15)", 40]] },
        roi: "Just one extra quarterly contract can already cover your subscription.",
      },
      demo: {
        brand: "ClairVue",
        eyebrow: "Vevey & Riviera · Fictional example",
        hero: { h1: "Spotless windows, without the streaks.", text: "Window cleaning, bay windows, conservatories and shopfronts for individuals and businesses — get a firm price in seconds, right on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "9,000+", lbl: "FAÇADES CLEANED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we clean",
        servicesSub: "Choose a service, or simply describe your need in the \"Get a quote\" tab.",
        services: [
          { icon: "🏠", title: "House windows", text: "Inside and out, streak-free.", tag: "from CHF 9.50/window" },
          { icon: "🪟", title: "Bay windows", text: "Large surfaces and French doors.", tag: "from CHF 28/bay" },
          { icon: "🏢", title: "Buildings", text: "Common areas and glass façades.", tag: "quote on request" },
          { icon: "🛍️", title: "Shopfronts", text: "Regular visits before opening.", tag: "from CHF 90" },
          { icon: "🌿", title: "Conservatories and glass roofs", text: "Careful cleaning of glazed surfaces.", tag: "CHF 140" },
          { icon: "🧗", title: "Lift / rope access", text: "Safe access to high floors.", tag: "CHF 280" },
        ],
        about: {
          title: "Qualified window cleaners",
          text: "ClairVue Vitrerie Services has maintained windows and glass façades for individuals, property managers and shops between Vevey and the Riviera since 2011. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Professional equipment", "pure water and squeegees for a streak-free result."], ["Secure work at height", "trained and insured crews."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 14", email: "hello@clairvue.demo", zone: "Vevey, Riviera, Chablais", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your windows — you'll receive a real quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe your windows…",
        pdfCompany: { name: "ClairVue Vitrerie Services", address: "Rue du Simplon 40, 1800 Vevey", phone: "021 000 00 14", email: "hello@clairvue.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your windows, then give you a firm quote right after.",
        addressPlaceholder: "Building address (street, postcode, town)",
        terms: "Firm quote, valid 30 days, per visit. Service subject to weather conditions suitable for exterior work. Swiss VAT included where applicable.",
        q: {
          building: { text: "What type of building is it?", short: "Building", opts: { house: "House / villa", flat: "Apartment", building: "Building (common areas)", shop: "Shop / storefront", office: "Offices" } },
          count: { text: "Roughly how many windows?", short: "Windows", opts: { n1: "Less than 10 windows", n2: "10 to 20 windows", n3: "20 to 40 windows", n4: "More than 40 windows" } },
          types: { text: "Are there any special surfaces?", short: "Surfaces", none: "Standard windows only", opts: { large: "Bay windows / large surfaces", veranda: "Conservatory / glass roof", shutters: "Shutters and blinds", frames: "Frames and sills" } },
          height: { text: "At what height are the windows?", short: "Height", opts: { ground: "Ground floor and 1st floor", mid: "Up to the 3rd floor", high: "Higher (lift or rope access)" } },
          freq: { text: "Would you like a one-off or regular visit?", short: "Frequency", opts: { once: "One-off visit", quarterly: "Quarterly (4 visits a year)", monthly: "Monthly (12 visits a year)" } },
          date: { text: "What date would you like the first visit?", short: "Preferred date" },
        },
        items: {
          windows: "Window cleaning ({n}, inside and outside)",
          large: "Bay windows / large surfaces",
          veranda: "Conservatory / glass roof",
          shutters: "Shutters and blinds ({n})",
          frames: "Frames and sills ({n})",
          lift: "Lift / rope access",
          discount: "Frequency discount ({pct}%)",
        },
      },
    },

    // ---- German texts (Swiss High German — no ß) ----
    de: {
      label: "Fensterreinigung",
      forWho: "Fensterreinigungsunternehmen",
      pitch: "Berechnen Sie Fensteranzahl, Höhe und Häufigkeit in wenigen Klicks.",
      emailNoun: "die Reinigung Ihrer Fenster",
      landing: {
        h1: ["SIE PUTZEN.", "DEALZ RECHNET."],
        question: "Wie viele Fensterreinigungs-Anfragen verlieren Sie, weil Sie auf der Hebebühne sind?",
        text: "Der Kunde möchte vor seiner Entscheidung einen Preis für seine Fenster. Dealz antwortet ihm jederzeit, stellt die richtigen Fragen (Fensteranzahl, Höhe, Fensterfronten, Häufigkeit), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Reinigung der 15 Fenster meines Hauses?",
        values: [
          { icon: "🪟", title: "Ein Preis pro Fenster", text: "Fensteranzahl, Gebäudetyp und Höhe: Ihre Koeffizienten werden automatisch angewendet." },
          { icon: "🧗", title: "Hebebühne und schwieriger Zugang berechnet", text: "Ab dem dritten Stockwerk wird die Pauschale für Hebebühne oder Seilzugang ohne Verhandlung hinzugefügt." },
          { icon: "🔁", title: "Wiederkehrende Verträge leicht verkäuflich", text: "Vierteljährlich, monatlich: Ihre Häufigkeitsrabatte werden direkt angeboten." },
          { icon: "🧽", title: "Fensterfronten, Wintergärten, Storen als Zusatzoptionen", text: "Jede Sonderfläche ist eine klare Offertposition." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Fenster, Koeffizienten nach Gebäude und Höhe, Pauschalen für Hebebühne, Häufigkeitsrabatte. Ihr Excel bleibt Ihr Arbeitsinstrument.",
        step2: "Die Engine versteht Ihre Gebäudetypen, Ihre Sonderflächen, Ihre Einsatzhöhen und Ihre Häufigkeiten.",
        excel: { file: "tarife-fenster.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Fensterreinigung", "15 Fenster · Haus", "CHF 145"], ["Fensterfronten", "Grossflächen", "CHF 105"], ["Rahmen und Fensterbänke", "15 Fenster", "CHF 40"]] },
        chat: ["«Ich möchte die Fenster meines Hauses reinigen lassen.»", "«Wie viele Fenster, und bis zu welchem Stockwerk?»", "«Haben Sie auch Fensterfronten oder Rahmen zu reinigen?»"],
        offer: { company: "ClairVue Vitrerie Services", rows: [["Fensterreinigung (15)", 145], ["Fensterfronten / Grossflächen", 105], ["Rahmen und Fensterbänke (15)", 40]] },
        roi: "Schon ein einziger zusätzlicher Quartalsvertrag kann Ihr Abonnement decken.",
      },
      demo: {
        brand: "ClairVue",
        eyebrow: "Vevey & Riviera · Fiktives Beispiel",
        hero: { h1: "Makellose Fenster, ohne Schlieren.", text: "Fensterreinigung, Fensterfronten, Wintergärten und Schaufenster für Privatpersonen und Unternehmen — erhalten Sie in Sekunden einen festen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "9000+", lbl: "GEREINIGTE FASSADEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir reinigen",
        servicesSub: "Wählen Sie eine Leistung oder beschreiben Sie Ihr Anliegen einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🏠", title: "Hausfenster", text: "Innen und aussen, ohne Schlieren.", tag: "ab CHF 9.50/Fenster" },
          { icon: "🪟", title: "Fensterfronten", text: "Grossflächen und Terrassentüren.", tag: "ab CHF 28/Front" },
          { icon: "🏢", title: "Mehrfamilienhäuser", text: "Gemeinschaftsbereiche und Glasfassaden.", tag: "auf Anfrage" },
          { icon: "🛍️", title: "Schaufenster", text: "Regelmässiger Einsatz vor Öffnung.", tag: "ab CHF 90" },
          { icon: "🌿", title: "Wintergärten und Glasdächer", text: "Sorgfältige Reinigung verglaster Flächen.", tag: "CHF 140" },
          { icon: "🧗", title: "Hebebühne / Seilzugang", text: "Sicherer Zugang zu hohen Stockwerken.", tag: "CHF 280" },
        ],
        about: {
          title: "Qualifizierte Fensterreiniger",
          text: "ClairVue Vitrerie Services pflegt Fenster und Glasfassaden von Privatpersonen, Verwaltungen und Geschäften zwischen Vevey und der Riviera seit 2011. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Professionelle Ausrüstung", "Reinwasser und Abzieher für ein schlierenfreies Ergebnis."], ["Gesicherte Höhenarbeit", "geschulte und versicherte Teams."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "021 000 00 14", email: "hello@clairvue.demo", zone: "Vevey, Riviera, Chablais", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Fenstern — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Fenster…",
        pdfCompany: { name: "ClairVue Vitrerie Services", address: "Rue du Simplon 40, 1800 Vevey", phone: "021 000 00 14", email: "hello@clairvue.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Fenstern und erstelle Ihnen direkt danach eine feste Offerte.",
        addressPlaceholder: "Adresse des Gebäudes (Strasse, PLZ, Ort)",
        terms: "Feste Offerte, 30 Tage gültig, pro Einsatz. Einsatz vorbehaltlich geeigneter Wetterbedingungen für Aussenarbeiten. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          building: { text: "Um welchen Gebäudetyp handelt es sich?", short: "Gebäude", opts: { house: "Haus / Villa", flat: "Wohnung", building: "Mehrfamilienhaus (Gemeinschaftsbereiche)", shop: "Geschäft / Schaufenster", office: "Büros" } },
          count: { text: "Wie viele Fenster ungefähr?", short: "Fenster", opts: { n1: "Weniger als 10 Fenster", n2: "10 bis 20 Fenster", n3: "20 bis 40 Fenster", n4: "Mehr als 40 Fenster" } },
          types: { text: "Gibt es besondere Flächen?", short: "Flächen", none: "Nur Standardfenster", opts: { large: "Fensterfronten / Grossflächen", veranda: "Wintergarten / Glasdach", shutters: "Storen und Rollläden", frames: "Rahmen und Fensterbänke" } },
          height: { text: "In welcher Höhe befinden sich die Fenster?", short: "Höhe", opts: { ground: "Erdgeschoss und 1. Stock", mid: "Bis zum 3. Stock", high: "Höher (Hebebühne oder Seilzugang)" } },
          freq: { text: "Wünschen Sie einen einmaligen oder regelmässigen Einsatz?", short: "Häufigkeit", opts: { once: "Einmaliger Einsatz", quarterly: "Vierteljährlich (4 Einsätze pro Jahr)", monthly: "Monatlich (12 Einsätze pro Jahr)" } },
          date: { text: "Für welches Datum wünschen Sie den ersten Einsatz?", short: "Wunschtermin" },
        },
        items: {
          windows: "Fensterreinigung ({n}, innen und aussen)",
          large: "Fensterfronten / Grossflächen",
          veranda: "Wintergarten / Glasdach",
          shutters: "Storen und Rollläden ({n})",
          frames: "Rahmen und Fensterbänke ({n})",
          lift: "Hebebühne / Seilzugang",
          discount: "Häufigkeitsrabatt ({pct}%)",
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
