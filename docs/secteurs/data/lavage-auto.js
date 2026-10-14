/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "lavage-auto",
    icon: "🚗",
    needsAddress: true,
    colors: { main: "#343a40", dark: "#212529", light: "#e9ecef", accent: "#f59f00", accentDark: "#e67700", bg: "#fafafa" },

    quote: {
      minimum: 40,
      questions: [
        { id: "vehicle", type: "single", options: [{ id: "city", k: 1 }, { id: "sedan", k: 1.15 }, { id: "suv", k: 1.35 }, { id: "van", k: 1.6 }, { id: "moto", k: 0.6 }] },
        { id: "pack", type: "single", options: [{ id: "ext", base: 45 }, { id: "full", base: 95 }, { id: "detail", base: 280 }, { id: "polish", base: 690 }] },
        { id: "state", type: "single", options: [{ id: "clean", k: 1 }, { id: "dirty", k: 1.15 }, { id: "filthy", k: 1.35 }] },
        { id: "extras", type: "multi", options: [{ id: "seats" }, { id: "leather" }, { id: "engine" }, { id: "ozone" }, { id: "wheels" }] },
        { id: "place", type: "single", options: [{ id: "shop", fee: 0 }, { id: "home", fee: 45 }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var vk = a.vehicle.k;
        var sk = a.pack.id === "polish" ? Math.min(a.state.k, 1.1) : a.state.k;
        items.push({ label: L("pack_" + a.pack.id), amount: H.round5(a.pack.base * vk * sk) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "seats") items.push({ label: L("seats"), amount: H.round5(90 * vk) });
          if (e.id === "leather") items.push({ label: L("leather"), amount: H.round5(70 * vk) });
          if (e.id === "engine") items.push({ label: L("engine"), amount: 60 });
          if (e.id === "ozone") items.push({ label: L("ozone"), amount: 80 });
          if (e.id === "wheels") items.push({ label: L("wheels"), amount: H.round5(70 * vk) });
        });
        if (a.place.fee) items.push({ label: L("travel"), amount: a.place.fee });
        return items;
      },
    },

    fr: {
      label: "Lavage automobile et detailing",
      forWho: "entreprises de lavage automobile et de detailing",
      pitch: "Chiffrez lavage, detailing et protection selon le véhicule et son état.",
      emailNoun: "le soin de votre véhicule",
      landing: {
        h1: ["VOUS BRILLEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de detailing perdez-vous quand vous avez les mains dans la mousse ?",
        text: "Le client veut savoir combien coûte un polish ou un nettoyage intérieur avant de réserver un créneau. Dealz lui répond à toute heure, pose les bonnes questions (véhicule, état, options), calcule votre prix selon vos tarifs et prépare son devis.",
        clientQ: "Combien pour un detailing complet sur un SUV très sale ?",
        values: [
          { icon: "🚙", title: "Un prix par type de véhicule", text: "Citadine, SUV, utilitaire : vos coefficients s'appliquent automatiquement." },
          { icon: "✨", title: "Des forfaits plus faciles à vendre", text: "Lavage, detailing, polish et céramique : le client voit ce que contient chaque forfait et choisit en connaissance de cause." },
          { icon: "🧽", title: "Options qui font le panier moyen", text: "Sièges, cuir, moteur, ozone, jantes : chaque option est proposée au bon moment." },
          { icon: "📍", title: "Atelier ou à domicile", text: "Le déplacement est facturé selon vos règles, sans calcul manuel." },
        ],
        step1: "Importez vos tarifs : forfaits, coefficients par véhicule, majoration de salissure, options, déplacement. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de véhicules, vos niveaux d'état, vos options et vos lieux d'intervention.",
        excel: { file: "tarifs-detailing.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Detailing complet", "SUV · très sale", "CHF 510"], ["Shampoing sièges", "SUV", "CHF 120"], ["Désodorisation ozone", "Forfait", "CHF 80"]] },
        chat: ["« Je voudrais un detailing complet pour mon SUV avant de le revendre. »", "« Dans quel état est-il : propre, sale ou très sale ? »", "« Souhaitez-vous le shampoing des sièges et l'ozone ? »"],
        offer: { company: "Brillance Auto Detailing", rows: [["Detailing complet (SUV)", 510], ["Shampoing sièges", 120], ["Désodorisation à l'ozone", 80]] },
        roi: "Un seul detailing complet supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Brillance Auto",
        eyebrow: "Genève & Genevois · Exemple fictif",
        hero: { h1: "Votre voiture, comme à la livraison.", text: "Lavage, detailing, polish et protection céramique à Genève — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "5 200+", lbl: "VÉHICULES TRAITÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous traitons",
        servicesSub: "Choisissez un forfait, ou décrivez simplement votre véhicule dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚿", title: "Lavage extérieur", text: "Pré-lavage, shampoing, séchage microfibre.", tag: "dès CHF 45" },
          { icon: "🧼", title: "Intérieur + extérieur", text: "Aspiration, plastiques, vitres, carrosserie.", tag: "dès CHF 95" },
          { icon: "✨", title: "Detailing complet", text: "Décontamination, cire, finitions détaillées.", tag: "dès CHF 280" },
          { icon: "💎", title: "Polish + céramique", text: "Correction des micro-rayures et protection longue durée.", tag: "dès CHF 690" },
          { icon: "🪑", title: "Sièges et cuir", text: "Shampoing, nourrissage et protection.", tag: "dès CHF 70" },
          { icon: "🌬️", title: "Ozone", text: "Désodorisation en profondeur de l'habitacle.", tag: "CHF 80" },
        ],
        about: {
          title: "Une équipe passionnée, un atelier propre",
          text: "Brillance Auto Detailing prend soin des véhicules de particuliers, de flottes et de concessionnaires genevois depuis 2015. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Produits professionnels", "shampoings pH neutre, cires et céramiques de qualité."], ["Véhicule assuré", "chaque véhicule confié est couvert pendant l'intervention."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 40", email: "hello@brillance-auto.demo", zone: "Genève et environs", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur votre véhicule — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre véhicule et votre besoin…",
        pdfCompany: { name: "Brillance Auto Detailing", address: "Rue des Vieux-Grenadiers 8, 1205 Genève", phone: "022 000 00 40", email: "hello@brillance-auto.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre véhicule, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Résultat dépendant de l'état initial de la peinture. TVA suisse incluse le cas échéant.",
        q: {
          vehicle: { text: "Quel type de véhicule ?", short: "Véhicule", opts: { city: "Citadine", sedan: "Berline / break", suv: "SUV / monospace", van: "Utilitaire / grand van", moto: "Moto" } },
          pack: { text: "Quel forfait vous intéresse ?", short: "Forfait", opts: { ext: "Lavage extérieur", full: "Lavage intérieur + extérieur", detail: "Detailing complet (décontamination + cire)", polish: "Polish + protection céramique" } },
          state: { text: "Dans quel état est le véhicule ?", short: "État", opts: { clean: "Plutôt propre", dirty: "Sale", filthy: "Très sale (boue, poils d'animaux…)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { seats: "Shampoing sièges et moquettes", leather: "Traitement du cuir", engine: "Nettoyage du compartiment moteur", ozone: "Désodorisation à l'ozone", wheels: "Rénovation détaillée des jantes" } },
          place: { text: "Où doit avoir lieu l'intervention ?", short: "Lieu", opts: { shop: "À l'atelier", home: "À domicile / sur votre lieu de travail" } },
          date: { text: "Pour quelle date souhaitez-vous un créneau ?", short: "Date souhaitée" },
        },
        items: {
          pack_ext: "Lavage extérieur",
          pack_full: "Lavage intérieur + extérieur",
          pack_detail: "Detailing complet (décontamination + cire)",
          pack_polish: "Polish carrosserie + protection céramique",
          seats: "Shampoing sièges et moquettes",
          leather: "Traitement du cuir",
          engine: "Nettoyage du compartiment moteur",
          ozone: "Désodorisation à l'ozone",
          wheels: "Rénovation détaillée des jantes",
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
