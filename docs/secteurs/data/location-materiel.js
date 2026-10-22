/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "location-materiel",
    icon: "🛠️",
    needsAddress: true,
    colors: { main: "#f59f00", dark: "#c77f00", light: "#fff3bf", accent: "#343a40", accentDark: "#212529", bg: "#fffdf6" },

    quote: {
      minimum: 60,
      questions: [
        { id: "category", type: "single", options: [{ id: "site", day: 95 }, { id: "clean", day: 70 }, { id: "garden", day: 85 }, { id: "lift", day: 240 }, { id: "energy", day: 110 }] },
        { id: "duration", type: "single", options: [{ id: "d1", days: 1, k: 1 }, { id: "d3", days: 3, k: 0.9 }, { id: "w1", days: 7, k: 0.75 }, { id: "m1", days: 30, k: 0.5 }] },
        { id: "delivery", type: "single", options: [{ id: "pickup", fee: 0 }, { id: "deliver", fee: 90 }] },
        {
          id: "operator", type: "single",
          when: function (a) { return a.category.id === "lift"; },
          options: [{ id: "none", perDay: 0 }, { id: "with", perDay: 380 }],
        },
        { id: "insurance", type: "single", options: [{ id: "basic", pct: 0 }, { id: "full", pct: 0.12 }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var d = a.duration.days;
        var rental = H.round5(a.category.day * d * a.duration.k);
        items.push({ label: L("rental_" + a.category.id, { days: d }), amount: rental });
        if (a.operator && a.operator.perDay) items.push({ label: L("operator", { days: d }), amount: a.operator.perDay * d });
        if (a.insurance.pct) items.push({ label: L("insurance"), amount: H.round5(rental * a.insurance.pct) });
        if (a.delivery.fee) items.push({ label: L("delivery"), amount: a.delivery.fee });
        return items;
      },
    },

    fr: {
      label: "Location de matériel professionnel",
      forWho: "entreprises de location de matériel professionnel",
      pitch: "Chiffrez machine, durée, livraison et assurance sans appeler le dépôt.",
      emailNoun: "votre location de matériel",
      landing: {
        h1: ["VOUS LOUEZ.", "DEALZ CHIFFRE."],
        question: "Combien de locations perdez-vous parce que le dépôt ne décroche pas à 7 h du matin ?",
        text: "Un artisan a besoin d'une machine pour demain matin et appelle trois loueurs. Dealz répond tout de suite, pose les bonnes questions (catégorie de matériel, durée, livraison, assurance), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour louer une machine de chantier pendant 3 jours, livrée ?",
        values: [
          { icon: "🧰", title: "Un prix par catégorie et par durée", text: "Chantier, nettoyage, jardin, levage, énergie : vos tarifs et vos remises de durée s'appliquent automatiquement." },
          { icon: "🛡️", title: "Assurance et rachat de franchise chiffrés", text: "L'option bris de machine est proposée dès le premier devis, selon votre pourcentage." },
          { icon: "🚚", title: "Retrait ou livraison avec reprise", text: "Votre forfait de livraison s'applique sans appel de coordination." },
          { icon: "👷", title: "Machine avec opérateur", text: "Pour le levage, l'option avec opérateur est facturée à la journée selon vos règles." },
        ],
        step1: "Importez vos tarifs : prix à la journée par catégorie, remises de durée, livraison, opérateur, rachat de franchise. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos catégories de matériel, vos durées de location, vos livraisons et vos assurances.",
        excel: { file: "tarifs-location-materiel.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Location matériel de chantier", "3 jours · remise 10 %", "CHF 255"], ["Rachat de franchise", "12 %", "CHF 30"], ["Livraison + reprise", "Forfait", "CHF 90"]] },
        chat: ["« J'ai besoin d'une machine de chantier pour trois jours. »", "« Quelle catégorie de matériel, et souhaitez-vous la livraison ? »", "« Voulez-vous le rachat de franchise en cas de bris de machine ? »"],
        offer: { company: "ProOutil Location SA", rows: [["Location matériel de chantier — 3 jours", 255], ["Rachat de franchise (bris de machine)", 30], ["Livraison et reprise", 90]] },
        roi: "Une seule location supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "ProOutil",
        eyebrow: "Yverdon & Nord vaudois · Exemple fictif",
        hero: { h1: "La bonne machine, au bon moment.", text: "Matériel de chantier, nettoyage, jardin, levage et énergie à la journée, à la semaine ou au mois — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "15 000+", lbl: "LOCATIONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous louons",
        servicesSub: "Choisissez une catégorie, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🏗️", title: "Chantier", text: "Perforateurs, bétonnières, échafaudages.", tag: "dès CHF 95/jour" },
          { icon: "🧽", title: "Nettoyage pro", text: "Autolaveuses, nettoyeurs haute pression.", tag: "dès CHF 70/jour" },
          { icon: "🌳", title: "Jardin et espaces verts", text: "Broyeurs, tronçonneuses, tondeuses pro.", tag: "dès CHF 85/jour" },
          { icon: "🏗️", title: "Levage et accès", text: "Nacelles et mini-grues, avec ou sans opérateur.", tag: "dès CHF 240/jour" },
          { icon: "⚡", title: "Énergie", text: "Groupes électrogènes et compresseurs.", tag: "dès CHF 110/jour" },
          { icon: "🚚", title: "Livraison et reprise", text: "Sur chantier, à l'heure convenue.", tag: "CHF 90" },
        ],
        about: {
          title: "Un dépôt bien équipé, des machines entretenues",
          text: "ProOutil Location équipe artisans, entreprises et collectivités du Nord vaudois depuis 1999. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Matériel contrôlé", "révision et nettoyage avant chaque sortie."], ["Conseil technique", "nous vous aidons à choisir la bonne machine."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "024 000 00 18", email: "hello@prooutil.demo", zone: "Nord vaudois, Broye, Jura", hours: "Lun–Ven, 7h–17h30" },
        devisNote: "Répondez à quelques questions sur votre besoin — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez le matériel dont vous avez besoin…",
        pdfCompany: { name: "ProOutil Location SA", address: "Rue des Moulins 9, 1400 Yverdon-les-Bains", phone: "024 000 00 18", email: "hello@prooutil.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre besoin, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du chantier ou de livraison (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité. Caution et pièce d'identité exigées au retrait. TVA suisse incluse le cas échéant.",
        q: {
          category: { text: "Quelle catégorie de matériel ?", short: "Catégorie", opts: { site: "Chantier (perforateur, bétonnière, échafaudage)", clean: "Nettoyage pro (autolaveuse, haute pression)", garden: "Jardin (broyeur, tronçonneuse, tondeuse pro)", lift: "Levage et accès (nacelle, mini-grue)", energy: "Énergie (groupe électrogène, compresseur)" } },
          duration: { text: "Pour quelle durée de location ?", short: "Durée", opts: { d1: "1 jour", d3: "3 jours", w1: "1 semaine", m1: "1 mois" } },
          delivery: { text: "Comment récupérer le matériel ?", short: "Remise", opts: { pickup: "Retrait au dépôt", deliver: "Livraison et reprise sur site" } },
          operator: { text: "Avez-vous besoin d'un opérateur ?", short: "Opérateur", opts: { none: "Sans opérateur", with: "Avec opérateur" } },
          insurance: { text: "Souhaitez-vous racheter la franchise en cas de bris de machine ?", short: "Assurance", opts: { basic: "Non, assurance de base", full: "Oui, rachat de franchise" } },
          date: { text: "Pour quelle date souhaitez-vous le matériel ?", short: "Date souhaitée" },
        },
        items: {
          rental_site: "Location matériel de chantier — {days} jour(s)",
          rental_clean: "Location matériel de nettoyage — {days} jour(s)",
          rental_garden: "Location matériel de jardin — {days} jour(s)",
          rental_lift: "Location matériel de levage — {days} jour(s)",
          rental_energy: "Location matériel d'énergie — {days} jour(s)",
          operator: "Opérateur ({days} jour(s))",
          insurance: "Rachat de franchise (bris de machine)",
          delivery: "Livraison et reprise sur site",
        },
      },
    },

    en: {
      label: "Professional Equipment Rental",
      forWho: "professional equipment rental companies",
      pitch: "Price machine, duration, delivery and insurance without calling the depot.",
      emailNoun: "your equipment rental",
      landing: {
        h1: ["YOU RENT.", "DEALZ PRICES IT."],
        question: "How many rentals are you losing because the depot doesn't pick up at 7am?",
        text: "A tradesperson needs a machine for tomorrow morning and calls three rental companies. Dealz replies right away, asks the right questions (equipment category, duration, delivery, insurance), calculates your price from your own rates and prepares the quote.",
        clientQ: "How much to rent a construction machine for 3 days, delivered?",
        values: [
          { icon: "🧰", title: "A price per category and duration", text: "Construction, cleaning, garden, lifting, energy: your rates and duration discounts apply automatically." },
          { icon: "🛡️", title: "Insurance and deductible buyback priced in", text: "The machine-breakage option is offered from the very first quote, based on your percentage." },
          { icon: "🚚", title: "Pickup or delivery with collection", text: "Your delivery package applies with no coordination call needed." },
          { icon: "👷", title: "Machine with operator", text: "For lifting equipment, the with-operator option is billed per day according to your rules." },
        ],
        step1: "Import your rates: daily price per category, duration discounts, delivery, operator, deductible buyback. Your Excel sheet stays your working tool.",
        step2: "The engine understands your equipment categories, rental durations, deliveries and insurance.",
        excel: { file: "equipment-rental-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Construction equipment rental", "3 days · 10% discount", "CHF 255"], ["Deductible buyback", "12%", "CHF 30"], ["Delivery + pickup", "Package", "CHF 90"]] },
        chat: ["\"I need a construction machine for three days.\"", "\"Which equipment category, and would you like delivery?\"", "\"Would you like deductible buyback in case of machine breakage?\""],
        offer: { company: "ProOutil Location SA", rows: [["Construction equipment rental — 3 days", 255], ["Deductible buyback (machine breakage)", 30], ["Delivery and pickup", 90]] },
        roi: "Just one extra rental per week can already cover your subscription.",
      },
      demo: {
        brand: "ProOutil",
        eyebrow: "Yverdon & Nord vaudois region · Fictional example",
        hero: { h1: "The right machine, at the right time.", text: "Construction, cleaning, garden, lifting and energy equipment by the day, week or month — get a firm price in seconds, right on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "15,000+", lbl: "RENTALS" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we rent",
        servicesSub: "Choose a category, or simply describe your need in the \"Get a quote\" tab.",
        services: [
          { icon: "🏗️", title: "Construction", text: "Rotary hammers, cement mixers, scaffolding.", tag: "from CHF 95/day" },
          { icon: "🧽", title: "Pro cleaning", text: "Scrubber dryers, high-pressure washers.", tag: "from CHF 70/day" },
          { icon: "🌳", title: "Garden and green spaces", text: "Chippers, chainsaws, pro mowers.", tag: "from CHF 85/day" },
          { icon: "🏗️", title: "Lifting and access", text: "Platforms and mini-cranes, with or without operator.", tag: "from CHF 240/day" },
          { icon: "⚡", title: "Energy", text: "Generators and compressors.", tag: "from CHF 110/day" },
          { icon: "🚚", title: "Delivery and pickup", text: "On site, at the agreed time.", tag: "CHF 90" },
        ],
        about: {
          title: "A well-equipped depot, well-maintained machines",
          text: "ProOutil Location has equipped tradespeople, businesses and local authorities in the Nord vaudois region since 1999. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Equipment checked", "serviced and cleaned before every rental."], ["Technical advice", "we help you choose the right machine."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "024 000 00 18", email: "hello@prooutil.demo", zone: "Nord vaudois, Broye, Jura", hours: "Mon–Fri, 7am–5:30pm" },
        devisNote: "Answer a few questions about your need — you'll receive a real quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe the equipment you need…",
        pdfCompany: { name: "ProOutil Location SA", address: "Rue des Moulins 9, 1400 Yverdon-les-Bains", phone: "024 000 00 18", email: "hello@prooutil.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your need, then give you a firm quote right after.",
        addressPlaceholder: "Site or delivery address (street, postcode, town)",
        terms: "Firm quote, valid 30 days, subject to availability. Deposit and ID required at pickup. Swiss VAT included where applicable.",
        q: {
          category: { text: "Which equipment category?", short: "Category", opts: { site: "Construction (hammer drill, mixer, scaffolding)", clean: "Pro cleaning (scrubber dryer, high-pressure)", garden: "Garden (chipper, chainsaw, pro mower)", lift: "Lifting and access (platform, mini-crane)", energy: "Energy (generator, compressor)" } },
          duration: { text: "For how long do you need the rental?", short: "Duration", opts: { d1: "1 day", d3: "3 days", w1: "1 week", m1: "1 month" } },
          delivery: { text: "How would you like to collect the equipment?", short: "Handover", opts: { pickup: "Pickup at the depot", deliver: "Delivery and collection on site" } },
          operator: { text: "Do you need an operator?", short: "Operator", opts: { none: "Without operator", with: "With operator" } },
          insurance: { text: "Would you like to buy back the deductible in case of machine breakage?", short: "Insurance", opts: { basic: "No, basic insurance", full: "Yes, deductible buyback" } },
          date: { text: "What date would you like the equipment?", short: "Preferred date" },
        },
        items: {
          rental_site: "Construction equipment rental — {days} day(s)",
          rental_clean: "Cleaning equipment rental — {days} day(s)",
          rental_garden: "Garden equipment rental — {days} day(s)",
          rental_lift: "Lifting equipment rental — {days} day(s)",
          rental_energy: "Energy equipment rental — {days} day(s)",
          operator: "Operator ({days} day(s))",
          insurance: "Deductible buyback (machine breakage)",
          delivery: "Delivery and collection on site",
        },
      },
    },

    de: {
      label: "Vermietung von Profi-Maschinen",
      forWho: "Unternehmen für die Vermietung von Profi-Maschinen",
      pitch: "Berechnen Sie Maschine, Dauer, Lieferung und Versicherung, ohne das Depot anzurufen.",
      emailNoun: "Ihre Maschinenmiete",
      landing: {
        h1: ["SIE MIETEN.", "DEALZ RECHNET."],
        question: "Wie viele Vermietungen verlieren Sie, weil das Depot um 7 Uhr morgens nicht abhebt?",
        text: "Ein Handwerker braucht morgen früh eine Maschine und ruft drei Vermieter an. Dealz antwortet sofort, stellt die richtigen Fragen (Materialkategorie, Dauer, Lieferung, Versicherung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Miete einer Baumaschine für 3 Tage, geliefert?",
        values: [
          { icon: "🧰", title: "Ein Preis pro Kategorie und Dauer", text: "Baustelle, Reinigung, Garten, Heben, Energie: Ihre Tarife und Dauerrabatte werden automatisch angewendet." },
          { icon: "🛡️", title: "Versicherung und Franchiserückkauf berechnet", text: "Die Option Maschinenbruch wird schon bei der ersten Offerte angeboten, gemäss Ihrem Prozentsatz." },
          { icon: "🚚", title: "Abholung oder Lieferung mit Rücknahme", text: "Ihre Lieferpauschale gilt ohne Koordinationsanruf." },
          { icon: "👷", title: "Maschine mit Bediener", text: "Für Hebegeräte wird die Option mit Bediener nach Ihren Regeln pro Tag verrechnet." },
        ],
        step1: "Importieren Sie Ihre Tarife: Tagespreis pro Kategorie, Dauerrabatte, Lieferung, Bediener, Franchiserückkauf. Ihr Excel bleibt Ihr Arbeitsinstrument.",
        step2: "Die Engine versteht Ihre Materialkategorien, Mietdauern, Lieferungen und Versicherungen.",
        excel: { file: "tarife-maschinenmiete.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Baumaschinenmiete", "3 Tage · 10% Rabatt", "CHF 255"], ["Franchiserückkauf", "12%", "CHF 30"], ["Lieferung + Abholung", "Pauschale", "CHF 90"]] },
        chat: ["«Ich brauche eine Baumaschine für drei Tage.»", "«Welche Materialkategorie, und wünschen Sie die Lieferung?»", "«Möchten Sie den Franchiserückkauf bei Maschinenbruch?»"],
        offer: { company: "ProOutil Location SA", rows: [["Baumaschinenmiete — 3 Tage", 255], ["Franchiserückkauf (Maschinenbruch)", 30], ["Lieferung und Abholung", 90]] },
        roi: "Schon eine einzige zusätzliche Vermietung pro Woche kann Ihr Abonnement decken.",
      },
      demo: {
        brand: "ProOutil",
        eyebrow: "Yverdon & Nordwaadt · Fiktives Beispiel",
        hero: { h1: "Die richtige Maschine, zum richtigen Zeitpunkt.", text: "Material für Baustelle, Reinigung, Garten, Heben und Energie pro Tag, Woche oder Monat — erhalten Sie in Sekunden einen festen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "15000+", lbl: "VERMIETUNGEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir vermieten",
        servicesSub: "Wählen Sie eine Kategorie oder beschreiben Sie Ihr Anliegen einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🏗️", title: "Baustelle", text: "Bohrhammer, Betonmischer, Gerüste.", tag: "ab CHF 95/Tag" },
          { icon: "🧽", title: "Profireinigung", text: "Scheuersaugmaschinen, Hochdruckreiniger.", tag: "ab CHF 70/Tag" },
          { icon: "🌳", title: "Garten und Grünflächen", text: "Zerkleinerer, Kettensägen, Profi-Rasenmäher.", tag: "ab CHF 85/Tag" },
          { icon: "🏗️", title: "Heben und Zugang", text: "Hubarbeitsbühnen und Minikrane, mit oder ohne Bediener.", tag: "ab CHF 240/Tag" },
          { icon: "⚡", title: "Energie", text: "Stromaggregate und Kompressoren.", tag: "ab CHF 110/Tag" },
          { icon: "🚚", title: "Lieferung und Abholung", text: "Direkt auf der Baustelle, zur vereinbarten Zeit.", tag: "CHF 90" },
        ],
        about: {
          title: "Ein gut ausgestattetes Depot, gewartete Maschinen",
          text: "ProOutil Location rüstet seit 1999 Handwerker, Unternehmen und Gemeinden der Nordwaadt aus. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Geprüftes Material", "gewartet und gereinigt vor jedem Einsatz."], ["Technische Beratung", "wir helfen Ihnen, die richtige Maschine zu wählen."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "024 000 00 18", email: "hello@prooutil.demo", zone: "Nordwaadt, Broye, Jura", hours: "Mo–Fr, 7–17.30 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Anliegen — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie das benötigte Material…",
        pdfCompany: { name: "ProOutil Location SA", address: "Rue des Moulins 9, 1400 Yverdon-les-Bains", phone: "024 000 00 18", email: "hello@prooutil.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Anliegen und erstelle Ihnen direkt danach eine feste Offerte.",
        addressPlaceholder: "Adresse der Baustelle oder Lieferadresse (Strasse, PLZ, Ort)",
        terms: "Feste Offerte, 30 Tage gültig, vorbehaltlich Verfügbarkeit. Kaution und Ausweis bei der Abholung erforderlich. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          category: { text: "Welche Materialkategorie?", short: "Kategorie", opts: { site: "Baustelle (Bohrhammer, Betonmischer, Gerüst)", clean: "Profireinigung (Scheuersaugmaschine, Hochdruck)", garden: "Garten (Zerkleinerer, Kettensäge, Profi-Rasenmäher)", lift: "Heben und Zugang (Hubarbeitsbühne, Minikran)", energy: "Energie (Stromaggregat, Kompressor)" } },
          duration: { text: "Für welche Mietdauer?", short: "Dauer", opts: { d1: "1 Tag", d3: "3 Tage", w1: "1 Woche", m1: "1 Monat" } },
          delivery: { text: "Wie möchten Sie das Material erhalten?", short: "Übergabe", opts: { pickup: "Abholung im Depot", deliver: "Lieferung und Abholung auf der Baustelle" } },
          operator: { text: "Benötigen Sie einen Bediener?", short: "Bediener", opts: { none: "Ohne Bediener", with: "Mit Bediener" } },
          insurance: { text: "Möchten Sie die Franchise bei Maschinenbruch rückkaufen?", short: "Versicherung", opts: { basic: "Nein, Basisversicherung", full: "Ja, Franchiserückkauf" } },
          date: { text: "Für welches Datum wünschen Sie das Material?", short: "Wunschtermin" },
        },
        items: {
          rental_site: "Baumaschinenmiete — {days} Tag(e)",
          rental_clean: "Reinigungsmaschinenmiete — {days} Tag(e)",
          rental_garden: "Gartenmaschinenmiete — {days} Tag(e)",
          rental_lift: "Hebemaschinenmiete — {days} Tag(e)",
          rental_energy: "Energiemaschinenmiete — {days} Tag(e)",
          operator: "Bediener ({days} Tag(e))",
          insurance: "Franchiserückkauf (Maschinenbruch)",
          delivery: "Lieferung und Abholung auf der Baustelle",
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
