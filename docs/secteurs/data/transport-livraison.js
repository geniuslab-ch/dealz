/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "transport-livraison",
    icon: "🚐",
    needsAddress: true,
    colors: { main: "#364fc7", dark: "#2b3a9f", light: "#dbe4ff", accent: "#fab005", accentDark: "#e67700", bg: "#fbfcff" },

    quote: {
      minimum: 90,
      questions: [
        { id: "kind", type: "single", options: [{ id: "parcel" }, { id: "furniture" }, { id: "pro" }, { id: "urgent" }] },
        { id: "volume", type: "single", options: [{ id: "xs", v: 0.7, rate: 1.4, size: "< 1" }, { id: "s", v: 2, rate: 1.7, size: "1–3" }, { id: "m", v: 6, rate: 2.2, size: "3–10" }, { id: "l", v: 15, rate: 2.8, size: "10–20" }] },
        { id: "distance", type: "single", options: [{ id: "local", km: 12 }, { id: "reg", km: 60 }, { id: "nat", km: 200 }, { id: "far", km: 400 }] },
        { id: "access", type: "single", options: [{ id: "ground", fee: 0 }, { id: "stairs", fee: 40 }] },
        { id: "extras", type: "multi", options: [{ id: "carry" }, { id: "assemble" }, { id: "take" }, { id: "insure" }] },
        { id: "date", type: "date", minDays: 1 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var v = a.volume, km = a.distance.km;
        var transport = H.round5(65 + km * v.rate + v.v * 22);
        items.push({ label: L("transport", { size: v.size, km: km }), amount: transport });
        if (a.kind.id === "urgent") items.push({ label: L("urgent"), amount: H.round5(transport * 0.6) });
        if (a.kind.id === "furniture") items.push({ label: L("handling"), amount: H.round5(transport * 0.15) });
        if (a.access.fee) items.push({ label: L("stairs"), amount: H.round5(a.access.fee + v.v * 10) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "carry") items.push({ label: L("carry"), amount: 70 });
          if (e.id === "assemble") items.push({ label: L("assemble"), amount: 90 });
          if (e.id === "take") items.push({ label: L("take"), amount: 60 });
          if (e.id === "insure") items.push({ label: L("insure"), amount: 45 });
        });
        return items;
      },
    },

    fr: {
      label: "Transport et livraison",
      forWho: "entreprises de transport et de livraison",
      pitch: "Chiffrez volume, distance et accès sans passer par le téléphone.",
      emailNoun: "votre transport",
      landing: {
        h1: ["VOUS ROULEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de transport perdez-vous parce que vos chauffeurs sont sur la route ?",
        text: "Un particulier ou une PME cherche un transporteur et appelle trois entreprises. Dealz répond tout de suite, pose les bonnes questions (marchandise, volume, distance, accès), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour livrer 3 m³ de meubles de Lausanne à Berne ?",
        values: [
          { icon: "📍", title: "Un prix selon la distance", text: "Trajet local, régional ou national : vos tarifs au kilomètre et vos forfaits s'appliquent automatiquement." },
          { icon: "📦", title: "Volume et accès qualifiés", text: "Vous recevez des demandes avec le volume, l'étage et les contraintes d'accès déjà renseignés." },
          { icon: "⚡", title: "Courses urgentes chiffrées", text: "Votre majoration pour course dédiée est appliquée sans négociation." },
          { icon: "🛡️", title: "Options qui font la marge", text: "Portage, montage, reprise de l'ancien appareil, assurance valeur déclarée : tout est proposé d'emblée." },
        ],
        step1: "Importez vos tarifs : forfaits de prise en charge, tarif au km par véhicule, majoration urgente, portage, assurance. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos volumes, vos distances, vos types de marchandises et vos options.",
        excel: { file: "tarifs-transport.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Transport 3–10 m³", "200 km", "CHF 640"], ["Supplément étage", "Sans ascenseur", "CHF 100"], ["Assurance valeur déclarée", "Forfait", "CHF 45"]] },
        chat: ["« Je dois faire livrer des meubles de Lausanne à Berne. »", "« Quel volume et quelle distance, et y a-t-il un ascenseur ? »", "« Souhaitez-vous le portage et une assurance valeur déclarée ? »"],
        offer: { company: "Rapido Transport Sàrl", rows: [["Transport 3–10 m³ — 200 km", 640], ["Supplément étage sans ascenseur", 100], ["Assurance valeur déclarée", 45]] },
        roi: "Une seule course supplémentaire par semaine peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Rapido Transport",
        eyebrow: "Berne & Suisse romande · Exemple fictif",
        hero: { h1: "Livré où vous voulez, quand vous voulez.", text: "Transport de colis, de meubles et de marchandises professionnelles, avec courses urgentes — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.7★", lbl: "SATISFACTION CLIENT" }, { num: "18 000+", lbl: "LIVRAISONS" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous transportons",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre besoin dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "📦", title: "Colis et palettes", text: "Prise en charge et livraison rapide.", tag: "dès CHF 90" },
          { icon: "🛋️", title: "Meubles et électroménager", text: "Manutention soignée, portage possible.", tag: "dès CHF 110" },
          { icon: "🏭", title: "Marchandises professionnelles", text: "Livraisons ponctuelles ou récurrentes.", tag: "sur devis" },
          { icon: "⚡", title: "Course urgente", text: "Véhicule dédié, départ immédiat.", tag: "+60 %" },
          { icon: "🔧", title: "Montage et branchement", text: "Mise en service chez le client.", tag: "CHF 90" },
          { icon: "🛡️", title: "Assurance valeur déclarée", text: "Marchandise couverte jusqu'à la valeur indiquée.", tag: "CHF 45" },
        ],
        about: {
          title: "Une flotte locale, des chauffeurs qui connaissent la route",
          text: "Rapido Transport livre particuliers et entreprises en Suisse romande et dans le canton de Berne depuis 2010. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Véhicules suivis", "suivi de livraison et créneau annoncé à l'avance."], ["Chauffeurs formés", "manutention soignée, ponctualité."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "031 000 00 80", email: "hello@rapido-transport.demo", zone: "Suisse romande, Berne, Fribourg", hours: "Lun–Sam, 6h–19h" },
        devisNote: "Répondez à quelques questions sur votre transport — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre transport…",
        pdfCompany: { name: "Rapido Transport Sàrl", address: "Wankdorffeldstrasse 40, 3014 Berne", phone: "031 000 00 80", email: "hello@rapido-transport.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre transport, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse de chargement (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, pour le volume et le trajet indiqués. TVA suisse incluse le cas échéant.",
        q: {
          kind: { text: "Que souhaitez-vous faire transporter ?", short: "Marchandise", opts: { parcel: "Colis / palettes", furniture: "Meubles et électroménager", pro: "Marchandises professionnelles", urgent: "Transport urgent (véhicule dédié)" } },
          volume: { text: "Quel est le volume approximatif ?", short: "Volume", opts: { xs: "Moins de 1 m³", s: "1 à 3 m³", m: "3 à 10 m³", l: "Camion complet (10 à 20 m³)" } },
          distance: { text: "Quelle est la distance du trajet ?", short: "Distance", opts: { local: "Moins de 20 km", reg: "20 à 100 km", nat: "100 à 300 km", far: "Plus de 300 km" } },
          access: { text: "Comment se présente l'accès au point de chargement ?", short: "Accès", opts: { ground: "Rez-de-chaussée ou quai de chargement", stairs: "Étage sans ascenseur" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { carry: "Portage jusqu'à l'étage", assemble: "Montage / branchement", take: "Reprise de l'ancien appareil", insure: "Assurance valeur déclarée" } },
          date: { text: "Pour quelle date souhaitez-vous le transport ?", short: "Date souhaitée" },
        },
        items: {
          transport: "Transport {size} m³ — {km} km",
          urgent: "Supplément course urgente (véhicule dédié)",
          handling: "Manutention meubles et électroménager",
          stairs: "Supplément étage sans ascenseur",
          carry: "Portage jusqu'à l'étage",
          assemble: "Montage / branchement",
          take: "Reprise de l'ancien appareil",
          insure: "Assurance valeur déclarée",
        },
      },
    },
    en: {
      label: "Transport and delivery",
      forWho: "transport and delivery companies",
      pitch: "Price volume, distance and access without picking up the phone.",
      emailNoun: "your transport",
      landing: {
        h1: ["YOU DRIVE.", "DEALZ PRICES."],
        question: "How many transport requests do you lose because your drivers are on the road?",
        text: "A private customer or a small business needs a carrier and calls three companies. Dealz answers right away, asks the right questions (goods, volume, distance, access), calculates your price from your rates and prepares the quote.",
        clientQ: "How much to deliver 3 m³ of furniture from Lausanne to Bern?",
        values: [
          { icon: "📍", title: "A price by distance", text: "Local, regional or national trip: your per-km rates and packages apply automatically." },
          { icon: "📦", title: "Volume and access qualified", text: "You receive requests with the volume, floor and access constraints already filled in." },
          { icon: "⚡", title: "Urgent runs priced", text: "Your dedicated-vehicle surcharge applies without any haggling." },
          { icon: "🛡️", title: "Options that make the margin", text: "Carrying, assembly, taking back the old appliance, declared-value insurance: all offered upfront." },
        ],
        step1: "Import your rates: pick-up packages, per-km rate by vehicle, urgent surcharge, carrying, insurance. Your Excel stays your working tool.",
        step2: "The engine understands your volumes, distances, types of goods and options.",
        excel: { file: "transport-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Transport 3–10 m³", "200 km", "CHF 640"], ["Floor surcharge", "No lift", "CHF 100"], ["Declared-value insurance", "Flat rate", "CHF 45"]] },
        chat: ["“I need furniture delivered from Lausanne to Bern.”", "“What volume and distance, and is there a lift?”", "“Would you like carrying and declared-value insurance?”"],
        offer: { company: "Rapido Transport Sàrl", rows: [["Transport 3–10 m³ — 200 km", 640], ["Floor surcharge, no lift", 100], ["Declared-value insurance", 45]] },
        roi: "A single extra run a week can already pay for your subscription.",
      },
      demo: {
        brand: "Rapido Transport",
        eyebrow: "Bern & French-speaking Switzerland · Fictional example",
        hero: { h1: "Delivered where you want, when you want.", text: "Parcels, furniture and business goods, with urgent runs — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.7★", lbl: "CUSTOMER SATISFACTION" }, { num: "18,000+", lbl: "DELIVERIES" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we carry",
        servicesSub: "Pick a service, or simply describe what you need in the “Get a quote” tab.",
        services: [
          { icon: "📦", title: "Parcels and pallets", text: "Fast pick-up and delivery.", tag: "from CHF 90" },
          { icon: "🛋️", title: "Furniture and appliances", text: "Careful handling, carrying available.", tag: "from CHF 110" },
          { icon: "🏭", title: "Business goods", text: "One-off or recurring deliveries.", tag: "on quote" },
          { icon: "⚡", title: "Urgent run", text: "Dedicated vehicle, immediate departure.", tag: "+60%" },
          { icon: "🔧", title: "Assembly and connection", text: "Set up at the customer's.", tag: "CHF 90" },
          { icon: "🛡️", title: "Declared-value insurance", text: "Goods covered up to the stated value.", tag: "CHF 45" },
        ],
        about: {
          title: "A local fleet, drivers who know the roads",
          text: "Rapido Transport has been delivering for households and businesses in French-speaking Switzerland and the canton of Bern since 2010. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Tracked vehicles", "delivery tracking and a time slot announced in advance."], ["Trained drivers", "careful handling, punctuality."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "031 000 00 80", email: "hello@rapido-transport.demo", zone: "French-speaking Switzerland, Bern, Fribourg", hours: "Mon–Sat, 6am–7pm" },
        devisNote: "Answer a few questions about your transport — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your transport…",
        pdfCompany: { name: "Rapido Transport Sàrl", address: "Wankdorffeldstrasse 40, 3014 Berne", phone: "031 000 00 80", email: "hello@rapido-transport.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your transport, then put together a firm quote right away.",
        addressPlaceholder: "Loading address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, for the volume and route given. Swiss VAT included where applicable.",
        q: {
          kind: { text: "What would you like transported?", short: "Goods", opts: { parcel: "Parcels / pallets", furniture: "Furniture and appliances", pro: "Business goods", urgent: "Urgent transport (dedicated vehicle)" } },
          volume: { text: "Roughly what volume?", short: "Volume", opts: { xs: "Under 1 m³", s: "1 to 3 m³", m: "3 to 10 m³", l: "Full truck (10 to 20 m³)" } },
          distance: { text: "How long is the trip?", short: "Distance", opts: { local: "Under 20 km", reg: "20 to 100 km", nat: "100 to 300 km", far: "Over 300 km" } },
          access: { text: "What's the access like at the loading point?", short: "Access", opts: { ground: "Ground floor or loading bay", stairs: "Upper floor without lift" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { carry: "Carrying up to the floor", assemble: "Assembly / connection", take: "Taking back the old appliance", insure: "Declared-value insurance" } },
          date: { text: "On which date would you like the transport?", short: "Preferred date" },
        },
        items: {
          transport: "Transport {size} m³ — {km} km",
          urgent: "Urgent run surcharge (dedicated vehicle)",
          handling: "Furniture and appliance handling",
          stairs: "Floor surcharge without lift",
          carry: "Carrying up to the floor",
          assemble: "Assembly / connection",
          take: "Taking back the old appliance",
          insure: "Declared-value insurance",
        },
      },
    },
    de: {
      label: "Transport und Lieferung",
      forWho: "Transport- und Lieferunternehmen",
      pitch: "Volumen, Distanz und Zugang berechnen — ohne Telefon.",
      emailNoun: "Ihren Transport",
      landing: {
        h1: ["SIE FAHREN.", "DEALZ RECHNET."],
        question: "Wie viele Transportanfragen verlieren Sie, weil Ihre Fahrer unterwegs sind?",
        text: "Eine Privatperson oder ein KMU sucht einen Transporteur und ruft drei Firmen an. Dealz antwortet sofort, stellt die richtigen Fragen (Ware, Volumen, Distanz, Zugang), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet die Lieferung von 3 m³ Möbeln von Lausanne nach Bern?",
        values: [
          { icon: "📍", title: "Ein Preis nach Distanz", text: "Lokale, regionale oder nationale Fahrt: Ihre Kilometertarife und Pauschalen werden automatisch angewendet." },
          { icon: "📦", title: "Volumen und Zugang qualifiziert", text: "Sie erhalten Anfragen mit Volumen, Stockwerk und Zugangsbedingungen bereits ausgefüllt." },
          { icon: "⚡", title: "Eilfahrten berechnet", text: "Ihr Zuschlag für ein dediziertes Fahrzeug wird ohne Verhandlung angewendet." },
          { icon: "🛡️", title: "Optionen, die Marge bringen", text: "Tragen, Montage, Rücknahme des Altgeräts, Wertversicherung: alles wird direkt angeboten." },
        ],
        step1: "Importieren Sie Ihre Tarife: Abholpauschalen, Kilometertarif pro Fahrzeug, Eilzuschlag, Tragen, Versicherung. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Volumen, Distanzen, Warenarten und Optionen.",
        excel: { file: "tarife-transport.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Transport 3–10 m³", "200 km", "CHF 640"], ["Stockwerkzuschlag", "Ohne Lift", "CHF 100"], ["Wertversicherung", "Pauschal", "CHF 45"]] },
        chat: ["«Ich muss Möbel von Lausanne nach Bern liefern lassen.»", "«Welches Volumen, welche Distanz, und gibt es einen Lift?»", "«Wünschen Sie das Tragen und eine Wertversicherung?»"],
        offer: { company: "Rapido Transport Sàrl", rows: [["Transport 3–10 m³ — 200 km", 640], ["Stockwerkzuschlag ohne Lift", 100], ["Wertversicherung", 45]] },
        roi: "Eine einzige zusätzliche Fahrt pro Woche kann Ihr Abo bereits bezahlen.",
      },
      demo: {
        brand: "Rapido Transport",
        eyebrow: "Bern & Westschweiz · Fiktives Beispiel",
        hero: { h1: "Geliefert, wohin Sie wollen, wann Sie wollen.", text: "Pakete, Möbel und Geschäftsware, mit Eilfahrten — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.7★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "18'000+", lbl: "LIEFERUNGEN" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir transportieren",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihren Bedarf einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "📦", title: "Pakete und Paletten", text: "Schnelle Abholung und Lieferung.", tag: "ab CHF 90" },
          { icon: "🛋️", title: "Möbel und Haushaltgeräte", text: "Sorgfältiger Umgang, Tragen möglich.", tag: "ab CHF 110" },
          { icon: "🏭", title: "Geschäftsware", text: "Einmalige oder regelmässige Lieferungen.", tag: "auf Offerte" },
          { icon: "⚡", title: "Eilfahrt", text: "Dediziertes Fahrzeug, sofortige Abfahrt.", tag: "+60 %" },
          { icon: "🔧", title: "Montage und Anschluss", text: "Inbetriebnahme beim Kunden.", tag: "CHF 90" },
          { icon: "🛡️", title: "Wertversicherung", text: "Ware bis zum angegebenen Wert versichert.", tag: "CHF 45" },
        ],
        about: {
          title: "Eine lokale Flotte, Fahrer, die die Strassen kennen",
          text: "Rapido Transport beliefert seit 2010 Privatpersonen und Unternehmen in der Westschweiz und im Kanton Bern. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Verfolgte Fahrzeuge", "Sendungsverfolgung und angekündigtes Zeitfenster."], ["Geschulte Fahrer", "sorgfältiger Umgang, Pünktlichkeit."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "031 000 00 80", email: "hello@rapido-transport.demo", zone: "Westschweiz, Bern, Freiburg", hours: "Mo–Sa, 6–19 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Transport — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihren Transport…",
        pdfCompany: { name: "Rapido Transport Sàrl", address: "Wankdorffeldstrasse 40, 3014 Berne", phone: "031 000 00 80", email: "hello@rapido-transport.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Transport und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Ladeadresse (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, für das angegebene Volumen und die angegebene Strecke. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          kind: { text: "Was möchten Sie transportieren lassen?", short: "Ware", opts: { parcel: "Pakete / Paletten", furniture: "Möbel und Haushaltgeräte", pro: "Geschäftsware", urgent: "Eiltransport (dediziertes Fahrzeug)" } },
          volume: { text: "Wie gross ist das Volumen ungefähr?", short: "Volumen", opts: { xs: "Unter 1 m³", s: "1 bis 3 m³", m: "3 bis 10 m³", l: "Ganzer Lastwagen (10 bis 20 m³)" } },
          distance: { text: "Wie lang ist die Strecke?", short: "Distanz", opts: { local: "Unter 20 km", reg: "20 bis 100 km", nat: "100 bis 300 km", far: "Über 300 km" } },
          access: { text: "Wie ist der Zugang am Ladeort?", short: "Zugang", opts: { ground: "Erdgeschoss oder Laderampe", stairs: "Obergeschoss ohne Lift" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { carry: "Tragen bis ins Stockwerk", assemble: "Montage / Anschluss", take: "Rücknahme des Altgeräts", insure: "Wertversicherung" } },
          date: { text: "An welchem Datum wünschen Sie den Transport?", short: "Wunschtermin" },
        },
        items: {
          transport: "Transport {size} m³ — {km} km",
          urgent: "Zuschlag Eilfahrt (dediziertes Fahrzeug)",
          handling: "Umgang mit Möbeln und Haushaltgeräten",
          stairs: "Stockwerkzuschlag ohne Lift",
          carry: "Tragen bis ins Stockwerk",
          assemble: "Montage / Anschluss",
          take: "Rücknahme des Altgeräts",
          insure: "Wertversicherung",
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
