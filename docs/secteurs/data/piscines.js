/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "piscines",
    icon: "🏊",
    needsAddress: true,
    colors: { main: "#15aabf", dark: "#0c8599", light: "#c5f6fa", accent: "#ff922b", accentDark: "#f76707", bg: "#f8feff" },

    quote: {
      minimum: 150,
      questions: [
        { id: "pool", type: "single", options: [{ id: "inground", k: 1 }, { id: "above", k: 0.7 }, { id: "natural", k: 1.2 }, { id: "spa", k: 0.5 }] },
        { id: "size", type: "single", options: [{ id: "xs", v: 20 }, { id: "s", v: 45 }, { id: "m", v: 80 }, { id: "l", v: 130 }] },
        { id: "service", type: "single", options: [{ id: "open" }, { id: "winter" }, { id: "weekly" }, { id: "green" }, { id: "annual" }] },
        { id: "equipment", type: "multi", options: [{ id: "pump" }, { id: "robot" }, { id: "heat" }, { id: "sand" }, { id: "algae" }, { id: "cover" }] },
        { id: "date", type: "date", minDays: 5 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var k = a.pool.k, sf = 0.8 + a.size.v / 100;
        var open = H.round5(280 * k * sf), winter = H.round5(240 * k * sf), weekly = H.round5(48 * k * sf * 20 * 0.9);
        var s = a.service.id;
        if (s === "open") items.push({ label: L("open"), amount: open });
        else if (s === "winter") items.push({ label: L("winter"), amount: winter });
        else if (s === "weekly") items.push({ label: L("weekly"), amount: weekly });
        else if (s === "green") items.push({ label: L("green"), amount: H.round5(420 * k * sf) });
        else items.push({ label: L("annual"), amount: H.round5((open + winter + weekly) * 0.92) });
        (a.equipment || []).forEach(function (e) {
          if (e.id === "pump") items.push({ label: L("pump"), amount: 90 });
          if (e.id === "robot") items.push({ label: L("robot"), amount: 70 });
          if (e.id === "heat") items.push({ label: L("heat"), amount: 140 });
          if (e.id === "sand") items.push({ label: L("sand"), amount: H.round5(200 + a.size.v * 0.9) });
          if (e.id === "algae") items.push({ label: L("algae"), amount: 85 });
          if (e.id === "cover") items.push({ label: L("cover"), amount: 120 });
        });
        return items;
      },
    },

    fr: {
      label: "Entretien de piscines",
      forWho: "entreprises d'entretien de piscines",
      pitch: "Chiffrez mise en service, hivernage et entretien selon le bassin.",
      emailNoun: "l'entretien de votre piscine",
      landing: {
        h1: ["VOUS ENTRETENEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de mise en service perdez-vous au premier week-end de beau temps ?",
        text: "Au printemps, tout le monde veut sa piscine prête en même temps — et le téléphone ne s'arrête plus. Dealz répond à vos clients, pose les bonnes questions (type de bassin, volume, prestation, équipements), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour la mise en service de ma piscine de 80 m³ ?",
        values: [
          { icon: "☀️", title: "Le pic de printemps absorbé", text: "Quand 50 propriétaires appellent le même week-end, chacun reçoit une réponse chiffrée immédiate." },
          { icon: "💧", title: "Un prix selon le volume d'eau", text: "Type de bassin et volume : vos coefficients s'appliquent automatiquement." },
          { icon: "🔁", title: "Des contrats annuels plus faciles à vendre", text: "Le forfait mise en service + saison + hivernage est proposé d'emblée, avec la remise que vous définissez." },
          { icon: "🧰", title: "Équipements chiffrés d'emblée", text: "Pompe, robot, pompe à chaleur, sable, algues, couverture : chaque contrôle est une ligne de devis." },
        ],
        step1: "Importez vos tarifs : prestations par type de bassin, coefficients de volume, forfaits annuels, contrôles d'équipements. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de bassins, vos volumes, vos prestations saisonnières et vos équipements.",
        excel: { file: "tarifs-piscines.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Mise en service printemps", "Enterrée · 60–100 m³", "CHF 450"], ["Contrôle pompe et filtre", "Forfait", "CHF 90"], ["Traitement anti-algues", "Choc", "CHF 85"]] },
        chat: ["« Je voudrais faire remettre ma piscine en service pour le printemps. »", "« Quel type de bassin et quel volume d'eau environ ? »", "« Souhaitez-vous aussi un contrôle de la pompe et un traitement anti-algues ? »"],
        offer: { company: "AquaPur Piscines Sàrl", rows: [["Mise en service de printemps", 450], ["Contrôle pompe et filtre", 90], ["Traitement anti-algues (choc)", 85]] },
        roi: "Un seul contrat annuel supplémentaire peut déjà payer votre abonnement pour la saison.",
      },
      demo: {
        brand: "AquaPur",
        eyebrow: "Montreux & Riviera · Exemple fictif",
        hero: { h1: "Une eau cristalline, sans y passer vos week-ends.", text: "Mise en service, hivernage, entretien hebdomadaire et remise en état de piscines et de spas — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "360+", lbl: "BASSINS SUIVIS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous entretenons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre bassin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🌞", title: "Mise en service", text: "Remise en route complète au printemps.", tag: "dès CHF 280" },
          { icon: "❄️", title: "Hivernage", text: "Protection du bassin et des équipements.", tag: "dès CHF 240" },
          { icon: "🗓️", title: "Entretien hebdomadaire", text: "Passage chaque semaine, saison complète.", tag: "dès CHF 48/passage" },
          { icon: "🟢", title: "Eau verte", text: "Remise en état complète de l'eau.", tag: "dès CHF 420" },
          { icon: "⚙️", title: "Équipements", text: "Pompe, filtre, robot, pompe à chaleur.", tag: "dès CHF 70" },
          { icon: "🛁", title: "Spas et jacuzzis", text: "Entretien adapté aux petits volumes.", tag: "dès CHF 120" },
        ],
        about: {
          title: "Des techniciens piscine, à l'année",
          text: "AquaPur Piscines entretient bassins privés et copropriétés entre Montreux et la Riviera depuis 2012. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Analyses d'eau", "chaque visite contrôlée, résultats consignés."], ["Produits adaptés", "traitements dosés selon le volume et la météo."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 13", email: "hello@aquapur.demo", zone: "Riviera, Lavaux, Chablais", hours: "Lun–Sam, 7h30–18h" },
        devisNote: "Répondez à quelques questions sur votre piscine — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre piscine…",
        pdfCompany: { name: "AquaPur Piscines Sàrl", address: "Avenue Nestlé 25, 1820 Montreux", phone: "021 000 00 13", email: "hello@aquapur.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre piscine, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de la piscine (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Produits de traitement inclus dans les forfaits indiqués. TVA suisse incluse le cas échéant.",
        q: {
          pool: { text: "Quel type de bassin ?", short: "Bassin", opts: { inground: "Piscine enterrée (béton / liner)", above: "Piscine hors-sol", natural: "Piscine naturelle / biotope", spa: "Spa / jacuzzi" } },
          size: { text: "Quel est le volume d'eau approximatif ?", short: "Volume", opts: { xs: "Moins de 30 m³", s: "30 à 60 m³", m: "60 à 100 m³", l: "Plus de 100 m³" } },
          service: { text: "Quelle prestation vous intéresse ?", short: "Prestation", opts: { open: "Mise en service de printemps", winter: "Hivernage", weekly: "Entretien hebdomadaire (saison, 20 semaines)", green: "Remise en état — eau verte", annual: "Forfait annuel (mise en service + saison + hivernage)" } },
          equipment: { text: "Souhaitez-vous contrôler des équipements ?", short: "Équipements", none: "Aucun équipement", opts: { pump: "Pompe et filtre", robot: "Robot nettoyeur (révision)", heat: "Pompe à chaleur (contrôle)", sand: "Remplacement du sable de filtration", algae: "Traitement anti-algues (choc)", cover: "Pose / dépose de la couverture" } },
          date: { text: "À partir de quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          open: "Mise en service de printemps",
          winter: "Hivernage du bassin",
          weekly: "Entretien hebdomadaire — saison (20 semaines)",
          green: "Remise en état de l'eau (eau verte)",
          annual: "Forfait annuel — mise en service + saison + hivernage",
          pump: "Contrôle pompe et filtre",
          robot: "Révision du robot nettoyeur",
          heat: "Contrôle de la pompe à chaleur",
          sand: "Remplacement du sable de filtration",
          algae: "Traitement anti-algues (choc)",
          cover: "Pose / dépose de la couverture",
        },
      },
    },
    en: {
      label: "Pool maintenance",
      forWho: "pool maintenance companies",
      pitch: "Price opening, winterising and maintenance by pool.",
      emailNoun: "your pool maintenance",
      landing: {
        h1: ["YOU MAINTAIN.", "DEALZ PRICES."],
        question: "How many pool opening requests do you lose on the first sunny weekend?",
        text: "In spring, everyone wants their pool ready at the same time — and the phone never stops. Dealz answers your customers, asks the right questions (pool type, volume, service, equipment), calculates your price from your rates and prepares the quote.",
        clientQ: "How much to open my 80 m³ pool for the season?",
        values: [
          { icon: "☀️", title: "The spring rush absorbed", text: "When 50 owners call on the same weekend, each one gets an immediate priced answer." },
          { icon: "💧", title: "A price based on water volume", text: "Pool type and volume: your coefficients apply automatically." },
          { icon: "🔁", title: "Annual contracts that are easier to sell", text: "The opening + season + winterising package is offered from the start, with the discount you set." },
          { icon: "🧰", title: "Equipment priced from the start", text: "Pump, robot, heat pump, sand, algae, cover: each check is a quote line." },
        ],
        step1: "Import your rates: services per pool type, volume coefficients, annual packages, equipment checks. Your Excel stays your working tool.",
        step2: "The engine understands your pool types, volumes, seasonal services and equipment.",
        excel: { file: "pool-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Spring opening", "In-ground · 60–100 m³", "CHF 450"], ["Pump and filter check", "Package", "CHF 90"], ["Anti-algae treatment", "Shock", "CHF 85"]] },
        chat: ["“I'd like to have my pool reopened for the spring.”", "“What type of pool, and roughly what water volume?”", "“Would you also like a pump check and an anti-algae treatment?”"],
        offer: { company: "AquaPur Piscines Sàrl", rows: [["Spring opening", 450], ["Pump and filter check", 90], ["Anti-algae treatment (shock)", 85]] },
        roi: "A single extra annual contract can already pay for your subscription for the season.",
      },
      demo: {
        brand: "AquaPur",
        eyebrow: "Montreux & Riviera · Fictional example",
        hero: { h1: "Crystal-clear water, without spending your weekends on it.", text: "Opening, winterising, weekly maintenance and restoration of pools and spas — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "360+", lbl: "POOLS MAINTAINED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we maintain",
        servicesSub: "Pick a service, or simply describe your pool in the “Get a quote” tab.",
        services: [
          { icon: "🌞", title: "Opening", text: "Full restart in spring.", tag: "from CHF 280" },
          { icon: "❄️", title: "Winterising", text: "Protection of the pool and equipment.", tag: "from CHF 240" },
          { icon: "🗓️", title: "Weekly maintenance", text: "A visit every week, the whole season.", tag: "from CHF 48/visit" },
          { icon: "🟢", title: "Green water", text: "Full water restoration.", tag: "from CHF 420" },
          { icon: "⚙️", title: "Equipment", text: "Pump, filter, robot, heat pump.", tag: "from CHF 70" },
          { icon: "🛁", title: "Spas and hot tubs", text: "Maintenance suited to small volumes.", tag: "from CHF 120" },
        ],
        about: {
          title: "Pool technicians, all year round",
          text: "AquaPur Piscines has been maintaining private and shared pools between Montreux and the Riviera since 2012. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Water testing", "every visit checked, results recorded."], ["The right products", "treatments dosed to volume and weather."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 13", email: "hello@aquapur.demo", zone: "Riviera, Lavaux, Chablais", hours: "Mon–Sat, 7:30am–6pm" },
        devisNote: "Answer a few questions about your pool — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your pool…",
        pdfCompany: { name: "AquaPur Piscines Sàrl", address: "Avenue Nestlé 25, 1820 Montreux", phone: "021 000 00 13", email: "hello@aquapur.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your pool, then put together a firm quote right away.",
        addressPlaceholder: "Pool address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days. Treatment products included in the packages shown. Swiss VAT included where applicable.",
        q: {
          pool: { text: "What type of pool?", short: "Pool", opts: { inground: "In-ground pool (concrete / liner)", above: "Above-ground pool", natural: "Natural pool / biotope", spa: "Spa / hot tub" } },
          size: { text: "What is the approximate water volume?", short: "Volume", opts: { xs: "Less than 30 m³", s: "30 to 60 m³", m: "60 to 100 m³", l: "More than 100 m³" } },
          service: { text: "Which service are you interested in?", short: "Service", opts: { open: "Spring opening", winter: "Winterising", weekly: "Weekly maintenance (season, 20 weeks)", green: "Restoration — green water", annual: "Annual package (opening + season + winterising)" } },
          equipment: { text: "Would you like any equipment checked?", short: "Equipment", none: "No equipment", opts: { pump: "Pump and filter", robot: "Robot cleaner (service)", heat: "Heat pump (check)", sand: "Filter sand replacement", algae: "Anti-algae treatment (shock)", cover: "Cover fitting / removal" } },
          date: { text: "From what date would you like the work done?", short: "Preferred date" },
        },
        items: {
          open: "Spring opening",
          winter: "Pool winterising",
          weekly: "Weekly maintenance — season (20 weeks)",
          green: "Water restoration (green water)",
          annual: "Annual package — opening + season + winterising",
          pump: "Pump and filter check",
          robot: "Robot cleaner service",
          heat: "Heat pump check",
          sand: "Filter sand replacement",
          algae: "Anti-algae treatment (shock)",
          cover: "Cover fitting / removal",
        },
      },
    },
    de: {
      label: "Poolunterhalt",
      forWho: "Poolunterhaltsfirmen",
      pitch: "Inbetriebnahme, Überwinterung und Unterhalt je nach Becken berechnen.",
      emailNoun: "den Unterhalt Ihres Pools",
      landing: {
        h1: ["SIE PFLEGEN.", "DEALZ RECHNET."],
        question: "Wie viele Anfragen für die Inbetriebnahme verlieren Sie am ersten schönen Wochenende?",
        text: "Im Frühling wollen alle ihren Pool gleichzeitig bereit haben — und das Telefon klingelt ununterbrochen. Dealz antwortet Ihren Kunden, stellt die richtigen Fragen (Beckentyp, Volumen, Leistung, Ausrüstung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Inbetriebnahme meines 80-m³-Pools?",
        values: [
          { icon: "☀️", title: "Den Frühlingsansturm auffangen", text: "Wenn 50 Eigentümer am selben Wochenende anrufen, erhält jeder sofort eine bezifferte Antwort." },
          { icon: "💧", title: "Ein Preis nach Wasservolumen", text: "Beckentyp und Volumen: Ihre Faktoren werden automatisch angewendet." },
          { icon: "🔁", title: "Jahresverträge leichter verkaufen", text: "Die Pauschale Inbetriebnahme + Saison + Überwinterung wird von Anfang an angeboten, mit dem von Ihnen festgelegten Rabatt." },
          { icon: "🧰", title: "Ausrüstung sofort berechnet", text: "Pumpe, Roboter, Wärmepumpe, Sand, Algen, Abdeckung: Jede Kontrolle ist eine Offertposition." },
        ],
        step1: "Importieren Sie Ihre Tarife: Leistungen pro Beckentyp, Volumenfaktoren, Jahrespauschalen, Ausrüstungskontrollen. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Beckentypen, Volumen, saisonalen Leistungen und Ausrüstungen.",
        excel: { file: "tarife-pools.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Inbetriebnahme Frühling", "Eingelassen · 60–100 m³", "CHF 450"], ["Kontrolle Pumpe und Filter", "Pauschale", "CHF 90"], ["Algenbehandlung", "Schock", "CHF 85"]] },
        chat: ["«Ich möchte meinen Pool für den Frühling wieder in Betrieb nehmen lassen.»", "«Welcher Beckentyp und ungefähr welches Wasservolumen?»", "«Wünschen Sie auch eine Pumpenkontrolle und eine Algenbehandlung?»"],
        offer: { company: "AquaPur Piscines Sàrl", rows: [["Inbetriebnahme im Frühling", 450], ["Kontrolle Pumpe und Filter", 90], ["Algenbehandlung (Schock)", 85]] },
        roi: "Ein einziger zusätzlicher Jahresvertrag kann Ihr Abo für die Saison bereits bezahlen.",
      },
      demo: {
        brand: "AquaPur",
        eyebrow: "Montreux & Riviera · Fiktives Beispiel",
        hero: { h1: "Kristallklares Wasser, ohne Ihre Wochenenden dafür zu opfern.", text: "Inbetriebnahme, Überwinterung, wöchentlicher Unterhalt und Sanierung von Pools und Spas — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "360+", lbl: "BETREUTE BECKEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir pflegen",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Becken einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🌞", title: "Inbetriebnahme", text: "Vollständige Wiederinbetriebnahme im Frühling.", tag: "ab CHF 280" },
          { icon: "❄️", title: "Überwinterung", text: "Schutz von Becken und Ausrüstung.", tag: "ab CHF 240" },
          { icon: "🗓️", title: "Wöchentlicher Unterhalt", text: "Jede Woche ein Einsatz, die ganze Saison.", tag: "ab CHF 48/Einsatz" },
          { icon: "🟢", title: "Grünes Wasser", text: "Vollständige Wassersanierung.", tag: "ab CHF 420" },
          { icon: "⚙️", title: "Ausrüstung", text: "Pumpe, Filter, Roboter, Wärmepumpe.", tag: "ab CHF 70" },
          { icon: "🛁", title: "Spas und Whirlpools", text: "Unterhalt für kleine Volumen.", tag: "ab CHF 120" },
        ],
        about: {
          title: "Pooltechniker, das ganze Jahr",
          text: "AquaPur Piscines pflegt seit 2012 private Becken und Stockwerkeigentümer-Pools zwischen Montreux und der Riviera. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Wasseranalysen", "jeder Einsatz kontrolliert, Resultate protokolliert."], ["Passende Produkte", "Behandlungen nach Volumen und Wetter dosiert."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 00 13", email: "hello@aquapur.demo", zone: "Riviera, Lavaux, Chablais", hours: "Mo–Sa, 7.30–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Pool — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihren Pool…",
        pdfCompany: { name: "AquaPur Piscines Sàrl", address: "Avenue Nestlé 25, 1820 Montreux", phone: "021 000 00 13", email: "hello@aquapur.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Pool und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse des Pools (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig. Pflegeprodukte in den angegebenen Pauschalen inbegriffen. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          pool: { text: "Welcher Beckentyp?", short: "Becken", opts: { inground: "Eingelassener Pool (Beton / Folie)", above: "Aufstellpool", natural: "Naturpool / Biotop", spa: "Spa / Whirlpool" } },
          size: { text: "Wie gross ist das ungefähre Wasservolumen?", short: "Volumen", opts: { xs: "Weniger als 30 m³", s: "30 bis 60 m³", m: "60 bis 100 m³", l: "Mehr als 100 m³" } },
          service: { text: "Welche Leistung interessiert Sie?", short: "Leistung", opts: { open: "Inbetriebnahme im Frühling", winter: "Überwinterung", weekly: "Wöchentlicher Unterhalt (Saison, 20 Wochen)", green: "Sanierung — grünes Wasser", annual: "Jahrespauschale (Inbetriebnahme + Saison + Überwinterung)" } },
          equipment: { text: "Möchten Sie Ausrüstungen kontrollieren lassen?", short: "Ausrüstung", none: "Keine Ausrüstung", opts: { pump: "Pumpe und Filter", robot: "Reinigungsroboter (Revision)", heat: "Wärmepumpe (Kontrolle)", sand: "Ersatz des Filtersands", algae: "Algenbehandlung (Schock)", cover: "Abdeckung montieren / abnehmen" } },
          date: { text: "Ab welchem Datum wünschen Sie den Einsatz?", short: "Wunschdatum" },
        },
        items: {
          open: "Inbetriebnahme im Frühling",
          winter: "Überwinterung des Beckens",
          weekly: "Wöchentlicher Unterhalt — Saison (20 Wochen)",
          green: "Wassersanierung (grünes Wasser)",
          annual: "Jahrespauschale — Inbetriebnahme + Saison + Überwinterung",
          pump: "Kontrolle Pumpe und Filter",
          robot: "Revision des Reinigungsroboters",
          heat: "Kontrolle der Wärmepumpe",
          sand: "Ersatz des Filtersands",
          algae: "Algenbehandlung (Schock)",
          cover: "Abdeckung montieren / abnehmen",
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
