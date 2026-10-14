/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "montage-meubles",
    icon: "🪛",
    needsAddress: true,
    colors: { main: "#a0522d", dark: "#7b3f21", light: "#f5e1d3", accent: "#2b8a3e", accentDark: "#237a35", bg: "#fffaf6" },

    quote: {
      minimum: 120,
      questions: [
        { id: "service", type: "single", options: [{ id: "assemble", k: 1 }, { id: "dismantle", k: 0.6 }, { id: "move", k: 1.5 }, { id: "haul", k: 1.1 }] },
        { id: "pieces", type: "single", options: [{ id: "p1", n: 2 }, { id: "p2", n: 4 }, { id: "p3", n: 8 }, { id: "p4", n: 14 }] },
        { id: "complexity", type: "single", options: [{ id: "simple", rate: 38 }, { id: "medium", rate: 62 }, { id: "complex", rate: 110 }] },
        { id: "floor", type: "single", options: [{ id: "ground", fee: 0 }, { id: "stairs", fee: 60 }] },
        { id: "extras", type: "multi", options: [{ id: "wall" }, { id: "waste" }, { id: "adjust" }, { id: "light" }] },
        { id: "date", type: "date", minDays: 2 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var n = a.pieces.n;
        items.push({ label: L("work_" + a.service.id, { n: n }), amount: H.round5(n * a.complexity.rate * a.service.k) });
        if (a.service.id === "haul") items.push({ label: L("haul", { n: n }), amount: H.round5(120 + n * 10) });
        if (a.floor.fee) items.push({ label: L("stairs"), amount: a.floor.fee });
        (a.extras || []).forEach(function (e) {
          if (e.id === "wall") items.push({ label: L("wall"), amount: 60 });
          if (e.id === "waste") items.push({ label: L("waste"), amount: 45 });
          if (e.id === "adjust") items.push({ label: L("adjust"), amount: 55 });
          if (e.id === "light") items.push({ label: L("light"), amount: 70 });
        });
        return items;
      },
    },

    fr: {
      label: "Montage et démontage de meubles",
      forWho: "entreprises de montage et de démontage de meubles",
      pitch: "Chiffrez montage, démontage et évacuation selon le nombre de pièces.",
      landing: {
        h1: ["VOUS MONTEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de montage perdez-vous parce que vous avez les mains dans une armoire ?",
        text: "Le client a reçu ses meubles et veut un monteur ce week-end. Dealz lui répond tout de suite, pose les bonnes questions (nombre de pièces, complexité, étages, options), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour monter 4 meubles dont une armoire et un lit ?",
        values: [
          { icon: "🧩", title: "Un prix selon la complexité", text: "Meubles simples, armoires, cuisines : vos tarifs par pièce s'appliquent automatiquement." },
          { icon: "🔁", title: "Montage, démontage, déménagement", text: "Quatre types de prestations chiffrés avec les bonnes questions pour chacun." },
          { icon: "🪜", title: "Étages sans ascenseur pris en compte", text: "Le supplément portage est ajouté sans négociation." },
          { icon: "🧰", title: "Options faciles à vendre", text: "Fixation murale, réglages, évacuation des emballages : chaque option s'ajoute en un clic." },
        ],
        step1: "Importez vos tarifs : prix par pièce selon la complexité, démontage, évacuation, supplément d'étage, options. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de prestations, vos niveaux de complexité, vos accès et vos options.",
        excel: { file: "tarifs-montage.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Montage de meubles", "4 pièces · moyens", "CHF 250"], ["Étages sans ascenseur", "Forfait", "CHF 60"], ["Fixation murale", "Anti-basculement", "CHF 60"]] },
        chat: ["« Je dois faire monter une armoire et un lit que je viens de recevoir. »", "« Combien de pièces au total, et quel niveau de complexité ? »", "« Souhaitez-vous la fixation murale et l'évacuation des emballages ? »"],
        offer: { company: "MeubleMontage Pro Sàrl", rows: [["Montage de meubles (4 pièces)", 250], ["Étages sans ascenseur", 60], ["Fixation murale", 60]] },
        roi: "Un seul montage supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "MeubleMontage Pro",
        eyebrow: "Genève & Genevois · Exemple fictif",
        hero: { h1: "Vos meubles montés, sans la notice.", text: "Montage, démontage, remontage et évacuation de meubles à Genève — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "7 500+", lbl: "MEUBLES MONTÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous montons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🛏️", title: "Lits et commodes", text: "Montage rapide et soigné.", tag: "dès CHF 62/pièce" },
          { icon: "🚪", title: "Armoires et penderies", text: "Y compris portes coulissantes.", tag: "dès CHF 62/pièce" },
          { icon: "🍳", title: "Cuisines", text: "Montage de meubles de cuisine complexes.", tag: "dès CHF 110/pièce" },
          { icon: "🔩", title: "Démontage", text: "Démontage soigné pour déménagement.", tag: "dès CHF 38/pièce" },
          { icon: "🗑️", title: "Évacuation", text: "Anciens meubles et emballages évacués.", tag: "dès CHF 120" },
          { icon: "🧱", title: "Fixation murale", text: "Sécurisation anti-basculement.", tag: "CHF 60" },
        ],
        about: {
          title: "Des monteurs précis, rapides, discrets",
          text: "MeubleMontage Pro assemble les meubles de particuliers, de magasins et d'hôtels genevois depuis 2016. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Outillage complet", "nous venons avec tout le matériel nécessaire."], ["Protection des sols", "tapis de protection et nettoyage en fin de chantier."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 15", email: "hello@meublemontage.demo", zone: "Genève, Nyon, Lausanne", hours: "Lun–Sam, 8h–19h" },
        devisNote: "Répondez à quelques questions sur vos meubles — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos meubles…",
        pdfCompany: { name: "MeubleMontage Pro Sàrl", address: "Rue de Carouge 55, 1205 Genève", phone: "022 000 00 15", email: "hello@meublemontage.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos meubles, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse d'intervention (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, pour le nombre de pièces indiqué. Pièces manquantes ou défectueuses non comprises. TVA suisse incluse le cas échéant.",
        q: {
          service: { text: "Quelle prestation souhaitez-vous ?", short: "Prestation", opts: { assemble: "Montage de meubles neufs", dismantle: "Démontage", move: "Démontage + remontage (déménagement)", haul: "Montage + évacuation des anciens meubles" } },
          pieces: { text: "Combien de meubles sont concernés ?", short: "Meubles", opts: { p1: "1 à 2 pièces", p2: "3 à 5 pièces", p3: "6 à 10 pièces", p4: "11 pièces ou plus" } },
          complexity: { text: "Quelle est la complexité des meubles ?", short: "Complexité", opts: { simple: "Simples (kits à visser)", medium: "Moyens (armoires, lits, commodes)", complex: "Complexes (cuisine, portes coulissantes, sur mesure)" } },
          floor: { text: "Comment se présente l'accès au logement ?", short: "Accès", opts: { ground: "Rez-de-chaussée ou ascenseur", stairs: "Étages sans ascenseur" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { wall: "Fixation murale anti-basculement", waste: "Évacuation des emballages", adjust: "Réglages des portes et tiroirs", light: "Raccordement électrique simple (luminaires)" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          work_assemble: "Montage de meubles ({n} pièces)",
          work_dismantle: "Démontage de meubles ({n} pièces)",
          work_move: "Démontage + remontage ({n} pièces)",
          work_haul: "Montage de meubles ({n} pièces)",
          haul: "Évacuation des anciens meubles ({n} pièces)",
          stairs: "Étages sans ascenseur",
          wall: "Fixation murale anti-basculement",
          waste: "Évacuation des emballages",
          adjust: "Réglages des portes et tiroirs",
          light: "Raccordement électrique simple",
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
