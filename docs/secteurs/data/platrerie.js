/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var RATE = { partition: 95, ceiling: 85, plaster: 38 };
  var S = {
    slug: "platrerie",
    icon: "🧱",
    needsAddress: true,
    colors: { main: "#6c757d", dark: "#495057", light: "#e9ecef", accent: "#e8590c", accentDark: "#c2410c", bg: "#fafafa" },

    quote: {
      minimum: 450,
      questions: [
        { id: "work", type: "single", options: [{ id: "partition" }, { id: "ceiling" }, { id: "plaster" }, { id: "repair" }] },
        { id: "surf", type: "single", options: [{ id: "s1", m2: 10 }, { id: "s2", m2: 25 }, { id: "s3", m2: 50 }, { id: "s4", m2: 100 }, { id: "s5", m2: 200 }] },
        {
          id: "finish", type: "single",
          when: function (a) { return a.work.id !== "repair"; },
          options: [{ id: "q2", k: 1 }, { id: "q3", k: 1.15 }, { id: "q4", k: 1.35 }],
        },
        { id: "height", type: "single", options: [{ id: "h1", k: 1, scaf: 0 }, { id: "h2", k: 1.15, scaf: 0 }, { id: "h3", k: 1.35, scaf: 450 }] },
        { id: "extras", type: "multi", options: [{ id: "acoustic" }, { id: "fire" }, { id: "primer" }, { id: "protect" }] },
        { id: "date", type: "date", minDays: 5 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surf.m2;
        var hk = a.height.k;
        if (a.work.id === "repair") {
          items.push({ label: L("callout"), amount: 180 });
          items.push({ label: L("repair", { m2: m2 }), amount: H.round5(m2 * 24 * hk + 200) });
        } else {
          items.push({ label: L("work_" + a.work.id, { m2: m2 }), amount: H.round5(m2 * RATE[a.work.id] * a.finish.k * hk) });
        }
        if (a.height.scaf) items.push({ label: L("scaffold"), amount: a.height.scaf });
        (a.extras || []).forEach(function (e) {
          if (e.id === "acoustic") items.push({ label: L("acoustic", { m2: m2 }), amount: H.round5(m2 * 28) });
          if (e.id === "fire") items.push({ label: L("fire", { m2: m2 }), amount: H.round5(m2 * 22) });
          if (e.id === "primer") items.push({ label: L("primer", { m2: m2 }), amount: H.round5(m2 * 6 + 80) });
          if (e.id === "protect") items.push({ label: L("protect"), amount: H.round5(m2 * 4 + 120) });
        });
        return items;
      },
    },

    fr: {
      label: "Plâtrerie et plafonds",
      forWho: "plâtriers et entreprises de plâtrerie",
      pitch: "Chiffrez cloisons, faux-plafonds et enduits au m², sans passer une soirée sur vos devis.",
      emailNoun: "vos travaux de plâtrerie",
      landing: {
        h1: ["VOUS ENDUISEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de plâtrerie restent sans réponse parce que vous êtes sur le chantier ?",
        text: "Cloisons, plafonds, lissage : vos clients veulent un ordre de prix avant de lancer leurs travaux. Dealz leur répond à toute heure, pose les bonnes questions (type de travaux, surface, niveau de finition, hauteur), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour monter une cloison en plaques de plâtre d'environ 25 m² ?",
        values: [
          { icon: "📏", title: "Le m² chiffré tout de suite", text: "Surface, finition Q2 à Q4, hauteur sous plafond : le client obtient un prix ferme sans attendre votre passage." },
          { icon: "🧰", title: "Les options ne sont plus oubliées", text: "Isolation phonique, protection incendie, couche d'apprêt, protection des sols : chaque poste suit vos propres prix." },
          { icon: "🪜", title: "Hauteur et échafaudage inclus", text: "Les plafonds hauts et les échafaudages sont majorés automatiquement selon vos règles." },
          { icon: "🤝", title: "Des clients mieux préparés", text: "Vous recevez des demandes complètes, avec surface et date, et vous ne vous déplacez que pour les chantiers qui valent la peine." },
        ],
        step1: "Importez vos tarifs : prix au m² par type d'ouvrage, niveaux de finition, majorations de hauteur, options. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos niveaux Q2 à Q4 et vos suppléments.",
        excel: { file: "tarifs-platrerie.xlsx", headers: ["Ouvrage", "Condition", "Prix"], rows: [["Cloison en plaques de plâtre", "25 m² · Q3", "CHF 2 730"], ["Isolation phonique", "25 m²", "CHF 700"], ["Couche d'apprêt", "25 m²", "CHF 230"]] },
        chat: ["« Nous voulons séparer le séjour en deux. »", "« Quelle surface de cloison faut-il ? »", "« Quel niveau de finition : prêt à peindre ou lisse parfait ? »"],
        offer: { company: "Gypsa Plâtrerie Sàrl", rows: [["Cloison en plaques de plâtre (25 m²)", 2730], ["Isolation phonique (25 m²)", 700], ["Couche d'apprêt (25 m²)", 230]] },
        roi: "Deux chantiers de plâtrerie de plus par an paient plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Gypsa Plâtrerie",
        eyebrow: "Fribourg & Vaud · Exemple fictif",
        hero: { h1: "Cloisons, plafonds et enduits : votre prix au m² en une minute.", text: "Plâtrerie neuve, rénovation et réparations dans les cantons de Fribourg et Vaud — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "1 200+", lbl: "CHANTIERS RÉALISÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux de plâtrerie",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🧱", title: "Cloisons en plaques de plâtre", text: "Ossature métallique, plaques et bandes.", tag: "dès CHF 95/m²" },
          { icon: "⬜", title: "Faux-plafonds", text: "Plafonds suspendus, spots encastrés.", tag: "dès CHF 85/m²" },
          { icon: "🖌️", title: "Enduits et lissage", text: "Murs et plafonds prêts à peindre.", tag: "dès CHF 38/m²" },
          { icon: "🔧", title: "Réparations", text: "Fissures, trous, dégâts d'eau.", tag: "dès CHF 380" },
          { icon: "🔇", title: "Isolation phonique", text: "Laine minérale dans les cloisons.", tag: "dès CHF 28/m²" },
          { icon: "🔥", title: "Protection incendie", text: "Plaques coupe-feu EI30.", tag: "dès CHF 22/m²" },
        ],
        about: {
          title: "Des plâtriers soigneux et ponctuels",
          text: "Gypsa Plâtrerie travaille depuis 2009 pour les particuliers, architectes et entreprises générales de Fribourg et Vaud. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Chantier propre", "protection des sols et nettoyage chaque soir."], ["Finitions garanties", "niveau de finition convenu par écrit."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "026 000 01 02", email: "hello@gypsa-platrerie.demo", zone: "Fribourg, Vaud", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur vos travaux — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos travaux de plâtrerie…",
        pdfCompany: { name: "Gypsa Plâtrerie Sàrl", address: "Route de la Glâne 31, 1700 Fribourg", phone: "026 000 01 02", email: "hello@gypsa-platrerie.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos travaux de plâtrerie, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du chantier (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, matériaux et main-d'œuvre compris. Supports en mauvais état découverts sur place traités uniquement sur accord préalable.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { partition: "Nouvelle cloison en plaques de plâtre", ceiling: "Faux-plafond", plaster: "Enduit ou lissage de murs et plafonds", repair: "Réparation (fissures, trous, dégâts d'eau)" } },
          surf: { text: "Quelle est la surface concernée ?", short: "Surface", opts: { s1: "Environ 10 m²", s2: "Environ 25 m²", s3: "Environ 50 m²", s4: "Environ 100 m²", s5: "200 m² ou plus" } },
          finish: { text: "Quel niveau de finition souhaitez-vous ?", short: "Finition", opts: { q2: "Q2 standard (sous papier peint ou crépi)", q3: "Q3 prêt à peindre", q4: "Q4 lisse parfait (lumière rasante)" } },
          height: { text: "Quelle est la hauteur sous plafond ?", short: "Hauteur", opts: { h1: "Standard (jusqu'à 2,60 m)", h2: "Haute (2,60 à 3,50 m)", h3: "Très haute (plus de 3,50 m, échafaudage)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { acoustic: "Isolation phonique", fire: "Protection incendie EI30", primer: "Couche d'apprêt", protect: "Protection des sols et nettoyage" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          callout: "Déplacement et diagnostic",
          repair: "Réparation de plâtrerie ({m2} m²)",
          work_partition: "Cloison en plaques de plâtre ({m2} m²)",
          work_ceiling: "Faux-plafond ({m2} m²)",
          work_plaster: "Enduit et lissage ({m2} m²)",
          scaffold: "Échafaudage roulant",
          acoustic: "Isolation phonique ({m2} m²)",
          fire: "Protection incendie EI30 ({m2} m²)",
          primer: "Couche d'apprêt ({m2} m²)",
          protect: "Protection des sols et nettoyage",
        },
      },
    },
    en: {
      label: "Plastering and ceilings",
      forWho: "plasterers and drywall companies",
      pitch: "Price partitions, suspended ceilings and plastering per m², without spending your evenings on quotes.",
      emailNoun: "your plastering work",
      landing: {
        h1: ["YOU PLASTER.", "DEALZ PRICES."],
        question: "How many plastering requests go unanswered because you're on site?",
        text: "Partitions, ceilings, skimming: your customers want a price range before they start their project. Dealz answers them at any hour, asks the right questions (type of work, area, finish level, height), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to put up a plasterboard partition of about 25 m²?",
        values: [
          { icon: "📏", title: "Price per m² straight away", text: "Area, Q2 to Q4 finish, ceiling height: the customer gets a firm price without waiting for your visit." },
          { icon: "🧰", title: "Options no longer forgotten", text: "Sound insulation, fire protection, primer coat, floor protection: every item follows your own prices." },
          { icon: "🪜", title: "Height and scaffolding included", text: "High ceilings and scaffolding are surcharged automatically according to your rules." },
          { icon: "🤝", title: "Better-prepared customers", text: "You receive complete requests with area and date, and only travel for jobs that are worth it." },
        ],
        step1: "Import your rates: price per m² by type of work, finish levels, height surcharges, options. Your Excel stays your working tool.",
        step2: "The engine understands your areas, your Q2 to Q4 levels and your surcharges.",
        excel: { file: "plastering-rates.xlsx", headers: ["Work", "Condition", "Price"], rows: [["Plasterboard partition", "25 m² · Q3", "CHF 2,730"], ["Sound insulation", "25 m²", "CHF 700"], ["Primer coat", "25 m²", "CHF 230"]] },
        chat: ["“We want to split the living room in two.”", "“How much partition do you need?”", "“Which finish: ready to paint or perfectly smooth?”"],
        offer: { company: "Gypsa Plâtrerie Sàrl", rows: [["Plasterboard partition (25 m²)", 2730], ["Sound insulation (25 m²)", 700], ["Primer coat (25 m²)", 230]] },
        roi: "Two extra plastering jobs a year pay for several years of subscription.",
      },
      demo: {
        brand: "Gypsa Plâtrerie",
        eyebrow: "Fribourg & Vaud · Fictional example",
        hero: { h1: "Partitions, ceilings and plastering: your price per m² in a minute.", text: "New plastering, renovation and repairs in the cantons of Fribourg and Vaud — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "1,200+", lbl: "JOBS COMPLETED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our plastering work",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🧱", title: "Plasterboard partitions", text: "Metal studs, boards and taping.", tag: "from CHF 95/m²" },
          { icon: "⬜", title: "Suspended ceilings", text: "Dropped ceilings, recessed spotlights.", tag: "from CHF 85/m²" },
          { icon: "🖌️", title: "Plastering and skimming", text: "Walls and ceilings ready to paint.", tag: "from CHF 38/m²" },
          { icon: "🔧", title: "Repairs", text: "Cracks, holes, water damage.", tag: "from CHF 380" },
          { icon: "🔇", title: "Sound insulation", text: "Mineral wool inside partitions.", tag: "from CHF 28/m²" },
          { icon: "🔥", title: "Fire protection", text: "EI30 fire-rated boards.", tag: "from CHF 22/m²" },
        ],
        about: {
          title: "Careful, punctual plasterers",
          text: "Since 2009, Gypsa Plâtrerie has worked for households, architects and general contractors in Fribourg and Vaud. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Clean site", "floors protected and cleaned every evening."], ["Guaranteed finish", "finish level agreed in writing."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "026 000 01 02", email: "hello@gypsa-platrerie.demo", zone: "Fribourg, Vaud", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your work — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your plastering work…",
        pdfCompany: { name: "Gypsa Plâtrerie Sàrl", address: "Route de la Glâne 31, 1700 Fribourg", phone: "026 000 01 02", email: "hello@gypsa-platrerie.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your plastering work, then put together a firm quote right away.",
        addressPlaceholder: "Site address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, materials and labour included. Damaged substrates found on site treated only with prior agreement.",
        q: {
          work: { text: "What kind of work do you need?", short: "Work", opts: { partition: "New plasterboard partition", ceiling: "Suspended ceiling", plaster: "Plastering or skimming walls and ceilings", repair: "Repair (cracks, holes, water damage)" } },
          surf: { text: "How large is the area?", short: "Area", opts: { s1: "About 10 m²", s2: "About 25 m²", s3: "About 50 m²", s4: "About 100 m²", s5: "200 m² or more" } },
          finish: { text: "Which finish level would you like?", short: "Finish", opts: { q2: "Q2 standard (for wallpaper or render)", q3: "Q3 ready to paint", q4: "Q4 perfectly smooth (grazing light)" } },
          height: { text: "How high is the ceiling?", short: "Height", opts: { h1: "Standard (up to 2.60 m)", h2: "High (2.60 to 3.50 m)", h3: "Very high (over 3.50 m, scaffolding)" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { acoustic: "Sound insulation", fire: "EI30 fire protection", primer: "Primer coat", protect: "Floor protection and cleaning" } },
          date: { text: "When would you like the work done?", short: "Preferred date" },
        },
        items: {
          callout: "Call-out and diagnosis",
          repair: "Plaster repair ({m2} m²)",
          work_partition: "Plasterboard partition ({m2} m²)",
          work_ceiling: "Suspended ceiling ({m2} m²)",
          work_plaster: "Plastering and skimming ({m2} m²)",
          scaffold: "Mobile scaffolding",
          acoustic: "Sound insulation ({m2} m²)",
          fire: "EI30 fire protection ({m2} m²)",
          primer: "Primer coat ({m2} m²)",
          protect: "Floor protection and cleaning",
        },
      },
    },
    de: {
      label: "Gipserei und Decken",
      forWho: "Gipser und Gipsereibetriebe",
      pitch: "Trennwände, abgehängte Decken und Verputz pro m² berechnen — ohne Abende mit Offerten zu verbringen.",
      emailNoun: "Ihre Gipserarbeiten",
      landing: {
        h1: ["SIE GIPSEN.", "DEALZ RECHNET."],
        question: "Wie viele Gipser-Anfragen bleiben unbeantwortet, weil Sie auf der Baustelle sind?",
        text: "Trennwände, Decken, Abrieb: Ihre Kunden wollen eine Preisvorstellung, bevor sie loslegen. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Art der Arbeiten, Fläche, Qualitätsstufe, Raumhöhe), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet eine Gipsständerwand von etwa 25 m²?",
        values: [
          { icon: "📏", title: "Der m²-Preis sofort", text: "Fläche, Qualitätsstufe Q2 bis Q4, Raumhöhe: Der Kunde erhält einen verbindlichen Preis, ohne auf Ihren Besuch zu warten." },
          { icon: "🧰", title: "Keine vergessenen Optionen mehr", text: "Schallschutz, Brandschutz, Grundierung, Bodenschutz: Jede Position folgt Ihren eigenen Preisen." },
          { icon: "🪜", title: "Höhe und Gerüst inbegriffen", text: "Hohe Räume und Gerüste werden automatisch nach Ihren Regeln zugeschlagen." },
          { icon: "🤝", title: "Besser vorbereitete Kunden", text: "Sie erhalten vollständige Anfragen mit Fläche und Termin und fahren nur noch für lohnende Aufträge hin." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m² nach Arbeit, Qualitätsstufen, Höhenzuschläge, Optionen. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Flächen, Ihre Stufen Q2 bis Q4 und Ihre Zuschläge.",
        excel: { file: "tarife-gipserei.xlsx", headers: ["Arbeit", "Bedingung", "Preis"], rows: [["Gipsständerwand", "25 m² · Q3", "CHF 2'730"], ["Schallschutz", "25 m²", "CHF 700"], ["Grundierung", "25 m²", "CHF 230"]] },
        chat: ["«Wir möchten das Wohnzimmer zweiteilen.»", "«Wie viel Wandfläche brauchen Sie?»", "«Welche Qualität: streichfertig oder perfekt glatt?»"],
        offer: { company: "Gypsa Plâtrerie Sàrl", rows: [["Gipsständerwand (25 m²)", 2730], ["Schallschutz (25 m²)", 700], ["Grundierung (25 m²)", 230]] },
        roi: "Zwei zusätzliche Gipseraufträge pro Jahr bezahlen mehrere Jahre Abo.",
      },
      demo: {
        brand: "Gypsa Plâtrerie",
        eyebrow: "Freiburg & Waadt · Fiktives Beispiel",
        hero: { h1: "Trennwände, Decken und Verputz: Ihr m²-Preis in einer Minute.", text: "Neue Gipserarbeiten, Renovationen und Reparaturen in den Kantonen Freiburg und Waadt — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "1'200+", lbl: "AUSGEFÜHRTE AUFTRÄGE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Gipserarbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🧱", title: "Gipsständerwände", text: "Metallständer, Platten und Fugen.", tag: "ab CHF 95/m²" },
          { icon: "⬜", title: "Abgehängte Decken", text: "Unterdecken, eingebaute Spots.", tag: "ab CHF 85/m²" },
          { icon: "🖌️", title: "Verputz und Abrieb", text: "Wände und Decken streichfertig.", tag: "ab CHF 38/m²" },
          { icon: "🔧", title: "Reparaturen", text: "Risse, Löcher, Wasserschäden.", tag: "ab CHF 380" },
          { icon: "🔇", title: "Schallschutz", text: "Mineralwolle in den Trennwänden.", tag: "ab CHF 28/m²" },
          { icon: "🔥", title: "Brandschutz", text: "Brandschutzplatten EI30.", tag: "ab CHF 22/m²" },
        ],
        about: {
          title: "Sorgfältige und pünktliche Gipser",
          text: "Gypsa Plâtrerie arbeitet seit 2009 für Privatpersonen, Architekten und Generalunternehmer in Freiburg und in der Waadt. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Saubere Baustelle", "Bodenschutz und Reinigung jeden Abend."], ["Garantierte Qualität", "Qualitätsstufe schriftlich vereinbart."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "026 000 01 02", email: "hello@gypsa-platrerie.demo", zone: "Freiburg, Waadt", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Arbeiten — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Gipserarbeiten…",
        pdfCompany: { name: "Gypsa Plâtrerie Sàrl", address: "Route de la Glâne 31, 1700 Fribourg", phone: "026 000 01 02", email: "hello@gypsa-platrerie.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Gipserarbeiten und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse der Baustelle (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Material und Arbeit inbegriffen. Vor Ort entdeckte schadhafte Untergründe nur nach vorheriger Absprache.",
        q: {
          work: { text: "Welche Arbeiten wünschen Sie?", short: "Arbeiten", opts: { partition: "Neue Gipsständerwand", ceiling: "Abgehängte Decke", plaster: "Verputz oder Abrieb von Wänden und Decken", repair: "Reparatur (Risse, Löcher, Wasserschäden)" } },
          surf: { text: "Wie gross ist die betroffene Fläche?", short: "Fläche", opts: { s1: "Etwa 10 m²", s2: "Etwa 25 m²", s3: "Etwa 50 m²", s4: "Etwa 100 m²", s5: "200 m² oder mehr" } },
          finish: { text: "Welche Qualitätsstufe wünschen Sie?", short: "Qualität", opts: { q2: "Q2 Standard (für Tapete oder Abrieb)", q3: "Q3 streichfertig", q4: "Q4 perfekt glatt (Streiflicht)" } },
          height: { text: "Wie hoch ist der Raum?", short: "Raumhöhe", opts: { h1: "Normal (bis 2,60 m)", h2: "Hoch (2,60 bis 3,50 m)", h3: "Sehr hoch (über 3,50 m, Gerüst)" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { acoustic: "Schallschutz", fire: "Brandschutz EI30", primer: "Grundierung", protect: "Bodenschutz und Reinigung" } },
          date: { text: "Wann wünschen Sie die Arbeiten?", short: "Wunschtermin" },
        },
        items: {
          callout: "Anfahrt und Diagnose",
          repair: "Gipserreparatur ({m2} m²)",
          work_partition: "Gipsständerwand ({m2} m²)",
          work_ceiling: "Abgehängte Decke ({m2} m²)",
          work_plaster: "Verputz und Abrieb ({m2} m²)",
          scaffold: "Fahrgerüst",
          acoustic: "Schallschutz ({m2} m²)",
          fire: "Brandschutz EI30 ({m2} m²)",
          primer: "Grundierung ({m2} m²)",
          protect: "Bodenschutz und Reinigung",
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
