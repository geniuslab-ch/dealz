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
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else {
    window.DEALZ_SECTORS = window.DEALZ_SECTORS || {};
    window.DEALZ_SECTORS[S.slug] = S;
  }
})();
