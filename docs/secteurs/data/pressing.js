/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "pressing",
    icon: "👔",
    needsAddress: true,
    colors: { main: "#0ca678", dark: "#087f5b", light: "#c3fae8", accent: "#fa5252", accentDark: "#e03131", bg: "#f9fffd" },

    quote: {
      minimum: 25,
      questions: [
        { id: "shirts", type: "single", options: [{ id: "none", n: 0 }, { id: "few", n: 3 }, { id: "mid", n: 8 }, { id: "many", n: 15 }, { id: "lots", n: 25 }] },
        { id: "suits", type: "single", options: [{ id: "none", n: 0 }, { id: "one", n: 1 }, { id: "two", n: 2 }, { id: "four", n: 4 }] },
        { id: "linen", type: "single", options: [{ id: "none", kg: 0 }, { id: "small", kg: 3 }, { id: "mid", kg: 6 }, { id: "large", kg: 12 }] },
        { id: "delicate", type: "single", options: [{ id: "none", n: 0 }, { id: "few", n: 2 }, { id: "more", n: 4 }, { id: "lots", n: 7 }] },
        { id: "service", type: "single", options: [{ id: "clean", k: 1 }, { id: "iron", k: 0.55 }] },
        { id: "pickup", type: "single", options: [{ id: "shop", fee: 0 }, { id: "collect", fee: 12 }] },
        { id: "speed", type: "single", options: [{ id: "std", k: 0 }, { id: "express", k: 0.3 }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var k = a.service.k;
        var r = function (x) { return Math.round(x * 2) / 2; };
        if (a.shirts.n) items.push({ label: L("shirts", { n: a.shirts.n }), amount: r(a.shirts.n * 4.5 * k) });
        if (a.suits.n) items.push({ label: L("suits", { n: a.suits.n }), amount: r(a.suits.n * 26 * k) });
        if (a.linen.kg) items.push({ label: L("linen", { kg: a.linen.kg }), amount: r(a.linen.kg * 6.5 * k) });
        if (a.delicate.n) items.push({ label: L("delicate", { n: a.delicate.n }), amount: r(a.delicate.n * 19 * Math.max(k, 0.8)) });
        if (!items.length) items.push({ label: L("file"), amount: 10 });
        var sub = items.reduce(function (s, i) { return s + i.amount; }, 0);
        if (a.speed.k) items.push({ label: L("express"), amount: r(sub * a.speed.k) });
        if (a.pickup.fee) items.push({ label: L("collect"), amount: a.pickup.fee });
        return items;
      },
    },

    fr: {
      label: "Blanchisserie et pressing",
      forWho: "blanchisseries et pressings",
      pitch: "Chiffrez chemises, costumes et linge de maison avant même la dépose.",
      emailNoun: "le nettoyage de votre linge",
      landing: {
        h1: ["VOUS REPASSEZ.", "DEALZ CHIFFRE."],
        question: "Combien de clients repartent sans avoir osé demander un prix à votre comptoir ?",
        text: "Un client veut savoir combien coûtent dix chemises et un costume avant de traverser la ville. Dealz lui répond à toute heure, pose les bonnes questions (pièces, quantité, express, collecte), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour 8 chemises, 2 costumes et 6 kg de linge de maison ?",
        values: [
          { icon: "👕", title: "Un prix pièce par pièce", text: "Chemises, costumes, linge, vêtements délicats : chaque catégorie a son tarif, sans calcul à la main." },
          { icon: "🚲", title: "Collecte et livraison vendues", text: "Le service à domicile devient une option claire, facturée selon vos règles." },
          { icon: "⏱️", title: "L'express devient une option", text: "Retour sous 24 h : votre majoration s'applique automatiquement." },
          { icon: "📲", title: "Des demandes qui arrivent déjà préparées", text: "Vous savez ce qui va arriver au comptoir ou dans la tournée avant même la collecte." },
        ],
        step1: "Importez vos tarifs : prix par pièce, au kilo, majoration express, collecte et livraison. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos catégories de vêtements, vos prestations, vos délais et vos modes de collecte.",
        excel: { file: "tarifs-pressing.xlsx", headers: ["Pièce", "Condition", "Prix"], rows: [["Chemises", "8 pièces", "CHF 36"], ["Costumes / tailleurs", "2 pièces", "CHF 52"], ["Linge de maison", "6 kg", "CHF 39"]] },
        chat: ["« Je voudrais faire nettoyer 8 chemises, 2 costumes et du linge de maison. »", "« Combien de kilos de linge, et le repassage est-il compris ? »", "« Souhaitez-vous une collecte à domicile ou un dépôt en magasin ? »"],
        offer: { company: "Pressing Express du Lac", rows: [["Chemises (8)", 36], ["Costumes / tailleurs (2)", 52], ["Linge de maison (6 kg)", 39]] },
        roi: "Dix clients de plus par semaine peuvent déjà payer votre abonnement.",
      },
      demo: {
        brand: "Pressing Express du Lac",
        eyebrow: "Lausanne & Lavaux · Exemple fictif",
        hero: { h1: "Vos habits comme neufs, sans y penser.", text: "Nettoyage, repassage, linge de maison et collecte à domicile à Lausanne — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "52 000+", lbl: "PIÈCES TRAITÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous traitons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre linge dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "👔", title: "Chemises", text: "Nettoyage et repassage sur cintre.", tag: "CHF 4.50" },
          { icon: "🕴️", title: "Costumes et tailleurs", text: "Nettoyage à sec soigné.", tag: "CHF 26" },
          { icon: "🛏️", title: "Linge de maison", text: "Draps, nappes, housses, au kilo.", tag: "CHF 6.50/kg" },
          { icon: "👗", title: "Vêtements délicats", text: "Robes, manteaux, soie, laine.", tag: "dès CHF 19" },
          { icon: "🚲", title: "Collecte à domicile", text: "Nous passons chez vous, livraison incluse.", tag: "CHF 12" },
          { icon: "⏱️", title: "Express 24 h", text: "Votre linge de retour le lendemain.", tag: "+30 %" },
        ],
        about: {
          title: "Un pressing de quartier, un service moderne",
          text: "Pressing Express du Lac prend soin des vêtements de particuliers, hôtels et restaurants de la région lausannoise depuis 1998. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Nettoyage soigné", "produits adaptés à chaque fibre."], ["Collecte ponctuelle", "créneaux de collecte et de livraison annoncés."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 90", email: "hello@pressing-du-lac.demo", zone: "Lausanne, Lavaux, Morges", hours: "Lun–Sam, 7h30–18h30" },
        devisNote: "Répondez à quelques questions sur votre linge — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre linge…",
        pdfCompany: { name: "Pressing Express du Lac", address: "Avenue de Rumine 4, 1005 Lausanne", phone: "021 000 00 90", email: "hello@pressing-du-lac.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre linge, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de collecte et de livraison (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, selon les quantités indiquées. Ajustement possible si les pièces déposées diffèrent. TVA suisse incluse le cas échéant.",
        q: {
          shirts: { text: "Combien de chemises ?", short: "Chemises", opts: { none: "Aucune", few: "1 à 5 chemises", mid: "6 à 10 chemises", many: "11 à 20 chemises", lots: "Plus de 20 chemises" } },
          suits: { text: "Combien de costumes ou tailleurs ?", short: "Costumes", opts: { none: "Aucun", one: "1 costume ou tailleur", two: "2 à 3 pièces", four: "4 pièces ou plus" } },
          linen: { text: "Quelle quantité de linge de maison (draps, nappes, housses) ?", short: "Linge de maison", opts: { none: "Aucun", small: "Jusqu'à 3 kg", mid: "3 à 8 kg", large: "8 à 15 kg" } },
          delicate: { text: "Avez-vous des vêtements délicats (robes, manteaux, soie, laine) ?", short: "Délicats", opts: { none: "Aucun", few: "1 à 2 pièces", more: "3 à 5 pièces", lots: "6 pièces ou plus" } },
          service: { text: "Quelle prestation souhaitez-vous ?", short: "Prestation", opts: { clean: "Nettoyage + repassage", iron: "Repassage seul" } },
          pickup: { text: "Comment remettre et récupérer le linge ?", short: "Remise", opts: { shop: "Dépôt et retrait en magasin", collect: "Collecte et livraison à domicile" } },
          speed: { text: "Quel délai souhaitez-vous ?", short: "Délai", opts: { std: "Standard (3 à 4 jours)", express: "Express 24 h" } },
          date: { text: "Pour quelle date souhaitez-vous la collecte ou le dépôt ?", short: "Date souhaitée" },
        },
        items: {
          shirts: "Chemises ({n})",
          suits: "Costumes / tailleurs ({n})",
          linen: "Linge de maison ({kg} kg)",
          delicate: "Vêtements délicats ({n})",
          file: "Frais de dossier",
          express: "Supplément express 24 h",
          collect: "Collecte et livraison à domicile",
        },
      },
    },
    en: {
      label: "Laundry and dry cleaning",
      forWho: "laundries and dry cleaners",
      pitch: "Price shirts, suits and household linen before they're even dropped off.",
      emailNoun: "cleaning your laundry",
      landing: {
        h1: ["YOU PRESS.", "DEALZ PRICES."],
        question: "How many customers leave without daring to ask for a price at your counter?",
        text: "A customer wants to know what ten shirts and a suit cost before crossing town. Dealz answers at any hour, asks the right questions (items, quantity, express, collection), calculates your price from your rates and prepares the quote.",
        clientQ: "How much for 8 shirts, 2 suits and 6 kg of household linen?",
        values: [
          { icon: "👕", title: "A price item by item", text: "Shirts, suits, linen, delicates: each category has its rate, with no manual calculation." },
          { icon: "🚲", title: "Collection and delivery sold", text: "At-home service becomes a clear option, charged by your rules." },
          { icon: "⏱️", title: "Express becomes an option", text: "Back within 24 hours: your surcharge applies automatically." },
          { icon: "📲", title: "Requests that arrive ready", text: "You know what's coming to the counter or the round before collection even starts." },
        ],
        step1: "Import your rates: price per item, per kilo, express surcharge, collection and delivery. Your Excel stays your working tool.",
        step2: "The engine understands your garment categories, services, turnaround times and collection modes.",
        excel: { file: "dry-cleaning-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["Shirts", "8 items", "CHF 36"], ["Suits / two-pieces", "2 items", "CHF 52"], ["Household linen", "6 kg", "CHF 39"]] },
        chat: ["“I'd like 8 shirts, 2 suits and some household linen cleaned.”", "“How many kilos of linen, and is ironing included?”", "“Would you like collection at home or drop-off in store?”"],
        offer: { company: "Pressing Express du Lac", rows: [["Shirts (8)", 36], ["Suits / two-pieces (2)", 52], ["Household linen (6 kg)", 39]] },
        roi: "Ten more customers a week can already pay for your subscription.",
      },
      demo: {
        brand: "Pressing Express du Lac",
        eyebrow: "Lausanne & Lavaux · Fictional example",
        hero: { h1: "Your clothes like new, without a second thought.", text: "Cleaning, ironing, household linen and home collection in Lausanne — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "52,000+", lbl: "ITEMS CLEANED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we clean",
        servicesSub: "Pick a service, or simply describe your laundry in the “Get a quote” tab.",
        services: [
          { icon: "👔", title: "Shirts", text: "Cleaned and pressed on a hanger.", tag: "CHF 4.50" },
          { icon: "🕴️", title: "Suits and two-pieces", text: "Careful dry cleaning.", tag: "CHF 26" },
          { icon: "🛏️", title: "Household linen", text: "Sheets, tablecloths, covers, by the kilo.", tag: "CHF 6.50/kg" },
          { icon: "👗", title: "Delicates", text: "Dresses, coats, silk, wool.", tag: "from CHF 19" },
          { icon: "🚲", title: "Home collection", text: "We come to you, delivery included.", tag: "CHF 12" },
          { icon: "⏱️", title: "24h express", text: "Your laundry back the next day.", tag: "+30%" },
        ],
        about: {
          title: "A neighbourhood dry cleaner, a modern service",
          text: "Pressing Express du Lac has been caring for the clothes of households, hotels and restaurants around Lausanne since 1998. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Careful cleaning", "products suited to every fibre."], ["Punctual collection", "collection and delivery slots announced in advance."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 90", email: "hello@pressing-du-lac.demo", zone: "Lausanne, Lavaux, Morges", hours: "Mon–Sat, 7:30am–6:30pm" },
        devisNote: "Answer a few questions about your laundry — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your laundry…",
        pdfCompany: { name: "Pressing Express du Lac", address: "Avenue de Rumine 4, 1005 Lausanne", phone: "021 000 00 90", email: "hello@pressing-du-lac.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your laundry, then put together a firm quote right away.",
        addressPlaceholder: "Collection and delivery address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, based on the quantities given. May be adjusted if the items dropped off differ. Swiss VAT included where applicable.",
        q: {
          shirts: { text: "How many shirts?", short: "Shirts", opts: { none: "None", few: "1 to 5 shirts", mid: "6 to 10 shirts", many: "11 to 20 shirts", lots: "Over 20 shirts" } },
          suits: { text: "How many suits or two-pieces?", short: "Suits", opts: { none: "None", one: "1 suit or two-piece", two: "2 to 3 items", four: "4 items or more" } },
          linen: { text: "How much household linen (sheets, tablecloths, covers)?", short: "Household linen", opts: { none: "None", small: "Up to 3 kg", mid: "3 to 8 kg", large: "8 to 15 kg" } },
          delicate: { text: "Any delicate garments (dresses, coats, silk, wool)?", short: "Delicates", opts: { none: "None", few: "1 to 2 items", more: "3 to 5 items", lots: "6 items or more" } },
          service: { text: "Which service would you like?", short: "Service", opts: { clean: "Cleaning + ironing", iron: "Ironing only" } },
          pickup: { text: "How will you drop off and collect your laundry?", short: "Hand-over", opts: { shop: "Drop-off and pick-up in store", collect: "Collection and delivery at home" } },
          speed: { text: "How quickly do you need it?", short: "Turnaround", opts: { std: "Standard (3 to 4 days)", express: "24h express" } },
          date: { text: "On which date would you like the collection or drop-off?", short: "Preferred date" },
        },
        items: {
          shirts: "Shirts ({n})",
          suits: "Suits / two-pieces ({n})",
          linen: "Household linen ({kg} kg)",
          delicate: "Delicate garments ({n})",
          file: "Handling fee",
          express: "24h express surcharge",
          collect: "Collection and delivery at home",
        },
      },
    },
    de: {
      label: "Wäscherei und chemische Reinigung",
      forWho: "Wäschereien und chemische Reinigungen",
      pitch: "Hemden, Anzüge und Haushaltswäsche berechnen, noch bevor sie abgegeben werden.",
      emailNoun: "die Reinigung Ihrer Wäsche",
      landing: {
        h1: ["SIE BÜGELN.", "DEALZ RECHNET."],
        question: "Wie viele Kunden gehen wieder, ohne an Ihrer Theke nach dem Preis zu fragen?",
        text: "Ein Kunde will wissen, was zehn Hemden und ein Anzug kosten, bevor er durch die Stadt fährt. Dealz antwortet rund um die Uhr, stellt die richtigen Fragen (Stücke, Menge, Express, Abholung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kosten 8 Hemden, 2 Anzüge und 6 kg Haushaltswäsche?",
        values: [
          { icon: "👕", title: "Ein Preis pro Stück", text: "Hemden, Anzüge, Wäsche, Delikates: Jede Kategorie hat ihren Tarif, ohne Rechnen von Hand." },
          { icon: "🚲", title: "Abholung und Lieferung verkauft", text: "Der Heimservice wird zur klaren Option, nach Ihren Regeln verrechnet." },
          { icon: "⏱️", title: "Express wird zur Option", text: "Zurück innert 24 Stunden: Ihr Zuschlag wird automatisch angewendet." },
          { icon: "📲", title: "Anfragen, die vorbereitet ankommen", text: "Sie wissen, was an die Theke oder in die Tour kommt, noch bevor abgeholt wird." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Stück, pro Kilo, Expresszuschlag, Abholung und Lieferung. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Kleidungskategorien, Leistungen, Fristen und Abholarten.",
        excel: { file: "tarife-reinigung.xlsx", headers: ["Stück", "Bedingung", "Preis"], rows: [["Hemden", "8 Stück", "CHF 36"], ["Anzüge / Kostüme", "2 Stück", "CHF 52"], ["Haushaltswäsche", "6 kg", "CHF 39"]] },
        chat: ["«Ich möchte 8 Hemden, 2 Anzüge und Haushaltswäsche reinigen lassen.»", "«Wie viele Kilo Wäsche, und ist das Bügeln inbegriffen?»", "«Wünschen Sie eine Abholung zu Hause oder eine Abgabe im Geschäft?»"],
        offer: { company: "Pressing Express du Lac", rows: [["Hemden (8)", 36], ["Anzüge / Kostüme (2)", 52], ["Haushaltswäsche (6 kg)", 39]] },
        roi: "Zehn zusätzliche Kunden pro Woche können Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "Pressing Express du Lac",
        eyebrow: "Lausanne & Lavaux · Fiktives Beispiel",
        hero: { h1: "Ihre Kleidung wie neu, ganz ohne Aufwand.", text: "Reinigung, Bügeln, Haushaltswäsche und Abholung zu Hause in Lausanne — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "52'000+", lbl: "GEREINIGTE STÜCKE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir reinigen",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihre Wäsche einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "👔", title: "Hemden", text: "Gereinigt und gebügelt auf dem Bügel.", tag: "CHF 4.50" },
          { icon: "🕴️", title: "Anzüge und Kostüme", text: "Sorgfältige chemische Reinigung.", tag: "CHF 26" },
          { icon: "🛏️", title: "Haushaltswäsche", text: "Bettwäsche, Tischtücher, Bezüge, pro Kilo.", tag: "CHF 6.50/kg" },
          { icon: "👗", title: "Delikates", text: "Kleider, Mäntel, Seide, Wolle.", tag: "ab CHF 19" },
          { icon: "🚲", title: "Abholung zu Hause", text: "Wir kommen zu Ihnen, Lieferung inbegriffen.", tag: "CHF 12" },
          { icon: "⏱️", title: "Express 24 Std.", text: "Ihre Wäsche am nächsten Tag zurück.", tag: "+30 %" },
        ],
        about: {
          title: "Eine Quartierreinigung mit modernem Service",
          text: "Pressing Express du Lac pflegt seit 1998 die Kleidung von Privatpersonen, Hotels und Restaurants in der Region Lausanne. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Sorgfältige Reinigung", "Produkte passend zu jeder Faser."], ["Pünktliche Abholung", "angekündigte Zeitfenster für Abholung und Lieferung."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 00 90", email: "hello@pressing-du-lac.demo", zone: "Lausanne, Lavaux, Morges", hours: "Mo–Sa, 7.30–18.30 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrer Wäsche — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Wäsche…",
        pdfCompany: { name: "Pressing Express du Lac", address: "Avenue de Rumine 4, 1005 Lausanne", phone: "021 000 00 90", email: "hello@pressing-du-lac.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Wäsche und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Abhol- und Lieferadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, gemäss angegebenen Mengen. Anpassung möglich, falls die abgegebenen Stücke abweichen. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          shirts: { text: "Wie viele Hemden?", short: "Hemden", opts: { none: "Keine", few: "1 bis 5 Hemden", mid: "6 bis 10 Hemden", many: "11 bis 20 Hemden", lots: "Über 20 Hemden" } },
          suits: { text: "Wie viele Anzüge oder Kostüme?", short: "Anzüge", opts: { none: "Keine", one: "1 Anzug oder Kostüm", two: "2 bis 3 Stück", four: "4 Stück oder mehr" } },
          linen: { text: "Wie viel Haushaltswäsche (Bettwäsche, Tischtücher, Bezüge)?", short: "Haushaltswäsche", opts: { none: "Keine", small: "Bis 3 kg", mid: "3 bis 8 kg", large: "8 bis 15 kg" } },
          delicate: { text: "Haben Sie delikate Kleidungsstücke (Kleider, Mäntel, Seide, Wolle)?", short: "Delikates", opts: { none: "Keine", few: "1 bis 2 Stück", more: "3 bis 5 Stück", lots: "6 Stück oder mehr" } },
          service: { text: "Welche Leistung wünschen Sie?", short: "Leistung", opts: { clean: "Reinigung + Bügeln", iron: "Nur Bügeln" } },
          pickup: { text: "Wie möchten Sie die Wäsche abgeben und abholen?", short: "Übergabe", opts: { shop: "Abgabe und Abholung im Geschäft", collect: "Abholung und Lieferung zu Hause" } },
          speed: { text: "Welche Frist wünschen Sie?", short: "Frist", opts: { std: "Standard (3 bis 4 Tage)", express: "Express 24 Std." } },
          date: { text: "An welchem Datum wünschen Sie die Abholung oder Abgabe?", short: "Wunschtermin" },
        },
        items: {
          shirts: "Hemden ({n})",
          suits: "Anzüge / Kostüme ({n})",
          linen: "Haushaltswäsche ({kg} kg)",
          delicate: "Delikate Kleidungsstücke ({n})",
          file: "Bearbeitungsgebühr",
          express: "Expresszuschlag 24 Std.",
          collect: "Abholung und Lieferung zu Hause",
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
