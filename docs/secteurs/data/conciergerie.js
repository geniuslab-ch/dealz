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
      label: "Concierge Services & Property Maintenance",
      forWho: "concierge and property maintenance companies",
      pitch: "Price a monthly maintenance contract based on the property and services.",
      emailNoun: "your maintenance contract",
      landing: {
        h1: ["YOU MAINTAIN.", "DEALZ PRICES IT."],
        question: "How many property managers and owners are you losing because your quote takes a week?",
        text: "A property management company is looking for a provider for a building and requests three quotes the same day. Dealz replies right away, asks the right questions (property type, services, frequency, contract length), calculates your price from your own rates and prepares the monthly quote.",
        clientQ: "How much per month for maintaining a 12-unit building?",
        values: [
          { icon: "🏢", title: "A monthly quote per property type", text: "Flat, villa, building, offices: your size coefficients apply automatically." },
          { icon: "🧰", title: "À la carte services", text: "Cleaning, waste, keys, minor maintenance, outdoor areas, check-in: every service is added to the contract in one click." },
          { icon: "📝", title: "Longer contracts, easier to sign", text: "Your commitment discounts (1 year, 2 years) are offered from the start." },
          { icon: "⏰", title: "You respond first", text: "In a market where property managers compare, the first priced offer has a decisive advantage." },
        ],
        step1: "Import your rates: monthly packages per service, coefficients per property type, frequencies, commitment discounts. Your Excel sheet stays your working tool.",
        step2: "The engine understands your property types, your services, your visit frequencies and your contract lengths.",
        excel: { file: "maintenance-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Common area cleaning", "Building 6–20 units · 1 visit/week", "CHF 630/month"], ["Waste management and rounds", "Same building", "CHF 405/month"], ["Minor maintenance", "Package", "CHF 540/month"]] },
        chat: ["\"We're looking for a provider to maintain our 12-unit building.\"", "\"Which services would you like: cleaning, waste, maintenance, outdoor areas?\"", "\"How often, and for what contract length?\""],
        offer: { company: "ConciergeCare Immobilier Sàrl", rows: [["Common area cleaning (per month)", 630], ["Waste management and rounds (per month)", 405], ["Minor maintenance (per month)", 540]] },
        roi: "Just one extra building contract can already cover your subscription for years.",
      },
      demo: {
        brand: "ConciergeCare",
        eyebrow: "Lausanne & Riviera · Fictional example",
        hero: { h1: "Your building spotless, without you thinking about it.", text: "Concierge services, routine maintenance, minor repairs and access management for owners, property managers and co-ownerships — get a firm monthly price in seconds, right on this site." },
        stats: [{ num: "4.8★", lbl: "PROPERTY MANAGER SATISFACTION" }, { num: "140+", lbl: "BUILDINGS MANAGED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we take care of",
        servicesSub: "Choose a service, or simply describe your building in the \"Get a quote\" tab.",
        services: [
          { icon: "🧹", title: "Common area cleaning", text: "Stairwells, lobbies, lifts.", tag: "from CHF 140/month" },
          { icon: "🗑️", title: "Waste management and rounds", text: "Bin collection, premises checks.", tag: "from CHF 90/month" },
          { icon: "🔑", title: "Key management", text: "Handover, duplication and access tracking.", tag: "CHF 60/month" },
          { icon: "🛠️", title: "Minor maintenance", text: "Light bulbs, locks, small repairs.", tag: "from CHF 120/month" },
          { icon: "🌳", title: "Outdoor maintenance", text: "Green spaces, pathways, snow and ice.", tag: "from CHF 110/month" },
          { icon: "🧳", title: "Check-in / check-out", text: "Key handover for short-term rentals.", tag: "from CHF 35/stay" },
        ],
        about: {
          title: "A local team, a single point of contact",
          text: "ConciergeCare Immobilier has supported owners, property managers and co-ownerships between Lausanne and the Riviera since 2014. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Single point of contact", "an area manager knows your building."], ["Visit report", "every intervention is logged and shared."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 12", email: "hello@conciergecare.demo", zone: "Lausanne, Riviera, Lavaux", hours: "Mon–Fri, 7:30am–5:30pm" },
        devisNote: "Answer a few questions about your property — you'll receive a real monthly quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe your building or property…",
        pdfCompany: { name: "ConciergeCare Immobilier Sàrl", address: "Avenue de la Gare 30, 1003 Lausanne", phone: "021 000 00 12", email: "hello@conciergecare.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your property, then give you a firm monthly quote right after.",
        addressPlaceholder: "Property address (street, postcode, town)",
        terms: "Firm monthly price, valid 30 days, excluding exceptional services. Swiss VAT included where applicable.",
        q: {
          property: { text: "What type of property is it?", short: "Property", opts: { flat: "Flat", villa: "Villa", small: "Building of 6 to 20 units", large: "Building of more than 20 units", office: "Offices / retail" } },
          services: { text: "Which services would you like?", short: "Services", none: "I don't know yet", opts: { clean: "Routine cleaning (common areas)", waste: "Waste management and rounds", keys: "Key and access management", repair: "Minor maintenance", garden: "Outdoor maintenance / green spaces", checkin: "Check-in / check-out (short-term)" } },
          freq: { text: "How often should maintenance take place?", short: "Frequency", opts: { w1: "1 visit per week", w2: "2 visits per week", w3: "3 or more visits per week", m1: "1 visit per month" } },
          contract: { text: "What contract length are you considering?", short: "Contract", opts: { month: "No commitment (month to month)", year: "Annual contract", two: "2-year contract" } },
          date: { text: "From what date would you like to start?", short: "Start date" },
        },
        items: {
          clean: "Routine cleaning of common areas (per month)",
          waste: "Waste management and rounds (per month)",
          keys: "Key and access management (per month)",
          repair: "Minor maintenance (per month)",
          garden: "Outdoor maintenance / green spaces (per month)",
          checkin: "Check-in / check-out short-term rental (per month)",
          visit: "Diagnostic visit and tailored offer",
          discount: "Commitment discount ({pct}%)",
        },
      },
    },

    de: {
      label: "Hauswartung und Immobilienunterhalt",
      forWho: "Hauswartungs- und Immobilienunterhaltsunternehmen",
      pitch: "Berechnen Sie einen monatlichen Unterhaltsvertrag nach Liegenschaft und Leistungen.",
      emailNoun: "Ihren Unterhaltsvertrag",
      landing: {
        h1: ["SIE UNTERHALTEN.", "DEALZ RECHNET."],
        question: "Wie viele Verwaltungen und Eigentümer verlieren Sie, weil Ihre Offerte eine Woche dauert?",
        text: "Eine Verwaltung sucht einen Anbieter für eine Liegenschaft und fragt am selben Tag drei Offerten an. Dealz antwortet sofort, stellt die richtigen Fragen (Objekttyp, Leistungen, Häufigkeit, Vertragsdauer), berechnet Ihren Preis nach Ihren Tarifen und erstellt die monatliche Offerte.",
        clientQ: "Wie viel kostet der Unterhalt eines Mehrfamilienhauses mit 12 Einheiten pro Monat?",
        values: [
          { icon: "🏢", title: "Eine monatliche Offerte pro Objekttyp", text: "Wohnung, Villa, Mehrfamilienhaus, Büros: Ihre Grössenkoeffizienten werden automatisch angewendet." },
          { icon: "🧰", title: "Leistungen à la carte", text: "Unterhalt, Abfall, Schlüssel, kleine Reparaturen, Aussenbereiche, Check-in: jede Leistung wird mit einem Klick zum Vertrag hinzugefügt." },
          { icon: "📝", title: "Längere Verträge, leichter zu unterschreiben", text: "Ihre Vertragsrabatte (1 Jahr, 2 Jahre) werden von Anfang an angeboten." },
          { icon: "⏰", title: "Sie antworten als Erste", text: "In einem Markt, in dem die Verwaltung vergleicht, hat das erste berechnete Angebot einen entscheidenden Vorteil." },
        ],
        step1: "Importieren Sie Ihre Tarife: monatliche Pauschalen pro Leistung, Koeffizienten pro Objekttyp, Häufigkeiten, Vertragsrabatte. Ihr Excel bleibt Ihr Arbeitsinstrument.",
        step2: "Die Engine versteht Ihre Objekttypen, Ihre Leistungen, Ihre Durchgangshäufigkeiten und Ihre Vertragsdauern.",
        excel: { file: "tarife-hauswartung.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Unterhalt Gemeinschaftsräume", "Mehrfamilienhaus 6–20 Einheiten · 1x/Woche", "CHF 630/Monat"], ["Abfallentsorgung und Rundgänge", "Gleiches Gebäude", "CHF 405/Monat"], ["Kleine Reparaturen", "Pauschale", "CHF 540/Monat"]] },
        chat: ["«Wir suchen einen Anbieter für den Unterhalt unseres Mehrfamilienhauses mit 12 Einheiten.»", "«Welche Leistungen wünschen Sie: Unterhalt, Abfall, Reparaturen, Aussenbereiche?»", "«Wie häufig, und für welche Vertragsdauer?»"],
        offer: { company: "ConciergeCare Immobilier Sàrl", rows: [["Unterhalt Gemeinschaftsräume (pro Monat)", 630], ["Abfallentsorgung und Rundgänge (pro Monat)", 405], ["Kleine Reparaturen (pro Monat)", 540]] },
        roi: "Schon ein einziger zusätzlicher Gebäudevertrag kann Ihr Abonnement über Jahre decken.",
      },
      demo: {
        brand: "ConciergeCare",
        eyebrow: "Lausanne & Riviera · Fiktives Beispiel",
        hero: { h1: "Ihre Liegenschaft makellos, ohne dass Sie daran denken müssen.", text: "Hauswartung, laufender Unterhalt, kleine Reparaturen und Zugangsverwaltung für Eigentümer, Verwaltungen und Stockwerkeigentümergemeinschaften — erhalten Sie in Sekunden einen festen Monatspreis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "ZUFRIEDENHEIT DER VERWALTUNGEN" }, { num: "140+", lbl: "BETREUTE LIEGENSCHAFTEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir übernehmen",
        servicesSub: "Wählen Sie eine Leistung oder beschreiben Sie Ihre Liegenschaft einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🧹", title: "Unterhalt der Gemeinschaftsräume", text: "Treppenhäuser, Eingangshallen, Lifte.", tag: "ab CHF 140/Monat" },
          { icon: "🗑️", title: "Abfallentsorgung und Rundgänge", text: "Entleerung der Container, Kontrolle der Räume.", tag: "ab CHF 90/Monat" },
          { icon: "🔑", title: "Schlüsselverwaltung", text: "Übergabe, Duplikate und Zugangskontrolle.", tag: "CHF 60/Monat" },
          { icon: "🛠️", title: "Kleine Reparaturen", text: "Glühbirnen, Schlösser, kleine Instandsetzungen.", tag: "ab CHF 120/Monat" },
          { icon: "🌳", title: "Aussenbereichspflege", text: "Grünflächen, Wege, Schnee und Glatteis.", tag: "ab CHF 110/Monat" },
          { icon: "🧳", title: "Check-in / Check-out", text: "Schlüsselübergabe für Kurzzeitvermietungen.", tag: "ab CHF 35/Aufenthalt" },
        ],
        about: {
          title: "Ein lokales Team, ein einziger Ansprechpartner",
          text: "ConciergeCare Immobilier begleitet Eigentümer, Verwaltungen und Stockwerkeigentümergemeinschaften zwischen Lausanne und der Riviera seit 2014. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Einziger Ansprechpartner", "ein Gebietsverantwortlicher kennt Ihre Liegenschaft."], ["Einsatzbericht", "jeder Einsatz wird dokumentiert und übermittelt."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "021 000 00 12", email: "hello@conciergecare.demo", zone: "Waadt, Riviera, Lavaux", hours: "Mo–Fr, 7.30–17.30 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrer Liegenschaft — Sie erhalten eine echte monatliche Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihre Liegenschaft…",
        pdfCompany: { name: "ConciergeCare Immobilier Sàrl", address: "Avenue de la Gare 30, 1003 Lausanne", phone: "021 000 00 12", email: "hello@conciergecare.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Liegenschaft und erstelle Ihnen direkt danach eine feste monatliche Offerte.",
        addressPlaceholder: "Adresse der Liegenschaft (Strasse, PLZ, Ort)",
        terms: "Fester Monatspreis, 30 Tage gültig, ausserordentliche Leistungen ausgenommen. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          property: { text: "Um welchen Objekttyp handelt es sich?", short: "Objekt", opts: { flat: "Wohnung", villa: "Villa", small: "Mehrfamilienhaus mit 6 bis 20 Einheiten", large: "Mehrfamilienhaus mit mehr als 20 Einheiten", office: "Büros / Gewerbe" } },
          services: { text: "Welche Leistungen wünschen Sie?", short: "Leistungen", none: "Ich weiss es noch nicht", opts: { clean: "Laufender Unterhalt (Gemeinschaftsräume)", waste: "Abfallentsorgung und Rundgänge", keys: "Schlüssel- und Zugangsverwaltung", repair: "Kleine Reparaturen", garden: "Aussenbereichspflege / Grünflächen", checkin: "Check-in / Check-out (Kurzzeit)" } },
          freq: { text: "Wie oft soll der Unterhalt erfolgen?", short: "Häufigkeit", opts: { w1: "1x pro Woche", w2: "2x pro Woche", w3: "3x oder öfter pro Woche", m1: "1x pro Monat" } },
          contract: { text: "Welche Vertragsdauer stellen Sie sich vor?", short: "Vertrag", opts: { month: "Ohne Verpflichtung (monatlich kündbar)", year: "Jahresvertrag", two: "2-Jahres-Vertrag" } },
          date: { text: "Ab welchem Datum möchten Sie starten?", short: "Start" },
        },
        items: {
          clean: "Laufender Unterhalt der Gemeinschaftsräume (pro Monat)",
          waste: "Abfallentsorgung und Rundgänge (pro Monat)",
          keys: "Schlüssel- und Zugangsverwaltung (pro Monat)",
          repair: "Kleine Reparaturen (pro Monat)",
          garden: "Aussenbereichspflege / Grünflächen (pro Monat)",
          checkin: "Check-in / Check-out Kurzzeitvermietung (pro Monat)",
          visit: "Besichtigung und individuelles Angebot",
          discount: "Vertragsrabatt ({pct} %)",
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
