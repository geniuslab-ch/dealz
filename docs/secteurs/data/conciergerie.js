/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "conciergerie",
    icon: "🔑",
    needsAddress: true,
    colors: { main: "#5c940d", dark: "#4a7a0a", light: "#e9fac8", accent: "#1971c2", accentDark: "#1864ab", bg: "#fbfef6" },

    quote: {
      minimum: 150,
      questions: [
        { id: "property", type: "single", options: [{ id: "flat", k: 1 }, { id: "villa", k: 1.4 }, { id: "small", k: 4.5 }, { id: "large", k: 9 }, { id: "office", k: 2 }] },
        { id: "services", type: "multi", options: [{ id: "clean" }, { id: "waste" }, { id: "keys" }, { id: "repair" }, { id: "garden" }, { id: "checkin" }] },
        { id: "freq", type: "single", options: [{ id: "w1", f: 1 }, { id: "w2", f: 1.7 }, { id: "w3", f: 2.3 }, { id: "m1", f: 0.4 }] },
        { id: "contract", type: "single", options: [{ id: "month", disc: 0 }, { id: "year", disc: 0.08 }, { id: "two", disc: 0.12 }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var k = a.property.k, f = a.freq.f;
        (a.services || []).forEach(function (s) {
          if (s.id === "clean") items.push({ label: L("clean"), amount: H.round5(140 * k * f) });
          if (s.id === "waste") items.push({ label: L("waste"), amount: H.round5(90 * k * f) });
          if (s.id === "keys") items.push({ label: L("keys"), amount: 60 });
          if (s.id === "repair") items.push({ label: L("repair"), amount: H.round5(120 * k) });
          if (s.id === "garden") items.push({ label: L("garden"), amount: H.round5(110 * k) });
          if (s.id === "checkin") items.push({ label: L("checkin"), amount: H.round5(35 * 8 * Math.min(k, 2)) });
        });
        if (!items.length) items.push({ label: L("visit"), amount: 180 });
        var sub = items.reduce(function (s, i) { return s + i.amount; }, 0);
        if (a.contract.disc) items.push({ label: L("discount", { pct: Math.round(a.contract.disc * 100) }), amount: -H.round5(sub * a.contract.disc) });
        return items;
      },
    },

    fr: {
      label: "Conciergerie et entretien immobilier",
      forWho: "entreprises de conciergerie et d'entretien immobilier",
      pitch: "Chiffrez un contrat mensuel d'entretien selon l'immeuble et les services.",
      emailNoun: "votre contrat d'entretien",
      landing: {
        h1: ["VOUS ENTRETENEZ.", "DEALZ CHIFFRE."],
        question: "Combien de régies et de propriétaires perdez-vous parce que votre offre prend une semaine ?",
        text: "Une régie cherche un prestataire pour un immeuble et demande trois offres le même jour. Dealz répond tout de suite, pose les bonnes questions (type de bien, services, fréquence, durée de contrat), calcule votre prix selon vos tarifs et prépare le devis mensuel.",
        clientQ: "Combien par mois pour l'entretien d'un immeuble de 12 lots ?",
        values: [
          { icon: "🏢", title: "Un devis mensuel par type de bien", text: "Appartement, villa, immeuble, bureaux : vos coefficients de taille s'appliquent automatiquement." },
          { icon: "🧰", title: "Services à la carte", text: "Entretien, déchets, clés, petite maintenance, extérieurs, check-in : chaque service s'ajoute au contrat en un clic." },
          { icon: "📝", title: "Contrats plus longs, plus faciles à signer", text: "Vos remises d'engagement (1 an, 2 ans) sont proposées d'emblée." },
          { icon: "⏰", title: "Vous répondez en premier", text: "Dans un marché où la régie compare, la première offre chiffrée a un avantage décisif." },
        ],
        step1: "Importez vos tarifs : forfaits mensuels par service, coefficients par type de bien, fréquences, remises d'engagement. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de biens, vos services, vos fréquences de passage et vos durées de contrat.",
        excel: { file: "tarifs-conciergerie.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Entretien parties communes", "Immeuble 6–20 lots · 1 passage/sem.", "CHF 630/mois"], ["Déchets et rondes", "Même immeuble", "CHF 405/mois"], ["Petite maintenance", "Forfait", "CHF 540/mois"]] },
        chat: ["« Nous cherchons un prestataire pour l'entretien de notre immeuble de 12 lots. »", "« Quels services souhaitez-vous : entretien, déchets, maintenance, extérieurs ? »", "« À quelle fréquence, et pour quelle durée de contrat ? »"],
        offer: { company: "ConciergeCare Immobilier Sàrl", rows: [["Entretien des parties communes (par mois)", 630], ["Gestion des déchets et rondes (par mois)", 405], ["Petite maintenance (par mois)", 540]] },
        roi: "Un seul contrat d'immeuble supplémentaire peut déjà payer votre abonnement pendant des années.",
      },
      demo: {
        brand: "ConciergeCare",
        eyebrow: "Lausanne & Riviera · Exemple fictif",
        hero: { h1: "Votre immeuble impeccable, sans que vous y pensiez.", text: "Conciergerie, entretien courant, petite maintenance et gestion d'accès pour propriétaires, régies et copropriétés — obtenez un prix mensuel ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION RÉGIES" }, { num: "140+", lbl: "IMMEUBLES GÉRÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous prenons en charge",
        servicesSub: "Choisissez un service, ou décrivez simplement votre immeuble dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🧹", title: "Entretien des parties communes", text: "Cages d'escalier, halls, ascenseurs.", tag: "dès CHF 140/mois" },
          { icon: "🗑️", title: "Déchets et rondes", text: "Sorties des conteneurs, contrôle des locaux.", tag: "dès CHF 90/mois" },
          { icon: "🔑", title: "Gestion des clés", text: "Remise, double et suivi des accès.", tag: "CHF 60/mois" },
          { icon: "🛠️", title: "Petite maintenance", text: "Ampoules, serrures, petites réparations.", tag: "dès CHF 120/mois" },
          { icon: "🌳", title: "Entretien extérieur", text: "Espaces verts, allées, neige et verglas.", tag: "dès CHF 110/mois" },
          { icon: "🧳", title: "Check-in / check-out", text: "Remise des clés pour location courte durée.", tag: "dès CHF 35/séjour" },
        ],
        about: {
          title: "Une équipe de proximité, un interlocuteur unique",
          text: "ConciergeCare Immobilier accompagne propriétaires, régies et copropriétés entre Lausanne et la Riviera depuis 2014. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Interlocuteur unique", "un responsable de secteur connaît votre immeuble."], ["Rapport de passage", "chaque intervention est tracée et transmise."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 12", email: "hello@conciergecare.demo", zone: "Lausanne, Riviera, Lavaux", hours: "Lun–Ven, 7h30–17h30" },
        devisNote: "Répondez à quelques questions sur votre bien — vous recevrez un devis mensuel réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre immeuble ou votre bien…",
        pdfCompany: { name: "ConciergeCare Immobilier Sàrl", address: "Avenue de la Gare 30, 1003 Lausanne", phone: "021 000 00 12", email: "hello@conciergecare.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre bien, puis je vous établis un devis mensuel ferme tout de suite après.",
        addressPlaceholder: "Adresse du bien (rue, NPA, ville)",
        terms: "Prix mensuel ferme, valable 30 jours, hors prestations exceptionnelles. TVA suisse incluse le cas échéant.",
        q: {
          property: { text: "De quel type de bien s'agit-il ?", short: "Bien", opts: { flat: "Appartement", villa: "Villa", small: "Immeuble de 6 à 20 lots", large: "Immeuble de plus de 20 lots", office: "Bureaux / commerce" } },
          services: { text: "Quels services souhaitez-vous ?", short: "Services", none: "Je ne sais pas encore", opts: { clean: "Entretien courant (parties communes)", waste: "Gestion des déchets et rondes", keys: "Gestion des clés et des accès", repair: "Petite maintenance", garden: "Entretien extérieur / espaces verts", checkin: "Check-in / check-out (courte durée)" } },
          freq: { text: "À quelle fréquence pour l'entretien ?", short: "Fréquence", opts: { w1: "1 passage par semaine", w2: "2 passages par semaine", w3: "3 passages ou plus par semaine", m1: "1 passage par mois" } },
          contract: { text: "Quelle durée de contrat envisagez-vous ?", short: "Contrat", opts: { month: "Sans engagement (mois par mois)", year: "Contrat annuel", two: "Contrat de 2 ans" } },
          date: { text: "À partir de quelle date souhaitez-vous démarrer ?", short: "Démarrage" },
        },
        items: {
          clean: "Entretien courant des parties communes (par mois)",
          waste: "Gestion des déchets et rondes (par mois)",
          keys: "Gestion des clés et des accès (par mois)",
          repair: "Petite maintenance (par mois)",
          garden: "Entretien extérieur / espaces verts (par mois)",
          checkin: "Check-in / check-out location courte durée (par mois)",
          visit: "Visite de diagnostic et offre sur mesure",
          discount: "Remise d'engagement ({pct} %)",
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
