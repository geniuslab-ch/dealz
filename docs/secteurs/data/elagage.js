/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  function isTree(a) { return a.work.id === "prune" || a.work.id === "fell"; }
  var S = {
    slug: "elagage",
    icon: "🌳",
    needsAddress: true,
    colors: { main: "#2f9e44", dark: "#237a35", light: "#d3f9d8", accent: "#a0522d", accentDark: "#7b3f21", bg: "#f8fdf8" },

    quote: {
      minimum: 350,
      questions: [
        { id: "work", type: "single", options: [{ id: "prune" }, { id: "fell" }, { id: "stump" }, { id: "hedge" }] },
        {
          id: "count", type: "single",
          when: function (a) { return a.work.id !== "hedge"; },
          options: [{ id: "t1", n: 1 }, { id: "t2", n: 3 }, { id: "t3", n: 5 }],
        },
        {
          id: "height", type: "single",
          when: isTree,
          options: [{ id: "h1", prune: 380, fell: 650 }, { id: "h2", prune: 690, fell: 1250 }, { id: "h3", prune: 1200, fell: 2400 }],
        },
        {
          id: "access", type: "single",
          when: isTree,
          options: [{ id: "easy", k: 1 }, { id: "tight", k: 1.35 }],
        },
        {
          id: "length", type: "single",
          when: function (a) { return a.work.id === "hedge"; },
          options: [{ id: "l1", m: 10 }, { id: "l2", m: 25 }, { id: "l3", m: 50 }, { id: "l4", m: 100 }],
        },
        { id: "extras", type: "multi", options: [{ id: "removal" }, { id: "chip" }, { id: "grind" }, { id: "lift" }] },
        { id: "date", type: "date", minDays: 5 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var w = a.work.id;
        var n = a.count ? a.count.n : 0;
        if (isTree(a)) {
          items.push({ label: L("work_" + w, { n: n }), amount: H.round5(n * a.height[w] * a.access.k) });
        } else if (w === "stump") {
          items.push({ label: L("stump", { n: n }), amount: H.round5(n * 280 + 120) });
        } else {
          items.push({ label: L("hedge", { m: a.length.m }), amount: H.round5(a.length.m * 14 + 90) });
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "removal") items.push({ label: L("removal"), amount: w === "hedge" ? H.round5(a.length.m * 3 + 90) : H.round5(n * 180) });
          if (e.id === "chip") items.push({ label: L("chip"), amount: 150 });
          if (e.id === "grind" && w === "fell") items.push({ label: L("grind", { n: n }), amount: H.round5(n * 280) });
          if (e.id === "lift") items.push({ label: L("lift"), amount: 450 });
        });
        return items;
      },
    },

    fr: {
      label: "Élagage et abattage",
      forWho: "élagueurs, arboristes et entreprises d'abattage",
      pitch: "Chiffrez élagages, abattages, dessouchages et tailles de haies pendant que vous êtes dans les arbres.",
      emailNoun: "vos travaux d'élagage",
      landing: {
        h1: ["VOUS GRIMPEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes d'élagage restent sans réponse parce que vous êtes à 15 mètres du sol ?",
        text: "Arbre trop proche de la maison, haie à tailler, souche à retirer : vos clients veulent un prix avant de vous faire venir. Dealz leur répond à toute heure, pose les bonnes questions (type de travaux, nombre d'arbres, hauteur, accès), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour abattre un grand sapin de 15 mètres près de la maison ?",
        values: [
          { icon: "📏", title: "Hauteur et accès chiffrés", text: "Arbre de moins de 8 m ou de plus de 15 m, près d'une maison ou d'une ligne : chaque cas suit votre propre grille." },
          { icon: "🪵", title: "Évacuation et broyage vendus", text: "Évacuation des branches, broyage sur place, rognage de souche : proposés dans chaque devis." },
          { icon: "🌿", title: "Haies au mètre", text: "Le client indique la longueur de sa haie, le prix tombe tout de suite." },
          { icon: "🚜", title: "Moins de visites inutiles", text: "Vous ne vous déplacez plus pour un simple devis : seulement pour les chantiers confirmés." },
        ],
        step1: "Importez vos tarifs : prix par arbre selon la hauteur, majoration d'accès, haies au mètre, évacuation, nacelle. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos hauteurs, vos quantités et vos options.",
        excel: { file: "tarifs-elagage.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Abattage", "1 arbre · plus de 15 m · accès difficile", "CHF 3 240"], ["Rognage de souche", "1 souche", "CHF 280"], ["Évacuation des branches", "1 arbre", "CHF 180"]] },
        chat: ["« Le sapin devant la maison devient dangereux. »", "« Quelle est la hauteur approximative de l'arbre ? »", "« Est-il proche de la maison ou d'une ligne électrique ? »"],
        offer: { company: "Cime Élagage Sàrl", rows: [["Abattage d'arbre (1 arbre)", 3240], ["Rognage de souche", 280], ["Évacuation des branches", 180]] },
        roi: "Deux abattages supplémentaires par an paient plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Cime Élagage",
        eyebrow: "Gruyère & Veveyse · Exemple fictif",
        hero: { h1: "Des arbres sains et sûrs, avec un prix clair en une minute.", text: "Élagage, abattage, dessouchage et taille de haies dans le canton de Fribourg — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "3 000+", lbl: "ARBRES TRAITÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "✂️", title: "Élagage et taille", text: "Taille douce, allègement, mise en sécurité.", tag: "dès CHF 380" },
          { icon: "🪓", title: "Abattage", text: "Abattage direct ou par démontage.", tag: "dès CHF 650" },
          { icon: "🪵", title: "Dessouchage", text: "Rognage de souches à la machine.", tag: "dès CHF 280" },
          { icon: "🌿", title: "Taille de haies", text: "Haies de thuyas, laurelles, charmilles.", tag: "dès CHF 14/m" },
          { icon: "♻️", title: "Évacuation et broyage", text: "Branches évacuées ou broyées sur place.", tag: "dès CHF 150" },
          { icon: "🏗️", title: "Travaux en nacelle", text: "Pour les arbres hauts et difficiles d'accès.", tag: "CHF 450" },
        ],
        about: {
          title: "Des arboristes formés et assurés",
          text: "Cime Élagage prend soin des arbres des particuliers, communes et régies de la Gruyère et de la Veveyse depuis 2013. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Grimpeurs certifiés", "techniques de taille respectueuses de l'arbre."], ["Assurance complète", "responsabilité civile pour travaux à risque."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "026 000 01 10", email: "hello@cime-elagage.demo", zone: "Fribourg, Vaud (Est)", hours: "Lun–Sam, 7h–18h" },
        devisNote: "Répondez à quelques questions sur vos arbres — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos travaux d'élagage…",
        pdfCompany: { name: "Cime Élagage Sàrl", address: "Rue de Vevey 112, 1630 Bulle", phone: "026 000 01 10", email: "hello@cime-elagage.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur vos arbres, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du terrain (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, main-d'œuvre et matériel compris. Autorisation communale d'abattage à la charge du propriétaire si nécessaire.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { prune: "Élagage ou taille d'arbre", fell: "Abattage d'arbre", stump: "Dessouchage (retrait de souche)", hedge: "Taille de haie" } },
          count: { text: "Combien d'arbres ou de souches ?", short: "Nombre", opts: { t1: "1", t2: "2 ou 3", t3: "4 à 6" } },
          height: { text: "Quelle est la hauteur des arbres ?", short: "Hauteur", opts: { h1: "Moins de 8 m", h2: "8 à 15 m", h3: "Plus de 15 m" } },
          access: { text: "Comment est l'accès ?", short: "Accès", opts: { easy: "Facile (jardin dégagé)", tight: "Difficile (près d'une maison, d'une route ou d'une ligne)" } },
          length: { text: "Quelle est la longueur de la haie ?", short: "Longueur", opts: { l1: "Environ 10 m", l2: "Environ 25 m", l3: "Environ 50 m", l4: "100 m ou plus" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { removal: "Évacuation des branches", chip: "Broyage sur place (paillage)", grind: "Rognage de la souche après abattage", lift: "Intervention en nacelle" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          work_prune: "Élagage et taille (× {n})",
          work_fell: "Abattage d'arbre (× {n})",
          stump: "Dessouchage (× {n})",
          hedge: "Taille de haie ({m} m)",
          removal: "Évacuation des branches",
          chip: "Broyage sur place",
          grind: "Rognage de souche (× {n})",
          lift: "Intervention en nacelle",
        },
      },
    },
    en: {
      label: "Tree surgery and felling",
      forWho: "tree surgeons, arborists and felling companies",
      pitch: "Price pruning, felling, stump removal and hedge trimming while you're up in the trees.",
      emailNoun: "your tree work",
      landing: {
        h1: ["YOU CLIMB.", "DEALZ PRICES."],
        question: "How many tree-work requests go unanswered because you're 15 metres off the ground?",
        text: "A tree too close to the house, a hedge to trim, a stump to remove: your customers want a price before calling you out. Dealz answers them at any hour, asks the right questions (type of work, number of trees, height, access), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to fell a large 15-metre fir tree near the house?",
        values: [
          { icon: "📏", title: "Height and access priced", text: "A tree under 8 m or over 15 m, near a house or a power line: each case follows your own price grid." },
          { icon: "🪵", title: "Removal and chipping sold", text: "Branch removal, on-site chipping, stump grinding: offered in every quote." },
          { icon: "🌿", title: "Hedges by the metre", text: "The customer gives the length of their hedge, and the price appears straight away." },
          { icon: "🚜", title: "Fewer wasted visits", text: "No more travelling just for a quote: only for confirmed jobs." },
        ],
        step1: "Import your rates: price per tree by height, access surcharge, hedges per metre, removal, aerial lift. Your Excel stays your working tool.",
        step2: "The engine understands your heights, your quantities and your options.",
        excel: { file: "tree-work-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["Felling", "1 tree · over 15 m · tight access", "CHF 3,240"], ["Stump grinding", "1 stump", "CHF 280"], ["Branch removal", "1 tree", "CHF 180"]] },
        chat: ["“The fir in front of the house is getting dangerous.”", "“Roughly how tall is the tree?”", "“Is it close to the house or a power line?”"],
        offer: { company: "Cime Élagage Sàrl", rows: [["Tree felling (1 tree)", 3240], ["Stump grinding", 280], ["Branch removal", 180]] },
        roi: "Two extra felling jobs a year pay for several years of subscription.",
      },
      demo: {
        brand: "Cime Élagage",
        eyebrow: "Gruyère & Veveyse · Fictional example",
        hero: { h1: "Healthy, safe trees, with a clear price in a minute.", text: "Pruning, felling, stump removal and hedge trimming in the canton of Fribourg — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "3,000+", lbl: "TREES TREATED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our work",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "✂️", title: "Pruning and trimming", text: "Gentle pruning, crown reduction, making safe.", tag: "from CHF 380" },
          { icon: "🪓", title: "Felling", text: "Straight felling or sectional dismantling.", tag: "from CHF 650" },
          { icon: "🪵", title: "Stump removal", text: "Machine stump grinding.", tag: "from CHF 280" },
          { icon: "🌿", title: "Hedge trimming", text: "Thuja, laurel and hornbeam hedges.", tag: "from CHF 14/m" },
          { icon: "♻️", title: "Removal and chipping", text: "Branches taken away or chipped on site.", tag: "from CHF 150" },
          { icon: "🏗️", title: "Aerial lift work", text: "For tall, hard-to-reach trees.", tag: "CHF 450" },
        ],
        about: {
          title: "Trained, insured arborists",
          text: "Since 2013, Cime Élagage has cared for the trees of households, municipalities and property managers in the Gruyère and Veveyse regions. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Certified climbers", "pruning techniques that respect the tree."], ["Fully insured", "liability cover for high-risk work."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "026 000 01 10", email: "hello@cime-elagage.demo", zone: "Fribourg, eastern Vaud", hours: "Mon–Sat, 7am–6pm" },
        devisNote: "Answer a few questions about your trees — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your tree work…",
        pdfCompany: { name: "Cime Élagage Sàrl", address: "Rue de Vevey 112, 1630 Bulle", phone: "026 000 01 10", email: "hello@cime-elagage.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your trees, then put together a firm quote right away.",
        addressPlaceholder: "Property address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, labour and equipment included. Any municipal felling permit is the owner's responsibility.",
        q: {
          work: { text: "What kind of work do you need?", short: "Work", opts: { prune: "Tree pruning or trimming", fell: "Tree felling", stump: "Stump removal", hedge: "Hedge trimming" } },
          count: { text: "How many trees or stumps?", short: "Number", opts: { t1: "1", t2: "2 or 3", t3: "4 to 6" } },
          height: { text: "How tall are the trees?", short: "Height", opts: { h1: "Under 8 m", h2: "8 to 15 m", h3: "Over 15 m" } },
          access: { text: "What is the access like?", short: "Access", opts: { easy: "Easy (open garden)", tight: "Tight (near a house, road or power line)" } },
          length: { text: "How long is the hedge?", short: "Length", opts: { l1: "About 10 m", l2: "About 25 m", l3: "About 50 m", l4: "100 m or more" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { removal: "Branch removal", chip: "On-site chipping (mulch)", grind: "Stump grinding after felling", lift: "Aerial lift work" } },
          date: { text: "When would you like the work done?", short: "Preferred date" },
        },
        items: {
          work_prune: "Pruning and trimming (× {n})",
          work_fell: "Tree felling (× {n})",
          stump: "Stump removal (× {n})",
          hedge: "Hedge trimming ({m} m)",
          removal: "Branch removal",
          chip: "On-site chipping",
          grind: "Stump grinding (× {n})",
          lift: "Aerial lift work",
        },
      },
    },
    de: {
      label: "Baumpflege und Baumfällung",
      forWho: "Baumpfleger, Arboristen und Fällbetriebe",
      pitch: "Baumpflege, Fällungen, Wurzelstockfräsen und Heckenschnitt berechnen — während Sie im Baum sind.",
      emailNoun: "Ihre Baumarbeiten",
      landing: {
        h1: ["SIE KLETTERN.", "DEALZ RECHNET."],
        question: "Wie viele Baumpflege-Anfragen bleiben unbeantwortet, weil Sie 15 Meter über dem Boden sind?",
        text: "Ein Baum zu nah am Haus, eine Hecke zum Schneiden, ein Wurzelstock zum Entfernen: Ihre Kunden wollen einen Preis, bevor Sie vorbeikommen. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Art der Arbeiten, Anzahl Bäume, Höhe, Zugang), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet es, eine 15 Meter hohe Tanne nahe am Haus zu fällen?",
        values: [
          { icon: "📏", title: "Höhe und Zugang berechnet", text: "Baum unter 8 m oder über 15 m, nahe am Haus oder an einer Leitung: Jeder Fall folgt Ihrem eigenen Tarif." },
          { icon: "🪵", title: "Abtransport und Häckseln verkauft", text: "Astabfuhr, Häckseln vor Ort, Wurzelstockfräsen: in jeder Offerte angeboten." },
          { icon: "🌿", title: "Hecken pro Meter", text: "Der Kunde gibt die Länge seiner Hecke an, der Preis kommt sofort." },
          { icon: "🚜", title: "Weniger unnötige Fahrten", text: "Keine Fahrt mehr nur für eine Offerte: nur noch für bestätigte Aufträge." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Baum nach Höhe, Zugangszuschlag, Hecken pro Meter, Abfuhr, Hebebühne. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Höhen, Ihre Stückzahlen und Ihre Optionen.",
        excel: { file: "tarife-baumpflege.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Fällung", "1 Baum · über 15 m · enger Zugang", "CHF 3'240"], ["Wurzelstockfräsen", "1 Stock", "CHF 280"], ["Astabfuhr", "1 Baum", "CHF 180"]] },
        chat: ["«Die Tanne vor dem Haus wird gefährlich.»", "«Wie hoch ist der Baum ungefähr?»", "«Steht er nahe am Haus oder an einer Stromleitung?»"],
        offer: { company: "Cime Élagage Sàrl", rows: [["Baumfällung (1 Baum)", 3240], ["Wurzelstockfräsen", 280], ["Astabfuhr", 180]] },
        roi: "Zwei zusätzliche Fällungen pro Jahr bezahlen mehrere Jahre Abo.",
      },
      demo: {
        brand: "Cime Élagage",
        eyebrow: "Greyerz & Vivisbach · Fiktives Beispiel",
        hero: { h1: "Gesunde, sichere Bäume, mit einem klaren Preis in einer Minute.", text: "Baumpflege, Fällungen, Wurzelstockfräsen und Heckenschnitt im Kanton Freiburg — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "3'000+", lbl: "GEPFLEGTE BÄUME" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Arbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "✂️", title: "Baumpflege und Rückschnitt", text: "Sanfter Schnitt, Kronenentlastung, Sicherung.", tag: "ab CHF 380" },
          { icon: "🪓", title: "Fällung", text: "Direkte Fällung oder Abtragen in Stücken.", tag: "ab CHF 650" },
          { icon: "🪵", title: "Wurzelstockentfernung", text: "Maschinelles Fräsen.", tag: "ab CHF 280" },
          { icon: "🌿", title: "Heckenschnitt", text: "Thuja-, Kirschlorbeer- und Hagebuchenhecken.", tag: "ab CHF 14/m" },
          { icon: "♻️", title: "Abfuhr und Häckseln", text: "Äste abgeführt oder vor Ort gehäckselt.", tag: "ab CHF 150" },
          { icon: "🏗️", title: "Arbeiten mit Hebebühne", text: "Für hohe, schwer zugängliche Bäume.", tag: "CHF 450" },
        ],
        about: {
          title: "Ausgebildete, versicherte Baumpfleger",
          text: "Cime Élagage pflegt seit 2013 die Bäume von Privatpersonen, Gemeinden und Verwaltungen im Greyerzbezirk und im Vivisbachbezirk. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Zertifizierte Kletterer", "baumschonende Schnitttechniken."], ["Vollständig versichert", "Haftpflicht für Risikoarbeiten."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "026 000 01 10", email: "hello@cime-elagage.demo", zone: "Freiburg, östliche Waadt", hours: "Mo–Sa, 7–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Bäumen — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Baumarbeiten…",
        pdfCompany: { name: "Cime Élagage Sàrl", address: "Rue de Vevey 112, 1630 Bulle", phone: "026 000 01 10", email: "hello@cime-elagage.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Bäumen und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse des Grundstücks (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Arbeit und Material inbegriffen. Eine allfällige Fällbewilligung der Gemeinde ist Sache des Eigentümers.",
        q: {
          work: { text: "Welche Arbeiten wünschen Sie?", short: "Arbeiten", opts: { prune: "Baumpflege oder Rückschnitt", fell: "Baumfällung", stump: "Wurzelstock entfernen", hedge: "Heckenschnitt" } },
          count: { text: "Wie viele Bäume oder Wurzelstöcke?", short: "Anzahl", opts: { t1: "1", t2: "2 oder 3", t3: "4 bis 6" } },
          height: { text: "Wie hoch sind die Bäume?", short: "Höhe", opts: { h1: "Unter 8 m", h2: "8 bis 15 m", h3: "Über 15 m" } },
          access: { text: "Wie ist der Zugang?", short: "Zugang", opts: { easy: "Einfach (freier Garten)", tight: "Eng (nahe Haus, Strasse oder Leitung)" } },
          length: { text: "Wie lang ist die Hecke?", short: "Länge", opts: { l1: "Etwa 10 m", l2: "Etwa 25 m", l3: "Etwa 50 m", l4: "100 m oder mehr" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { removal: "Astabfuhr", chip: "Häckseln vor Ort (Mulch)", grind: "Wurzelstockfräsen nach der Fällung", lift: "Arbeiten mit Hebebühne" } },
          date: { text: "Wann wünschen Sie den Einsatz?", short: "Wunschtermin" },
        },
        items: {
          work_prune: "Baumpflege und Rückschnitt (× {n})",
          work_fell: "Baumfällung (× {n})",
          stump: "Wurzelstockentfernung (× {n})",
          hedge: "Heckenschnitt ({m} m)",
          removal: "Astabfuhr",
          chip: "Häckseln vor Ort",
          grind: "Wurzelstockfräsen (× {n})",
          lift: "Arbeiten mit Hebebühne",
        },
      },
    },
    it: {
      label: "Potatura e abbattimento alberi",
      forWho: "potatori, arboricoltori e imprese di abbattimento",
      pitch: "Calcolate potature, abbattimenti, rimozione di ceppi e taglio di siepi mentre siete sugli alberi.",
      emailNoun: "i vostri lavori sugli alberi",
      landing: {
        h1: ["VOI ARRAMPICATE.", "DEALZ FA IL PREVENTIVO."],
        question: "Quante richieste di lavori sugli alberi restano senza risposta perché siete a 15 metri d'altezza?",
        text: "Un albero troppo vicino alla casa, una siepe da tagliare, un ceppo da togliere: i vostri clienti vogliono un prezzo prima di farvi venire. Dealz risponde loro a qualsiasi ora, pone le domande giuste (tipo di lavoro, numero di alberi, altezza, accesso), calcola il vostro prezzo secondo le vostre tariffe e prepara il loro preventivo.",
        clientQ: "Quanto costa abbattere un grande abete di 15 metri vicino alla casa?",
        values: [
          { icon: "📏", title: "Altezza e accesso calcolati", text: "Un albero sotto gli 8 m o oltre i 15 m, vicino a una casa o a una linea elettrica: ogni caso segue il vostro listino." },
          { icon: "🪵", title: "Sgombero e triturazione venduti", text: "Sgombero dei rami, triturazione sul posto, fresatura dei ceppi: proposti in ogni preventivo." },
          { icon: "🌿", title: "Siepi al metro", text: "Il cliente indica la lunghezza della siepe, e il prezzo appare subito." },
          { icon: "🚜", title: "Meno sopralluoghi inutili", text: "Niente più trasferte solo per un preventivo: solo per i lavori confermati." },
        ],
        step1: "Importate le vostre tariffe: prezzo per albero secondo l'altezza, supplemento accesso, siepi al metro, sgombero, piattaforma aerea. Il vostro Excel resta il vostro strumento di lavoro.",
        step2: "Il motore capisce le vostre altezze, le quantità e le opzioni.",
        excel: { file: "tariffe-potatura.xlsx", headers: ["Voce", "Condizione", "Prezzo"], rows: [["Abbattimento", "1 albero · oltre 15 m · accesso difficile", "CHF 3'240"], ["Fresatura ceppo", "1 ceppo", "CHF 280"], ["Sgombero dei rami", "1 albero", "CHF 180"]] },
        chat: ["«L'abete davanti a casa sta diventando pericoloso.»", "«Quanto è alto l'albero, circa?»", "«È vicino alla casa o a una linea elettrica?»"],
        offer: { company: "Cime Élagage Sàrl", rows: [["Abbattimento albero (1 albero)", 3240], ["Fresatura del ceppo", 280], ["Sgombero dei rami", 180]] },
        roi: "Due abbattimenti in più all'anno pagano diversi anni di abbonamento.",
      },
      demo: {
        brand: "Cime Élagage",
        eyebrow: "Gruyère e Veveyse · Esempio fittizio",
        hero: { h1: "Alberi sani e sicuri, con un prezzo chiaro in un minuto.", text: "Potatura, abbattimento, rimozione di ceppi e taglio di siepi nel canton Friburgo: ottenete un prezzo fisso in pochi secondi, direttamente su questo sito." },
        stats: [{ num: "4.9★", lbl: "SODDISFAZIONE CLIENTI" }, { num: "3'000+", lbl: "ALBERI TRATTATI" }, { num: "< 1 min", lbl: "PER UN PREVENTIVO" }],
        servicesTitle: "I nostri lavori",
        servicesSub: "Scegliete un servizio, oppure descrivete semplicemente il vostro progetto nella scheda «Ottenere un preventivo».",
        services: [
          { icon: "✂️", title: "Potatura e sfoltimento", text: "Potatura leggera, riduzione della chioma, messa in sicurezza.", tag: "da CHF 380" },
          { icon: "🪓", title: "Abbattimento", text: "Abbattimento diretto o smontaggio per sezioni.", tag: "da CHF 650" },
          { icon: "🪵", title: "Rimozione di ceppi", text: "Fresatura meccanica dei ceppi.", tag: "da CHF 280" },
          { icon: "🌿", title: "Taglio di siepi", text: "Siepi di tuia, lauro e carpino.", tag: "da CHF 14/m" },
          { icon: "♻️", title: "Sgombero e triturazione", text: "Rami portati via o triturati sul posto.", tag: "da CHF 150" },
          { icon: "🏗️", title: "Lavori con piattaforma aerea", text: "Per alberi alti e difficili da raggiungere.", tag: "CHF 450" },
        ],
        about: {
          title: "Arboricoltori formati e assicurati",
          text: "Dal 2013 Cime Élagage si prende cura degli alberi di privati, comuni e amministrazioni nella Gruyère e nella Veveyse. Nel 2026 abbiamo aggiunto al nostro sito un assistente di preventivi immediato: più veloce per voi, meno burocrazia per noi.",
          bullets: [["Arrampicatori certificati", "tecniche di potatura rispettose dell'albero."], ["Assicurazione completa", "responsabilità civile per i lavori a rischio."], ["Prezzo trasparente", "il preventivo ricevuto è il prezzo pagato."]],
        },
        contact: { phone: "026 000 01 10", email: "hello@cime-elagage.demo", zone: "Friburgo, Vaud orientale", hours: "Lun–Sab, 7–18" },
        devisNote: "Rispondete a qualche domanda sui vostri alberi: riceverete un vero preventivo, che potrete accettare o rifiutare direttamente qui.",
        inputPlaceholder: "Descrivete i vostri lavori sugli alberi…",
        pdfCompany: { name: "Cime Élagage Sàrl", address: "Rue de Vevey 112, 1630 Bulle", phone: "026 000 01 10", email: "hello@cime-elagage.demo" },
      },
      quote: {
        greeting: "Buongiorno! Vi faccio qualche domanda rapida sui vostri alberi, poi vi preparo subito un preventivo fisso.",
        addressPlaceholder: "Indirizzo della proprietà (via, NPA, località)",
        terms: "Preventivo fisso, valido 30 giorni, manodopera e attrezzatura incluse. L'eventuale permesso comunale di abbattimento è a carico del proprietario.",
        q: {
          work: { text: "Che tipo di lavori desiderate?", short: "Lavori", opts: { prune: "Potatura o sfoltimento di alberi", fell: "Abbattimento di alberi", stump: "Rimozione di ceppi", hedge: "Taglio di siepi" } },
          count: { text: "Quanti alberi o ceppi?", short: "Numero", opts: { t1: "1", t2: "2 o 3", t3: "Da 4 a 6" } },
          height: { text: "Quanto sono alti gli alberi?", short: "Altezza", opts: { h1: "Meno di 8 m", h2: "Da 8 a 15 m", h3: "Oltre 15 m" } },
          access: { text: "Com'è l'accesso?", short: "Accesso", opts: { easy: "Facile (giardino libero)", tight: "Difficile (vicino a casa, strada o linea elettrica)" } },
          length: { text: "Quanto è lunga la siepe?", short: "Lunghezza", opts: { l1: "Circa 10 m", l2: "Circa 25 m", l3: "Circa 50 m", l4: "100 m e oltre" } },
          extras: { text: "Desiderate delle opzioni?", short: "Opzioni", none: "Nessuna opzione", opts: { removal: "Sgombero dei rami", chip: "Triturazione sul posto (pacciame)", grind: "Fresatura dei ceppi dopo l'abbattimento", lift: "Lavori con piattaforma aerea" } },
          date: { text: "Per quale data desiderate l'intervento?", short: "Data desiderata" },
        },
        items: {
          work_prune: "Potatura e sfoltimento (× {n})",
          work_fell: "Abbattimento di alberi (× {n})",
          stump: "Rimozione di ceppi (× {n})",
          hedge: "Taglio di siepi ({m} m)",
          removal: "Sgombero dei rami",
          chip: "Triturazione sul posto",
          grind: "Fresatura dei ceppi (× {n})",
          lift: "Lavori con piattaforma aerea",
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
