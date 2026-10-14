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
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else {
    window.DEALZ_SECTORS = window.DEALZ_SECTORS || {};
    window.DEALZ_SECTORS[S.slug] = S;
  }
})();
