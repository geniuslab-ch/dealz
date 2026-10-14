/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "vitres",
    icon: "🪟",
    needsAddress: true,
    colors: { main: "#228be6", dark: "#1971c2", light: "#d0ebff", accent: "#12b886", accentDark: "#0ca678", bg: "#f8fbff" },

    quote: {
      minimum: 90,
      questions: [
        { id: "building", type: "single", options: [{ id: "house", k: 1 }, { id: "flat", k: 0.9 }, { id: "building", k: 1.1 }, { id: "shop", k: 1.2 }, { id: "office", k: 1.05 }] },
        { id: "count", type: "single", options: [{ id: "n1", n: 7 }, { id: "n2", n: 15 }, { id: "n3", n: 30 }, { id: "n4", n: 50 }] },
        { id: "types", type: "multi", options: [{ id: "large" }, { id: "veranda" }, { id: "shutters" }, { id: "frames" }] },
        { id: "height", type: "single", options: [{ id: "ground", k: 1, lift: 0 }, { id: "mid", k: 1.25, lift: 0 }, { id: "high", k: 1.6, lift: 280 }] },
        { id: "freq", type: "single", options: [{ id: "once", disc: 0 }, { id: "quarterly", disc: 0.1 }, { id: "monthly", disc: 0.18 }] },
        { id: "date", type: "date", minDays: 3 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var n = a.count.n;
        var base = H.round5(n * 9.5 * a.building.k * a.height.k);
        items.push({ label: L("windows", { n: n }), amount: base });
        (a.types || []).forEach(function (t) {
          if (t.id === "large") items.push({ label: L("large"), amount: H.round5(n * 0.25 * 28) });
          if (t.id === "veranda") items.push({ label: L("veranda"), amount: 140 });
          if (t.id === "shutters") items.push({ label: L("shutters", { n: n }), amount: H.round5(n * 3.8) });
          if (t.id === "frames") items.push({ label: L("frames", { n: n }), amount: H.round5(n * 2.5) });
        });
        if (a.height.lift) items.push({ label: L("lift"), amount: a.height.lift });
        var sub = items.reduce(function (s, i) { return s + i.amount; }, 0);
        if (a.freq.disc) items.push({ label: L("discount", { pct: Math.round(a.freq.disc * 100) }), amount: -H.round5(sub * a.freq.disc) });
        return items;
      },
    },

    fr: {
      label: "Nettoyage de vitres",
      forWho: "entreprises de nettoyage de vitres",
      pitch: "Chiffrez le nombre de vitres, la hauteur et la fréquence en quelques clics.",
      emailNoun: "le nettoyage de vos vitres",
      landing: {
        h1: ["VOUS LAVEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de nettoyage de vitres perdez-vous parce que vous êtes sur une nacelle ?",
        text: "Le client veut un prix pour ses vitres avant de décider. Dealz lui répond à toute heure, pose les bonnes questions (nombre de vitres, hauteur, baies, fréquence), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour nettoyer les 15 vitres de ma maison ?",
        values: [
          { icon: "🪟", title: "Un prix à la vitre", text: "Nombre de vitres, type de bâtiment et hauteur : vos coefficients s'appliquent automatiquement." },
          { icon: "🧗", title: "Nacelle et accès difficiles chiffrés", text: "Au-delà du troisième étage, le forfait nacelle ou cordes s'ajoute sans négociation." },
          { icon: "🔁", title: "Des contrats récurrents faciles à vendre", text: "Trimestriel, mensuel : vos remises de fréquence sont proposées d'emblée." },
          { icon: "🧽", title: "Baies, vérandas, stores en options", text: "Chaque surface spéciale est une ligne de devis claire." },
        ],
        step1: "Importez vos tarifs : prix à la vitre, coefficients par bâtiment et par hauteur, forfaits nacelle, remises de fréquence. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de bâtiments, vos surfaces spéciales, vos hauteurs d'intervention et vos fréquences.",
        excel: { file: "tarifs-vitres.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Nettoyage des vitres", "15 vitres · maison", "CHF 145"], ["Baies vitrées", "Grandes surfaces", "CHF 105"], ["Cadres et rebords", "15 vitres", "CHF 40"]] },
        chat: ["« Je voudrais faire nettoyer les vitres de ma maison. »", "« Combien de vitres, et jusqu'à quel étage ? »", "« Avez-vous des baies vitrées ou des cadres à nettoyer aussi ? »"],
        offer: { company: "ClairVue Vitrerie Services", rows: [["Nettoyage des vitres (15)", 145], ["Baies vitrées / grandes surfaces", 105], ["Cadres et rebords (15)", 40]] },
        roi: "Un seul contrat trimestriel supplémentaire peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "ClairVue",
        eyebrow: "Vevey & Riviera · Exemple fictif",
        hero: { h1: "Des vitres impeccables, sans les traces.", text: "Nettoyage de vitres, baies vitrées, vérandas et vitrines pour particuliers et professionnels — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "9 000+", lbl: "FAÇADES NETTOYÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous nettoyons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🏠", title: "Vitres de maison", text: "Intérieur et extérieur, sans traces.", tag: "dès CHF 9.50/vitre" },
          { icon: "🪟", title: "Baies vitrées", text: "Grandes surfaces et portes-fenêtres.", tag: "dès CHF 28/baie" },
          { icon: "🏢", title: "Immeubles", text: "Parties communes et façades vitrées.", tag: "sur devis" },
          { icon: "🛍️", title: "Vitrines de commerce", text: "Passage régulier avant ouverture.", tag: "dès CHF 90" },
          { icon: "🌿", title: "Vérandas et toits vitrés", text: "Nettoyage soigné des surfaces vitrées.", tag: "CHF 140" },
          { icon: "🧗", title: "Nacelle / cordes", text: "Accès aux étages élevés en sécurité.", tag: "CHF 280" },
        ],
        about: {
          title: "Des laveurs de vitres qualifiés",
          text: "ClairVue Vitrerie Services entretient vitres et façades vitrées de particuliers, régies et commerces entre Vevey et la Riviera depuis 2011. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Matériel professionnel", "eau pure et raclettes pour un résultat sans traces."], ["Travail en hauteur sécurisé", "équipes formées et assurées."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 14", email: "hello@clairvue.demo", zone: "Vevey, Riviera, Chablais", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur vos vitres — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos vitres…",
        pdfCompany: { name: "ClairVue Vitrerie Services", address: "Rue du Simplon 40, 1800 Vevey", phone: "021 000 00 14", email: "hello@clairvue.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos vitres, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du bâtiment (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, par passage. Intervention sous réserve de conditions météo compatibles pour l'extérieur. TVA suisse incluse le cas échéant.",
        q: {
          building: { text: "De quel type de bâtiment s'agit-il ?", short: "Bâtiment", opts: { house: "Maison / villa", flat: "Appartement", building: "Immeuble (parties communes)", shop: "Commerce / vitrine", office: "Bureaux" } },
          count: { text: "Combien de vitres environ ?", short: "Vitres", opts: { n1: "Moins de 10 vitres", n2: "10 à 20 vitres", n3: "20 à 40 vitres", n4: "Plus de 40 vitres" } },
          types: { text: "Y a-t-il des surfaces particulières ?", short: "Surfaces", none: "Vitres standard uniquement", opts: { large: "Baies vitrées / grandes surfaces", veranda: "Véranda / toit vitré", shutters: "Stores et volets", frames: "Cadres et rebords" } },
          height: { text: "À quelle hauteur se trouvent les vitres ?", short: "Hauteur", opts: { ground: "Rez-de-chaussée et 1er étage", mid: "Jusqu'au 3e étage", high: "Plus haut (nacelle ou cordes)" } },
          freq: { text: "Souhaitez-vous un passage unique ou régulier ?", short: "Fréquence", opts: { once: "Passage unique", quarterly: "Trimestriel (4 passages par an)", monthly: "Mensuel (12 passages par an)" } },
          date: { text: "Pour quelle date souhaitez-vous le premier passage ?", short: "Date souhaitée" },
        },
        items: {
          windows: "Nettoyage des vitres ({n}, intérieur et extérieur)",
          large: "Baies vitrées / grandes surfaces",
          veranda: "Véranda / toit vitré",
          shutters: "Stores et volets ({n})",
          frames: "Cadres et rebords ({n})",
          lift: "Nacelle / accès par cordes",
          discount: "Remise de fréquence ({pct} %)",
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
