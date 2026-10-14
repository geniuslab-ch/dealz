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
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else {
    window.DEALZ_SECTORS = window.DEALZ_SECTORS || {};
    window.DEALZ_SECTORS[S.slug] = S;
  }
})();
