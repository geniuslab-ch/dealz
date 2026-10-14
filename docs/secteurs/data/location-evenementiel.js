/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "location-evenementiel",
    icon: "🎪",
    needsAddress: true,
    colors: { main: "#ae3ec9", dark: "#862e9c", light: "#f3d9fa", accent: "#fab005", accentDark: "#e67700", bg: "#fdfaff" },

    quote: {
      minimum: 150,
      questions: [
        { id: "event", type: "single", options: [{ id: "wedding" }, { id: "corp" }, { id: "party" }, { id: "public" }] },
        { id: "guests", type: "single", options: [{ id: "g1", n: 25 }, { id: "g2", n: 45 }, { id: "g3", n: 80 }, { id: "g4", n: 150 }, { id: "g5", n: 250 }] },
        { id: "items", type: "multi", options: [{ id: "tables" }, { id: "tent" }, { id: "sound" }, { id: "light" }, { id: "tableware" }, { id: "lounge" }] },
        { id: "duration", type: "single", options: [{ id: "day", k: 1 }, { id: "weekend", k: 1.6 }, { id: "multi", k: 2 }] },
        { id: "delivery", type: "single", options: [{ id: "pickup" }, { id: "deliver" }, { id: "setup" }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var n = a.guests.n, k = a.duration.k;
        (a.items || []).forEach(function (it) {
          if (it.id === "tables") items.push({ label: L("tables", { n: n }), amount: H.round5(n * 7.5 * k) });
          if (it.id === "tent") items.push({ label: L("tent", { n: n }), amount: H.round5((250 + n * 14) * k) });
          if (it.id === "sound") items.push({ label: L("sound"), amount: H.round5((n <= 100 ? 220 : 380) * k) });
          if (it.id === "light") items.push({ label: L("light"), amount: H.round5((180 + n * 1.2) * k) });
          if (it.id === "tableware") items.push({ label: L("tableware", { n: n }), amount: H.round5(n * 6.2 * k) });
          if (it.id === "lounge") items.push({ label: L("lounge"), amount: H.round5(340 * k) });
        });
        if (!items.length) items.push({ label: L("base"), amount: 60 });
        if (a.delivery.id === "deliver") items.push({ label: L("deliver"), amount: H.round5(90 + n * 0.6) });
        if (a.delivery.id === "setup") items.push({ label: L("setup"), amount: H.round5(210 + n * 2.5) });
        return items;
      },
    },

    fr: {
      label: "Location de matériel événementiel",
      forWho: "entreprises de location de matériel événementiel",
      pitch: "Chiffrez tables, tentes, son et lumière selon le nombre d'invités.",
      emailNoun: "votre événement",
      landing: {
        h1: ["VOUS ÉQUIPEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de location perdez-vous parce qu'un devis prend trois jours ?",
        text: "Un mariage, un anniversaire, une fête d'entreprise : le client compare plusieurs loueurs et choisit le premier qui répond. Dealz répond tout de suite, pose les bonnes questions (invités, matériel, durée, livraison), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour 80 invités : tables, chaises, tente et sono ?",
        values: [
          { icon: "👥", title: "Des devis au nombre d'invités", text: "Tables, chaises, tente, vaisselle : tout se calcule à partir du nombre de personnes." },
          { icon: "📆", title: "Durée et week-end intégrés", text: "Un jour, un week-end, plusieurs jours : vos coefficients de durée s'appliquent seuls." },
          { icon: "🚚", title: "Retrait, livraison ou montage", text: "Chaque formule logistique est chiffrée selon vos règles, montage et démontage compris." },
          { icon: "🔒", title: "Dates qualifiées avant la réservation", text: "Vous voyez les demandes sérieuses, avec date et ampleur de l'événement." },
        ],
        step1: "Importez vos tarifs : prix par pièce ou par invité, coefficients de durée, forfaits de livraison et de montage. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos catalogues, vos tailles d'événements, vos durées de location et vos modes de livraison.",
        excel: { file: "tarifs-evenementiel.xlsx", headers: ["Matériel", "Condition", "Prix"], rows: [["Tables et chaises", "80 invités · 1 jour", "CHF 600"], ["Tente / chapiteau", "80 invités", "CHF 1 370"], ["Livraison + reprise", "Forfait", "CHF 140"]] },
        chat: ["« Nous organisons un mariage pour 80 personnes en juin. »", "« Quel matériel vous faut-il : tables, tente, sono, éclairage ? »", "« Souhaitez-vous la livraison avec montage et démontage ? »"],
        offer: { company: "EventBox Location Sàrl", rows: [["Tables et chaises (80 pers.)", 600], ["Tente / chapiteau (80 pers.)", 1370], ["Livraison et reprise", 140]] },
        roi: "Une seule location supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "EventBox",
        eyebrow: "Valais & Chablais · Exemple fictif",
        hero: { h1: "Votre événement mérite le bon matériel.", text: "Tables, chaises, tentes, sono, éclairage et vaisselle pour mariages, fêtes et événements d'entreprise — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "1 200+", lbl: "ÉVÉNEMENTS ÉQUIPÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous louons",
        servicesSub: "Choisissez une catégorie, ou décrivez simplement votre événement dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🪑", title: "Tables et chaises", text: "Mobilier de réception pour tous formats.", tag: "dès CHF 7.50/pers." },
          { icon: "⛺", title: "Tentes et chapiteaux", text: "Structures 3×3 m à 12×30 m.", tag: "dès CHF 250" },
          { icon: "🔊", title: "Sonorisation", text: "Enceintes, micros et régie.", tag: "dès CHF 220" },
          { icon: "💡", title: "Éclairage", text: "Guirlandes, projecteurs et ambiance.", tag: "dès CHF 180" },
          { icon: "🍽️", title: "Vaisselle", text: "Assiettes, verres et couverts, lavés.", tag: "dès CHF 6.20/pers." },
          { icon: "🛋️", title: "Mobilier lounge", text: "Canapés, poufs et tables basses.", tag: "dès CHF 340" },
        ],
        about: {
          title: "Un dépôt, une équipe, tous vos événements",
          text: "EventBox Location équipe fêtes privées, communes et entreprises en Valais et dans le Chablais depuis 2011. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Matériel contrôlé", "chaque pièce est vérifiée avant et après la location."], ["Livraison et montage", "nos équipes installent et reprennent le matériel."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "027 000 00 50", email: "hello@eventbox.demo", zone: "Valais, Chablais, Vaud", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur votre événement — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre événement…",
        pdfCompany: { name: "EventBox Location Sàrl", address: "Zone industrielle 5, 1950 Sion", phone: "027 000 00 50", email: "hello@eventbox.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre événement, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Lieu de l'événement (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité à la date indiquée. Caution restituée après contrôle du matériel. TVA suisse incluse le cas échéant.",
        q: {
          event: { text: "Quel type d'événement organisez-vous ?", short: "Événement", opts: { wedding: "Mariage", corp: "Événement d'entreprise", party: "Anniversaire / fête privée", public: "Fête de village / association" } },
          guests: { text: "Combien d'invités attendez-vous ?", short: "Invités", opts: { g1: "Moins de 30", g2: "30 à 60", g3: "60 à 100", g4: "100 à 200", g5: "Plus de 200" } },
          items: { text: "De quel matériel avez-vous besoin ?", short: "Matériel", none: "Je ne sais pas encore", opts: { tables: "Tables et chaises", tent: "Tente / chapiteau", sound: "Sonorisation", light: "Éclairage d'ambiance", tableware: "Vaisselle, verres et couverts", lounge: "Mobilier lounge" } },
          duration: { text: "Pour quelle durée de location ?", short: "Durée", opts: { day: "1 jour", weekend: "Week-end (2 jours)", multi: "3 jours ou plus" } },
          delivery: { text: "Comment souhaitez-vous récupérer le matériel ?", short: "Logistique", opts: { pickup: "Retrait au dépôt", deliver: "Livraison + reprise", setup: "Livraison, montage et démontage" } },
          date: { text: "Quelle est la date de l'événement ?", short: "Date de l'événement" },
        },
        items: {
          tables: "Tables et chaises ({n} invités)",
          tent: "Tente / chapiteau ({n} invités)",
          sound: "Sonorisation",
          light: "Éclairage d'ambiance",
          tableware: "Vaisselle, verres et couverts ({n} invités)",
          lounge: "Mobilier lounge",
          base: "Frais de dossier et conseil",
          deliver: "Livraison et reprise du matériel",
          setup: "Livraison, montage et démontage",
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
