/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "toiture",
    icon: "🏠",
    needsAddress: true,
    colors: { main: "#3d5a80", dark: "#2c4463", light: "#dde6f2", accent: "#e0712c", accentDark: "#c25a1a", bg: "#f9fbfd" },

    quote: {
      minimum: 350,
      questions: [
        { id: "work", type: "single", options: [{ id: "repair" }, { id: "cleaning" }, { id: "renovation" }, { id: "gutters" }] },
        {
          id: "damage", type: "single",
          when: function (a) { return a.work.id === "repair"; },
          options: [{ id: "small", price: 380 }, { id: "leak", price: 950 }, { id: "storm", price: 2400 }],
        },
        {
          id: "surf", type: "single",
          when: function (a) { return a.work.id === "cleaning" || a.work.id === "renovation"; },
          options: [{ id: "s1", m2: 60 }, { id: "s2", m2: 120 }, { id: "s3", m2: 200 }, { id: "s4", m2: 320 }],
        },
        {
          id: "material", type: "single",
          when: function (a) { return a.work.id === "renovation"; },
          options: [{ id: "tiles", rate: 115 }, { id: "slate", rate: 165 }, { id: "metal", rate: 135 }, { id: "flat", rate: 120 }],
        },
        {
          id: "gutterlen", type: "single",
          when: function (a) { return a.work.id === "gutters"; },
          options: [{ id: "g1", m: 12 }, { id: "g2", m: 25 }, { id: "g3", m: 40 }, { id: "g4", m: 60 }],
        },
        {
          id: "pitch", type: "single",
          when: function (a) { return a.work.id === "cleaning" || (a.work.id === "renovation" && a.material.id !== "flat"); },
          options: [{ id: "low", k: 1 }, { id: "std", k: 1.1 }, { id: "steep", k: 1.25 }],
        },
        { id: "height", type: "single", options: [{ id: "h1", lift: 0, scaf: 12 }, { id: "h2", lift: 390, scaf: 16 }, { id: "h3", lift: 780, scaf: 22 }] },
        { id: "extras", type: "multi", options: [{ id: "drone" }, { id: "hydro" }, { id: "skylight" }, { id: "chimney" }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var w = a.work.id;
        var base = 60;
        var k = a.pitch ? a.pitch.k : 1;
        if (w === "repair") {
          items.push({ label: L("diagnostic"), amount: 150 });
          items.push({ label: L("repair_" + a.damage.id), amount: a.damage.price });
        } else if (w === "cleaning") {
          base = a.surf.m2;
          items.push({ label: L("cleaning", { m2: base }), amount: H.round5(base * 14 * k) });
        } else if (w === "renovation") {
          base = a.surf.m2;
          items.push({ label: L("strip", { m2: base }), amount: H.round5(base * 28) });
          items.push({ label: L("cover_" + a.material.id, { m2: base }), amount: H.round5(base * a.material.rate * k) });
          items.push({ label: L("scaffold"), amount: H.round5(base * a.height.scaf) });
          items.push({ label: L("waste"), amount: H.round5(base * 6 + 250) });
        } else {
          items.push({ label: L("gutters", { m: a.gutterlen.m }), amount: H.round5(a.gutterlen.m * 68) });
        }
        if (w !== "renovation" && a.height.lift) items.push({ label: L("lift"), amount: a.height.lift });
        (a.extras || []).forEach(function (e) {
          if (e.id === "drone") items.push({ label: L("drone"), amount: 190 });
          if (e.id === "hydro") items.push({ label: L("hydro", { m2: base }), amount: H.round5(base * 9 + 150) });
          if (e.id === "skylight") items.push({ label: L("skylight"), amount: 1450 });
          if (e.id === "chimney") items.push({ label: L("chimney"), amount: 680 });
        });
        return items;
      },
    },

    fr: {
      label: "Toiture et couverture",
      forWho: "couvreurs et entreprises de toiture",
      pitch: "Chiffrez réparations, démoussage et réfections de toit sans monter sur l'échelle.",
      emailNoun: "vos travaux de toiture",
      landing: {
        h1: ["VOUS ÊTES SUR LE TOIT.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de devis toiture perdez-vous parce que vous êtes sur un chantier ?",
        text: "Après un orage ou avant l'hiver, les clients veulent un prix tout de suite. Dealz leur répond à toute heure, pose les bonnes questions (type de travaux, surface, matériau, pente, hauteur du bâtiment), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour refaire la toiture en tuiles de ma maison, environ 120 m² ?",
        values: [
          { icon: "⛈️", title: "Prêt quand la météo frappe", text: "Après une tempête, les demandes arrivent toutes en même temps. Dealz les qualifie toutes, même la nuit, et vous les classez par urgence." },
          { icon: "📐", title: "Surface, pente, matériau : tout est chiffré", text: "Tuiles, ardoise, tôle ou toit plat, pente forte ou faible : chaque paramètre suit vos propres règles de prix." },
          { icon: "🪜", title: "Moins de visites inutiles", text: "Démoussage, gouttières, petites réparations : prix ferme en ligne. Vous ne vous déplacez que pour les chantiers qui le justifient." },
          { icon: "🏗️", title: "Échafaudage et accès inclus", text: "Hauteur du bâtiment, nacelle, échafaudage, évacuation des déchets : plus d'oubli dans vos devis." },
        ],
        step1: "Importez vos tarifs : prix au m² par matériau, dépose, échafaudage, nacelle, ferblanterie. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos majorations de pente et de hauteur, et vos options.",
        excel: { file: "tarifs-toiture.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Couverture tuiles", "120 m² · pente standard", "CHF 15 180"], ["Dépose ancienne couverture", "120 m²", "CHF 3 360"], ["Échafaudage", "2 étages · 120 m²", "CHF 1 920"]] },
        chat: ["« Notre toit a 40 ans, il faut le refaire. »", "« Quelle est la surface approximative du toit ? »", "« De quel matériau s'agit-il : tuiles, ardoise, tôle ? »"],
        offer: { company: "Sommet Toitures Sàrl", rows: [["Couverture en tuiles (120 m²)", 15180], ["Dépose de l'ancienne couverture", 3360], ["Échafaudage et sécurisation", 1920]] },
        roi: "Une seule réfection de toiture supplémentaire par an paie plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Sommet Toitures",
        eyebrow: "Vaud & Valais · Exemple fictif",
        hero: { h1: "Un toit solide, un prix clair, avant même la visite.", text: "Réparations, démoussage, réfection complète et ferblanterie en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "900+", lbl: "TOITS RÉNOVÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux de toiture",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🔧", title: "Réparations et fuites", text: "Tuiles cassées, infiltrations, dégâts de tempête.", tag: "dès CHF 380" },
          { icon: "🧽", title: "Nettoyage et démoussage", text: "Nettoyage basse pression et traitement anti-mousse.", tag: "dès CHF 14/m²" },
          { icon: "🏠", title: "Réfection complète", text: "Dépose, nouvelle couverture, évacuation des déchets.", tag: "dès CHF 115/m²" },
          { icon: "🌧️", title: "Gouttières et ferblanterie", text: "Chéneaux, descentes, raccords en zinc ou cuivre.", tag: "dès CHF 68/m" },
          { icon: "🪟", title: "Fenêtres de toit", text: "Pose et remplacement, raccords étanches.", tag: "dès CHF 1 450" },
          { icon: "🛰️", title: "Inspection par drone", text: "Rapport photo complet, sans monter sur le toit.", tag: "CHF 190" },
        ],
        about: {
          title: "Des couvreurs qui travaillent proprement",
          text: "Sommet Toitures intervient chez les particuliers, régies et PPE de Vaud et du Valais depuis 2008. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Chantier sécurisé", "échafaudage, filets et protections conformes SUVA."], ["Matériaux durables", "tuiles et ferblanterie de fabrication suisse."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "024 000 00 40", email: "hello@sommet-toitures.demo", zone: "Vaud, Valais, Fribourg", hours: "Lun–Ven, 7h–17h · urgences 7j/7" },
        devisNote: "Répondez à quelques questions sur votre toit — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos travaux de toiture…",
        pdfCompany: { name: "Sommet Toitures Sàrl", address: "Rue du Simplon 21, 1870 Monthey", phone: "024 000 00 40", email: "hello@sommet-toitures.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre toiture, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du bâtiment (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, matériaux et main-d'œuvre compris. Dégâts cachés découverts à la dépose facturés sur accord préalable. TVA suisse incluse le cas échéant.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { repair: "Réparation (tuiles cassées, fuite, dégâts)", cleaning: "Nettoyage et démoussage", renovation: "Réfection complète de la toiture", gutters: "Gouttières et ferblanterie" } },
          damage: { text: "Quelle est l'ampleur des dégâts ?", short: "Dégâts", opts: { small: "Quelques tuiles à remplacer", leak: "Fuite ou infiltration à localiser", storm: "Dégâts importants (tempête, grêle)" } },
          surf: { text: "Quelle est la surface approximative du toit ?", short: "Surface", opts: { s1: "Petit toit (moins de 80 m²)", s2: "Maison individuelle (80–150 m²)", s3: "Grande maison (150–250 m²)", s4: "Immeuble ou grand bâtiment (250 m² et plus)" } },
          material: { text: "Quelle couverture souhaitez-vous ?", short: "Couverture", opts: { tiles: "Tuiles en terre cuite", slate: "Ardoise naturelle", metal: "Tôle ou zinc", flat: "Toit plat (étanchéité)" } },
          gutterlen: { text: "Quelle longueur de gouttières faut-il remplacer ?", short: "Longueur", opts: { g1: "Moins de 15 m", g2: "15 à 30 m", g3: "30 à 50 m", g4: "50 m et plus" } },
          pitch: { text: "Quelle est la pente du toit ?", short: "Pente", opts: { low: "Faible (moins de 25°)", std: "Standard (25–45°)", steep: "Forte (plus de 45°)" } },
          height: { text: "Combien d'étages compte le bâtiment ?", short: "Hauteur", opts: { h1: "Plain-pied ou 1 étage", h2: "2 étages", h3: "3 étages et plus" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { drone: "Inspection par drone avec rapport photo", hydro: "Traitement hydrofuge et anti-mousse", skylight: "Pose d'une fenêtre de toit", chimney: "Réfection de la ferblanterie de cheminée" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          diagnostic: "Déplacement et diagnostic",
          repair_small: "Remplacement de tuiles",
          repair_leak: "Recherche et réparation de fuite",
          repair_storm: "Réparation de dégâts de tempête",
          cleaning: "Nettoyage et démoussage ({m2} m²)",
          strip: "Dépose de l'ancienne couverture ({m2} m²)",
          cover_tiles: "Couverture en tuiles ({m2} m²)",
          cover_slate: "Couverture en ardoise ({m2} m²)",
          cover_metal: "Couverture en tôle / zinc ({m2} m²)",
          cover_flat: "Étanchéité de toit plat ({m2} m²)",
          scaffold: "Échafaudage et sécurisation",
          waste: "Évacuation et tri des déchets",
          gutters: "Remplacement des gouttières ({m} m)",
          lift: "Accès en hauteur (nacelle)",
          drone: "Inspection par drone avec rapport photo",
          hydro: "Traitement hydrofuge et anti-mousse ({m2} m²)",
          skylight: "Pose d'une fenêtre de toit",
          chimney: "Ferblanterie de cheminée",
        },
      },
    },
    en: {
      label: "Roofing",
      forWho: "roofers and roofing companies",
      pitch: "Price repairs, moss removal and re-roofing without climbing the ladder.",
      emailNoun: "your roofing work",
      landing: {
        h1: ["YOU'RE ON THE ROOF.", "DEALZ PRICES."],
        question: "How many roofing quote requests do you lose because you're up on a job?",
        text: "After a storm or before winter, customers want a price straight away. Dealz answers them at any hour, asks the right questions (type of work, area, material, pitch, building height), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to re-tile the roof of my house, about 120 m²?",
        values: [
          { icon: "⛈️", title: "Ready when the weather hits", text: "After a storm, requests all arrive at once. Dealz qualifies every one of them, even at night, so you can sort them by urgency." },
          { icon: "📐", title: "Area, pitch, material: all priced", text: "Tiles, slate, metal or flat roof, steep or shallow: every parameter follows your own pricing rules." },
          { icon: "🪜", title: "Fewer wasted visits", text: "Moss removal, gutters, small repairs: a firm price online. You only travel for the jobs that need it." },
          { icon: "🏗️", title: "Scaffolding and access included", text: "Building height, lift, scaffolding, waste removal: nothing forgotten in your quotes." },
        ],
        step1: "Import your rates: price per m² by material, stripping, scaffolding, lift, metalwork. Your Excel stays your working tool.",
        step2: "The engine understands your areas, your pitch and height surcharges, and your options.",
        excel: { file: "roofing-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Tile roofing", "120 m² · standard pitch", "CHF 15,180"], ["Old roof stripping", "120 m²", "CHF 3,360"], ["Scaffolding", "2 storeys · 120 m²", "CHF 1,920"]] },
        chat: ["“Our roof is 40 years old, it needs redoing.”", "“Roughly how large is the roof?”", "“What material: tiles, slate, metal?”"],
        offer: { company: "Sommet Toitures Sàrl", rows: [["Tile roofing (120 m²)", 15180], ["Stripping the old roof", 3360], ["Scaffolding and safety", 1920]] },
        roi: "A single extra re-roofing job per year pays for several years of subscription.",
      },
      demo: {
        brand: "Sommet Toitures",
        eyebrow: "Vaud & Valais · Fictional example",
        hero: { h1: "A solid roof and a clear price, before anyone visits.", text: "Repairs, moss removal, full re-roofing and metalwork in French-speaking Switzerland — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "900+", lbl: "ROOFS RENOVATED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our roofing work",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🔧", title: "Repairs and leaks", text: "Broken tiles, water ingress, storm damage.", tag: "from CHF 380" },
          { icon: "🧽", title: "Cleaning and moss removal", text: "Low-pressure cleaning and anti-moss treatment.", tag: "from CHF 14/m²" },
          { icon: "🏠", title: "Full re-roofing", text: "Stripping, new roof covering, waste removal.", tag: "from CHF 115/m²" },
          { icon: "🌧️", title: "Gutters and metalwork", text: "Gutters, downpipes, zinc or copper flashing.", tag: "from CHF 68/m" },
          { icon: "🪟", title: "Roof windows", text: "Fitting and replacement, watertight flashing.", tag: "from CHF 1,450" },
          { icon: "🛰️", title: "Drone inspection", text: "Full photo report, without climbing on the roof.", tag: "CHF 190" },
        ],
        about: {
          title: "Roofers who work cleanly",
          text: "Sommet Toitures has been working for households, property managers and co-owned buildings across Vaud and Valais since 2008. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Safe site", "scaffolding, nets and protection to SUVA standards."], ["Durable materials", "Swiss-made tiles and metalwork."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "024 000 00 40", email: "hello@sommet-toitures.demo", zone: "Vaud, Valais, Fribourg", hours: "Mon–Fri, 7am–5pm · emergencies 7 days" },
        devisNote: "Answer a few questions about your roof — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your roofing work…",
        pdfCompany: { name: "Sommet Toitures Sàrl", address: "Rue du Simplon 21, 1870 Monthey", phone: "024 000 00 40", email: "hello@sommet-toitures.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your roof, then put together a firm quote right away.",
        addressPlaceholder: "Building address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, materials and labour included. Hidden damage found during stripping charged only with prior agreement. Swiss VAT included where applicable.",
        q: {
          work: { text: "What kind of work do you need?", short: "Work", opts: { repair: "Repair (broken tiles, leak, damage)", cleaning: "Cleaning and moss removal", renovation: "Full re-roofing", gutters: "Gutters and metalwork" } },
          damage: { text: "How extensive is the damage?", short: "Damage", opts: { small: "A few tiles to replace", leak: "A leak to locate and fix", storm: "Major damage (storm, hail)" } },
          surf: { text: "Roughly how large is the roof?", short: "Area", opts: { s1: "Small roof (under 80 m²)", s2: "Detached house (80–150 m²)", s3: "Large house (150–250 m²)", s4: "Apartment or large building (250 m² or more)" } },
          material: { text: "Which roof covering would you like?", short: "Covering", opts: { tiles: "Clay tiles", slate: "Natural slate", metal: "Metal sheet or zinc", flat: "Flat roof (waterproofing)" } },
          gutterlen: { text: "How much guttering needs replacing?", short: "Length", opts: { g1: "Under 15 m", g2: "15 to 30 m", g3: "30 to 50 m", g4: "50 m or more" } },
          pitch: { text: "How steep is the roof?", short: "Pitch", opts: { low: "Shallow (under 25°)", std: "Standard (25–45°)", steep: "Steep (over 45°)" } },
          height: { text: "How many storeys does the building have?", short: "Height", opts: { h1: "Single storey or 1 floor", h2: "2 floors", h3: "3 floors or more" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { drone: "Drone inspection with photo report", hydro: "Water-repellent and anti-moss treatment", skylight: "Roof window fitting", chimney: "Chimney flashing renewal" } },
          date: { text: "When would you like the work done?", short: "Preferred date" },
        },
        items: {
          diagnostic: "Call-out and diagnosis",
          repair_small: "Tile replacement",
          repair_leak: "Leak detection and repair",
          repair_storm: "Storm damage repair",
          cleaning: "Cleaning and moss removal ({m2} m²)",
          strip: "Stripping the old roof ({m2} m²)",
          cover_tiles: "Tile roofing ({m2} m²)",
          cover_slate: "Slate roofing ({m2} m²)",
          cover_metal: "Metal / zinc roofing ({m2} m²)",
          cover_flat: "Flat roof waterproofing ({m2} m²)",
          scaffold: "Scaffolding and safety",
          waste: "Waste removal and sorting",
          gutters: "Gutter replacement ({m} m)",
          lift: "Working at height (lift)",
          drone: "Drone inspection with photo report",
          hydro: "Water-repellent and anti-moss treatment ({m2} m²)",
          skylight: "Roof window fitting",
          chimney: "Chimney flashing",
        },
      },
    },
    de: {
      label: "Dach und Bedachung",
      forWho: "Dachdecker und Bedachungsbetriebe",
      pitch: "Reparaturen, Moosentfernung und Neueindeckungen berechnen — ohne auf die Leiter zu steigen.",
      emailNoun: "Ihre Dacharbeiten",
      landing: {
        h1: ["SIE SIND AUF DEM DACH.", "DEALZ RECHNET."],
        question: "Wie viele Dachofferten-Anfragen verlieren Sie, weil Sie auf einer Baustelle sind?",
        text: "Nach einem Unwetter oder vor dem Winter wollen Kunden sofort einen Preis. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Art der Arbeiten, Fläche, Material, Dachneigung, Gebäudehöhe), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet es, das Ziegeldach meines Hauses neu einzudecken, etwa 120 m²?",
        values: [
          { icon: "⛈️", title: "Bereit, wenn das Wetter zuschlägt", text: "Nach einem Sturm kommen alle Anfragen gleichzeitig. Dealz qualifiziert jede einzelne, auch nachts, und Sie sortieren nach Dringlichkeit." },
          { icon: "📐", title: "Fläche, Neigung, Material: alles berechnet", text: "Ziegel, Schiefer, Blech oder Flachdach, steil oder flach: Jeder Parameter folgt Ihren eigenen Preisregeln." },
          { icon: "🪜", title: "Weniger unnötige Besichtigungen", text: "Moosentfernung, Dachrinnen, kleine Reparaturen: verbindlicher Preis online. Sie fahren nur noch hin, wenn es sich lohnt." },
          { icon: "🏗️", title: "Gerüst und Zugang inbegriffen", text: "Gebäudehöhe, Hebebühne, Gerüst, Entsorgung: nichts wird in Ihren Offerten mehr vergessen." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m² nach Material, Abdecken, Gerüst, Hebebühne, Spenglerarbeiten. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Flächen, Ihre Zuschläge für Neigung und Höhe sowie Ihre Optionen.",
        excel: { file: "tarife-dach.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Ziegeleindeckung", "120 m² · normale Neigung", "CHF 15'180"], ["Abdecken alte Eindeckung", "120 m²", "CHF 3'360"], ["Gerüst", "2 Stockwerke · 120 m²", "CHF 1'920"]] },
        chat: ["«Unser Dach ist 40 Jahre alt und muss erneuert werden.»", "«Wie gross ist die Dachfläche ungefähr?»", "«Welches Material: Ziegel, Schiefer, Blech?»"],
        offer: { company: "Sommet Toitures Sàrl", rows: [["Ziegeleindeckung (120 m²)", 15180], ["Abdecken der alten Eindeckung", 3360], ["Gerüst und Absicherung", 1920]] },
        roi: "Eine einzige zusätzliche Dachsanierung pro Jahr bezahlt mehrere Jahre Abo.",
      },
      demo: {
        brand: "Sommet Toitures",
        eyebrow: "Waadt & Wallis · Fiktives Beispiel",
        hero: { h1: "Ein solides Dach und ein klarer Preis, noch vor der Besichtigung.", text: "Reparaturen, Moosentfernung, Neueindeckungen und Spenglerarbeiten in der Westschweiz — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "900+", lbl: "SANIERTE DÄCHER" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Dacharbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🔧", title: "Reparaturen und Lecks", text: "Kaputte Ziegel, Wassereintritt, Sturmschäden.", tag: "ab CHF 380" },
          { icon: "🧽", title: "Reinigung und Moosentfernung", text: "Niederdruckreinigung und Anti-Moos-Behandlung.", tag: "ab CHF 14/m²" },
          { icon: "🏠", title: "Komplette Neueindeckung", text: "Abdecken, neue Eindeckung, Entsorgung.", tag: "ab CHF 115/m²" },
          { icon: "🌧️", title: "Dachrinnen und Spenglerei", text: "Rinnen, Fallrohre, Anschlüsse in Zink oder Kupfer.", tag: "ab CHF 68/m" },
          { icon: "🪟", title: "Dachfenster", text: "Einbau und Ersatz, dichte Anschlüsse.", tag: "ab CHF 1'450" },
          { icon: "🛰️", title: "Drohneninspektion", text: "Vollständiger Fotobericht, ohne aufs Dach zu steigen.", tag: "CHF 190" },
        ],
        about: {
          title: "Dachdecker, die sauber arbeiten",
          text: "Sommet Toitures arbeitet seit 2008 für Privatpersonen, Verwaltungen und Stockwerkeigentümer in der Waadt und im Wallis. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Sichere Baustelle", "Gerüst, Netze und Schutz nach SUVA-Vorgaben."], ["Langlebige Materialien", "Ziegel und Spenglerarbeiten aus Schweizer Produktion."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "024 000 00 40", email: "hello@sommet-toitures.demo", zone: "Waadt, Wallis, Freiburg", hours: "Mo–Fr, 7–17 Uhr · Notfälle 7 Tage" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Dach — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Dacharbeiten…",
        pdfCompany: { name: "Sommet Toitures Sàrl", address: "Rue du Simplon 21, 1870 Monthey", phone: "024 000 00 40", email: "hello@sommet-toitures.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Dach und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse des Gebäudes (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Material und Arbeit inbegriffen. Beim Abdecken entdeckte versteckte Schäden nur nach vorheriger Absprache. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          work: { text: "Welche Arbeiten wünschen Sie?", short: "Arbeiten", opts: { repair: "Reparatur (kaputte Ziegel, Leck, Schäden)", cleaning: "Reinigung und Moosentfernung", renovation: "Komplette Neueindeckung", gutters: "Dachrinnen und Spenglerei" } },
          damage: { text: "Wie gross sind die Schäden?", short: "Schäden", opts: { small: "Einige Ziegel zu ersetzen", leak: "Leck suchen und beheben", storm: "Grössere Schäden (Sturm, Hagel)" } },
          surf: { text: "Wie gross ist die Dachfläche ungefähr?", short: "Fläche", opts: { s1: "Kleines Dach (unter 80 m²)", s2: "Einfamilienhaus (80–150 m²)", s3: "Grosses Haus (150–250 m²)", s4: "Mehrfamilienhaus oder grosses Gebäude (250 m² und mehr)" } },
          material: { text: "Welche Eindeckung wünschen Sie?", short: "Eindeckung", opts: { tiles: "Tonziegel", slate: "Naturschiefer", metal: "Blech oder Zink", flat: "Flachdach (Abdichtung)" } },
          gutterlen: { text: "Wie viele Meter Dachrinne sind zu ersetzen?", short: "Länge", opts: { g1: "Unter 15 m", g2: "15 bis 30 m", g3: "30 bis 50 m", g4: "50 m und mehr" } },
          pitch: { text: "Wie steil ist das Dach?", short: "Neigung", opts: { low: "Flach geneigt (unter 25°)", std: "Normal (25–45°)", steep: "Steil (über 45°)" } },
          height: { text: "Wie viele Stockwerke hat das Gebäude?", short: "Höhe", opts: { h1: "Erdgeschoss oder 1 Stockwerk", h2: "2 Stockwerke", h3: "3 Stockwerke und mehr" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { drone: "Drohneninspektion mit Fotobericht", hydro: "Wasserabweisende und Anti-Moos-Behandlung", skylight: "Einbau eines Dachfensters", chimney: "Erneuerung der Kaminverwahrung" } },
          date: { text: "Wann wünschen Sie die Arbeiten?", short: "Wunschtermin" },
        },
        items: {
          diagnostic: "Anfahrt und Diagnose",
          repair_small: "Ersatz von Ziegeln",
          repair_leak: "Lecksuche und Reparatur",
          repair_storm: "Reparatur von Sturmschäden",
          cleaning: "Reinigung und Moosentfernung ({m2} m²)",
          strip: "Abdecken der alten Eindeckung ({m2} m²)",
          cover_tiles: "Ziegeleindeckung ({m2} m²)",
          cover_slate: "Schiefereindeckung ({m2} m²)",
          cover_metal: "Blech- / Zinkeindeckung ({m2} m²)",
          cover_flat: "Flachdachabdichtung ({m2} m²)",
          scaffold: "Gerüst und Absicherung",
          waste: "Entsorgung und Trennung der Abfälle",
          gutters: "Ersatz der Dachrinnen ({m} m)",
          lift: "Arbeiten in der Höhe (Hebebühne)",
          drone: "Drohneninspektion mit Fotobericht",
          hydro: "Wasserabweisende und Anti-Moos-Behandlung ({m2} m²)",
          skylight: "Einbau eines Dachfensters",
          chimney: "Kaminverwahrung",
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
