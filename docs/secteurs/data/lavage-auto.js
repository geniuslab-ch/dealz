/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "lavage-auto",
    icon: "🚗",
    needsAddress: true,
    colors: { main: "#343a40", dark: "#212529", light: "#e9ecef", accent: "#f59f00", accentDark: "#e67700", bg: "#fafafa" },

    quote: {
      minimum: 40,
      questions: [
        { id: "vehicle", type: "single", options: [{ id: "city", k: 1 }, { id: "sedan", k: 1.15 }, { id: "suv", k: 1.35 }, { id: "van", k: 1.6 }, { id: "moto", k: 0.6 }] },
        { id: "pack", type: "single", options: [{ id: "ext", base: 45 }, { id: "full", base: 95 }, { id: "detail", base: 280 }, { id: "polish", base: 690 }] },
        { id: "state", type: "single", options: [{ id: "clean", k: 1 }, { id: "dirty", k: 1.15 }, { id: "filthy", k: 1.35 }] },
        { id: "extras", type: "multi", options: [{ id: "seats" }, { id: "leather" }, { id: "engine" }, { id: "ozone" }, { id: "wheels" }] },
        { id: "place", type: "single", options: [{ id: "shop", fee: 0 }, { id: "home", fee: 45 }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var vk = a.vehicle.k;
        var sk = a.pack.id === "polish" ? Math.min(a.state.k, 1.1) : a.state.k;
        items.push({ label: L("pack_" + a.pack.id), amount: H.round5(a.pack.base * vk * sk) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "seats") items.push({ label: L("seats"), amount: H.round5(90 * vk) });
          if (e.id === "leather") items.push({ label: L("leather"), amount: H.round5(70 * vk) });
          if (e.id === "engine") items.push({ label: L("engine"), amount: 60 });
          if (e.id === "ozone") items.push({ label: L("ozone"), amount: 80 });
          if (e.id === "wheels") items.push({ label: L("wheels"), amount: H.round5(70 * vk) });
        });
        if (a.place.fee) items.push({ label: L("travel"), amount: a.place.fee });
        return items;
      },
    },

    fr: {
      label: "Lavage automobile et detailing",
      forWho: "entreprises de lavage automobile et de detailing",
      pitch: "Chiffrez lavage, detailing et protection selon le véhicule et son état.",
      emailNoun: "le soin de votre véhicule",
      landing: {
        h1: ["VOUS BRILLEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de detailing perdez-vous quand vous avez les mains dans la mousse ?",
        text: "Le client veut savoir combien coûte un polish ou un nettoyage intérieur avant de réserver un créneau. Dealz lui répond à toute heure, pose les bonnes questions (véhicule, état, options), calcule votre prix selon vos tarifs et prépare son devis.",
        clientQ: "Combien pour un detailing complet sur un SUV très sale ?",
        values: [
          { icon: "🚙", title: "Un prix par type de véhicule", text: "Citadine, SUV, utilitaire : vos coefficients s'appliquent automatiquement." },
          { icon: "✨", title: "Des forfaits plus faciles à vendre", text: "Lavage, detailing, polish et céramique : le client voit ce que contient chaque forfait et choisit en connaissance de cause." },
          { icon: "🧽", title: "Options qui font le panier moyen", text: "Sièges, cuir, moteur, ozone, jantes : chaque option est proposée au bon moment." },
          { icon: "📍", title: "Atelier ou à domicile", text: "Le déplacement est facturé selon vos règles, sans calcul manuel." },
        ],
        step1: "Importez vos tarifs : forfaits, coefficients par véhicule, majoration de salissure, options, déplacement. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos types de véhicules, vos niveaux d'état, vos options et vos lieux d'intervention.",
        excel: { file: "tarifs-detailing.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Detailing complet", "SUV · très sale", "CHF 510"], ["Shampoing sièges", "SUV", "CHF 120"], ["Désodorisation ozone", "Forfait", "CHF 80"]] },
        chat: ["« Je voudrais un detailing complet pour mon SUV avant de le revendre. »", "« Dans quel état est-il : propre, sale ou très sale ? »", "« Souhaitez-vous le shampoing des sièges et l'ozone ? »"],
        offer: { company: "Brillance Auto Detailing", rows: [["Detailing complet (SUV)", 510], ["Shampoing sièges", 120], ["Désodorisation à l'ozone", 80]] },
        roi: "Un seul detailing complet supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Brillance Auto",
        eyebrow: "Genève & Genevois · Exemple fictif",
        hero: { h1: "Votre voiture, comme à la livraison.", text: "Lavage, detailing, polish et protection céramique à Genève — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "5 200+", lbl: "VÉHICULES TRAITÉS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous traitons",
        servicesSub: "Choisissez un forfait, ou décrivez simplement votre véhicule dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🚿", title: "Lavage extérieur", text: "Pré-lavage, shampoing, séchage microfibre.", tag: "dès CHF 45" },
          { icon: "🧼", title: "Intérieur + extérieur", text: "Aspiration, plastiques, vitres, carrosserie.", tag: "dès CHF 95" },
          { icon: "✨", title: "Detailing complet", text: "Décontamination, cire, finitions détaillées.", tag: "dès CHF 280" },
          { icon: "💎", title: "Polish + céramique", text: "Correction des micro-rayures et protection longue durée.", tag: "dès CHF 690" },
          { icon: "🪑", title: "Sièges et cuir", text: "Shampoing, nourrissage et protection.", tag: "dès CHF 70" },
          { icon: "🌬️", title: "Ozone", text: "Désodorisation en profondeur de l'habitacle.", tag: "CHF 80" },
        ],
        about: {
          title: "Une équipe passionnée, un atelier propre",
          text: "Brillance Auto Detailing prend soin des véhicules de particuliers, de flottes et de concessionnaires genevois depuis 2015. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Produits professionnels", "shampoings pH neutre, cires et céramiques de qualité."], ["Véhicule assuré", "chaque véhicule confié est couvert pendant l'intervention."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "022 000 00 40", email: "hello@brillance-auto.demo", zone: "Genève et environs", hours: "Lun–Sam, 8h–18h" },
        devisNote: "Répondez à quelques questions sur votre véhicule — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre véhicule et votre besoin…",
        pdfCompany: { name: "Brillance Auto Detailing", address: "Rue des Vieux-Grenadiers 8, 1205 Genève", phone: "022 000 00 40", email: "hello@brillance-auto.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre véhicule, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours. Résultat dépendant de l'état initial de la peinture. TVA suisse incluse le cas échéant.",
        q: {
          vehicle: { text: "Quel type de véhicule ?", short: "Véhicule", opts: { city: "Citadine", sedan: "Berline / break", suv: "SUV / monospace", van: "Utilitaire / grand van", moto: "Moto" } },
          pack: { text: "Quel forfait vous intéresse ?", short: "Forfait", opts: { ext: "Lavage extérieur", full: "Lavage intérieur + extérieur", detail: "Detailing complet (décontamination + cire)", polish: "Polish + protection céramique" } },
          state: { text: "Dans quel état est le véhicule ?", short: "État", opts: { clean: "Plutôt propre", dirty: "Sale", filthy: "Très sale (boue, poils d'animaux…)" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { seats: "Shampoing sièges et moquettes", leather: "Traitement du cuir", engine: "Nettoyage du compartiment moteur", ozone: "Désodorisation à l'ozone", wheels: "Rénovation détaillée des jantes" } },
          place: { text: "Où doit avoir lieu l'intervention ?", short: "Lieu", opts: { shop: "À l'atelier", home: "À domicile / sur votre lieu de travail" } },
          date: { text: "Pour quelle date souhaitez-vous un créneau ?", short: "Date souhaitée" },
        },
        items: {
          pack_ext: "Lavage extérieur",
          pack_full: "Lavage intérieur + extérieur",
          pack_detail: "Detailing complet (décontamination + cire)",
          pack_polish: "Polish carrosserie + protection céramique",
          seats: "Shampoing sièges et moquettes",
          leather: "Traitement du cuir",
          engine: "Nettoyage du compartiment moteur",
          ozone: "Désodorisation à l'ozone",
          wheels: "Rénovation détaillée des jantes",
          travel: "Déplacement à domicile",
        },
      },
    },
    en: {
      label: "Car washing and detailing",
      forWho: "car washing and detailing companies",
      pitch: "Price washing, detailing and protection by vehicle and condition.",
      emailNoun: "caring for your vehicle",
      landing: {
        h1: ["YOU SHINE.", "DEALZ PRICES."],
        question: "How many detailing requests do you lose while your hands are in the suds?",
        text: "Customers want to know what a polish or an interior clean costs before booking a slot. Dealz answers at any hour, asks the right questions (vehicle, condition, options), calculates your price from your rates and prepares their quote.",
        clientQ: "How much for a full detailing on a very dirty SUV?",
        values: [
          { icon: "🚙", title: "A price per vehicle type", text: "City car, SUV, van: your multipliers apply automatically." },
          { icon: "✨", title: "Packages that are easier to sell", text: "Wash, detailing, polish and ceramic: customers see what each package includes and choose knowingly." },
          { icon: "🧽", title: "Options that grow the basket", text: "Seats, leather, engine, ozone, wheels: each option is offered at the right moment." },
          { icon: "📍", title: "Workshop or at home", text: "Travel is charged by your rules, with no manual calculation." },
        ],
        step1: "Import your rates: packages, vehicle multipliers, dirt surcharge, options, travel. Your Excel stays your working tool.",
        step2: "The engine understands your vehicle types, condition levels, options and service locations.",
        excel: { file: "detailing-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Full detailing", "SUV · very dirty", "CHF 510"], ["Seat shampoo", "SUV", "CHF 120"], ["Ozone deodorising", "Flat rate", "CHF 80"]] },
        chat: ["“I'd like a full detailing for my SUV before selling it.”", "“What condition is it in: clean, dirty or very dirty?”", "“Would you like the seat shampoo and the ozone treatment?”"],
        offer: { company: "Brillance Auto Detailing", rows: [["Full detailing (SUV)", 510], ["Seat shampoo", 120], ["Ozone deodorising", 80]] },
        roi: "A single extra full detailing a month can already pay for your subscription.",
      },
      demo: {
        brand: "Brillance Auto",
        eyebrow: "Geneva & surroundings · Fictional example",
        hero: { h1: "Your car, like the day it was delivered.", text: "Washing, detailing, polishing and ceramic protection in Geneva — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "5,200+", lbl: "VEHICLES TREATED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we take care of",
        servicesSub: "Pick a package, or simply describe your vehicle in the “Get a quote” tab.",
        services: [
          { icon: "🚿", title: "Exterior wash", text: "Pre-wash, shampoo, microfibre drying.", tag: "from CHF 45" },
          { icon: "🧼", title: "Interior + exterior", text: "Vacuuming, plastics, windows, bodywork.", tag: "from CHF 95" },
          { icon: "✨", title: "Full detailing", text: "Decontamination, wax, detailed finish.", tag: "from CHF 280" },
          { icon: "💎", title: "Polish + ceramic", text: "Swirl removal and long-lasting protection.", tag: "from CHF 690" },
          { icon: "🪑", title: "Seats and leather", text: "Shampoo, conditioning and protection.", tag: "from CHF 70" },
          { icon: "🌬️", title: "Ozone", text: "Deep deodorising of the cabin.", tag: "CHF 80" },
        ],
        about: {
          title: "A passionate team, a spotless workshop",
          text: "Brillance Auto Detailing has been caring for the vehicles of Geneva households, fleets and dealerships since 2015. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Professional products", "pH-neutral shampoos, quality waxes and ceramics."], ["Vehicle insured", "every vehicle left with us is covered during the work."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "022 000 00 40", email: "hello@brillance-auto.demo", zone: "Geneva and surroundings", hours: "Mon–Sat, 8am–6pm" },
        devisNote: "Answer a few questions about your vehicle — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your vehicle and what you need…",
        pdfCompany: { name: "Brillance Auto Detailing", address: "Rue des Vieux-Grenadiers 8, 1205 Genève", phone: "022 000 00 40", email: "hello@brillance-auto.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your vehicle, then put together a firm quote right away.",
        addressPlaceholder: "Address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days. Results depend on the paintwork's initial condition. Swiss VAT included where applicable.",
        q: {
          vehicle: { text: "What type of vehicle?", short: "Vehicle", opts: { city: "City car", sedan: "Saloon / estate", suv: "SUV / MPV", van: "Van / large van", moto: "Motorbike" } },
          pack: { text: "Which package are you interested in?", short: "Package", opts: { ext: "Exterior wash", full: "Interior + exterior wash", detail: "Full detailing (decontamination + wax)", polish: "Polish + ceramic protection" } },
          state: { text: "What condition is the vehicle in?", short: "Condition", opts: { clean: "Fairly clean", dirty: "Dirty", filthy: "Very dirty (mud, pet hair…)" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { seats: "Seat and carpet shampoo", leather: "Leather treatment", engine: "Engine bay cleaning", ozone: "Ozone deodorising", wheels: "Detailed wheel restoration" } },
          place: { text: "Where should the service take place?", short: "Location", opts: { shop: "At the workshop", home: "At home / at your workplace" } },
          date: { text: "On which date would you like a slot?", short: "Preferred date" },
        },
        items: {
          pack_ext: "Exterior wash",
          pack_full: "Interior + exterior wash",
          pack_detail: "Full detailing (decontamination + wax)",
          pack_polish: "Body polish + ceramic protection",
          seats: "Seat and carpet shampoo",
          leather: "Leather treatment",
          engine: "Engine bay cleaning",
          ozone: "Ozone deodorising",
          wheels: "Detailed wheel restoration",
          travel: "Home visit",
        },
      },
    },
    de: {
      label: "Autowäsche und Fahrzeugaufbereitung",
      forWho: "Autowasch- und Aufbereitungsbetriebe",
      pitch: "Wäsche, Aufbereitung und Versiegelung nach Fahrzeug und Zustand berechnen.",
      emailNoun: "die Pflege Ihres Fahrzeugs",
      landing: {
        h1: ["SIE POLIEREN.", "DEALZ RECHNET."],
        question: "Wie viele Aufbereitungsanfragen verlieren Sie, während Sie die Hände im Schaum haben?",
        text: "Der Kunde will wissen, was eine Politur oder eine Innenreinigung kostet, bevor er einen Termin bucht. Dealz antwortet rund um die Uhr, stellt die richtigen Fragen (Fahrzeug, Zustand, Optionen), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet eine Komplettaufbereitung für einen sehr schmutzigen SUV?",
        values: [
          { icon: "🚙", title: "Ein Preis pro Fahrzeugtyp", text: "Kleinwagen, SUV, Lieferwagen: Ihre Faktoren werden automatisch angewendet." },
          { icon: "✨", title: "Pakete, die sich leichter verkaufen", text: "Wäsche, Aufbereitung, Politur und Keramik: Der Kunde sieht, was jedes Paket enthält, und wählt bewusst." },
          { icon: "🧽", title: "Optionen für den höheren Warenkorb", text: "Sitze, Leder, Motor, Ozon, Felgen: Jede Option wird im richtigen Moment angeboten." },
          { icon: "📍", title: "Werkstatt oder vor Ort", text: "Die Anfahrt wird nach Ihren Regeln verrechnet, ohne manuelle Berechnung." },
        ],
        step1: "Importieren Sie Ihre Tarife: Pakete, Fahrzeugfaktoren, Verschmutzungszuschlag, Optionen, Anfahrt. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Fahrzeugtypen, Zustandsstufen, Optionen und Einsatzorte.",
        excel: { file: "tarife-aufbereitung.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Komplettaufbereitung", "SUV · sehr schmutzig", "CHF 510"], ["Sitzshampoonierung", "SUV", "CHF 120"], ["Ozonbehandlung", "Pauschal", "CHF 80"]] },
        chat: ["«Ich möchte eine Komplettaufbereitung für meinen SUV vor dem Verkauf.»", "«In welchem Zustand ist er: sauber, schmutzig oder sehr schmutzig?»", "«Wünschen Sie die Sitzshampoonierung und die Ozonbehandlung?»"],
        offer: { company: "Brillance Auto Detailing", rows: [["Komplettaufbereitung (SUV)", 510], ["Sitzshampoonierung", 120], ["Ozonbehandlung", 80]] },
        roi: "Eine einzige zusätzliche Komplettaufbereitung pro Monat kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "Brillance Auto",
        eyebrow: "Genf & Umgebung · Fiktives Beispiel",
        hero: { h1: "Ihr Auto, wie am Tag der Auslieferung.", text: "Wäsche, Aufbereitung, Politur und Keramikversiegelung in Genf — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "5'200+", lbl: "AUFBEREITETE FAHRZEUGE" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir pflegen",
        servicesSub: "Wählen Sie ein Paket, oder beschreiben Sie Ihr Fahrzeug einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🚿", title: "Aussenwäsche", text: "Vorwäsche, Shampoo, Trocknung mit Mikrofaser.", tag: "ab CHF 45" },
          { icon: "🧼", title: "Innen + aussen", text: "Staubsaugen, Kunststoffe, Scheiben, Karosserie.", tag: "ab CHF 95" },
          { icon: "✨", title: "Komplettaufbereitung", text: "Dekontamination, Wachs, detailliertes Finish.", tag: "ab CHF 280" },
          { icon: "💎", title: "Politur + Keramik", text: "Entfernung feiner Kratzer und Langzeitschutz.", tag: "ab CHF 690" },
          { icon: "🪑", title: "Sitze und Leder", text: "Shampoonieren, Pflegen und Schützen.", tag: "ab CHF 70" },
          { icon: "🌬️", title: "Ozon", text: "Gründliche Geruchsentfernung im Innenraum.", tag: "CHF 80" },
        ],
        about: {
          title: "Ein leidenschaftliches Team, eine saubere Werkstatt",
          text: "Brillance Auto Detailing pflegt seit 2015 die Fahrzeuge von Genfer Privatpersonen, Flotten und Garagen. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Profi-Produkte", "pH-neutrale Shampoos, hochwertige Wachse und Keramik."], ["Fahrzeug versichert", "jedes anvertraute Fahrzeug ist während der Arbeiten versichert."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "022 000 00 40", email: "hello@brillance-auto.demo", zone: "Genf und Umgebung", hours: "Mo–Sa, 8–18 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Fahrzeug — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Fahrzeug und Ihren Bedarf…",
        pdfCompany: { name: "Brillance Auto Detailing", address: "Rue des Vieux-Grenadiers 8, 1205 Genève", phone: "022 000 00 40", email: "hello@brillance-auto.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Fahrzeug und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig. Ergebnis abhängig vom Ausgangszustand des Lacks. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          vehicle: { text: "Welcher Fahrzeugtyp?", short: "Fahrzeug", opts: { city: "Kleinwagen", sedan: "Limousine / Kombi", suv: "SUV / Van", van: "Lieferwagen / grosser Van", moto: "Motorrad" } },
          pack: { text: "Welches Paket interessiert Sie?", short: "Paket", opts: { ext: "Aussenwäsche", full: "Innen- + Aussenwäsche", detail: "Komplettaufbereitung (Dekontamination + Wachs)", polish: "Politur + Keramikversiegelung" } },
          state: { text: "In welchem Zustand ist das Fahrzeug?", short: "Zustand", opts: { clean: "Eher sauber", dirty: "Schmutzig", filthy: "Sehr schmutzig (Schlamm, Tierhaare…)" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { seats: "Shampoonierung von Sitzen und Teppichen", leather: "Lederpflege", engine: "Motorraumreinigung", ozone: "Ozonbehandlung", wheels: "Detaillierte Felgenaufbereitung" } },
          place: { text: "Wo soll der Einsatz stattfinden?", short: "Ort", opts: { shop: "In der Werkstatt", home: "Zu Hause / am Arbeitsplatz" } },
          date: { text: "An welchem Datum wünschen Sie einen Termin?", short: "Wunschtermin" },
        },
        items: {
          pack_ext: "Aussenwäsche",
          pack_full: "Innen- + Aussenwäsche",
          pack_detail: "Komplettaufbereitung (Dekontamination + Wachs)",
          pack_polish: "Karosseriepolitur + Keramikversiegelung",
          seats: "Shampoonierung von Sitzen und Teppichen",
          leather: "Lederpflege",
          engine: "Motorraumreinigung",
          ozone: "Ozonbehandlung",
          wheels: "Detaillierte Felgenaufbereitung",
          travel: "Anfahrt zu Ihnen",
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
