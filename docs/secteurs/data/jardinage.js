/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "jardinage",
    icon: "🌿",
    needsAddress: true,
    colors: { main: "#2f9e44", dark: "#237a35", light: "#d8f5dd", accent: "#f08c00", accentDark: "#d97706", bg: "#fbfef9" },

    quote: {
      minimum: 120,
      questions: [
        { id: "service", type: "single", options: [{ id: "lawn" }, { id: "hedge" }, { id: "prune" }, { id: "design" }, { id: "yearly" }] },
        { id: "surface", type: "single", options: [{ id: "s1", m2: 150 }, { id: "s2", m2: 350 }, { id: "s3", m2: 750 }, { id: "s4", m2: 1500 }, { id: "s5", m2: 2800 }] },
        {
          id: "state", type: "single",
          when: function (a) { return a.service.id !== "design"; },
          options: [{ id: "ok", k: 1 }, { id: "neg", k: 1.25 }, { id: "wild", k: 1.6 }],
        },
        {
          id: "freq", type: "single",
          when: function (a) { return a.service.id === "lawn"; },
          options: [{ id: "once", visits: 1, disc: 0 }, { id: "monthly", visits: 7, disc: 0 }, { id: "biweekly", visits: 14, disc: 0.06 }, { id: "weekly", visits: 28, disc: 0.1 }],
        },
        {
          id: "extras", type: "multi",
          when: function (a) { return a.service.id !== "design"; },
          options: [{ id: "waste" }, { id: "weed" }, { id: "fert" }, { id: "irrig" }],
        },
        { id: "date", type: "date", minDays: 3 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surface.m2;
        var k = a.state ? a.state.k : 1;
        var rate = 62;
        var lawnHours = 0.5 + m2 / 450;
        var hedgeHours = 1 + m2 / 350;
        var svc = a.service.id;
        if (svc === "lawn") {
          items.push({ label: L("lawn", { n: a.freq.visits, m2: m2 }), amount: H.round5(lawnHours * rate * k * a.freq.visits * (1 - a.freq.disc)) });
        } else if (svc === "hedge") {
          items.push({ label: L("hedge", { m2: m2 }), amount: H.round5(hedgeHours * rate * k) });
        } else if (svc === "prune") {
          items.push({ label: L("prune"), amount: H.round5((2 + m2 / 500) * 78 * k) });
        } else if (svc === "design") {
          var base = Math.min(m2, 600);
          items.push({ label: L("design", { m2: base }), amount: H.round5(base * 42 + 320) });
        } else {
          items.push({ label: L("yearly", { m2: m2 }), amount: H.round5(lawnHours * rate * 14 * 0.92 * k + hedgeHours * rate * 2 * k) });
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "waste") items.push({ label: L("waste"), amount: H.round5(60 + m2 * 0.05) });
          if (e.id === "weed") items.push({ label: L("weed"), amount: H.round5(m2 * 0.15 * k) });
          if (e.id === "fert") items.push({ label: L("fert"), amount: H.round5(m2 * 0.12 + 30) });
          if (e.id === "irrig") items.push({ label: L("irrig"), amount: 90 });
        });
        return items;
      },
    },

    fr: {
      label: "Jardinage et paysagisme",
      forWho: "entreprises de jardinage et de paysagisme",
      pitch: "Chiffrez tonte, taille et entretien selon la surface et l'état du jardin.",
      landing: {
        h1: ["VOUS JARDINEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes d'entretien de jardin perdez-vous quand vous êtes chez un client ?",
        text: "Au printemps, le téléphone sonne sans arrêt — et vous êtes au bout d'une tondeuse. Dealz répond à vos clients à votre place, pose les bonnes questions (surface, état du jardin, fréquence), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour l'entretien d'une pelouse de 350 m² toutes les deux semaines ?",
        values: [
          { icon: "📐", title: "Des devis à la surface", text: "Surface, état du terrain, fréquence : Dealz chiffre les entretiens standards sans visite préalable." },
          { icon: "🌱", title: "Pic de printemps absorbé", text: "Quand les demandes affluent en mars-avril, chacune reçoit une réponse immédiate — même pendant que vous travaillez." },
          { icon: "🔁", title: "Des contrats récurrents qualifiés", text: "Les forfaits à la saison (hebdomadaire, bimensuel) sont proposés d'emblée, avec la remise dégressive que vous définissez." },
          { icon: "🍂", title: "Options chiffrées automatiquement", text: "Évacuation des déchets verts, désherbage, fertilisation, arrosage : chaque option s'ajoute au devis selon vos règles." },
        ],
        step1: "Importez vos tarifs : taux horaire, forfaits par surface, tailles, élagages, remises de fréquence. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, l'état des terrains, vos fréquences de passage et vos options.",
        excel: { file: "tarifs-jardinage.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Tonte et entretien", "350 m² · 14 passages", "CHF 1 045"], ["Taille de haies", "350 m²", "CHF 125"], ["Évacuation déchets verts", "Forfait", "CHF 80"]] },
        chat: ["« Je cherche quelqu'un pour entretenir ma pelouse et tailler ma haie. »", "« Quelle est la surface du jardin, et dans quel état est-il ? »", "« Souhaitez-vous un passage unique ou un contrat à la saison ? »"],
        offer: { company: "Vert Léman Paysage Sàrl", rows: [["Tonte et entretien (14 passages)", 1045], ["Taille de haies", 125], ["Évacuation des déchets verts", 80]] },
        roi: "Un seul contrat d'entretien supplémentaire peut déjà payer votre abonnement pour la saison.",
      },
      demo: {
        brand: "Vert Léman Paysage",
        eyebrow: "Morges & Lavaux · Exemple fictif",
        hero: { h1: "Un jardin soigné, sans y passer vos week-ends.", text: "Entretien de pelouses, taille de haies, élagage et création de jardins autour du Léman — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "850+", lbl: "JARDINS ENTRETENUS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous entretenons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre jardin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🌱", title: "Tonte et entretien", text: "Pelouses entretenues à la saison ou ponctuellement.", tag: "dès CHF 62/h" },
          { icon: "✂️", title: "Taille de haies", text: "Haies, arbustes et massifs taillés proprement.", tag: "dès CHF 150" },
          { icon: "🌳", title: "Élagage d'arbres", text: "Réduction, éclaircie et abattage sécurisé.", tag: "dès CHF 280" },
          { icon: "🏡", title: "Création de jardin", text: "Plantations, gazon, terrasses et massifs.", tag: "sur devis" },
          { icon: "🍃", title: "Évacuation verte", text: "Déchets verts évacués et triés.", tag: "dès CHF 85" },
          { icon: "💧", title: "Arrosage automatique", text: "Contrôle et remise en service au printemps.", tag: "CHF 90" },
        ],
        about: {
          title: "Des jardiniers du coin, à votre service toute l'année",
          text: "Vert Léman Paysage entretient jardins privés et copropriétés entre Morges et Lavaux depuis 2009. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Équipes fixes", "le même jardinier vient chez vous à chaque passage."], ["Matériel professionnel", "tondeuses, taille-haies et broyeurs entretenus."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 10", email: "hello@vert-leman.demo", zone: "Morges, Lavaux, La Côte", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur votre jardin — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre jardin…",
        pdfCompany: { name: "Vert Léman Paysage Sàrl", address: "Route de Lausanne 45, 1110 Morges", phone: "021 000 00 10", email: "hello@vert-leman.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre jardin, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du jardin (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Évacuation des déchets verts uniquement si l'option est indiquée. TVA suisse incluse le cas échéant.",
        q: {
          service: { text: "Quelle prestation souhaitez-vous ?", short: "Prestation", opts: { lawn: "Tonte et entretien de pelouse", hedge: "Taille de haies et arbustes", prune: "Élagage d'arbres", design: "Création / rénovation de jardin", yearly: "Entretien annuel complet" } },
          surface: { text: "Quelle est la surface du jardin ?", short: "Surface", opts: { s1: "Moins de 200 m²", s2: "200 à 500 m²", s3: "500 à 1000 m²", s4: "1000 à 2000 m²", s5: "Plus de 2000 m²" } },
          state: { text: "Dans quel état se trouve le jardin ?", short: "État du jardin", opts: { ok: "Entretenu régulièrement", neg: "Un peu négligé", wild: "Très envahi" } },
          freq: { text: "À quelle fréquence souhaitez-vous la tonte ?", short: "Fréquence", opts: { once: "Intervention unique", monthly: "Une fois par mois (saison)", biweekly: "Toutes les deux semaines (saison)", weekly: "Chaque semaine (saison)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { waste: "Évacuation des déchets verts", weed: "Désherbage des massifs", fert: "Fertilisation / traitement anti-mousse", irrig: "Contrôle de l'arrosage automatique" } },
          date: { text: "Pour quelle date souhaitez-vous démarrer ?", short: "Date souhaitée" },
        },
        items: {
          lawn: "Tonte et entretien — {n} passage(s), {m2} m²",
          hedge: "Taille de haies et arbustes ({m2} m²)",
          prune: "Élagage d'arbres (équipe + broyage)",
          design: "Création / rénovation de jardin (jusqu'à {m2} m²)",
          yearly: "Entretien annuel — pelouse (14 passages) + 2 tailles de haies",
          waste: "Évacuation des déchets verts",
          weed: "Désherbage des massifs",
          fert: "Fertilisation / traitement anti-mousse",
          irrig: "Contrôle de l'arrosage automatique",
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
