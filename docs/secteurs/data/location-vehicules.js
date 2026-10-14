/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "location-vehicules",
    icon: "🚙",
    needsAddress: false,
    colors: { main: "#1864ab", dark: "#124b82", light: "#d0ebff", accent: "#f76707", accentDark: "#d9480f", bg: "#f8fbff" },

    quote: {
      minimum: 59,
      questions: [
        { id: "vehicle", type: "single", options: [{ id: "city", day: 59 }, { id: "compact", day: 79 }, { id: "suv", day: 109 }, { id: "van", day: 119 }, { id: "minibus", day: 149 }] },
        { id: "duration", type: "single", options: [{ id: "d1", days: 1, disc: 0 }, { id: "d3", days: 3, disc: 0.05 }, { id: "w1", days: 7, disc: 0.15 }, { id: "w2", days: 14, disc: 0.25 }] },
        { id: "km", type: "single", options: [{ id: "k100", fee: 0 }, { id: "k250", fee: 12 }, { id: "kunl", fee: 25 }] },
        { id: "options", type: "multi", options: [{ id: "full" }, { id: "driver" }, { id: "seat" }, { id: "gps" }, { id: "winter" }] },
        { id: "pickup", type: "single", options: [{ id: "agency", fee: 0 }, { id: "delivery", fee: 80 }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var d = a.duration.days;
        items.push({
          label: a.duration.disc ? L("rental", { days: d, disc: Math.round(a.duration.disc * 100) }) : L("rental0", { days: d }),
          amount: H.round5(a.vehicle.day * d * (1 - a.duration.disc)),
        });
        if (a.km.fee) items.push({ label: L(a.km.id === "kunl" ? "kmUnl" : "km250", { days: d }), amount: a.km.fee * d });
        (a.options || []).forEach(function (o) {
          if (o.id === "full") items.push({ label: L("full", { days: d }), amount: 22 * d });
          if (o.id === "driver") items.push({ label: L("driver"), amount: 40 });
          if (o.id === "seat") items.push({ label: L("seat", { days: d }), amount: 8 * d });
          if (o.id === "gps") items.push({ label: L("gps", { days: d }), amount: 6 * d });
          if (o.id === "winter") items.push({ label: L("winter"), amount: 35 });
        });
        if (a.pickup.fee) items.push({ label: L("delivery"), amount: a.pickup.fee });
        return items;
      },
    },

    fr: {
      label: "Location de véhicules",
      forWho: "entreprises de location de véhicules",
      pitch: "Chiffrez véhicule, durée, kilométrage et assurance en quelques clics.",
      landing: {
        h1: ["VOUS LOUEZ.", "DEALZ CHIFFRE."],
        question: "Combien de réservations perdez-vous parce que le comparateur répond avant vous ?",
        text: "Le client veut un prix pour ce week-end, pas une demande de rappel. Dealz lui répond tout de suite, pose les bonnes questions (véhicule, durée, kilomètres, assurance), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour louer une compacte pendant une semaine, kilomètres illimités ?",
        values: [
          { icon: "📆", title: "Vos tarifs dégressifs appliqués seuls", text: "Un jour, un week-end, une semaine, deux semaines : vos remises de durée s'appliquent automatiquement." },
          { icon: "🛣️", title: "Kilométrage et assurance chiffrés", text: "Forfaits kilométriques et rachat de franchise proposés dès le premier devis." },
          { icon: "🎒", title: "Options qui font le panier moyen", text: "Conducteur supplémentaire, siège enfant, GPS, équipement hiver : chaque option est suggérée au bon moment." },
          { icon: "📍", title: "Agence ou livraison", text: "La remise à l'adresse du client est facturée selon vos règles." },
        ],
        step1: "Importez vos tarifs : prix par catégorie et par jour, remises de durée, forfaits kilométriques, assurances, options. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos catégories de véhicules, vos durées, vos kilométrages et vos options.",
        excel: { file: "tarifs-location.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Location compacte", "7 jours · remise 15 %", "CHF 470"], ["Kilomètres illimités", "7 jours", "CHF 175"], ["Assurance tous risques", "7 jours", "CHF 154"]] },
        chat: ["« Je cherche une voiture pour une semaine de vacances. »", "« Quelle catégorie souhaitez-vous, et combien de kilomètres prévoyez-vous ? »", "« Voulez-vous l'assurance tous risques avec franchise réduite ? »"],
        offer: { company: "AlpiRent Location", rows: [["Location compacte — 7 jours", 470], ["Kilomètres illimités", 175], ["Assurance tous risques", 154]] },
        roi: "Une seule location d'une semaine supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "AlpiRent",
        eyebrow: "Genève & Arc lémanique · Exemple fictif",
        hero: { h1: "La bonne voiture, au bon prix, tout de suite.", text: "Citadines, SUV, fourgons et minibus à la journée ou à la semaine — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.7★", lbl: "SATISFACTION CLIENT" }, { num: "9 800+", lbl: "LOCATIONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous louons",
        servicesSub: "Choisissez une catégorie, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚗", title: "Citadine", text: "Idéale pour la ville et les courts trajets.", tag: "dès CHF 59/jour" },
          { icon: "🚙", title: "Compacte / berline", text: "Confort et économie sur route.", tag: "dès CHF 79/jour" },
          { icon: "🚐", title: "SUV et monospace", text: "Espace pour la famille et les bagages.", tag: "dès CHF 109/jour" },
          { icon: "🚚", title: "Fourgon 12 m³", text: "Pour déménager ou transporter.", tag: "dès CHF 119/jour" },
          { icon: "🚌", title: "Minibus 9 places", text: "Pour les groupes et les événements.", tag: "dès CHF 149/jour" },
          { icon: "❄️", title: "Équipement hiver", text: "Pneus hiver et chaînes à neige.", tag: "CHF 35" },
        ],
        about: {
          title: "Une agence locale, une flotte récente",
          text: "AlpiRent Location met à disposition des véhicules récents aux particuliers et entreprises de l'Arc lémanique depuis 2007. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Flotte entretenue", "véhicules de moins de trois ans, contrôlés avant chaque départ."], ["Assurance claire", "franchise réduite disponible, sans surprise."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 11", email: "hello@alpirent.demo", zone: "Genève, Vaud, Valais", hours: "Lun–Dim, 7h–20h" },
        devisNote: "Répondez à quelques questions sur votre location — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre besoin de location…",
        pdfCompany: { name: "AlpiRent Location", address: "Route de Meyrin 120, 1215 Genève", phone: "022 000 00 11", email: "hello@alpirent.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre location, puis je vous établis un devis ferme tout de suite après.",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité. Caution et permis de conduire valable exigés au retrait. TVA suisse incluse le cas échéant.",
        q: {
          vehicle: { text: "Quel type de véhicule souhaitez-vous ?", short: "Véhicule", opts: { city: "Citadine (5 portes)", compact: "Compacte / berline", suv: "SUV / monospace", van: "Fourgon 12 m³", minibus: "Minibus 9 places" } },
          duration: { text: "Pour quelle durée ?", short: "Durée", opts: { d1: "1 jour", d3: "2 à 3 jours", w1: "1 semaine", w2: "2 semaines ou plus" } },
          km: { text: "Quel kilométrage prévoyez-vous ?", short: "Kilométrage", opts: { k100: "100 km par jour inclus", k250: "250 km par jour", kunl: "Kilomètres illimités" } },
          options: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { full: "Assurance tous risques (franchise réduite)", driver: "Conducteur supplémentaire", seat: "Siège enfant", gps: "GPS", winter: "Équipement hiver (chaînes)" } },
          pickup: { text: "Où récupérer le véhicule ?", short: "Remise", opts: { agency: "À l'agence", delivery: "Livraison et reprise à l'adresse" } },
          date: { text: "Quelle est la date de départ ?", short: "Départ" },
        },
        items: {
          rental: "Location — {days} jour(s), remise de durée {disc} %",
          rental0: "Location — {days} jour(s)",
          km250: "Forfait 250 km par jour ({days} j.)",
          kmUnl: "Kilomètres illimités ({days} j.)",
          full: "Assurance tous risques ({days} j.)",
          driver: "Conducteur supplémentaire",
          seat: "Siège enfant ({days} j.)",
          gps: "GPS ({days} j.)",
          winter: "Équipement hiver (chaînes)",
          delivery: "Livraison et reprise à l'adresse",
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
