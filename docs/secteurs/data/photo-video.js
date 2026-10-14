/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "photo-video",
    icon: "📸",
    needsAddress: true,
    colors: { main: "#d6336c", dark: "#a61e4d", light: "#ffdeeb", accent: "#fd7e14", accentDark: "#e8590c", bg: "#fffafc" },

    quote: {
      minimum: 250,
      questions: [
        { id: "shoot", type: "single", options: [{ id: "wedding", rate: 190 }, { id: "portrait", rate: 150 }, { id: "corporate", rate: 170 }, { id: "realestate", rate: 120 }, { id: "product", rate: 140 }, { id: "video", rate: 220 }] },
        { id: "duration", type: "single", options: [{ id: "h2", h: 2 }, { id: "h4", h: 4 }, { id: "h8", h: 8 }] },
        { id: "extras", type: "multi", options: [{ id: "video" }, { id: "drone" }, { id: "album" }, { id: "second" }, { id: "licence" }] },
        { id: "place", type: "single", options: [{ id: "studio", fee: 0 }, { id: "local", fee: 80 }, { id: "far", fee: 220 }] },
        { id: "speed", type: "single", options: [{ id: "std", k: 0 }, { id: "fast", k: 0.3 }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var h = a.duration.h;
        var base = H.round5(a.shoot.rate * h);
        items.push({ label: L("shoot_" + a.shoot.id, { h: h }), amount: base });
        items.push({ label: L("retouch"), amount: H.round5(base * 0.25) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "video") items.push({ label: L("video"), amount: 690 });
          if (e.id === "drone") items.push({ label: L("drone"), amount: 380 });
          if (e.id === "album") items.push({ label: L("album"), amount: 290 });
          if (e.id === "second") items.push({ label: L("second", { h: h }), amount: H.round5(70 * h) });
          if (e.id === "licence") items.push({ label: L("licence"), amount: 240 });
        });
        if (a.place.fee) items.push({ label: L("travel"), amount: a.place.fee });
        if (a.speed.k) items.push({ label: L("fast"), amount: H.round5(base * a.speed.k) });
        return items;
      },
    },

    fr: {
      label: "Photographie et vidéographie",
      forWho: "photographes et vidéastes",
      pitch: "Chiffrez séance, durée, livrables et déplacement avant le premier appel.",
      emailNoun: "votre séance",
      landing: {
        h1: ["VOUS CAPTUREZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de séance perdez-vous parce que vous étiez en tournage ?",
        text: "Un couple compare trois photographes un dimanche soir et écrit au premier qui répond avec un prix. Dealz répond tout de suite, pose les bonnes questions (type de séance, durée, livrables, lieu), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour un mariage en journée avec vidéo et drone ?",
        values: [
          { icon: "💍", title: "Un prix avant l'appel de découverte", text: "Les clients sérieux arrivent avec une demande déjà chiffrée, vos rendez-vous sont mieux qualifiés." },
          { icon: "🎞️", title: "Livrables et options clairs", text: "Vidéo, drone, album, second photographe : chaque option est expliquée et ajoutée au devis en un clic." },
          { icon: "📍", title: "Déplacements intégrés", text: "Studio, canton ou hors canton : vos frais de déplacement s'appliquent automatiquement." },
          { icon: "⏳", title: "Délais de livraison valorisés", text: "Livraison standard ou express : la rapidité devient une option facturée, pas une faveur." },
        ],
        step1: "Importez vos tarifs : taux par type de séance, durées, livrables, déplacements, express. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos séances, vos durées, vos livrables et vos règles de déplacement.",
        excel: { file: "tarifs-photo-video.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Mariage", "Journée (8 h)", "CHF 1 520"], ["Vidéo highlights", "2–3 min", "CHF 690"], ["Drone", "Forfait", "CHF 380"]] },
        chat: ["« Nous nous marions en septembre et cherchons un photographe. »", "« Souhaitez-vous une demi-journée ou une journée complète ? »", "« Une vidéo highlights et des images de drone vous intéressent-elles ? »"],
        offer: { company: "Studio Lumière Visuel", rows: [["Mariage — journée (8 h)", 1520], ["Vidéo highlights (2–3 min)", 690], ["Prises de vues par drone", 380]] },
        roi: "Une seule séance supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Studio Lumière",
        eyebrow: "Lausanne & Vaud · Exemple fictif",
        hero: { h1: "Vos plus beaux moments, bien racontés.", text: "Mariages, portraits, événements, immobilier et vidéo en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "5.0★", lbl: "SATISFACTION CLIENT" }, { num: "420+", lbl: "SÉANCES RÉALISÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous photographions",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "💍", title: "Mariage", text: "Reportage photo et vidéo, de la préparation à la soirée.", tag: "dès CHF 190/h" },
          { icon: "👨‍👩‍👧", title: "Portrait et famille", text: "En studio ou en extérieur.", tag: "dès CHF 150/h" },
          { icon: "🏢", title: "Entreprise", text: "Événements, équipes et reportages corporate.", tag: "dès CHF 170/h" },
          { icon: "🏠", title: "Immobilier", text: "Photos et visites pour vos annonces.", tag: "dès CHF 120/h" },
          { icon: "📦", title: "Produit", text: "Packshots et mises en scène pour e-commerce.", tag: "dès CHF 140/h" },
          { icon: "🎬", title: "Vidéo promotionnelle", text: "Tournage, montage et étalonnage.", tag: "dès CHF 220/h" },
        ],
        about: {
          title: "Un regard, une équipe, des livrables soignés",
          text: "Studio Lumière Visuel photographie et filme particuliers et entreprises en Suisse romande depuis 2013. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Retouche incluse", "chaque image sélectionnée est retouchée à la main."], ["Galerie privée", "livraison en ligne, téléchargement en haute définition."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 70", email: "hello@studio-lumiere.demo", zone: "Vaud, Genève, Valais, Fribourg", hours: "Lun–Sam, sur rendez-vous" },
        devisNote: "Répondez à quelques questions sur votre projet — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet de séance…",
        pdfCompany: { name: "Studio Lumière Visuel", address: "Rue Saint-Laurent 20, 1003 Lausanne", phone: "021 000 00 70", email: "hello@studio-lumiere.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre projet, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Lieu de la séance (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité à la date indiquée. Acompte de 30 % à la réservation. TVA suisse incluse le cas échéant.",
        q: {
          shoot: { text: "Quel type de séance souhaitez-vous ?", short: "Séance", opts: { wedding: "Mariage", portrait: "Portraits / famille", corporate: "Événement ou reportage d'entreprise", realestate: "Immobilier", product: "Produits / e-commerce", video: "Vidéo promotionnelle" } },
          duration: { text: "Quelle durée de prestation prévoyez-vous ?", short: "Durée", opts: { h2: "2 heures", h4: "Demi-journée (4 heures)", h8: "Journée (8 heures)" } },
          extras: { text: "Souhaitez-vous des livrables en plus ?", short: "Options", none: "Aucune option", opts: { video: "Vidéo highlights (2–3 min)", drone: "Prises de vues par drone", album: "Album photo (30 pages)", second: "Second photographe", licence: "Licence d'usage commercial étendue" } },
          place: { text: "Où a lieu la séance ?", short: "Lieu", opts: { studio: "Dans notre studio", local: "Chez vous, dans le canton", far: "Hors canton (déplacement)" } },
          speed: { text: "Quel délai de livraison souhaitez-vous ?", short: "Livraison", opts: { std: "Standard (3 semaines)", fast: "Express (5 jours)" } },
          date: { text: "Quelle est la date de la séance ?", short: "Date de la séance" },
        },
        items: {
          shoot_wedding: "Reportage de mariage ({h} h)",
          shoot_portrait: "Séance portraits / famille ({h} h)",
          shoot_corporate: "Reportage d'entreprise ({h} h)",
          shoot_realestate: "Photographie immobilière ({h} h)",
          shoot_product: "Photographie produit ({h} h)",
          shoot_video: "Tournage vidéo promotionnelle ({h} h)",
          retouch: "Sélection et retouche des images",
          video: "Vidéo highlights (2-3 min)",
          drone: "Prises de vues par drone",
          album: "Album photo (30 pages)",
          second: "Second photographe ({h} h)",
          licence: "Licence d'usage commercial étendue",
          travel: "Frais de déplacement",
          fast: "Livraison express (5 jours)",
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
