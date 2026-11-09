/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "isolation",
    icon: "🌡️",
    needsAddress: true,
    colors: { main: "#2b8a3e", dark: "#22702f", light: "#d3f9d8", accent: "#f08c00", accentDark: "#d9480f", bg: "#f8fdf9" },

    quote: {
      minimum: 900,
      questions: [
        { id: "where", type: "single", options: [{ id: "attic", rate: 38 }, { id: "roof", rate: 95 }, { id: "facade", rate: 165 }, { id: "cellar", rate: 55 }] },
        { id: "surf", type: "single", options: [{ id: "s1", m2: 30 }, { id: "s2", m2: 60 }, { id: "s3", m2: 100 }, { id: "s4", m2: 160 }, { id: "s5", m2: 250 }] },
        { id: "material", type: "single", options: [{ id: "mineral", k: 1 }, { id: "wood", k: 1.25 }, { id: "pir", k: 1.15 }] },
        { id: "extras", type: "multi", options: [{ id: "vapour" }, { id: "removal" }, { id: "cecb" }, { id: "subsidy" }] },
        { id: "date", type: "date", minDays: 14 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surf.m2;
        items.push({ label: L("ins_" + a.where.id, { m2: m2 }), amount: H.round5(m2 * a.where.rate * a.material.k) });
        if (a.where.id === "facade") items.push({ label: L("scaffold", { m2: m2 }), amount: H.round5(m2 * 16) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "vapour") items.push({ label: L("vapour", { m2: m2 }), amount: H.round5(m2 * 12) });
          if (e.id === "removal") items.push({ label: L("removal", { m2: m2 }), amount: H.round5(m2 * 15 + 200) });
          if (e.id === "cecb") items.push({ label: L("cecb"), amount: 750 });
          if (e.id === "subsidy") items.push({ label: L("subsidy"), amount: 350 });
        });
        return items;
      },
    },

    fr: {
      label: "Isolation thermique",
      forWho: "entreprises d'isolation et d'assainissement énergétique",
      pitch: "Chiffrez combles, toitures, façades et caves au m², avec les options énergie et subventions.",
      emailNoun: "vos travaux d'isolation",
      landing: {
        h1: ["VOUS ISOLEZ.", "DEALZ CHIFFRE."],
        question: "Combien de propriétaires abandonnent leur projet d'isolation parce qu'ils attendent votre devis ?",
        text: "Avec la hausse de l'énergie et les subventions, les demandes d'isolation explosent. Dealz répond à toute heure, pose les bonnes questions (partie du bâtiment, surface, isolant, pare-vapeur, CECB), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour isoler des combles d'environ 100 m² ?",
        values: [
          { icon: "🏠", title: "Combles, toiture, façade, cave", text: "Chaque partie du bâtiment a son prix au m², selon vos propres tarifs et l'isolant choisi." },
          { icon: "🌱", title: "Isolants comparés en direct", text: "Laine minérale, fibre de bois ou PIR : le client voit la différence de prix et choisit tout de suite." },
          { icon: "📄", title: "CECB et subventions", text: "Certificat énergétique et dossier du Programme Bâtiments s'ajoutent en un clic : des ventes en plus." },
          { icon: "⚡", title: "Le premier devis gagne", text: "Le propriétaire qui compare reçoit votre prix ferme en une minute, avant celui des autres." },
        ],
        step1: "Importez vos tarifs : prix au m² par partie du bâtiment et par isolant, échafaudage, pare-vapeur, CECB. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos coefficients d'isolant et vos options.",
        excel: { file: "tarifs-isolation.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Isolation des combles", "100 m² · laine minérale", "CHF 3 800"], ["Pare-vapeur", "100 m²", "CHF 1 200"], ["Certificat CECB", "maison individuelle", "CHF 750"]] },
        chat: ["« Notre maison perd beaucoup de chaleur par le toit. »", "« Quelle est la surface des combles ? »", "« Quel isolant préférez-vous : laine minérale ou fibre de bois ? »"],
        offer: { company: "IsoConfort Sàrl", rows: [["Isolation des combles (100 m²)", 3800], ["Pare-vapeur (100 m²)", 1200], ["Certificat énergétique CECB", 750]] },
        roi: "Deux chantiers d'isolation supplémentaires par an paient plusieurs années d'abonnement.",
      },
      demo: {
        brand: "IsoConfort",
        eyebrow: "Neuchâtel & Jura · Exemple fictif",
        hero: { h1: "Moins de chauffage, plus de confort : votre prix en une minute.", text: "Isolation des combles, toitures, façades et caves dans les cantons de Neuchâtel et du Jura — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "-30 %", lbl: "DE CHAUFFAGE EN MOYENNE" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux d'isolation",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🏠", title: "Combles perdus", text: "Soufflage ou rouleaux, travail rapide.", tag: "dès CHF 38/m²" },
          { icon: "📐", title: "Toiture et rampants", text: "Isolation sous toiture, entre chevrons.", tag: "dès CHF 95/m²" },
          { icon: "🧱", title: "Façade (isolation extérieure)", text: "Isolation périphérique avec crépi.", tag: "dès CHF 165/m²" },
          { icon: "🏚️", title: "Plafond de cave", text: "Panneaux isolants sous dalle.", tag: "dès CHF 55/m²" },
          { icon: "📄", title: "Certificat CECB", text: "Bilan énergétique officiel du bâtiment.", tag: "CHF 750" },
          { icon: "💶", title: "Dossier de subventions", text: "Programme Bâtiments, démarches incluses.", tag: "CHF 350" },
        ],
        about: {
          title: "Des spécialistes de l'efficacité énergétique",
          text: "IsoConfort isole depuis 2012 maisons, immeubles et fermes dans les cantons de Neuchâtel et du Jura. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Experts certifiés", "partenaire du Programme Bâtiments."], ["Matériaux durables", "isolants suisses et biosourcés disponibles."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "032 000 01 06", email: "hello@isoconfort.demo", zone: "Neuchâtel, Jura, Jura bernois", hours: "Lun–Ven, 7h30–17h" },
        devisNote: "Répondez à quelques questions sur votre bâtiment — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet d'isolation…",
        pdfCompany: { name: "IsoConfort Sàrl", address: "Rue des Fahys 51, 2000 Neuchâtel", phone: "032 000 01 06", email: "hello@isoconfort.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre bâtiment, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du bâtiment (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, matériaux et main-d'œuvre compris. Montant des subventions non déduit, versé directement au propriétaire.",
        q: {
          where: { text: "Quelle partie du bâtiment souhaitez-vous isoler ?", short: "Partie", opts: { attic: "Combles perdus (grenier non habité)", roof: "Toiture et rampants (combles habités)", facade: "Façade (isolation extérieure)", cellar: "Plafond de cave ou de garage" } },
          surf: { text: "Quelle est la surface à isoler ?", short: "Surface", opts: { s1: "Environ 30 m²", s2: "Environ 60 m²", s3: "Environ 100 m²", s4: "Environ 160 m²", s5: "250 m² ou plus" } },
          material: { text: "Quel isolant préférez-vous ?", short: "Isolant", opts: { mineral: "Laine minérale", wood: "Fibre de bois (écologique)", pir: "Panneaux PIR (haute performance)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { vapour: "Pare-vapeur", removal: "Retrait de l'ancien isolant", cecb: "Certificat énergétique CECB", subsidy: "Dossier de subventions" } },
          date: { text: "Pour quelle date souhaitez-vous les travaux ?", short: "Date souhaitée" },
        },
        items: {
          ins_attic: "Isolation des combles ({m2} m²)",
          ins_roof: "Isolation de la toiture ({m2} m²)",
          ins_facade: "Isolation extérieure de façade ({m2} m²)",
          ins_cellar: "Isolation du plafond de cave ({m2} m²)",
          scaffold: "Échafaudage ({m2} m²)",
          vapour: "Pare-vapeur ({m2} m²)",
          removal: "Retrait de l'ancien isolant ({m2} m²)",
          cecb: "Certificat énergétique CECB",
          subsidy: "Dossier de subventions",
        },
      },
    },
    en: {
      label: "Thermal insulation",
      forWho: "insulation and energy-retrofit companies",
      pitch: "Price lofts, roofs, facades and cellars per m², with energy and subsidy options.",
      emailNoun: "your insulation work",
      landing: {
        h1: ["YOU INSULATE.", "DEALZ PRICES."],
        question: "How many owners give up on insulating because they're still waiting for your quote?",
        text: "With rising energy prices and subsidies, insulation requests are booming. Dealz answers at any hour, asks the right questions (part of the building, area, insulation material, vapour barrier, energy certificate), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to insulate a loft of about 100 m²?",
        values: [
          { icon: "🏠", title: "Loft, roof, facade, cellar", text: "Each part of the building has its price per m², based on your own rates and the chosen material." },
          { icon: "🌱", title: "Materials compared live", text: "Mineral wool, wood fibre or PIR: the customer sees the price difference and chooses straight away." },
          { icon: "📄", title: "Energy certificate and subsidies", text: "CECB certificate and the Buildings Programme application are added in one click: extra sales." },
          { icon: "⚡", title: "The first quote wins", text: "The owner who is comparing gets your firm price in a minute, before anyone else's." },
        ],
        step1: "Import your rates: price per m² by part of the building and material, scaffolding, vapour barrier, CECB. Your Excel stays your working tool.",
        step2: "The engine understands your areas, your material factors and your options.",
        excel: { file: "insulation-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["Loft insulation", "100 m² · mineral wool", "CHF 3,800"], ["Vapour barrier", "100 m²", "CHF 1,200"], ["CECB certificate", "detached house", "CHF 750"]] },
        chat: ["“Our house loses a lot of heat through the roof.”", "“How large is the loft?”", "“Which material do you prefer: mineral wool or wood fibre?”"],
        offer: { company: "IsoConfort Sàrl", rows: [["Loft insulation (100 m²)", 3800], ["Vapour barrier (100 m²)", 1200], ["CECB energy certificate", 750]] },
        roi: "Two extra insulation jobs a year pay for several years of subscription.",
      },
      demo: {
        brand: "IsoConfort",
        eyebrow: "Neuchâtel & Jura · Fictional example",
        hero: { h1: "Less heating, more comfort: your price in a minute.", text: "Loft, roof, facade and cellar insulation in the cantons of Neuchâtel and Jura — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "-30%", lbl: "HEATING ON AVERAGE" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our insulation work",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🏠", title: "Unused lofts", text: "Blown or rolled insulation, quick work.", tag: "from CHF 38/m²" },
          { icon: "📐", title: "Roofs and sloped ceilings", text: "Under-roof insulation, between rafters.", tag: "from CHF 95/m²" },
          { icon: "🧱", title: "Facade (external insulation)", text: "External wall insulation with render.", tag: "from CHF 165/m²" },
          { icon: "🏚️", title: "Cellar ceilings", text: "Insulation boards under the slab.", tag: "from CHF 55/m²" },
          { icon: "📄", title: "CECB certificate", text: "Official energy rating of the building.", tag: "CHF 750" },
          { icon: "💶", title: "Subsidy application", text: "Buildings Programme, paperwork included.", tag: "CHF 350" },
        ],
        about: {
          title: "Energy-efficiency specialists",
          text: "Since 2012, IsoConfort has insulated houses, apartment buildings and farms in the cantons of Neuchâtel and Jura. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Certified experts", "Buildings Programme partner."], ["Sustainable materials", "Swiss and bio-based insulation available."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "032 000 01 06", email: "hello@isoconfort.demo", zone: "Neuchâtel, Jura, Bernese Jura", hours: "Mon–Fri, 7:30am–5pm" },
        devisNote: "Answer a few questions about your building — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your insulation project…",
        pdfCompany: { name: "IsoConfort Sàrl", address: "Rue des Fahys 51, 2000 Neuchâtel", phone: "032 000 01 06", email: "hello@isoconfort.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your building, then put together a firm quote right away.",
        addressPlaceholder: "Building address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, materials and labour included. Subsidies not deducted, paid directly to the owner.",
        q: {
          where: { text: "Which part of the building would you like to insulate?", short: "Part", opts: { attic: "Unused loft (attic not lived in)", roof: "Roof and sloped ceilings (lived-in attic)", facade: "Facade (external insulation)", cellar: "Cellar or garage ceiling" } },
          surf: { text: "How much area needs insulating?", short: "Area", opts: { s1: "About 30 m²", s2: "About 60 m²", s3: "About 100 m²", s4: "About 160 m²", s5: "250 m² or more" } },
          material: { text: "Which insulation material do you prefer?", short: "Material", opts: { mineral: "Mineral wool", wood: "Wood fibre (eco-friendly)", pir: "PIR boards (high performance)" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { vapour: "Vapour barrier", removal: "Removing old insulation", cecb: "CECB energy certificate", subsidy: "Subsidy application" } },
          date: { text: "When would you like the work done?", short: "Preferred date" },
        },
        items: {
          ins_attic: "Loft insulation ({m2} m²)",
          ins_roof: "Roof insulation ({m2} m²)",
          ins_facade: "External facade insulation ({m2} m²)",
          ins_cellar: "Cellar ceiling insulation ({m2} m²)",
          scaffold: "Scaffolding ({m2} m²)",
          vapour: "Vapour barrier ({m2} m²)",
          removal: "Removing old insulation ({m2} m²)",
          cecb: "CECB energy certificate",
          subsidy: "Subsidy application",
        },
      },
    },
    de: {
      label: "Wärmedämmung",
      forWho: "Dämmfirmen und Betriebe für energetische Sanierung",
      pitch: "Estrich, Dach, Fassade und Keller pro m² berechnen — mit Energie- und Förderoptionen.",
      emailNoun: "Ihre Dämmarbeiten",
      landing: {
        h1: ["SIE DÄMMEN.", "DEALZ RECHNET."],
        question: "Wie viele Eigentümer geben ihr Dämmprojekt auf, weil sie noch auf Ihre Offerte warten?",
        text: "Mit steigenden Energiepreisen und Förderbeiträgen boomen die Dämm-Anfragen. Dealz antwortet rund um die Uhr, stellt die richtigen Fragen (Gebäudeteil, Fläche, Dämmstoff, Dampfbremse, GEAK), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Dämmung eines Estrichs von etwa 100 m²?",
        values: [
          { icon: "🏠", title: "Estrich, Dach, Fassade, Keller", text: "Jeder Gebäudeteil hat seinen m²-Preis, nach Ihren eigenen Tarifen und dem gewählten Dämmstoff." },
          { icon: "🌱", title: "Dämmstoffe live verglichen", text: "Mineralwolle, Holzfaser oder PIR: Der Kunde sieht den Preisunterschied und entscheidet sofort." },
          { icon: "📄", title: "GEAK und Förderbeiträge", text: "Energieausweis und Gesuch beim Gebäudeprogramm kommen mit einem Klick dazu: zusätzliche Verkäufe." },
          { icon: "⚡", title: "Die erste Offerte gewinnt", text: "Der vergleichende Eigentümer erhält Ihren verbindlichen Preis in einer Minute, vor allen anderen." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m² nach Gebäudeteil und Dämmstoff, Gerüst, Dampfbremse, GEAK. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Flächen, Ihre Dämmstoff-Faktoren und Ihre Optionen.",
        excel: { file: "tarife-daemmung.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Estrichdämmung", "100 m² · Mineralwolle", "CHF 3'800"], ["Dampfbremse", "100 m²", "CHF 1'200"], ["GEAK-Ausweis", "Einfamilienhaus", "CHF 750"]] },
        chat: ["«Unser Haus verliert viel Wärme über das Dach.»", "«Wie gross ist der Estrich?»", "«Welcher Dämmstoff: Mineralwolle oder Holzfaser?»"],
        offer: { company: "IsoConfort Sàrl", rows: [["Estrichdämmung (100 m²)", 3800], ["Dampfbremse (100 m²)", 1200], ["Energieausweis GEAK", 750]] },
        roi: "Zwei zusätzliche Dämmaufträge pro Jahr bezahlen mehrere Jahre Abo.",
      },
      demo: {
        brand: "IsoConfort",
        eyebrow: "Neuenburg & Jura · Fiktives Beispiel",
        hero: { h1: "Weniger heizen, mehr Komfort: Ihr Preis in einer Minute.", text: "Dämmung von Estrich, Dach, Fassade und Keller in den Kantonen Neuenburg und Jura — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "-30 %", lbl: "HEIZKOSTEN IM SCHNITT" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Dämmarbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🏠", title: "Kaltestrich", text: "Einblasen oder Rollen, schnelle Arbeit.", tag: "ab CHF 38/m²" },
          { icon: "📐", title: "Dach und Dachschrägen", text: "Zwischensparrendämmung.", tag: "ab CHF 95/m²" },
          { icon: "🧱", title: "Fassade (Aussendämmung)", text: "Kompaktfassade mit Verputz.", tag: "ab CHF 165/m²" },
          { icon: "🏚️", title: "Kellerdecke", text: "Dämmplatten unter der Decke.", tag: "ab CHF 55/m²" },
          { icon: "📄", title: "GEAK-Ausweis", text: "Offizieller Gebäudeenergieausweis.", tag: "CHF 750" },
          { icon: "💶", title: "Fördergesuch", text: "Gebäudeprogramm, Formalitäten inbegriffen.", tag: "CHF 350" },
        ],
        about: {
          title: "Spezialisten für Energieeffizienz",
          text: "IsoConfort dämmt seit 2012 Häuser, Mehrfamilienhäuser und Bauernhäuser in den Kantonen Neuenburg und Jura. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Zertifizierte Experten", "Partner des Gebäudeprogramms."], ["Nachhaltige Materialien", "Schweizer und biobasierte Dämmstoffe erhältlich."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "032 000 01 06", email: "hello@isoconfort.demo", zone: "Neuenburg, Jura, Berner Jura", hours: "Mo–Fr, 7.30–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Gebäude — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Dämmprojekt…",
        pdfCompany: { name: "IsoConfort Sàrl", address: "Rue des Fahys 51, 2000 Neuchâtel", phone: "032 000 01 06", email: "hello@isoconfort.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Gebäude und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse des Gebäudes (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Material und Arbeit inbegriffen. Förderbeiträge nicht abgezogen, direkt an den Eigentümer ausbezahlt.",
        q: {
          where: { text: "Welchen Gebäudeteil möchten Sie dämmen?", short: "Gebäudeteil", opts: { attic: "Kaltestrich (unbewohnter Dachboden)", roof: "Dach und Dachschrägen (bewohntes Dachgeschoss)", facade: "Fassade (Aussendämmung)", cellar: "Keller- oder Garagendecke" } },
          surf: { text: "Wie gross ist die zu dämmende Fläche?", short: "Fläche", opts: { s1: "Etwa 30 m²", s2: "Etwa 60 m²", s3: "Etwa 100 m²", s4: "Etwa 160 m²", s5: "250 m² oder mehr" } },
          material: { text: "Welchen Dämmstoff bevorzugen Sie?", short: "Dämmstoff", opts: { mineral: "Mineralwolle", wood: "Holzfaser (ökologisch)", pir: "PIR-Platten (Hochleistung)" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { vapour: "Dampfbremse", removal: "Alte Dämmung entfernen", cecb: "Energieausweis GEAK", subsidy: "Fördergesuch" } },
          date: { text: "Wann wünschen Sie die Arbeiten?", short: "Wunschtermin" },
        },
        items: {
          ins_attic: "Estrichdämmung ({m2} m²)",
          ins_roof: "Dachdämmung ({m2} m²)",
          ins_facade: "Fassaden-Aussendämmung ({m2} m²)",
          ins_cellar: "Dämmung der Kellerdecke ({m2} m²)",
          scaffold: "Gerüst ({m2} m²)",
          vapour: "Dampfbremse ({m2} m²)",
          removal: "Alte Dämmung entfernen ({m2} m²)",
          cecb: "Energieausweis GEAK",
          subsidy: "Fördergesuch",
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
