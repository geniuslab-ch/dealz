/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "piscines",
    icon: "🏊",
    needsAddress: true,
    colors: { main: "#15aabf", dark: "#0c8599", light: "#c5f6fa", accent: "#ff922b", accentDark: "#f76707", bg: "#f8feff" },

    quote: {
      minimum: 150,
      questions: [
        { id: "pool", type: "single", options: [{ id: "inground", k: 1 }, { id: "above", k: 0.7 }, { id: "natural", k: 1.2 }, { id: "spa", k: 0.5 }] },
        { id: "size", type: "single", options: [{ id: "xs", v: 20 }, { id: "s", v: 45 }, { id: "m", v: 80 }, { id: "l", v: 130 }] },
        { id: "service", type: "single", options: [{ id: "open" }, { id: "winter" }, { id: "weekly" }, { id: "green" }, { id: "annual" }] },
        { id: "equipment", type: "multi", options: [{ id: "pump" }, { id: "robot" }, { id: "heat" }, { id: "sand" }, { id: "algae" }, { id: "cover" }] },
        { id: "date", type: "date", minDays: 5 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var k = a.pool.k, sf = 0.8 + a.size.v / 100;
        var open = H.round5(280 * k * sf), winter = H.round5(240 * k * sf), weekly = H.round5(48 * k * sf * 20 * 0.9);
        var s = a.service.id;
        if (s === "open") items.push({ label: L("open"), amount: open });
        else if (s === "winter") items.push({ label: L("winter"), amount: winter });
        else if (s === "weekly") items.push({ label: L("weekly"), amount: weekly });
        else if (s === "green") items.push({ label: L("green"), amount: H.round5(420 * k * sf) });
        else items.push({ label: L("annual"), amount: H.round5((open + winter + weekly) * 0.92) });
        (a.equipment || []).forEach(function (e) {
          if (e.id === "pump") items.push({ label: L("pump"), amount: 90 });
          if (e.id === "robot") items.push({ label: L("robot"), amount: 70 });
          if (e.id === "heat") items.push({ label: L("heat"), amount: 140 });
          if (e.id === "sand") items.push({ label: L("sand"), amount: H.round5(200 + a.size.v * 0.9) });
          if (e.id === "algae") items.push({ label: L("algae"), amount: 85 });
          if (e.id === "cover") items.push({ label: L("cover"), amount: 120 });
        });
        return items;
      },
    },

    fr: {
      label: "Entretien de piscines",
      forWho: "entreprises d'entretien de piscines",
      pitch: "Chiffrez mise en service, hivernage et entretien selon le bassin.",
      emailNoun: "l'entretien de votre piscine",
      landing: {
        h1: ["VOUS ENTRETENEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de mise en service perdez-vous au premier week-end de beau temps ?",
        text: "Au printemps, tout le monde veut sa piscine prête en même temps — et le téléphone ne s'arrête plus. Dealz répond à vos clients, pose les bonnes questions (type de bassin, volume, prestation, équipements), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour la mise en service de ma piscine de 80 m³ ?",
        values: [
          { icon: "☀️", title: "Le pic de printemps absorbé", text: "Quand 50 propriétaires appellent le même week-end, chacun reçoit une réponse chiffrée immédiate." },
          { icon: "💧", title: "Un prix selon le volume d'eau", text: "Type de bassin et volume : vos coefficients s'appliquent automatiquement." },
          { icon: "🔁", title: "Des contrats annuels plus faciles à vendre", text: "Le forfait mise en service + saison + hivernage est proposé d'emblée, avec la remise que vous définissez." },
          { icon: "🧰", title: "Équipements chiffrés d'emblée", text: "Pompe, robot, pompe à chaleur, sable, algues, couverture : chaque contrôle est une ligne de devis." },
        ],
        step1: "Importez vos tarifs : prestations par type de bassin, coefficients de volume, forfaits annuels, contrôles d'équipements. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de bassins, vos volumes, vos prestations saisonnières et vos équipements.",
        excel: { file: "tarifs-piscines.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Mise en service printemps", "Enterrée · 60–100 m³", "CHF 450"], ["Contrôle pompe et filtre", "Forfait", "CHF 90"], ["Traitement anti-algues", "Choc", "CHF 85"]] },
        chat: ["« Je voudrais faire remettre ma piscine en service pour le printemps. »", "« Quel type de bassin et quel volume d'eau environ ? »", "« Souhaitez-vous aussi un contrôle de la pompe et un traitement anti-algues ? »"],
        offer: { company: "AquaPur Piscines Sàrl", rows: [["Mise en service de printemps", 450], ["Contrôle pompe et filtre", 90], ["Traitement anti-algues (choc)", 85]] },
        roi: "Un seul contrat annuel supplémentaire peut déjà payer votre abonnement pour la saison.",
      },
      demo: {
        brand: "AquaPur",
        eyebrow: "Montreux & Riviera · Exemple fictif",
        hero: { h1: "Une eau cristalline, sans y passer vos week-ends.", text: "Mise en service, hivernage, entretien hebdomadaire et remise en état de piscines et de spas — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "360+", lbl: "BASSINS SUIVIS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous entretenons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre bassin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🌞", title: "Mise en service", text: "Remise en route complète au printemps.", tag: "dès CHF 280" },
          { icon: "❄️", title: "Hivernage", text: "Protection du bassin et des équipements.", tag: "dès CHF 240" },
          { icon: "🗓️", title: "Entretien hebdomadaire", text: "Passage chaque semaine, saison complète.", tag: "dès CHF 48/passage" },
          { icon: "🟢", title: "Eau verte", text: "Remise en état complète de l'eau.", tag: "dès CHF 420" },
          { icon: "⚙️", title: "Équipements", text: "Pompe, filtre, robot, pompe à chaleur.", tag: "dès CHF 70" },
          { icon: "🛁", title: "Spas et jacuzzis", text: "Entretien adapté aux petits volumes.", tag: "dès CHF 120" },
        ],
        about: {
          title: "Des techniciens piscine, à l'année",
          text: "AquaPur Piscines entretient bassins privés et copropriétés entre Montreux et la Riviera depuis 2012. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Analyses d'eau", "chaque visite contrôlée, résultats consignés."], ["Produits adaptés", "traitements dosés selon le volume et la météo."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 13", email: "hello@aquapur.demo", zone: "Riviera, Lavaux, Chablais", hours: "Lun–Sam, 7h30–18h" },
        devisNote: "Répondez à quelques questions sur votre piscine — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre piscine…",
        pdfCompany: { name: "AquaPur Piscines Sàrl", address: "Avenue Nestlé 25, 1820 Montreux", phone: "021 000 00 13", email: "hello@aquapur.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre piscine, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de la piscine (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Produits de traitement inclus dans les forfaits indiqués. TVA suisse incluse le cas échéant.",
        q: {
          pool: { text: "Quel type de bassin ?", short: "Bassin", opts: { inground: "Piscine enterrée (béton / liner)", above: "Piscine hors-sol", natural: "Piscine naturelle / biotope", spa: "Spa / jacuzzi" } },
          size: { text: "Quel est le volume d'eau approximatif ?", short: "Volume", opts: { xs: "Moins de 30 m³", s: "30 à 60 m³", m: "60 à 100 m³", l: "Plus de 100 m³" } },
          service: { text: "Quelle prestation vous intéresse ?", short: "Prestation", opts: { open: "Mise en service de printemps", winter: "Hivernage", weekly: "Entretien hebdomadaire (saison, 20 semaines)", green: "Remise en état — eau verte", annual: "Forfait annuel (mise en service + saison + hivernage)" } },
          equipment: { text: "Souhaitez-vous contrôler des équipements ?", short: "Équipements", none: "Aucun équipement", opts: { pump: "Pompe et filtre", robot: "Robot nettoyeur (révision)", heat: "Pompe à chaleur (contrôle)", sand: "Remplacement du sable de filtration", algae: "Traitement anti-algues (choc)", cover: "Pose / dépose de la couverture" } },
          date: { text: "À partir de quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          open: "Mise en service de printemps",
          winter: "Hivernage du bassin",
          weekly: "Entretien hebdomadaire — saison (20 semaines)",
          green: "Remise en état de l'eau (eau verte)",
          annual: "Forfait annuel — mise en service + saison + hivernage",
          pump: "Contrôle pompe et filtre",
          robot: "Révision du robot nettoyeur",
          heat: "Contrôle de la pompe à chaleur",
          sand: "Remplacement du sable de filtration",
          algae: "Traitement anti-algues (choc)",
          cover: "Pose / dépose de la couverture",
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
