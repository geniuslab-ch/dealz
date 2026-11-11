/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "sols",
    icon: "🪵",
    needsAddress: true,
    colors: { main: "#8d5524", dark: "#6f421b", light: "#f3e3d3", accent: "#2f9e44", accentDark: "#237a35", bg: "#fdfaf6" },

    quote: {
      minimum: 400,
      questions: [
        { id: "work", type: "single", options: [{ id: "install" }, { id: "sanding" }, { id: "repair" }] },
        {
          id: "material", type: "single",
          when: function (a) { return a.work.id === "install"; },
          options: [{ id: "parquet", rate: 95 }, { id: "laminate", rate: 48 }, { id: "vinyl", rate: 58 }, { id: "carpet", rate: 42 }, { id: "resin", rate: 120 }],
        },
        { id: "surf", type: "single", options: [{ id: "s1", m2: 15 }, { id: "s2", m2: 30 }, { id: "s3", m2: 60 }, { id: "s4", m2: 100 }, { id: "s5", m2: 180 }] },
        {
          id: "removal", type: "single",
          when: function (a) { return a.work.id === "install"; },
          options: [{ id: "none", rate: 0 }, { id: "soft", rate: 12 }, { id: "hard", rate: 28 }],
        },
        { id: "extras", type: "multi", options: [{ id: "level" }, { id: "skirting" }, { id: "underlay" }, { id: "furniture" }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surf.m2;
        var w = a.work.id;
        if (w === "install") {
          items.push({ label: L("install_" + a.material.id, { m2: m2 }), amount: H.round5(m2 * a.material.rate) });
          if (a.removal.rate) items.push({ label: L("removal", { m2: m2 }), amount: H.round5(m2 * a.removal.rate) });
        } else if (w === "sanding") {
          items.push({ label: L("sanding", { m2: m2 }), amount: H.round5(m2 * 42) });
        } else {
          items.push({ label: L("callout"), amount: 150 });
          items.push({ label: L("repair", { m2: m2 }), amount: H.round5(250 + m2 * 6) });
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "level") items.push({ label: L("level", { m2: m2 }), amount: H.round5(m2 * 22) });
          if (e.id === "skirting") items.push({ label: L("skirting"), amount: H.round5(m2 * 14) });
          if (e.id === "underlay") items.push({ label: L("underlay", { m2: m2 }), amount: H.round5(m2 * 9) });
          if (e.id === "furniture") items.push({ label: L("furniture"), amount: H.round5(180 + m2 * 2) });
        });
        return items;
      },
    },

    fr: {
      label: "Revêtements de sols",
      forWho: "poseurs de sols, parqueteurs et entreprises de revêtements",
      pitch: "Chiffrez parquet, vinyle, moquette et sols en résine au m², même quand vous êtes à genoux sur un chantier.",
      emailNoun: "vos travaux de sols",
      landing: {
        h1: ["VOUS POSEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de pose de sol perdez-vous parce que vous rappelez trop tard ?",
        text: "Parquet, stratifié, vinyle, résine : vos clients veulent comparer les matériaux et les prix avant de décider. Dealz leur répond à toute heure, pose les bonnes questions (type de sol, surface, dépose, ragréage, plinthes), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour poser du parquet dans un séjour d'environ 30 m² ?",
        values: [
          { icon: "🪵", title: "Matériau par matériau", text: "Parquet, stratifié, vinyle, moquette, résine : le client compare les prix en direct, selon vos propres tarifs au m²." },
          { icon: "🧱", title: "La préparation chiffrée", text: "Dépose de l'ancien revêtement, ragréage, sous-couche, plinthes : plus aucun poste oublié dans vos offres." },
          { icon: "✨", title: "Ponçage et vitrification", text: "Rénover un parquet existant ? Le prix au m² est donné tout de suite, sans visite." },
          { icon: "📅", title: "Des demandes complètes", text: "Surface, matériau, date souhaitée : vous recevez tout ce qu'il faut pour planifier vos poses." },
        ],
        step1: "Importez vos tarifs : prix au m² par matériau, dépose, ragréage, plinthes, sous-couche. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos types de dépose et vos options.",
        excel: { file: "tarifs-sols.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Pose de parquet", "30 m²", "CHF 2 850"], ["Dépose carrelage ou parquet collé", "30 m²", "CHF 840"], ["Ragréage du support", "30 m²", "CHF 660"]] },
        chat: ["« Nous voulons du parquet dans le séjour. »", "« Quelle est la surface de la pièce ? »", "« Faut-il retirer l'ancien revêtement ? »"],
        offer: { company: "Parquets du Jorat Sàrl", rows: [["Pose de parquet (30 m²)", 2850], ["Dépose de l'ancien revêtement (30 m²)", 840], ["Ragréage du support (30 m²)", 660]] },
        roi: "Deux poses de sols supplémentaires par an paient plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Parquets du Jorat",
        eyebrow: "Vaud & Fribourg · Exemple fictif",
        hero: { h1: "Le sol de vos rêves, et son prix au m², en une minute.", text: "Parquet, stratifié, vinyle, moquette et résine dans les cantons de Vaud et Fribourg — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "85 000 m²", lbl: "DE SOLS POSÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos revêtements",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🪵", title: "Parquet", text: "Chêne, noyer, contrecollé ou massif.", tag: "dès CHF 95/m²" },
          { icon: "🟫", title: "Stratifié", text: "Résistant et économique.", tag: "dès CHF 48/m²" },
          { icon: "💧", title: "Vinyle", text: "Idéal pour cuisines et salles de bain.", tag: "dès CHF 58/m²" },
          { icon: "🧶", title: "Moquette", text: "Chambres, bureaux, escaliers.", tag: "dès CHF 42/m²" },
          { icon: "🔷", title: "Sols en résine", text: "Revêtement époxy coulé, sans joints.", tag: "dès CHF 120/m²" },
          { icon: "✨", title: "Ponçage et vitrification", text: "Votre ancien parquet comme neuf.", tag: "dès CHF 42/m²" },
        ],
        about: {
          title: "Des poseurs qui soignent chaque détail",
          text: "Parquets du Jorat pose et rénove des sols depuis 2006 pour les particuliers, régies et commerces de Vaud et Fribourg. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Matériaux certifiés", "bois issu de forêts gérées durablement."], ["Pose garantie", "garantie de 5 ans sur la pose."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 01 03", email: "hello@parquets-jorat.demo", zone: "Vaud, Fribourg", hours: "Lun–Ven, 7h30–17h30" },
        devisNote: "Répondez à quelques questions sur votre sol — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet de sol…",
        pdfCompany: { name: "Parquets du Jorat Sàrl", address: "Route de Palézieux 8, 1610 Oron-la-Ville", phone: "021 000 01 03", email: "hello@parquets-jorat.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre sol, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du chantier (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, matériaux et main-d'œuvre compris. Support humide ou endommagé découvert à la dépose traité uniquement sur accord préalable.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { install: "Pose d'un nouveau revêtement", sanding: "Ponçage et vitrification d'un parquet", repair: "Réparation localisée" } },
          material: { text: "Quel revêtement souhaitez-vous ?", short: "Revêtement", opts: { parquet: "Parquet", laminate: "Stratifié", vinyl: "Vinyle", carpet: "Moquette", resin: "Sol en résine (époxy)" } },
          surf: { text: "Quelle est la surface concernée ?", short: "Surface", opts: { s1: "Environ 15 m²", s2: "Environ 30 m²", s3: "Environ 60 m²", s4: "Environ 100 m²", s5: "150 m² ou plus" } },
          removal: { text: "Faut-il retirer l'ancien revêtement ?", short: "Dépose", opts: { none: "Non, le sol est nu", soft: "Oui, moquette ou vinyle", hard: "Oui, carrelage ou parquet collé" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { level: "Ragréage du support", skirting: "Nouvelles plinthes", underlay: "Sous-couche acoustique", furniture: "Déplacement des meubles" } },
          date: { text: "Pour quelle date souhaitez-vous la pose ?", short: "Date souhaitée" },
        },
        items: {
          install_parquet: "Pose de parquet ({m2} m²)",
          install_laminate: "Pose de stratifié ({m2} m²)",
          install_vinyl: "Pose de vinyle ({m2} m²)",
          install_carpet: "Pose de moquette ({m2} m²)",
          install_resin: "Sol en résine coulée ({m2} m²)",
          removal: "Dépose de l'ancien revêtement ({m2} m²)",
          sanding: "Ponçage et vitrification ({m2} m²)",
          callout: "Déplacement et diagnostic",
          repair: "Réparation localisée du sol",
          level: "Ragréage du support ({m2} m²)",
          skirting: "Fourniture et pose de plinthes",
          underlay: "Sous-couche acoustique ({m2} m²)",
          furniture: "Déplacement des meubles",
        },
      },
    },
    en: {
      label: "Flooring",
      forWho: "floor fitters, parquet layers and flooring companies",
      pitch: "Price parquet, vinyl, carpet and resin floors per m², even when you're on your knees on a job.",
      emailNoun: "your flooring work",
      landing: {
        h1: ["YOU LAY FLOORS.", "DEALZ PRICES."],
        question: "How many flooring requests do you lose because you call back too late?",
        text: "Parquet, laminate, vinyl, resin: your customers want to compare materials and prices before deciding. Dealz answers them at any hour, asks the right questions (floor type, area, removal, levelling, skirting), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to lay parquet in a living room of about 30 m²?",
        values: [
          { icon: "🪵", title: "Material by material", text: "Parquet, laminate, vinyl, carpet, resin: the customer compares prices live, based on your own rates per m²." },
          { icon: "🧱", title: "Preparation priced in", text: "Removing the old floor, levelling, underlay, skirting: no item forgotten in your offers any more." },
          { icon: "✨", title: "Sanding and sealing", text: "Renovating an existing parquet? The price per m² is given straight away, without a visit." },
          { icon: "📅", title: "Complete requests", text: "Area, material, preferred date: you get everything you need to plan your jobs." },
        ],
        step1: "Import your rates: price per m² by material, removal, levelling, skirting, underlay. Your Excel stays your working tool.",
        step2: "The engine understands your areas, your removal types and your options.",
        excel: { file: "flooring-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["Parquet fitting", "30 m²", "CHF 2,850"], ["Removing tiles or glued parquet", "30 m²", "CHF 840"], ["Floor levelling", "30 m²", "CHF 660"]] },
        chat: ["“We'd like parquet in the living room.”", "“How large is the room?”", "“Does the old floor need removing?”"],
        offer: { company: "Parquets du Jorat Sàrl", rows: [["Parquet fitting (30 m²)", 2850], ["Removing the old floor (30 m²)", 840], ["Floor levelling (30 m²)", 660]] },
        roi: "Two extra flooring jobs a year pay for several years of subscription.",
      },
      demo: {
        brand: "Parquets du Jorat",
        eyebrow: "Vaud & Fribourg · Fictional example",
        hero: { h1: "The floor you want, and its price per m², in a minute.", text: "Parquet, laminate, vinyl, carpet and resin in the cantons of Vaud and Fribourg — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "85,000 m²", lbl: "OF FLOORS LAID" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our floors",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🪵", title: "Parquet", text: "Oak, walnut, engineered or solid.", tag: "from CHF 95/m²" },
          { icon: "🟫", title: "Laminate", text: "Hard-wearing and affordable.", tag: "from CHF 48/m²" },
          { icon: "💧", title: "Vinyl", text: "Ideal for kitchens and bathrooms.", tag: "from CHF 58/m²" },
          { icon: "🧶", title: "Carpet", text: "Bedrooms, offices, stairs.", tag: "from CHF 42/m²" },
          { icon: "🔷", title: "Resin floors", text: "Seamless poured epoxy coating.", tag: "from CHF 120/m²" },
          { icon: "✨", title: "Sanding and sealing", text: "Your old parquet like new.", tag: "from CHF 42/m²" },
        ],
        about: {
          title: "Fitters who care about every detail",
          text: "Since 2006, Parquets du Jorat has laid and renovated floors for households, property managers and shops in Vaud and Fribourg. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Certified materials", "wood from sustainably managed forests."], ["Guaranteed fitting", "5-year guarantee on the fitting."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 01 03", email: "hello@parquets-jorat.demo", zone: "Vaud, Fribourg", hours: "Mon–Fri, 7:30am–5:30pm" },
        devisNote: "Answer a few questions about your floor — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your flooring project…",
        pdfCompany: { name: "Parquets du Jorat Sàrl", address: "Route de Palézieux 8, 1610 Oron-la-Ville", phone: "021 000 01 03", email: "hello@parquets-jorat.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your floor, then put together a firm quote right away.",
        addressPlaceholder: "Site address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, materials and labour included. Damp or damaged subfloor found during removal treated only with prior agreement.",
        q: {
          work: { text: "What kind of work do you need?", short: "Work", opts: { install: "Laying a new floor", sanding: "Sanding and sealing a parquet", repair: "Local repair" } },
          material: { text: "Which floor covering would you like?", short: "Covering", opts: { parquet: "Parquet", laminate: "Laminate", vinyl: "Vinyl", carpet: "Carpet", resin: "Resin floor (epoxy)" } },
          surf: { text: "How large is the area?", short: "Area", opts: { s1: "About 15 m²", s2: "About 30 m²", s3: "About 60 m²", s4: "About 100 m²", s5: "150 m² or more" } },
          removal: { text: "Does the old floor need removing?", short: "Removal", opts: { none: "No, the floor is bare", soft: "Yes, carpet or vinyl", hard: "Yes, tiles or glued parquet" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { level: "Floor levelling", skirting: "New skirting boards", underlay: "Acoustic underlay", furniture: "Moving the furniture" } },
          date: { text: "When would you like the floor laid?", short: "Preferred date" },
        },
        items: {
          install_parquet: "Parquet fitting ({m2} m²)",
          install_laminate: "Laminate fitting ({m2} m²)",
          install_vinyl: "Vinyl fitting ({m2} m²)",
          install_carpet: "Carpet fitting ({m2} m²)",
          install_resin: "Poured resin floor ({m2} m²)",
          removal: "Removing the old floor ({m2} m²)",
          sanding: "Sanding and sealing ({m2} m²)",
          callout: "Call-out and diagnosis",
          repair: "Local floor repair",
          level: "Floor levelling ({m2} m²)",
          skirting: "Supply and fitting of skirting boards",
          underlay: "Acoustic underlay ({m2} m²)",
          furniture: "Moving the furniture",
        },
      },
    },
    de: {
      label: "Bodenbeläge",
      forWho: "Bodenleger, Parkettleger und Bodenbelagsfirmen",
      pitch: "Parkett, Vinyl, Teppich und Kunstharzböden pro m² berechnen — auch wenn Sie gerade auf den Knien arbeiten.",
      emailNoun: "Ihre Bodenarbeiten",
      landing: {
        h1: ["SIE VERLEGEN.", "DEALZ RECHNET."],
        question: "Wie viele Bodenbelags-Anfragen verlieren Sie, weil Sie zu spät zurückrufen?",
        text: "Parkett, Laminat, Vinyl, Kunstharz: Ihre Kunden wollen Materialien und Preise vergleichen, bevor sie entscheiden. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Belag, Fläche, Rückbau, Ausgleich, Sockelleisten), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet Parkett in einem Wohnzimmer von etwa 30 m²?",
        values: [
          { icon: "🪵", title: "Material für Material", text: "Parkett, Laminat, Vinyl, Teppich, Kunstharz: Der Kunde vergleicht die Preise live, nach Ihren eigenen m²-Tarifen." },
          { icon: "🧱", title: "Vorarbeiten berechnet", text: "Alten Belag entfernen, Ausgleichsmasse, Trittschalldämmung, Sockelleisten: keine vergessene Position mehr." },
          { icon: "✨", title: "Schleifen und Versiegeln", text: "Ein bestehendes Parkett renovieren? Der m²-Preis kommt sofort, ohne Besichtigung." },
          { icon: "📅", title: "Vollständige Anfragen", text: "Fläche, Material, Wunschtermin: Sie erhalten alles, um Ihre Einsätze zu planen." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m² nach Material, Rückbau, Ausgleich, Sockelleisten, Dämmung. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Flächen, Ihre Rückbau-Arten und Ihre Optionen.",
        excel: { file: "tarife-boden.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Parkett verlegen", "30 m²", "CHF 2'850"], ["Platten oder geklebtes Parkett entfernen", "30 m²", "CHF 840"], ["Ausgleichsmasse", "30 m²", "CHF 660"]] },
        chat: ["«Wir möchten Parkett im Wohnzimmer.»", "«Wie gross ist der Raum?»", "«Muss der alte Belag entfernt werden?»"],
        offer: { company: "Parquets du Jorat Sàrl", rows: [["Parkett verlegen (30 m²)", 2850], ["Alten Belag entfernen (30 m²)", 840], ["Ausgleichsmasse (30 m²)", 660]] },
        roi: "Zwei zusätzliche Bodenaufträge pro Jahr bezahlen mehrere Jahre Abo.",
      },
      demo: {
        brand: "Parquets du Jorat",
        eyebrow: "Waadt & Freiburg · Fiktives Beispiel",
        hero: { h1: "Ihr Wunschboden und sein m²-Preis, in einer Minute.", text: "Parkett, Laminat, Vinyl, Teppich und Kunstharz in den Kantonen Waadt und Freiburg — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "85'000 m²", lbl: "VERLEGTE BÖDEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Bodenbeläge",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🪵", title: "Parkett", text: "Eiche, Nussbaum, Mehrschicht oder massiv.", tag: "ab CHF 95/m²" },
          { icon: "🟫", title: "Laminat", text: "Robust und günstig.", tag: "ab CHF 48/m²" },
          { icon: "💧", title: "Vinyl", text: "Ideal für Küche und Bad.", tag: "ab CHF 58/m²" },
          { icon: "🧶", title: "Teppich", text: "Schlafzimmer, Büros, Treppen.", tag: "ab CHF 42/m²" },
          { icon: "🔷", title: "Kunstharzböden", text: "Fugenlose Epoxid-Beschichtung.", tag: "ab CHF 120/m²" },
          { icon: "✨", title: "Schleifen und Versiegeln", text: "Ihr altes Parkett wie neu.", tag: "ab CHF 42/m²" },
        ],
        about: {
          title: "Bodenleger mit Liebe zum Detail",
          text: "Parquets du Jorat verlegt und renoviert seit 2006 Böden für Privatpersonen, Verwaltungen und Geschäfte in der Waadt und in Freiburg. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Zertifizierte Materialien", "Holz aus nachhaltiger Forstwirtschaft."], ["Garantierte Verlegung", "5 Jahre Garantie auf die Verlegung."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 01 03", email: "hello@parquets-jorat.demo", zone: "Waadt, Freiburg", hours: "Mo–Fr, 7.30–17.30 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Boden — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Bodenprojekt…",
        pdfCompany: { name: "Parquets du Jorat Sàrl", address: "Route de Palézieux 8, 1610 Oron-la-Ville", phone: "021 000 01 03", email: "hello@parquets-jorat.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Boden und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse der Baustelle (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Material und Arbeit inbegriffen. Beim Rückbau entdeckter feuchter oder schadhafter Untergrund nur nach vorheriger Absprache.",
        q: {
          work: { text: "Welche Arbeiten wünschen Sie?", short: "Arbeiten", opts: { install: "Neuen Belag verlegen", sanding: "Parkett schleifen und versiegeln", repair: "Lokale Reparatur" } },
          material: { text: "Welchen Belag wünschen Sie?", short: "Belag", opts: { parquet: "Parkett", laminate: "Laminat", vinyl: "Vinyl", carpet: "Teppich", resin: "Kunstharzboden (Epoxid)" } },
          surf: { text: "Wie gross ist die betroffene Fläche?", short: "Fläche", opts: { s1: "Etwa 15 m²", s2: "Etwa 30 m²", s3: "Etwa 60 m²", s4: "Etwa 100 m²", s5: "150 m² oder mehr" } },
          removal: { text: "Muss der alte Belag entfernt werden?", short: "Rückbau", opts: { none: "Nein, der Boden ist roh", soft: "Ja, Teppich oder Vinyl", hard: "Ja, Platten oder geklebtes Parkett" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { level: "Ausgleichsmasse", skirting: "Neue Sockelleisten", underlay: "Trittschalldämmung", furniture: "Möbel verschieben" } },
          date: { text: "Wann soll verlegt werden?", short: "Wunschtermin" },
        },
        items: {
          install_parquet: "Parkett verlegen ({m2} m²)",
          install_laminate: "Laminat verlegen ({m2} m²)",
          install_vinyl: "Vinyl verlegen ({m2} m²)",
          install_carpet: "Teppich verlegen ({m2} m²)",
          install_resin: "Kunstharzboden giessen ({m2} m²)",
          removal: "Alten Belag entfernen ({m2} m²)",
          sanding: "Schleifen und Versiegeln ({m2} m²)",
          callout: "Anfahrt und Diagnose",
          repair: "Lokale Bodenreparatur",
          level: "Ausgleichsmasse ({m2} m²)",
          skirting: "Lieferung und Montage von Sockelleisten",
          underlay: "Trittschalldämmung ({m2} m²)",
          furniture: "Möbel verschieben",
        },
      },
    },
    it: {
      label: "Pavimenti",
      forWho: "posatori di pavimenti, parquettisti e imprese di rivestimenti",
      pitch: "Calcolate parquet, vinile, moquette e resina al m², anche quando siete in ginocchio in cantiere.",
      emailNoun: "i vostri lavori di pavimentazione",
      landing: {
        h1: ["VOI POSATE.", "DEALZ FA IL PREVENTIVO."],
        question: "Quante richieste di pavimenti perdete perché richiamate troppo tardi?",
        text: "Parquet, laminato, vinile, resina: i vostri clienti vogliono confrontare materiali e prezzi prima di decidere. Dealz risponde loro a qualsiasi ora, pone le domande giuste (tipo di pavimento, superficie, rimozione, livellamento, zoccolini), calcola il vostro prezzo secondo le vostre tariffe e prepara il loro preventivo.",
        clientQ: "Quanto costa posare il parquet in un soggiorno di circa 30 m²?",
        values: [
          { icon: "🪵", title: "Materiale per materiale", text: "Parquet, laminato, vinile, moquette, resina: il cliente confronta i prezzi in diretta, secondo le vostre tariffe al m²." },
          { icon: "🧱", title: "Preparazione calcolata", text: "Rimozione del vecchio pavimento, livellamento, sottofondo, zoccolini: nessuna voce più dimenticata nelle vostre offerte." },
          { icon: "✨", title: "Levigatura e verniciatura", text: "Rinnovare un parquet esistente? Il prezzo al m² viene dato subito, senza sopralluogo." },
          { icon: "📅", title: "Richieste complete", text: "Superficie, materiale, data desiderata: ricevete tutto ciò che serve per pianificare i vostri cantieri." },
        ],
        step1: "Importate le vostre tariffe: prezzo al m² per materiale, rimozione, livellamento, zoccolini, sottofondo. Il vostro Excel resta il vostro strumento di lavoro.",
        step2: "Il motore capisce le vostre superfici, i tipi di rimozione e le opzioni.",
        excel: { file: "tariffe-pavimenti.xlsx", headers: ["Voce", "Condizione", "Prezzo"], rows: [["Posa parquet", "30 m²", "CHF 2'850"], ["Rimozione piastrelle o parquet incollato", "30 m²", "CHF 840"], ["Livellamento del sottofondo", "30 m²", "CHF 660"]] },
        chat: ["«Vorremmo il parquet in soggiorno.»", "«Quanto è grande il locale?»", "«Il vecchio pavimento va rimosso?»"],
        offer: { company: "Parquets du Jorat Sàrl", rows: [["Posa parquet (30 m²)", 2850], ["Rimozione del vecchio pavimento (30 m²)", 840], ["Livellamento del sottofondo (30 m²)", 660]] },
        roi: "Due cantieri di pavimenti in più all'anno pagano diversi anni di abbonamento.",
      },
      demo: {
        brand: "Parquets du Jorat",
        eyebrow: "Vaud e Friburgo · Esempio fittizio",
        hero: { h1: "Il pavimento che volete, e il suo prezzo al m², in un minuto.", text: "Parquet, laminato, vinile, moquette e resina nei cantoni Vaud e Friburgo: ottenete un prezzo fisso in pochi secondi, direttamente su questo sito." },
        stats: [{ num: "4.9★", lbl: "SODDISFAZIONE CLIENTI" }, { num: "85'000 m²", lbl: "DI PAVIMENTI POSATI" }, { num: "< 1 min", lbl: "PER UN PREVENTIVO" }],
        servicesTitle: "I nostri pavimenti",
        servicesSub: "Scegliete un servizio, oppure descrivete semplicemente il vostro progetto nella scheda «Ottenere un preventivo».",
        services: [
          { icon: "🪵", title: "Parquet", text: "Rovere, noce, prefinito o massello.", tag: "da CHF 95/m²" },
          { icon: "🟫", title: "Laminato", text: "Resistente e conveniente.", tag: "da CHF 48/m²" },
          { icon: "💧", title: "Vinile", text: "Ideale per cucine e bagni.", tag: "da CHF 58/m²" },
          { icon: "🧶", title: "Moquette", text: "Camere, uffici, scale.", tag: "da CHF 42/m²" },
          { icon: "🔷", title: "Pavimenti in resina", text: "Rivestimento epossidico colato senza giunti.", tag: "da CHF 120/m²" },
          { icon: "✨", title: "Levigatura e verniciatura", text: "Il vostro vecchio parquet come nuovo.", tag: "da CHF 42/m²" },
        ],
        about: {
          title: "Posatori attenti a ogni dettaglio",
          text: "Dal 2006 Parquets du Jorat posa e rinnova pavimenti per privati, amministrazioni e negozi nei cantoni Vaud e Friburgo. Nel 2026 abbiamo aggiunto al nostro sito un assistente di preventivi immediato: più veloce per voi, meno burocrazia per noi.",
          bullets: [["Materiali certificati", "legno da foreste gestite in modo sostenibile."], ["Posa garantita", "garanzia di 5 anni sulla posa."], ["Prezzo trasparente", "il preventivo ricevuto è il prezzo pagato."]],
        },
        contact: { phone: "021 000 01 03", email: "hello@parquets-jorat.demo", zone: "Vaud, Friburgo", hours: "Lun–Ven, 7.30–17.30" },
        devisNote: "Rispondete a qualche domanda sul vostro pavimento: riceverete un vero preventivo, che potrete accettare o rifiutare direttamente qui.",
        inputPlaceholder: "Descrivete il vostro progetto di pavimento…",
        pdfCompany: { name: "Parquets du Jorat Sàrl", address: "Route de Palézieux 8, 1610 Oron-la-Ville", phone: "021 000 01 03", email: "hello@parquets-jorat.demo" },
      },
      quote: {
        greeting: "Buongiorno! Vi faccio qualche domanda rapida sul vostro pavimento, poi vi preparo subito un preventivo fisso.",
        addressPlaceholder: "Indirizzo del cantiere (via, NPA, località)",
        terms: "Preventivo fisso, valido 30 giorni, materiali e manodopera inclusi. Sottofondo umido o danneggiato scoperto durante la rimozione trattato solo previo accordo.",
        q: {
          work: { text: "Che tipo di lavori desiderate?", short: "Lavori", opts: { install: "Posa di un nuovo pavimento", sanding: "Levigatura e verniciatura di un parquet", repair: "Riparazione localizzata" } },
          material: { text: "Quale rivestimento desiderate?", short: "Rivestimento", opts: { parquet: "Parquet", laminate: "Laminato", vinyl: "Vinile", carpet: "Moquette", resin: "Pavimento in resina (epossidica)" } },
          surf: { text: "Quanto è grande la superficie?", short: "Superficie", opts: { s1: "Circa 15 m²", s2: "Circa 30 m²", s3: "Circa 60 m²", s4: "Circa 100 m²", s5: "150 m² e oltre" } },
          removal: { text: "Il vecchio pavimento va rimosso?", short: "Rimozione", opts: { none: "No, il sottofondo è nudo", soft: "Sì, moquette o vinile", hard: "Sì, piastrelle o parquet incollato" } },
          extras: { text: "Desiderate delle opzioni?", short: "Opzioni", none: "Nessuna opzione", opts: { level: "Livellamento del sottofondo", skirting: "Nuovi zoccolini", underlay: "Sottofondo acustico", furniture: "Spostamento dei mobili" } },
          date: { text: "Per quale data desiderate la posa?", short: "Data desiderata" },
        },
        items: {
          install_parquet: "Posa parquet ({m2} m²)",
          install_laminate: "Posa laminato ({m2} m²)",
          install_vinyl: "Posa vinile ({m2} m²)",
          install_carpet: "Posa moquette ({m2} m²)",
          install_resin: "Pavimento in resina colata ({m2} m²)",
          removal: "Rimozione del vecchio pavimento ({m2} m²)",
          sanding: "Levigatura e verniciatura ({m2} m²)",
          callout: "Trasferta e diagnosi",
          repair: "Riparazione localizzata del pavimento",
          level: "Livellamento del sottofondo ({m2} m²)",
          skirting: "Fornitura e posa degli zoccolini",
          underlay: "Sottofondo acustico ({m2} m²)",
          furniture: "Spostamento dei mobili",
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
