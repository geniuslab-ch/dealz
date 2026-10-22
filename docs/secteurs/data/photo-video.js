/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "photo-video",
    icon: "📸",
    needsAddress: true,
    colors: { main: "#d6336c", dark: "#a61e4d", light: "#ffdeeb", accent: "#fd7e14", accentDark: "#e8590c", bg: "#fffafc" },

    quote: {
      minimum: 250,
      questions: [
        { id: "shoot", type: "single", options: [{ id: "wedding", rate: 190 }, { id: "portrait", rate: 150 }, { id: "corporate", rate: 170 }, { id: "realestate", rate: 120 }, { id: "product", rate: 140 }, { id: "video", rate: 220 }] },
        { id: "duration", type: "single", options: [{ id: "h2", h: 2 }, { id: "h4", h: 4 }, { id: "h8", h: 8 }] },
        { id: "extras", type: "multi", options: [{ id: "video" }, { id: "drone" }, { id: "album" }, { id: "second" }, { id: "licence" }] },
        { id: "place", type: "single", options: [{ id: "studio", fee: 0 }, { id: "local", fee: 80 }, { id: "far", fee: 220 }] },
        { id: "speed", type: "single", options: [{ id: "std", k: 0 }, { id: "fast", k: 0.3 }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var h = a.duration.h;
        var base = H.round5(a.shoot.rate * h);
        items.push({ label: L("shoot_" + a.shoot.id, { h: h }), amount: base });
        items.push({ label: L("retouch"), amount: H.round5(base * 0.25) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "video") items.push({ label: L("video"), amount: 690 });
          if (e.id === "drone") items.push({ label: L("drone"), amount: 380 });
          if (e.id === "album") items.push({ label: L("album"), amount: 290 });
          if (e.id === "second") items.push({ label: L("second", { h: h }), amount: H.round5(70 * h) });
          if (e.id === "licence") items.push({ label: L("licence"), amount: 240 });
        });
        if (a.place.fee) items.push({ label: L("travel"), amount: a.place.fee });
        if (a.speed.k) items.push({ label: L("fast"), amount: H.round5(base * a.speed.k) });
        return items;
      },
    },

    fr: {
      label: "Photographie et vidéographie",
      forWho: "photographes et vidéastes",
      pitch: "Chiffrez séance, durée, livrables et déplacement avant le premier appel.",
      emailNoun: "votre séance",
      landing: {
        h1: ["VOUS CAPTUREZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de séance perdez-vous parce que vous étiez en tournage ?",
        text: "Un couple compare trois photographes un dimanche soir et écrit au premier qui répond avec un prix. Dealz répond tout de suite, pose les bonnes questions (type de séance, durée, livrables, lieu), calcule votre prix selon vos tarifs et prépare le devis.",
        clientQ: "Combien pour un mariage en journée avec vidéo et drone ?",
        values: [
          { icon: "💍", title: "Un prix avant l'appel de découverte", text: "Les clients sérieux arrivent avec une demande déjà chiffrée, vos rendez-vous sont mieux qualifiés." },
          { icon: "🎞️", title: "Livrables et options clairs", text: "Vidéo, drone, album, second photographe : chaque option est expliquée et ajoutée au devis en un clic." },
          { icon: "📍", title: "Déplacements intégrés", text: "Studio, canton ou hors canton : vos frais de déplacement s'appliquent automatiquement." },
          { icon: "⏳", title: "Délais de livraison valorisés", text: "Livraison standard ou express : la rapidité devient une option facturée, pas une faveur." },
        ],
        step1: "Importez vos tarifs : taux par type de séance, durées, livrables, déplacements, express. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos séances, vos durées, vos livrables et vos règles de déplacement.",
        excel: { file: "tarifs-photo-video.xlsx", headers: ["Service", "Condition", "Prix"], rows: [["Mariage", "Journée (8 h)", "CHF 1 520"], ["Vidéo highlights", "2–3 min", "CHF 690"], ["Drone", "Forfait", "CHF 380"]] },
        chat: ["« Nous nous marions en septembre et cherchons un photographe. »", "« Souhaitez-vous une demi-journée ou une journée complète ? »", "« Une vidéo highlights et des images de drone vous intéressent-elles ? »"],
        offer: { company: "Studio Lumière Visuel", rows: [["Mariage — journée (8 h)", 1520], ["Vidéo highlights (2–3 min)", 690], ["Prises de vues par drone", 380]] },
        roi: "Une seule séance supplémentaire par mois peut déjà payer votre abonnement.",
      },
      demo: {
        brand: "Studio Lumière",
        eyebrow: "Lausanne & Vaud · Exemple fictif",
        hero: { h1: "Vos plus beaux moments, bien racontés.", text: "Mariages, portraits, événements, immobilier et vidéo en Suisse romande — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "5.0★", lbl: "SATISFACTION CLIENT" }, { num: "420+", lbl: "SÉANCES RÉALISÉES" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Ce que nous photographions",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "💍", title: "Mariage", text: "Reportage photo et vidéo, de la préparation à la soirée.", tag: "dès CHF 190/h" },
          { icon: "👨‍👩‍👧", title: "Portrait et famille", text: "En studio ou en extérieur.", tag: "dès CHF 150/h" },
          { icon: "🏢", title: "Entreprise", text: "Événements, équipes et reportages corporate.", tag: "dès CHF 170/h" },
          { icon: "🏠", title: "Immobilier", text: "Photos et visites pour vos annonces.", tag: "dès CHF 120/h" },
          { icon: "📦", title: "Produit", text: "Packshots et mises en scène pour e-commerce.", tag: "dès CHF 140/h" },
          { icon: "🎬", title: "Vidéo promotionnelle", text: "Tournage, montage et étalonnage.", tag: "dès CHF 220/h" },
        ],
        about: {
          title: "Un regard, une équipe, des livrables soignés",
          text: "Studio Lumière Visuel photographie et filme particuliers et entreprises en Suisse romande depuis 2013. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Retouche incluse", "chaque image sélectionnée est retouchée à la main."], ["Galerie privée", "livraison en ligne, téléchargement en haute définition."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 00 70", email: "hello@studio-lumiere.demo", zone: "Vaud, Genève, Valais, Fribourg", hours: "Lun–Sam, sur rendez-vous" },
        devisNote: "Répondez à quelques questions sur votre projet — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet de séance…",
        pdfCompany: { name: "Studio Lumière Visuel", address: "Rue Saint-Laurent 20, 1003 Lausanne", phone: "021 000 00 70", email: "hello@studio-lumiere.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre projet, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Lieu de la séance (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, sous réserve de disponibilité à la date indiquée. Acompte de 30 % à la réservation. TVA suisse incluse le cas échéant.",
        q: {
          shoot: { text: "Quel type de séance souhaitez-vous ?", short: "Séance", opts: { wedding: "Mariage", portrait: "Portraits / famille", corporate: "Événement ou reportage d'entreprise", realestate: "Immobilier", product: "Produits / e-commerce", video: "Vidéo promotionnelle" } },
          duration: { text: "Quelle durée de prestation prévoyez-vous ?", short: "Durée", opts: { h2: "2 heures", h4: "Demi-journée (4 heures)", h8: "Journée (8 heures)" } },
          extras: { text: "Souhaitez-vous des livrables en plus ?", short: "Options", none: "Aucune option", opts: { video: "Vidéo highlights (2–3 min)", drone: "Prises de vues par drone", album: "Album photo (30 pages)", second: "Second photographe", licence: "Licence d'usage commercial étendue" } },
          place: { text: "Où a lieu la séance ?", short: "Lieu", opts: { studio: "Dans notre studio", local: "Chez vous, dans le canton", far: "Hors canton (déplacement)" } },
          speed: { text: "Quel délai de livraison souhaitez-vous ?", short: "Livraison", opts: { std: "Standard (3 semaines)", fast: "Express (5 jours)" } },
          date: { text: "Quelle est la date de la séance ?", short: "Date de la séance" },
        },
        items: {
          shoot_wedding: "Reportage de mariage ({h} h)",
          shoot_portrait: "Séance portraits / famille ({h} h)",
          shoot_corporate: "Reportage d'entreprise ({h} h)",
          shoot_realestate: "Photographie immobilière ({h} h)",
          shoot_product: "Photographie produit ({h} h)",
          shoot_video: "Tournage vidéo promotionnelle ({h} h)",
          retouch: "Sélection et retouche des images",
          video: "Vidéo highlights (2-3 min)",
          drone: "Prises de vues par drone",
          album: "Album photo (30 pages)",
          second: "Second photographe ({h} h)",
          licence: "Licence d'usage commercial étendue",
          travel: "Frais de déplacement",
          fast: "Livraison express (5 jours)",
        },
      },
    },

    // ---- English texts ----
    en: {
      label: "Photography & Video",
      forWho: "photographers and videographers",
      pitch: "Price shoots, duration, deliverables and travel before the first call.",
      emailNoun: "your shoot",
      landing: {
        h1: ["YOU CAPTURE.", "DEALZ PRICES IT."],
        question: "How many shoot requests are you losing because you were filming?",
        text: "A couple compares three photographers on a Sunday evening and messages the first one to reply with a price. Dealz replies right away, asks the right questions (type of shoot, duration, deliverables, location), calculates your price from your own rates and prepares the quote.",
        clientQ: "How much for a full-day wedding with video and drone?",
        values: [
          { icon: "💍", title: "A price before the discovery call", text: "Serious clients arrive with a request that's already priced, so your meetings are better qualified." },
          { icon: "🎞️", title: "Clear deliverables and options", text: "Video, drone, album, second photographer: every option is explained and added to the quote in one click." },
          { icon: "📍", title: "Travel built in", text: "Studio, in-canton or out-of-canton: your travel fees apply automatically." },
          { icon: "⏳", title: "Delivery times with real value", text: "Standard or express delivery: speed becomes a priced option, not a favour." },
        ],
        step1: "Import your rates: rate per shoot type, durations, deliverables, travel, express. Your Excel sheet stays your working tool.",
        step2: "The engine understands your shoots, durations, deliverables and travel rules.",
        excel: { file: "photo-video-rates.xlsx", headers: ["Service", "Condition", "Price"], rows: [["Wedding", "Full day (8 h)", "CHF 1,520"], ["Highlights video", "2–3 min", "CHF 690"], ["Drone", "Flat fee", "CHF 380"]] },
        chat: ["\"We're getting married in September and are looking for a photographer.\"", "\"Would you like a half-day or a full day?\"", "\"Are you interested in a highlights video and drone footage?\""],
        offer: { company: "Studio Lumière Visuel", rows: [["Wedding — full day (8 h)", 1520], ["Highlights video (2–3 min)", 690], ["Drone footage", 380]] },
        roi: "Just one extra shoot per month can already cover your subscription.",
      },
      demo: {
        brand: "Studio Lumière",
        eyebrow: "Lausanne & Vaud · Fictional example",
        hero: { h1: "Your best moments, beautifully told.", text: "Weddings, portraits, events, real estate and video across French-speaking Switzerland — get a firm price in seconds, right on this site." },
        stats: [{ num: "5.0★", lbl: "CUSTOMER SATISFACTION" }, { num: "420+", lbl: "SHOOTS COMPLETED" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "What we shoot",
        servicesSub: "Choose a service, or simply describe your project in the \"Get a quote\" tab.",
        services: [
          { icon: "💍", title: "Wedding", text: "Photo and video coverage, from getting ready to the party.", tag: "from CHF 190/h" },
          { icon: "👨‍👩‍👧", title: "Portrait and family", text: "In studio or outdoors.", tag: "from CHF 150/h" },
          { icon: "🏢", title: "Corporate", text: "Events, teams and corporate coverage.", tag: "from CHF 170/h" },
          { icon: "🏠", title: "Real estate", text: "Photos and walkthroughs for your listings.", tag: "from CHF 120/h" },
          { icon: "📦", title: "Product", text: "Packshots and staged shots for e-commerce.", tag: "from CHF 140/h" },
          { icon: "🎬", title: "Promotional video", text: "Filming, editing and colour grading.", tag: "from CHF 220/h" },
        ],
        about: {
          title: "One eye, one team, careful deliverables",
          text: "Studio Lumière Visuel has photographed and filmed individuals and businesses across French-speaking Switzerland since 2013. In 2026, we added an instant quote assistant to our site — faster for you, less admin for us.",
          bullets: [["Retouching included", "every selected image is retouched by hand."], ["Private gallery", "online delivery, high-resolution downloads."], ["Transparent price", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 00 70", email: "hello@studio-lumiere.demo", zone: "Vaud, Geneva, Valais, Fribourg", hours: "Mon–Sat, by appointment" },
        devisNote: "Answer a few questions about your project — you'll receive a real quote, which you can accept or decline right here.",
        inputPlaceholder: "Describe your shoot project…",
        pdfCompany: { name: "Studio Lumière Visuel", address: "Rue Saint-Laurent 20, 1003 Lausanne", phone: "021 000 00 70", email: "hello@studio-lumiere.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your project, then give you a firm quote right after.",
        addressPlaceholder: "Shoot location (street, postcode, town)",
        terms: "Firm quote, valid 30 days, subject to availability on the date indicated. 30% deposit on booking. Swiss VAT included where applicable.",
        q: {
          shoot: { text: "What type of shoot would you like?", short: "Shoot", opts: { wedding: "Wedding", portrait: "Portrait / family", corporate: "Corporate event or coverage", realestate: "Real estate", product: "Products / e-commerce", video: "Promotional video" } },
          duration: { text: "How long do you expect the shoot to take?", short: "Duration", opts: { h2: "2 hours", h4: "Half day (4 hours)", h8: "Full day (8 hours)" } },
          extras: { text: "Would you like any extra deliverables?", short: "Options", none: "No options", opts: { video: "Highlights video (2–3 min)", drone: "Drone footage", album: "Photo album (30 pages)", second: "Second photographer", licence: "Extended commercial usage licence" } },
          place: { text: "Where does the shoot take place?", short: "Location", opts: { studio: "In our studio", local: "At your place, in the canton", far: "Out of canton (travel)" } },
          speed: { text: "What delivery time would you like?", short: "Delivery", opts: { std: "Standard (3 weeks)", fast: "Express (5 days)" } },
          date: { text: "What's the date of the shoot?", short: "Shoot date" },
        },
        items: {
          shoot_wedding: "Wedding coverage ({h} h)",
          shoot_portrait: "Portrait / family shoot ({h} h)",
          shoot_corporate: "Corporate coverage ({h} h)",
          shoot_realestate: "Real estate photography ({h} h)",
          shoot_product: "Product photography ({h} h)",
          shoot_video: "Promotional video filming ({h} h)",
          retouch: "Image selection and retouching",
          video: "Highlights video (2-3 min)",
          drone: "Drone footage",
          album: "Photo album (30 pages)",
          second: "Second photographer ({h} h)",
          licence: "Extended commercial usage licence",
          travel: "Travel fee",
          fast: "Express delivery (5 days)",
        },
      },
    },

    // ---- German texts (Swiss High German — no ß) ----
    de: {
      label: "Fotografie und Videografie",
      forWho: "Fotografinnen, Fotografen und Videofilmer",
      pitch: "Berechnen Sie Shooting, Dauer, Lieferumfang und Anfahrt vor dem ersten Anruf.",
      emailNoun: "Ihr Shooting",
      landing: {
        h1: ["SIE HALTEN FEST.", "DEALZ RECHNET."],
        question: "Wie viele Shooting-Anfragen verlieren Sie, weil Sie gerade gedreht haben?",
        text: "Ein Paar vergleicht an einem Sonntagabend drei Fotografen und schreibt dem ersten, der mit einem Preis antwortet. Dealz antwortet sofort, stellt die richtigen Fragen (Art des Shootings, Dauer, Lieferumfang, Ort), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet eine ganztägige Hochzeit mit Video und Drohne?",
        values: [
          { icon: "💍", title: "Ein Preis vor dem Erstgespräch", text: "Ernsthafte Kunden kommen bereits mit einer berechneten Anfrage, Ihre Termine sind besser qualifiziert." },
          { icon: "🎞️", title: "Klarer Lieferumfang und Optionen", text: "Video, Drohne, Album, zweiter Fotograf: jede Option wird erklärt und mit einem Klick zur Offerte hinzugefügt." },
          { icon: "📍", title: "Anfahrt integriert", text: "Studio, innerkantonal oder ausserkantonal: Ihre Anfahrtskosten gelten automatisch." },
          { icon: "⏳", title: "Lieferfristen mit echtem Wert", text: "Standard- oder Express-Lieferung: Schnelligkeit wird zu einer berechneten Option, nicht zu einem Gefallen." },
        ],
        step1: "Importieren Sie Ihre Tarife: Satz nach Art des Shootings, Dauer, Lieferumfang, Anfahrt, Express. Ihr Excel bleibt Ihr Arbeitsinstrument.",
        step2: "Die Engine versteht Ihre Shootings, Dauer, Lieferumfang und Anfahrtsregeln.",
        excel: { file: "tarife-foto-video.xlsx", headers: ["Leistung", "Bedingung", "Preis"], rows: [["Hochzeit", "Ganzer Tag (8 Std.)", "CHF 1520"], ["Highlight-Video", "2–3 Min.", "CHF 690"], ["Drohne", "Pauschale", "CHF 380"]] },
        chat: ["«Wir heiraten im September und suchen einen Fotografen.»", "«Wünschen Sie einen halben Tag oder einen ganzen Tag?»", "«Interessieren Sie sich für ein Highlight-Video und Drohnenaufnahmen?»"],
        offer: { company: "Studio Lumière Visuel", rows: [["Hochzeit — ganzer Tag (8 Std.)", 1520], ["Highlight-Video (2–3 Min.)", 690], ["Drohnenaufnahmen", 380]] },
        roi: "Schon ein einziges zusätzliches Shooting pro Monat kann Ihr Abonnement decken.",
      },
      demo: {
        brand: "Studio Lumière",
        eyebrow: "Lausanne & Waadt · Fiktives Beispiel",
        hero: { h1: "Ihre schönsten Momente, schön erzählt.", text: "Hochzeiten, Porträts, Events, Immobilien und Video in der Suisse romande — erhalten Sie in Sekunden einen festen Preis, direkt auf dieser Website." },
        stats: [{ num: "5.0★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "420+", lbl: "DURCHGEFÜHRTE SHOOTINGS" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Was wir fotografieren",
        servicesSub: "Wählen Sie eine Leistung oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "💍", title: "Hochzeit", text: "Foto- und Videoreportage, von der Vorbereitung bis zur Feier.", tag: "ab CHF 190/Std." },
          { icon: "👨‍👩‍👧", title: "Porträt und Familie", text: "Im Studio oder im Freien.", tag: "ab CHF 150/Std." },
          { icon: "🏢", title: "Unternehmen", text: "Events, Teams und Firmenreportagen.", tag: "ab CHF 170/Std." },
          { icon: "🏠", title: "Immobilien", text: "Fotos und Rundgänge für Ihre Inserate.", tag: "ab CHF 120/Std." },
          { icon: "📦", title: "Produkt", text: "Packshots und Inszenierungen für den E-Commerce.", tag: "ab CHF 140/Std." },
          { icon: "🎬", title: "Werbevideo", text: "Dreh, Schnitt und Farbkorrektur.", tag: "ab CHF 220/Std." },
        ],
        about: {
          title: "Ein Blick, ein Team, sorgfältiger Lieferumfang",
          text: "Studio Lumière Visuel fotografiert und filmt seit 2013 Privatpersonen und Unternehmen in der Suisse romande. 2026 haben wir unserer Website einen Sofort-Offertassistenten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Retusche inklusive", "jedes ausgewählte Bild wird von Hand retuschiert."], ["Private Galerie", "Online-Lieferung, Download in hoher Auflösung."], ["Transparenter Preis", "die erhaltene Offerte ist der bezahlte Preis."]],
        },
        contact: { phone: "021 000 00 70", email: "hello@studio-lumiere.demo", zone: "Waadt, Genf, Wallis, Freiburg", hours: "Mo–Sa, nach Vereinbarung" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihrem Projekt — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Shooting-Projekt…",
        pdfCompany: { name: "Studio Lumière Visuel", address: "Rue Saint-Laurent 20, 1003 Lausanne", phone: "021 000 00 70", email: "hello@studio-lumiere.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihrem Projekt und erstelle Ihnen direkt danach eine feste Offerte.",
        addressPlaceholder: "Ort des Shootings (Strasse, PLZ, Ort)",
        terms: "Feste Offerte, 30 Tage gültig, vorbehaltlich Verfügbarkeit am angegebenen Datum. 30% Anzahlung bei Buchung. Schweizer MWST wo anwendbar inbegriffen.",
        q: {
          shoot: { text: "Welche Art von Shooting wünschen Sie?", short: "Shooting", opts: { wedding: "Hochzeit", portrait: "Porträt / Familie", corporate: "Firmenevent oder -reportage", realestate: "Immobilien", product: "Produkte / E-Commerce", video: "Werbevideo" } },
          duration: { text: "Wie lange soll das Shooting dauern?", short: "Dauer", opts: { h2: "2 Stunden", h4: "Halbtag (4 Stunden)", h8: "Ganzer Tag (8 Stunden)" } },
          extras: { text: "Wünschen Sie zusätzlichen Lieferumfang?", short: "Optionen", none: "Keine Option", opts: { video: "Highlight-Video (2–3 Min.)", drone: "Drohnenaufnahmen", album: "Fotoalbum (30 Seiten)", second: "Zweiter Fotograf", licence: "Erweiterte kommerzielle Nutzungslizenz" } },
          place: { text: "Wo findet das Shooting statt?", short: "Ort", opts: { studio: "In unserem Studio", local: "Bei Ihnen, im Kanton", far: "Ausserkantonal (Anfahrt)" } },
          speed: { text: "Welche Lieferfrist wünschen Sie?", short: "Lieferung", opts: { std: "Standard (3 Wochen)", fast: "Express (5 Tage)" } },
          date: { text: "Welches Datum hat das Shooting?", short: "Datum des Shootings" },
        },
        items: {
          shoot_wedding: "Hochzeitsreportage ({h} Std.)",
          shoot_portrait: "Porträt- / Familienshooting ({h} Std.)",
          shoot_corporate: "Firmenreportage ({h} Std.)",
          shoot_realestate: "Immobilienfotografie ({h} Std.)",
          shoot_product: "Produktfotografie ({h} Std.)",
          shoot_video: "Dreh Werbevideo ({h} Std.)",
          retouch: "Auswahl und Retusche der Bilder",
          video: "Highlight-Video (2-3 Min.)",
          drone: "Drohnenaufnahmen",
          album: "Fotoalbum (30 Seiten)",
          second: "Zweiter Fotograf ({h} Std.)",
          licence: "Erweiterte kommerzielle Nutzungslizenz",
          travel: "Anfahrtskosten",
          fast: "Express-Lieferung (5 Tage)",
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
