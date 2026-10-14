/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "transport-livraison",
    icon: "🚐",
    needsAddress: true,
    colors: { main: "#364fc7", dark: "#2b3a9f", light: "#dbe4ff", accent: "#fab005", accentDark: "#e67700", bg: "#fbfcff" },

    quote: {
      minimum: 90,
      questions: [
        { id: "kind", type: "single", options: [{ id: "parcel" }, { id: "furniture" }, { id: "pro" }, { id: "urgent" }] },
        { id: "volume", type: "single", options: [{ id: "xs", v: 0.7, rate: 1.4, size: "< 1" }, { id: "s", v: 2, rate: 1.7, size: "1–3" }, { id: "m", v: 6, rate: 2.2, size: "3–10" }, { id: "l", v: 15, rate: 2.8, size: "10–20" }] },
        { id: "distance", type: "single", options: [{ id: "local", km: 12 }, { id: "reg", km: 60 }, { id: "nat", km: 200 }, { id: "far", km: 400 }] },
        { id: "access", type: "single", options: [{ id: "ground", fee: 0 }, { id: "stairs", fee: 40 }] },
        { id: "extras", type: "multi", options: [{ id: "carry" }, { id: "assemble" }, { id: "take" }, { id: "insure" }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var v = a.volume, km = a.distance.km;
        var transport = H.round5(65 + km * v.rate + v.v * 22);
        items.push({ label: L("transport", { size: v.size, km: km }), amount: transport });
        if (a.kind.id === "urgent") items.push({ label: L("urgent"), amount: H.round5(transport * 0.6) });
        if (a.kind.id === "furniture") items.push({ label: L("handling"), amount: H.round5(transport * 0.15) });
        if (a.access.fee) items.push({ label: L("stairs"), amount: H.round5(a.access.fee + v.v * 10) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "carry") items.push({ label: L("carry"), amount: 70 });
          if (e.id === "assemble") items.push({ label: L("assemble"), amount: 90 });
          if (e.id === "take") items.push({ label: L("take"), amount: 60 });
          if (e.id === "insure") items.push({ label: L("insure"), amount: 45 });
        });
        return items;
      },
    },

    fr: {
      label: "Transport et livraison",
      forWho: "entreprises de transport et de livraison",
      pitch: "Chiffrez volume, distance et accès sans passer par le téléphone.",
      emailNoun: "votre transport",
      landing: {
        h1: ["VOUS ROULEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de transport perdez-vous parce que vos chauffeurs sont sur la route ?",
        text: "Un particulier ou une PME cherche un transporteur et appelle trois entreprises. Dealz répond tout de suite, pose les bonnes questions (marchandise, volume, distance, accès), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour livrer 3 m³ de meubles de Lausanne à Berne ?",
        values: [
          { icon: "📍", title: "Un prix selon la distance", text: "Trajet local, régional ou national : vos tarifs au kilomètre et vos forfaits s'appliquent automatiquement." },
          { icon: "📦", title: "Volume et accès qualifiés", text: "Vous recevez des demandes avec le volume, l'étage et les contraintes d'accès déjà renseignés." },
          { icon: "⚡", title: "Courses urgentes chiffrées", text: "Votre majoration pour course dédiée est appliquée sans négociation." },
          { icon: "🛡️", title: "Options qui font la marge", text: "Portage, montage, reprise de l'ancien appareil, assurance valeur déclarée : tout est proposé d'emblée." },
        ],
        step1: "Importez vos tarifs : forfaits de prise en charge, tarif au km par véhicule, majoration urgente, portage, assurance. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos volumes, vos distances, vos types de marchandises et vos options.",
        excel: { file: "tarifs-transport.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Transport 3–10 m³", "200 km", "CHF 640"], ["Supplément étage", "Sans ascenseur", "CHF 100"], ["Assurance valeur déclarée", "Forfait", "CHF 45"]] },
        chat: ["« Je dois faire livrer des meubles de Lausanne à Berne. »", "« Quel volume et quelle distance, et y a-t-il un ascenseur ? »", "« Souhaitez-vous le portage et une assurance valeur déclarée ? »"],
        offer: { company: "Rapido Transport Sàrl", rows: [["Transport 3–10 m³ — 200 km", 640], ["Supplément étage sans ascenseur", 100], ["Assurance valeur déclarée", 45]] },
        roi: "Une seule course supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Rapido Transport",
        eyebrow: "Berne & Suisse romande · Exemple fictif",
        hero: { h1: "Livré où vous voulez, quand vous voulez.", text: "Transport de colis, de meubles et de marchandises professionnelles, avec courses urgentes — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.7★", lbl: "SATISFACTION CLIENT" }, { num: "18 000+", lbl: "LIVRAISONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous transportons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "📦", title: "Colis et palettes", text: "Prise en charge et livraison rapide.", tag: "dès CHF 90" },
          { icon: "🛋️", title: "Meubles et électroménager", text: "Manutention soignée, portage possible.", tag: "dès CHF 110" },
          { icon: "🏭", title: "Marchandises professionnelles", text: "Livraisons ponctuelles ou récurrentes.", tag: "sur devis" },
          { icon: "⚡", title: "Course urgente", text: "Véhicule dédié, départ immédiat.", tag: "+60 %" },
          { icon: "🔧", title: "Montage et branchement", text: "Mise en service chez le client.", tag: "CHF 90" },
          { icon: "🛡️", title: "Assurance valeur déclarée", text: "Marchandise couverte jusqu'à la valeur indiquée.", tag: "CHF 45" },
        ],
        about: {
          title: "Une flotte locale, des chauffeurs qui connaissent la route",
          text: "Rapido Transport livre particuliers et entreprises en Suisse romande et dans le canton de Berne depuis 2010. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Véhicules suivis", "suivi de livraison et créneau annoncé à l'avance."], ["Chauffeurs formés", "manutention soignée, ponctualité."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "031 000 00 80", email: "hello@rapido-transport.demo", zone: "Suisse romande, Berne, Fribourg", hours: "Lun–Sam, 6h–19h" },
        devisNote: "Répondez à quelques questions sur votre transport — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre transport…",
        pdfCompany: { name: "Rapido Transport Sàrl", address: "Wankdorffeldstrasse 40, 3014 Berne", phone: "031 000 00 80", email: "hello@rapido-transport.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre transport, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de chargement (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, pour le volume et le trajet indiqués. TVA suisse incluse le cas échéant.",
        q: {
          kind: { text: "Que souhaitez-vous faire transporter ?", short: "Marchandise", opts: { parcel: "Colis / palettes", furniture: "Meubles et électroménager", pro: "Marchandises professionnelles", urgent: "Transport urgent (véhicule dédié)" } },
          volume: { text: "Quel est le volume approximatif ?", short: "Volume", opts: { xs: "Moins de 1 m³", s: "1 à 3 m³", m: "3 à 10 m³", l: "Camion complet (10 à 20 m³)" } },
          distance: { text: "Quelle est la distance du trajet ?", short: "Distance", opts: { local: "Moins de 20 km", reg: "20 à 100 km", nat: "100 à 300 km", far: "Plus de 300 km" } },
          access: { text: "Comment se présente l'accès au point de chargement ?", short: "Accès", opts: { ground: "Rez-de-chaussée ou quai de chargement", stairs: "Étage sans ascenseur" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { carry: "Portage jusqu'à l'étage", assemble: "Montage / branchement", take: "Reprise de l'ancien appareil", insure: "Assurance valeur déclarée" } },
          date: { text: "Pour quelle date souhaitez-vous le transport ?", short: "Date souhaitée" },
        },
        items: {
          transport: "Transport {size} m³ — {km} km",
          urgent: "Supplément course urgente (véhicule dédié)",
          handling: "Manutention meubles et électroménager",
          stairs: "Supplément étage sans ascenseur",
          carry: "Portage jusqu'à l'étage",
          assemble: "Montage / branchement",
          take: "Reprise de l'ancien appareil",
          insure: "Assurance valeur déclarée",
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
