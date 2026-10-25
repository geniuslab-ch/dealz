/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "location-evenementiel",
    icon: "🎪",
    needsAddress: true,
    colors: { main: "#ae3ec9", dark: "#862e9c", light: "#f3d9fa", accent: "#fab005", accentDark: "#e67700", bg: "#fdfaff" },

    quote: {
      minimum: 150,
      questions: [
        { id: "event", type: "single", options: [{ id: "wedding" }, { id: "corp" }, { id: "party" }, { id: "public" }] },
        { id: "guests", type: "single", options: [{ id: "g1", n: 25 }, { id: "g2", n: 45 }, { id: "g3", n: 80 }, { id: "g4", n: 150 }, { id: "g5", n: 250 }] },
        { id: "items", type: "multi", options: [{ id: "tables" }, { id: "tent" }, { id: "sound" }, { id: "light" }, { id: "tableware" }, { id: "lounge" }] },
        { id: "duration", type: "single", options: [{ id: "day", k: 1 }, { id: "weekend", k: 1.6 }, { id: "multi", k: 2 }] },
        { id: "delivery", type: "single", options: [{ id: "pickup" }, { id: "deliver" }, { id: "setup" }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var n = a.guests.n, k = a.duration.k;
        (a.items || []).forEach(function (it) {
          if (it.id === "tables") items.push({ label: L("tables", { n: n }), amount: H.round5(n * 7.5 * k) });
          if (it.id === "tent") items.push({ label: L("tent", { n: n }), amount: H.round5((250 + n * 14) * k) });
          if (it.id === "sound") items.push({ label: L("sound"), amount: H.round5((n <= 100 ? 220 : 380) * k) });
          if (it.id === "light") items.push({ label: L("light"), amount: H.round5((180 + n * 1.2) * k) });
          if (it.id === "tableware") items.push({ label: L("tableware", { n: n }), amount: H.round5(n * 6.2 * k) });
          if (it.id === "lounge") items.push({ label: L("lounge"), amount: H.round5(340 * k) });
        });
        if (!items.length) items.push({ label: L("base"), amount: 60 });
        if (a.delivery.id === "deliver") items.push({ label: L("deliver"), amount: H.round5(90 + n * 0.6) });
        if (a.delivery.id === "setup") items.push({ label: L("setup"), amount: H.round5(210 + n * 2.5) });
        return items;
      },
    },

    fr: {
      label: "Location de matériel événementiel",
      forWho: "entreprises de location de matériel événementiel",
      pitch: "Chiffrez tables, tentes, son et lumière selon le nombre d'invités.",
      emailNoun: "votre événement",
      landing: {
        h1: ["VOUS ÉQUIPEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de location perdez-vous parce qu'un devis prend trois jours ?",
        text: "Un mariage, un anniversaire, une fête d'entreprise : le client compare plusieurs loueurs et choisit le premier qui répond. Dealz répond tout de suite, pose les bonnes questions (invités, matériel, durée, livraison), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour 80 invités : tables, chaises, tente et sono ?",
        values: [
          { icon: "👥", title: "Des devis au nombre d'invités", text: "Tables, chaises, tente, vaisselle : tout se calcule à partir du nombre de personnes." },
          { icon: "📆", title: "Durée et week-end intégrés", text: "Un jour, un week-end, plusieurs jours : vos coefficients de durée s'appliquent seuls." },
          { icon: "🚚", title: "Retrait, livraison ou montage", text: "Chaque formule logistique est chiffrée selon vos règles, montage et démontage compris." },
          { icon: "🔒", title: "Dates qualifiées avant la réservation", text: "Vous voyez les demandes sérieuses, avec date et ampleur de l'événement." },
        ],
        step1: "Importez vos tarifs : prix par pièce ou par invité, coefficients de durée, forfaits de livraison et de montage. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos catalogues, vos tailles d'événements, vos durées de location et vos modes de livraison.",
        excel: { file: "tarifs-evenementiel.xlsx", headers: ["Matériel", "Condition", "Prix"], rows: [["Tables et chaises", "80 invités · 1 jour", "CHF 600"], ["Tente / chapiteau", "80 invités", "CHF 1 370"], ["Livraison + reprise", "Forfait", "CHF 140"]] },
        chat: ["« Nous organisons un mariage pour 80 personnes en juin. »", "« Quel matériel vous faut-il : tables, tente, sono, éclairage ? »", "« Souhaitez-vous la livraison avec montage et démontage ? »"],
        offer: { company: "EventBox Location Sàrl", rows: [["Tables et chaises (80 pers.)", 600], ["Tente / chapiteau (80 pers.)", 1370], ["Livraison et reprise", 140]] },
        roi: "Une seule location supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "EventBox",
        eyebrow: "Valais & Chablais · Exemple fictif",
        hero: { h1: "Votre événement mérite le bon matériel.", text: "Tables, chaises, tentes, sono, éclairage et vaisselle pour mariages, fêtes et événements d'entreprise — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.8★", lbl: "SATISFACTION CLIENT" }, { num: "1 200+", lbl: "ÉVÉNEMENTS ÉQUIPÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous louons",
        servicesSub: "Choisissez une catégorie, ou décrivez simplement votre événement dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🪑", title: "Tables et chaises", text: "Mobilier de réception pour tous formats.", tag: "dès CHF 7.50/pers." },
          { icon: "⛺", title: "Tentes et chapiteaux", text: "Structures 3×3 m à 12×30 m.", tag: "dès CHF 250" },
          { icon: "🔊", title: "Sonorisation", text: "Enceintes, micros et régie.", tag: "dès CHF 220" },
          { icon: "💡", title: "Éclairage", text: "Guirlandes, projecteurs et ambiance.", tag: "dès CHF 180" },
          { icon: "🍽️", title: "Vaisselle", text: "Assiettes, verres et couverts, lavés.", tag: "dès CHF 6.20/pers." },
          { icon: "🛋️", title: "Mobilier lounge", text: "Canapés, poufs et tables basses.", tag: "dès CHF 340" },
        ],
        about: {
          title: "Un dépôt, une équipe, tous vos événements",
          text: "EventBox Location équipe fêtes privées, communes et entreprises en Valais et dans le Chablais depuis 2011. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Matériel contrôlé", "chaque pièce est vérifiée avant et après la location."], ["Livraison et montage", "nos équipes installent et reprennent le matériel."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "027 000 00 50", email: "hello@eventbox.demo", zone: "Valais, Chablais, Vaud", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur votre événement — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre événement…",
        pdfCompany: { name: "EventBox Location Sàrl", address: "Zone industrielle 5, 1950 Sion", phone: "027 000 00 50", email: "hello@eventbox.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre événement, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Lieu de l'événement (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité à la date indiquée. Caution restituée après contrôle du matériel. TVA suisse incluse le cas échéant.",
        q: {
          event: { text: "Quel type d'événement organisez-vous ?", short: "Événement", opts: { wedding: "Mariage", corp: "Événement d'entreprise", party: "Anniversaire / fête privée", public: "Fête de village / association" } },
          guests: { text: "Combien d'invités attendez-vous ?", short: "Invités", opts: { g1: "Moins de 30", g2: "30 à 60", g3: "60 à 100", g4: "100 à 200", g5: "Plus de 200" } },
          items: { text: "De quel matériel avez-vous besoin ?", short: "Matériel", none: "Je ne sais pas encore", opts: { tables: "Tables et chaises", tent: "Tente / chapiteau", sound: "Sonorisation", light: "Éclairage d'ambiance", tableware: "Vaisselle, verres et couverts", lounge: "Mobilier lounge" } },
          duration: { text: "Pour quelle durée de location ?", short: "Durée", opts: { day: "1 jour", weekend: "Week-end (2 jours)", multi: "3 jours ou plus" } },
          delivery: { text: "Comment souhaitez-vous récupérer le matériel ?", short: "Logistique", opts: { pickup: "Retrait au dépôt", deliver: "Livraison + reprise", setup: "Livraison, montage et démontage" } },
          date: { text: "Quelle est la date de l'événement ?", short: "Date de l'événement" },
        },
        items: {
          tables: "Tables et chaises ({n} invités)",
          tent: "Tente / chapiteau ({n} invités)",
          sound: "Sonorisation",
          light: "Éclairage d'ambiance",
          tableware: "Vaisselle, verres et couverts ({n} invités)",
          lounge: "Mobilier lounge",
          base: "Frais de dossier et conseil",
          deliver: "Livraison et reprise du matériel",
          setup: "Livraison, montage et démontage",
        },
      },
    },
    en: {
      label: "Event equipment rental",
      forWho: "event equipment rental companies",
      pitch: "Price tables, tents, sound and lighting by number of guests.",
      emailNoun: "your event",
      landing: {
        h1: ["YOU EQUIP.", "DEALZ PRICES."],
        question: "How many rental requests do you lose because a quote takes three days?",
        text: "A wedding, a birthday, a company party: the customer compares several rental companies and picks the first one to answer. Dealz answers right away, asks the right questions (guests, equipment, duration, delivery), calculates your price from your rates and prepares the quote.",
        clientQ: "How much for 80 guests: tables, chairs, tent and sound system?",
        values: [
          { icon: "👥", title: "Quotes by number of guests", text: "Tables, chairs, tent, tableware: everything is calculated from the headcount." },
          { icon: "📆", title: "Duration and weekends built in", text: "One day, a weekend, several days: your duration multipliers apply on their own." },
          { icon: "🚚", title: "Pick-up, delivery or set-up", text: "Each logistics option is priced by your rules, set-up and take-down included." },
          { icon: "🔒", title: "Dates qualified before booking", text: "You see the serious requests, with the event's date and size." },
        ],
        step1: "Import your rates: price per item or per guest, duration multipliers, delivery and set-up packages. Your Excel stays your working tool.",
        step2: "The engine understands your catalogues, event sizes, rental durations and delivery modes.",
        excel: { file: "event-rental-rates.xlsx", headers: ["Equipment", "Condition", "Price"], rows: [["Tables and chairs", "80 guests · 1 day", "CHF 600"], ["Tent / marquee", "80 guests", "CHF 1,370"], ["Delivery + collection", "Flat rate", "CHF 140"]] },
        chat: ["“We're planning a wedding for 80 people in June.”", "“What equipment do you need: tables, tent, sound, lighting?”", "“Would you like delivery with set-up and take-down?”"],
        offer: { company: "EventBox Location Sàrl", rows: [["Tables and chairs (80 guests)", 600], ["Tent / marquee (80 guests)", 1370], ["Delivery and collection", 140]] },
        roi: "A single extra rental a month can already pay for your subscription.",
      },
      demo: {
        brand: "EventBox",
        eyebrow: "Valais & Chablais · Fictional example",
        hero: { h1: "Your event deserves the right equipment.", text: "Tables, chairs, tents, sound, lighting and tableware for weddings, parties and corporate events — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.8★", lbl: "CUSTOMER SATISFACTION" }, { num: "1,200+", lbl: "EVENTS EQUIPPED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we rent out",
        servicesSub: "Pick a category, or simply describe your event in the “Get a quote” tab.",
        services: [
          { icon: "🪑", title: "Tables and chairs", text: "Reception furniture for every format.", tag: "from CHF 7.50/guest" },
          { icon: "⛺", title: "Tents and marquees", text: "Structures from 3×3 m to 12×30 m.", tag: "from CHF 250" },
          { icon: "🔊", title: "Sound systems", text: "Speakers, microphones and mixing desk.", tag: "from CHF 220" },
          { icon: "💡", title: "Lighting", text: "String lights, spotlights and ambience.", tag: "from CHF 180" },
          { icon: "🍽️", title: "Tableware", text: "Plates, glasses and cutlery, washed.", tag: "from CHF 6.20/guest" },
          { icon: "🛋️", title: "Lounge furniture", text: "Sofas, poufs and coffee tables.", tag: "from CHF 340" },
        ],
        about: {
          title: "One depot, one team, all your events",
          text: "EventBox Location has been equipping private parties, municipalities and businesses in Valais and the Chablais since 2011. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Checked equipment", "every item is inspected before and after each rental."], ["Delivery and set-up", "our crews install and collect the equipment."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "027 000 00 50", email: "hello@eventbox.demo", zone: "Valais, Chablais, Vaud", hours: "Mon–Sat, 8am–6pm" },
        devisNote: "Answer a few questions about your event — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your event…",
        pdfCompany: { name: "EventBox Location Sàrl", address: "Zone industrielle 5, 1950 Sion", phone: "027 000 00 50", email: "hello@eventbox.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your event, then put together a firm quote right away.",
        addressPlaceholder: "Event location (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, subject to availability on the date given. Deposit returned after the equipment is checked. Swiss VAT included where applicable.",
        q: {
          event: { text: "What kind of event are you organising?", short: "Event", opts: { wedding: "Wedding", corp: "Corporate event", party: "Birthday / private party", public: "Village fête / association" } },
          guests: { text: "How many guests are you expecting?", short: "Guests", opts: { g1: "Under 30", g2: "30 to 60", g3: "60 to 100", g4: "100 to 200", g5: "Over 200" } },
          items: { text: "What equipment do you need?", short: "Equipment", none: "I don't know yet", opts: { tables: "Tables and chairs", tent: "Tent / marquee", sound: "Sound system", light: "Ambient lighting", tableware: "Tableware, glasses and cutlery", lounge: "Lounge furniture" } },
          duration: { text: "How long is the rental?", short: "Duration", opts: { day: "1 day", weekend: "Weekend (2 days)", multi: "3 days or more" } },
          delivery: { text: "How would you like to get the equipment?", short: "Logistics", opts: { pickup: "Pick-up at the depot", deliver: "Delivery + collection", setup: "Delivery, set-up and take-down" } },
          date: { text: "What is the date of the event?", short: "Event date" },
        },
        items: {
          tables: "Tables and chairs ({n} guests)",
          tent: "Tent / marquee ({n} guests)",
          sound: "Sound system",
          light: "Ambient lighting",
          tableware: "Tableware, glasses and cutlery ({n} guests)",
          lounge: "Lounge furniture",
          base: "Handling and advice fee",
          deliver: "Equipment delivery and collection",
          setup: "Delivery, set-up and take-down",
        },
      },
    },
    de: {
      label: "Vermietung von Eventmaterial",
      forWho: "Vermieter von Eventmaterial",
      pitch: "Tische, Zelte, Ton und Licht nach Anzahl Gäste berechnen.",
      emailNoun: "Ihren Anlass",
      landing: {
        h1: ["SIE RÜSTEN AUS.", "DEALZ RECHNET."],
        question: "Wie viele Mietanfragen verlieren Sie, weil eine Offerte drei Tage dauert?",
        text: "Eine Hochzeit, ein Geburtstag, ein Firmenfest: Der Kunde vergleicht mehrere Vermieter und wählt den ersten, der antwortet. Dealz antwortet sofort, stellt die richtigen Fragen (Gäste, Material, Dauer, Lieferung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet es für 80 Gäste: Tische, Stühle, Zelt und Tonanlage?",
        values: [
          { icon: "👥", title: "Offerten nach Anzahl Gäste", text: "Tische, Stühle, Zelt, Geschirr: Alles wird aus der Anzahl Personen berechnet." },
          { icon: "📆", title: "Dauer und Wochenende integriert", text: "Ein Tag, ein Wochenende, mehrere Tage: Ihre Dauerfaktoren werden automatisch angewendet." },
          { icon: "🚚", title: "Abholung, Lieferung oder Aufbau", text: "Jede Logistikvariante wird nach Ihren Regeln berechnet, Auf- und Abbau inbegriffen." },
          { icon: "🔒", title: "Termine vor der Reservation qualifiziert", text: "Sie sehen die ernsthaften Anfragen, mit Datum und Grösse des Anlasses." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Stück oder pro Gast, Dauerfaktoren, Pauschalen für Lieferung und Aufbau. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Kataloge, Anlassgrössen, Mietdauern und Lieferarten.",
        excel: { file: "tarife-eventmaterial.xlsx", headers: ["Material", "Bedingung", "Preis"], rows: [["Tische und Stühle", "80 Gäste · 1 Tag", "CHF 600"], ["Zelt / Festzelt", "80 Gäste", "CHF 1'370"], ["Lieferung + Rücknahme", "Pauschal", "CHF 140"]] },
        chat: ["«Wir organisieren im Juni eine Hochzeit für 80 Personen.»", "«Welches Material brauchen Sie: Tische, Zelt, Ton, Beleuchtung?»", "«Wünschen Sie die Lieferung mit Auf- und Abbau?»"],
        offer: { company: "EventBox Location Sàrl", rows: [["Tische und Stühle (80 Pers.)", 600], ["Zelt / Festzelt (80 Pers.)", 1370], ["Lieferung und Rücknahme", 140]] },
        roi: "Eine einzige zusätzliche Vermietung pro Monat kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "EventBox",
        eyebrow: "Wallis & Chablais · Fiktives Beispiel",
        hero: { h1: "Ihr Anlass verdient das richtige Material.", text: "Tische, Stühle, Zelte, Ton, Licht und Geschirr für Hochzeiten, Feste und Firmenanlässe — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.8★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "1'200+", lbl: "AUSGESTATTETE ANLÄSSE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir vermieten",
        servicesSub: "Wählen Sie eine Kategorie, oder beschreiben Sie Ihren Anlass einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🪑", title: "Tische und Stühle", text: "Bankettmobiliar für jedes Format.", tag: "ab CHF 7.50/Pers." },
          { icon: "⛺", title: "Zelte und Festzelte", text: "Strukturen von 3×3 m bis 12×30 m.", tag: "ab CHF 250" },
          { icon: "🔊", title: "Tonanlagen", text: "Lautsprecher, Mikrofone und Mischpult.", tag: "ab CHF 220" },
          { icon: "💡", title: "Beleuchtung", text: "Lichterketten, Scheinwerfer und Stimmung.", tag: "ab CHF 180" },
          { icon: "🍽️", title: "Geschirr", text: "Teller, Gläser und Besteck, gewaschen.", tag: "ab CHF 6.20/Pers." },
          { icon: "🛋️", title: "Lounge-Möbel", text: "Sofas, Sitzsäcke und Salontische.", tag: "ab CHF 340" },
        ],
        about: {
          title: "Ein Lager, ein Team, alle Ihre Anlässe",
          text: "EventBox Location stattet seit 2011 private Feste, Gemeinden und Unternehmen im Wallis und im Chablais aus. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Geprüftes Material", "jedes Stück wird vor und nach der Vermietung kontrolliert."], ["Lieferung und Aufbau", "unsere Teams stellen das Material auf und holen es wieder ab."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "027 000 00 50", email: "hello@eventbox.demo", zone: "Wallis, Chablais, Waadt", hours: "Mo–Sa, 8–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Anlass — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihren Anlass…",
        pdfCompany: { name: "EventBox Location Sàrl", address: "Zone industrielle 5, 1950 Sion", phone: "027 000 00 50", email: "hello@eventbox.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Anlass und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Ort des Anlasses (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, vorbehaltlich Verfügbarkeit am angegebenen Datum. Kaution wird nach Kontrolle des Materials zurückerstattet. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          event: { text: "Welche Art von Anlass organisieren Sie?", short: "Anlass", opts: { wedding: "Hochzeit", corp: "Firmenanlass", party: "Geburtstag / Privatfest", public: "Dorffest / Verein" } },
          guests: { text: "Wie viele Gäste erwarten Sie?", short: "Gäste", opts: { g1: "Unter 30", g2: "30 bis 60", g3: "60 bis 100", g4: "100 bis 200", g5: "Über 200" } },
          items: { text: "Welches Material brauchen Sie?", short: "Material", none: "Ich weiss es noch nicht", opts: { tables: "Tische und Stühle", tent: "Zelt / Festzelt", sound: "Tonanlage", light: "Stimmungsbeleuchtung", tableware: "Geschirr, Gläser und Besteck", lounge: "Lounge-Möbel" } },
          duration: { text: "Für welche Mietdauer?", short: "Dauer", opts: { day: "1 Tag", weekend: "Wochenende (2 Tage)", multi: "3 Tage oder mehr" } },
          delivery: { text: "Wie möchten Sie das Material erhalten?", short: "Logistik", opts: { pickup: "Abholung im Lager", deliver: "Lieferung + Rücknahme", setup: "Lieferung, Auf- und Abbau" } },
          date: { text: "An welchem Datum findet der Anlass statt?", short: "Datum des Anlasses" },
        },
        items: {
          tables: "Tische und Stühle ({n} Gäste)",
          tent: "Zelt / Festzelt ({n} Gäste)",
          sound: "Tonanlage",
          light: "Stimmungsbeleuchtung",
          tableware: "Geschirr, Gläser und Besteck ({n} Gäste)",
          lounge: "Lounge-Möbel",
          base: "Bearbeitungs- und Beratungsgebühr",
          deliver: "Lieferung und Rücknahme des Materials",
          setup: "Lieferung, Auf- und Abbau",
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
