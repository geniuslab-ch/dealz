/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "location-vehicules",
    icon: "🚙",
    needsAddress: false,
    colors: { main: "#1864ab", dark: "#124b82", light: "#d0ebff", accent: "#f76707", accentDark: "#d9480f", bg: "#f8fbff" },

    quote: {
      minimum: 59,
      questions: [
        { id: "vehicle", type: "single", options: [{ id: "city", day: 59 }, { id: "compact", day: 79 }, { id: "suv", day: 109 }, { id: "van", day: 119 }, { id: "minibus", day: 149 }] },
        { id: "duration", type: "single", options: [{ id: "d1", days: 1, disc: 0 }, { id: "d3", days: 3, disc: 0.05 }, { id: "w1", days: 7, disc: 0.15 }, { id: "w2", days: 14, disc: 0.25 }] },
        { id: "km", type: "single", options: [{ id: "k100", fee: 0 }, { id: "k250", fee: 12 }, { id: "kunl", fee: 25 }] },
        { id: "options", type: "multi", options: [{ id: "full" }, { id: "driver" }, { id: "seat" }, { id: "gps" }, { id: "winter" }] },
        { id: "pickup", type: "single", options: [{ id: "agency", fee: 0 }, { id: "delivery", fee: 80 }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var d = a.duration.days;
        items.push({
          label: a.duration.disc ? L("rental", { days: d, disc: Math.round(a.duration.disc * 100) }) : L("rental0", { days: d }),
          amount: H.round5(a.vehicle.day * d * (1 - a.duration.disc)),
        });
        if (a.km.fee) items.push({ label: L(a.km.id === "kunl" ? "kmUnl" : "km250", { days: d }), amount: a.km.fee * d });
        (a.options || []).forEach(function (o) {
          if (o.id === "full") items.push({ label: L("full", { days: d }), amount: 22 * d });
          if (o.id === "driver") items.push({ label: L("driver"), amount: 40 });
          if (o.id === "seat") items.push({ label: L("seat", { days: d }), amount: 8 * d });
          if (o.id === "gps") items.push({ label: L("gps", { days: d }), amount: 6 * d });
          if (o.id === "winter") items.push({ label: L("winter"), amount: 35 });
        });
        if (a.pickup.fee) items.push({ label: L("delivery"), amount: a.pickup.fee });
        return items;
      },
    },

    fr: {
      label: "Location de véhicules",
      forWho: "entreprises de location de véhicules",
      pitch: "Chiffrez véhicule, durée, kilométrage et assurance en quelques clics.",
      emailNoun: "votre location de véhicule",
      landing: {
        h1: ["VOUS LOUEZ.", "DEALZ CHIFFRE."],
        question: "Combien de réservations perdez-vous parce que le comparateur répond avant vous ?",
        text: "Le client veut un prix pour ce week-end, pas une demande de rappel. Dealz lui répond tout de suite, pose les bonnes questions (véhicule, durée, kilomètres, assurance), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour louer une compacte pendant une semaine, kilomètres illimités ?",
        values: [
          { icon: "📆", title: "Vos tarifs dégressifs appliqués seuls", text: "Un jour, un week-end, une semaine, deux semaines : vos remises de durée s'appliquent automatiquement." },
          { icon: "🛣️", title: "Kilométrage et assurance chiffrés", text: "Forfaits kilométriques et rachat de franchise proposés dès le premier devis." },
          { icon: "🎒", title: "Options qui font le panier moyen", text: "Conducteur supplémentaire, siège enfant, GPS, équipement hiver : chaque option est suggérée au bon moment." },
          { icon: "📍", title: "Agence ou livraison", text: "La remise à l'adresse du client est facturée selon vos règles." },
        ],
        step1: "Importez vos tarifs : prix par catégorie et par jour, remises de durée, forfaits kilométriques, assurances, options. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos catégories de véhicules, vos durées, vos kilométrages et vos options.",
        excel: { file: "tarifs-location.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Location compacte", "7 jours · remise 15 %", "CHF 470"], ["Kilomètres illimités", "7 jours", "CHF 175"], ["Assurance tous risques", "7 jours", "CHF 154"]] },
        chat: ["« Je cherche une voiture pour une semaine de vacances. »", "« Quelle catégorie souhaitez-vous, et combien de kilomètres prévoyez-vous ? »", "« Voulez-vous l'assurance tous risques avec franchise réduite ? »"],
        offer: { company: "AlpiRent Location", rows: [["Location compacte — 7 jours", 470], ["Kilomètres illimités", 175], ["Assurance tous risques", 154]] },
        roi: "Une seule location d'une semaine supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "AlpiRent",
        eyebrow: "Genève & Arc lémanique · Exemple fictif",
        hero: { h1: "La bonne voiture, au bon prix, tout de suite.", text: "Citadines, SUV, fourgons et minibus à la journée ou à la semaine — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.7★", lbl: "SATISFACTION CLIENT" }, { num: "9 800+", lbl: "LOCATIONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous louons",
        servicesSub: "Choisissez une catégorie, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚗", title: "Citadine", text: "Idéale pour la ville et les courts trajets.", tag: "dès CHF 59/jour" },
          { icon: "🚙", title: "Compacte / berline", text: "Confort et économie sur route.", tag: "dès CHF 79/jour" },
          { icon: "🚐", title: "SUV et monospace", text: "Espace pour la famille et les bagages.", tag: "dès CHF 109/jour" },
          { icon: "🚚", title: "Fourgon 12 m³", text: "Pour déménager ou transporter.", tag: "dès CHF 119/jour" },
          { icon: "🚌", title: "Minibus 9 places", text: "Pour les groupes et les événements.", tag: "dès CHF 149/jour" },
          { icon: "❄️", title: "Équipement hiver", text: "Pneus hiver et chaînes à neige.", tag: "CHF 35" },
        ],
        about: {
          title: "Une agence locale, une flotte récente",
          text: "AlpiRent Location met à disposition des véhicules récents aux particuliers et entreprises de l'Arc lémanique depuis 2007. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Flotte entretenue", "véhicules de moins de trois ans, contrôlés avant chaque départ."], ["Assurance claire", "franchise réduite disponible, sans surprise."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 11", email: "hello@alpirent.demo", zone: "Genève, Vaud, Valais", hours: "Lun–Dim, 7h–20h" },
        devisNote: "Répondez à quelques questions sur votre location — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre besoin de location…",
        pdfCompany: { name: "AlpiRent Location", address: "Route de Meyrin 120, 1215 Genève", phone: "022 000 00 11", email: "hello@alpirent.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre location, puis je vous établis un devis ferme tout de suite après.",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité. Caution et permis de conduire valable exigés au retrait. TVA suisse incluse le cas échéant.",
        q: {
          vehicle: { text: "Quel type de véhicule souhaitez-vous ?", short: "Véhicule", opts: { city: "Citadine (5 portes)", compact: "Compacte / berline", suv: "SUV / monospace", van: "Fourgon 12 m³", minibus: "Minibus 9 places" } },
          duration: { text: "Pour quelle durée ?", short: "Durée", opts: { d1: "1 jour", d3: "2 à 3 jours", w1: "1 semaine", w2: "2 semaines ou plus" } },
          km: { text: "Quel kilométrage prévoyez-vous ?", short: "Kilométrage", opts: { k100: "100 km par jour inclus", k250: "250 km par jour", kunl: "Kilomètres illimités" } },
          options: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { full: "Assurance tous risques (franchise réduite)", driver: "Conducteur supplémentaire", seat: "Siège enfant", gps: "GPS", winter: "Équipement hiver (chaînes)" } },
          pickup: { text: "Où récupérer le véhicule ?", short: "Remise", opts: { agency: "À l'agence", delivery: "Livraison et reprise à l'adresse" } },
          date: { text: "Quelle est la date de départ ?", short: "Départ" },
        },
        items: {
          rental: "Location — {days} jour(s), remise de durée {disc} %",
          rental0: "Location — {days} jour(s)",
          km250: "Forfait 250 km par jour ({days} j.)",
          kmUnl: "Kilomètres illimités ({days} j.)",
          full: "Assurance tous risques ({days} j.)",
          driver: "Conducteur supplémentaire",
          seat: "Siège enfant ({days} j.)",
          gps: "GPS ({days} j.)",
          winter: "Équipement hiver (chaînes)",
          delivery: "Livraison et reprise à l'adresse",
        },
      },
    },
    en: {
      label: "Vehicle rental",
      forWho: "vehicle rental companies",
      pitch: "Price vehicle, duration, mileage and insurance in a few clicks.",
      emailNoun: "your vehicle rental",
      landing: {
        h1: ["YOU RENT.", "DEALZ PRICES."],
        question: "How many bookings do you lose because the comparison site answers before you?",
        text: "Customers want a price for this weekend, not a callback request. Dealz answers right away, asks the right questions (vehicle, duration, mileage, insurance), calculates your price from your rates and prepares the quote.",
        clientQ: "How much to rent a compact car for a week, unlimited mileage?",
        values: [
          { icon: "📆", title: "Your sliding rates applied automatically", text: "One day, a weekend, a week, two weeks: your duration discounts apply on their own." },
          { icon: "🛣️", title: "Mileage and insurance priced", text: "Mileage packages and excess waivers offered from the very first quote." },
          { icon: "🎒", title: "Options that grow the basket", text: "Additional driver, child seat, GPS, winter equipment: each option is suggested at the right moment." },
          { icon: "📍", title: "Branch or delivery", text: "Handover at the customer's address is charged by your rules." },
        ],
        step1: "Import your rates: price per category and per day, duration discounts, mileage packages, insurance, options. Your Excel stays your working tool.",
        step2: "The engine understands your vehicle categories, durations, mileages and options.",
        excel: { file: "rental-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Compact rental", "7 days · 15% discount", "CHF 470"], ["Unlimited mileage", "7 days", "CHF 175"], ["Comprehensive insurance", "7 days", "CHF 154"]] },
        chat: ["“I'm looking for a car for a week's holiday.”", "“Which category would you like, and how many kilometres do you expect?”", "“Would you like comprehensive insurance with a reduced excess?”"],
        offer: { company: "AlpiRent Location", rows: [["Compact rental — 7 days", 470], ["Unlimited mileage", 175], ["Comprehensive insurance", 154]] },
        roi: "A single extra week-long rental a month can already pay for your subscription.",
      },
      demo: {
        brand: "AlpiRent",
        eyebrow: "Geneva & Lake Geneva region · Fictional example",
        hero: { h1: "The right car, at the right price, right now.", text: "City cars, SUVs, vans and minibuses by the day or by the week — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.7★", lbl: "CUSTOMER SATISFACTION" }, { num: "9,800+", lbl: "RENTALS" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we rent out",
        servicesSub: "Pick a category, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "🚗", title: "City car", text: "Ideal for town and short trips.", tag: "from CHF 59/day" },
          { icon: "🚙", title: "Compact / saloon", text: "Comfort and economy on the road.", tag: "from CHF 79/day" },
          { icon: "🚐", title: "SUV and MPV", text: "Room for the family and luggage.", tag: "from CHF 109/day" },
          { icon: "🚚", title: "12 m³ van", text: "For moving or carrying goods.", tag: "from CHF 119/day" },
          { icon: "🚌", title: "9-seat minibus", text: "For groups and events.", tag: "from CHF 149/day" },
          { icon: "❄️", title: "Winter equipment", text: "Winter tyres and snow chains.", tag: "CHF 35" },
        ],
        about: {
          title: "A local branch, a recent fleet",
          text: "AlpiRent Location has been renting recent vehicles to households and businesses around Lake Geneva since 2007. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Well-maintained fleet", "vehicles under three years old, checked before every departure."], ["Clear insurance", "reduced excess available, no surprises."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "022 000 00 11", email: "hello@alpirent.demo", zone: "Geneva, Vaud, Valais", hours: "Mon–Sun, 7am–8pm" },
        devisNote: "Answer a few questions about your rental — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe what you need to rent…",
        pdfCompany: { name: "AlpiRent Location", address: "Route de Meyrin 120, 1215 Genève", phone: "022 000 00 11", email: "hello@alpirent.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your rental, then put together a firm quote right away.",
        terms: "Firm quote, valid for 30 days, subject to availability. Deposit and a valid driving licence required at pick-up. Swiss VAT included where applicable.",
        q: {
          vehicle: { text: "Which type of vehicle would you like?", short: "Vehicle", opts: { city: "City car (5 doors)", compact: "Compact / saloon", suv: "SUV / MPV", van: "12 m³ van", minibus: "9-seat minibus" } },
          duration: { text: "For how long?", short: "Duration", opts: { d1: "1 day", d3: "2 to 3 days", w1: "1 week", w2: "2 weeks or more" } },
          km: { text: "How much mileage do you expect?", short: "Mileage", opts: { k100: "100 km per day included", k250: "250 km per day", kunl: "Unlimited mileage" } },
          options: { text: "Would you like any options?", short: "Options", none: "No options", opts: { full: "Comprehensive insurance (reduced excess)", driver: "Additional driver", seat: "Child seat", gps: "GPS", winter: "Winter equipment (chains)" } },
          pickup: { text: "Where would you like to collect the vehicle?", short: "Handover", opts: { agency: "At the branch", delivery: "Delivery and collection at your address" } },
          date: { text: "What is the start date?", short: "Start" },
        },
        items: {
          rental: "Rental — {days} day(s), duration discount {disc}%",
          rental0: "Rental — {days} day(s)",
          km250: "250 km per day package ({days} d.)",
          kmUnl: "Unlimited mileage ({days} d.)",
          full: "Comprehensive insurance ({days} d.)",
          driver: "Additional driver",
          seat: "Child seat ({days} d.)",
          gps: "GPS ({days} d.)",
          winter: "Winter equipment (chains)",
          delivery: "Delivery and collection at your address",
        },
      },
    },
    de: {
      label: "Fahrzeugvermietung",
      forWho: "Fahrzeugvermieter",
      pitch: "Fahrzeug, Dauer, Kilometer und Versicherung mit wenigen Klicks berechnen.",
      emailNoun: "Ihre Fahrzeugmiete",
      landing: {
        h1: ["SIE VERMIETEN.", "DEALZ RECHNET."],
        question: "Wie viele Buchungen verlieren Sie, weil das Vergleichsportal vor Ihnen antwortet?",
        text: "Der Kunde will einen Preis für dieses Wochenende, keine Rückrufbitte. Dealz antwortet sofort, stellt die richtigen Fragen (Fahrzeug, Dauer, Kilometer, Versicherung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet ein Kompaktwagen für eine Woche, unbegrenzte Kilometer?",
        values: [
          { icon: "📆", title: "Ihre Staffeltarife automatisch angewendet", text: "Ein Tag, ein Wochenende, eine Woche, zwei Wochen: Ihre Dauerrabatte werden automatisch angewendet." },
          { icon: "🛣️", title: "Kilometer und Versicherung berechnet", text: "Kilometerpakete und Selbstbehalt-Reduktion ab der ersten Offerte angeboten." },
          { icon: "🎒", title: "Optionen für den höheren Warenkorb", text: "Zusatzfahrer, Kindersitz, GPS, Winterausrüstung: Jede Option wird im richtigen Moment vorgeschlagen." },
          { icon: "📍", title: "Filiale oder Lieferung", text: "Die Übergabe an der Kundenadresse wird nach Ihren Regeln verrechnet." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro Kategorie und Tag, Dauerrabatte, Kilometerpakete, Versicherungen, Optionen. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Fahrzeugkategorien, Mietdauern, Kilometer und Optionen.",
        excel: { file: "tarife-vermietung.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Miete Kompaktwagen", "7 Tage · 15 % Rabatt", "CHF 470"], ["Unbegrenzte Kilometer", "7 Tage", "CHF 175"], ["Vollkaskoversicherung", "7 Tage", "CHF 154"]] },
        chat: ["«Ich suche ein Auto für eine Ferienwoche.»", "«Welche Kategorie wünschen Sie, und wie viele Kilometer planen Sie?»", "«Möchten Sie die Vollkasko mit reduziertem Selbstbehalt?»"],
        offer: { company: "AlpiRent Location", rows: [["Miete Kompaktwagen — 7 Tage", 470], ["Unbegrenzte Kilometer", 175], ["Vollkaskoversicherung", 154]] },
        roi: "Eine einzige zusätzliche Wochenmiete pro Monat kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "AlpiRent",
        eyebrow: "Genf & Genferseeregion · Fiktives Beispiel",
        hero: { h1: "Das richtige Auto, zum richtigen Preis, sofort.", text: "Kleinwagen, SUV, Lieferwagen und Minibusse pro Tag oder pro Woche — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.7★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "9'800+", lbl: "VERMIETUNGEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir vermieten",
        servicesSub: "Wählen Sie eine Kategorie, oder beschreiben Sie Ihren Bedarf einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🚗", title: "Kleinwagen", text: "Ideal für die Stadt und kurze Strecken.", tag: "ab CHF 59/Tag" },
          { icon: "🚙", title: "Kompakt / Limousine", text: "Komfort und Sparsamkeit unterwegs.", tag: "ab CHF 79/Tag" },
          { icon: "🚐", title: "SUV und Van", text: "Platz für Familie und Gepäck.", tag: "ab CHF 109/Tag" },
          { icon: "🚚", title: "Lieferwagen 12 m³", text: "Zum Zügeln oder Transportieren.", tag: "ab CHF 119/Tag" },
          { icon: "🚌", title: "Minibus 9 Plätze", text: "Für Gruppen und Anlässe.", tag: "ab CHF 149/Tag" },
          { icon: "❄️", title: "Winterausrüstung", text: "Winterreifen und Schneeketten.", tag: "CHF 35" },
        ],
        about: {
          title: "Eine lokale Filiale, eine junge Flotte",
          text: "AlpiRent Location vermietet seit 2007 neuere Fahrzeuge an Privatpersonen und Unternehmen in der Genferseeregion. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Gepflegte Flotte", "Fahrzeuge unter drei Jahren, vor jeder Abfahrt kontrolliert."], ["Klare Versicherung", "reduzierter Selbstbehalt verfügbar, ohne Überraschungen."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "022 000 00 11", email: "hello@alpirent.demo", zone: "Genf, Waadt, Wallis", hours: "Mo–So, 7–20 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrer Miete — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie, was Sie mieten möchten…",
        pdfCompany: { name: "AlpiRent Location", address: "Route de Meyrin 120, 1215 Genève", phone: "022 000 00 11", email: "hello@alpirent.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Miete und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        terms: "Verbindliche Offerte, 30 Tage gültig, vorbehaltlich Verfügbarkeit. Kaution und gültiger Führerausweis bei Abholung erforderlich. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          vehicle: { text: "Welchen Fahrzeugtyp wünschen Sie?", short: "Fahrzeug", opts: { city: "Kleinwagen (5 Türen)", compact: "Kompakt / Limousine", suv: "SUV / Van", van: "Lieferwagen 12 m³", minibus: "Minibus 9 Plätze" } },
          duration: { text: "Für wie lange?", short: "Dauer", opts: { d1: "1 Tag", d3: "2 bis 3 Tage", w1: "1 Woche", w2: "2 Wochen oder mehr" } },
          km: { text: "Wie viele Kilometer planen Sie?", short: "Kilometer", opts: { k100: "100 km pro Tag inbegriffen", k250: "250 km pro Tag", kunl: "Unbegrenzte Kilometer" } },
          options: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { full: "Vollkasko (reduzierter Selbstbehalt)", driver: "Zusatzfahrer", seat: "Kindersitz", gps: "GPS", winter: "Winterausrüstung (Ketten)" } },
          pickup: { text: "Wo möchten Sie das Fahrzeug übernehmen?", short: "Übergabe", opts: { agency: "In der Filiale", delivery: "Lieferung und Rücknahme an der Adresse" } },
          date: { text: "Was ist das Abfahrtsdatum?", short: "Abfahrt" },
        },
        items: {
          rental: "Miete — {days} Tag(e), Dauerrabatt {disc} %",
          rental0: "Miete — {days} Tag(e)",
          km250: "Paket 250 km pro Tag ({days} T.)",
          kmUnl: "Unbegrenzte Kilometer ({days} T.)",
          full: "Vollkaskoversicherung ({days} T.)",
          driver: "Zusatzfahrer",
          seat: "Kindersitz ({days} T.)",
          gps: "GPS ({days} T.)",
          winter: "Winterausrüstung (Ketten)",
          delivery: "Lieferung und Rücknahme an der Adresse",
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
