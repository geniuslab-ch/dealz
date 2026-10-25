/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "demenagement",
    icon: "🚚",
    needsAddress: true,
    colors: { main: "#2563eb", dark: "#1d4ed8", light: "#dbeafe", accent: "#f97316", accentDark: "#ea580c", bg: "#fbfdff" },

    // ---- language-neutral quote logic ----
    quote: {
      minimum: 180,
      questions: [
        { id: "service", type: "single", options: [{ id: "move" }, { id: "clear" }, { id: "both" }] },
        { id: "size", type: "single", options: [{ id: "s1", vol: 14 }, { id: "s3", vol: 26 }, { id: "s4", vol: 38 }, { id: "s5", vol: 58 }] },
        { id: "floors", type: "single", options: [{ id: "easy", k: 0 }, { id: "mid", k: 3.5 }, { id: "high", k: 7 }] },
        {
          id: "distance", type: "single",
          when: function (a) { return a.service.id !== "clear"; },
          options: [{ id: "local", km: "< 10", fee: 0 }, { id: "canton", km: "10–50", fee: 140 }, { id: "inter", km: "50–150", fee: 360 }, { id: "long", km: "150+", fee: 780 }],
        },
        {
          id: "extras", type: "multi",
          when: function (a) { return a.service.id !== "clear"; },
          options: [{ id: "pack" }, { id: "furn" }, { id: "heavy" }, { id: "store" }],
        },
        { id: "date", type: "date", minDays: 3 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var svc = a.service.id;
        var vol = a.size.vol;
        if (svc !== "clear") {
          var crew = H.clamp(Math.ceil(vol / 14) + 1, 2, 5);
          items.push({ label: L("move", { crew: crew, vol: vol }), amount: H.round5(320 + vol * 17) });
          if (a.floors.k) items.push({ label: L("access"), amount: H.round5(a.floors.k * vol) });
          if (a.distance.fee) items.push({ label: L("distance", { km: a.distance.km }), amount: a.distance.fee });
          (a.extras || []).forEach(function (e) {
            if (e.id === "pack") items.push({ label: L("pack"), amount: H.round5(vol * 11) });
            if (e.id === "furn") items.push({ label: L("furn"), amount: H.round5(vol * 6 + 60) });
            if (e.id === "heavy") items.push({ label: L("heavy"), amount: 280 });
            if (e.id === "store") items.push({ label: L("store"), amount: 190 });
          });
        }
        if (svc !== "move") {
          var cv = svc === "clear" ? vol : Math.round(vol * 0.35);
          items.push({ label: L("clear", { vol: cv }), amount: H.round5(cv * 42) });
          items.push({ label: L("disposal"), amount: H.round5(cv * 9 + 60) });
          if (svc === "clear" && a.floors.k) items.push({ label: L("access"), amount: H.round5(a.floors.k * vol * 0.8) });
        }
        return items;
      },
    },

    // ---- French texts ----
    fr: {
      label: "Déménagement et débarras",
      forWho: "entreprises de déménagement et de débarras",
      pitch: "Chiffrez volume, étages et distance sans visite préalable.",
      emailNoun: "votre déménagement",
      landing: {
        h1: ["VOUS DÉMÉNAGEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de déménagement perdez-vous quand vos équipes sont sur la route ?",
        text: "Vos clients demandent un prix à toute heure — le soir, le week-end, depuis leur canapé. Dealz leur répond, pose les bonnes questions (volume, étages, ascenseur, distance), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien coûte un déménagement 3 pièces de Lausanne à Genève ?",
        values: [
          { icon: "📦", title: "Des devis sans visite préalable", text: "Volume, étages, ascenseur, distance : Dealz collecte l'essentiel et chiffre les cas standards sans que vous passiez sur place." },
          { icon: "📞", title: "Moins d'appels « juste pour un prix »", text: "Vos équipes restent sur le terrain — plus besoin de décrocher pour chaque demande d'estimation." },
          { icon: "🗓️", title: "Des dates qualifiées d'emblée", text: "La date souhaitée et les contraintes d'accès arrivent déjà renseignées, pour planifier vos camions plus vite." },
          { icon: "🗑️", title: "Déménagement et débarras, un seul devis", text: "Évacuation, déchetterie, démontage, emballage : chaque option est chiffrée selon vos propres règles." },
        ],
        step1: "Importez vos tarifs : forfait camion + équipe, supplément étages, distances, emballage, débarras. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos volumes, vos types d'accès, vos zones de distance et vos options.",
        excel: { file: "tarifs-demenagement.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Déménagement 3 pièces", "26 m³ · 3 déménageurs", "CHF 760"], ["Portage sans ascenseur", "1–2 étages", "CHF 90"], ["Emballage + cartons", "26 m³", "CHF 285"]] },
        chat: ["« Je déménage mon 3 pièces de Lausanne à Nyon le mois prochain. »", "« Quel est l'accès : ascenseur ou étages à pied ? »", "« Souhaitez-vous l'emballage et le démontage des meubles ? »"],
        offer: { company: "Léman Déménagements SA", rows: [["Déménagement 3 pièces", 760], ["Portage 1–2 étages", 90], ["Emballage + cartons", 285]] },
        roi: "Un seul déménagement supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Léman Déménagements",
        eyebrow: "Lausanne & Romandie · Exemple fictif",
        hero: { h1: "Votre déménagement, sans le stress.", text: "Déménagement résidentiel, débarras et garde-meubles en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "3 100+", lbl: "DÉMÉNAGEMENTS RÉALISÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous déménageons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚚", title: "Déménagement résidentiel", text: "Équipe et camion, de l'appartement à la villa.", tag: "dès CHF 480" },
          { icon: "📦", title: "Emballage", text: "Cartons fournis et mise en cartons soignée.", tag: "dès CHF 150" },
          { icon: "🪑", title: "Démontage / remontage", text: "Meubles démontés puis remontés à l'arrivée.", tag: "dès CHF 120" },
          { icon: "🗑️", title: "Débarras", text: "Évacuation, tri et déchetterie.", tag: "dès CHF 350" },
          { icon: "🎹", title: "Objets lourds", text: "Piano, coffre-fort, machines.", tag: "dès CHF 280" },
          { icon: "🏬", title: "Garde-meubles", text: "Stockage sécurisé, au mois.", tag: "CHF 190/mois" },
        ],
        about: {
          title: "Une équipe d'ici, rodée au terrain",
          text: "Léman Déménagements accompagne particuliers et entreprises en Suisse romande depuis 2012. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Équipes formées et assurées", "chaque déménageur est contrôlé et couvert."], ["Protections incluses", "sangles, couvertures et protections de sol."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 00", email: "hello@leman-demenagements.demo", zone: "Vaud, Genève, Valais", hours: "Lun–Sam, 7h–18h" },
        devisNote: "Répondez à quelques questions sur votre déménagement — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre déménagement…",
        pdfCompany: { name: "Léman Déménagements SA", address: "Avenue de Cour 18, 1007 Lausanne", phone: "021 000 00 00", email: "hello@leman-demenagements.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre déménagement, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de départ (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve d'un accès conforme aux indications. TVA suisse incluse le cas échéant.",
        q: {
          service: { text: "Quel service souhaitez-vous ?", short: "Service", opts: { move: "Déménagement", clear: "Débarras seul", both: "Déménagement + débarras" } },
          size: { text: "Quelle est la taille du logement concerné ?", short: "Logement", opts: { s1: "Studio / 1–2 pièces", s3: "3 pièces", s4: "4 pièces", s5: "5 pièces et plus / maison" } },
          floors: { text: "Comment se présente l'accès au logement ?", short: "Accès", opts: { easy: "Rez-de-chaussée ou ascenseur", mid: "1–2 étages sans ascenseur", high: "3 étages ou plus sans ascenseur" } },
          distance: { text: "Quelle distance entre l'ancien et le nouveau logement ?", short: "Distance", opts: { local: "Moins de 10 km", canton: "10 à 50 km", inter: "50 à 150 km", long: "Plus de 150 km" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { pack: "Emballage et cartons", furn: "Démontage / remontage des meubles", heavy: "Piano ou objet très lourd", store: "Garde-meubles (1 mois)" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          move: "Déménagement — {crew} déménageurs + camion ({vol} m³)",
          access: "Supplément portage (étages sans ascenseur)",
          distance: "Transport hors commune ({km} km)",
          pack: "Emballage + cartons fournis",
          furn: "Démontage / remontage des meubles",
          heavy: "Manutention piano / objet lourd",
          store: "Garde-meubles (1 mois)",
          clear: "Débarras ({vol} m³)",
          disposal: "Évacuation et tri en déchetterie",
        },
      },
    },
    en: {
      label: "Moving and house clearance",
      forWho: "moving and house clearance companies",
      pitch: "Price volume, floors and distance without a site visit.",
      emailNoun: "your move",
      landing: {
        h1: ["YOU MOVE.", "DEALZ PRICES."],
        question: "How many moving requests do you lose while your crews are on the road?",
        text: "Your customers ask for a price at any hour — in the evening, at the weekend, from their sofa. Dealz answers them, asks the right questions (volume, floors, lift, distance), calculates your price from your rates and prepares their quote.",
        clientQ: "How much does it cost to move a 3-room flat from Lausanne to Geneva?",
        values: [
          { icon: "📦", title: "Quotes without a site visit", text: "Volume, floors, lift, distance: Dealz gathers the essentials and prices standard jobs without you going on site." },
          { icon: "📞", title: "Fewer calls “just for a price”", text: "Your crews stay in the field — no more picking up the phone for every estimate request." },
          { icon: "🗓️", title: "Dates qualified from the start", text: "The preferred date and access constraints arrive already filled in, so you can schedule your trucks faster." },
          { icon: "🗑️", title: "Moving and clearance, one quote", text: "Removal, waste disposal, dismantling, packing: each option is priced by your own rules." },
        ],
        step1: "Import your rates: truck + crew package, floor surcharge, distances, packing, clearance. Your Excel stays your working tool.",
        step2: "The engine understands your volumes, access types, distance zones and options.",
        excel: { file: "moving-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["3-room move", "26 m³ · 3 movers", "CHF 760"], ["Carrying without lift", "1–2 floors", "CHF 90"], ["Packing + boxes", "26 m³", "CHF 285"]] },
        chat: ["“I'm moving my 3-room flat from Lausanne to Nyon next month.”", "“What's the access: lift or stairs?”", "“Would you like packing and furniture dismantling?”"],
        offer: { company: "Léman Déménagements SA", rows: [["3-room move", 760], ["Carrying, 1–2 floors", 90], ["Packing + boxes", 285]] },
        roi: "A single extra move a month can already pay for your subscription.",
      },
      demo: {
        brand: "Léman Déménagements",
        eyebrow: "Lausanne & French-speaking Switzerland · Fictional example",
        hero: { h1: "Your move, without the stress.", text: "Home moves, house clearance and storage in French-speaking Switzerland — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "3,100+", lbl: "MOVES COMPLETED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we move",
        servicesSub: "Pick a service, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "🚚", title: "Home moves", text: "Crew and truck, from flat to villa.", tag: "from CHF 480" },
          { icon: "📦", title: "Packing", text: "Boxes supplied and careful packing.", tag: "from CHF 150" },
          { icon: "🪑", title: "Dismantling / reassembly", text: "Furniture taken apart and put back together on arrival.", tag: "from CHF 120" },
          { icon: "🗑️", title: "House clearance", text: "Removal, sorting and waste disposal.", tag: "from CHF 350" },
          { icon: "🎹", title: "Heavy items", text: "Piano, safe, machines.", tag: "from CHF 280" },
          { icon: "🏬", title: "Storage", text: "Secure storage, by the month.", tag: "CHF 190/month" },
        ],
        about: {
          title: "A local team that knows the job",
          text: "Léman Déménagements has been helping households and businesses across French-speaking Switzerland since 2012. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Trained, insured crews", "every mover is vetted and covered."], ["Protection included", "straps, blankets and floor protection."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 00", email: "hello@leman-demenagements.demo", zone: "Vaud, Geneva, Valais", hours: "Mon–Sat, 7am–6pm" },
        devisNote: "Answer a few questions about your move — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your move…",
        pdfCompany: { name: "Léman Déménagements SA", address: "Avenue de Cour 18, 1007 Lausanne", phone: "021 000 00 00", email: "hello@leman-demenagements.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your move, then put together a firm quote right away.",
        addressPlaceholder: "Departure address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, provided access matches the details given. Swiss VAT included where applicable.",
        q: {
          service: { text: "Which service do you need?", short: "Service", opts: { move: "Move", clear: "Clearance only", both: "Move + clearance" } },
          size: { text: "How big is the home?", short: "Home", opts: { s1: "Studio / 1–2 rooms", s3: "3 rooms", s4: "4 rooms", s5: "5 rooms or more / house" } },
          floors: { text: "What's the access like?", short: "Access", opts: { easy: "Ground floor or lift", mid: "1–2 floors without lift", high: "3 floors or more without lift" } },
          distance: { text: "How far apart are the old and new homes?", short: "Distance", opts: { local: "Under 10 km", canton: "10 to 50 km", inter: "50 to 150 km", long: "Over 150 km" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { pack: "Packing and boxes", furn: "Furniture dismantling / reassembly", heavy: "Piano or very heavy item", store: "Storage (1 month)" } },
          date: { text: "On which date would you like the move?", short: "Preferred date" },
        },
        items: {
          move: "Move — {crew} movers + truck ({vol} m³)",
          access: "Carrying surcharge (floors without lift)",
          distance: "Transport outside the municipality ({km} km)",
          pack: "Packing + boxes supplied",
          furn: "Furniture dismantling / reassembly",
          heavy: "Piano / heavy item handling",
          store: "Storage (1 month)",
          clear: "Clearance ({vol} m³)",
          disposal: "Removal and sorting at the waste centre",
        },
      },
    },
    de: {
      label: "Umzug und Räumung",
      forWho: "Umzugs- und Räumungsunternehmen",
      pitch: "Volumen, Stockwerke und Distanz berechnen — ohne Besichtigung.",
      emailNoun: "Ihren Umzug",
      landing: {
        h1: ["SIE ZÜGELN.", "DEALZ RECHNET."],
        question: "Wie viele Umzugsanfragen verlieren Sie, während Ihre Teams unterwegs sind?",
        text: "Ihre Kunden fragen zu jeder Zeit nach einem Preis — am Abend, am Wochenende, vom Sofa aus. Dealz antwortet ihnen, stellt die richtigen Fragen (Volumen, Stockwerke, Lift, Distanz), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet ein Umzug einer 3-Zimmer-Wohnung von Lausanne nach Genf?",
        values: [
          { icon: "📦", title: "Offerten ohne Besichtigung", text: "Volumen, Stockwerke, Lift, Distanz: Dealz erfasst das Wesentliche und berechnet Standardfälle, ohne dass Sie vor Ort müssen." },
          { icon: "📞", title: "Weniger Anrufe «nur für einen Preis»", text: "Ihre Teams bleiben im Einsatz — kein Abnehmen mehr für jede Preisanfrage." },
          { icon: "🗓️", title: "Termine von Anfang an qualifiziert", text: "Wunschtermin und Zugangsbedingungen kommen bereits ausgefüllt an — so planen Sie Ihre Lastwagen schneller." },
          { icon: "🗑️", title: "Umzug und Räumung, eine Offerte", text: "Entsorgung, Recyclinghof, Demontage, Verpackung: Jede Option wird nach Ihren eigenen Regeln berechnet." },
        ],
        step1: "Importieren Sie Ihre Tarife: Pauschale Lastwagen + Team, Stockwerkzuschlag, Distanzen, Verpackung, Räumung. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Volumen, Zugangsarten, Distanzzonen und Optionen.",
        excel: { file: "tarife-umzug.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Umzug 3 Zimmer", "26 m³ · 3 Zügelmänner", "CHF 760"], ["Tragen ohne Lift", "1–2 Stockwerke", "CHF 90"], ["Verpackung + Kartons", "26 m³", "CHF 285"]] },
        chat: ["«Ich zügle nächsten Monat meine 3-Zimmer-Wohnung von Lausanne nach Nyon.»", "«Wie ist der Zugang: Lift oder Treppe?»", "«Wünschen Sie Verpackung und Möbeldemontage?»"],
        offer: { company: "Léman Déménagements SA", rows: [["Umzug 3 Zimmer", 760], ["Tragen 1–2 Stockwerke", 90], ["Verpackung + Kartons", 285]] },
        roi: "Ein einziger zusätzlicher Umzug pro Monat kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "Léman Déménagements",
        eyebrow: "Lausanne & Westschweiz · Fiktives Beispiel",
        hero: { h1: "Ihr Umzug, ganz ohne Stress.", text: "Privatumzüge, Räumungen und Möbellager in der Westschweiz — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "3'100+", lbl: "DURCHGEFÜHRTE UMZÜGE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir zügeln",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihren Bedarf einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🚚", title: "Privatumzug", text: "Team und Lastwagen, von der Wohnung bis zur Villa.", tag: "ab CHF 480" },
          { icon: "📦", title: "Verpackung", text: "Kartons inklusive, sorgfältig verpackt.", tag: "ab CHF 150" },
          { icon: "🪑", title: "Demontage / Montage", text: "Möbel ab- und am neuen Ort wieder aufgebaut.", tag: "ab CHF 120" },
          { icon: "🗑️", title: "Räumung", text: "Entsorgung, Sortierung und Recyclinghof.", tag: "ab CHF 350" },
          { icon: "🎹", title: "Schwere Gegenstände", text: "Klavier, Tresor, Maschinen.", tag: "ab CHF 280" },
          { icon: "🏬", title: "Möbellager", text: "Sichere Lagerung, monatlich.", tag: "CHF 190/Monat" },
        ],
        about: {
          title: "Ein lokales Team mit viel Erfahrung",
          text: "Léman Déménagements begleitet seit 2012 Privatpersonen und Unternehmen in der Westschweiz. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Geschulte, versicherte Teams", "jeder Zügelmann ist geprüft und versichert."], ["Schutz inklusive", "Gurte, Decken und Bodenschutz."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 00 00", email: "hello@leman-demenagements.demo", zone: "Waadt, Genf, Wallis", hours: "Mo–Sa, 7–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Umzug — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihren Umzug…",
        pdfCompany: { name: "Léman Déménagements SA", address: "Avenue de Cour 18, 1007 Lausanne", phone: "021 000 00 00", email: "hello@leman-demenagements.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Umzug und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Abholadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, vorbehaltlich eines Zugangs gemäss Angaben. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          service: { text: "Welche Leistung wünschen Sie?", short: "Leistung", opts: { move: "Umzug", clear: "Nur Räumung", both: "Umzug + Räumung" } },
          size: { text: "Wie gross ist die Wohnung?", short: "Wohnung", opts: { s1: "Studio / 1–2 Zimmer", s3: "3 Zimmer", s4: "4 Zimmer", s5: "5 Zimmer und mehr / Haus" } },
          floors: { text: "Wie ist der Zugang zur Wohnung?", short: "Zugang", opts: { easy: "Erdgeschoss oder Lift", mid: "1–2 Stockwerke ohne Lift", high: "3 Stockwerke oder mehr ohne Lift" } },
          distance: { text: "Wie weit liegen alte und neue Wohnung auseinander?", short: "Distanz", opts: { local: "Unter 10 km", canton: "10 bis 50 km", inter: "50 bis 150 km", long: "Über 150 km" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { pack: "Verpackung und Kartons", furn: "Möbeldemontage / -montage", heavy: "Klavier oder sehr schwerer Gegenstand", store: "Möbellager (1 Monat)" } },
          date: { text: "An welchem Datum wünschen Sie den Umzug?", short: "Wunschtermin" },
        },
        items: {
          move: "Umzug — {crew} Zügelmänner + Lastwagen ({vol} m³)",
          access: "Tragzuschlag (Stockwerke ohne Lift)",
          distance: "Transport ausserhalb der Gemeinde ({km} km)",
          pack: "Verpackung + Kartons inklusive",
          furn: "Möbeldemontage / -montage",
          heavy: "Transport Klavier / schwerer Gegenstand",
          store: "Möbellager (1 Monat)",
          clear: "Räumung ({vol} m³)",
          disposal: "Entsorgung und Sortierung im Recyclinghof",
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
