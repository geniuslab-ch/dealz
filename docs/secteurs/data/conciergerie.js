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
    en: {
      label: "Concierge and property maintenance",
      forWho: "concierge and property maintenance companies",
      pitch: "Price a monthly maintenance contract by building and services.",
      emailNoun: "your maintenance contract",
      landing: {
        h1: ["YOU MAINTAIN.", "DEALZ PRICES."],
        question: "How many property managers and owners do you lose because your offer takes a week?",
        text: "A property manager is looking for a provider for a building and asks for three offers on the same day. Dealz answers right away, asks the right questions (property type, services, frequency, contract length), calculates your price from your rates and prepares the monthly quote.",
        clientQ: "How much per month to maintain a 12-unit building?",
        values: [
          { icon: "🏢", title: "A monthly quote per property type", text: "Flat, villa, building, offices: your size coefficients apply automatically." },
          { icon: "🧰", title: "Services à la carte", text: "Cleaning, waste, keys, minor maintenance, outdoor areas, check-in: each service is added to the contract in one click." },
          { icon: "📝", title: "Longer contracts, easier to sign", text: "Your commitment discounts (1 year, 2 years) are offered from the start." },
          { icon: "⏰", title: "You answer first", text: "In a market where the property manager compares, the first priced offer has a decisive edge." },
        ],
        step1: "Import your rates: monthly packages per service, coefficients per property type, frequencies, commitment discounts. Your Excel stays your working tool.",
        step2: "The engine understands your property types, services, visit frequencies and contract lengths.",
        excel: { file: "concierge-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Common areas cleaning", "Building 6–20 units · 1 visit/wk", "CHF 630/month"], ["Waste and rounds", "Same building", "CHF 405/month"], ["Minor maintenance", "Package", "CHF 540/month"]] },
        chat: ["“We're looking for a provider to maintain our 12-unit building.”", "“Which services would you like: cleaning, waste, maintenance, outdoor areas?”", "“How often, and for what contract length?”"],
        offer: { company: "ConciergeCare Immobilier Sàrl", rows: [["Common areas cleaning (per month)", 630], ["Waste management and rounds (per month)", 405], ["Minor maintenance (per month)", 540]] },
        roi: "A single extra building contract can already pay for your subscription for years.",
      },
      demo: {
        brand: "ConciergeCare",
        eyebrow: "Lausanne & Riviera · Fictional example",
        hero: { h1: "Your building spotless, without giving it a thought.", text: "Concierge services, routine cleaning, minor maintenance and access management for owners, property managers and co-ownerships — get a firm monthly price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "PROPERTY MANAGER SATISFACTION" }, { num: "140+", lbl: "BUILDINGS MANAGED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we take care of",
        servicesSub: "Pick a service, or simply describe your building in the “Get a quote” tab.",
        services: [
          { icon: "🧹", title: "Common areas cleaning", text: "Stairwells, lobbies, lifts.", tag: "from CHF 140/month" },
          { icon: "🗑️", title: "Waste and rounds", text: "Bin collection, premises checks.", tag: "from CHF 90/month" },
          { icon: "🔑", title: "Key management", text: "Handover, duplicates and access tracking.", tag: "CHF 60/month" },
          { icon: "🛠️", title: "Minor maintenance", text: "Light bulbs, locks, small repairs.", tag: "from CHF 120/month" },
          { icon: "🌳", title: "Outdoor maintenance", text: "Green spaces, paths, snow and ice.", tag: "from CHF 110/month" },
          { icon: "🧳", title: "Check-in / check-out", text: "Key handover for short-term rentals.", tag: "from CHF 35/stay" },
        ],
        about: {
          title: "A local team, a single point of contact",
          text: "ConciergeCare Immobilier has been supporting owners, property managers and co-ownerships between Lausanne and the Riviera since 2014. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Single point of contact", "an area manager knows your building."], ["Visit reports", "every job is logged and shared."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 12", email: "hello@conciergecare.demo", zone: "Lausanne, Riviera, Lavaux", hours: "Mon–Fri, 7:30am–5:30pm" },
        devisNote: "Answer a few questions about your property — you'll get a real monthly quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your building or property…",
        pdfCompany: { name: "ConciergeCare Immobilier Sàrl", address: "Avenue de la Gare 30, 1003 Lausanne", phone: "021 000 00 12", email: "hello@conciergecare.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your property, then put together a firm monthly quote right away.",
        addressPlaceholder: "Property address (street, postcode, town)",
        terms: "Firm monthly price, valid for 30 days, excluding exceptional services. Swiss VAT included where applicable.",
        q: {
          property: { text: "What type of property is it?", short: "Property", opts: { flat: "Flat", villa: "Villa", small: "Building with 6 to 20 units", large: "Building with more than 20 units", office: "Offices / shop" } },
          services: { text: "Which services would you like?", short: "Services", none: "I don't know yet", opts: { clean: "Routine cleaning (common areas)", waste: "Waste management and rounds", keys: "Key and access management", repair: "Minor maintenance", garden: "Outdoor / green space maintenance", checkin: "Check-in / check-out (short-term)" } },
          freq: { text: "How often for the cleaning?", short: "Frequency", opts: { w1: "1 visit per week", w2: "2 visits per week", w3: "3 or more visits per week", m1: "1 visit per month" } },
          contract: { text: "What contract length do you have in mind?", short: "Contract", opts: { month: "No commitment (month to month)", year: "Annual contract", two: "2-year contract" } },
          date: { text: "From what date would you like to start?", short: "Start" },
        },
        items: {
          clean: "Routine cleaning of common areas (per month)",
          waste: "Waste management and rounds (per month)",
          keys: "Key and access management (per month)",
          repair: "Minor maintenance (per month)",
          garden: "Outdoor / green space maintenance (per month)",
          checkin: "Short-term rental check-in / check-out (per month)",
          visit: "Assessment visit and tailored offer",
          discount: "Commitment discount ({pct}%)",
        },
      },
    },
    de: {
      label: "Hauswartung und Liegenschaftsunterhalt",
      forWho: "Hauswartungs- und Liegenschaftsunterhaltsfirmen",
      pitch: "Berechnen Sie einen monatlichen Unterhaltsvertrag nach Liegenschaft und Leistungen.",
      emailNoun: "Ihren Unterhaltsvertrag",
      landing: {
        h1: ["SIE PFLEGEN.", "DEALZ RECHNET."],
        question: "Wie viele Verwaltungen und Eigentümer verlieren Sie, weil Ihre Offerte eine Woche dauert?",
        text: "Eine Verwaltung sucht einen Dienstleister für eine Liegenschaft und verlangt am selben Tag drei Offerten. Dealz antwortet sofort, stellt die richtigen Fragen (Objektart, Leistungen, Häufigkeit, Vertragsdauer), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Monatsofferte.",
        clientQ: "Was kostet der Unterhalt eines Mehrfamilienhauses mit 12 Wohnungen pro Monat?",
        values: [
          { icon: "🏢", title: "Eine Monatsofferte pro Objektart", text: "Wohnung, Villa, Mehrfamilienhaus, Büros: Ihre Grössenfaktoren werden automatisch angewendet." },
          { icon: "🧰", title: "Leistungen à la carte", text: "Reinigung, Abfall, Schlüssel, Kleinunterhalt, Aussenbereich, Check-in: Jede Leistung wird mit einem Klick zum Vertrag hinzugefügt." },
          { icon: "📝", title: "Längere Verträge, leichter unterschrieben", text: "Ihre Rabatte für Vertragsbindung (1 Jahr, 2 Jahre) werden von Anfang an angeboten." },
          { icon: "⏰", title: "Sie antworten zuerst", text: "In einem Markt, in dem die Verwaltung vergleicht, hat die erste bezifferte Offerte einen entscheidenden Vorteil." },
        ],
        step1: "Importieren Sie Ihre Tarife: Monatspauschalen pro Leistung, Faktoren pro Objektart, Häufigkeiten, Rabatte für Vertragsbindung. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Objektarten, Leistungen, Einsatzhäufigkeiten und Vertragsdauern.",
        excel: { file: "tarife-hauswartung.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Reinigung Allgemeinflächen", "MFH 6–20 Whg. · 1 Einsatz/Wo.", "CHF 630/Monat"], ["Abfall und Kontrollgänge", "Gleiche Liegenschaft", "CHF 405/Monat"], ["Kleinunterhalt", "Pauschale", "CHF 540/Monat"]] },
        chat: ["«Wir suchen einen Dienstleister für den Unterhalt unseres Hauses mit 12 Wohnungen.»", "«Welche Leistungen wünschen Sie: Reinigung, Abfall, Unterhalt, Aussenbereich?»", "«In welcher Häufigkeit und für welche Vertragsdauer?»"],
        offer: { company: "ConciergeCare Immobilier Sàrl", rows: [["Reinigung der Allgemeinflächen (pro Monat)", 630], ["Abfallbewirtschaftung und Kontrollgänge (pro Monat)", 405], ["Kleinunterhalt (pro Monat)", 540]] },
        roi: "Ein einziger zusätzlicher Liegenschaftsvertrag kann Ihr Abo bereits für Jahre bezahlen.",
      },
      demo: {
        brand: "ConciergeCare",
        eyebrow: "Lausanne & Riviera · Fiktives Beispiel",
        hero: { h1: "Ihre Liegenschaft tadellos, ohne dass Sie daran denken müssen.", text: "Hauswartung, laufende Reinigung, Kleinunterhalt und Zutrittsverwaltung für Eigentümer, Verwaltungen und Stockwerkeigentümer — erhalten Sie in Sekunden einen verbindlichen Monatspreis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "ZUFRIEDENHEIT VERWALTUNGEN" }, { num: "140+", lbl: "BETREUTE LIEGENSCHAFTEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir übernehmen",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihre Liegenschaft einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🧹", title: "Reinigung der Allgemeinflächen", text: "Treppenhäuser, Eingangshallen, Lifte.", tag: "ab CHF 140/Monat" },
          { icon: "🗑️", title: "Abfall und Kontrollgänge", text: "Container bereitstellen, Räume kontrollieren.", tag: "ab CHF 90/Monat" },
          { icon: "🔑", title: "Schlüsselverwaltung", text: "Übergabe, Duplikate und Zutrittsverfolgung.", tag: "CHF 60/Monat" },
          { icon: "🛠️", title: "Kleinunterhalt", text: "Glühbirnen, Schlösser, kleine Reparaturen.", tag: "ab CHF 120/Monat" },
          { icon: "🌳", title: "Aussenunterhalt", text: "Grünflächen, Wege, Schnee und Glatteis.", tag: "ab CHF 110/Monat" },
          { icon: "🧳", title: "Check-in / Check-out", text: "Schlüsselübergabe für Kurzzeitvermietung.", tag: "ab CHF 35/Aufenthalt" },
        ],
        about: {
          title: "Ein Team vor Ort, ein einziger Ansprechpartner",
          text: "ConciergeCare Immobilier begleitet seit 2014 Eigentümer, Verwaltungen und Stockwerkeigentümer zwischen Lausanne und der Riviera. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Ein Ansprechpartner", "ein Gebietsverantwortlicher kennt Ihre Liegenschaft."], ["Einsatzrapport", "jeder Einsatz wird dokumentiert und übermittelt."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 00 12", email: "hello@conciergecare.demo", zone: "Lausanne, Riviera, Lavaux", hours: "Mo–Fr, 7.30–17.30 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Objekt — Sie erhalten eine echte Monatsofferte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Liegenschaft oder Ihr Objekt…",
        pdfCompany: { name: "ConciergeCare Immobilier Sàrl", address: "Avenue de la Gare 30, 1003 Lausanne", phone: "021 000 00 12", email: "hello@conciergecare.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Objekt und erstelle Ihnen gleich danach eine verbindliche Monatsofferte.",
        addressPlaceholder: "Adresse des Objekts (Strasse, PLZ, Ort)",
        terms: "Verbindlicher Monatspreis, 30 Tage gültig, ohne ausserordentliche Leistungen. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          property: { text: "Um welche Art von Objekt handelt es sich?", short: "Objekt", opts: { flat: "Wohnung", villa: "Villa", small: "Mehrfamilienhaus mit 6 bis 20 Wohnungen", large: "Mehrfamilienhaus mit mehr als 20 Wohnungen", office: "Büros / Geschäft" } },
          services: { text: "Welche Leistungen wünschen Sie?", short: "Leistungen", none: "Ich weiss es noch nicht", opts: { clean: "Laufende Reinigung (Allgemeinflächen)", waste: "Abfallbewirtschaftung und Kontrollgänge", keys: "Schlüssel- und Zutrittsverwaltung", repair: "Kleinunterhalt", garden: "Aussen- / Grünflächenunterhalt", checkin: "Check-in / Check-out (Kurzzeit)" } },
          freq: { text: "In welcher Häufigkeit für die Reinigung?", short: "Häufigkeit", opts: { w1: "1 Einsatz pro Woche", w2: "2 Einsätze pro Woche", w3: "3 oder mehr Einsätze pro Woche", m1: "1 Einsatz pro Monat" } },
          contract: { text: "Welche Vertragsdauer stellen Sie sich vor?", short: "Vertrag", opts: { month: "Ohne Bindung (monatlich)", year: "Jahresvertrag", two: "2-Jahres-Vertrag" } },
          date: { text: "Ab welchem Datum möchten Sie starten?", short: "Start" },
        },
        items: {
          clean: "Laufende Reinigung der Allgemeinflächen (pro Monat)",
          waste: "Abfallbewirtschaftung und Kontrollgänge (pro Monat)",
          keys: "Schlüssel- und Zutrittsverwaltung (pro Monat)",
          repair: "Kleinunterhalt (pro Monat)",
          garden: "Aussen- / Grünflächenunterhalt (pro Monat)",
          checkin: "Check-in / Check-out Kurzzeitvermietung (pro Monat)",
          visit: "Besichtigung und massgeschneiderte Offerte",
          discount: "Rabatt für Vertragsbindung ({pct} %)",
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
