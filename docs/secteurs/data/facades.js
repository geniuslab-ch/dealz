/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "facades",
    icon: "🏢",
    needsAddress: true,
    colors: { main: "#c2255c", dark: "#9c1c4a", light: "#fcdbe7", accent: "#1c7ed6", accentDark: "#1864ab", bg: "#fffafc" },

    quote: {
      minimum: 900,
      questions: [
        { id: "work", type: "single", options: [{ id: "render", rate: 68 }, { id: "paint", rate: 38 }, { id: "coating", rate: 26 }, { id: "clean", rate: 14 }] },
        { id: "surf", type: "single", options: [{ id: "s1", m2: 60 }, { id: "s2", m2: 120 }, { id: "s3", m2: 200 }, { id: "s4", m2: 350 }, { id: "s5", m2: 600 }] },
        { id: "floors", type: "single", options: [{ id: "f1", scaf: 14 }, { id: "f2", scaf: 18 }, { id: "f3", scaf: 24 }] },
        { id: "state", type: "single", options: [{ id: "good", rate: 0 }, { id: "cracks", rate: 9 }, { id: "damaged", rate: 22 }] },
        { id: "extras", type: "multi", options: [{ id: "graffiti" }, { id: "moss" }, { id: "color" }, { id: "protect" }] },
        { id: "date", type: "date", minDays: 14 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surf.m2;
        items.push({ label: L("work_" + a.work.id, { m2: m2 }), amount: H.round5(m2 * a.work.rate) });
        items.push({ label: L("scaffold", { m2: m2 }), amount: H.round5(m2 * a.floors.scaf) });
        if (a.state.rate) items.push({ label: L("repair_" + a.state.id), amount: H.round5(m2 * a.state.rate) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "graffiti") items.push({ label: L("graffiti", { m2: m2 }), amount: H.round5(m2 * 18) });
          if (e.id === "moss") items.push({ label: L("moss", { m2: m2 }), amount: H.round5(m2 * 7) });
          if (e.id === "color") items.push({ label: L("color"), amount: 290 });
          if (e.id === "protect") items.push({ label: L("protect"), amount: H.round5(m2 * 3 + 200) });
        });
        return items;
      },
    },

    fr: {
      label: "Façades, crépis et revêtements",
      forWho: "façadiers et entreprises de crépis et de revêtements",
      pitch: "Chiffrez crépis, peintures de façade et revêtements protecteurs au m², échafaudage compris.",
      emailNoun: "vos travaux de façade",
      landing: {
        h1: ["VOUS RAVALEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de façade perdez-vous parce que le devis demande une visite et une soirée de calcul ?",
        text: "Crépi, peinture, revêtement hydrofuge ou anti-graffiti : vos clients veulent un ordre de prix avant de réunir la PPE ou de demander un crédit. Dealz leur répond à toute heure, pose les bonnes questions (type de travaux, surface de façade, étages, état du support), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour refaire le crépi d'une maison d'environ 200 m² de façade ?",
        values: [
          { icon: "🏗️", title: "Échafaudage chiffré automatiquement", text: "Le nombre d'étages fixe le prix de l'échafaudage selon vos règles : plus d'oubli, plus de marge perdue." },
          { icon: "🛡️", title: "Revêtements et coatings", text: "Hydrofuge, anti-graffiti, traitement anti-mousse : les protections se vendent d'un clic dans chaque devis." },
          { icon: "🔍", title: "L'état du support pris en compte", text: "Fissures ou support abîmé : la réparation est ajoutée au prix sans que vous ayez à vous déplacer." },
          { icon: "🏘️", title: "Prêt pour les PPE et régies", text: "Un devis clair et ferme, que le client peut présenter tel quel à son assemblée ou à sa banque." },
        ],
        step1: "Importez vos tarifs : prix au m² par type de travaux, échafaudage par étage, réparations du support, options de protection. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces de façade, vos hauteurs et vos suppléments.",
        excel: { file: "tarifs-facades.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Crépi neuf", "200 m²", "CHF 13 600"], ["Échafaudage", "2 étages · 200 m²", "CHF 3 600"], ["Réparation des fissures", "200 m²", "CHF 1 800"]] },
        chat: ["« Notre crépi est fissuré, il faut le refaire. »", "« Quelle est la surface approximative de la façade ? »", "« Combien d'étages compte le bâtiment ? »"],
        offer: { company: "Façades Alpines Sàrl", rows: [["Crépi neuf (200 m²)", 13600], ["Échafaudage (200 m²)", 3600], ["Réparation des fissures", 1800]] },
        roi: "Une seule façade supplémentaire par an paie plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Façades Alpines",
        eyebrow: "Valais & Chablais · Exemple fictif",
        hero: { h1: "Une façade comme neuve, et son prix au m² en une minute.", text: "Crépis, peintures de façade et revêtements protecteurs en Valais et dans le Chablais — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "700+", lbl: "FAÇADES RÉNOVÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux de façade",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🧱", title: "Crépis", text: "Crépi minéral ou synthétique, toutes finitions.", tag: "dès CHF 68/m²" },
          { icon: "🎨", title: "Peinture de façade", text: "Peintures minérales et siloxanes.", tag: "dès CHF 38/m²" },
          { icon: "🛡️", title: "Revêtements protecteurs", text: "Coatings hydrofuges et imperméabilisants.", tag: "dès CHF 26/m²" },
          { icon: "💦", title: "Nettoyage de façade", text: "Haute pression, anti-mousse et anti-algues.", tag: "dès CHF 14/m²" },
          { icon: "🚫", title: "Anti-graffiti", text: "Protection permanente, nettoyage facilité.", tag: "dès CHF 18/m²" },
          { icon: "🔍", title: "Réparation du support", text: "Fissures, éclats, joints de façade.", tag: "dès CHF 9/m²" },
        ],
        about: {
          title: "Des façadiers qui protègent votre bâtiment",
          text: "Façades Alpines rénove depuis 2010 les façades de maisons, immeubles et chalets en Valais et dans le Chablais. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Échafaudage sécurisé", "montage conforme SUVA, bâchage complet."], ["Produits adaptés au climat alpin", "résistants au gel et aux UV."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "027 000 01 05", email: "hello@facades-alpines.demo", zone: "Valais, Chablais", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur votre façade — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez vos travaux de façade…",
        pdfCompany: { name: "Façades Alpines Sàrl", address: "Rue de la Dixence 33, 1950 Sion", phone: "027 000 01 05", email: "hello@facades-alpines.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre façade, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du bâtiment (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, matériaux, échafaudage et main-d'œuvre compris. Dégâts cachés découverts sur le support traités uniquement sur accord préalable. TVA suisse incluse le cas échéant.",
        q: {
          work: { text: "Quel type de travaux souhaitez-vous ?", short: "Travaux", opts: { render: "Crépi neuf", paint: "Peinture de façade", coating: "Revêtement protecteur (hydrofuge, imperméabilisant)", clean: "Nettoyage de façade" } },
          surf: { text: "Quelle est la surface approximative de la façade ?", short: "Surface", opts: { s1: "Environ 60 m² (petite maison)", s2: "Environ 120 m² (maison)", s3: "Environ 200 m² (grande maison)", s4: "Environ 350 m² (petit immeuble)", s5: "600 m² ou plus (immeuble)" } },
          floors: { text: "Combien d'étages compte le bâtiment ?", short: "Étages", opts: { f1: "1 étage", f2: "2 étages", f3: "3 étages et plus" } },
          state: { text: "Dans quel état est la façade ?", short: "État", opts: { good: "Bon état", cracks: "Quelques fissures", damaged: "Support abîmé (éclats, crépi qui se décolle)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { graffiti: "Protection anti-graffiti", moss: "Traitement anti-mousse et anti-algues", color: "Étude de couleur", protect: "Protection des abords et des fenêtres" } },
          date: { text: "Pour quelle date souhaitez-vous les travaux ?", short: "Date souhaitée" },
        },
        items: {
          work_render: "Crépi neuf ({m2} m²)",
          work_paint: "Peinture de façade ({m2} m²)",
          work_coating: "Revêtement protecteur ({m2} m²)",
          work_clean: "Nettoyage de façade ({m2} m²)",
          scaffold: "Échafaudage et bâchage ({m2} m²)",
          repair_cracks: "Réparation des fissures",
          repair_damaged: "Réparation du support",
          graffiti: "Protection anti-graffiti ({m2} m²)",
          moss: "Traitement anti-mousse et anti-algues ({m2} m²)",
          color: "Étude de couleur",
          protect: "Protection des abords et des fenêtres",
        },
      },
    },
    en: {
      label: "Facades, render and coatings",
      forWho: "facade contractors and rendering and coating companies",
      pitch: "Price render, facade painting and protective coatings per m², scaffolding included.",
      emailNoun: "your facade work",
      landing: {
        h1: ["YOU REFRESH FACADES.", "DEALZ PRICES."],
        question: "How many facade requests do you lose because the quote needs a visit and an evening of calculations?",
        text: "Render, paint, water-repellent or anti-graffiti coating: your customers want a price range before they call a co-owners' meeting or ask for a loan. Dealz answers them at any hour, asks the right questions (type of work, facade area, storeys, condition of the surface), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to re-render a house with about 200 m² of facade?",
        values: [
          { icon: "🏗️", title: "Scaffolding priced automatically", text: "The number of storeys sets the scaffolding price according to your rules: nothing forgotten, no lost margin." },
          { icon: "🛡️", title: "Coatings and protection", text: "Water-repellent, anti-graffiti, anti-moss treatment: protection sells with one click in every quote." },
          { icon: "🔍", title: "Surface condition taken into account", text: "Cracks or damaged surface: the repair is added to the price without you travelling." },
          { icon: "🏘️", title: "Ready for co-owners and managers", text: "A clear, firm quote the customer can present as it is to their meeting or their bank." },
        ],
        step1: "Import your rates: price per m² by type of work, scaffolding per storey, surface repairs, protection options. Your Excel stays your working tool.",
        step2: "The engine understands your facade areas, your heights and your surcharges.",
        excel: { file: "facade-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["New render", "200 m²", "CHF 13,600"], ["Scaffolding", "2 storeys · 200 m²", "CHF 3,600"], ["Crack repair", "200 m²", "CHF 1,800"]] },
        chat: ["“Our render is cracked, it needs redoing.”", "“Roughly how large is the facade?”", "“How many storeys does the building have?”"],
        offer: { company: "Façades Alpines Sàrl", rows: [["New render (200 m²)", 13600], ["Scaffolding (200 m²)", 3600], ["Crack repair", 1800]] },
        roi: "A single extra facade per year pays for several years of subscription.",
      },
      demo: {
        brand: "Façades Alpines",
        eyebrow: "Valais & Chablais · Fictional example",
        hero: { h1: "A facade like new, and its price per m² in a minute.", text: "Render, facade painting and protective coatings in Valais and the Chablais — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "700+", lbl: "FACADES RENOVATED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our facade work",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🧱", title: "Render", text: "Mineral or synthetic render, all finishes.", tag: "from CHF 68/m²" },
          { icon: "🎨", title: "Facade painting", text: "Mineral and siloxane paints.", tag: "from CHF 38/m²" },
          { icon: "🛡️", title: "Protective coatings", text: "Water-repellent and waterproofing coatings.", tag: "from CHF 26/m²" },
          { icon: "💦", title: "Facade cleaning", text: "Pressure washing, anti-moss and anti-algae.", tag: "from CHF 14/m²" },
          { icon: "🚫", title: "Anti-graffiti", text: "Permanent protection, easy cleaning.", tag: "from CHF 18/m²" },
          { icon: "🔍", title: "Surface repair", text: "Cracks, chips, facade joints.", tag: "from CHF 9/m²" },
        ],
        about: {
          title: "Facade specialists who protect your building",
          text: "Since 2010, Façades Alpines has renovated the facades of houses, apartment buildings and chalets in Valais and the Chablais. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Safe scaffolding", "erected to SUVA standards, fully sheeted."], ["Products for the alpine climate", "frost- and UV-resistant."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "027 000 01 05", email: "hello@facades-alpines.demo", zone: "Valais, Chablais", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your facade — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your facade work…",
        pdfCompany: { name: "Façades Alpines Sàrl", address: "Rue de la Dixence 33, 1950 Sion", phone: "027 000 01 05", email: "hello@facades-alpines.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your facade, then put together a firm quote right away.",
        addressPlaceholder: "Building address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, materials, scaffolding and labour included. Hidden damage found in the surface treated only with prior agreement. Swiss VAT included where applicable.",
        q: {
          work: { text: "What kind of work do you need?", short: "Work", opts: { render: "New render", paint: "Facade painting", coating: "Protective coating (water-repellent, waterproofing)", clean: "Facade cleaning" } },
          surf: { text: "Roughly how large is the facade?", short: "Area", opts: { s1: "About 60 m² (small house)", s2: "About 120 m² (house)", s3: "About 200 m² (large house)", s4: "About 350 m² (small building)", s5: "600 m² or more (apartment building)" } },
          floors: { text: "How many storeys does the building have?", short: "Storeys", opts: { f1: "1 storey", f2: "2 storeys", f3: "3 storeys or more" } },
          state: { text: "What condition is the facade in?", short: "Condition", opts: { good: "Good condition", cracks: "A few cracks", damaged: "Damaged surface (chips, render coming off)" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { graffiti: "Anti-graffiti protection", moss: "Anti-moss and anti-algae treatment", color: "Colour study", protect: "Protecting surroundings and windows" } },
          date: { text: "When would you like the work done?", short: "Preferred date" },
        },
        items: {
          work_render: "New render ({m2} m²)",
          work_paint: "Facade painting ({m2} m²)",
          work_coating: "Protective coating ({m2} m²)",
          work_clean: "Facade cleaning ({m2} m²)",
          scaffold: "Scaffolding and sheeting ({m2} m²)",
          repair_cracks: "Crack repair",
          repair_damaged: "Surface repair",
          graffiti: "Anti-graffiti protection ({m2} m²)",
          moss: "Anti-moss and anti-algae treatment ({m2} m²)",
          color: "Colour study",
          protect: "Protecting surroundings and windows",
        },
      },
    },
    de: {
      label: "Fassaden, Verputz und Beschichtungen",
      forWho: "Fassadenbauer, Verputzer und Beschichtungsfirmen",
      pitch: "Verputz, Fassadenanstriche und Schutzbeschichtungen pro m² berechnen — Gerüst inbegriffen.",
      emailNoun: "Ihre Fassadenarbeiten",
      landing: {
        h1: ["SIE SANIEREN FASSADEN.", "DEALZ RECHNET."],
        question: "Wie viele Fassaden-Anfragen verlieren Sie, weil die Offerte eine Besichtigung und einen Abend Rechnen braucht?",
        text: "Verputz, Anstrich, wasserabweisende oder Anti-Graffiti-Beschichtung: Ihre Kunden wollen eine Preisvorstellung, bevor sie die Stockwerkeigentümer einberufen oder einen Kredit anfragen. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Art der Arbeiten, Fassadenfläche, Stockwerke, Zustand des Untergrunds), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet ein neuer Verputz für ein Haus mit etwa 200 m² Fassade?",
        values: [
          { icon: "🏗️", title: "Gerüst automatisch berechnet", text: "Die Anzahl Stockwerke bestimmt den Gerüstpreis nach Ihren Regeln: nichts vergessen, keine verlorene Marge." },
          { icon: "🛡️", title: "Beschichtungen und Schutz", text: "Hydrophobierung, Anti-Graffiti, Anti-Moos-Behandlung: Schutz wird in jeder Offerte mit einem Klick verkauft." },
          { icon: "🔍", title: "Zustand des Untergrunds berücksichtigt", text: "Risse oder beschädigter Untergrund: Die Reparatur kommt in den Preis, ohne dass Sie hinfahren." },
          { icon: "🏘️", title: "Bereit für STWE und Verwaltungen", text: "Eine klare, verbindliche Offerte, die der Kunde so seiner Versammlung oder Bank vorlegen kann." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m² nach Arbeit, Gerüst pro Stockwerk, Untergrundreparaturen, Schutzoptionen. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Fassadenflächen, Ihre Höhen und Ihre Zuschläge.",
        excel: { file: "tarife-fassaden.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Neuer Verputz", "200 m²", "CHF 13'600"], ["Gerüst", "2 Stockwerke · 200 m²", "CHF 3'600"], ["Rissreparatur", "200 m²", "CHF 1'800"]] },
        chat: ["«Unser Verputz hat Risse und muss erneuert werden.»", "«Wie gross ist die Fassade ungefähr?»", "«Wie viele Stockwerke hat das Gebäude?»"],
        offer: { company: "Façades Alpines Sàrl", rows: [["Neuer Verputz (200 m²)", 13600], ["Gerüst (200 m²)", 3600], ["Rissreparatur", 1800]] },
        roi: "Eine einzige zusätzliche Fassade pro Jahr bezahlt mehrere Jahre Abo.",
      },
      demo: {
        brand: "Façades Alpines",
        eyebrow: "Wallis & Chablais · Fiktives Beispiel",
        hero: { h1: "Eine Fassade wie neu, und ihr m²-Preis in einer Minute.", text: "Verputz, Fassadenanstriche und Schutzbeschichtungen im Wallis und im Chablais — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "700+", lbl: "SANIERTE FASSADEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Fassadenarbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🧱", title: "Verputz", text: "Mineralischer oder synthetischer Verputz, alle Strukturen.", tag: "ab CHF 68/m²" },
          { icon: "🎨", title: "Fassadenanstrich", text: "Mineral- und Siloxanfarben.", tag: "ab CHF 38/m²" },
          { icon: "🛡️", title: "Schutzbeschichtungen", text: "Hydrophobierende und abdichtende Beschichtungen.", tag: "ab CHF 26/m²" },
          { icon: "💦", title: "Fassadenreinigung", text: "Hochdruck, Anti-Moos und Anti-Algen.", tag: "ab CHF 14/m²" },
          { icon: "🚫", title: "Anti-Graffiti", text: "Dauerhafter Schutz, einfache Reinigung.", tag: "ab CHF 18/m²" },
          { icon: "🔍", title: "Untergrundreparatur", text: "Risse, Abplatzungen, Fassadenfugen.", tag: "ab CHF 9/m²" },
        ],
        about: {
          title: "Fassadenprofis, die Ihr Gebäude schützen",
          text: "Façades Alpines saniert seit 2010 die Fassaden von Häusern, Mehrfamilienhäusern und Chalets im Wallis und im Chablais. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Sicheres Gerüst", "Montage nach SUVA-Vorgaben, vollständig eingepackt."], ["Produkte für das Alpenklima", "frost- und UV-beständig."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "027 000 01 05", email: "hello@facades-alpines.demo", zone: "Wallis, Chablais", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrer Fassade — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Fassadenarbeiten…",
        pdfCompany: { name: "Façades Alpines Sàrl", address: "Rue de la Dixence 33, 1950 Sion", phone: "027 000 01 05", email: "hello@facades-alpines.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Fassade und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse des Gebäudes (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Material, Gerüst und Arbeit inbegriffen. Im Untergrund entdeckte versteckte Schäden nur nach vorheriger Absprache. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          work: { text: "Welche Arbeiten wünschen Sie?", short: "Arbeiten", opts: { render: "Neuer Verputz", paint: "Fassadenanstrich", coating: "Schutzbeschichtung (hydrophob, abdichtend)", clean: "Fassadenreinigung" } },
          surf: { text: "Wie gross ist die Fassade ungefähr?", short: "Fläche", opts: { s1: "Etwa 60 m² (kleines Haus)", s2: "Etwa 120 m² (Haus)", s3: "Etwa 200 m² (grosses Haus)", s4: "Etwa 350 m² (kleines Mehrfamilienhaus)", s5: "600 m² oder mehr (Mehrfamilienhaus)" } },
          floors: { text: "Wie viele Stockwerke hat das Gebäude?", short: "Stockwerke", opts: { f1: "1 Stockwerk", f2: "2 Stockwerke", f3: "3 Stockwerke und mehr" } },
          state: { text: "In welchem Zustand ist die Fassade?", short: "Zustand", opts: { good: "Guter Zustand", cracks: "Einige Risse", damaged: "Beschädigter Untergrund (Abplatzungen, loser Verputz)" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { graffiti: "Anti-Graffiti-Schutz", moss: "Anti-Moos- und Anti-Algen-Behandlung", color: "Farbstudie", protect: "Schutz der Umgebung und Fenster" } },
          date: { text: "Wann wünschen Sie die Arbeiten?", short: "Wunschtermin" },
        },
        items: {
          work_render: "Neuer Verputz ({m2} m²)",
          work_paint: "Fassadenanstrich ({m2} m²)",
          work_coating: "Schutzbeschichtung ({m2} m²)",
          work_clean: "Fassadenreinigung ({m2} m²)",
          scaffold: "Gerüst und Einpacken ({m2} m²)",
          repair_cracks: "Rissreparatur",
          repair_damaged: "Untergrundreparatur",
          graffiti: "Anti-Graffiti-Schutz ({m2} m²)",
          moss: "Anti-Moos- und Anti-Algen-Behandlung ({m2} m²)",
          color: "Farbstudie",
          protect: "Schutz der Umgebung und Fenster",
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
