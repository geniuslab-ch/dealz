/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "traiteur",
    icon: "🍽️",
    needsAddress: true,
    colors: { main: "#a61e4d", dark: "#861540", light: "#ffdeeb", accent: "#e67700", accentDark: "#b35c00", bg: "#fffafb" },

    quote: {
      minimum: 300,
      questions: [
        { id: "event", type: "single", options: [{ id: "aperitif", base: 38 }, { id: "seated", base: 92 }, { id: "buffet", base: 64 }, { id: "brunch", base: 48 }, { id: "cocktail", base: 32 }] },
        { id: "guests", type: "single", options: [{ id: "g1", n: 18, k: 1 }, { id: "g2", n: 38, k: 1 }, { id: "g3", n: 75, k: 0.97 }, { id: "g4", n: 150, k: 0.93 }, { id: "g5", n: 250, k: 0.9 }] },
        { id: "extras", type: "multi", options: [{ id: "drinks" }, { id: "staff" }, { id: "tableware" }, { id: "cake" }, { id: "chef" }] },
        { id: "diet", type: "single", options: [{ id: "none", k: 1 }, { id: "veg", k: 1.04 }, { id: "allergy", k: 1.1 }] },
        { id: "place", type: "single", options: [{ id: "client", fee: 150 }, { id: "venue", fee: 480 }] },
        { id: "date", type: "date", minDays: 10 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var n = a.guests.n;
        items.push({ label: L("event_" + a.event.id, { n: n }), amount: H.round5(a.event.base * a.guests.k * a.diet.k * n) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "drinks") items.push({ label: L("drinks", { n: n }), amount: H.round5(24 * n) });
          if (e.id === "staff") items.push({ label: L("staff", { n: n }), amount: H.round5(280 + n * 7) });
          if (e.id === "tableware") items.push({ label: L("tableware", { n: n }), amount: H.round5(8 * n) });
          if (e.id === "cake") items.push({ label: L("cake", { n: n }), amount: H.round5(6.5 * n) });
          if (e.id === "chef") items.push({ label: L("chef"), amount: 450 });
        });
        items.push({ label: L(a.place.id === "venue" ? "venue" : "delivery"), amount: a.place.fee });
        return items;
      },
    },

    fr: {
      label: "Traiteurs et services événementiels",
      forWho: "traiteurs et prestataires de services événementiels",
      pitch: "Chiffrez menu, invités, boissons et service sans aller-retour de mails.",
      emailNoun: "votre événement",
      landing: {
        h1: ["VOUS RÉGALEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de devis traiteur perdez-vous parce que vous étiez en cuisine ?",
        text: "Un mariage, un séminaire, un anniversaire : le client demande trois devis et signe avec le premier qui répond. Dealz répond tout de suite, pose les bonnes questions (type de repas, invités, boissons, service, régimes), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour un apéritif dînatoire de 75 personnes avec boissons et service ?",
        values: [
          { icon: "🥂", title: "Un prix par personne, qui s'ajuste seul", text: "Formule, nombre d'invités, régimes : vos tarifs et vos remises de volume s'appliquent automatiquement." },
          { icon: "👩‍🍳", title: "Service, boissons, vaisselle en options", text: "Chaque extra est une ligne de devis claire, ajoutée en un clic." },
          { icon: "🌱", title: "Régimes et allergies pris en compte", text: "Végétarien, sans gluten, allergies : la majoration est appliquée sans oubli." },
          { icon: "📅", title: "Dates qualifiées longtemps à l'avance", text: "Vous voyez les événements sérieux, avec date, ampleur et budget cohérents." },
        ],
        step1: "Importez vos tarifs : prix par personne et par formule, paliers d'invités, boissons, service, vaisselle, régimes spéciaux. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos formules, vos paliers de volume, vos options et vos lieux de prestation.",
        excel: { file: "tarifs-traiteur.xlsx", headers: ["Prestation", "Condition", "Prix"], rows: [["Apéritif dînatoire", "75 invités", "CHF 2 765"], ["Forfait boissons", "75 invités", "CHF 1 800"], ["Service et personnel", "75 invités", "CHF 805"]] },
        chat: ["« Nous organisons un apéritif dînatoire pour 75 personnes. »", "« Souhaitez-vous des boissons, du service et de la vaisselle ? »", "« Y a-t-il des régimes particuliers, et où se déroule l'événement ? »"],
        offer: { company: "Saveurs & Fêtes Traiteur", rows: [["Apéritif dînatoire (75 invités)", 2765], ["Forfait boissons (75 invités)", 1800], ["Service et personnel", 805]] },
        roi: "Un seul événement supplémentaire par mois peut déjà payer votre abonnement pendant des mois.",
      },
      demo: {
        brand: "Saveurs & Fêtes",
        eyebrow: "Fribourg & Gruyère · Exemple fictif",
        hero: { h1: "Votre événement, votre table, sans stress.", text: "Apéritifs dînatoires, repas assis, buffets, brunchs et cocktails avec service — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "640+", lbl: "ÉVÉNEMENTS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous préparons",
        servicesSub: "Choisissez une formule, ou décrivez simplement votre événement dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🥂", title: "Apéritif dînatoire", text: "Pièces salées et sucrées, présentées avec soin.", tag: "dès CHF 38/pers." },
          { icon: "🍽️", title: "Repas assis", text: "Menu en trois services, produits de saison.", tag: "dès CHF 92/pers." },
          { icon: "🍲", title: "Buffet chaud et froid", text: "Spécialités régionales et cuisine du monde.", tag: "dès CHF 64/pers." },
          { icon: "🥐", title: "Brunch", text: "Buffet de brunch pour fêtes et séminaires.", tag: "dès CHF 48/pers." },
          { icon: "🍷", title: "Boissons", text: "Forfaits vins, bières et softs.", tag: "CHF 24/pers." },
          { icon: "🤵", title: "Service", text: "Personnel de salle, bar et cuisine.", tag: "dès CHF 280" },
        ],
        about: {
          title: "Une cuisine régionale, une équipe soudée",
          text: "Saveurs & Fêtes Traiteur régale mariages, séminaires et associations de Fribourg et de la Gruyère depuis 2009. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Produits locaux", "viandes, fromages et légumes de producteurs de la région."], ["Régimes respectés", "végétarien, sans gluten, allergies : toujours anticipés."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "026 000 00 17", email: "hello@saveurs-fetes.demo", zone: "Fribourg, Gruyère, Broye", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur votre événement — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre événement…",
        pdfCompany: { name: "Saveurs & Fêtes Traiteur", address: "Route de la Glâne 14, 1700 Fribourg", phone: "026 000 00 17", email: "hello@saveurs-fetes.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre événement, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Lieu de l'événement (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité à la date indiquée. Nombre d'invités confirmé 7 jours avant l'événement. TVA suisse incluse le cas échéant.",
        q: {
          event: { text: "Quelle formule souhaitez-vous ?", short: "Formule", opts: { aperitif: "Apéritif dînatoire", seated: "Repas assis (3 services)", buffet: "Buffet chaud et froid", brunch: "Brunch", cocktail: "Cocktail de réception" } },
          guests: { text: "Combien d'invités ?", short: "Invités", opts: { g1: "10 à 25", g2: "25 à 50", g3: "50 à 100", g4: "100 à 200", g5: "Plus de 200" } },
          extras: { text: "Souhaitez-vous des prestations en plus ?", short: "Options", none: "Aucune option", opts: { drinks: "Forfait boissons", staff: "Service et personnel", tableware: "Location de vaisselle et mobilier", cake: "Gâteau / dessert signature", chef: "Chef sur place (cuisson devant les invités)" } },
          diet: { text: "Y a-t-il des régimes particuliers ?", short: "Régimes", opts: { none: "Aucun régime particulier", veg: "Végétarien / vegan pour une partie des invités", allergy: "Sans gluten / allergies à gérer" } },
          place: { text: "Où se déroule l'événement ?", short: "Lieu", opts: { client: "Chez vous ou dans le lieu de votre choix", venue: "Dans notre espace de réception" } },
          date: { text: "Quelle est la date de l'événement ?", short: "Date de l'événement" },
        },
        items: {
          event_aperitif: "Apéritif dînatoire ({n} invités)",
          event_seated: "Repas assis, 3 services ({n} invités)",
          event_buffet: "Buffet chaud et froid ({n} invités)",
          event_brunch: "Brunch ({n} invités)",
          event_cocktail: "Cocktail de réception ({n} invités)",
          drinks: "Forfait boissons ({n} invités)",
          staff: "Service et personnel ({n} invités)",
          tableware: "Location de vaisselle et mobilier ({n} invités)",
          cake: "Gâteau / dessert signature ({n} invités)",
          chef: "Chef sur place (cuisson devant les invités)",
          delivery: "Livraison et mise en place",
          venue: "Mise à disposition de notre espace de réception",
        },
      },
    },
    en: {
      label: "Caterers and event services",
      forWho: "caterers and event service providers",
      pitch: "Price menu, guests, drinks and service without back-and-forth emails.",
      emailNoun: "your event",
      landing: {
        h1: ["YOU DELIGHT.", "DEALZ PRICES."],
        question: "How many catering quote requests do you lose because you were in the kitchen?",
        text: "A wedding, a seminar, a birthday: the customer asks for three quotes and signs with the first to answer. Dealz answers right away, asks the right questions (type of meal, guests, drinks, service, dietary needs), calculates your price from your rates and prepares the quote.",
        clientQ: "How much for a standing dinner for 75 people with drinks and service?",
        values: [
          { icon: "🥂", title: "A per-person price that adjusts itself", text: "Package, number of guests, dietary needs: your rates and volume discounts apply automatically." },
          { icon: "👩‍🍳", title: "Service, drinks, tableware as options", text: "Each extra is a clear quote line, added in one click." },
          { icon: "🌱", title: "Diets and allergies taken into account", text: "Vegetarian, gluten-free, allergies: the surcharge is never forgotten." },
          { icon: "📅", title: "Dates qualified well in advance", text: "You see the serious events, with consistent date, size and budget." },
        ],
        step1: "Import your rates: price per person and per package, guest tiers, drinks, service, tableware, special diets. Your Excel stays your working tool.",
        step2: "The engine understands your packages, volume tiers, options and service locations.",
        excel: { file: "catering-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Standing dinner", "75 guests", "CHF 2,765"], ["Drinks package", "75 guests", "CHF 1,800"], ["Service and staff", "75 guests", "CHF 805"]] },
        chat: ["“We're organising a standing dinner for 75 people.”", "“Would you like drinks, service and tableware?”", "“Are there any special diets, and where is the event taking place?”"],
        offer: { company: "Saveurs & Fêtes Traiteur", rows: [["Standing dinner (75 guests)", 2765], ["Drinks package (75 guests)", 1800], ["Service and staff", 805]] },
        roi: "A single extra event a month can already pay for your subscription for months.",
      },
      demo: {
        brand: "Saveurs & Fêtes",
        eyebrow: "Fribourg & Gruyère · Fictional example",
        hero: { h1: "Your event, your table, stress-free.", text: "Standing dinners, seated meals, buffets, brunches and cocktails with service — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "640+", lbl: "EVENTS" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we prepare",
        servicesSub: "Pick a package, or simply describe your event in the “Get a quote” tab.",
        services: [
          { icon: "🥂", title: "Standing dinner", text: "Savoury and sweet bites, carefully presented.", tag: "from CHF 38/pers." },
          { icon: "🍽️", title: "Seated meal", text: "Three-course menu, seasonal produce.", tag: "from CHF 92/pers." },
          { icon: "🍲", title: "Hot and cold buffet", text: "Regional specialities and world cuisine.", tag: "from CHF 64/pers." },
          { icon: "🥐", title: "Brunch", text: "Brunch buffet for parties and seminars.", tag: "from CHF 48/pers." },
          { icon: "🍷", title: "Drinks", text: "Wine, beer and soft drink packages.", tag: "CHF 24/pers." },
          { icon: "🤵", title: "Service", text: "Floor, bar and kitchen staff.", tag: "from CHF 280" },
        ],
        about: {
          title: "Regional cooking, a close-knit team",
          text: "Saveurs & Fêtes Traiteur has been feeding weddings, seminars and associations in Fribourg and the Gruyère since 2009. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Local produce", "meat, cheese and vegetables from producers in the region."], ["Diets respected", "vegetarian, gluten-free, allergies: always planned for."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "026 000 00 17", email: "hello@saveurs-fetes.demo", zone: "Fribourg, Gruyère, Broye", hours: "Mon–Sat, 8am–6pm" },
        devisNote: "Answer a few questions about your event — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your event…",
        pdfCompany: { name: "Saveurs & Fêtes Traiteur", address: "Route de la Glâne 14, 1700 Fribourg", phone: "026 000 00 17", email: "hello@saveurs-fetes.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your event, then put together a firm quote right away.",
        addressPlaceholder: "Event venue (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, subject to availability on the stated date. Guest numbers to be confirmed 7 days before the event. Swiss VAT included where applicable.",
        q: {
          event: { text: "Which package would you like?", short: "Package", opts: { aperitif: "Standing dinner", seated: "Seated meal (3 courses)", buffet: "Hot and cold buffet", brunch: "Brunch", cocktail: "Reception cocktail" } },
          guests: { text: "How many guests?", short: "Guests", opts: { g1: "10 to 25", g2: "25 to 50", g3: "50 to 100", g4: "100 to 200", g5: "More than 200" } },
          extras: { text: "Would you like any extra services?", short: "Options", none: "No options", opts: { drinks: "Drinks package", staff: "Service and staff", tableware: "Tableware and furniture hire", cake: "Signature cake / dessert", chef: "Chef on site (live cooking)" } },
          diet: { text: "Are there any special diets?", short: "Diets", opts: { none: "No special diets", veg: "Vegetarian / vegan for some guests", allergy: "Gluten-free / allergies to manage" } },
          place: { text: "Where is the event taking place?", short: "Venue", opts: { client: "At your home or a venue of your choice", venue: "In our reception space" } },
          date: { text: "What is the date of the event?", short: "Event date" },
        },
        items: {
          event_aperitif: "Standing dinner ({n} guests)",
          event_seated: "Seated meal, 3 courses ({n} guests)",
          event_buffet: "Hot and cold buffet ({n} guests)",
          event_brunch: "Brunch ({n} guests)",
          event_cocktail: "Reception cocktail ({n} guests)",
          drinks: "Drinks package ({n} guests)",
          staff: "Service and staff ({n} guests)",
          tableware: "Tableware and furniture hire ({n} guests)",
          cake: "Signature cake / dessert ({n} guests)",
          chef: "Chef on site (live cooking)",
          delivery: "Delivery and set-up",
          venue: "Use of our reception space",
        },
      },
    },
    de: {
      label: "Caterer und Eventservices",
      forWho: "Caterer und Eventdienstleister",
      pitch: "Menü, Gäste, Getränke und Service ohne Mail-Pingpong berechnen.",
      emailNoun: "Ihren Anlass",
      landing: {
        h1: ["SIE VERWÖHNEN.", "DEALZ RECHNET."],
        question: "Wie viele Catering-Anfragen verlieren Sie, weil Sie gerade in der Küche standen?",
        text: "Eine Hochzeit, ein Seminar, ein Geburtstag: Der Kunde verlangt drei Offerten und unterschreibt beim Ersten, der antwortet. Dealz antwortet sofort, stellt die richtigen Fragen (Art der Verpflegung, Gäste, Getränke, Service, Ernährungswünsche), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet ein Apéro riche für 75 Personen mit Getränken und Service?",
        values: [
          { icon: "🥂", title: "Ein Preis pro Person, der sich selbst anpasst", text: "Formel, Anzahl Gäste, Ernährungswünsche: Ihre Tarife und Mengenrabatte werden automatisch angewendet." },
          { icon: "👩‍🍳", title: "Service, Getränke, Geschirr als Optionen", text: "Jedes Extra ist eine klare Offertposition, mit einem Klick hinzugefügt." },
          { icon: "🌱", title: "Diäten und Allergien berücksichtigt", text: "Vegetarisch, glutenfrei, Allergien: Der Zuschlag wird nie vergessen." },
          { icon: "📅", title: "Daten lange im Voraus qualifiziert", text: "Sie sehen die seriösen Anlässe, mit stimmigem Datum, Umfang und Budget." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Person und Formel, Gästestaffeln, Getränke, Service, Geschirr, Spezialdiäten. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Formeln, Mengenstaffeln, Optionen und Durchführungsorte.",
        excel: { file: "tarife-catering.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Apéro riche", "75 Gäste", "CHF 2'765"], ["Getränkepauschale", "75 Gäste", "CHF 1'800"], ["Service und Personal", "75 Gäste", "CHF 805"]] },
        chat: ["«Wir organisieren einen Apéro riche für 75 Personen.»", "«Wünschen Sie Getränke, Service und Geschirr?»", "«Gibt es besondere Ernährungswünsche, und wo findet der Anlass statt?»"],
        offer: { company: "Saveurs & Fêtes Traiteur", rows: [["Apéro riche (75 Gäste)", 2765], ["Getränkepauschale (75 Gäste)", 1800], ["Service und Personal", 805]] },
        roi: "Ein einziger zusätzlicher Anlass pro Monat kann Ihr Abo bereits für Monate bezahlen.",
      },
      demo: {
        brand: "Saveurs & Fêtes",
        eyebrow: "Freiburg & Greyerzerland · Fiktives Beispiel",
        hero: { h1: "Ihr Anlass, Ihre Tafel, ohne Stress.", text: "Apéros riches, gesetzte Essen, Buffets, Brunchs und Cocktails mit Service — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "640+", lbl: "ANLÄSSE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir zubereiten",
        servicesSub: "Wählen Sie eine Formel, oder beschreiben Sie Ihren Anlass einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🥂", title: "Apéro riche", text: "Salzige und süsse Häppchen, sorgfältig präsentiert.", tag: "ab CHF 38/Pers." },
          { icon: "🍽️", title: "Gesetztes Essen", text: "Dreigangmenü, saisonale Produkte.", tag: "ab CHF 92/Pers." },
          { icon: "🍲", title: "Warmes und kaltes Buffet", text: "Regionale Spezialitäten und Weltküche.", tag: "ab CHF 64/Pers." },
          { icon: "🥐", title: "Brunch", text: "Brunchbuffet für Feste und Seminare.", tag: "ab CHF 48/Pers." },
          { icon: "🍷", title: "Getränke", text: "Pauschalen für Wein, Bier und Softdrinks.", tag: "CHF 24/Pers." },
          { icon: "🤵", title: "Service", text: "Service-, Bar- und Küchenpersonal.", tag: "ab CHF 280" },
        ],
        about: {
          title: "Regionale Küche, ein eingespieltes Team",
          text: "Saveurs & Fêtes Traiteur verwöhnt seit 2009 Hochzeiten, Seminare und Vereine in Freiburg und im Greyerzerland. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Lokale Produkte", "Fleisch, Käse und Gemüse von Produzenten aus der Region."], ["Diäten respektiert", "vegetarisch, glutenfrei, Allergien: immer eingeplant."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "026 000 00 17", email: "hello@saveurs-fetes.demo", zone: "Freiburg, Greyerzerland, Broye", hours: "Mo–Sa, 8–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Anlass — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihren Anlass…",
        pdfCompany: { name: "Saveurs & Fêtes Traiteur", address: "Route de la Glâne 14, 1700 Fribourg", phone: "026 000 00 17", email: "hello@saveurs-fetes.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Anlass und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Ort des Anlasses (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, vorbehaltlich Verfügbarkeit am angegebenen Datum. Gästezahl 7 Tage vor dem Anlass zu bestätigen. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          event: { text: "Welche Formel wünschen Sie?", short: "Formel", opts: { aperitif: "Apéro riche", seated: "Gesetztes Essen (3 Gänge)", buffet: "Warmes und kaltes Buffet", brunch: "Brunch", cocktail: "Empfangscocktail" } },
          guests: { text: "Wie viele Gäste?", short: "Gäste", opts: { g1: "10 bis 25", g2: "25 bis 50", g3: "50 bis 100", g4: "100 bis 200", g5: "Mehr als 200" } },
          extras: { text: "Wünschen Sie zusätzliche Leistungen?", short: "Optionen", none: "Keine Option", opts: { drinks: "Getränkepauschale", staff: "Service und Personal", tableware: "Miete von Geschirr und Mobiliar", cake: "Torte / Signature-Dessert", chef: "Koch vor Ort (Live-Cooking)" } },
          diet: { text: "Gibt es besondere Ernährungswünsche?", short: "Ernährung", opts: { none: "Keine besonderen Wünsche", veg: "Vegetarisch / vegan für einen Teil der Gäste", allergy: "Glutenfrei / Allergien zu berücksichtigen" } },
          place: { text: "Wo findet der Anlass statt?", short: "Ort", opts: { client: "Bei Ihnen oder an einem Ort Ihrer Wahl", venue: "In unseren Empfangsräumen" } },
          date: { text: "An welchem Datum findet der Anlass statt?", short: "Datum des Anlasses" },
        },
        items: {
          event_aperitif: "Apéro riche ({n} Gäste)",
          event_seated: "Gesetztes Essen, 3 Gänge ({n} Gäste)",
          event_buffet: "Warmes und kaltes Buffet ({n} Gäste)",
          event_brunch: "Brunch ({n} Gäste)",
          event_cocktail: "Empfangscocktail ({n} Gäste)",
          drinks: "Getränkepauschale ({n} Gäste)",
          staff: "Service und Personal ({n} Gäste)",
          tableware: "Miete von Geschirr und Mobiliar ({n} Gäste)",
          cake: "Torte / Signature-Dessert ({n} Gäste)",
          chef: "Koch vor Ort (Live-Cooking)",
          delivery: "Lieferung und Aufbau",
          venue: "Nutzung unserer Empfangsräume",
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
