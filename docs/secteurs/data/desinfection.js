/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "desinfection",
    icon: "🐜",
    needsAddress: true,
    colors: { main: "#c92a2a", dark: "#a51111", light: "#ffe3e3", accent: "#1c7ed6", accentDark: "#1864ab", bg: "#fffafa" },

    quote: {
      minimum: 150,
      questions: [
        { id: "problem", type: "single", options: [{ id: "bedbugs", base: 420 }, { id: "roaches", base: 280 }, { id: "rodents", base: 240 }, { id: "wasps", base: 150 }, { id: "ants", base: 180 }, { id: "disinfect", base: 0 }] },
        { id: "premises", type: "single", options: [{ id: "flat", k: 1 }, { id: "house", k: 1.2 }, { id: "shop", k: 1.5 }, { id: "building", k: 1.9 }] },
        {
          id: "surface", type: "single",
          when: function (a) { return a.problem.id !== "wasps"; },
          options: [{ id: "sm", m2: 45 }, { id: "md", m2: 90 }, { id: "lg", m2: 180 }, { id: "xl", m2: 350 }],
        },
        {
          id: "severity", type: "single",
          when: function (a) { return ["bedbugs", "roaches", "rodents", "ants"].indexOf(a.problem.id) >= 0; },
          options: [{ id: "early", k: 1 }, { id: "set", k: 1.35 }, { id: "severe", k: 1.8 }],
        },
        { id: "urgency", type: "single", options: [{ id: "std", k: 0 }, { id: "fast", k: 0.2 }, { id: "urgent", k: 0.45 }] },
        { id: "followup", type: "multi", options: [{ id: "second" }, { id: "report" }, { id: "seal" }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var p = a.problem, pk = a.premises.k, main;
        if (p.id === "wasps") {
          main = H.round5(p.base * pk);
          items.push({ label: L("treat_wasps"), amount: main });
        } else if (p.id === "disinfect") {
          main = H.round5(Math.max(160, a.surface.m2 * 4.2 * pk));
          items.push({ label: L("treat_disinfect", { m2: a.surface.m2 }), amount: main });
        } else {
          main = H.round5(p.base * pk * (0.7 + a.surface.m2 / 150) * a.severity.k);
          items.push({ label: L("treat_" + p.id, { m2: a.surface.m2 }), amount: main });
        }
        if (a.urgency.k) items.push({ label: L(a.urgency.id === "urgent" ? "urgent" : "fast"), amount: H.round5(main * a.urgency.k) });
        (a.followup || []).forEach(function (f) {
          if (f.id === "second") items.push({ label: L("second"), amount: H.round5(main * 0.35) });
          if (f.id === "report") items.push({ label: L("report"), amount: 90 });
          if (f.id === "seal") items.push({ label: L("seal"), amount: 240 });
        });
        return items;
      },
    },

    fr: {
      label: "Désinfection et lutte antiparasitaire",
      forWho: "entreprises de désinfection et de lutte antiparasitaire",
      pitch: "Chiffrez traitement, urgence et suivi selon le problème et les locaux.",
      landing: {
        h1: ["VOUS TRAITEZ.", "DEALZ CHIFFRE."],
        question: "Combien d'appels urgents perdez-vous parce que personne ne décroche à 21 h ?",
        text: "Quand on découvre des punaises de lit ou des cafards, on veut une réponse tout de suite — pas un rappel dans trois jours. Dealz répond à toute heure, pose les bonnes questions (nuisible, locaux, ampleur, urgence), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour traiter des punaises de lit dans une maison de 90 m² ?",
        values: [
          { icon: "🆘", title: "Une réponse le soir et le week-end", text: "Les demandes urgentes arrivent quand le problème apparaît — et sont qualifiées avant votre premier appel." },
          { icon: "🪳", title: "Chaque nuisible, ses règles", text: "Punaises, cafards, rongeurs, guêpes, fourmis, désinfection : un prix de base et des questions adaptées à chaque cas." },
          { icon: "⏱️", title: "Urgence 48 h ou 24 h chiffrée", text: "Vos majorations d'urgence s'appliquent automatiquement, sans négociation au téléphone." },
          { icon: "📄", title: "Suivi et rapports en option", text: "Second traitement, rapport pour la régie ou l'assurance, colmatage : chaque option est proposée d'emblée." },
        ],
        step1: "Importez vos tarifs : traitement par nuisible, coefficients locaux et surface, majorations de gravité et d'urgence, suivi.",
        step2: "Le moteur comprend vos types de nuisibles, vos locaux, vos niveaux d'infestation et vos délais d'intervention.",
        excel: { file: "tarifs-antiparasitaire.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Punaises de lit", "Maison 90 m² · installée", "CHF 885"], ["Intervention sous 48 h", "+20 %", "CHF 175"], ["Rapport pour la régie", "Forfait", "CHF 90"]] },
        chat: ["« J'ai trouvé des punaises de lit dans ma chambre, c'est urgent. »", "« Depuis combien de temps, et quelle est la surface du logement ? »", "« Souhaitez-vous une intervention sous 48 h et un second passage de contrôle ? »"],
        offer: { company: "SanitSafe Antiparasitaires SA", rows: [["Traitement punaises de lit (90 m²)", 885], ["Intervention sous 48 h", 175], ["Rapport pour la régie", 90]] },
        roi: "Une seule intervention supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "SanitSafe",
        eyebrow: "Neuchâtel & Arc jurassien · Exemple fictif",
        hero: { h1: "Les nuisibles dehors, la tranquillité dedans.", text: "Punaises de lit, cafards, rongeurs, guêpes et désinfection pour particuliers et commerces — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "2 400+", lbl: "INTERVENTIONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous traitons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre problème dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🛏️", title: "Punaises de lit", text: "Traitement ciblé, garantie de résultat.", tag: "dès CHF 420" },
          { icon: "🪳", title: "Cafards et blattes", text: "Gel, pièges et traitement des foyers.", tag: "dès CHF 280" },
          { icon: "🐀", title: "Rongeurs", text: "Dératisation et colmatage des accès.", tag: "dès CHF 240" },
          { icon: "🐝", title: "Guêpes et frelons", text: "Destruction sécurisée des nids.", tag: "dès CHF 150" },
          { icon: "🐜", title: "Fourmis", text: "Traitement des foyers intérieurs et extérieurs.", tag: "dès CHF 180" },
          { icon: "🧴", title: "Désinfection", text: "Virus, bactéries, moisissures.", tag: "dès CHF 4.20/m²" },
        ],
        about: {
          title: "Des techniciens certifiés, une intervention discrète",
          text: "SanitSafe Antiparasitaires intervient chez les particuliers, régies, restaurants et hôtels de l'Arc jurassien depuis 2008. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Techniciens certifiés", "formés aux produits biocides et à la sécurité."], ["Véhicules neutres", "aucune mention visible, intervention discrète."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "032 000 00 60", email: "hello@sanitsafe.demo", zone: "Neuchâtel, Jura, Berne francophone", hours: "Lun–Dim, 7h–21h" },
        devisNote: "Répondez à quelques questions sur votre problème — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre problème…",
        pdfCompany: { name: "SanitSafe Antiparasitaires SA", address: "Rue du Seyon 14, 2000 Neuchâtel", phone: "032 000 00 60", email: "hello@sanitsafe.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre situation, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse à traiter (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Garantie de résultat selon conditions du traitement choisi. TVA suisse incluse le cas échéant.",
        q: {
          problem: { text: "Quel est le problème ?", short: "Problème", opts: { bedbugs: "Punaises de lit", roaches: "Cafards / blattes", rodents: "Rongeurs (souris, rats)", wasps: "Nid de guêpes ou de frelons", ants: "Fourmis", disinfect: "Désinfection (virus, bactéries, moisissures)" } },
          premises: { text: "De quels locaux s'agit-il ?", short: "Locaux", opts: { flat: "Appartement", house: "Maison", shop: "Commerce / restaurant", building: "Immeuble / parties communes" } },
          surface: { text: "Quelle est la surface à traiter ?", short: "Surface", opts: { sm: "Moins de 60 m²", md: "60 à 120 m²", lg: "120 à 250 m²", xl: "Plus de 250 m²" } },
          severity: { text: "Depuis combien de temps le problème est-il présent ?", short: "Ampleur", opts: { early: "Début d'infestation", set: "Installé depuis plusieurs semaines", severe: "Infestation sévère" } },
          urgency: { text: "Quel délai d'intervention souhaitez-vous ?", short: "Délai", opts: { std: "Sous 5 jours", fast: "Sous 48 h", urgent: "Urgence sous 24 h" } },
          followup: { text: "Souhaitez-vous du suivi en option ?", short: "Suivi", none: "Aucun suivi", opts: { second: "Second traitement de contrôle (garanti 30 jours)", report: "Rapport écrit pour la régie / l'assurance", seal: "Colmatage des accès (rongeurs)" } },
          date: { text: "À partir de quelle date l'intervention est-elle possible ?", short: "Date souhaitée" },
        },
        items: {
          treat_bedbugs: "Traitement punaises de lit ({m2} m²)",
          treat_roaches: "Traitement cafards / blattes ({m2} m²)",
          treat_rodents: "Dératisation ({m2} m²)",
          treat_ants: "Traitement fourmis ({m2} m²)",
          treat_wasps: "Destruction du nid (guêpes / frelons)",
          treat_disinfect: "Désinfection des surfaces ({m2} m²)",
          fast: "Intervention sous 48 h",
          urgent: "Urgence sous 24 h",
          second: "Second traitement de contrôle (garanti 30 jours)",
          report: "Rapport écrit (régie / assurance)",
          seal: "Colmatage des accès",
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
