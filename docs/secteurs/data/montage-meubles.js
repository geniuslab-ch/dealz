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
      emailNoun: "le montage de vos meubles",
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

    // ---- English texts ----
    en: {
      label: "Furniture Assembly & Disassembly",
      forWho: "furniture assembly and disassembly companies",
      pitch: "Price assembly, disassembly and removal by number of items.",
      emailNoun: "your furniture assembly",
      landing: {
        h1: ["YOU ASSEMBLE.", "DEALZ PRICES IT."],
        question: "How many assembly requests are you losing because your hands are full with a wardrobe?",
        text: "The client's furniture has just arrived and they want an assembler this weekend. Dealz replies right away, asks the right questions (number of items, complexity, floors, options), calculates your price from your own rates and prepares the quote.",
        clientQ: "How much to assemble 4 pieces of furniture including a wardrobe and a bed?",
        values: [
          { icon: "🧩", title: "A price based on complexity", text: "Simple furniture, wardrobes, kitchens: your per-item rates apply automatically." },
          { icon: "🔁", title: "Assembly, disassembly, removal", text: "Four types of services priced with the right questions for each." },
          { icon: "🪜", title: "Floors without a lift taken into account", text: "The carrying surcharge is added without negotiation." },
          { icon: "🧰", title: "Easy-to-sell add-ons", text: "Wall mounting, adjustments, packaging removal: every option is added to the quote in one click." },
        ],
        step1: "Import your rates: price per item by complexity, disassembly, removal, floor surcharge, options. Your Excel sheet stays your working tool.",
        step2: "The engine understands your service types, complexity levels, access and options.",
        excel: { file: "assembly-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Furniture assembly", "4 items · medium", "CHF 250"], ["Floors without lift", "Flat fee", "CHF 60"], ["Wall mounting", "Anti-tip", "CHF 60"]] },
        chat: ["\"I need a wardrobe and a bed I just received assembled.\"", "\"How many items in total, and what level of complexity?\"", "\"Would you like wall mounting and packaging removal?\""],
        offer: { company: "MeubleMontage Pro Sàrl", rows: [["Furniture assembly (4 items)", 250], ["Floors without lift", 60], ["Wall mounting", 60]] },
        roi: "Just one extra assembly job per week can already cover your subscription.",
      },
      demo: {
        brand: "MeubleMontage Pro",
        eyebrow: "Geneva & Genevois · Fictional example",
        hero: { h1: "Your furniture assembled, no instructions needed.", text: "Assembly, disassembly, reassembly and furniture removal in Geneva — get a firm price in seconds, right on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "7,500+", lbl: "ITEMS ASSEMBLED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we assemble",
        servicesSub: "Choose a service, or simply describe your need in the \"Get a quote\" tab.",
        services: [
          { icon: "🛏️", title: "Beds and dressers", text: "Fast, careful assembly.", tag: "from CHF 62/item" },
          { icon: "🚪", title: "Wardrobes and closets", text: "Including sliding doors.", tag: "from CHF 62/item" },
          { icon: "🍳", title: "Kitchens", text: "Assembly of complex kitchen units.", tag: "from CHF 110/item" },
          { icon: "🔩", title: "Disassembly", text: "Careful disassembly for moving.", tag: "from CHF 38/item" },
          { icon: "🗑️", title: "Removal", text: "Old furniture and packaging removed.", tag: "from CHF 120" },
          { icon: "🧱", title: "Wall mounting", text: "Anti-tip securing.", tag: "CHF 60" },
        ],
        about: {
          title: "Precise, fast, discreet assemblers",
          text: "MeubleMontage Pro has assembled furniture for individuals, shops and hotels in Geneva since 2016. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Full toolkit", "we bring all the equipment we need."], ["Floor protection", "protective mats and clean-up at the end of the job."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "022 000 00 15", email: "hello@meublemontage.demo", zone: "Geneva, Nyon, Lausanne", hours: "Mon–Sat, 8am–7pm" },
        devisNote: "Answer a few questions about your furniture — you'll receive a real quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe your furniture…",
        pdfCompany: { name: "MeubleMontage Pro Sàrl", address: "Rue de Carouge 55, 1205 Genève", phone: "022 000 00 15", email: "hello@meublemontage.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your furniture, then give you a firm quote right after.",
        addressPlaceholder: "Service address (street, postcode, town)",
        terms: "Firm quote, valid 30 days, for the number of items indicated. Missing or defective parts not included. Swiss VAT included where applicable.",
        q: {
          service: { text: "Which service would you like?", short: "Service", opts: { assemble: "Assembly of new furniture", dismantle: "Disassembly", move: "Disassembly + reassembly (moving)", haul: "Assembly + removal of old furniture" } },
          pieces: { text: "How many items of furniture are involved?", short: "Furniture", opts: { p1: "1 to 2 items", p2: "3 to 5 items", p3: "6 to 10 items", p4: "11 items or more" } },
          complexity: { text: "How complex is the furniture?", short: "Complexity", opts: { simple: "Simple (screw-together kits)", medium: "Medium (wardrobes, beds, dressers)", complex: "Complex (kitchens, sliding doors, custom)" } },
          floor: { text: "What's the access to the home like?", short: "Access", opts: { ground: "Ground floor or lift", stairs: "Floors without lift" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { wall: "Anti-tip wall mounting", waste: "Packaging removal", adjust: "Door and drawer adjustment", light: "Simple electrical connection (light fixtures)" } },
          date: { text: "What date would you like the service to take place?", short: "Preferred date" },
        },
        items: {
          work_assemble: "Furniture assembly ({n} items)",
          work_dismantle: "Furniture disassembly ({n} items)",
          work_move: "Disassembly + reassembly ({n} items)",
          work_haul: "Furniture assembly ({n} items)",
          haul: "Removal of old furniture ({n} items)",
          stairs: "Floors without lift",
          wall: "Anti-tip wall mounting",
          waste: "Packaging removal",
          adjust: "Door and drawer adjustment",
          light: "Simple electrical connection",
        },
      },
    },

    // ---- German texts (Swiss High German — no ß) ----
    de: {
      label: "Möbelmontage und -demontage",
      forWho: "Unternehmen für Möbelmontage und -demontage",
      pitch: "Berechnen Sie Montage, Demontage und Entsorgung nach Anzahl der Möbelstücke.",
      emailNoun: "die Montage Ihrer Möbel",
      landing: {
        h1: ["SIE MONTIEREN.", "DEALZ RECHNET."],
        question: "Wie viele Montageanfragen verlieren Sie, weil Sie gerade mit einem Schrank beschäftigt sind?",
        text: "Der Kunde hat seine Möbel erhalten und möchte dieses Wochenende einen Monteur. Dealz antwortet sofort, stellt die richtigen Fragen (Anzahl Möbelstücke, Komplexität, Etagen, Optionen), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Montage von 4 Möbelstücken, darunter ein Schrank und ein Bett?",
        values: [
          { icon: "🧩", title: "Ein Preis nach Komplexität", text: "Einfache Möbel, Schränke, Küchen: Ihre Tarife pro Möbelstück gelten automatisch." },
          { icon: "🔁", title: "Montage, Demontage, Umzug", text: "Vier Leistungsarten mit den passenden Fragen für jede berechnet." },
          { icon: "🪜", title: "Etagen ohne Lift berücksichtigt", text: "Der Tragezuschlag wird ohne Verhandlung hinzugefügt." },
          { icon: "🧰", title: "Leicht verkäufliche Zusatzoptionen", text: "Wandmontage, Einstellungen, Entsorgung der Verpackung: jede Option wird mit einem Klick zur Offerte hinzugefügt." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Möbelstück nach Komplexität, Demontage, Entsorgung, Etagenzuschlag, Optionen. Ihr Excel bleibt Ihr Arbeitsinstrument.",
        step2: "Die Engine versteht Ihre Leistungsarten, Komplexitätsstufen, Zugänge und Optionen.",
        excel: { file: "tarife-montage.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Möbelmontage", "4 Stück · mittel", "CHF 250"], ["Etagen ohne Lift", "Pauschale", "CHF 60"], ["Wandmontage", "Kippschutz", "CHF 60"]] },
        chat: ["«Ich muss einen Schrank und ein Bett montieren lassen, die ich gerade erhalten habe.»", "«Wie viele Möbelstücke insgesamt und welche Komplexität?»", "«Wünschen Sie die Wandmontage und die Entsorgung der Verpackung?»"],
        offer: { company: "MeubleMontage Pro Sàrl", rows: [["Möbelmontage (4 Stück)", 250], ["Etagen ohne Lift", 60], ["Wandmontage", 60]] },
        roi: "Schon ein einziger zusätzlicher Montageauftrag pro Woche kann Ihr Abonnement decken.",
      },
      demo: {
        brand: "MeubleMontage Pro",
        eyebrow: "Genf & Umgebung · Fiktives Beispiel",
        hero: { h1: "Ihre Möbel montiert, ohne Anleitung.", text: "Montage, Demontage, erneute Montage und Entsorgung von Möbeln in Genf — erhalten Sie in Sekunden einen festen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "7500+", lbl: "MONTIERTE MÖBEL" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir montieren",
        servicesSub: "Wählen Sie eine Leistung oder beschreiben Sie Ihr Anliegen einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🛏️", title: "Betten und Kommoden", text: "Schnelle und sorgfältige Montage.", tag: "ab CHF 62/Stück" },
          { icon: "🚪", title: "Schränke und Kleiderschränke", text: "Inklusive Schiebetüren.", tag: "ab CHF 62/Stück" },
          { icon: "🍳", title: "Küchen", text: "Montage komplexer Küchenmöbel.", tag: "ab CHF 110/Stück" },
          { icon: "🔩", title: "Demontage", text: "Sorgfältige Demontage für den Umzug.", tag: "ab CHF 38/Stück" },
          { icon: "🗑️", title: "Entsorgung", text: "Alte Möbel und Verpackungen werden entsorgt.", tag: "ab CHF 120" },
          { icon: "🧱", title: "Wandmontage", text: "Kippschutz-Sicherung.", tag: "CHF 60" },
        ],
        about: {
          title: "Präzise, schnelle und diskrete Monteure",
          text: "MeubleMontage Pro montiert seit 2016 Möbel für Privatpersonen, Geschäfte und Hotels in Genf. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Vollständiges Werkzeug", "wir bringen das gesamte benötigte Material mit."], ["Bodenschutz", "Schutzmatten und Reinigung am Ende der Arbeiten."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "022 000 00 15", email: "hello@meublemontage.demo", zone: "Genf, Nyon, Lausanne", hours: "Mo–Sa, 8–19 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Möbeln — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Möbel…",
        pdfCompany: { name: "MeubleMontage Pro Sàrl", address: "Rue de Carouge 55, 1205 Genève", phone: "022 000 00 15", email: "hello@meublemontage.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Möbeln und erstelle Ihnen direkt danach eine feste Offerte.",
        addressPlaceholder: "Einsatzadresse (Strasse, PLZ, Ort)",
        terms: "Feste Offerte, 30 Tage gültig, für die angegebene Anzahl Möbelstücke. Fehlende oder defekte Teile nicht inbegriffen. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          service: { text: "Welche Leistung wünschen Sie?", short: "Leistung", opts: { assemble: "Montage neuer Möbel", dismantle: "Demontage", move: "Demontage + erneute Montage (Umzug)", haul: "Montage + Entsorgung alter Möbel" } },
          pieces: { text: "Wie viele Möbelstücke sind betroffen?", short: "Möbel", opts: { p1: "1 bis 2 Stück", p2: "3 bis 5 Stück", p3: "6 bis 10 Stück", p4: "11 Stück oder mehr" } },
          complexity: { text: "Wie komplex sind die Möbel?", short: "Komplexität", opts: { simple: "Einfach (Schraub-Kits)", medium: "Mittel (Schränke, Betten, Kommoden)", complex: "Komplex (Küche, Schiebetüren, Massanfertigung)" } },
          floor: { text: "Wie ist der Zugang zur Wohnung?", short: "Zugang", opts: { ground: "Erdgeschoss oder Lift", stairs: "Etagen ohne Lift" } },
          extras: { text: "Wünschen Sie Zusatzoptionen?", short: "Optionen", none: "Keine Option", opts: { wall: "Kippschutz-Wandmontage", waste: "Entsorgung der Verpackung", adjust: "Einstellung von Türen und Schubladen", light: "Einfacher Elektroanschluss (Leuchten)" } },
          date: { text: "Für welches Datum wünschen Sie den Einsatz?", short: "Wunschtermin" },
        },
        items: {
          work_assemble: "Möbelmontage ({n} Stück)",
          work_dismantle: "Möbeldemontage ({n} Stück)",
          work_move: "Demontage + erneute Montage ({n} Stück)",
          work_haul: "Möbelmontage ({n} Stück)",
          haul: "Entsorgung alter Möbel ({n} Stück)",
          stairs: "Etagen ohne Lift",
          wall: "Kippschutz-Wandmontage",
          waste: "Entsorgung der Verpackung",
          adjust: "Einstellung von Türen und Schubladen",
          light: "Einfacher Elektroanschluss",
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
