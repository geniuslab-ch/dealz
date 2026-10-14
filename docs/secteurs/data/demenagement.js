/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "demenagement",
    icon: "🚚",
    needsAddress: true,
    colors: { main: "#2563eb", dark: "#1d4ed8", light: "#dbeafe", accent: "#f97316", accentDark: "#ea580c", bg: "#fbfdff" },

    // ---- language-neutral quote logic ----
    quote: {
      minimum: 180,
      questions: [
        { id: "service", type: "single", options: [{ id: "move" }, { id: "clear" }, { id: "both" }] },
        { id: "size", type: "single", options: [{ id: "s1", vol: 14 }, { id: "s3", vol: 26 }, { id: "s4", vol: 38 }, { id: "s5", vol: 58 }] },
        { id: "floors", type: "single", options: [{ id: "easy", k: 0 }, { id: "mid", k: 3.5 }, { id: "high", k: 7 }] },
        {
          id: "distance", type: "single",
          when: function (a) { return a.service.id !== "clear"; },
          options: [{ id: "local", km: "< 10", fee: 0 }, { id: "canton", km: "10–50", fee: 140 }, { id: "inter", km: "50–150", fee: 360 }, { id: "long", km: "150+", fee: 780 }],
        },
        {
          id: "extras", type: "multi",
          when: function (a) { return a.service.id !== "clear"; },
          options: [{ id: "pack" }, { id: "furn" }, { id: "heavy" }, { id: "store" }],
        },
        { id: "date", type: "date", minDays: 3 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var svc = a.service.id;
        var vol = a.size.vol;
        if (svc !== "clear") {
          var crew = H.clamp(Math.ceil(vol / 14) + 1, 2, 5);
          items.push({ label: L("move", { crew: crew, vol: vol }), amount: H.round5(320 + vol * 17) });
          if (a.floors.k) items.push({ label: L("access"), amount: H.round5(a.floors.k * vol) });
          if (a.distance.fee) items.push({ label: L("distance", { km: a.distance.km }), amount: a.distance.fee });
          (a.extras || []).forEach(function (e) {
            if (e.id === "pack") items.push({ label: L("pack"), amount: H.round5(vol * 11) });
            if (e.id === "furn") items.push({ label: L("furn"), amount: H.round5(vol * 6 + 60) });
            if (e.id === "heavy") items.push({ label: L("heavy"), amount: 280 });
            if (e.id === "store") items.push({ label: L("store"), amount: 190 });
          });
        }
        if (svc !== "move") {
          var cv = svc === "clear" ? vol : Math.round(vol * 0.35);
          items.push({ label: L("clear", { vol: cv }), amount: H.round5(cv * 42) });
          items.push({ label: L("disposal"), amount: H.round5(cv * 9 + 60) });
          if (svc === "clear" && a.floors.k) items.push({ label: L("access"), amount: H.round5(a.floors.k * vol * 0.8) });
        }
        return items;
      },
    },

    // ---- French texts ----
    fr: {
      label: "Déménagement et débarras",
      forWho: "entreprises de déménagement et de débarras",
      pitch: "Chiffrez volume, étages et distance sans visite préalable.",
      landing: {
        h1: ["VOUS DÉMÉNAGEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de déménagement perdez-vous quand vos équipes sont sur la route ?",
        text: "Vos clients demandent un prix à toute heure — le soir, le week-end, depuis leur canapé. Dealz leur répond, pose les bonnes questions (volume, étages, ascenseur, distance), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien coûte un déménagement 3 pièces de Lausanne à Genève ?",
        values: [
          { icon: "📦", title: "Des devis sans visite préalable", text: "Volume, étages, ascenseur, distance : Dealz collecte l'essentiel et chiffre les cas standards sans que vous passiez sur place." },
          { icon: "📞", title: "Moins d'appels « juste pour un prix »", text: "Vos équipes restent sur le terrain — plus besoin de décrocher pour chaque demande d'estimation." },
          { icon: "🗓️", title: "Des dates qualifiées d'emblée", text: "La date souhaitée et les contraintes d'accès arrivent déjà renseignées, pour planifier vos camions plus vite." },
          { icon: "🗑️", title: "Déménagement et débarras, un seul devis", text: "Évacuation, déchetterie, démontage, emballage : chaque option est chiffrée selon vos propres règles." },
        ],
        step1: "Importez vos tarifs : forfait camion + équipe, supplément étages, distances, emballage, débarras. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos volumes, vos types d'accès, vos zones de distance et vos options.",
        excel: { file: "tarifs-demenagement.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Déménagement 3 pièces", "26 m³ · 3 déménageurs", "CHF 760"], ["Portage sans ascenseur", "1–2 étages", "CHF 90"], ["Emballage + cartons", "26 m³", "CHF 285"]] },
        chat: ["« Je déménage mon 3 pièces de Lausanne à Nyon le mois prochain. »", "« Quel est l'accès : ascenseur ou étages à pied ? »", "« Souhaitez-vous l'emballage et le démontage des meubles ? »"],
        offer: { company: "Léman Déménagements SA", rows: [["Déménagement 3 pièces", 760], ["Portage 1–2 étages", 90], ["Emballage + cartons", 285]] },
        roi: "Un seul déménagement supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Léman Déménagements",
        eyebrow: "Lausanne & Romandie · Exemple fictif",
        hero: { h1: "Votre déménagement, sans le stress.", text: "Déménagement résidentiel, débarras et garde-meubles en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "3 100+", lbl: "DÉMÉNAGEMENTS RÉALISÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous déménageons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚚", title: "Déménagement résidentiel", text: "Équipe et camion, de l'appartement à la villa.", tag: "dès CHF 480" },
          { icon: "📦", title: "Emballage", text: "Cartons fournis et mise en cartons soignée.", tag: "dès CHF 150" },
          { icon: "🪑", title: "Démontage / remontage", text: "Meubles démontés puis remontés à l'arrivée.", tag: "dès CHF 120" },
          { icon: "🗑️", title: "Débarras", text: "Évacuation, tri et déchetterie.", tag: "dès CHF 350" },
          { icon: "🎹", title: "Objets lourds", text: "Piano, coffre-fort, machines.", tag: "dès CHF 280" },
          { icon: "🏬", title: "Garde-meubles", text: "Stockage sécurisé, au mois.", tag: "CHF 190/mois" },
        ],
        about: {
          title: "Une équipe d'ici, rodée au terrain",
          text: "Léman Déménagements accompagne particuliers et entreprises en Suisse romande depuis 2012. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Équipes formées et assurées", "chaque déménageur est contrôlé et couvert."], ["Protections incluses", "sangles, couvertures et protections de sol."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 00", email: "hello@leman-demenagements.demo", zone: "Vaud, Genève, Valais", hours: "Lun–Sam, 7h–18h" },
        devisNote: "Répondez à quelques questions sur votre déménagement — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre déménagement…",
        pdfCompany: { name: "Léman Déménagements SA", address: "Avenue de Cour 18, 1007 Lausanne", phone: "021 000 00 00", email: "hello@leman-demenagements.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre déménagement, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de départ (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve d'un accès conforme aux indications. TVA suisse incluse le cas échéant.",
        q: {
          service: { text: "Quel service souhaitez-vous ?", short: "Service", opts: { move: "Déménagement", clear: "Débarras seul", both: "Déménagement + débarras" } },
          size: { text: "Quelle est la taille du logement concerné ?", short: "Logement", opts: { s1: "Studio / 1–2 pièces", s3: "3 pièces", s4: "4 pièces", s5: "5 pièces et plus / maison" } },
          floors: { text: "Comment se présente l'accès au logement ?", short: "Accès", opts: { easy: "Rez-de-chaussée ou ascenseur", mid: "1–2 étages sans ascenseur", high: "3 étages ou plus sans ascenseur" } },
          distance: { text: "Quelle distance entre l'ancien et le nouveau logement ?", short: "Distance", opts: { local: "Moins de 10 km", canton: "10 à 50 km", inter: "50 à 150 km", long: "Plus de 150 km" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { pack: "Emballage et cartons", furn: "Démontage / remontage des meubles", heavy: "Piano ou objet très lourd", store: "Garde-meubles (1 mois)" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          move: "Déménagement — {crew} déménageurs + camion ({vol} m³)",
          access: "Supplément portage (étages sans ascenseur)",
          distance: "Transport hors commune ({km} km)",
          pack: "Emballage + cartons fournis",
          furn: "Démontage / remontage des meubles",
          heavy: "Manutention piano / objet lourd",
          store: "Garde-meubles (1 mois)",
          clear: "Débarras ({vol} m³)",
          disposal: "Évacuation et tri en déchetterie",
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
