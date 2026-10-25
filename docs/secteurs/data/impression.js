/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "impression",
    icon: "🖨️",
    needsAddress: true,
    colors: { main: "#f76707", dark: "#d9480f", light: "#ffe8cc", accent: "#364fc7", accentDark: "#2b3a9f", bg: "#fffaf5" },

    quote: {
      minimum: 60,
      questions: [
        { id: "product", type: "single", options: [{ id: "flyers", unit: 0.28, kind: "print" }, { id: "cards", unit: 0.32, kind: "print" }, { id: "posters", unit: 3.2, kind: "print" }, { id: "banner", unit: 38, kind: "large" }, { id: "sign", unit: 160, kind: "large" }, { id: "vinyl", unit: 22, kind: "large" }, { id: "textile", unit: 14, kind: "large" }] },
        {
          id: "qty", type: "single",
          when: function (a) { return a.product.kind === "print"; },
          options: [{ id: "q50", n: 50, f: 1.6 }, { id: "q100", n: 100, f: 1.25 }, { id: "q250", n: 250, f: 1 }, { id: "q500", n: 500, f: 0.82 }, { id: "q1000", n: 1000, f: 0.65 }],
        },
        {
          id: "qtyLarge", type: "single",
          when: function (a) { return a.product.kind === "large"; },
          options: [{ id: "l1", n: 1, f: 1.15 }, { id: "l3", n: 3, f: 1 }, { id: "l10", n: 10, f: 0.9 }, { id: "l25", n: 25, f: 0.8 }],
        },
        {
          id: "format", type: "single",
          when: function (a) { return a.product.id === "flyers" || a.product.id === "posters"; },
          options: [{ id: "a6", k: 0.6 }, { id: "a5", k: 1 }, { id: "a4", k: 1.7 }, { id: "a3", k: 3.2 }],
        },
        {
          id: "paper", type: "single",
          when: function (a) { return a.product.kind === "print"; },
          options: [{ id: "std", k: 1 }, { id: "premium", k: 1.35 }, { id: "soft", k: 1.7 }],
        },
        { id: "design", type: "single", options: [{ id: "ready", fee: 0 }, { id: "adapt", fee: 60 }, { id: "create", fee: 180 }] },
        { id: "delivery", type: "single", options: [{ id: "pickup", fee: 0 }, { id: "ship", fee: 18 }, { id: "express", fee: 60 }] },
        { id: "date", type: "date", minDays: 2 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var p = a.product;
        if (p.kind === "print") {
          var unit = p.unit * (a.format ? a.format.k : 1) * a.paper.k * a.qty.f;
          items.push({ label: L(p.id, { n: a.qty.n }), amount: H.round1(unit * a.qty.n) });
          items.push({ label: L("setup"), amount: 35 });
        } else {
          items.push({ label: L(p.id, { n: a.qtyLarge.n }), amount: H.round5(p.unit * a.qtyLarge.n * a.qtyLarge.f) });
        }
        if (a.design.fee) items.push({ label: L("design_" + a.design.id), amount: a.design.fee });
        if (a.delivery.fee) items.push({ label: L(a.delivery.id === "express" ? "express" : "ship"), amount: a.delivery.fee });
        return items;
      },
    },

    fr: {
      label: "Impression et signalétique",
      forWho: "imprimeries et entreprises de signalétique",
      pitch: "Chiffrez tirages, formats et finitions sans passer par un devis manuel.",
      emailNoun: "votre commande d'impression",
      landing: {
        h1: ["VOUS IMPRIMEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de devis d'impression perdez-vous parce qu'elles attendent dans une boîte mail ?",
        text: "Pour un flyer ou une bâche, le client compare cinq imprimeurs en ligne en dix minutes. Dealz lui répond tout de suite, pose les bonnes questions (produit, quantité, format, papier, création), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour 500 flyers A5 avec création graphique ?",
        values: [
          { icon: "📐", title: "Un prix selon la quantité et le format", text: "Vos paliers de volume, formats et papiers s'appliquent automatiquement." },
          { icon: "🎨", title: "Création et adaptation chiffrées", text: "Fichiers prêts, adaptation ou création graphique : chaque option est une ligne de devis claire." },
          { icon: "🚚", title: "Livraison standard ou express", text: "Retrait, livraison en Suisse ou express 48 h : vos forfaits s'appliquent seuls." },
          { icon: "🪧", title: "Petits et grands formats", text: "Flyers, cartes, affiches, bâches, enseignes, adhésifs, textiles : un seul assistant pour tout votre catalogue." },
        ],
        step1: "Importez vos tarifs : prix unitaires par produit, paliers de quantité, formats, papiers, création, livraison. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos produits, vos paliers de volume, vos formats et vos finitions.",
        excel: { file: "tarifs-impression.xlsx", headers: ["Produit", "Condition", "Prix"], rows: [["Flyers A5", "500 ex. · papier 135 g", "CHF 115"], ["Préparation et calage", "Forfait", "CHF 35"], ["Création graphique", "Forfait", "CHF 180"]] },
        chat: ["« J'ai besoin de 500 flyers pour l'ouverture de mon magasin. »", "« Quel format et quel papier, et avez-vous déjà vos fichiers ? »", "« Souhaitez-vous une création graphique et une livraison en Suisse ? »"],
        offer: { company: "ImpriVision Print Sàrl", rows: [["Flyers A5 (500 ex.)", 115], ["Préparation et calage", 35], ["Création graphique", 180]] },
        roi: "Une seule commande supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "ImpriVision",
        eyebrow: "Lausanne & Romandie · Exemple fictif",
        hero: { h1: "Imprimé vite, imprimé juste.", text: "Flyers, cartes de visite, affiches, bâches, enseignes et textiles personnalisés — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "12 000+", lbl: "COMMANDES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous imprimons",
        servicesSub: "Choisissez un produit, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "📄", title: "Flyers et dépliants", text: "Tous formats, papiers au choix.", tag: "dès CHF 60" },
          { icon: "💳", title: "Cartes de visite", text: "Finitions soignées, délais courts.", tag: "dès CHF 60" },
          { icon: "🖼️", title: "Affiches", text: "Du A3 au grand format.", tag: "dès CHF 3.20/ex." },
          { icon: "🎪", title: "Bâches et banderoles", text: "Résistantes à l'extérieur.", tag: "dès CHF 38" },
          { icon: "🪧", title: "Enseignes et signalétique", text: "Conception, fabrication et pose.", tag: "dès CHF 160" },
          { icon: "👕", title: "Textiles personnalisés", text: "T-shirts, sweats et goodies.", tag: "dès CHF 14" },
        ],
        about: {
          title: "Une imprimerie locale, des délais tenus",
          text: "ImpriVision Print imprime et pose la communication visuelle de commerces, associations et entreprises de Suisse romande depuis 2006. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Épreuve avant tirage", "bon à tirer validé avant chaque impression."], ["Papiers certifiés", "choix de papiers FSC et recyclés."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 16", email: "hello@imprivision.demo", zone: "Suisse romande", hours: "Lun–Ven, 8h–18h" },
        devisNote: "Répondez à quelques questions sur votre impression — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez ce que vous voulez imprimer…",
        pdfCompany: { name: "ImpriVision Print Sàrl", address: "Chemin de la Vuachère 6, 1005 Lausanne", phone: "021 000 00 16", email: "hello@imprivision.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre impression, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de livraison (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de fichiers conformes aux consignes. Bon à tirer à valider avant impression. TVA suisse incluse le cas échéant.",
        q: {
          product: { text: "Que souhaitez-vous imprimer ?", short: "Produit", opts: { flyers: "Flyers / dépliants", cards: "Cartes de visite", posters: "Affiches / posters", banner: "Bâches et banderoles", sign: "Enseignes / signalétique", vinyl: "Adhésifs / vitrophanie", textile: "Textiles personnalisés" } },
          qty: { text: "Quelle quantité ?", short: "Quantité", opts: { q50: "50 exemplaires", q100: "100 exemplaires", q250: "250 exemplaires", q500: "500 exemplaires", q1000: "1000 exemplaires" } },
          qtyLarge: { text: "Combien de pièces ?", short: "Pièces", opts: { l1: "1 pièce", l3: "3 pièces", l10: "10 pièces", l25: "25 pièces" } },
          format: { text: "Quel format ?", short: "Format", opts: { a6: "A6", a5: "A5", a4: "A4", a3: "A3" } },
          paper: { text: "Quel papier ou quelle finition ?", short: "Papier", opts: { std: "Papier standard 135 g", premium: "Papier premium 250 g mat", soft: "Pelliculage soft-touch" } },
          design: { text: "Avez-vous déjà vos fichiers ?", short: "Fichiers", opts: { ready: "Oui, prêts à imprimer", adapt: "À adapter par vos soins", create: "Non, création graphique à prévoir" } },
          delivery: { text: "Comment souhaitez-vous recevoir la commande ?", short: "Livraison", opts: { pickup: "Retrait à l'imprimerie", ship: "Livraison en Suisse", express: "Livraison express 48 h" } },
          date: { text: "Pour quelle date souhaitez-vous recevoir la commande ?", short: "Date souhaitée" },
        },
        items: {
          flyers: "Flyers / dépliants ({n} ex.)",
          cards: "Cartes de visite ({n} ex.)",
          posters: "Affiches ({n} ex.)",
          banner: "Bâches et banderoles ({n} pièces)",
          sign: "Enseignes / signalétique ({n} pièces)",
          vinyl: "Adhésifs / vitrophanie ({n} pièces)",
          textile: "Textiles personnalisés ({n} pièces)",
          setup: "Préparation et calage",
          design_adapt: "Adaptation de vos fichiers",
          design_create: "Création graphique",
          ship: "Livraison en Suisse",
          express: "Livraison express 48 h",
        },
      },
    },
    en: {
      label: "Printing and signage",
      forWho: "print shops and signage companies",
      pitch: "Price runs, formats and finishes without a manual quote.",
      emailNoun: "your print order",
      landing: {
        h1: ["YOU PRINT.", "DEALZ PRICES."],
        question: "How many print quote requests do you lose because they sit waiting in an inbox?",
        text: "For a flyer or a banner, customers compare five online printers in ten minutes. Dealz answers right away, asks the right questions (product, quantity, format, paper, design), calculates your price from your rates and prepares the quote.",
        clientQ: "How much for 500 A5 flyers with graphic design?",
        values: [
          { icon: "📐", title: "A price by quantity and format", text: "Your volume tiers, formats and papers apply automatically." },
          { icon: "🎨", title: "Design and adaptation priced", text: "Print-ready files, adaptation or graphic design: each option is a clear quote line." },
          { icon: "🚚", title: "Standard or express delivery", text: "Pick-up, delivery in Switzerland or 48h express: your flat fees apply on their own." },
          { icon: "🪧", title: "Small and large formats", text: "Flyers, cards, posters, banners, signs, stickers, textiles: one assistant for your whole catalogue." },
        ],
        step1: "Import your rates: unit prices per product, quantity tiers, formats, papers, design, delivery. Your Excel stays your working tool.",
        step2: "The engine understands your products, volume tiers, formats and finishes.",
        excel: { file: "print-rates.xlsx", headers: ["Product", "Condition", "Price"], rows: [["A5 flyers", "500 copies · 135 g paper", "CHF 115"], ["Prepress and make-ready", "Flat fee", "CHF 35"], ["Graphic design", "Flat fee", "CHF 180"]] },
        chat: ["“I need 500 flyers for my shop opening.”", "“Which format and paper, and do you already have your files?”", "“Would you like graphic design and delivery in Switzerland?”"],
        offer: { company: "ImpriVision Print Sàrl", rows: [["A5 flyers (500 copies)", 115], ["Prepress and make-ready", 35], ["Graphic design", 180]] },
        roi: "A single extra order a week can already pay for your subscription.",
      },
      demo: {
        brand: "ImpriVision",
        eyebrow: "Lausanne & French-speaking Switzerland · Fictional example",
        hero: { h1: "Printed fast, printed right.", text: "Flyers, business cards, posters, banners, signs and custom textiles — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "12,000+", lbl: "ORDERS" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we print",
        servicesSub: "Pick a product, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "📄", title: "Flyers and leaflets", text: "All formats, choice of papers.", tag: "from CHF 60" },
          { icon: "💳", title: "Business cards", text: "Quality finishes, short lead times.", tag: "from CHF 60" },
          { icon: "🖼️", title: "Posters", text: "From A3 to large format.", tag: "from CHF 3.20/copy" },
          { icon: "🎪", title: "Banners", text: "Weather-resistant for outdoor use.", tag: "from CHF 38" },
          { icon: "🪧", title: "Signs and signage", text: "Design, production and installation.", tag: "from CHF 160" },
          { icon: "👕", title: "Custom textiles", text: "T-shirts, sweatshirts and merch.", tag: "from CHF 14" },
        ],
        about: {
          title: "A local print shop, deadlines met",
          text: "ImpriVision Print has been printing and installing visual communication for shops, associations and businesses in French-speaking Switzerland since 2006. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Proof before printing", "print proof approved before every run."], ["Certified papers", "a choice of FSC and recycled papers."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 16", email: "hello@imprivision.demo", zone: "French-speaking Switzerland", hours: "Mon–Fri, 8am–6pm" },
        devisNote: "Answer a few questions about your print job — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe what you'd like printed…",
        pdfCompany: { name: "ImpriVision Print Sàrl", address: "Chemin de la Vuachère 6, 1005 Lausanne", phone: "021 000 00 16", email: "hello@imprivision.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your print job, then put together a firm quote right away.",
        addressPlaceholder: "Delivery address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, subject to files meeting the specifications. Print proof to be approved before printing. Swiss VAT included where applicable.",
        q: {
          product: { text: "What would you like to print?", short: "Product", opts: { flyers: "Flyers / leaflets", cards: "Business cards", posters: "Posters", banner: "Banners", sign: "Signs / signage", vinyl: "Stickers / window graphics", textile: "Custom textiles" } },
          qty: { text: "What quantity?", short: "Quantity", opts: { q50: "50 copies", q100: "100 copies", q250: "250 copies", q500: "500 copies", q1000: "1000 copies" } },
          qtyLarge: { text: "How many pieces?", short: "Pieces", opts: { l1: "1 piece", l3: "3 pieces", l10: "10 pieces", l25: "25 pieces" } },
          format: { text: "Which format?", short: "Format", opts: { a6: "A6", a5: "A5", a4: "A4", a3: "A3" } },
          paper: { text: "Which paper or finish?", short: "Paper", opts: { std: "Standard 135 g paper", premium: "Premium 250 g matt paper", soft: "Soft-touch lamination" } },
          design: { text: "Do you already have your files?", short: "Files", opts: { ready: "Yes, print-ready", adapt: "To be adapted by you", create: "No, graphic design needed" } },
          delivery: { text: "How would you like to receive the order?", short: "Delivery", opts: { pickup: "Pick-up at the print shop", ship: "Delivery in Switzerland", express: "48h express delivery" } },
          date: { text: "By what date would you like to receive the order?", short: "Preferred date" },
        },
        items: {
          flyers: "Flyers / leaflets ({n} copies)",
          cards: "Business cards ({n} copies)",
          posters: "Posters ({n} copies)",
          banner: "Banners ({n} pieces)",
          sign: "Signs / signage ({n} pieces)",
          vinyl: "Stickers / window graphics ({n} pieces)",
          textile: "Custom textiles ({n} pieces)",
          setup: "Prepress and make-ready",
          design_adapt: "Adaptation of your files",
          design_create: "Graphic design",
          ship: "Delivery in Switzerland",
          express: "48h express delivery",
        },
      },
    },
    de: {
      label: "Druck und Beschriftung",
      forWho: "Druckereien und Beschriftungsfirmen",
      pitch: "Auflagen, Formate und Veredelungen ohne manuelle Offerte berechnen.",
      emailNoun: "Ihren Druckauftrag",
      landing: {
        h1: ["SIE DRUCKEN.", "DEALZ RECHNET."],
        question: "Wie viele Druckanfragen verlieren Sie, weil sie in einem Postfach warten?",
        text: "Für einen Flyer oder ein Banner vergleicht der Kunde in zehn Minuten fünf Online-Druckereien. Dealz antwortet sofort, stellt die richtigen Fragen (Produkt, Menge, Format, Papier, Gestaltung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kosten 500 A5-Flyer mit grafischer Gestaltung?",
        values: [
          { icon: "📐", title: "Ein Preis nach Menge und Format", text: "Ihre Mengenstaffeln, Formate und Papiere werden automatisch angewendet." },
          { icon: "🎨", title: "Gestaltung und Anpassung berechnet", text: "Druckfertige Dateien, Anpassung oder Gestaltung: Jede Option ist eine klare Offertposition." },
          { icon: "🚚", title: "Standard- oder Expresslieferung", text: "Abholung, Lieferung in der Schweiz oder Express 48 h: Ihre Pauschalen werden automatisch angewendet." },
          { icon: "🪧", title: "Klein- und Grossformate", text: "Flyer, Karten, Plakate, Banner, Schilder, Kleber, Textilien: ein einziger Assistent für Ihr ganzes Sortiment." },
        ],
        step1: "Importieren Sie Ihre Tarife: Stückpreise pro Produkt, Mengenstaffeln, Formate, Papiere, Gestaltung, Lieferung. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Produkte, Mengenstaffeln, Formate und Veredelungen.",
        excel: { file: "tarife-druck.xlsx", headers: ["Produkt", "Bedingung", "Preis"], rows: [["Flyer A5", "500 Ex. · Papier 135 g", "CHF 115"], ["Druckvorstufe und Einrichten", "Pauschale", "CHF 35"], ["Grafische Gestaltung", "Pauschale", "CHF 180"]] },
        chat: ["«Ich brauche 500 Flyer für die Eröffnung meines Geschäfts.»", "«Welches Format und welches Papier, und haben Sie Ihre Dateien schon?»", "«Wünschen Sie eine grafische Gestaltung und eine Lieferung in der Schweiz?»"],
        offer: { company: "ImpriVision Print Sàrl", rows: [["Flyer A5 (500 Ex.)", 115], ["Druckvorstufe und Einrichten", 35], ["Grafische Gestaltung", 180]] },
        roi: "Ein einziger zusätzlicher Auftrag pro Woche kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "ImpriVision",
        eyebrow: "Lausanne & Westschweiz · Fiktives Beispiel",
        hero: { h1: "Schnell gedruckt, richtig gedruckt.", text: "Flyer, Visitenkarten, Plakate, Banner, Schilder und personalisierte Textilien — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "12'000+", lbl: "AUFTRÄGE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir drucken",
        servicesSub: "Wählen Sie ein Produkt, oder beschreiben Sie Ihren Bedarf einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "📄", title: "Flyer und Faltblätter", text: "Alle Formate, Papier nach Wahl.", tag: "ab CHF 60" },
          { icon: "💳", title: "Visitenkarten", text: "Sorgfältige Veredelung, kurze Fristen.", tag: "ab CHF 60" },
          { icon: "🖼️", title: "Plakate", text: "Von A3 bis Grossformat.", tag: "ab CHF 3.20/Ex." },
          { icon: "🎪", title: "Banner und Blachen", text: "Wetterfest für draussen.", tag: "ab CHF 38" },
          { icon: "🪧", title: "Schilder und Beschriftung", text: "Konzept, Herstellung und Montage.", tag: "ab CHF 160" },
          { icon: "👕", title: "Personalisierte Textilien", text: "T-Shirts, Pullover und Werbeartikel.", tag: "ab CHF 14" },
        ],
        about: {
          title: "Eine lokale Druckerei, eingehaltene Fristen",
          text: "ImpriVision Print druckt und montiert seit 2006 die visuelle Kommunikation von Geschäften, Vereinen und Unternehmen in der Westschweiz. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Gut zum Druck", "Druckfreigabe vor jedem Auftrag."], ["Zertifizierte Papiere", "Auswahl an FSC- und Recyclingpapieren."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 00 16", email: "hello@imprivision.demo", zone: "Westschweiz", hours: "Mo–Fr, 8–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Druckauftrag — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie, was Sie drucken möchten…",
        pdfCompany: { name: "ImpriVision Print Sàrl", address: "Chemin de la Vuachère 6, 1005 Lausanne", phone: "021 000 00 16", email: "hello@imprivision.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Druckauftrag und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Lieferadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, vorbehaltlich vorgabekonformer Dateien. Gut zum Druck vor dem Druck freizugeben. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          product: { text: "Was möchten Sie drucken?", short: "Produkt", opts: { flyers: "Flyer / Faltblätter", cards: "Visitenkarten", posters: "Plakate / Poster", banner: "Banner und Blachen", sign: "Schilder / Beschriftung", vinyl: "Kleber / Fensterbeschriftung", textile: "Personalisierte Textilien" } },
          qty: { text: "Welche Menge?", short: "Menge", opts: { q50: "50 Exemplare", q100: "100 Exemplare", q250: "250 Exemplare", q500: "500 Exemplare", q1000: "1000 Exemplare" } },
          qtyLarge: { text: "Wie viele Stück?", short: "Stück", opts: { l1: "1 Stück", l3: "3 Stück", l10: "10 Stück", l25: "25 Stück" } },
          format: { text: "Welches Format?", short: "Format", opts: { a6: "A6", a5: "A5", a4: "A4", a3: "A3" } },
          paper: { text: "Welches Papier oder welche Veredelung?", short: "Papier", opts: { std: "Standardpapier 135 g", premium: "Premiumpapier 250 g matt", soft: "Soft-Touch-Kaschierung" } },
          design: { text: "Haben Sie Ihre Dateien schon?", short: "Dateien", opts: { ready: "Ja, druckfertig", adapt: "Von Ihnen anzupassen", create: "Nein, grafische Gestaltung nötig" } },
          delivery: { text: "Wie möchten Sie die Bestellung erhalten?", short: "Lieferung", opts: { pickup: "Abholung in der Druckerei", ship: "Lieferung in der Schweiz", express: "Expresslieferung 48 h" } },
          date: { text: "Bis wann möchten Sie die Bestellung erhalten?", short: "Wunschdatum" },
        },
        items: {
          flyers: "Flyer / Faltblätter ({n} Ex.)",
          cards: "Visitenkarten ({n} Ex.)",
          posters: "Plakate ({n} Ex.)",
          banner: "Banner und Blachen ({n} Stück)",
          sign: "Schilder / Beschriftung ({n} Stück)",
          vinyl: "Kleber / Fensterbeschriftung ({n} Stück)",
          textile: "Personalisierte Textilien ({n} Stück)",
          setup: "Druckvorstufe und Einrichten",
          design_adapt: "Anpassung Ihrer Dateien",
          design_create: "Grafische Gestaltung",
          ship: "Lieferung in der Schweiz",
          express: "Expresslieferung 48 h",
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
