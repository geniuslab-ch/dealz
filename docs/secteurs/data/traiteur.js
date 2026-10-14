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
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else {
    window.DEALZ_SECTORS = window.DEALZ_SECTORS || {};
    window.DEALZ_SECTORS[S.slug] = S;
  }
})();
