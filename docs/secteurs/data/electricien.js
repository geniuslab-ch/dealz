/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var UNIT = { outlets: 180, lighting: 220 };
  var S = {
    slug: "electricien",
    icon: "⚡",
    needsAddress: true,
    colors: { main: "#f59f00", dark: "#c77f00", light: "#fff3bf", accent: "#364fc7", accentDark: "#2b3a9f", bg: "#fffdf5" },

    quote: {
      minimum: 250,
      questions: [
        { id: "work", type: "single", options: [{ id: "repair" }, { id: "outlets" }, { id: "lighting" }, { id: "panel" }, { id: "charger" }] },
        {
          id: "points", type: "single",
          when: function (a) { return a.work.id === "outlets" || a.work.id === "lighting"; },
          options: [{ id: "p1", n: 2 }, { id: "p2", n: 5 }, { id: "p3", n: 10 }],
        },
        {
          id: "distance", type: "single",
          when: function (a) { return a.work.id === "charger"; },
          options: [{ id: "near", price: 0 }, { id: "mid", price: 650 }, { id: "far", price: 1400 }],
        },
        {
          id: "urgency", type: "single",
          when: function (a) { return a.work.id === "repair"; },
          options: [{ id: "normal", price: 0 }, { id: "fast", price: 120 }, { id: "emergency", price: 250 }],
        },
        { id: "extras", type: "multi", options: [{ id: "ras" }, { id: "surge" }, { id: "smart" }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var w = a.work.id;
        if (w === "repair") {
          items.push({ label: L("callout"), amount: 130 });
          items.push({ label: L("repair"), amount: 145 });
          if (a.urgency.price) items.push({ label: L("urgency_" + a.urgency.id), amount: a.urgency.price });
        } else if (w === "outlets" || w === "lighting") {
          items.push({ label: L("work_" + w, { n: a.points.n }), amount: H.round5(a.points.n * UNIT[w]) });
        } else if (w === "panel") {
          items.push({ label: L("panel"), amount: 2400 });
        } else {
          items.push({ label: L("charger"), amount: 2900 });
          if (a.distance.price) items.push({ label: L("distance_" + a.distance.id), amount: a.distance.price });
        }
        (a.extras || []).forEach(function (e) {
          if (e.id === "ras") items.push({ label: L("ras"), amount: 450 });
          if (e.id === "surge") items.push({ label: L("surge"), amount: 380 });
          if (e.id === "smart") items.push({ label: L("smart"), amount: 1200 });
        });
        return items;
      },
    },

    fr: {
      label: "Électricité",
      forWho: "électriciens et entreprises d'installations électriques",
      pitch: "Chiffrez dépannages, prises, éclairages, tableaux et bornes de recharge en une minute.",
      emailNoun: "vos travaux d'électricité",
      landing: {
        h1: ["VOUS INSTALLEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de bornes de recharge et de dépannages vous échappent pendant vos interventions ?",
        text: "Borne pour la nouvelle voiture électrique, prises supplémentaires, tableau à remplacer : vos clients veulent un prix tout de suite. Dealz leur répond à toute heure, pose les bonnes questions (type de travaux, nombre de points, distance au tableau, urgence), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour installer une borne de recharge dans mon garage ?",
        values: [
          { icon: "🔌", title: "Bornes de recharge chiffrées", text: "Le client indique la distance au tableau, Dealz ajoute le raccordement selon vos tarifs : un prix ferme sans visite." },
          { icon: "💡", title: "Prix au point", text: "Prises, interrupteurs, éclairages : votre prix unitaire multiplié automatiquement par le nombre de points." },
          { icon: "🚨", title: "Les dépannages triés", text: "Panne le soir ou le week-end : le supplément d'urgence est appliqué selon vos règles." },
          { icon: "📋", title: "Contrôles et options vendus", text: "Rapport de sécurité OIBT, parafoudre, domotique : proposés dans chaque devis, ils augmentent votre panier." },
        ],
        step1: "Importez vos tarifs : forfaits de dépannage, prix par point, tableaux, bornes, raccordements, suppléments. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos forfaits, vos prix unitaires et vos options.",
        excel: { file: "tarifs-electricite.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Borne de recharge 11 kW", "fourniture et pose", "CHF 2 900"], ["Raccordement", "10 à 25 m du tableau", "CHF 650"], ["Protection parafoudre", "tableau existant", "CHF 380"]] },
        chat: ["« Nous recevons une voiture électrique le mois prochain. »", "« À quelle distance du tableau électrique se trouve la place de parc ? »", "« Souhaitez-vous ajouter une protection parafoudre ? »"],
        offer: { company: "Volta Électricité Sàrl", rows: [["Borne de recharge 11 kW", 2900], ["Raccordement (10 à 25 m)", 650], ["Protection parafoudre", 380]] },
        roi: "Deux bornes de recharge supplémentaires par an paient plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Volta Électricité",
        eyebrow: "Genève & La Côte · Exemple fictif",
        hero: { h1: "Courant, lumière, recharge : votre prix en une minute.", text: "Dépannages, installations, tableaux et bornes de recharge à Genève et sur La Côte — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "450+", lbl: "BORNES INSTALLÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux d'électricité",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚨", title: "Dépannage", text: "Panne, disjoncteur, court-circuit.", tag: "dès CHF 275" },
          { icon: "🔌", title: "Prises et interrupteurs", text: "Ajout et déplacement de points.", tag: "dès CHF 180/point" },
          { icon: "💡", title: "Éclairage", text: "Spots, luminaires, éclairage extérieur.", tag: "dès CHF 220/point" },
          { icon: "🗄️", title: "Tableau électrique", text: "Remplacement et mise aux normes.", tag: "CHF 2 400" },
          { icon: "🚗", title: "Bornes de recharge", text: "Wallbox 11 kW pour voiture électrique.", tag: "dès CHF 2 900" },
          { icon: "📋", title: "Rapport de sécurité", text: "Contrôle OIBT pour vente ou location.", tag: "CHF 450" },
        ],
        about: {
          title: "Des électriciens concessionnaires et réactifs",
          text: "Volta Électricité intervient depuis 2008 chez les particuliers, régies et commerces de Genève et de La Côte. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Concessionnaire agréé", "autorisation d'installer selon l'OIBT."], ["Intervention rapide", "dépannage dans la journée."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 01 09", email: "hello@volta-electricite.demo", zone: "Genève, La Côte", hours: "Lun–Ven, 7h30–17h30 · urgences 7j/7" },
        devisNote: "Répondez à quelques questions sur votre besoin — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre besoin en électricité…",
        pdfCompany: { name: "Volta Électricité Sàrl", address: "Rue de Lyon 77, 1203 Genève", phone: "022 000 01 09", email: "hello@volta-electricite.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre installation électrique, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de l'intervention (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, fourniture et main-d'œuvre comprises. Non-conformités découvertes sur l'installation existante traitées uniquement sur accord préalable.",
        q: {
          work: { text: "De quoi avez-vous besoin ?", short: "Travaux", opts: { repair: "Un dépannage (panne, disjoncteur)", outlets: "Ajouter des prises ou interrupteurs", lighting: "Installer de l'éclairage", panel: "Remplacer le tableau électrique", charger: "Installer une borne de recharge" } },
          points: { text: "Combien de points faut-il installer ?", short: "Points", opts: { p1: "1 ou 2", p2: "3 à 6", p3: "7 ou plus" } },
          distance: { text: "À quelle distance du tableau électrique se trouve la place de parc ?", short: "Distance", opts: { near: "Moins de 10 m", mid: "10 à 25 m", far: "Plus de 25 m" } },
          urgency: { text: "Quand faut-il intervenir ?", short: "Urgence", opts: { normal: "Dans la semaine", fast: "Sous 48 heures", emergency: "En urgence (soir ou week-end)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { ras: "Rapport de sécurité OIBT", surge: "Protection parafoudre", smart: "Domotique de base (éclairage et stores connectés)" } },
          date: { text: "Pour quelle date souhaitez-vous l'intervention ?", short: "Date souhaitée" },
        },
        items: {
          callout: "Déplacement",
          repair: "Diagnostic et réparation (1 heure)",
          urgency_fast: "Supplément intervention sous 48 heures",
          urgency_emergency: "Supplément urgence (soir ou week-end)",
          work_outlets: "Prises et interrupteurs ({n} points)",
          work_lighting: "Points d'éclairage ({n} points)",
          panel: "Remplacement du tableau électrique",
          charger: "Borne de recharge 11 kW, fourniture et pose",
          distance_mid: "Raccordement de la borne (10 à 25 m)",
          distance_far: "Raccordement de la borne (plus de 25 m)",
          ras: "Rapport de sécurité OIBT",
          surge: "Protection parafoudre",
          smart: "Domotique de base",
        },
      },
    },
    en: {
      label: "Electrical work",
      forWho: "electricians and electrical installation companies",
      pitch: "Price call-outs, sockets, lighting, fuse boards and EV chargers in a minute.",
      emailNoun: "your electrical work",
      landing: {
        h1: ["YOU WIRE IT.", "DEALZ PRICES."],
        question: "How many EV-charger and call-out requests slip away while you're on a job?",
        text: "A charger for the new electric car, extra sockets, a fuse board to replace: your customers want a price straight away. Dealz answers them at any hour, asks the right questions (type of work, number of points, distance to the board, urgency), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to install an EV charger in my garage?",
        values: [
          { icon: "🔌", title: "EV chargers priced", text: "The customer gives the distance to the board, Dealz adds the cabling from your rates: a firm price without a visit." },
          { icon: "💡", title: "Price per point", text: "Sockets, switches, lighting: your unit price multiplied automatically by the number of points." },
          { icon: "🚨", title: "Call-outs sorted", text: "A fault in the evening or at the weekend: the emergency surcharge follows your rules." },
          { icon: "📋", title: "Inspections and options sold", text: "Safety report, surge protection, home automation: offered in every quote, they raise your average order." },
        ],
        step1: "Import your rates: call-out packages, price per point, fuse boards, chargers, cabling, surcharges. Your Excel stays your working tool.",
        step2: "The engine understands your packages, your unit prices and your options.",
        excel: { file: "electrical-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["EV charger 11 kW", "supply and fitting", "CHF 2,900"], ["Cabling", "10 to 25 m from the board", "CHF 650"], ["Surge protection", "existing board", "CHF 380"]] },
        chat: ["“We're getting an electric car next month.”", "“How far is the parking space from the fuse board?”", "“Would you like to add surge protection?”"],
        offer: { company: "Volta Électricité Sàrl", rows: [["EV charger 11 kW", 2900], ["Cabling (10 to 25 m)", 650], ["Surge protection", 380]] },
        roi: "Two extra EV chargers a year pay for several years of subscription.",
      },
      demo: {
        brand: "Volta Électricité",
        eyebrow: "Geneva & La Côte · Fictional example",
        hero: { h1: "Power, light, charging: your price in a minute.", text: "Call-outs, installations, fuse boards and EV chargers in Geneva and La Côte — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "450+", lbl: "CHARGERS INSTALLED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our electrical work",
        servicesSub: "Pick a service, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "🚨", title: "Call-outs", text: "Faults, tripped breakers, short circuits.", tag: "from CHF 275" },
          { icon: "🔌", title: "Sockets and switches", text: "Adding and moving points.", tag: "from CHF 180/point" },
          { icon: "💡", title: "Lighting", text: "Spotlights, fittings, outdoor lighting.", tag: "from CHF 220/point" },
          { icon: "🗄️", title: "Fuse board", text: "Replacement and upgrade to standard.", tag: "CHF 2,400" },
          { icon: "🚗", title: "EV chargers", text: "11 kW wallbox for electric cars.", tag: "from CHF 2,900" },
          { icon: "📋", title: "Safety report", text: "Official inspection for sale or rental.", tag: "CHF 450" },
        ],
        about: {
          title: "Licensed, responsive electricians",
          text: "Since 2008, Volta Électricité has worked for households, property managers and shops in Geneva and La Côte. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Licensed installer", "authorised under Swiss low-voltage rules."], ["Fast response", "same-day call-outs."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "022 000 01 09", email: "hello@volta-electricite.demo", zone: "Geneva, La Côte", hours: "Mon–Fri, 7:30am–5:30pm · emergencies 7 days" },
        devisNote: "Answer a few questions about what you need — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your electrical needs…",
        pdfCompany: { name: "Volta Électricité Sàrl", address: "Rue de Lyon 77, 1203 Genève", phone: "022 000 01 09", email: "hello@volta-electricite.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your electrical installation, then put together a firm quote right away.",
        addressPlaceholder: "Job address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, supply and labour included. Non-compliant existing wiring found on site dealt with only with prior agreement.",
        q: {
          work: { text: "What do you need?", short: "Work", opts: { repair: "A call-out (fault, tripped breaker)", outlets: "Add sockets or switches", lighting: "Install lighting", panel: "Replace the fuse board", charger: "Install an EV charger" } },
          points: { text: "How many points need installing?", short: "Points", opts: { p1: "1 or 2", p2: "3 to 6", p3: "7 or more" } },
          distance: { text: "How far is the parking space from the fuse board?", short: "Distance", opts: { near: "Under 10 m", mid: "10 to 25 m", far: "Over 25 m" } },
          urgency: { text: "When do you need us?", short: "Urgency", opts: { normal: "Within the week", fast: "Within 48 hours", emergency: "Emergency (evening or weekend)" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { ras: "Electrical safety report", surge: "Surge protection", smart: "Basic home automation (smart lighting and blinds)" } },
          date: { text: "When would you like the job done?", short: "Preferred date" },
        },
        items: {
          callout: "Call-out",
          repair: "Diagnosis and repair (1 hour)",
          urgency_fast: "Surcharge for service within 48 hours",
          urgency_emergency: "Emergency surcharge (evening or weekend)",
          work_outlets: "Sockets and switches ({n} points)",
          work_lighting: "Lighting points ({n} points)",
          panel: "Fuse board replacement",
          charger: "EV charger 11 kW, supply and fitting",
          distance_mid: "Charger cabling (10 to 25 m)",
          distance_far: "Charger cabling (over 25 m)",
          ras: "Electrical safety report",
          surge: "Surge protection",
          smart: "Basic home automation",
        },
      },
    },
    de: {
      label: "Elektroinstallationen",
      forWho: "Elektriker und Elektroinstallationsfirmen",
      pitch: "Reparaturen, Steckdosen, Beleuchtung, Verteiler und Ladestationen in einer Minute berechnen.",
      emailNoun: "Ihre Elektroarbeiten",
      landing: {
        h1: ["SIE INSTALLIEREN.", "DEALZ RECHNET."],
        question: "Wie viele Anfragen für Ladestationen und Reparaturen entgehen Ihnen während Ihrer Einsätze?",
        text: "Eine Ladestation fürs neue Elektroauto, zusätzliche Steckdosen, ein neuer Verteiler: Ihre Kunden wollen sofort einen Preis. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Art der Arbeiten, Anzahl Punkte, Distanz zum Verteiler, Dringlichkeit), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet eine Ladestation in meiner Garage?",
        values: [
          { icon: "🔌", title: "Ladestationen berechnet", text: "Der Kunde gibt die Distanz zum Verteiler an, Dealz fügt die Zuleitung nach Ihren Tarifen hinzu: ein verbindlicher Preis ohne Besichtigung." },
          { icon: "💡", title: "Preis pro Punkt", text: "Steckdosen, Schalter, Leuchten: Ihr Stückpreis automatisch mit der Anzahl Punkte multipliziert." },
          { icon: "🚨", title: "Reparaturen sortiert", text: "Störung am Abend oder am Wochenende: Der Notfallzuschlag folgt Ihren Regeln." },
          { icon: "📋", title: "Kontrollen und Optionen verkauft", text: "Sicherheitsnachweis SiNa, Überspannungsschutz, Smart Home: in jeder Offerte angeboten, sie erhöhen Ihren Auftragswert." },
        ],
        step1: "Importieren Sie Ihre Tarife: Reparaturpauschalen, Preis pro Punkt, Verteiler, Ladestationen, Zuleitungen, Zuschläge. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Pauschalen, Ihre Stückpreise und Ihre Optionen.",
        excel: { file: "tarife-elektro.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Ladestation 11 kW", "Lieferung und Montage", "CHF 2'900"], ["Zuleitung", "10 bis 25 m vom Verteiler", "CHF 650"], ["Überspannungsschutz", "bestehender Verteiler", "CHF 380"]] },
        chat: ["«Wir bekommen nächsten Monat ein Elektroauto.»", "«Wie weit ist der Parkplatz vom Verteiler entfernt?»", "«Möchten Sie einen Überspannungsschutz?»"],
        offer: { company: "Volta Électricité Sàrl", rows: [["Ladestation 11 kW", 2900], ["Zuleitung (10 bis 25 m)", 650], ["Überspannungsschutz", 380]] },
        roi: "Zwei zusätzliche Ladestationen pro Jahr bezahlen mehrere Jahre Abo.",
      },
      demo: {
        brand: "Volta Électricité",
        eyebrow: "Genf & La Côte · Fiktives Beispiel",
        hero: { h1: "Strom, Licht, Laden: Ihr Preis in einer Minute.", text: "Reparaturen, Installationen, Verteiler und Ladestationen in Genf und an der Côte — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "450+", lbl: "LADESTATIONEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Elektroarbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Anliegen einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🚨", title: "Störungsdienst", text: "Ausfall, Sicherung, Kurzschluss.", tag: "ab CHF 275" },
          { icon: "🔌", title: "Steckdosen und Schalter", text: "Neue und verschobene Punkte.", tag: "ab CHF 180/Punkt" },
          { icon: "💡", title: "Beleuchtung", text: "Spots, Leuchten, Aussenbeleuchtung.", tag: "ab CHF 220/Punkt" },
          { icon: "🗄️", title: "Verteiler", text: "Ersatz und Anpassung an die Normen.", tag: "CHF 2'400" },
          { icon: "🚗", title: "Ladestationen", text: "Wallbox 11 kW für Elektroautos.", tag: "ab CHF 2'900" },
          { icon: "📋", title: "Sicherheitsnachweis", text: "Kontrolle bei Verkauf oder Vermietung.", tag: "CHF 450" },
        ],
        about: {
          title: "Konzessionierte, schnelle Elektriker",
          text: "Volta Électricité arbeitet seit 2008 für Privatpersonen, Verwaltungen und Geschäfte in Genf und an der Côte. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Konzessionierter Installateur", "Installationsbewilligung nach NIV."], ["Schneller Einsatz", "Störungsdienst am selben Tag."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "022 000 01 09", email: "hello@volta-electricite.demo", zone: "Genf, La Côte", hours: "Mo–Fr, 7.30–17.30 Uhr · Notfälle 7 Tage" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Anliegen — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Elektro-Anliegen…",
        pdfCompany: { name: "Volta Électricité Sàrl", address: "Rue de Lyon 77, 1203 Genève", phone: "022 000 01 09", email: "hello@volta-electricite.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Elektroinstallation und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Einsatzadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Lieferung und Arbeit inbegriffen. An der bestehenden Installation entdeckte Mängel nur nach vorheriger Absprache.",
        q: {
          work: { text: "Was benötigen Sie?", short: "Arbeiten", opts: { repair: "Eine Reparatur (Störung, Sicherung)", outlets: "Steckdosen oder Schalter hinzufügen", lighting: "Beleuchtung installieren", panel: "Verteiler ersetzen", charger: "Ladestation installieren" } },
          points: { text: "Wie viele Punkte sollen installiert werden?", short: "Punkte", opts: { p1: "1 oder 2", p2: "3 bis 6", p3: "7 oder mehr" } },
          distance: { text: "Wie weit ist der Parkplatz vom Verteiler entfernt?", short: "Distanz", opts: { near: "Unter 10 m", mid: "10 bis 25 m", far: "Über 25 m" } },
          urgency: { text: "Wann sollen wir kommen?", short: "Dringlichkeit", opts: { normal: "Innerhalb der Woche", fast: "Innerhalb von 48 Stunden", emergency: "Notfall (abends oder Wochenende)" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { ras: "Sicherheitsnachweis SiNa", surge: "Überspannungsschutz", smart: "Smart Home Basis (Licht und Storen vernetzt)" } },
          date: { text: "Wann wünschen Sie den Einsatz?", short: "Wunschtermin" },
        },
        items: {
          callout: "Anfahrt",
          repair: "Diagnose und Reparatur (1 Stunde)",
          urgency_fast: "Zuschlag Einsatz innert 48 Stunden",
          urgency_emergency: "Notfallzuschlag (abends oder Wochenende)",
          work_outlets: "Steckdosen und Schalter ({n} Punkte)",
          work_lighting: "Beleuchtungspunkte ({n} Punkte)",
          panel: "Ersatz des Verteilers",
          charger: "Ladestation 11 kW, Lieferung und Montage",
          distance_mid: "Zuleitung Ladestation (10 bis 25 m)",
          distance_far: "Zuleitung Ladestation (über 25 m)",
          ras: "Sicherheitsnachweis SiNa",
          surge: "Überspannungsschutz",
          smart: "Smart Home Basis",
        },
      },
    },
    it: {
      label: "Elettricità",
      forWho: "elettricisti e imprese di installazioni elettriche",
      pitch: "Calcolate interventi, prese, illuminazione, quadri elettrici e colonnine di ricarica in un minuto.",
      emailNoun: "i vostri lavori elettrici",
      landing: {
        h1: ["VOI CABLATE.", "DEALZ FA IL PREVENTIVO."],
        question: "Quante richieste di colonnine e di interventi vi sfuggono mentre siete in cantiere?",
        text: "Una colonnina per la nuova auto elettrica, prese in più, un quadro da sostituire: i vostri clienti vogliono subito un prezzo. Dealz risponde loro a qualsiasi ora, pone le domande giuste (tipo di lavoro, numero di punti, distanza dal quadro, urgenza), calcola il vostro prezzo secondo le vostre tariffe e prepara il loro preventivo.",
        clientQ: "Quanto costa installare una colonnina di ricarica nel mio garage?",
        values: [
          { icon: "🔌", title: "Colonnine di ricarica calcolate", text: "Il cliente indica la distanza dal quadro, Dealz aggiunge il cablaggio secondo le vostre tariffe: un prezzo fisso senza sopralluogo." },
          { icon: "💡", title: "Prezzo per punto", text: "Prese, interruttori, illuminazione: il vostro prezzo unitario moltiplicato automaticamente per il numero di punti." },
          { icon: "🚨", title: "Interventi smistati", text: "Un guasto di sera o nel fine settimana: il supplemento d'urgenza segue le vostre regole." },
          { icon: "📋", title: "Controlli e opzioni venduti", text: "Rapporto di sicurezza, protezione dalle sovratensioni, domotica: proposti in ogni preventivo, fanno salire il vostro importo medio." },
        ],
        step1: "Importate le vostre tariffe: forfait d'intervento, prezzo per punto, quadri elettrici, colonnine, cablaggio, supplementi. Il vostro Excel resta il vostro strumento di lavoro.",
        step2: "Il motore capisce i vostri forfait, i prezzi unitari e le opzioni.",
        excel: { file: "tariffe-elettricita.xlsx", headers: ["Voce", "Condizione", "Prezzo"], rows: [["Colonnina di ricarica 11 kW", "fornitura e posa", "CHF 2'900"], ["Cablaggio", "da 10 a 25 m dal quadro", "CHF 650"], ["Protezione sovratensioni", "quadro esistente", "CHF 380"]] },
        chat: ["«Il mese prossimo riceviamo un'auto elettrica.»", "«A che distanza dal quadro elettrico si trova il posteggio?»", "«Desiderate aggiungere una protezione dalle sovratensioni?»"],
        offer: { company: "Volta Électricité Sàrl", rows: [["Colonnina di ricarica 11 kW", 2900], ["Cablaggio (da 10 a 25 m)", 650], ["Protezione dalle sovratensioni", 380]] },
        roi: "Due colonnine in più all'anno pagano diversi anni di abbonamento.",
      },
      demo: {
        brand: "Volta Électricité",
        eyebrow: "Ginevra e La Côte · Esempio fittizio",
        hero: { h1: "Corrente, luce, ricarica: il vostro prezzo in un minuto.", text: "Interventi, installazioni, quadri elettrici e colonnine di ricarica a Ginevra e su La Côte: ottenete un prezzo fisso in pochi secondi, direttamente su questo sito." },
        stats: [{ num: "4.9★", lbl: "SODDISFAZIONE CLIENTI" }, { num: "450+", lbl: "COLONNINE INSTALLATE" }, { num: "< 1 min", lbl: "PER UN PREVENTIVO" }],
        servicesTitle: "I nostri lavori elettrici",
        servicesSub: "Scegliete un servizio, oppure descrivete semplicemente la vostra esigenza nella scheda «Ottenere un preventivo».",
        services: [
          { icon: "🚨", title: "Interventi", text: "Guasti, salvavita scattati, cortocircuiti.", tag: "da CHF 275" },
          { icon: "🔌", title: "Prese e interruttori", text: "Aggiunta e spostamento di punti.", tag: "da CHF 180/punto" },
          { icon: "💡", title: "Illuminazione", text: "Faretti, lampade, illuminazione esterna.", tag: "da CHF 220/punto" },
          { icon: "🗄️", title: "Quadro elettrico", text: "Sostituzione e messa a norma.", tag: "CHF 2'400" },
          { icon: "🚗", title: "Colonnine di ricarica", text: "Wallbox 11 kW per auto elettriche.", tag: "da CHF 2'900" },
          { icon: "📋", title: "Rapporto di sicurezza", text: "Controllo ufficiale per vendita o locazione.", tag: "CHF 450" },
        ],
        about: {
          title: "Elettricisti concessionari e reattivi",
          text: "Dal 2008 Volta Électricité lavora per privati, amministrazioni e negozi a Ginevra e su La Côte. Nel 2026 abbiamo aggiunto al nostro sito un assistente di preventivi immediato: più veloce per voi, meno burocrazia per noi.",
          bullets: [["Installatore concessionario", "autorizzato secondo le norme svizzere sulla bassa tensione."], ["Intervento rapido", "interventi in giornata."], ["Prezzo trasparente", "il preventivo ricevuto è il prezzo pagato."]],
        },
        contact: { phone: "022 000 01 09", email: "hello@volta-electricite.demo", zone: "Ginevra, La Côte", hours: "Lun–Ven, 7.30–17.30 · urgenze 7 giorni su 7" },
        devisNote: "Rispondete a qualche domanda sulla vostra esigenza: riceverete un vero preventivo, che potrete accettare o rifiutare direttamente qui.",
        inputPlaceholder: "Descrivete la vostra esigenza elettrica…",
        pdfCompany: { name: "Volta Électricité Sàrl", address: "Rue de Lyon 77, 1203 Genève", phone: "022 000 01 09", email: "hello@volta-electricite.demo" },
      },
      quote: {
        greeting: "Buongiorno! Vi faccio qualche domanda rapida sul vostro impianto elettrico, poi vi preparo subito un preventivo fisso.",
        addressPlaceholder: "Indirizzo dell'intervento (via, NPA, località)",
        terms: "Preventivo fisso, valido 30 giorni, fornitura e manodopera incluse. Impianto esistente non conforme scoperto sul posto trattato solo previo accordo.",
        q: {
          work: { text: "Di cosa avete bisogno?", short: "Lavori", opts: { repair: "Un intervento (guasto, salvavita scattato)", outlets: "Aggiungere prese o interruttori", lighting: "Installare l'illuminazione", panel: "Sostituire il quadro elettrico", charger: "Installare una colonnina di ricarica" } },
          points: { text: "Quanti punti vanno installati?", short: "Punti", opts: { p1: "1 o 2", p2: "Da 3 a 6", p3: "7 e oltre" } },
          distance: { text: "A che distanza dal quadro elettrico si trova il posteggio?", short: "Distanza", opts: { near: "Meno di 10 m", mid: "Da 10 a 25 m", far: "Oltre 25 m" } },
          urgency: { text: "Quando vi serve il nostro intervento?", short: "Urgenza", opts: { normal: "Entro la settimana", fast: "Entro 48 ore", emergency: "Urgenza (sera o fine settimana)" } },
          extras: { text: "Desiderate delle opzioni?", short: "Opzioni", none: "Nessuna opzione", opts: { ras: "Rapporto di sicurezza elettrica", surge: "Protezione dalle sovratensioni", smart: "Domotica di base (luci e tende connesse)" } },
          date: { text: "Per quale data desiderate l'intervento?", short: "Data desiderata" },
        },
        items: {
          callout: "Trasferta",
          repair: "Diagnosi e riparazione (1 ora)",
          urgency_fast: "Supplemento intervento entro 48 ore",
          urgency_emergency: "Supplemento urgenza (sera o fine settimana)",
          work_outlets: "Prese e interruttori ({n} punti)",
          work_lighting: "Punti luce ({n} punti)",
          panel: "Sostituzione del quadro elettrico",
          charger: "Colonnina di ricarica 11 kW, fornitura e posa",
          distance_mid: "Cablaggio della colonnina (da 10 a 25 m)",
          distance_far: "Cablaggio della colonnina (oltre 25 m)",
          ras: "Rapporto di sicurezza elettrica",
          surge: "Protezione dalle sovratensioni",
          smart: "Domotica di base",
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
