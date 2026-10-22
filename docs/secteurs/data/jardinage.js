/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "jardinage",
    icon: "🌿",
    needsAddress: true,
    colors: { main: "#2f9e44", dark: "#237a35", light: "#d8f5dd", accent: "#f08c00", accentDark: "#d97706", bg: "#fbfef9" },

    quote: {
      minimum: 120,
      questions: [
        { id: "service", type: "single", options: [{ id: "lawn" }, { id: "hedge" }, { id: "prune" }, { id: "design" }, { id: "yearly" }] },
        { id: "surface", type: "single", options: [{ id: "s1", m2: 150 }, { id: "s2", m2: 350 }, { id: "s3", m2: 750 }, { id: "s4", m2: 1500 }, { id: "s5", m2: 2800 }] },
        {
          id: "state", type: "single",
          when: function (a) { return a.service.id !== "design"; },
          options: [{ id: "ok", k: 1 }, { id: "neg", k: 1.25 }, { id: "wild", k: 1.6 }],
        },
        {
          id: "freq", type: "single",
          when: function (a) { return a.service.id === "lawn"; },
          options: [{ id: "once", visits: 1, disc: 0 }, { id: "monthly", visits: 7, disc: 0 }, { id: "biweekly", visits: 14, disc: 0.06 }, { id: "weekly", visits: 28, disc: 0.1 }],
        },
        {
          id: "extras", type: "multi",
          when: function (a) { return a.service.id !== "design"; },
          options: [{ id: "waste" }, { id: "weed" }, { id: "fert" }, { id: "irrig" }],
        },
        { id: "date", type: "date", minDays: 3 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surface.m2;
        var k = a.state ? a.state.k : 1;
        var rate = 62;
        var lawnHours = 0.5 + m2 / 450;
        var hedgeHours = 1 + m2 / 350;
        var svc = a.service.id;
        if (svc === "lawn") {
          items.push({ label: L("lawn", { n: a.freq.visits, m2: m2 }), amount: H.round5(lawnHours * rate * k * a.freq.visits * (1 - a.freq.disc)) });
        } else if (svc === "hedge") {
          items.push({ label: L("hedge", { m2: m2 }), amount: H.round5(hedgeHours * rate * k) });
        } else if (svc === "prune") {
          items.push({ label: L("prune"), amount: H.round5((2 + m2 / 500) * 78 * k) });
        } else if (svc === "design") {
          var base = Math.min(m2, 600);
          items.push({ label: L("design", { m2: base }), amount: H.round5(base * 42 + 320) });
        } else {
          items.push({ label: L("yearly", { m2: m2 }), amount: H.round5(lawnHours * rate * 14 * 0.92 * k + hedgeHours * rate * 2 * k) });
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "waste") items.push({ label: L("waste"), amount: H.round5(60 + m2 * 0.05) });
          if (e.id === "weed") items.push({ label: L("weed"), amount: H.round5(m2 * 0.15 * k) });
          if (e.id === "fert") items.push({ label: L("fert"), amount: H.round5(m2 * 0.12 + 30) });
          if (e.id === "irrig") items.push({ label: L("irrig"), amount: 90 });
        });
        return items;
      },
    },

    fr: {
      label: "Jardinage et paysagisme",
      forWho: "entreprises de jardinage et de paysagisme",
      pitch: "Chiffrez tonte, taille et entretien selon la surface et l'état du jardin.",
      emailNoun: "l'entretien de votre jardin",
      landing: {
        h1: ["VOUS JARDINEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes d'entretien de jardin perdez-vous quand vous êtes chez un client ?",
        text: "Au printemps, le téléphone sonne sans arrêt — et vous êtes au bout d'une tondeuse. Dealz répond à vos clients à votre place, pose les bonnes questions (surface, état du jardin, fréquence), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour l'entretien d'une pelouse de 350 m² toutes les deux semaines ?",
        values: [
          { icon: "📐", title: "Des devis à la surface", text: "Surface, état du terrain, fréquence : Dealz chiffre les entretiens standards sans visite préalable." },
          { icon: "🌱", title: "Pic de printemps absorbé", text: "Quand les demandes affluent en mars-avril, chacune reçoit une réponse immédiate — même pendant que vous travaillez." },
          { icon: "🔁", title: "Des contrats récurrents qualifiés", text: "Les forfaits à la saison (hebdomadaire, bimensuel) sont proposés d'emblée, avec la remise dégressive que vous définissez." },
          { icon: "🍂", title: "Options chiffrées automatiquement", text: "Évacuation des déchets verts, désherbage, fertilisation, arrosage : chaque option s'ajoute au devis selon vos règles." },
        ],
        step1: "Importez vos tarifs : taux horaire, forfaits par surface, tailles, élagages, remises de fréquence. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, l'état des terrains, vos fréquences de passage et vos options.",
        excel: { file: "tarifs-jardinage.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Tonte et entretien", "350 m² · 14 passages", "CHF 1 045"], ["Taille de haies", "350 m²", "CHF 125"], ["Évacuation déchets verts", "Forfait", "CHF 80"]] },
        chat: ["« Je cherche quelqu'un pour entretenir ma pelouse et tailler ma haie. »", "« Quelle est la surface du jardin, et dans quel état est-il ? »", "« Souhaitez-vous un passage unique ou un contrat à la saison ? »"],
        offer: { company: "Vert Léman Paysage Sàrl", rows: [["Tonte et entretien (14 passages)", 1045], ["Taille de haies", 125], ["Évacuation des déchets verts", 80]] },
        roi: "Un seul contrat d'entretien supplémentaire peut déjà payer votre abonnement pour la saison.",
      },
      demo: {
        brand: "Vert Léman Paysage",
        eyebrow: "Morges & Lavaux · Exemple fictif",
        hero: { h1: "Un jardin soigné, sans y passer vos week-ends.", text: "Entretien de pelouses, taille de haies, élagage et création de jardins autour du Léman — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "850+", lbl: "JARDINS ENTRETENUS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous entretenons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre jardin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🌱", title: "Tonte et entretien", text: "Pelouses entretenues à la saison ou ponctuellement.", tag: "dès CHF 62/h" },
          { icon: "✂️", title: "Taille de haies", text: "Haies, arbustes et massifs taillés proprement.", tag: "dès CHF 150" },
          { icon: "🌳", title: "Élagage d'arbres", text: "Réduction, éclaircie et abattage sécurisé.", tag: "dès CHF 280" },
          { icon: "🏡", title: "Création de jardin", text: "Plantations, gazon, terrasses et massifs.", tag: "sur devis" },
          { icon: "🍃", title: "Évacuation verte", text: "Déchets verts évacués et triés.", tag: "dès CHF 85" },
          { icon: "💧", title: "Arrosage automatique", text: "Contrôle et remise en service au printemps.", tag: "CHF 90" },
        ],
        about: {
          title: "Des jardiniers du coin, à votre service toute l'année",
          text: "Vert Léman Paysage entretient jardins privés et copropriétés entre Morges et Lavaux depuis 2009. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Équipes fixes", "le même jardinier vient chez vous à chaque passage."], ["Matériel professionnel", "tondeuses, taille-haies et broyeurs entretenus."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 10", email: "hello@vert-leman.demo", zone: "Morges, Lavaux, La Côte", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur votre jardin — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre jardin…",
        pdfCompany: { name: "Vert Léman Paysage Sàrl", address: "Route de Lausanne 45, 1110 Morges", phone: "021 000 00 10", email: "hello@vert-leman.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre jardin, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du jardin (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Évacuation des déchets verts uniquement si l'option est indiquée. TVA suisse incluse le cas échéant.",
        q: {
          service: { text: "Quelle prestation souhaitez-vous ?", short: "Prestation", opts: { lawn: "Tonte et entretien de pelouse", hedge: "Taille de haies et arbustes", prune: "Élagage d'arbres", design: "Création / rénovation de jardin", yearly: "Entretien annuel complet" } },
          surface: { text: "Quelle est la surface du jardin ?", short: "Surface", opts: { s1: "Moins de 200 m²", s2: "200 à 500 m²", s3: "500 à 1000 m²", s4: "1000 à 2000 m²", s5: "Plus de 2000 m²" } },
          state: { text: "Dans quel état se trouve le jardin ?", short: "État du jardin", opts: { ok: "Entretenu régulièrement", neg: "Un peu négligé", wild: "Très envahi" } },
          freq: { text: "À quelle fréquence souhaitez-vous la tonte ?", short: "Fréquence", opts: { once: "Intervention unique", monthly: "Une fois par mois (saison)", biweekly: "Toutes les deux semaines (saison)", weekly: "Chaque semaine (saison)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { waste: "Évacuation des déchets verts", weed: "Désherbage des massifs", fert: "Fertilisation / traitement anti-mousse", irrig: "Contrôle de l'arrosage automatique" } },
          date: { text: "Pour quelle date souhaitez-vous démarrer ?", short: "Date souhaitée" },
        },
        items: {
          lawn: "Tonte et entretien — {n} passage(s), {m2} m²",
          hedge: "Taille de haies et arbustes ({m2} m²)",
          prune: "Élagage d'arbres (équipe + broyage)",
          design: "Création / rénovation de jardin (jusqu'à {m2} m²)",
          yearly: "Entretien annuel — pelouse (14 passages) + 2 tailles de haies",
          waste: "Évacuation des déchets verts",
          weed: "Désherbage des massifs",
          fert: "Fertilisation / traitement anti-mousse",
          irrig: "Contrôle de l'arrosage automatique",
        },
      },
    },

    en: {
      label: "Gardening & Landscaping",
      forWho: "gardening and landscaping companies",
      pitch: "Price mowing, pruning and maintenance based on surface area and garden condition.",
      emailNoun: "your garden maintenance",
      landing: {
        h1: ["YOU GARDEN.", "DEALZ PRICES IT."],
        question: "How many garden maintenance requests are you losing while you're at a client's?",
        text: "In spring, the phone rings non-stop — and you're at the end of a mower. Dealz answers your clients on your behalf, asks the right questions (surface area, garden condition, frequency), calculates your price from your own rates and prepares their quote.",
        clientQ: "How much to maintain a 350 m² lawn every two weeks?",
        values: [
          { icon: "📐", title: "Quotes priced by surface area", text: "Surface area, terrain condition, frequency: Dealz prices standard maintenance without a prior site visit." },
          { icon: "🌱", title: "Spring rush, handled", text: "When requests pour in during March and April, every one gets an immediate reply — even while you're at work." },
          { icon: "🔁", title: "Qualified recurring contracts", text: "Seasonal packages (weekly, fortnightly) are offered from the start, with the sliding discount you define." },
          { icon: "🍂", title: "Options priced automatically", text: "Green waste removal, weeding, fertilising, irrigation: every option is added to the quote according to your rules." },
        ],
        step1: "Import your rates: hourly rate, packages per surface, pruning, tree work, frequency discounts. Your Excel sheet stays your working tool.",
        step2: "The engine understands your surface areas, terrain conditions, your visit frequencies and your options.",
        excel: { file: "gardening-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Mowing and maintenance", "350 m² · 14 visits", "CHF 1,045"], ["Hedge trimming", "350 m²", "CHF 125"], ["Green waste removal", "Package", "CHF 80"]] },
        chat: ["\"I'm looking for someone to maintain my lawn and trim my hedge.\"", "\"What's the garden's surface area, and what condition is it in?\"", "\"Would you like a one-off visit or a seasonal contract?\""],
        offer: { company: "Vert Léman Paysage Sàrl", rows: [["Mowing and maintenance (14 visits)", 1045], ["Hedge trimming", 125], ["Green waste removal", 80]] },
        roi: "Just one extra maintenance contract can already cover your subscription for the season.",
      },
      demo: {
        brand: "Vert Léman Paysage",
        eyebrow: "Morges & Lavaux · Fictional example",
        hero: { h1: "A well-kept garden, without giving up your weekends.", text: "Lawn maintenance, hedge trimming, tree pruning and garden design around Lake Geneva — get a firm price in seconds, right on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "850+", lbl: "GARDENS MAINTAINED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we maintain",
        servicesSub: "Choose a service, or simply describe your garden in the \"Get a quote\" tab.",
        services: [
          { icon: "🌱", title: "Mowing and maintenance", text: "Lawns maintained seasonally or one-off.", tag: "from CHF 62/h" },
          { icon: "✂️", title: "Hedge trimming", text: "Hedges, shrubs and beds trimmed neatly.", tag: "from CHF 150" },
          { icon: "🌳", title: "Tree pruning", text: "Crown reduction, thinning and safe felling.", tag: "from CHF 280" },
          { icon: "🏡", title: "Garden design", text: "Planting, lawns, terraces and flower beds.", tag: "on quote" },
          { icon: "🍃", title: "Green waste removal", text: "Green waste removed and sorted.", tag: "from CHF 85" },
          { icon: "💧", title: "Automatic irrigation", text: "Check and restart in spring.", tag: "CHF 90" },
        ],
        about: {
          title: "Local gardeners, at your service all year round",
          text: "Vert Léman Paysage has maintained private gardens and co-ownerships between Morges and Lavaux since 2009. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Dedicated teams", "the same gardener comes to you every visit."], ["Professional equipment", "mowers, hedge trimmers and shredders, well maintained."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 10", email: "hello@vert-leman.demo", zone: "Morges, Lavaux, La Côte", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your garden — you'll receive a real quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe your garden…",
        pdfCompany: { name: "Vert Léman Paysage Sàrl", address: "Route de Lausanne 45, 1110 Morges", phone: "021 000 00 10", email: "hello@vert-leman.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your garden, then give you a firm quote right after.",
        addressPlaceholder: "Garden address (street, postcode, town)",
        terms: "Firm quote, valid 30 days. Green waste removal only if the option is selected. Swiss VAT included where applicable.",
        q: {
          service: { text: "Which service would you like?", short: "Service", opts: { lawn: "Lawn mowing and maintenance", hedge: "Hedge and shrub trimming", prune: "Tree pruning", design: "Garden design / renovation", yearly: "Full annual maintenance" } },
          surface: { text: "What's the surface area of the garden?", short: "Surface", opts: { s1: "Less than 200 m²", s2: "200 to 500 m²", s3: "500 to 1000 m²", s4: "1000 to 2000 m²", s5: "More than 2000 m²" } },
          state: { text: "What condition is the garden in?", short: "Garden condition", opts: { ok: "Regularly maintained", neg: "A little neglected", wild: "Very overgrown" } },
          freq: { text: "How often would you like mowing?", short: "Frequency", opts: { once: "One-off visit", monthly: "Once a month (season)", biweekly: "Every two weeks (season)", weekly: "Every week (season)" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { waste: "Green waste removal", weed: "Weeding of flower beds", fert: "Fertilising / moss treatment", irrig: "Automatic irrigation check" } },
          date: { text: "From what date would you like to start?", short: "Preferred date" },
        },
        items: {
          lawn: "Mowing and maintenance — {n} visit(s), {m2} m²",
          hedge: "Hedge and shrub trimming ({m2} m²)",
          prune: "Tree pruning (crew + shredding)",
          design: "Garden design / renovation (up to {m2} m²)",
          yearly: "Annual maintenance — lawn (14 visits) + 2 hedge trims",
          waste: "Green waste removal",
          weed: "Weeding of flower beds",
          fert: "Fertilising / moss treatment",
          irrig: "Automatic irrigation check",
        },
      },
    },

    de: {
      label: "Gartenbau und Landschaftspflege",
      forWho: "Garten- und Landschaftsbauunternehmen",
      pitch: "Berechnen Sie Rasenpflege, Schnitt und Unterhalt nach Fläche und Zustand des Gartens.",
      emailNoun: "die Pflege Ihres Gartens",
      landing: {
        h1: ["SIE GÄRTNERN.", "DEALZ RECHNET."],
        question: "Wie viele Anfragen für Gartenpflege verlieren Sie, während Sie bei einem Kunden sind?",
        text: "Im Frühling klingelt das Telefon ununterbrochen — und Sie stehen am Rasenmäher. Dealz antwortet Ihren Kunden an Ihrer Stelle, stellt die richtigen Fragen (Fläche, Zustand des Gartens, Häufigkeit), berechnet Ihren Preis nach Ihren Tarifen und erstellt deren Offerte.",
        clientQ: "Was kostet die Pflege eines 350 m² grossen Rasens alle zwei Wochen?",
        values: [
          { icon: "📐", title: "Offerten nach Fläche", text: "Fläche, Zustand des Geländes, Häufigkeit: Dealz berechnet Standardpflegeleistungen ohne vorherige Besichtigung." },
          { icon: "🌱", title: "Frühlingsspitze abgefedert", text: "Wenn im März und April die Anfragen zunehmen, erhält jede sofort eine Antwort — auch während Sie arbeiten." },
          { icon: "🔁", title: "Qualifizierte Dauerverträge", text: "Saisonpauschalen (wöchentlich, zweiwöchentlich) werden von Anfang an angeboten, mit dem von Ihnen definierten Mengenrabatt." },
          { icon: "🍂", title: "Optionen automatisch berechnet", text: "Entsorgung von Grünabfällen, Unkrautentfernung, Düngung, Bewässerung: jede Option wird gemäss Ihren Regeln zur Offerte hinzugefügt." },
        ],
        step1: "Importieren Sie Ihre Tarife: Stundensatz, Pauschalen pro Fläche, Schnitt, Baumpflege, Häufigkeitsrabatte. Ihr Excel bleibt Ihr Arbeitsinstrument.",
        step2: "Die Engine versteht Ihre Flächen, den Zustand der Gelände, Ihre Durchgangshäufigkeiten und Ihre Optionen.",
        excel: { file: "tarife-gartenbau.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Rasenpflege und Unterhalt", "350 m² · 14 Einsätze", "CHF 1045"], ["Heckenschnitt", "350 m²", "CHF 125"], ["Entsorgung Grünabfälle", "Pauschale", "CHF 80"]] },
        chat: ["«Ich suche jemanden für die Pflege meines Rasens und den Schnitt meiner Hecke.»", "«Wie gross ist der Garten, und in welchem Zustand befindet er sich?»", "«Wünschen Sie einen einmaligen Einsatz oder einen Saisonvertrag?»"],
        offer: { company: "Vert Léman Paysage Sàrl", rows: [["Rasenpflege und Unterhalt (14 Einsätze)", 1045], ["Heckenschnitt", 125], ["Entsorgung der Grünabfälle", 80]] },
        roi: "Schon ein einziger zusätzlicher Pflegevertrag kann Ihr Abonnement für die Saison decken.",
      },
      demo: {
        brand: "Vert Léman Paysage",
        eyebrow: "Morges & Lavaux · Fiktives Beispiel",
        hero: { h1: "Ein gepflegter Garten, ohne dass Sie Ihre Wochenenden dafür opfern.", text: "Rasenpflege, Heckenschnitt, Baumschnitt und Gartengestaltung rund um den Genfersee — erhalten Sie in Sekunden einen festen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "850+", lbl: "GEPFLEGTE GÄRTEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir pflegen",
        servicesSub: "Wählen Sie eine Leistung oder beschreiben Sie Ihren Garten einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🌱", title: "Rasenpflege und Unterhalt", text: "Rasenflächen saisonal oder einmalig gepflegt.", tag: "ab CHF 62/Std." },
          { icon: "✂️", title: "Heckenschnitt", text: "Hecken, Sträucher und Beete sauber geschnitten.", tag: "ab CHF 150" },
          { icon: "🌳", title: "Baumschnitt", text: "Kronenrückschnitt, Auslichtung und sicheres Fällen.", tag: "ab CHF 280" },
          { icon: "🏡", title: "Gartengestaltung", text: "Pflanzungen, Rasen, Terrassen und Beete.", tag: "auf Offerte" },
          { icon: "🍃", title: "Grünentsorgung", text: "Grünabfälle abgeholt und sortiert.", tag: "ab CHF 85" },
          { icon: "💧", title: "Automatische Bewässerung", text: "Kontrolle und Wiederinbetriebnahme im Frühling.", tag: "CHF 90" },
        ],
        about: {
          title: "Lokale Gärtner, das ganze Jahr für Sie im Einsatz",
          text: "Vert Léman Paysage pflegt Privatgärten und Stockwerkeigentümergemeinschaften zwischen Morges und Lavaux seit 2009. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Feste Teams", "derselbe Gärtner kommt bei jedem Einsatz zu Ihnen."], ["Professionelle Ausrüstung", "Rasenmäher, Heckenscheren und Schredder, gut gewartet."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "021 000 00 10", email: "hello@vert-leman.demo", zone: "Morges, Lavaux, La Côte", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Garten — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihren Garten…",
        pdfCompany: { name: "Vert Léman Paysage Sàrl", address: "Route de Lausanne 45, 1110 Morges", phone: "021 000 00 10", email: "hello@vert-leman.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Garten und erstelle Ihnen direkt danach eine feste Offerte.",
        addressPlaceholder: "Adresse des Gartens (Strasse, PLZ, Ort)",
        terms: "Feste Offerte, 30 Tage gültig. Entsorgung von Grünabfällen nur bei gewählter Option. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          service: { text: "Welche Leistung wünschen Sie?", short: "Leistung", opts: { lawn: "Rasenmähen und -pflege", hedge: "Hecken- und Strauchschnitt", prune: "Baumschnitt", design: "Gartengestaltung / -renovation", yearly: "Komplette Jahrespflege" } },
          surface: { text: "Wie gross ist die Gartenfläche?", short: "Fläche", opts: { s1: "Weniger als 200 m²", s2: "200 bis 500 m²", s3: "500 bis 1000 m²", s4: "1000 bis 2000 m²", s5: "Mehr als 2000 m²" } },
          state: { text: "In welchem Zustand ist der Garten?", short: "Zustand des Gartens", opts: { ok: "Regelmässig gepflegt", neg: "Etwas vernachlässigt", wild: "Stark verwildert" } },
          freq: { text: "Wie oft wünschen Sie das Mähen?", short: "Häufigkeit", opts: { once: "Einmaliger Einsatz", monthly: "Einmal pro Monat (Saison)", biweekly: "Alle zwei Wochen (Saison)", weekly: "Jede Woche (Saison)" } },
          extras: { text: "Wünschen Sie Zusatzoptionen?", short: "Optionen", none: "Keine Option", opts: { waste: "Entsorgung der Grünabfälle", weed: "Unkrautentfernung in den Beeten", fert: "Düngung / Moosbehandlung", irrig: "Kontrolle der automatischen Bewässerung" } },
          date: { text: "Ab welchem Datum möchten Sie starten?", short: "Wunschtermin" },
        },
        items: {
          lawn: "Rasenpflege und Unterhalt — {n} Einsatz/Einsätze, {m2} m²",
          hedge: "Hecken- und Strauchschnitt ({m2} m²)",
          prune: "Baumschnitt (Team + Schreddern)",
          design: "Gartengestaltung / -renovation (bis zu {m2} m²)",
          yearly: "Jahrespflege — Rasen (14 Einsätze) + 2 Heckenschnitte",
          waste: "Entsorgung der Grünabfälle",
          weed: "Unkrautentfernung in den Beeten",
          fert: "Düngung / Moosbehandlung",
          irrig: "Kontrolle der automatischen Bewässerung",
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
