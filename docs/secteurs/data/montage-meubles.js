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
    en: {
      label: "Furniture assembly and disassembly",
      forWho: "furniture assembly and disassembly companies",
      pitch: "Price assembly, disassembly and removal by number of pieces.",
      emailNoun: "your furniture assembly",
      landing: {
        h1: ["YOU ASSEMBLE.", "DEALZ PRICES."],
        question: "How many assembly requests do you lose because your hands are inside a wardrobe?",
        text: "The customer has received their furniture and wants a fitter this weekend. Dealz answers right away, asks the right questions (number of pieces, complexity, floors, options), calculates your price from your rates and prepares the quote.",
        clientQ: "How much to assemble 4 pieces including a wardrobe and a bed?",
        values: [
          { icon: "🧩", title: "A price based on complexity", text: "Simple furniture, wardrobes, kitchens: your per-piece rates apply automatically." },
          { icon: "🔁", title: "Assembly, disassembly, moving", text: "Four service types priced, with the right questions for each." },
          { icon: "🪜", title: "Floors without a lift taken into account", text: "The carrying surcharge is added without haggling." },
          { icon: "🧰", title: "Options that are easy to sell", text: "Wall anchoring, adjustments, packaging removal: each option is added in one click." },
        ],
        step1: "Import your rates: price per piece by complexity, disassembly, removal, floor surcharge, options. Your Excel stays your working tool.",
        step2: "The engine understands your service types, complexity levels, access conditions and options.",
        excel: { file: "assembly-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Furniture assembly", "4 pieces · medium", "CHF 250"], ["Floors without a lift", "Flat fee", "CHF 60"], ["Wall anchoring", "Anti-tip", "CHF 60"]] },
        chat: ["“I need a wardrobe and a bed I've just received assembled.”", "“How many pieces in total, and how complex are they?”", "“Would you like wall anchoring and packaging removal?”"],
        offer: { company: "MeubleMontage Pro Sàrl", rows: [["Furniture assembly (4 pieces)", 250], ["Floors without a lift", 60], ["Wall anchoring", 60]] },
        roi: "A single extra assembly job a week can already pay for your subscription.",
      },
      demo: {
        brand: "MeubleMontage Pro",
        eyebrow: "Geneva & surroundings · Fictional example",
        hero: { h1: "Your furniture assembled, without the instructions.", text: "Assembly, disassembly, reassembly and removal of furniture in Geneva — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "7,500+", lbl: "PIECES ASSEMBLED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we assemble",
        servicesSub: "Pick a service, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "🛏️", title: "Beds and chests of drawers", text: "Quick, careful assembly.", tag: "from CHF 62/piece" },
          { icon: "🚪", title: "Wardrobes", text: "Including sliding doors.", tag: "from CHF 62/piece" },
          { icon: "🍳", title: "Kitchens", text: "Assembly of complex kitchen units.", tag: "from CHF 110/piece" },
          { icon: "🔩", title: "Disassembly", text: "Careful disassembly for a move.", tag: "from CHF 38/piece" },
          { icon: "🗑️", title: "Removal", text: "Old furniture and packaging taken away.", tag: "from CHF 120" },
          { icon: "🧱", title: "Wall anchoring", text: "Anti-tip safety fixing.", tag: "CHF 60" },
        ],
        about: {
          title: "Precise, fast, discreet fitters",
          text: "MeubleMontage Pro has been assembling furniture for Geneva households, shops and hotels since 2016. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Full toolkit", "we bring all the equipment needed."], ["Floor protection", "protective mats and a clean-up at the end."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "022 000 00 15", email: "hello@meublemontage.demo", zone: "Geneva, Nyon, Lausanne", hours: "Mon–Sat, 8am–7pm" },
        devisNote: "Answer a few questions about your furniture — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your furniture…",
        pdfCompany: { name: "MeubleMontage Pro Sàrl", address: "Rue de Carouge 55, 1205 Genève", phone: "022 000 00 15", email: "hello@meublemontage.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your furniture, then put together a firm quote right away.",
        addressPlaceholder: "Job address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, for the number of pieces stated. Missing or defective parts not included. Swiss VAT included where applicable.",
        q: {
          service: { text: "Which service would you like?", short: "Service", opts: { assemble: "Assembly of new furniture", dismantle: "Disassembly", move: "Disassembly + reassembly (moving)", haul: "Assembly + removal of old furniture" } },
          pieces: { text: "How many pieces of furniture are involved?", short: "Furniture", opts: { p1: "1 to 2 pieces", p2: "3 to 5 pieces", p3: "6 to 10 pieces", p4: "11 pieces or more" } },
          complexity: { text: "How complex is the furniture?", short: "Complexity", opts: { simple: "Simple (screw-together kits)", medium: "Medium (wardrobes, beds, chests of drawers)", complex: "Complex (kitchen, sliding doors, custom-made)" } },
          floor: { text: "What is access to the home like?", short: "Access", opts: { ground: "Ground floor or lift", stairs: "Upper floors without a lift" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { wall: "Anti-tip wall anchoring", waste: "Packaging removal", adjust: "Door and drawer adjustment", light: "Simple electrical connection (light fittings)" } },
          date: { text: "What date would you like the job done?", short: "Preferred date" },
        },
        items: {
          work_assemble: "Furniture assembly ({n} pieces)",
          work_dismantle: "Furniture disassembly ({n} pieces)",
          work_move: "Disassembly + reassembly ({n} pieces)",
          work_haul: "Furniture assembly ({n} pieces)",
          haul: "Removal of old furniture ({n} pieces)",
          stairs: "Floors without a lift",
          wall: "Anti-tip wall anchoring",
          waste: "Packaging removal",
          adjust: "Door and drawer adjustment",
          light: "Simple electrical connection",
        },
      },
    },
    de: {
      label: "Möbelmontage und -demontage",
      forWho: "Möbelmontage- und Demontagefirmen",
      pitch: "Montage, Demontage und Entsorgung nach Anzahl Möbelstücke berechnen.",
      emailNoun: "die Montage Ihrer Möbel",
      landing: {
        h1: ["SIE MONTIEREN.", "DEALZ RECHNET."],
        question: "Wie viele Montageanfragen verlieren Sie, weil Sie gerade in einem Schrank stecken?",
        text: "Der Kunde hat seine Möbel erhalten und will dieses Wochenende einen Monteur. Dealz antwortet sofort, stellt die richtigen Fragen (Anzahl Stücke, Komplexität, Stockwerke, Optionen), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Montage von 4 Möbeln, darunter ein Schrank und ein Bett?",
        values: [
          { icon: "🧩", title: "Ein Preis nach Komplexität", text: "Einfache Möbel, Schränke, Küchen: Ihre Stücktarife werden automatisch angewendet." },
          { icon: "🔁", title: "Montage, Demontage, Umzug", text: "Vier Leistungsarten berechnet, mit den richtigen Fragen für jede." },
          { icon: "🪜", title: "Stockwerke ohne Lift berücksichtigt", text: "Der Tragzuschlag wird ohne Diskussion hinzugefügt." },
          { icon: "🧰", title: "Optionen leicht verkauft", text: "Wandbefestigung, Einstellungen, Verpackungsentsorgung: Jede Option wird mit einem Klick hinzugefügt." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Stück nach Komplexität, Demontage, Entsorgung, Stockwerkzuschlag, Optionen. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Leistungsarten, Komplexitätsstufen, Zugänge und Optionen.",
        excel: { file: "tarife-montage.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Möbelmontage", "4 Stück · mittel", "CHF 250"], ["Stockwerke ohne Lift", "Pauschale", "CHF 60"], ["Wandbefestigung", "Kippschutz", "CHF 60"]] },
        chat: ["«Ich muss einen Schrank und ein Bett, die ich gerade erhalten habe, montieren lassen.»", "«Wie viele Stücke insgesamt, und wie komplex sind sie?»", "«Wünschen Sie die Wandbefestigung und die Entsorgung der Verpackung?»"],
        offer: { company: "MeubleMontage Pro Sàrl", rows: [["Möbelmontage (4 Stück)", 250], ["Stockwerke ohne Lift", 60], ["Wandbefestigung", 60]] },
        roi: "Eine einzige zusätzliche Montage pro Woche kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "MeubleMontage Pro",
        eyebrow: "Genf & Umgebung · Fiktives Beispiel",
        hero: { h1: "Ihre Möbel montiert, ohne Anleitung.", text: "Montage, Demontage, Wiedermontage und Entsorgung von Möbeln in Genf — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "7'500+", lbl: "MONTIERTE MÖBEL" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir montieren",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihren Bedarf einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🛏️", title: "Betten und Kommoden", text: "Schnelle, sorgfältige Montage.", tag: "ab CHF 62/Stück" },
          { icon: "🚪", title: "Schränke", text: "Inklusive Schiebetüren.", tag: "ab CHF 62/Stück" },
          { icon: "🍳", title: "Küchen", text: "Montage komplexer Küchenmöbel.", tag: "ab CHF 110/Stück" },
          { icon: "🔩", title: "Demontage", text: "Sorgfältige Demontage für den Umzug.", tag: "ab CHF 38/Stück" },
          { icon: "🗑️", title: "Entsorgung", text: "Alte Möbel und Verpackungen entsorgt.", tag: "ab CHF 120" },
          { icon: "🧱", title: "Wandbefestigung", text: "Sicherung gegen Umkippen.", tag: "CHF 60" },
        ],
        about: {
          title: "Präzise, schnelle, diskrete Monteure",
          text: "MeubleMontage Pro montiert seit 2016 Möbel für Genfer Privatpersonen, Geschäfte und Hotels. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Komplettes Werkzeug", "wir bringen alles nötige Material mit."], ["Bodenschutz", "Schutzmatten und Reinigung nach Abschluss."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "022 000 00 15", email: "hello@meublemontage.demo", zone: "Genf, Nyon, Lausanne", hours: "Mo–Sa, 8–19 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Möbeln — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Möbel…",
        pdfCompany: { name: "MeubleMontage Pro Sàrl", address: "Rue de Carouge 55, 1205 Genève", phone: "022 000 00 15", email: "hello@meublemontage.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Möbeln und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Einsatzadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, für die angegebene Anzahl Stücke. Fehlende oder defekte Teile nicht inbegriffen. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          service: { text: "Welche Leistung wünschen Sie?", short: "Leistung", opts: { assemble: "Montage neuer Möbel", dismantle: "Demontage", move: "Demontage + Wiedermontage (Umzug)", haul: "Montage + Entsorgung alter Möbel" } },
          pieces: { text: "Wie viele Möbelstücke sind betroffen?", short: "Möbel", opts: { p1: "1 bis 2 Stück", p2: "3 bis 5 Stück", p3: "6 bis 10 Stück", p4: "11 Stück oder mehr" } },
          complexity: { text: "Wie komplex sind die Möbel?", short: "Komplexität", opts: { simple: "Einfach (Bausätze zum Schrauben)", medium: "Mittel (Schränke, Betten, Kommoden)", complex: "Komplex (Küche, Schiebetüren, Massanfertigung)" } },
          floor: { text: "Wie ist der Zugang zur Wohnung?", short: "Zugang", opts: { ground: "Erdgeschoss oder Lift", stairs: "Stockwerke ohne Lift" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { wall: "Wandbefestigung als Kippschutz", waste: "Entsorgung der Verpackungen", adjust: "Einstellen von Türen und Schubladen", light: "Einfacher Elektroanschluss (Leuchten)" } },
          date: { text: "Für welches Datum wünschen Sie den Einsatz?", short: "Wunschdatum" },
        },
        items: {
          work_assemble: "Möbelmontage ({n} Stück)",
          work_dismantle: "Möbeldemontage ({n} Stück)",
          work_move: "Demontage + Wiedermontage ({n} Stück)",
          work_haul: "Möbelmontage ({n} Stück)",
          haul: "Entsorgung alter Möbel ({n} Stück)",
          stairs: "Stockwerke ohne Lift",
          wall: "Wandbefestigung als Kippschutz",
          waste: "Entsorgung der Verpackungen",
          adjust: "Einstellen von Türen und Schubladen",
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
