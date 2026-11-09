/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "sanitaire",
    icon: "🚿",
    needsAddress: true,
    colors: { main: "#1c7ed6", dark: "#1864ab", light: "#d0ebff", accent: "#f03e3e", accentDark: "#c92a2a", bg: "#f7fbff" },

    quote: {
      minimum: 220,
      questions: [
        { id: "work", type: "single", options: [{ id: "repair" }, { id: "boiler" }, { id: "fixtures" }, { id: "heating" }] },
        {
          id: "issue", type: "single",
          when: function (a) { return a.work.id === "repair"; },
          options: [{ id: "leak", price: 280 }, { id: "wc", price: 220 }, { id: "tap", price: 180 }, { id: "drain", price: 240 }],
        },
        {
          id: "urgency", type: "single",
          when: function (a) { return a.work.id === "repair"; },
          options: [{ id: "normal", price: 0 }, { id: "fast", price: 120 }, { id: "emergency", price: 220 }],
        },
        {
          id: "tank", type: "single",
          when: function (a) { return a.work.id === "boiler"; },
          options: [{ id: "t1", price: 2400 }, { id: "t2", price: 3100 }, { id: "t3", price: 4900 }],
        },
        {
          id: "nfix", type: "single",
          when: function (a) { return a.work.id === "fixtures"; },
          options: [{ id: "n1", price: 1200 }, { id: "n2", price: 3200 }, { id: "n3", price: 6800 }],
        },
        {
          id: "system", type: "single",
          when: function (a) { return a.work.id === "heating"; },
          options: [{ id: "hp", price: 28000 }, { id: "pellet", price: 24000 }, { id: "gas", price: 14500 }],
        },
        { id: "extras", type: "multi", options: [{ id: "removal" }, { id: "descale" }, { id: "softener" }, { id: "service" }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var w = a.work.id;
        if (w === "repair") {
          items.push({ label: L("callout"), amount: 120 });
          items.push({ label: L("repair_" + a.issue.id), amount: a.issue.price });
          if (a.urgency.price) items.push({ label: L("urgency_" + a.urgency.id), amount: a.urgency.price });
        } else if (w === "boiler") {
          items.push({ label: L("boiler_" + a.tank.id), amount: a.tank.price });
        } else if (w === "fixtures") {
          items.push({ label: L("fix_" + a.nfix.id), amount: a.nfix.price });
        } else {
          items.push({ label: L("heat_" + a.system.id), amount: a.system.price });
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "removal" && w !== "repair") items.push({ label: L("removal"), amount: w === "heating" ? 950 : 250 });
          if (e.id === "descale") items.push({ label: L("descale"), amount: 180 });
          if (e.id === "softener") items.push({ label: L("softener"), amount: 2600 });
          if (e.id === "service") items.push({ label: L("service"), amount: 220 });
        });
        return items;
      },
    },

    fr: {
      label: "Sanitaire et chauffage",
      forWho: "installateurs sanitaires et chauffagistes",
      pitch: "Chiffrez dépannages, chauffe-eau, sanitaires et chauffages sans quitter votre intervention.",
      emailNoun: "vos travaux de sanitaire et de chauffage",
      landing: {
        h1: ["VOUS RÉPAREZ.", "DEALZ CHIFFRE."],
        question: "Combien d'appels de clients manquez-vous pendant que vous êtes sous un évier ?",
        text: "Fuite, chauffe-eau en panne, remplacement de chaudière : vos clients veulent un prix et un rendez-vous tout de suite. Dealz leur répond à toute heure, pose les bonnes questions (type d'intervention, appareil, urgence), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour remplacer un chauffe-eau de 200 litres ?",
        values: [
          { icon: "🚨", title: "Les urgences triées", text: "Fuite le soir ou WC bouché le week-end : le supplément d'urgence est appliqué selon vos règles, le client sait à quoi s'attendre." },
          { icon: "🔥", title: "Chauffe-eau et chauffages chiffrés", text: "Capacité, pompe à chaleur, pellets ou gaz : vos prix forfaitaires sont donnés en une minute, sans visite pour les cas standards." },
          { icon: "🧾", title: "Plus de devis le soir", text: "Les demandes arrivent complètes et chiffrées. Vous validez, vous planifiez, et vous gardez vos soirées." },
          { icon: "🔧", title: "Contrats d'entretien vendus", text: "Détartrage, adoucisseur, contrat annuel : proposés dans chaque devis, ils créent du revenu récurrent." },
        ],
        step1: "Importez vos tarifs : forfaits de dépannage, appareils par capacité, systèmes de chauffage, suppléments d'urgence. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos forfaits, vos suppléments et vos options.",
        excel: { file: "tarifs-sanitaire.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Chauffe-eau 150 à 200 L", "fourniture et pose", "CHF 3 100"], ["Dépose de l'ancien appareil", "évacuation comprise", "CHF 250"], ["Contrat d'entretien", "annuel", "CHF 220"]] },
        chat: ["« Notre chauffe-eau ne chauffe plus. »", "« Quelle est la capacité de l'appareil ? »", "« Souhaitez-vous qu'on reprenne l'ancien ? »"],
        offer: { company: "Sanitherm Romandie SA", rows: [["Chauffe-eau 150 à 200 L", 3100], ["Dépose de l'ancien appareil", 250], ["Contrat d'entretien annuel", 220]] },
        roi: "Un seul remplacement de chauffage supplémentaire par an paie plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Sanitherm Romandie",
        eyebrow: "Vaud & Fribourg · Exemple fictif",
        hero: { h1: "Un dépannage ou une installation ? Votre prix en une minute.", text: "Sanitaire, chauffe-eau et chauffage dans les cantons de Vaud et Fribourg — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "24/7", lbl: "SERVICE D'URGENCE" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos interventions",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "💧", title: "Dépannage et fuites", text: "Fuites, WC, robinetterie, débouchage.", tag: "dès CHF 300" },
          { icon: "🔥", title: "Chauffe-eau", text: "Remplacement de toutes capacités.", tag: "dès CHF 2 400" },
          { icon: "🚽", title: "Appareils sanitaires", text: "WC, lavabos, douches, baignoires.", tag: "dès CHF 1 200" },
          { icon: "♨️", title: "Pompes à chaleur", text: "Remplacement de chauffage fossile.", tag: "dès CHF 28 000" },
          { icon: "🧪", title: "Adoucisseur d'eau", text: "Protection contre le calcaire.", tag: "CHF 2 600" },
          { icon: "📋", title: "Contrat d'entretien", text: "Contrôle annuel de vos installations.", tag: "CHF 220/an" },
        ],
        about: {
          title: "Des installateurs disponibles quand il le faut",
          text: "Sanitherm Romandie intervient depuis 2003 chez les particuliers, régies et PPE de Vaud et Fribourg. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Service d'urgence", "7 jours sur 7, soirées comprises."], ["Installateurs qualifiés", "certifiés pour les pompes à chaleur."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 01 08", email: "hello@sanitherm.demo", zone: "Vaud, Fribourg", hours: "Lun–Ven, 7h–18h · urgences 7j/7" },
        devisNote: "Répondez à quelques questions sur votre besoin — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre problème ou votre projet…",
        pdfCompany: { name: "Sanitherm Romandie SA", address: "Chemin du Closel 5, 1020 Renens", phone: "021 000 01 08", email: "hello@sanitherm.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre installation, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de l'intervention (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, fourniture et main-d'œuvre comprises. Pièces supplémentaires nécessaires sur place facturées uniquement sur accord préalable.",
        q: {
          work: { text: "De quoi avez-vous besoin ?", short: "Intervention", opts: { repair: "Un dépannage (fuite, WC, robinet, écoulement)", boiler: "Remplacer le chauffe-eau", fixtures: "Remplacer des appareils sanitaires", heating: "Remplacer le chauffage" } },
          issue: { text: "Quel est le problème ?", short: "Problème", opts: { leak: "Fuite d'eau", wc: "WC qui coule ou en panne", tap: "Robinet ou mitigeur à changer", drain: "Écoulement bouché" } },
          urgency: { text: "Quand faut-il intervenir ?", short: "Urgence", opts: { normal: "Dans la semaine", fast: "Sous 48 heures", emergency: "En urgence (soir ou week-end)" } },
          tank: { text: "Quelle capacité de chauffe-eau ?", short: "Capacité", opts: { t1: "80 à 100 litres (appartement)", t2: "150 à 200 litres (maison)", t3: "300 litres ou pompe à chaleur" } },
          nfix: { text: "Combien d'appareils faut-il remplacer ?", short: "Appareils", opts: { n1: "Un appareil (WC, lavabo ou douche)", n2: "2 ou 3 appareils", n3: "Toute la salle de bain" } },
          system: { text: "Quel nouveau chauffage souhaitez-vous ?", short: "Système", opts: { hp: "Pompe à chaleur air-eau", pellet: "Chaudière à pellets", gas: "Chaudière à gaz à condensation" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { removal: "Dépose et évacuation de l'ancien appareil", descale: "Détartrage", softener: "Adoucisseur d'eau", service: "Contrat d'entretien annuel" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          callout: "Déplacement",
          repair_leak: "Recherche et réparation de fuite",
          repair_wc: "Réparation de WC",
          repair_tap: "Remplacement de robinetterie",
          repair_drain: "Débouchage d'écoulement",
          urgency_fast: "Supplément intervention sous 48 heures",
          urgency_emergency: "Supplément urgence (soir ou week-end)",
          boiler_t1: "Chauffe-eau 80 à 100 L, fourniture et pose",
          boiler_t2: "Chauffe-eau 150 à 200 L, fourniture et pose",
          boiler_t3: "Chauffe-eau 300 L ou pompe à chaleur, fourniture et pose",
          fix_n1: "Remplacement d'un appareil sanitaire",
          fix_n2: "Remplacement de 2 ou 3 appareils sanitaires",
          fix_n3: "Remplacement complet des sanitaires",
          heat_hp: "Pompe à chaleur air-eau, fourniture et pose",
          heat_pellet: "Chaudière à pellets, fourniture et pose",
          heat_gas: "Chaudière à gaz à condensation, fourniture et pose",
          removal: "Dépose et évacuation de l'ancien appareil",
          descale: "Détartrage",
          softener: "Adoucisseur d'eau",
          service: "Contrat d'entretien annuel",
        },
      },
    },
    en: {
      label: "Plumbing and heating",
      forWho: "plumbers and heating engineers",
      pitch: "Price call-outs, water heaters, bathroom fixtures and heating without leaving the job.",
      emailNoun: "your plumbing and heating work",
      landing: {
        h1: ["YOU FIX IT.", "DEALZ PRICES."],
        question: "How many customer calls do you miss while you're under a sink?",
        text: "A leak, a broken water heater, a new boiler: your customers want a price and an appointment straight away. Dealz answers them at any hour, asks the right questions (type of job, appliance, urgency), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to replace a 200-litre water heater?",
        values: [
          { icon: "🚨", title: "Emergencies sorted", text: "A leak in the evening or a blocked toilet at the weekend: the emergency surcharge follows your rules and the customer knows what to expect." },
          { icon: "🔥", title: "Water heaters and heating priced", text: "Capacity, heat pump, pellets or gas: your fixed prices are given in a minute, without a visit for standard cases." },
          { icon: "🧾", title: "No more quotes at night", text: "Requests arrive complete and priced. You approve, you schedule, and you keep your evenings." },
          { icon: "🔧", title: "Service contracts sold", text: "Descaling, water softener, annual contract: offered in every quote, they create recurring revenue." },
        ],
        step1: "Import your rates: call-out packages, appliances by capacity, heating systems, emergency surcharges. Your Excel stays your working tool.",
        step2: "The engine understands your packages, your surcharges and your options.",
        excel: { file: "plumbing-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["Water heater 150 to 200 L", "supply and fitting", "CHF 3,100"], ["Removing the old unit", "disposal included", "CHF 250"], ["Service contract", "annual", "CHF 220"]] },
        chat: ["“Our water heater has stopped heating.”", "“What capacity is the unit?”", "“Would you like us to take the old one away?”"],
        offer: { company: "Sanitherm Romandie SA", rows: [["Water heater 150 to 200 L", 3100], ["Removing the old unit", 250], ["Annual service contract", 220]] },
        roi: "A single extra heating replacement per year pays for several years of subscription.",
      },
      demo: {
        brand: "Sanitherm Romandie",
        eyebrow: "Vaud & Fribourg · Fictional example",
        hero: { h1: "A repair or a new installation? Your price in a minute.", text: "Plumbing, water heaters and heating in the cantons of Vaud and Fribourg — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "24/7", lbl: "EMERGENCY SERVICE" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our services",
        servicesSub: "Pick a service, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "💧", title: "Repairs and leaks", text: "Leaks, toilets, taps, unblocking.", tag: "from CHF 300" },
          { icon: "🔥", title: "Water heaters", text: "Replacement in every capacity.", tag: "from CHF 2,400" },
          { icon: "🚽", title: "Bathroom fixtures", text: "Toilets, basins, showers, baths.", tag: "from CHF 1,200" },
          { icon: "♨️", title: "Heat pumps", text: "Replacing fossil-fuel heating.", tag: "from CHF 28,000" },
          { icon: "🧪", title: "Water softener", text: "Protection against limescale.", tag: "CHF 2,600" },
          { icon: "📋", title: "Service contract", text: "Yearly check of your installations.", tag: "CHF 220/yr" },
        ],
        about: {
          title: "Installers available when you need them",
          text: "Since 2003, Sanitherm Romandie has worked for households, property managers and co-owned buildings in Vaud and Fribourg. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Emergency service", "7 days a week, evenings included."], ["Qualified installers", "certified for heat pumps."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 01 08", email: "hello@sanitherm.demo", zone: "Vaud, Fribourg", hours: "Mon–Fri, 7am–6pm · emergencies 7 days" },
        devisNote: "Answer a few questions about what you need — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your problem or project…",
        pdfCompany: { name: "Sanitherm Romandie SA", address: "Chemin du Closel 5, 1020 Renens", phone: "021 000 01 08", email: "hello@sanitherm.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your installation, then put together a firm quote right away.",
        addressPlaceholder: "Job address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, supply and labour included. Extra parts needed on site charged only with prior agreement.",
        q: {
          work: { text: "What do you need?", short: "Job", opts: { repair: "A repair (leak, toilet, tap, drain)", boiler: "Replace the water heater", fixtures: "Replace bathroom fixtures", heating: "Replace the heating" } },
          issue: { text: "What is the problem?", short: "Problem", opts: { leak: "Water leak", wc: "Running or broken toilet", tap: "Tap or mixer to replace", drain: "Blocked drain" } },
          urgency: { text: "When do you need us?", short: "Urgency", opts: { normal: "Within the week", fast: "Within 48 hours", emergency: "Emergency (evening or weekend)" } },
          tank: { text: "Which water-heater capacity?", short: "Capacity", opts: { t1: "80 to 100 litres (apartment)", t2: "150 to 200 litres (house)", t3: "300 litres or heat pump" } },
          nfix: { text: "How many fixtures need replacing?", short: "Fixtures", opts: { n1: "One fixture (toilet, basin or shower)", n2: "2 or 3 fixtures", n3: "The whole bathroom" } },
          system: { text: "Which new heating would you like?", short: "System", opts: { hp: "Air-to-water heat pump", pellet: "Pellet boiler", gas: "Gas condensing boiler" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { removal: "Removing and disposing of the old unit", descale: "Descaling", softener: "Water softener", service: "Annual service contract" } },
          date: { text: "When would you like the job done?", short: "Preferred date" },
        },
        items: {
          callout: "Call-out",
          repair_leak: "Leak detection and repair",
          repair_wc: "Toilet repair",
          repair_tap: "Tap replacement",
          repair_drain: "Drain unblocking",
          urgency_fast: "Surcharge for service within 48 hours",
          urgency_emergency: "Emergency surcharge (evening or weekend)",
          boiler_t1: "Water heater 80 to 100 L, supply and fitting",
          boiler_t2: "Water heater 150 to 200 L, supply and fitting",
          boiler_t3: "Water heater 300 L or heat pump, supply and fitting",
          fix_n1: "Replacing one bathroom fixture",
          fix_n2: "Replacing 2 or 3 bathroom fixtures",
          fix_n3: "Replacing all bathroom fixtures",
          heat_hp: "Air-to-water heat pump, supply and fitting",
          heat_pellet: "Pellet boiler, supply and fitting",
          heat_gas: "Gas condensing boiler, supply and fitting",
          removal: "Removing and disposing of the old unit",
          descale: "Descaling",
          softener: "Water softener",
          service: "Annual service contract",
        },
      },
    },
    de: {
      label: "Sanitär und Heizung",
      forWho: "Sanitärinstallateure und Heizungsbauer",
      pitch: "Reparaturen, Boiler, Sanitärapparate und Heizungen berechnen — ohne den Einsatz zu unterbrechen.",
      emailNoun: "Ihre Sanitär- und Heizungsarbeiten",
      landing: {
        h1: ["SIE REPARIEREN.", "DEALZ RECHNET."],
        question: "Wie viele Kundenanrufe verpassen Sie, während Sie unter einem Lavabo liegen?",
        text: "Ein Leck, ein defekter Boiler, eine neue Heizung: Ihre Kunden wollen sofort einen Preis und einen Termin. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Art des Einsatzes, Gerät, Dringlichkeit), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet der Ersatz eines 200-Liter-Boilers?",
        values: [
          { icon: "🚨", title: "Notfälle sortiert", text: "Ein Leck am Abend oder ein verstopftes WC am Wochenende: Der Notfallzuschlag folgt Ihren Regeln, der Kunde weiss Bescheid." },
          { icon: "🔥", title: "Boiler und Heizungen berechnet", text: "Inhalt, Wärmepumpe, Pellets oder Gas: Ihre Pauschalen kommen in einer Minute, ohne Besichtigung bei Standardfällen." },
          { icon: "🧾", title: "Keine Offerten mehr am Abend", text: "Anfragen kommen vollständig und berechnet. Sie bestätigen, planen und behalten Ihre Abende." },
          { icon: "🔧", title: "Wartungsverträge verkauft", text: "Entkalkung, Enthärtungsanlage, Jahresvertrag: in jeder Offerte angeboten, schaffen sie wiederkehrenden Umsatz." },
        ],
        step1: "Importieren Sie Ihre Tarife: Reparaturpauschalen, Geräte nach Inhalt, Heizsysteme, Notfallzuschläge. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Pauschalen, Ihre Zuschläge und Ihre Optionen.",
        excel: { file: "tarife-sanitaer.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Boiler 150 bis 200 L", "Lieferung und Montage", "CHF 3'100"], ["Demontage altes Gerät", "inkl. Entsorgung", "CHF 250"], ["Wartungsvertrag", "jährlich", "CHF 220"]] },
        chat: ["«Unser Boiler heizt nicht mehr.»", "«Welchen Inhalt hat das Gerät?»", "«Sollen wir das alte Gerät mitnehmen?»"],
        offer: { company: "Sanitherm Romandie SA", rows: [["Boiler 150 bis 200 L", 3100], ["Demontage des alten Geräts", 250], ["Jährlicher Wartungsvertrag", 220]] },
        roi: "Ein einziger zusätzlicher Heizungsersatz pro Jahr bezahlt mehrere Jahre Abo.",
      },
      demo: {
        brand: "Sanitherm Romandie",
        eyebrow: "Waadt & Freiburg · Fiktives Beispiel",
        hero: { h1: "Eine Reparatur oder eine Installation? Ihr Preis in einer Minute.", text: "Sanitär, Boiler und Heizung in den Kantonen Waadt und Freiburg — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "24/7", lbl: "NOTFALLDIENST" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Leistungen",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Anliegen einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "💧", title: "Reparaturen und Lecks", text: "Lecks, WC, Armaturen, Rohrreinigung.", tag: "ab CHF 300" },
          { icon: "🔥", title: "Boiler", text: "Ersatz in jeder Grösse.", tag: "ab CHF 2'400" },
          { icon: "🚽", title: "Sanitärapparate", text: "WC, Lavabos, Duschen, Badewannen.", tag: "ab CHF 1'200" },
          { icon: "♨️", title: "Wärmepumpen", text: "Ersatz fossiler Heizungen.", tag: "ab CHF 28'000" },
          { icon: "🧪", title: "Enthärtungsanlage", text: "Schutz vor Kalk.", tag: "CHF 2'600" },
          { icon: "📋", title: "Wartungsvertrag", text: "Jährliche Kontrolle Ihrer Anlagen.", tag: "CHF 220/Jahr" },
        ],
        about: {
          title: "Installateure, die da sind, wenn es zählt",
          text: "Sanitherm Romandie arbeitet seit 2003 für Privatpersonen, Verwaltungen und Stockwerkeigentümer in der Waadt und in Freiburg. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Notfalldienst", "7 Tage die Woche, auch abends."], ["Qualifizierte Installateure", "zertifiziert für Wärmepumpen."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 01 08", email: "hello@sanitherm.demo", zone: "Waadt, Freiburg", hours: "Mo–Fr, 7–18 Uhr · Notfälle 7 Tage" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Anliegen — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Problem oder Projekt…",
        pdfCompany: { name: "Sanitherm Romandie SA", address: "Chemin du Closel 5, 1020 Renens", phone: "021 000 01 08", email: "hello@sanitherm.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Installation und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Einsatzadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Lieferung und Arbeit inbegriffen. Vor Ort zusätzlich benötigte Teile nur nach vorheriger Absprache.",
        q: {
          work: { text: "Was benötigen Sie?", short: "Einsatz", opts: { repair: "Eine Reparatur (Leck, WC, Armatur, Abfluss)", boiler: "Boiler ersetzen", fixtures: "Sanitärapparate ersetzen", heating: "Heizung ersetzen" } },
          issue: { text: "Was ist das Problem?", short: "Problem", opts: { leak: "Wasserleck", wc: "WC läuft oder ist defekt", tap: "Armatur zu ersetzen", drain: "Verstopfter Abfluss" } },
          urgency: { text: "Wann sollen wir kommen?", short: "Dringlichkeit", opts: { normal: "Innerhalb der Woche", fast: "Innerhalb von 48 Stunden", emergency: "Notfall (abends oder Wochenende)" } },
          tank: { text: "Welcher Boilerinhalt?", short: "Inhalt", opts: { t1: "80 bis 100 Liter (Wohnung)", t2: "150 bis 200 Liter (Haus)", t3: "300 Liter oder Wärmepumpenboiler" } },
          nfix: { text: "Wie viele Apparate sollen ersetzt werden?", short: "Apparate", opts: { n1: "Ein Apparat (WC, Lavabo oder Dusche)", n2: "2 oder 3 Apparate", n3: "Das ganze Badezimmer" } },
          system: { text: "Welche neue Heizung wünschen Sie?", short: "System", opts: { hp: "Luft-Wasser-Wärmepumpe", pellet: "Pelletheizung", gas: "Gas-Brennwertkessel" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { removal: "Demontage und Entsorgung des alten Geräts", descale: "Entkalkung", softener: "Enthärtungsanlage", service: "Jährlicher Wartungsvertrag" } },
          date: { text: "Wann wünschen Sie den Einsatz?", short: "Wunschtermin" },
        },
        items: {
          callout: "Anfahrt",
          repair_leak: "Lecksuche und Reparatur",
          repair_wc: "WC-Reparatur",
          repair_tap: "Ersatz der Armatur",
          repair_drain: "Rohrreinigung",
          urgency_fast: "Zuschlag Einsatz innert 48 Stunden",
          urgency_emergency: "Notfallzuschlag (abends oder Wochenende)",
          boiler_t1: "Boiler 80 bis 100 L, Lieferung und Montage",
          boiler_t2: "Boiler 150 bis 200 L, Lieferung und Montage",
          boiler_t3: "Boiler 300 L oder Wärmepumpenboiler, Lieferung und Montage",
          fix_n1: "Ersatz eines Sanitärapparats",
          fix_n2: "Ersatz von 2 oder 3 Sanitärapparaten",
          fix_n3: "Kompletter Ersatz der Sanitärapparate",
          heat_hp: "Luft-Wasser-Wärmepumpe, Lieferung und Montage",
          heat_pellet: "Pelletheizung, Lieferung und Montage",
          heat_gas: "Gas-Brennwertkessel, Lieferung und Montage",
          removal: "Demontage und Entsorgung des alten Geräts",
          descale: "Entkalkung",
          softener: "Enthärtungsanlage",
          service: "Jährlicher Wartungsvertrag",
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
