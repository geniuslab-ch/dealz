/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "peinture",
    icon: "🎨",
    needsAddress: true,
    colors: { main: "#7048e8", dark: "#5f3dc4", light: "#e5dbff", accent: "#f59f00", accentDark: "#e67700", bg: "#fcfbff" },

    quote: {
      minimum: 250,
      questions: [
        { id: "work", type: "single", options: [{ id: "interior" }, { id: "facade" }, { id: "wood" }, { id: "reno" }] },
        {
          id: "rooms", type: "single",
          when: function (a) { return a.work.id === "interior" || a.work.id === "reno"; },
          options: [{ id: "r1", walls: 55, n: 1 }, { id: "r2", walls: 95, n: 2 }, { id: "r3", walls: 140, n: 3 }, { id: "r4", walls: 190, n: 4 }, { id: "r5", walls: 260, n: 5 }],
        },
        {
          id: "fsurf", type: "single",
          when: function (a) { return a.work.id === "facade"; },
          options: [{ id: "f1", m2: 80, scaffold: 380 }, { id: "f2", m2: 150, scaffold: 750 }, { id: "f3", m2: 300, scaffold: 1400 }, { id: "f4", m2: 500, scaffold: 2400 }],
        },
        {
          id: "woodn", type: "single",
          when: function (a) { return a.work.id === "wood"; },
          options: [{ id: "w1", n: 2 }, { id: "w2", n: 6 }, { id: "w3", n: 12 }, { id: "w4", n: 20 }],
        },
        {
          id: "state", type: "single",
          when: function (a) { return a.work.id !== "wood"; },
          options: [{ id: "good", prep: 0 }, { id: "cracks", prep: 4.5 }, { id: "old", prep: 11 }],
        },
        {
          id: "ceiling", type: "single",
          when: function (a) { return a.work.id === "interior" || a.work.id === "reno"; },
          options: [{ id: "std", k: 1 }, { id: "high", k: 1.15 }],
        },
        {
          id: "furnished", type: "single",
          when: function (a) { return a.work.id === "interior" || a.work.id === "reno"; },
          options: [{ id: "empty", prot: 0 }, { id: "furnished", prot: 1 }],
        },
        { id: "extras", type: "multi", options: [{ id: "rad" }, { id: "doors" }, { id: "shutters" }, { id: "colour" }] },
        { id: "date", type: "date", minDays: 5 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var w = a.work.id;
        var base = 0;
        if (w === "interior" || w === "reno") {
          var walls = a.rooms.walls, ceilArea = Math.round(walls * 0.35), k = a.ceiling.k;
          items.push({ label: L("walls", { m2: walls }), amount: H.round5(walls * 24 * k) });
          items.push({ label: L("ceilings", { m2: ceilArea }), amount: H.round5(ceilArea * 19 * k) });
          if (a.state.prep) items.push({ label: L(a.state.id === "old" ? "prepOld" : "prepCracks"), amount: H.round5(walls * a.state.prep) });
          if (a.furnished.prot) items.push({ label: L("protect"), amount: H.round5(a.rooms.n * 40 + 60) });
          if (w === "reno") items.push({ label: L("finish"), amount: H.round5(walls * 4.5 + 180) });
          base = walls;
        } else if (w === "facade") {
          items.push({ label: L("facade", { m2: a.fsurf.m2 }), amount: H.round5(a.fsurf.m2 * 58) });
          items.push({ label: L("scaffold"), amount: a.fsurf.scaffold });
          if (a.state.prep) items.push({ label: L(a.state.id === "old" ? "prepOld" : "prepCracks"), amount: H.round5(a.fsurf.m2 * a.state.prep) });
          base = a.fsurf.m2;
        } else {
          items.push({ label: L("wood", { n: a.woodn.n }), amount: H.round5(a.woodn.n * 85) });
          base = a.woodn.n * 3;
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "rad") items.push({ label: L("rad"), amount: 160 });
          if (e.id === "doors") items.push({ label: L("doors"), amount: 240 });
          if (e.id === "shutters") items.push({ label: L("shutters"), amount: 320 });
          if (e.id === "colour") items.push({ label: L("colour"), amount: H.round5(base * 3.2 + 90) });
        });
        return items;
      },
    },

    fr: {
      label: "Peinture et rénovation",
      forWho: "entreprises de peinture et de rénovation",
      pitch: "Chiffrez surfaces, préparation et finitions sans visite préalable.",
      emailNoun: "vos travaux de peinture",
      landing: {
        h1: ["VOUS PEIGNEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de devis peinture perdez-vous parce que vous êtes sur un chantier ?",
        text: "Les clients veulent un ordre de grandeur avant de faire venir quelqu'un. Dealz leur répond à toute heure, pose les bonnes questions (surfaces, état des murs, hauteur sous plafond, meubles), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour repeindre un 3 pièces, murs et plafonds ?",
        values: [
          { icon: "📏", title: "Des estimations fiables avant visite", text: "Nombre de pièces, état des murs, hauteur : Dealz donne un prix ferme sur les cas standards, la visite sert aux cas complexes." },
          { icon: "🧰", title: "La préparation enfin chiffrée", text: "Rebouchage, décapage de papier peint, protection des meubles : chaque poste de préparation est facturé selon vos règles." },
          { icon: "🏠", title: "Intérieur, façade, boiseries", text: "Un seul assistant pour tous vos types de travaux, avec les questions adaptées à chacun." },
          { icon: "📅", title: "Planning mieux rempli", text: "Les dates souhaitées arrivent déjà qualifiées, pour organiser vos équipes en amont." },
        ],
        step1: "Importez vos tarifs : prix au m², préparation, hauteur sous plafond, échafaudage, boiseries. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos niveaux de préparation, vos majorations et vos options.",
        excel: { file: "tarifs-peinture.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Peinture murs", "140 m² · 2 couches", "CHF 3 360"], ["Peinture plafonds", "49 m²", "CHF 930"], ["Rebouchage fissures", "140 m²", "CHF 630"]] },
        chat: ["« Je veux repeindre mon 3 pièces avant d'emménager. »", "« Les murs sont-ils en bon état ou faut-il reboucher ? »", "« Le logement est-il vide ou meublé ? »"],
        offer: { company: "Atelier Couleur Rénovation SA", rows: [["Peinture des murs (140 m²)", 3360], ["Peinture des plafonds (49 m²)", 930], ["Rebouchage des fissures", 630]] },
        roi: "Un seul chantier supplémentaire par trimestre peut déjà payer votre abonnement à l'année.",
      },
      demo: {
        brand: "Atelier Couleur",
        eyebrow: "Fribourg & Broye · Exemple fictif",
        hero: { h1: "Des murs neufs, sans la poussière ni les surprises.", text: "Peinture intérieure, façades, boiseries et rénovation de pièces en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "1 700+", lbl: "CHANTIERS RÉALISÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous peignons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🏠", title: "Peinture intérieure", text: "Murs et plafonds, deux couches, fournitures comprises.", tag: "dès CHF 24/m²" },
          { icon: "🏢", title: "Façades", text: "Nettoyage, préparation et peinture, échafaudage inclus.", tag: "dès CHF 58/m²" },
          { icon: "🚪", title: "Boiseries et portes", text: "Ponçage et deux couches de finition.", tag: "dès CHF 85/pièce" },
          { icon: "🧱", title: "Préparation des supports", text: "Rebouchage, décapage, ponçage.", tag: "dès CHF 4.50/m²" },
          { icon: "🛠️", title: "Rénovation de pièces", text: "Préparation, peinture et finitions clés en main.", tag: "sur devis" },
          { icon: "🪟", title: "Volets et radiateurs", text: "Remise en peinture soignée.", tag: "dès CHF 160" },
        ],
        about: {
          title: "Des peintres qui soignent les détails",
          text: "Atelier Couleur Rénovation intervient chez les particuliers, régies et entreprises en Suisse romande depuis 2005. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Chantier protégé", "sols et meubles couverts, nettoyage en fin de journée."], ["Peintures de qualité", "produits suisses, faibles émissions."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "026 000 00 20", email: "hello@atelier-couleur.demo", zone: "Fribourg, Vaud, Neuchâtel", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur votre projet — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet de peinture…",
        pdfCompany: { name: "Atelier Couleur Rénovation SA", address: "Rue de Romont 12, 1700 Fribourg", phone: "026 000 00 20", email: "hello@atelier-couleur.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre projet, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du chantier (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, fournitures comprises. Travaux supplémentaires éventuels facturés sur accord préalable.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { interior: "Peinture intérieure (murs et plafonds)", facade: "Peinture de façade", wood: "Boiseries, portes et fenêtres", reno: "Rénovation de pièces (préparation + peinture + finitions)" } },
          rooms: { text: "Combien de pièces sont concernées ?", short: "Pièces", opts: { r1: "1 pièce / studio", r2: "2 pièces", r3: "3 pièces", r4: "4 pièces", r5: "5 pièces et plus" } },
          fsurf: { text: "Quelle est la surface approximative de la façade ?", short: "Façade", opts: { f1: "Petite façade (moins de 100 m²)", f2: "Maison individuelle (100–200 m²)", f3: "Grande façade (200–400 m²)", f4: "Immeuble (400 m² et plus)" } },
          woodn: { text: "Combien d'éléments à peindre (portes, fenêtres, volets…) ?", short: "Éléments", opts: { w1: "1 à 3 éléments", w2: "4 à 8 éléments", w3: "9 à 15 éléments", w4: "16 éléments et plus" } },
          state: { text: "Quel est l'état des supports ?", short: "État des murs", opts: { good: "Bon état", cracks: "Fissures / rebouchage à prévoir", old: "Ancien papier peint ou peinture écaillée" } },
          ceiling: { text: "Quelle est la hauteur sous plafond ?", short: "Hauteur", opts: { std: "Standard (2.6 m ou moins)", high: "Haute (plus de 2.6 m)" } },
          furnished: { text: "Le logement sera-t-il vide pendant les travaux ?", short: "Logement", opts: { empty: "Vide", furnished: "Meublé — protection à prévoir" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { rad: "Peinture des radiateurs", doors: "Portes et boiseries", shutters: "Volets", colour: "Teintes soutenues (couches supplémentaires)" } },
          date: { text: "Pour quelle date souhaitez-vous démarrer ?", short: "Date souhaitée" },
        },
        items: {
          walls: "Peinture des murs ({m2} m², 2 couches)",
          ceilings: "Peinture des plafonds ({m2} m²)",
          prepCracks: "Préparation — rebouchage et ponçage",
          prepOld: "Préparation — décapage ancien revêtement",
          protect: "Protection du mobilier et des sols",
          finish: "Finitions et remise en état (rénovation)",
          facade: "Peinture de façade ({m2} m²)",
          scaffold: "Échafaudage et sécurisation",
          wood: "Boiseries et ouvrants ({n} éléments)",
          rad: "Peinture des radiateurs",
          doors: "Portes et boiseries",
          shutters: "Volets",
          colour: "Supplément teintes soutenues",
        },
      },
    },
    en: {
      label: "Painting and renovation",
      forWho: "painting and renovation companies",
      pitch: "Price surfaces, preparation and finishes without a site visit.",
      emailNoun: "your painting work",
      landing: {
        h1: ["YOU PAINT.", "DEALZ PRICES."],
        question: "How many painting quote requests do you lose because you're on a job site?",
        text: "Customers want a ballpark figure before having someone come round. Dealz answers them at any hour, asks the right questions (surfaces, wall condition, ceiling height, furniture), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to repaint a 3-room flat, walls and ceilings?",
        values: [
          { icon: "📏", title: "Reliable estimates before a visit", text: "Number of rooms, wall condition, height: Dealz gives a firm price on standard jobs, and the visit is kept for complex cases." },
          { icon: "🧰", title: "Preparation finally priced", text: "Filling, wallpaper stripping, furniture protection: every preparation item is charged by your rules." },
          { icon: "🏠", title: "Interior, façade, woodwork", text: "One assistant for every type of work, with the right questions for each." },
          { icon: "📅", title: "A fuller schedule", text: "Preferred dates arrive already qualified, so you can plan your crews ahead." },
        ],
        step1: "Import your rates: price per m², preparation, ceiling height, scaffolding, woodwork. Your Excel stays your working tool.",
        step2: "The engine understands your surfaces, preparation levels, surcharges and options.",
        excel: { file: "painting-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Wall painting", "140 m² · 2 coats", "CHF 3,360"], ["Ceiling painting", "49 m²", "CHF 930"], ["Crack filling", "140 m²", "CHF 630"]] },
        chat: ["“I want to repaint my 3-room flat before moving in.”", "“Are the walls in good condition, or do they need filling?”", "“Will the home be empty or furnished?”"],
        offer: { company: "Atelier Couleur Rénovation SA", rows: [["Wall painting (140 m²)", 3360], ["Ceiling painting (49 m²)", 930], ["Crack filling", 630]] },
        roi: "A single extra job per quarter can already pay for your yearly subscription.",
      },
      demo: {
        brand: "Atelier Couleur",
        eyebrow: "Fribourg & Broye · Fictional example",
        hero: { h1: "Fresh walls, without the dust or the surprises.", text: "Interior painting, façades, woodwork and room renovation in French-speaking Switzerland — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "1,700+", lbl: "JOBS COMPLETED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we paint",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🏠", title: "Interior painting", text: "Walls and ceilings, two coats, materials included.", tag: "from CHF 24/m²" },
          { icon: "🏢", title: "Façades", text: "Cleaning, preparation and painting, scaffolding included.", tag: "from CHF 58/m²" },
          { icon: "🚪", title: "Woodwork and doors", text: "Sanding and two finishing coats.", tag: "from CHF 85/item" },
          { icon: "🧱", title: "Surface preparation", text: "Filling, stripping, sanding.", tag: "from CHF 4.50/m²" },
          { icon: "🛠️", title: "Room renovation", text: "Preparation, painting and finishes, turnkey.", tag: "on quote" },
          { icon: "🪟", title: "Shutters and radiators", text: "Careful repainting.", tag: "from CHF 160" },
        ],
        about: {
          title: "Painters who care about the details",
          text: "Atelier Couleur Rénovation has been working for households, property managers and businesses across French-speaking Switzerland since 2005. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Protected site", "floors and furniture covered, cleaned up at the end of each day."], ["Quality paints", "Swiss products, low emissions."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "026 000 00 20", email: "hello@atelier-couleur.demo", zone: "Fribourg, Vaud, Neuchâtel", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your project — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your painting project…",
        pdfCompany: { name: "Atelier Couleur Rénovation SA", address: "Rue de Romont 12, 1700 Fribourg", phone: "026 000 00 20", email: "hello@atelier-couleur.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your project, then put together a firm quote right away.",
        addressPlaceholder: "Site address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, materials included. Any additional work charged only with prior agreement.",
        q: {
          work: { text: "What kind of work do you need?", short: "Work", opts: { interior: "Interior painting (walls and ceilings)", facade: "Façade painting", wood: "Woodwork, doors and windows", reno: "Room renovation (preparation + painting + finishes)" } },
          rooms: { text: "How many rooms are involved?", short: "Rooms", opts: { r1: "1 room / studio", r2: "2 rooms", r3: "3 rooms", r4: "4 rooms", r5: "5 rooms or more" } },
          fsurf: { text: "Roughly how large is the façade?", short: "Façade", opts: { f1: "Small façade (under 100 m²)", f2: "Detached house (100–200 m²)", f3: "Large façade (200–400 m²)", f4: "Apartment building (400 m² or more)" } },
          woodn: { text: "How many items to paint (doors, windows, shutters…)?", short: "Items", opts: { w1: "1 to 3 items", w2: "4 to 8 items", w3: "9 to 15 items", w4: "16 items or more" } },
          state: { text: "What condition are the surfaces in?", short: "Wall condition", opts: { good: "Good condition", cracks: "Cracks / filling needed", old: "Old wallpaper or peeling paint" } },
          ceiling: { text: "What is the ceiling height?", short: "Height", opts: { std: "Standard (2.6 m or less)", high: "High (over 2.6 m)" } },
          furnished: { text: "Will the home be empty during the work?", short: "Home", opts: { empty: "Empty", furnished: "Furnished — protection needed" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { rad: "Radiator painting", doors: "Doors and woodwork", shutters: "Shutters", colour: "Strong colours (extra coats)" } },
          date: { text: "When would you like to start?", short: "Preferred date" },
        },
        items: {
          walls: "Wall painting ({m2} m², 2 coats)",
          ceilings: "Ceiling painting ({m2} m²)",
          prepCracks: "Preparation — filling and sanding",
          prepOld: "Preparation — stripping old coating",
          protect: "Furniture and floor protection",
          finish: "Finishes and touch-ups (renovation)",
          facade: "Façade painting ({m2} m²)",
          scaffold: "Scaffolding and safety",
          wood: "Woodwork and openings ({n} items)",
          rad: "Radiator painting",
          doors: "Doors and woodwork",
          shutters: "Shutters",
          colour: "Strong colour surcharge",
        },
      },
    },
    de: {
      label: "Maler- und Renovationsarbeiten",
      forWho: "Maler- und Renovationsbetriebe",
      pitch: "Flächen, Vorarbeiten und Finish berechnen — ohne Besichtigung.",
      emailNoun: "Ihre Malerarbeiten",
      landing: {
        h1: ["SIE MALEN.", "DEALZ RECHNET."],
        question: "Wie viele Maleroffertanfragen verlieren Sie, weil Sie auf einer Baustelle sind?",
        text: "Kunden wollen eine Grössenordnung, bevor jemand vorbeikommt. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Flächen, Zustand der Wände, Raumhöhe, Möbel), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet es, eine 3-Zimmer-Wohnung neu zu streichen, Wände und Decken?",
        values: [
          { icon: "📏", title: "Verlässliche Schätzungen vor der Besichtigung", text: "Anzahl Zimmer, Zustand der Wände, Höhe: Dealz nennt für Standardfälle einen verbindlichen Preis, die Besichtigung bleibt für komplexe Fälle." },
          { icon: "🧰", title: "Endlich berechnete Vorarbeiten", text: "Spachteln, Tapeten entfernen, Möbel schützen: Jede Vorarbeit wird nach Ihren Regeln verrechnet." },
          { icon: "🏠", title: "Innen, Fassade, Holzwerk", text: "Ein Assistent für alle Arbeiten, mit den passenden Fragen für jede." },
          { icon: "📅", title: "Besser gefüllte Planung", text: "Wunschtermine kommen bereits qualifiziert an — so planen Sie Ihre Teams im Voraus." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m², Vorarbeiten, Raumhöhe, Gerüst, Holzwerk. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Flächen, Vorarbeitsstufen, Zuschläge und Optionen.",
        excel: { file: "tarife-maler.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Wände streichen", "140 m² · 2 Anstriche", "CHF 3'360"], ["Decken streichen", "49 m²", "CHF 930"], ["Risse spachteln", "140 m²", "CHF 630"]] },
        chat: ["«Ich möchte meine 3-Zimmer-Wohnung vor dem Einzug neu streichen.»", "«Sind die Wände in gutem Zustand, oder muss gespachtelt werden?»", "«Ist die Wohnung leer oder möbliert?»"],
        offer: { company: "Atelier Couleur Rénovation SA", rows: [["Wände streichen (140 m²)", 3360], ["Decken streichen (49 m²)", 930], ["Risse spachteln", 630]] },
        roi: "Ein einziger zusätzlicher Auftrag pro Quartal kann Ihr Jahresabo bereits bezahlen.",
      },
      demo: {
        brand: "Atelier Couleur",
        eyebrow: "Freiburg & Broye · Fiktives Beispiel",
        hero: { h1: "Frische Wände, ohne Staub und ohne Überraschungen.", text: "Innenanstriche, Fassaden, Holzwerk und Zimmerrenovationen in der Westschweiz — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "1'700+", lbl: "AUSGEFÜHRTE AUFTRÄGE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir streichen",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🏠", title: "Innenanstrich", text: "Wände und Decken, zwei Anstriche, Material inbegriffen.", tag: "ab CHF 24/m²" },
          { icon: "🏢", title: "Fassaden", text: "Reinigung, Vorarbeiten und Anstrich, Gerüst inbegriffen.", tag: "ab CHF 58/m²" },
          { icon: "🚪", title: "Holzwerk und Türen", text: "Schleifen und zwei Deckanstriche.", tag: "ab CHF 85/Stück" },
          { icon: "🧱", title: "Untergrundvorbereitung", text: "Spachteln, Abbeizen, Schleifen.", tag: "ab CHF 4.50/m²" },
          { icon: "🛠️", title: "Zimmerrenovation", text: "Vorarbeiten, Anstrich und Finish, schlüsselfertig.", tag: "auf Offerte" },
          { icon: "🪟", title: "Fensterläden und Heizkörper", text: "Sorgfältiger Neuanstrich.", tag: "ab CHF 160" },
        ],
        about: {
          title: "Maler, die auf Details achten",
          text: "Atelier Couleur Rénovation arbeitet seit 2005 für Privatpersonen, Verwaltungen und Unternehmen in der Westschweiz. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Geschützte Baustelle", "Böden und Möbel abgedeckt, Reinigung am Ende jedes Tages."], ["Qualitätsfarben", "Schweizer Produkte, emissionsarm."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "026 000 00 20", email: "hello@atelier-couleur.demo", zone: "Freiburg, Waadt, Neuenburg", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Projekt — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Malerprojekt…",
        pdfCompany: { name: "Atelier Couleur Rénovation SA", address: "Rue de Romont 12, 1700 Fribourg", phone: "026 000 00 20", email: "hello@atelier-couleur.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Projekt und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse der Baustelle (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Material inbegriffen. Allfällige Zusatzarbeiten nur nach vorheriger Absprache.",
        q: {
          work: { text: "Welche Arbeiten wünschen Sie?", short: "Arbeiten", opts: { interior: "Innenanstrich (Wände und Decken)", facade: "Fassadenanstrich", wood: "Holzwerk, Türen und Fenster", reno: "Zimmerrenovation (Vorarbeiten + Anstrich + Finish)" } },
          rooms: { text: "Wie viele Zimmer sind betroffen?", short: "Zimmer", opts: { r1: "1 Zimmer / Studio", r2: "2 Zimmer", r3: "3 Zimmer", r4: "4 Zimmer", r5: "5 Zimmer und mehr" } },
          fsurf: { text: "Wie gross ist die Fassade ungefähr?", short: "Fassade", opts: { f1: "Kleine Fassade (unter 100 m²)", f2: "Einfamilienhaus (100–200 m²)", f3: "Grosse Fassade (200–400 m²)", f4: "Mehrfamilienhaus (400 m² und mehr)" } },
          woodn: { text: "Wie viele Elemente sind zu streichen (Türen, Fenster, Läden…)?", short: "Elemente", opts: { w1: "1 bis 3 Elemente", w2: "4 bis 8 Elemente", w3: "9 bis 15 Elemente", w4: "16 Elemente und mehr" } },
          state: { text: "In welchem Zustand ist der Untergrund?", short: "Zustand der Wände", opts: { good: "Guter Zustand", cracks: "Risse / Spachteln nötig", old: "Alte Tapeten oder abblätternde Farbe" } },
          ceiling: { text: "Wie hoch sind die Räume?", short: "Raumhöhe", opts: { std: "Standard (2.6 m oder weniger)", high: "Hoch (über 2.6 m)" } },
          furnished: { text: "Ist die Wohnung während der Arbeiten leer?", short: "Wohnung", opts: { empty: "Leer", furnished: "Möbliert — Schutz nötig" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { rad: "Heizkörper streichen", doors: "Türen und Holzwerk", shutters: "Fensterläden", colour: "Kräftige Farbtöne (zusätzliche Anstriche)" } },
          date: { text: "Ab wann möchten Sie beginnen?", short: "Wunschtermin" },
        },
        items: {
          walls: "Wände streichen ({m2} m², 2 Anstriche)",
          ceilings: "Decken streichen ({m2} m²)",
          prepCracks: "Vorarbeiten — Spachteln und Schleifen",
          prepOld: "Vorarbeiten — Entfernen alter Beschichtung",
          protect: "Schutz von Möbeln und Böden",
          finish: "Finish und Instandstellung (Renovation)",
          facade: "Fassadenanstrich ({m2} m²)",
          scaffold: "Gerüst und Absicherung",
          wood: "Holzwerk und Öffnungen ({n} Elemente)",
          rad: "Heizkörper streichen",
          doors: "Türen und Holzwerk",
          shutters: "Fensterläden",
          colour: "Zuschlag kräftige Farbtöne",
        },
      },
    },
    it: {
      label: "Pittura e ristrutturazione",
      forWho: "imprese di pittura e ristrutturazione",
      pitch: "Calcolate superfici, preparazione e finiture senza sopralluogo.",
      emailNoun: "i vostri lavori di pittura",
      landing: {
        h1: ["VOI DIPINGETE.", "DEALZ FA IL PREVENTIVO."],
        question: "Quante richieste di preventivo di pittura perdete perché siete in cantiere?",
        text: "I clienti vogliono un ordine di grandezza prima di far venire qualcuno. Dealz risponde loro a qualsiasi ora, pone le domande giuste (superfici, stato dei muri, altezza dei soffitti, mobili), calcola il vostro prezzo secondo le vostre tariffe e prepara il loro preventivo.",
        clientQ: "Quanto costa ridipingere un appartamento di 3 locali, pareti e soffitti?",
        values: [
          { icon: "📏", title: "Stime affidabili prima del sopralluogo", text: "Numero di locali, stato dei muri, altezza: Dealz dà un prezzo fisso per i lavori standard, e il sopralluogo resta per i casi complessi." },
          { icon: "🧰", title: "La preparazione finalmente calcolata", text: "Stuccatura, rimozione della carta da parati, protezione dei mobili: ogni voce di preparazione è fatturata secondo le vostre regole." },
          { icon: "🏠", title: "Interni, facciate, serramenti", text: "Un solo assistente per tutti i tipi di lavoro, con le domande giuste per ciascuno." },
          { icon: "📅", title: "Un'agenda più piena", text: "Le date desiderate arrivano già qualificate, così pianificate le vostre squadre in anticipo." },
        ],
        step1: "Importate le vostre tariffe: prezzo al m², preparazione, altezza dei soffitti, ponteggio, serramenti. Il vostro Excel resta il vostro strumento di lavoro.",
        step2: "Il motore capisce le vostre superfici, i livelli di preparazione, i supplementi e le opzioni.",
        excel: { file: "tariffe-pittura.xlsx", headers: ["Servizio", "Condizione", "Prezzo"], rows: [["Pittura pareti", "140 m² · 2 mani", "CHF 3'360"], ["Pittura soffitti", "49 m²", "CHF 930"], ["Stuccatura crepe", "140 m²", "CHF 630"]] },
        chat: ["«Voglio ridipingere il mio 3 locali prima di entrarci.»", "«Le pareti sono in buono stato, o vanno stuccate?»", "«L'alloggio sarà vuoto o arredato?»"],
        offer: { company: "Atelier Couleur Rénovation SA", rows: [["Pittura pareti (140 m²)", 3360], ["Pittura soffitti (49 m²)", 930], ["Stuccatura delle crepe", 630]] },
        roi: "Un solo cantiere in più a trimestre può già pagare il vostro abbonamento annuale.",
      },
      demo: {
        brand: "Atelier Couleur",
        eyebrow: "Friburgo e Broye · Esempio fittizio",
        hero: { h1: "Pareti nuove, senza polvere né sorprese.", text: "Pittura interna, facciate, serramenti e ristrutturazione di locali nella Svizzera romanda: ottenete un prezzo fisso in pochi secondi, direttamente su questo sito." },
        stats: [{ num: "4.8★", lbl: "SODDISFAZIONE CLIENTI" }, { num: "1'700+", lbl: "CANTIERI REALIZZATI" }, { num: "< 1 min", lbl: "PER UN PREVENTIVO" }],
        servicesTitle: "Cosa dipingiamo",
        servicesSub: "Scegliete un servizio, oppure descrivete semplicemente il vostro progetto nella scheda «Ottenere un preventivo».",
        services: [
          { icon: "🏠", title: "Pittura interna", text: "Pareti e soffitti, due mani, materiale incluso.", tag: "da CHF 24/m²" },
          { icon: "🏢", title: "Facciate", text: "Pulizia, preparazione e pittura, ponteggio incluso.", tag: "da CHF 58/m²" },
          { icon: "🚪", title: "Serramenti e porte", text: "Levigatura e due mani di finitura.", tag: "da CHF 85/pezzo" },
          { icon: "🧱", title: "Preparazione dei supporti", text: "Stuccatura, sverniciatura, levigatura.", tag: "da CHF 4.50/m²" },
          { icon: "🛠️", title: "Ristrutturazione di locali", text: "Preparazione, pittura e finiture, chiavi in mano.", tag: "su preventivo" },
          { icon: "🪟", title: "Persiane e radiatori", text: "Riverniciatura accurata.", tag: "da CHF 160" },
        ],
        about: {
          title: "Pittori attenti ai dettagli",
          text: "Atelier Couleur Rénovation lavora per privati, amministrazioni immobiliari e aziende in tutta la Svizzera romanda dal 2005. Nel 2026 abbiamo aggiunto al nostro sito un assistente di preventivi immediato: più veloce per voi, meno burocrazia per noi.",
          bullets: [["Cantiere protetto", "pavimenti e mobili coperti, pulizia alla fine di ogni giornata."], ["Pitture di qualità", "prodotti svizzeri, a basse emissioni."], ["Prezzo trasparente", "il preventivo ricevuto è il prezzo pagato."]],
        },
        contact: { phone: "026 000 00 20", email: "hello@atelier-couleur.demo", zone: "Friburgo, Vaud, Neuchâtel", hours: "Lun–Ven, 7–17" },
        devisNote: "Rispondete a qualche domanda sul vostro progetto: riceverete un vero preventivo, che potrete accettare o rifiutare direttamente qui.",
        inputPlaceholder: "Descrivete il vostro progetto di pittura…",
        pdfCompany: { name: "Atelier Couleur Rénovation SA", address: "Rue de Romont 12, 1700 Fribourg", phone: "026 000 00 20", email: "hello@atelier-couleur.demo" },
      },
      quote: {
        greeting: "Buongiorno! Vi faccio qualche domanda rapida sul vostro progetto, poi vi preparo subito un preventivo fisso.",
        addressPlaceholder: "Indirizzo del cantiere (via, NPA, località)",
        terms: "Preventivo fisso, valido 30 giorni, materiale incluso. Eventuali lavori aggiuntivi fatturati solo previo accordo.",
        q: {
          work: { text: "Che tipo di lavori desiderate?", short: "Lavori", opts: { interior: "Pittura interna (pareti e soffitti)", facade: "Pittura della facciata", wood: "Serramenti, porte e finestre", reno: "Ristrutturazione di locali (preparazione + pittura + finiture)" } },
          rooms: { text: "Quanti locali sono interessati?", short: "Locali", opts: { r1: "1 locale / monolocale", r2: "2 locali", r3: "3 locali", r4: "4 locali", r5: "5 locali e oltre" } },
          fsurf: { text: "Qual è la superficie approssimativa della facciata?", short: "Facciata", opts: { f1: "Facciata piccola (meno di 100 m²)", f2: "Casa unifamiliare (100–200 m²)", f3: "Facciata grande (200–400 m²)", f4: "Palazzo (400 m² e oltre)" } },
          woodn: { text: "Quanti elementi da dipingere (porte, finestre, persiane…)?", short: "Elementi", opts: { w1: "Da 1 a 3 elementi", w2: "Da 4 a 8 elementi", w3: "Da 9 a 15 elementi", w4: "16 elementi e oltre" } },
          state: { text: "In che stato sono le superfici?", short: "Stato dei muri", opts: { good: "Buono stato", cracks: "Crepe / stuccatura necessaria", old: "Vecchia carta da parati o pittura che si stacca" } },
          ceiling: { text: "Qual è l'altezza dei soffitti?", short: "Altezza", opts: { std: "Standard (2.6 m o meno)", high: "Alta (oltre 2.6 m)" } },
          furnished: { text: "L'alloggio sarà vuoto durante i lavori?", short: "Alloggio", opts: { empty: "Vuoto", furnished: "Arredato — protezione necessaria" } },
          extras: { text: "Desiderate delle opzioni?", short: "Opzioni", none: "Nessuna opzione", opts: { rad: "Pittura dei radiatori", doors: "Porte e serramenti", shutters: "Persiane", colour: "Colori intensi (mani supplementari)" } },
          date: { text: "Quando desiderate iniziare?", short: "Data desiderata" },
        },
        items: {
          walls: "Pittura pareti ({m2} m², 2 mani)",
          ceilings: "Pittura soffitti ({m2} m²)",
          prepCracks: "Preparazione — stuccatura e levigatura",
          prepOld: "Preparazione — rimozione del vecchio rivestimento",
          protect: "Protezione di mobili e pavimenti",
          finish: "Finiture e ritocchi (ristrutturazione)",
          facade: "Pittura della facciata ({m2} m²)",
          scaffold: "Ponteggio e messa in sicurezza",
          wood: "Serramenti e aperture ({n} elementi)",
          rad: "Pittura dei radiatori",
          doors: "Porte e serramenti",
          shutters: "Persiane",
          colour: "Supplemento colori intensi",
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
