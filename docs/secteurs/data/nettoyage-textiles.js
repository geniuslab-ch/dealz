/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "nettoyage-textiles",
    icon: "🛋️",
    needsAddress: true,
    colors: { main: "#0891b2", dark: "#0e7490", light: "#cffafe", accent: "#ec4899", accentDark: "#db2777", bg: "#fafeff" },

    quote: {
      minimum: 90,
      questions: [
        { id: "scope", type: "multi", options: [{ id: "sofa" }, { id: "rug" }, { id: "mattress" }] },
        {
          id: "sofa", type: "single",
          when: function (a) { return a.scope.some(function (o) { return o.id === "sofa"; }); },
          options: [{ id: "s2", price: 95 }, { id: "s3", price: 130 }, { id: "corner", price: 185 }],
        },
        {
          id: "rug", type: "single",
          when: function (a) { return a.scope.some(function (o) { return o.id === "rug"; }); },
          options: [{ id: "small", price: 45 }, { id: "medium", price: 95 }, { id: "large", price: 160 }, { id: "several", price: 260 }],
        },
        {
          id: "mattress", type: "single",
          when: function (a) { return a.scope.some(function (o) { return o.id === "mattress"; }); },
          options: [{ id: "one", price: 70 }, { id: "double", price: 95 }, { id: "two", price: 140 }, { id: "many", price: 195 }],
        },
        { id: "stain", type: "single", options: [{ id: "normal", k: 1 }, { id: "stains", k: 1.25 }, { id: "pets", k: 1.4 }] },
        { id: "place", type: "single", options: [{ id: "home", fee: 45 }, { id: "shop", fee: 0 }] },
        { id: "protect", type: "multi", options: [{ id: "guard" }, { id: "mites" }, { id: "deodor" }] },
        { id: "date", type: "date", minDays: 2 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var k = a.stain.k;
        var has = function (id) { return a.scope.some(function (o) { return o.id === id; }); };
        if (has("sofa")) items.push({ label: L("sofa_" + a.sofa.id), amount: H.round5(a.sofa.price * k) });
        if (has("rug")) items.push({ label: L("rug_" + a.rug.id), amount: H.round5(a.rug.price * k) });
        if (has("mattress")) items.push({ label: L("mattress_" + a.mattress.id), amount: H.round5(a.mattress.price * k) });
        if (!items.length) items.push({ label: L("diag"), amount: 60 });
        var sub = items.reduce(function (s, i) { return s + i.amount; }, 0);
        (a.protect || []).forEach(function (p) {
          if (p.id === "guard") items.push({ label: L("guard"), amount: H.round5(sub * 0.18 + 15) });
          if (p.id === "mites" && has("mattress")) items.push({ label: L("mites"), amount: 45 });
          if (p.id === "deodor") items.push({ label: L("deodor"), amount: 35 });
        });
        if (a.place.fee) items.push({ label: L("travel"), amount: a.place.fee });
        return items;
      },
    },

    fr: {
      label: "Nettoyage de canapés, tapis et matelas",
      forWho: "entreprises de nettoyage de canapés, tapis et matelas",
      pitch: "Chiffrez canapés, tapis et matelas d'après leur taille et leur état.",
      emailNoun: "le nettoyage de vos textiles",
      landing: {
        h1: ["VOUS DÉTACHEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de nettoyage de canapé ou de matelas perdez-vous le soir ?",
        text: "Une tache sur le canapé, un matelas à rafraîchir : le client veut un prix tout de suite. Dealz lui répond à toute heure, pose les bonnes questions (type de textile, taille, taches, animaux), calcule votre prix selon vos tarifs et prépare son devis.",
        clientQ: "Combien pour nettoyer un canapé d'angle et un matelas double ?",
        values: [
          { icon: "🛋️", title: "Un prix par pièce, sans photo à échanger", text: "Type, taille et niveau de salissure suffisent pour chiffrer les cas courants." },
          { icon: "🐾", title: "Les taches et les animaux pris en compte", text: "Taches tenaces, odeurs d'animaux : vos majorations s'appliquent automatiquement." },
          { icon: "🚐", title: "Atelier ou domicile", text: "Dealz propose le bon mode d'intervention et facture le déplacement selon vos règles." },
          { icon: "✨", title: "Traitements en plus, faciles à vendre", text: "Anti-taches, anti-acariens, désodorisation : chaque option s'ajoute au devis en un clic." },
        ],
        step1: "Importez vos tarifs : prix par type de canapé, tapis, matelas, majorations taches et animaux, déplacement, traitements.",
        step2: "Le moteur comprend vos tailles, vos niveaux de salissure, vos lieux d'intervention et vos options.",
        excel: { file: "tarifs-textiles.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Canapé d'angle", "5 places et plus", "CHF 185"], ["Matelas double", "Acariens inclus", "CHF 95"], ["Déplacement", "À domicile", "CHF 45"]] },
        chat: ["« Je voudrais faire nettoyer mon canapé d'angle et un matelas. »", "« Y a-t-il des taches tenaces ou des traces d'animaux ? »", "« Intervenez-vous à domicile ou déposez-vous à l'atelier ? »"],
        offer: { company: "FraîcheurTex Sàrl", rows: [["Canapé d'angle", 185], ["Matelas double", 95], ["Déplacement à domicile", 45]] },
        roi: "Un seul canapé supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "FraîcheurTex",
        eyebrow: "Nyon & La Côte · Exemple fictif",
        hero: { h1: "Canapés, tapis et matelas comme neufs.", text: "Nettoyage en profondeur à domicile ou à l'atelier, sur La Côte et dans le Grand Genève — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "6 400+", lbl: "TEXTILES TRAITÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous nettoyons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🛋️", title: "Canapés", text: "Tissu, microfibre, cuir : nettoyage en profondeur.", tag: "dès CHF 95" },
          { icon: "🧶", title: "Tapis", text: "Nettoyage à domicile ou à l'atelier.", tag: "dès CHF 45" },
          { icon: "🛏️", title: "Matelas", text: "Aspiration, injection-extraction, séchage.", tag: "dès CHF 70" },
          { icon: "🐕", title: "Odeurs d'animaux", text: "Traitement ciblé des traces et des odeurs.", tag: "+40 %" },
          { icon: "🛡️", title: "Anti-taches", text: "Protection durable après nettoyage.", tag: "dès CHF 15" },
          { icon: "🚐", title: "Service à domicile", text: "Nous venons chez vous avec tout le matériel.", tag: "CHF 45" },
        ],
        about: {
          title: "Des spécialistes du textile, pas des généralistes",
          text: "FraîcheurTex nettoie les textiles d'ameublement des particuliers et des professionnels de La Côte depuis 2016. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Machines professionnelles", "injection-extraction et séchage rapide."], ["Produits adaptés", "sans danger pour les enfants et les animaux."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 30", email: "hello@fraicheurtex.demo", zone: "La Côte, Grand Genève", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur vos textiles — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez ce que vous souhaitez nettoyer…",
        pdfCompany: { name: "FraîcheurTex Sàrl", address: "Rue de la Gare 22, 1260 Nyon", phone: "022 000 00 30", email: "hello@fraicheurtex.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos textiles, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse d'intervention (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Résultat dépendant de la nature des taches et des fibres. TVA suisse incluse le cas échéant.",
        q: {
          scope: { text: "Que souhaitez-vous faire nettoyer ?", short: "Textiles", none: "Je ne sais pas encore", opts: { sofa: "Canapé", rug: "Tapis", mattress: "Matelas" } },
          sofa: { text: "Quelle taille de canapé ?", short: "Canapé", opts: { s2: "2 places", s3: "3 places", corner: "Angle ou 5 places et plus" } },
          rug: { text: "Quel tapis souhaitez-vous nettoyer ?", short: "Tapis", opts: { small: "1 petit tapis (moins de 2 m²)", medium: "1 tapis moyen (2 à 6 m²)", large: "1 grand tapis (plus de 6 m²)", several: "Plusieurs tapis" } },
          mattress: { text: "Combien de matelas ?", short: "Matelas", opts: { one: "1 matelas (1 place)", double: "1 matelas double", two: "2 matelas", many: "3 matelas ou plus" } },
          stain: { text: "Dans quel état sont les textiles ?", short: "État", opts: { normal: "Entretien courant", stains: "Taches tenaces", pets: "Odeurs ou traces d'animaux" } },
          place: { text: "Où doit avoir lieu le nettoyage ?", short: "Lieu", opts: { home: "À domicile (nous venons chez vous)", shop: "Dépôt à l'atelier" } },
          protect: { text: "Souhaitez-vous des traitements en plus ?", short: "Traitements", none: "Aucun traitement", opts: { guard: "Protection anti-taches", mites: "Traitement anti-acariens (matelas)", deodor: "Désodorisation" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          sofa_s2: "Nettoyage canapé 2 places",
          sofa_s3: "Nettoyage canapé 3 places",
          sofa_corner: "Nettoyage canapé d'angle / 5 places et plus",
          rug_small: "Nettoyage petit tapis",
          rug_medium: "Nettoyage tapis moyen",
          rug_large: "Nettoyage grand tapis",
          rug_several: "Nettoyage de plusieurs tapis",
          mattress_one: "Nettoyage matelas (1 place)",
          mattress_double: "Nettoyage matelas double",
          mattress_two: "Nettoyage de 2 matelas",
          mattress_many: "Nettoyage de 3 matelas ou plus",
          diag: "Forfait diagnostic à domicile",
          guard: "Protection anti-taches",
          mites: "Traitement anti-acariens",
          deodor: "Désodorisation",
          travel: "Déplacement à domicile",
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
