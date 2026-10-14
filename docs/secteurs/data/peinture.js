/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "peinture",
    icon: "🎨",
    needsAddress: true,
    colors: { main: "#7048e8", dark: "#5f3dc4", light: "#e5dbff", accent: "#f59f00", accentDark: "#e67700", bg: "#fcfbff" },

    quote: {
      minimum: 250,
      questions: [
        { id: "work", type: "single", options: [{ id: "interior" }, { id: "facade" }, { id: "wood" }, { id: "reno" }] },
        {
          id: "rooms", type: "single",
          when: function (a) { return a.work.id === "interior" || a.work.id === "reno"; },
          options: [{ id: "r1", walls: 55, n: 1 }, { id: "r2", walls: 95, n: 2 }, { id: "r3", walls: 140, n: 3 }, { id: "r4", walls: 190, n: 4 }, { id: "r5", walls: 260, n: 5 }],
        },
        {
          id: "fsurf", type: "single",
          when: function (a) { return a.work.id === "facade"; },
          options: [{ id: "f1", m2: 80, scaffold: 380 }, { id: "f2", m2: 150, scaffold: 750 }, { id: "f3", m2: 300, scaffold: 1400 }, { id: "f4", m2: 500, scaffold: 2400 }],
        },
        {
          id: "woodn", type: "single",
          when: function (a) { return a.work.id === "wood"; },
          options: [{ id: "w1", n: 2 }, { id: "w2", n: 6 }, { id: "w3", n: 12 }, { id: "w4", n: 20 }],
        },
        {
          id: "state", type: "single",
          when: function (a) { return a.work.id !== "wood"; },
          options: [{ id: "good", prep: 0 }, { id: "cracks", prep: 4.5 }, { id: "old", prep: 11 }],
        },
        {
          id: "ceiling", type: "single",
          when: function (a) { return a.work.id === "interior" || a.work.id === "reno"; },
          options: [{ id: "std", k: 1 }, { id: "high", k: 1.15 }],
        },
        {
          id: "furnished", type: "single",
          when: function (a) { return a.work.id === "interior" || a.work.id === "reno"; },
          options: [{ id: "empty", prot: 0 }, { id: "furnished", prot: 1 }],
        },
        { id: "extras", type: "multi", options: [{ id: "rad" }, { id: "doors" }, { id: "shutters" }, { id: "colour" }] },
        { id: "date", type: "date", minDays: 5 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var w = a.work.id;
        var base = 0;
        if (w === "interior" || w === "reno") {
          var walls = a.rooms.walls, ceilArea = Math.round(walls * 0.35), k = a.ceiling.k;
          items.push({ label: L("walls", { m2: walls }), amount: H.round5(walls * 24 * k) });
          items.push({ label: L("ceilings", { m2: ceilArea }), amount: H.round5(ceilArea * 19 * k) });
          if (a.state.prep) items.push({ label: L(a.state.id === "old" ? "prepOld" : "prepCracks"), amount: H.round5(walls * a.state.prep) });
          if (a.furnished.prot) items.push({ label: L("protect"), amount: H.round5(a.rooms.n * 40 + 60) });
          if (w === "reno") items.push({ label: L("finish"), amount: H.round5(walls * 4.5 + 180) });
          base = walls;
        } else if (w === "facade") {
          items.push({ label: L("facade", { m2: a.fsurf.m2 }), amount: H.round5(a.fsurf.m2 * 58) });
          items.push({ label: L("scaffold"), amount: a.fsurf.scaffold });
          if (a.state.prep) items.push({ label: L(a.state.id === "old" ? "prepOld" : "prepCracks"), amount: H.round5(a.fsurf.m2 * a.state.prep) });
          base = a.fsurf.m2;
        } else {
          items.push({ label: L("wood", { n: a.woodn.n }), amount: H.round5(a.woodn.n * 85) });
          base = a.woodn.n * 3;
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "rad") items.push({ label: L("rad"), amount: 160 });
          if (e.id === "doors") items.push({ label: L("doors"), amount: 240 });
          if (e.id === "shutters") items.push({ label: L("shutters"), amount: 320 });
          if (e.id === "colour") items.push({ label: L("colour"), amount: H.round5(base * 3.2 + 90) });
        });
        return items;
      },
    },

    fr: {
      label: "Peinture et rénovation",
      forWho: "entreprises de peinture et de rénovation",
      pitch: "Chiffrez surfaces, préparation et finitions sans visite préalable.",
      emailNoun: "vos travaux de peinture",
      landing: {
        h1: ["VOUS PEIGNEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de devis peinture perdez-vous parce que vous êtes sur un chantier ?",
        text: "Les clients veulent un ordre de grandeur avant de faire venir quelqu'un. Dealz leur répond à toute heure, pose les bonnes questions (surfaces, état des murs, hauteur sous plafond, meubles), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour repeindre un 3 pièces, murs et plafonds ?",
        values: [
          { icon: "📏", title: "Des estimations fiables avant visite", text: "Nombre de pièces, état des murs, hauteur : Dealz donne un prix ferme sur les cas standards, la visite sert aux cas complexes." },
          { icon: "🧰", title: "La préparation enfin chiffrée", text: "Rebouchage, décapage de papier peint, protection des meubles : chaque poste de préparation est facturé selon vos règles." },
          { icon: "🏠", title: "Intérieur, façade, boiseries", text: "Un seul assistant pour tous vos types de travaux, avec les questions adaptées à chacun." },
          { icon: "📅", title: "Planning mieux rempli", text: "Les dates souhaitées arrivent déjà qualifiées, pour organiser vos équipes en amont." },
        ],
        step1: "Importez vos tarifs : prix au m², préparation, hauteur sous plafond, échafaudage, boiseries. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos niveaux de préparation, vos majorations et vos options.",
        excel: { file: "tarifs-peinture.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Peinture murs", "140 m² · 2 couches", "CHF 3 360"], ["Peinture plafonds", "49 m²", "CHF 930"], ["Rebouchage fissures", "140 m²", "CHF 630"]] },
        chat: ["« Je veux repeindre mon 3 pièces avant d'emménager. »", "« Les murs sont-ils en bon état ou faut-il reboucher ? »", "« Le logement est-il vide ou meublé ? »"],
        offer: { company: "Atelier Couleur Rénovation SA", rows: [["Peinture des murs (140 m²)", 3360], ["Peinture des plafonds (49 m²)", 930], ["Rebouchage des fissures", 630]] },
        roi: "Un seul chantier supplémentaire par trimestre peut déjà payer votre abonnement à l'année.",
      },
      demo: {
        brand: "Atelier Couleur",
        eyebrow: "Fribourg & Broye · Exemple fictif",
        hero: { h1: "Des murs neufs, sans la poussière ni les surprises.", text: "Peinture intérieure, façades, boiseries et rénovation de pièces en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "1 700+", lbl: "CHANTIERS RÉALISÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous peignons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🏠", title: "Peinture intérieure", text: "Murs et plafonds, deux couches, fournitures comprises.", tag: "dès CHF 24/m²" },
          { icon: "🏢", title: "Façades", text: "Nettoyage, préparation et peinture, échafaudage inclus.", tag: "dès CHF 58/m²" },
          { icon: "🚪", title: "Boiseries et portes", text: "Ponçage et deux couches de finition.", tag: "dès CHF 85/pièce" },
          { icon: "🧱", title: "Préparation des supports", text: "Rebouchage, décapage, ponçage.", tag: "dès CHF 4.50/m²" },
          { icon: "🛠️", title: "Rénovation de pièces", text: "Préparation, peinture et finitions clés en main.", tag: "sur devis" },
          { icon: "🪟", title: "Volets et radiateurs", text: "Remise en peinture soignée.", tag: "dès CHF 160" },
        ],
        about: {
          title: "Des peintres qui soignent les détails",
          text: "Atelier Couleur Rénovation intervient chez les particuliers, régies et entreprises en Suisse romande depuis 2005. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Chantier protégé", "sols et meubles couverts, nettoyage en fin de journée."], ["Peintures de qualité", "produits suisses, faibles émissions."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "026 000 00 20", email: "hello@atelier-couleur.demo", zone: "Fribourg, Vaud, Neuchâtel", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur votre projet — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet de peinture…",
        pdfCompany: { name: "Atelier Couleur Rénovation SA", address: "Rue de Romont 12, 1700 Fribourg", phone: "026 000 00 20", email: "hello@atelier-couleur.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre projet, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du chantier (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, fournitures comprises. Travaux supplémentaires éventuels facturés sur accord préalable. TVA suisse incluse le cas échéant.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { interior: "Peinture intérieure (murs et plafonds)", facade: "Peinture de façade", wood: "Boiseries, portes et fenêtres", reno: "Rénovation de pièces (préparation + peinture + finitions)" } },
          rooms: { text: "Combien de pièces sont concernées ?", short: "Pièces", opts: { r1: "1 pièce / studio", r2: "2 pièces", r3: "3 pièces", r4: "4 pièces", r5: "5 pièces et plus" } },
          fsurf: { text: "Quelle est la surface approximative de la façade ?", short: "Façade", opts: { f1: "Petite façade (moins de 100 m²)", f2: "Maison individuelle (100–200 m²)", f3: "Grande façade (200–400 m²)", f4: "Immeuble (400 m² et plus)" } },
          woodn: { text: "Combien d'éléments à peindre (portes, fenêtres, volets…) ?", short: "Éléments", opts: { w1: "1 à 3 éléments", w2: "4 à 8 éléments", w3: "9 à 15 éléments", w4: "16 éléments et plus" } },
          state: { text: "Quel est l'état des supports ?", short: "État des murs", opts: { good: "Bon état", cracks: "Fissures / rebouchage à prévoir", old: "Ancien papier peint ou peinture écaillée" } },
          ceiling: { text: "Quelle est la hauteur sous plafond ?", short: "Hauteur", opts: { std: "Standard (2.6 m ou moins)", high: "Haute (plus de 2.6 m)" } },
          furnished: { text: "Le logement sera-t-il vide pendant les travaux ?", short: "Logement", opts: { empty: "Vide", furnished: "Meublé — protection à prévoir" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { rad: "Peinture des radiateurs", doors: "Portes et boiseries", shutters: "Volets", colour: "Teintes soutenues (couches supplémentaires)" } },
          date: { text: "Pour quelle date souhaitez-vous démarrer ?", short: "Date souhaitée" },
        },
        items: {
          walls: "Peinture des murs ({m2} m², 2 couches)",
          ceilings: "Peinture des plafonds ({m2} m²)",
          prepCracks: "Préparation — rebouchage et ponçage",
          prepOld: "Préparation — décapage ancien revêtement",
          protect: "Protection du mobilier et des sols",
          finish: "Finitions et remise en état (rénovation)",
          facade: "Peinture de façade ({m2} m²)",
          scaffold: "Échafaudage et sécurisation",
          wood: "Boiseries et ouvrants ({n} éléments)",
          rad: "Peinture des radiateurs",
          doors: "Portes et boiseries",
          shutters: "Volets",
          colour: "Supplément teintes soutenues",
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
