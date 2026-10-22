/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "nettoyage-textiles",
    icon: "🛋️",
    needsAddress: true,
    colors: { main: "#0891b2", dark: "#0e7490", light: "#cffafe", accent: "#ec4899", accentDark: "#db2777", bg: "#fafeff" },

    quote: {
      minimum: 90,
      questions: [
        { id: "scope", type: "multi", options: [{ id: "sofa" }, { id: "rug" }, { id: "mattress" }] },
        {
          id: "sofa", type: "single",
          when: function (a) { return a.scope.some(function (o) { return o.id === "sofa"; }); },
          options: [{ id: "s2", price: 95 }, { id: "s3", price: 130 }, { id: "corner", price: 185 }],
        },
        {
          id: "rug", type: "single",
          when: function (a) { return a.scope.some(function (o) { return o.id === "rug"; }); },
          options: [{ id: "small", price: 45 }, { id: "medium", price: 95 }, { id: "large", price: 160 }, { id: "several", price: 260 }],
        },
        {
          id: "mattress", type: "single",
          when: function (a) { return a.scope.some(function (o) { return o.id === "mattress"; }); },
          options: [{ id: "one", price: 70 }, { id: "double", price: 95 }, { id: "two", price: 140 }, { id: "many", price: 195 }],
        },
        { id: "stain", type: "single", options: [{ id: "normal", k: 1 }, { id: "stains", k: 1.25 }, { id: "pets", k: 1.4 }] },
        { id: "place", type: "single", options: [{ id: "home", fee: 45 }, { id: "shop", fee: 0 }] },
        { id: "protect", type: "multi", options: [{ id: "guard" }, { id: "mites" }, { id: "deodor" }] },
        { id: "date", type: "date", minDays: 2 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var k = a.stain.k;
        var has = function (id) { return a.scope.some(function (o) { return o.id === id; }); };
        if (has("sofa")) items.push({ label: L("sofa_" + a.sofa.id), amount: H.round5(a.sofa.price * k) });
        if (has("rug")) items.push({ label: L("rug_" + a.rug.id), amount: H.round5(a.rug.price * k) });
        if (has("mattress")) items.push({ label: L("mattress_" + a.mattress.id), amount: H.round5(a.mattress.price * k) });
        if (!items.length) items.push({ label: L("diag"), amount: 60 });
        var sub = items.reduce(function (s, i) { return s + i.amount; }, 0);
        (a.protect || []).forEach(function (p) {
          if (p.id === "guard") items.push({ label: L("guard"), amount: H.round5(sub * 0.18 + 15) });
          if (p.id === "mites" && has("mattress")) items.push({ label: L("mites"), amount: 45 });
          if (p.id === "deodor") items.push({ label: L("deodor"), amount: 35 });
        });
        if (a.place.fee) items.push({ label: L("travel"), amount: a.place.fee });
        return items;
      },
    },

    fr: {
      label: "Nettoyage de canapés, tapis et matelas",
      forWho: "entreprises de nettoyage de canapés, tapis et matelas",
      pitch: "Chiffrez canapés, tapis et matelas d'après leur taille et leur état.",
      emailNoun: "le nettoyage de vos textiles",
      landing: {
        h1: ["VOUS DÉTACHEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de nettoyage de canapé ou de matelas perdez-vous le soir ?",
        text: "Une tache sur le canapé, un matelas à rafraîchir : le client veut un prix tout de suite. Dealz lui répond à toute heure, pose les bonnes questions (type de textile, taille, taches, animaux), calcule votre prix selon vos tarifs et prépare son devis.",
        clientQ: "Combien pour nettoyer un canapé d'angle et un matelas double ?",
        values: [
          { icon: "🛋️", title: "Un prix par pièce, sans photo à échanger", text: "Type, taille et niveau de salissure suffisent pour chiffrer les cas courants." },
          { icon: "🐾", title: "Les taches et les animaux pris en compte", text: "Taches tenaces, odeurs d'animaux : vos majorations s'appliquent automatiquement." },
          { icon: "🚐", title: "Atelier ou domicile", text: "Dealz propose le bon mode d'intervention et facture le déplacement selon vos règles." },
          { icon: "✨", title: "Traitements en plus, faciles à vendre", text: "Anti-taches, anti-acariens, désodorisation : chaque option s'ajoute au devis en un clic." },
        ],
        step1: "Importez vos tarifs : prix par type de canapé, tapis, matelas, majorations taches et animaux, déplacement, traitements.",
        step2: "Le moteur comprend vos tailles, vos niveaux de salissure, vos lieux d'intervention et vos options.",
        excel: { file: "tarifs-textiles.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Canapé d'angle", "5 places et plus", "CHF 185"], ["Matelas double", "Acariens inclus", "CHF 95"], ["Déplacement", "À domicile", "CHF 45"]] },
        chat: ["« Je voudrais faire nettoyer mon canapé d'angle et un matelas. »", "« Y a-t-il des taches tenaces ou des traces d'animaux ? »", "« Intervenez-vous à domicile ou déposez-vous à l'atelier ? »"],
        offer: { company: "FraîcheurTex Sàrl", rows: [["Canapé d'angle", 185], ["Matelas double", 95], ["Déplacement à domicile", 45]] },
        roi: "Un seul canapé supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "FraîcheurTex",
        eyebrow: "Nyon & La Côte · Exemple fictif",
        hero: { h1: "Canapés, tapis et matelas comme neufs.", text: "Nettoyage en profondeur à domicile ou à l'atelier, sur La Côte et dans le Grand Genève — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "6 400+", lbl: "TEXTILES TRAITÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous nettoyons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🛋️", title: "Canapés", text: "Tissu, microfibre, cuir : nettoyage en profondeur.", tag: "dès CHF 95" },
          { icon: "🧶", title: "Tapis", text: "Nettoyage à domicile ou à l'atelier.", tag: "dès CHF 45" },
          { icon: "🛏️", title: "Matelas", text: "Aspiration, injection-extraction, séchage.", tag: "dès CHF 70" },
          { icon: "🐕", title: "Odeurs d'animaux", text: "Traitement ciblé des traces et des odeurs.", tag: "+40 %" },
          { icon: "🛡️", title: "Anti-taches", text: "Protection durable après nettoyage.", tag: "dès CHF 15" },
          { icon: "🚐", title: "Service à domicile", text: "Nous venons chez vous avec tout le matériel.", tag: "CHF 45" },
        ],
        about: {
          title: "Des spécialistes du textile, pas des généralistes",
          text: "FraîcheurTex nettoie les textiles d'ameublement des particuliers et des professionnels de La Côte depuis 2016. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Machines professionnelles", "injection-extraction et séchage rapide."], ["Produits adaptés", "sans danger pour les enfants et les animaux."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 30", email: "hello@fraicheurtex.demo", zone: "La Côte, Grand Genève", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur vos textiles — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez ce que vous souhaitez nettoyer…",
        pdfCompany: { name: "FraîcheurTex Sàrl", address: "Rue de la Gare 22, 1260 Nyon", phone: "022 000 00 30", email: "hello@fraicheurtex.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos textiles, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse d'intervention (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Résultat dépendant de la nature des taches et des fibres. TVA suisse incluse le cas échéant.",
        q: {
          scope: { text: "Que souhaitez-vous faire nettoyer ?", short: "Textiles", none: "Je ne sais pas encore", opts: { sofa: "Canapé", rug: "Tapis", mattress: "Matelas" } },
          sofa: { text: "Quelle taille de canapé ?", short: "Canapé", opts: { s2: "2 places", s3: "3 places", corner: "Angle ou 5 places et plus" } },
          rug: { text: "Quel tapis souhaitez-vous nettoyer ?", short: "Tapis", opts: { small: "1 petit tapis (moins de 2 m²)", medium: "1 tapis moyen (2 à 6 m²)", large: "1 grand tapis (plus de 6 m²)", several: "Plusieurs tapis" } },
          mattress: { text: "Combien de matelas ?", short: "Matelas", opts: { one: "1 matelas (1 place)", double: "1 matelas double", two: "2 matelas", many: "3 matelas ou plus" } },
          stain: { text: "Dans quel état sont les textiles ?", short: "État", opts: { normal: "Entretien courant", stains: "Taches tenaces", pets: "Odeurs ou traces d'animaux" } },
          place: { text: "Où doit avoir lieu le nettoyage ?", short: "Lieu", opts: { home: "À domicile (nous venons chez vous)", shop: "Dépôt à l'atelier" } },
          protect: { text: "Souhaitez-vous des traitements en plus ?", short: "Traitements", none: "Aucun traitement", opts: { guard: "Protection anti-taches", mites: "Traitement anti-acariens (matelas)", deodor: "Désodorisation" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          sofa_s2: "Nettoyage canapé 2 places",
          sofa_s3: "Nettoyage canapé 3 places",
          sofa_corner: "Nettoyage canapé d'angle / 5 places et plus",
          rug_small: "Nettoyage petit tapis",
          rug_medium: "Nettoyage tapis moyen",
          rug_large: "Nettoyage grand tapis",
          rug_several: "Nettoyage de plusieurs tapis",
          mattress_one: "Nettoyage matelas (1 place)",
          mattress_double: "Nettoyage matelas double",
          mattress_two: "Nettoyage de 2 matelas",
          mattress_many: "Nettoyage de 3 matelas ou plus",
          diag: "Forfait diagnostic à domicile",
          guard: "Protection anti-taches",
          mites: "Traitement anti-acariens",
          deodor: "Désodorisation",
          travel: "Déplacement à domicile",
        },
      },
    },

    // ---- English texts ----
    en: {
      label: "Upholstery, Rug & Mattress Cleaning",
      forWho: "sofa, rug and mattress cleaning companies",
      pitch: "Price sofas, rugs and mattresses by their size and condition.",
      emailNoun: "your textile cleaning",
      landing: {
        h1: ["YOU CLEAN.", "DEALZ PRICES IT."],
        question: "How many sofa or mattress cleaning requests are you losing in the evening?",
        text: "A stain on the sofa, a mattress that needs freshening up: the client wants a price right away. Dealz replies any time of day, asks the right questions (textile type, size, stains, pets), calculates your price from your own rates and prepares their quote.",
        clientQ: "How much to clean a corner sofa and a double mattress?",
        values: [
          { icon: "🛋️", title: "A price per item, no photos needed", text: "Type, size and level of soiling are enough to price standard cases." },
          { icon: "🐾", title: "Stains and pets taken into account", text: "Stubborn stains, pet odours: your surcharges apply automatically." },
          { icon: "🚐", title: "Workshop or on-site", text: "Dealz suggests the right service mode and charges travel according to your rules." },
          { icon: "✨", title: "Easy-to-sell add-on treatments", text: "Stain protection, anti-mite, deodorising: every option is added to the quote in one click." },
        ],
        step1: "Import your rates: price by sofa type, rugs, mattresses, stain and pet surcharges, travel, treatments.",
        step2: "The engine understands your sizes, soiling levels, service locations and options.",
        excel: { file: "textile-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Corner sofa", "5 seats and more", "CHF 185"], ["Double mattress", "Mite treatment included", "CHF 95"], ["Travel", "On-site", "CHF 45"]] },
        chat: ["\"I'd like to have my corner sofa and a mattress cleaned.\"", "\"Are there any stubborn stains or pet traces?\"", "\"Do you come to my home, or do I drop it off at your workshop?\""],
        offer: { company: "FraîcheurTex Sàrl", rows: [["Corner sofa", 185], ["Double mattress", 95], ["On-site travel", 45]] },
        roi: "Just one extra sofa per week can already cover your subscription.",
      },
      demo: {
        brand: "FraîcheurTex",
        eyebrow: "Nyon & La Côte · Fictional example",
        hero: { h1: "Sofas, rugs and mattresses, good as new.", text: "Deep cleaning at home or at our workshop, across La Côte and Greater Geneva — get a firm price in seconds, right on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "6,400+", lbl: "ITEMS TREATED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we clean",
        servicesSub: "Choose a service, or simply describe your need in the \"Get a quote\" tab.",
        services: [
          { icon: "🛋️", title: "Sofas", text: "Fabric, microfibre, leather: deep cleaning.", tag: "from CHF 95" },
          { icon: "🧶", title: "Rugs", text: "Cleaned at home or at our workshop.", tag: "from CHF 45" },
          { icon: "🛏️", title: "Mattresses", text: "Vacuuming, injection-extraction, drying.", tag: "from CHF 70" },
          { icon: "🐕", title: "Pet odours", text: "Targeted treatment of traces and odours.", tag: "+40%" },
          { icon: "🛡️", title: "Stain protection", text: "Long-lasting protection after cleaning.", tag: "from CHF 15" },
          { icon: "🚐", title: "On-site service", text: "We come to you with all the equipment.", tag: "CHF 45" },
        ],
        about: {
          title: "Textile specialists, not generalists",
          text: "FraîcheurTex has cleaned upholstery for individuals and professionals across La Côte since 2016. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Professional machines", "injection-extraction and fast drying."], ["Suitable products", "safe for children and pets."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "022 000 00 30", email: "hello@fraicheurtex.demo", zone: "La Côte, Greater Geneva", hours: "Mon–Sat, 8am–6pm" },
        devisNote: "Answer a few questions about your textiles — you'll receive a real quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe what you'd like cleaned…",
        pdfCompany: { name: "FraîcheurTex Sàrl", address: "Rue de la Gare 22, 1260 Nyon", phone: "022 000 00 30", email: "hello@fraicheurtex.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your textiles, then give you a firm quote right after.",
        addressPlaceholder: "Service address (street, postcode, town)",
        terms: "Firm quote, valid 30 days. Result depends on the nature of the stains and fibres. Swiss VAT included where applicable.",
        q: {
          scope: { text: "What would you like cleaned?", short: "Textiles", none: "I don't know yet", opts: { sofa: "Sofa", rug: "Rug", mattress: "Mattress" } },
          sofa: { text: "What size is the sofa?", short: "Sofa", opts: { s2: "2-seater", s3: "3-seater", corner: "Corner sofa or 5+ seats" } },
          rug: { text: "Which rug would you like cleaned?", short: "Rug", opts: { small: "1 small rug (under 2 m²)", medium: "1 medium rug (2 to 6 m²)", large: "1 large rug (over 6 m²)", several: "Several rugs" } },
          mattress: { text: "How many mattresses?", short: "Mattress", opts: { one: "1 mattress (single)", double: "1 double mattress", two: "2 mattresses", many: "3 mattresses or more" } },
          stain: { text: "What condition are the textiles in?", short: "Condition", opts: { normal: "Regular upkeep", stains: "Stubborn stains", pets: "Pet odours or traces" } },
          place: { text: "Where should the cleaning take place?", short: "Location", opts: { home: "At home (we come to you)", shop: "Drop-off at the workshop" } },
          protect: { text: "Would you like any add-on treatments?", short: "Treatments", none: "No treatment", opts: { guard: "Stain protection", mites: "Anti-mite treatment (mattress)", deodor: "Deodorising" } },
          date: { text: "What date would you like the service to take place?", short: "Preferred date" },
        },
        items: {
          sofa_s2: "2-seater sofa cleaning",
          sofa_s3: "3-seater sofa cleaning",
          sofa_corner: "Corner sofa / 5+ seats cleaning",
          rug_small: "Small rug cleaning",
          rug_medium: "Medium rug cleaning",
          rug_large: "Large rug cleaning",
          rug_several: "Cleaning of several rugs",
          mattress_one: "Mattress cleaning (single)",
          mattress_double: "Double mattress cleaning",
          mattress_two: "Cleaning of 2 mattresses",
          mattress_many: "Cleaning of 3 mattresses or more",
          diag: "On-site assessment fee",
          guard: "Stain protection",
          mites: "Anti-mite treatment",
          deodor: "Deodorising",
          travel: "On-site travel fee",
        },
      },
    },

    // ---- German texts (Swiss High German — no ß) ----
    de: {
      label: "Reinigung von Sofas, Teppichen und Matratzen",
      forWho: "Unternehmen für die Reinigung von Sofas, Teppichen und Matratzen",
      pitch: "Berechnen Sie Sofas, Teppiche und Matratzen nach Grösse und Zustand.",
      emailNoun: "die Reinigung Ihrer Textilien",
      landing: {
        h1: ["SIE ENTFERNEN FLECKEN.", "DEALZ RECHNET."],
        question: "Wie viele Anfragen für die Reinigung von Sofa oder Matratze verlieren Sie am Abend?",
        text: "Ein Fleck auf dem Sofa, eine Matratze, die aufgefrischt werden muss: Der Kunde möchte sofort einen Preis. Dealz antwortet rund um die Uhr, stellt die richtigen Fragen (Textilart, Grösse, Flecken, Haustiere), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Reinigung eines Eck-Sofas und einer Doppelmatratze?",
        values: [
          { icon: "🛋️", title: "Ein Preis pro Stück, ohne Fotoaustausch", text: "Art, Grösse und Verschmutzungsgrad reichen aus, um Standardfälle zu berechnen." },
          { icon: "🐾", title: "Flecken und Haustiere berücksichtigt", text: "Hartnäckige Flecken, Tiergeruch: Ihre Zuschläge gelten automatisch." },
          { icon: "🚐", title: "Werkstatt oder vor Ort", text: "Dealz schlägt die passende Einsatzart vor und berechnet die Anfahrt nach Ihren Regeln." },
          { icon: "✨", title: "Leicht verkäufliche Zusatzbehandlungen", text: "Fleckenschutz, Anti-Milben, Geruchsneutralisierung: jede Option wird mit einem Klick zur Offerte hinzugefügt." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis nach Sofaart, Teppich, Matratze, Zuschläge für Flecken und Haustiere, Anfahrt, Behandlungen.",
        step2: "Die Engine versteht Ihre Grössen, Verschmutzungsgrade, Einsatzorte und Optionen.",
        excel: { file: "tarife-textilien.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Eck-Sofa", "5 Sitzplätze und mehr", "CHF 185"], ["Doppelmatratze", "Milbenbehandlung inklusive", "CHF 95"], ["Anfahrt", "Vor Ort", "CHF 45"]] },
        chat: ["«Ich möchte mein Eck-Sofa und eine Matratze reinigen lassen.»", "«Gibt es hartnäckige Flecken oder Spuren von Haustieren?»", "«Kommen Sie zu mir nach Hause, oder bringe ich es in die Werkstatt?»"],
        offer: { company: "FraîcheurTex Sàrl", rows: [["Eck-Sofa", 185], ["Doppelmatratze", 95], ["Anfahrt vor Ort", 45]] },
        roi: "Schon ein einziges zusätzliches Sofa pro Woche kann Ihr Abonnement decken.",
      },
      demo: {
        brand: "FraîcheurTex",
        eyebrow: "Nyon & La Côte · Fiktives Beispiel",
        hero: { h1: "Sofas, Teppiche und Matratzen wie neu.", text: "Tiefenreinigung bei Ihnen zu Hause oder in unserer Werkstatt, in der Region La Côte und Grossraum Genf — erhalten Sie in Sekunden einen festen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "6400+", lbl: "BEHANDELTE TEXTILIEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir reinigen",
        servicesSub: "Wählen Sie eine Leistung oder beschreiben Sie Ihr Anliegen einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🛋️", title: "Sofas", text: "Stoff, Mikrofaser, Leder: Tiefenreinigung.", tag: "ab CHF 95" },
          { icon: "🧶", title: "Teppiche", text: "Reinigung zu Hause oder in der Werkstatt.", tag: "ab CHF 45" },
          { icon: "🛏️", title: "Matratzen", text: "Absaugen, Injektions-Extraktion, Trocknung.", tag: "ab CHF 70" },
          { icon: "🐕", title: "Tiergeruch", text: "Gezielte Behandlung von Spuren und Gerüchen.", tag: "+40%" },
          { icon: "🛡️", title: "Fleckenschutz", text: "Langanhaltender Schutz nach der Reinigung.", tag: "ab CHF 15" },
          { icon: "🚐", title: "Service vor Ort", text: "Wir kommen mit dem gesamten Material zu Ihnen.", tag: "CHF 45" },
        ],
        about: {
          title: "Textilspezialisten, keine Generalisten",
          text: "FraîcheurTex reinigt seit 2016 Polstermöbel für Privatpersonen und Unternehmen in der Region La Côte. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Professionelle Maschinen", "Injektions-Extraktion und schnelle Trocknung."], ["Geeignete Produkte", "unbedenklich für Kinder und Haustiere."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "022 000 00 30", email: "hello@fraicheurtex.demo", zone: "La Côte, Grossraum Genf", hours: "Mo–Sa, 8–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Textilien — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie, was gereinigt werden soll…",
        pdfCompany: { name: "FraîcheurTex Sàrl", address: "Rue de la Gare 22, 1260 Nyon", phone: "022 000 00 30", email: "hello@fraicheurtex.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Textilien und erstelle Ihnen direkt danach eine feste Offerte.",
        addressPlaceholder: "Einsatzadresse (Strasse, PLZ, Ort)",
        terms: "Feste Offerte, 30 Tage gültig. Ergebnis abhängig von der Art der Flecken und Fasern. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          scope: { text: "Was möchten Sie reinigen lassen?", short: "Textilien", none: "Ich weiss es noch nicht", opts: { sofa: "Sofa", rug: "Teppich", mattress: "Matratze" } },
          sofa: { text: "Welche Grösse hat das Sofa?", short: "Sofa", opts: { s2: "2-Sitzer", s3: "3-Sitzer", corner: "Eck-Sofa oder 5 Sitzplätze und mehr" } },
          rug: { text: "Welchen Teppich möchten Sie reinigen lassen?", short: "Teppich", opts: { small: "1 kleiner Teppich (unter 2 m²)", medium: "1 mittlerer Teppich (2 bis 6 m²)", large: "1 grosser Teppich (über 6 m²)", several: "Mehrere Teppiche" } },
          mattress: { text: "Wie viele Matratzen?", short: "Matratze", opts: { one: "1 Matratze (Einzel)", double: "1 Doppelmatratze", two: "2 Matratzen", many: "3 Matratzen oder mehr" } },
          stain: { text: "In welchem Zustand sind die Textilien?", short: "Zustand", opts: { normal: "Routinepflege", stains: "Hartnäckige Flecken", pets: "Gerüche oder Spuren von Haustieren" } },
          place: { text: "Wo soll die Reinigung stattfinden?", short: "Ort", opts: { home: "Bei Ihnen zu Hause (wir kommen zu Ihnen)", shop: "Abgabe in der Werkstatt" } },
          protect: { text: "Wünschen Sie Zusatzbehandlungen?", short: "Behandlungen", none: "Keine Behandlung", opts: { guard: "Fleckenschutz", mites: "Anti-Milben-Behandlung (Matratze)", deodor: "Geruchsneutralisierung" } },
          date: { text: "Für welches Datum wünschen Sie den Einsatz?", short: "Wunschtermin" },
        },
        items: {
          sofa_s2: "Reinigung Sofa 2-Sitzer",
          sofa_s3: "Reinigung Sofa 3-Sitzer",
          sofa_corner: "Reinigung Eck-Sofa / 5 Sitzplätze und mehr",
          rug_small: "Reinigung kleiner Teppich",
          rug_medium: "Reinigung mittlerer Teppich",
          rug_large: "Reinigung grosser Teppich",
          rug_several: "Reinigung mehrerer Teppiche",
          mattress_one: "Reinigung Matratze (Einzel)",
          mattress_double: "Reinigung Doppelmatratze",
          mattress_two: "Reinigung von 2 Matratzen",
          mattress_many: "Reinigung von 3 Matratzen oder mehr",
          diag: "Pauschale für Einschätzung vor Ort",
          guard: "Fleckenschutz",
          mites: "Anti-Milben-Behandlung",
          deodor: "Geruchsneutralisierung",
          travel: "Anfahrtspauschale",
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
