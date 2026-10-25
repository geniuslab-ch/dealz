/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "desinfection",
    icon: "🐜",
    needsAddress: true,
    colors: { main: "#c92a2a", dark: "#a51111", light: "#ffe3e3", accent: "#1c7ed6", accentDark: "#1864ab", bg: "#fffafa" },

    quote: {
      minimum: 150,
      questions: [
        { id: "problem", type: "single", options: [{ id: "bedbugs", base: 420 }, { id: "roaches", base: 280 }, { id: "rodents", base: 240 }, { id: "wasps", base: 150 }, { id: "ants", base: 180 }, { id: "disinfect", base: 0 }] },
        { id: "premises", type: "single", options: [{ id: "flat", k: 1 }, { id: "house", k: 1.2 }, { id: "shop", k: 1.5 }, { id: "building", k: 1.9 }] },
        {
          id: "surface", type: "single",
          when: function (a) { return a.problem.id !== "wasps"; },
          options: [{ id: "sm", m2: 45 }, { id: "md", m2: 90 }, { id: "lg", m2: 180 }, { id: "xl", m2: 350 }],
        },
        {
          id: "severity", type: "single",
          when: function (a) { return ["bedbugs", "roaches", "rodents", "ants"].indexOf(a.problem.id) >= 0; },
          options: [{ id: "early", k: 1 }, { id: "set", k: 1.35 }, { id: "severe", k: 1.8 }],
        },
        { id: "urgency", type: "single", options: [{ id: "std", k: 0 }, { id: "fast", k: 0.2 }, { id: "urgent", k: 0.45 }] },
        { id: "followup", type: "multi", options: [{ id: "second" }, { id: "report" }, { id: "seal" }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var p = a.problem, pk = a.premises.k, main;
        if (p.id === "wasps") {
          main = H.round5(p.base * pk);
          items.push({ label: L("treat_wasps"), amount: main });
        } else if (p.id === "disinfect") {
          main = H.round5(Math.max(160, a.surface.m2 * 4.2 * pk));
          items.push({ label: L("treat_disinfect", { m2: a.surface.m2 }), amount: main });
        } else {
          main = H.round5(p.base * pk * (0.7 + a.surface.m2 / 150) * a.severity.k);
          items.push({ label: L("treat_" + p.id, { m2: a.surface.m2 }), amount: main });
        }
        if (a.urgency.k) items.push({ label: L(a.urgency.id === "urgent" ? "urgent" : "fast"), amount: H.round5(main * a.urgency.k) });
        (a.followup || []).forEach(function (f) {
          if (f.id === "second") items.push({ label: L("second"), amount: H.round5(main * 0.35) });
          if (f.id === "report") items.push({ label: L("report"), amount: 90 });
          if (f.id === "seal") items.push({ label: L("seal"), amount: 240 });
        });
        return items;
      },
    },

    fr: {
      label: "Désinfection et lutte antiparasitaire",
      forWho: "entreprises de désinfection et de lutte antiparasitaire",
      pitch: "Chiffrez traitement, urgence et suivi selon le problème et les locaux.",
      emailNoun: "votre intervention antiparasitaire",
      landing: {
        h1: ["VOUS TRAITEZ.", "DEALZ CHIFFRE."],
        question: "Combien d'appels urgents perdez-vous parce que personne ne décroche à 21 h ?",
        text: "Quand on découvre des punaises de lit ou des cafards, on veut une réponse tout de suite — pas un rappel dans trois jours. Dealz répond à toute heure, pose les bonnes questions (nuisible, locaux, ampleur, urgence), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour traiter des punaises de lit dans une maison de 90 m² ?",
        values: [
          { icon: "🆘", title: "Une réponse le soir et le week-end", text: "Les demandes urgentes arrivent quand le problème apparaît — et sont qualifiées avant votre premier appel." },
          { icon: "🪳", title: "Chaque nuisible, ses règles", text: "Punaises, cafards, rongeurs, guêpes, fourmis, désinfection : un prix de base et des questions adaptées à chaque cas." },
          { icon: "⏱️", title: "Urgence 48 h ou 24 h chiffrée", text: "Vos majorations d'urgence s'appliquent automatiquement, sans négociation au téléphone." },
          { icon: "📄", title: "Suivi et rapports en option", text: "Second traitement, rapport pour la régie ou l'assurance, colmatage : chaque option est proposée d'emblée." },
        ],
        step1: "Importez vos tarifs : traitement par nuisible, coefficients locaux et surface, majorations de gravité et d'urgence, suivi.",
        step2: "Le moteur comprend vos types de nuisibles, vos locaux, vos niveaux d'infestation et vos délais d'intervention.",
        excel: { file: "tarifs-antiparasitaire.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Punaises de lit", "Maison 90 m² · installée", "CHF 885"], ["Intervention sous 48 h", "+20 %", "CHF 175"], ["Rapport pour la régie", "Forfait", "CHF 90"]] },
        chat: ["« J'ai trouvé des punaises de lit dans ma chambre, c'est urgent. »", "« Depuis combien de temps, et quelle est la surface du logement ? »", "« Souhaitez-vous une intervention sous 48 h et un second passage de contrôle ? »"],
        offer: { company: "SanitSafe Antiparasitaires SA", rows: [["Traitement punaises de lit (90 m²)", 885], ["Intervention sous 48 h", 175], ["Rapport pour la régie", 90]] },
        roi: "Une seule intervention supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "SanitSafe",
        eyebrow: "Neuchâtel & Arc jurassien · Exemple fictif",
        hero: { h1: "Les nuisibles dehors, la tranquillité dedans.", text: "Punaises de lit, cafards, rongeurs, guêpes et désinfection pour particuliers et commerces — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "2 400+", lbl: "INTERVENTIONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous traitons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre problème dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🛏️", title: "Punaises de lit", text: "Traitement ciblé, garantie de résultat.", tag: "dès CHF 420" },
          { icon: "🪳", title: "Cafards et blattes", text: "Gel, pièges et traitement des foyers.", tag: "dès CHF 280" },
          { icon: "🐀", title: "Rongeurs", text: "Dératisation et colmatage des accès.", tag: "dès CHF 240" },
          { icon: "🐝", title: "Guêpes et frelons", text: "Destruction sécurisée des nids.", tag: "dès CHF 150" },
          { icon: "🐜", title: "Fourmis", text: "Traitement des foyers intérieurs et extérieurs.", tag: "dès CHF 180" },
          { icon: "🧴", title: "Désinfection", text: "Virus, bactéries, moisissures.", tag: "dès CHF 4.20/m²" },
        ],
        about: {
          title: "Des techniciens certifiés, une intervention discrète",
          text: "SanitSafe Antiparasitaires intervient chez les particuliers, régies, restaurants et hôtels de l'Arc jurassien depuis 2008. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Techniciens certifiés", "formés aux produits biocides et à la sécurité."], ["Véhicules neutres", "aucune mention visible, intervention discrète."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "032 000 00 60", email: "hello@sanitsafe.demo", zone: "Neuchâtel, Jura, Berne francophone", hours: "Lun–Dim, 7h–21h" },
        devisNote: "Répondez à quelques questions sur votre problème — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre problème…",
        pdfCompany: { name: "SanitSafe Antiparasitaires SA", address: "Rue du Seyon 14, 2000 Neuchâtel", phone: "032 000 00 60", email: "hello@sanitsafe.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre situation, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse à traiter (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Garantie de résultat selon conditions du traitement choisi. TVA suisse incluse le cas échéant.",
        q: {
          problem: { text: "Quel est le problème ?", short: "Problème", opts: { bedbugs: "Punaises de lit", roaches: "Cafards / blattes", rodents: "Rongeurs (souris, rats)", wasps: "Nid de guêpes ou de frelons", ants: "Fourmis", disinfect: "Désinfection (virus, bactéries, moisissures)" } },
          premises: { text: "De quels locaux s'agit-il ?", short: "Locaux", opts: { flat: "Appartement", house: "Maison", shop: "Commerce / restaurant", building: "Immeuble / parties communes" } },
          surface: { text: "Quelle est la surface à traiter ?", short: "Surface", opts: { sm: "Moins de 60 m²", md: "60 à 120 m²", lg: "120 à 250 m²", xl: "Plus de 250 m²" } },
          severity: { text: "Depuis combien de temps le problème est-il présent ?", short: "Ampleur", opts: { early: "Début d'infestation", set: "Installé depuis plusieurs semaines", severe: "Infestation sévère" } },
          urgency: { text: "Quel délai d'intervention souhaitez-vous ?", short: "Délai", opts: { std: "Sous 5 jours", fast: "Sous 48 h", urgent: "Urgence sous 24 h" } },
          followup: { text: "Souhaitez-vous du suivi en option ?", short: "Suivi", none: "Aucun suivi", opts: { second: "Second traitement de contrôle (garanti 30 jours)", report: "Rapport écrit pour la régie / l'assurance", seal: "Colmatage des accès (rongeurs)" } },
          date: { text: "À partir de quelle date l'intervention est-elle possible ?", short: "Date souhaitée" },
        },
        items: {
          treat_bedbugs: "Traitement punaises de lit ({m2} m²)",
          treat_roaches: "Traitement cafards / blattes ({m2} m²)",
          treat_rodents: "Dératisation ({m2} m²)",
          treat_ants: "Traitement fourmis ({m2} m²)",
          treat_wasps: "Destruction du nid (guêpes / frelons)",
          treat_disinfect: "Désinfection des surfaces ({m2} m²)",
          fast: "Intervention sous 48 h",
          urgent: "Urgence sous 24 h",
          second: "Second traitement de contrôle (garanti 30 jours)",
          report: "Rapport écrit (régie / assurance)",
          seal: "Colmatage des accès",
        },
      },
    },
    en: {
      label: "Disinfection and pest control",
      forWho: "disinfection and pest control companies",
      pitch: "Price treatment, urgency and follow-up by problem and premises.",
      emailNoun: "your pest control treatment",
      landing: {
        h1: ["YOU TREAT.", "DEALZ PRICES."],
        question: "How many urgent calls do you lose because nobody picks up at 9pm?",
        text: "When people find bed bugs or cockroaches, they want an answer right away — not a callback in three days. Dealz answers at any hour, asks the right questions (pest, premises, extent, urgency), calculates your price from your rates and prepares the quote.",
        clientQ: "How much to treat bed bugs in a 90 m² house?",
        values: [
          { icon: "🆘", title: "An answer in the evening and at weekends", text: "Urgent requests come in when the problem appears — and are qualified before your first call." },
          { icon: "🪳", title: "Each pest, its own rules", text: "Bed bugs, cockroaches, rodents, wasps, ants, disinfection: a base price and questions suited to each case." },
          { icon: "⏱️", title: "48h or 24h urgency priced", text: "Your urgency surcharges apply automatically, with no haggling on the phone." },
          { icon: "📄", title: "Follow-up and reports as options", text: "Second treatment, report for the property manager or insurer, sealing: each option is offered upfront." },
        ],
        step1: "Import your rates: treatment per pest, premises and surface multipliers, severity and urgency surcharges, follow-up.",
        step2: "The engine understands your pest types, premises, infestation levels and response times.",
        excel: { file: "pest-control-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Bed bugs", "90 m² house · established", "CHF 885"], ["Response within 48h", "+20%", "CHF 175"], ["Report for property manager", "Flat rate", "CHF 90"]] },
        chat: ["“I found bed bugs in my bedroom, it's urgent.”", "“How long has it been going on, and how big is the home?”", "“Would you like a visit within 48 hours and a follow-up check?”"],
        offer: { company: "SanitSafe Antiparasitaires SA", rows: [["Bed bug treatment (90 m²)", 885], ["Response within 48h", 175], ["Report for property manager", 90]] },
        roi: "A single extra job a month can already pay for your subscription.",
      },
      demo: {
        brand: "SanitSafe",
        eyebrow: "Neuchâtel & Jura arc · Fictional example",
        hero: { h1: "Pests out, peace of mind in.", text: "Bed bugs, cockroaches, rodents, wasps and disinfection for homes and businesses — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "2,400+", lbl: "CALL-OUTS" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we treat",
        servicesSub: "Pick a service, or simply describe your problem in the “Get a quote” tab.",
        services: [
          { icon: "🛏️", title: "Bed bugs", text: "Targeted treatment, results guaranteed.", tag: "from CHF 420" },
          { icon: "🪳", title: "Cockroaches", text: "Gel, traps and treatment of nests.", tag: "from CHF 280" },
          { icon: "🐀", title: "Rodents", text: "Rodent control and sealing of entry points.", tag: "from CHF 240" },
          { icon: "🐝", title: "Wasps and hornets", text: "Safe nest removal.", tag: "from CHF 150" },
          { icon: "🐜", title: "Ants", text: "Treatment of indoor and outdoor nests.", tag: "from CHF 180" },
          { icon: "🧴", title: "Disinfection", text: "Viruses, bacteria, mould.", tag: "from CHF 4.20/m²" },
        ],
        about: {
          title: "Certified technicians, discreet service",
          text: "SanitSafe Antiparasitaires has been serving households, property managers, restaurants and hotels across the Jura arc since 2008. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Certified technicians", "trained in biocides and safety."], ["Unmarked vehicles", "no visible branding, discreet visits."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "032 000 00 60", email: "hello@sanitsafe.demo", zone: "Neuchâtel, Jura, French-speaking Bern", hours: "Mon–Sun, 7am–9pm" },
        devisNote: "Answer a few questions about your problem — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your problem…",
        pdfCompany: { name: "SanitSafe Antiparasitaires SA", address: "Rue du Seyon 14, 2000 Neuchâtel", phone: "032 000 00 60", email: "hello@sanitsafe.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your situation, then put together a firm quote right away.",
        addressPlaceholder: "Address to treat (street, postcode, town)",
        terms: "Firm quote, valid for 30 days. Results guaranteed under the conditions of the chosen treatment. Swiss VAT included where applicable.",
        q: {
          problem: { text: "What is the problem?", short: "Problem", opts: { bedbugs: "Bed bugs", roaches: "Cockroaches", rodents: "Rodents (mice, rats)", wasps: "Wasp or hornet nest", ants: "Ants", disinfect: "Disinfection (viruses, bacteria, mould)" } },
          premises: { text: "What kind of premises?", short: "Premises", opts: { flat: "Flat", house: "House", shop: "Shop / restaurant", building: "Building / common areas" } },
          surface: { text: "How large is the area to treat?", short: "Area", opts: { sm: "Under 60 m²", md: "60 to 120 m²", lg: "120 to 250 m²", xl: "Over 250 m²" } },
          severity: { text: "How long has the problem been there?", short: "Extent", opts: { early: "Early infestation", set: "Established for several weeks", severe: "Severe infestation" } },
          urgency: { text: "How quickly do you need someone?", short: "Response time", opts: { std: "Within 5 days", fast: "Within 48 hours", urgent: "Emergency within 24 hours" } },
          followup: { text: "Would you like any follow-up options?", short: "Follow-up", none: "No follow-up", opts: { second: "Second check treatment (30-day guarantee)", report: "Written report for property manager / insurer", seal: "Sealing of entry points (rodents)" } },
          date: { text: "From which date can we come?", short: "Preferred date" },
        },
        items: {
          treat_bedbugs: "Bed bug treatment ({m2} m²)",
          treat_roaches: "Cockroach treatment ({m2} m²)",
          treat_rodents: "Rodent control ({m2} m²)",
          treat_ants: "Ant treatment ({m2} m²)",
          treat_wasps: "Nest removal (wasps / hornets)",
          treat_disinfect: "Surface disinfection ({m2} m²)",
          fast: "Response within 48 hours",
          urgent: "Emergency within 24 hours",
          second: "Second check treatment (30-day guarantee)",
          report: "Written report (property manager / insurer)",
          seal: "Sealing of entry points",
        },
      },
    },
    de: {
      label: "Desinfektion und Schädlingsbekämpfung",
      forWho: "Desinfektions- und Schädlingsbekämpfungsunternehmen",
      pitch: "Behandlung, Dringlichkeit und Nachkontrolle nach Problem und Räumlichkeiten berechnen.",
      emailNoun: "Ihre Schädlingsbekämpfung",
      landing: {
        h1: ["SIE BEHANDELN.", "DEALZ RECHNET."],
        question: "Wie viele dringende Anrufe verlieren Sie, weil um 21 Uhr niemand abnimmt?",
        text: "Wer Bettwanzen oder Kakerlaken entdeckt, will sofort eine Antwort — keinen Rückruf in drei Tagen. Dealz antwortet rund um die Uhr, stellt die richtigen Fragen (Schädling, Räumlichkeiten, Ausmass, Dringlichkeit), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Behandlung von Bettwanzen in einem Haus von 90 m²?",
        values: [
          { icon: "🆘", title: "Eine Antwort am Abend und am Wochenende", text: "Dringende Anfragen kommen, wenn das Problem auftaucht — und sind vor Ihrem ersten Anruf qualifiziert." },
          { icon: "🪳", title: "Jeder Schädling, seine Regeln", text: "Bettwanzen, Kakerlaken, Nager, Wespen, Ameisen, Desinfektion: ein Grundpreis und passende Fragen für jeden Fall." },
          { icon: "⏱️", title: "Notfall 48 Std. oder 24 Std. berechnet", text: "Ihre Dringlichkeitszuschläge werden automatisch angewendet, ohne Verhandlung am Telefon." },
          { icon: "📄", title: "Nachkontrolle und Berichte als Option", text: "Zweitbehandlung, Bericht für Verwaltung oder Versicherung, Abdichtung: Jede Option wird direkt angeboten." },
        ],
        step1: "Importieren Sie Ihre Tarife: Behandlung pro Schädling, Faktoren für Räumlichkeiten und Fläche, Zuschläge für Schweregrad und Dringlichkeit, Nachkontrolle.",
        step2: "Die Engine versteht Ihre Schädlingsarten, Räumlichkeiten, Befallsstufen und Einsatzfristen.",
        excel: { file: "tarife-schaedlinge.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Bettwanzen", "Haus 90 m² · etabliert", "CHF 885"], ["Einsatz innert 48 Std.", "+20 %", "CHF 175"], ["Bericht für Verwaltung", "Pauschal", "CHF 90"]] },
        chat: ["«Ich habe Bettwanzen im Schlafzimmer gefunden, es ist dringend.»", "«Seit wann, und wie gross ist die Wohnung?»", "«Wünschen Sie einen Einsatz innert 48 Stunden und eine Nachkontrolle?»"],
        offer: { company: "SanitSafe Antiparasitaires SA", rows: [["Bettwanzenbehandlung (90 m²)", 885], ["Einsatz innert 48 Std.", 175], ["Bericht für Verwaltung", 90]] },
        roi: "Ein einziger zusätzlicher Einsatz pro Monat kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "SanitSafe",
        eyebrow: "Neuenburg & Jurabogen · Fiktives Beispiel",
        hero: { h1: "Schädlinge raus, Ruhe rein.", text: "Bettwanzen, Kakerlaken, Nager, Wespen und Desinfektion für Privatpersonen und Betriebe — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "2'400+", lbl: "EINSÄTZE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir behandeln",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Problem einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🛏️", title: "Bettwanzen", text: "Gezielte Behandlung, Erfolgsgarantie.", tag: "ab CHF 420" },
          { icon: "🪳", title: "Kakerlaken", text: "Gel, Fallen und Behandlung der Nester.", tag: "ab CHF 280" },
          { icon: "🐀", title: "Nager", text: "Bekämpfung und Abdichtung der Zugänge.", tag: "ab CHF 240" },
          { icon: "🐝", title: "Wespen und Hornissen", text: "Sichere Entfernung der Nester.", tag: "ab CHF 150" },
          { icon: "🐜", title: "Ameisen", text: "Behandlung der Nester innen und aussen.", tag: "ab CHF 180" },
          { icon: "🧴", title: "Desinfektion", text: "Viren, Bakterien, Schimmel.", tag: "ab CHF 4.20/m²" },
        ],
        about: {
          title: "Zertifizierte Techniker, diskreter Einsatz",
          text: "SanitSafe Antiparasitaires ist seit 2008 für Privatpersonen, Verwaltungen, Restaurants und Hotels im Jurabogen im Einsatz. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Zertifizierte Techniker", "geschult in Bioziden und Sicherheit."], ["Neutrale Fahrzeuge", "keine sichtbare Beschriftung, diskreter Einsatz."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "032 000 00 60", email: "hello@sanitsafe.demo", zone: "Neuenburg, Jura, Berner Jura", hours: "Mo–So, 7–21 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Problem — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Problem…",
        pdfCompany: { name: "SanitSafe Antiparasitaires SA", address: "Rue du Seyon 14, 2000 Neuchâtel", phone: "032 000 00 60", email: "hello@sanitsafe.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Situation und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Zu behandelnde Adresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig. Erfolgsgarantie gemäss Bedingungen der gewählten Behandlung. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          problem: { text: "Was ist das Problem?", short: "Problem", opts: { bedbugs: "Bettwanzen", roaches: "Kakerlaken / Schaben", rodents: "Nager (Mäuse, Ratten)", wasps: "Wespen- oder Hornissennest", ants: "Ameisen", disinfect: "Desinfektion (Viren, Bakterien, Schimmel)" } },
          premises: { text: "Um welche Räumlichkeiten geht es?", short: "Räumlichkeiten", opts: { flat: "Wohnung", house: "Haus", shop: "Geschäft / Restaurant", building: "Mehrfamilienhaus / Allgemeinräume" } },
          surface: { text: "Wie gross ist die zu behandelnde Fläche?", short: "Fläche", opts: { sm: "Unter 60 m²", md: "60 bis 120 m²", lg: "120 bis 250 m²", xl: "Über 250 m²" } },
          severity: { text: "Seit wann besteht das Problem?", short: "Ausmass", opts: { early: "Beginnender Befall", set: "Seit mehreren Wochen etabliert", severe: "Starker Befall" } },
          urgency: { text: "Wie schnell brauchen Sie jemanden?", short: "Frist", opts: { std: "Innert 5 Tagen", fast: "Innert 48 Stunden", urgent: "Notfall innert 24 Stunden" } },
          followup: { text: "Wünschen Sie eine Nachbetreuung als Option?", short: "Nachbetreuung", none: "Keine Nachbetreuung", opts: { second: "Zweite Kontrollbehandlung (30 Tage Garantie)", report: "Schriftlicher Bericht für Verwaltung / Versicherung", seal: "Abdichtung der Zugänge (Nager)" } },
          date: { text: "Ab welchem Datum ist der Einsatz möglich?", short: "Wunschtermin" },
        },
        items: {
          treat_bedbugs: "Bettwanzenbehandlung ({m2} m²)",
          treat_roaches: "Kakerlakenbehandlung ({m2} m²)",
          treat_rodents: "Nagerbekämpfung ({m2} m²)",
          treat_ants: "Ameisenbehandlung ({m2} m²)",
          treat_wasps: "Entfernung des Nests (Wespen / Hornissen)",
          treat_disinfect: "Flächendesinfektion ({m2} m²)",
          fast: "Einsatz innert 48 Stunden",
          urgent: "Notfall innert 24 Stunden",
          second: "Zweite Kontrollbehandlung (30 Tage Garantie)",
          report: "Schriftlicher Bericht (Verwaltung / Versicherung)",
          seal: "Abdichtung der Zugänge",
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
