/* Sector definition — loaded by the browser (demo quote engine) and require()d by scripts/build-sectors.js. */
(function () {
  var S = {
    slug: "carrelage",
    icon: "🔲",
    needsAddress: true,
    colors: { main: "#0b7285", dark: "#095c6b", light: "#d3f0f5", accent: "#e67700", accentDark: "#c25e00", bg: "#f8fcfd" },

    quote: {
      minimum: 450,
      questions: [
        { id: "place", type: "single", options: [{ id: "bathroom", rate: 165 }, { id: "kitchen", rate: 140 }, { id: "floor", rate: 120 }, { id: "terrace", rate: 150 }] },
        { id: "surf", type: "single", options: [{ id: "s1", m2: 5 }, { id: "s2", m2: 10 }, { id: "s3", m2: 25 }, { id: "s4", m2: 50 }, { id: "s5", m2: 100 }] },
        { id: "format", type: "single", options: [{ id: "std", k: 1 }, { id: "large", k: 1.2 }, { id: "mosaic", k: 1.45 }] },
        { id: "removal", type: "single", options: [{ id: "none", rate: 0 }, { id: "yes", rate: 32 }] },
        { id: "extras", type: "multi", options: [{ id: "waterproof" }, { id: "epoxy" }, { id: "level" }, { id: "silicone" }] },
        { id: "date", type: "date", minDays: 7 },
      ],
      compute: function (a, L, H) {
        var items = [];
        var m2 = a.surf.m2;
        items.push({ label: L("tile_" + a.place.id, { m2: m2 }), amount: H.round5(m2 * a.place.rate * a.format.k) });
        if (a.removal.rate) items.push({ label: L("removal", { m2: m2 }), amount: H.round5(m2 * a.removal.rate + 120) });
        (a.extras || []).forEach(function (e) {
          if (e.id === "waterproof") items.push({ label: L("waterproof", { m2: m2 }), amount: H.round5(m2 * 35) });
          if (e.id === "epoxy") items.push({ label: L("epoxy", { m2: m2 }), amount: H.round5(m2 * 14) });
          if (e.id === "level") items.push({ label: L("level", { m2: m2 }), amount: H.round5(m2 * 20) });
          if (e.id === "silicone") items.push({ label: L("silicone"), amount: 180 });
        });
        return items;
      },
    },

    fr: {
      label: "Carrelage",
      forWho: "carreleurs et entreprises de carrelage",
      pitch: "Chiffrez salles de bain, cuisines et terrasses au m², sans repasser par le bureau.",
      emailNoun: "vos travaux de carrelage",
      landing: {
        h1: ["VOUS CARRELEZ.", "DEALZ CHIFFRE."],
        question: "Combien de demandes de carrelage perdez-vous parce que vous avez les mains dans la colle ?",
        text: "Salle de bain, cuisine, terrasse : vos clients veulent un prix avant de choisir leurs carreaux. Dealz leur répond à toute heure, pose les bonnes questions (pièce, surface, format des carreaux, dépose, étanchéité), calcule votre prix selon vos tarifs et prépare leur devis.",
        clientQ: "Combien pour carreler une salle de bain d'environ 10 m², murs et sol ?",
        values: [
          { icon: "📐", title: "Format et surface chiffrés", text: "Carreaux standards, grand format ou mosaïque : chaque format suit votre propre majoration, au m²." },
          { icon: "💧", title: "L'étanchéité n'est plus oubliée", text: "Étanchéité sous carrelage, joints époxy, ragréage, silicone : les postes techniques sont dans chaque devis." },
          { icon: "🔨", title: "Dépose comprise", text: "Le client indique s'il faut retirer l'ancien carrelage, le prix s'ajuste tout seul." },
          { icon: "📅", title: "Des chantiers mieux planifiés", text: "Surface, pièce et date souhaitée arrivent ensemble : vous organisez vos semaines sans rappels inutiles." },
        ],
        step1: "Importez vos tarifs : prix au m² par pièce, majorations de format, dépose, étanchéité, joints. Votre Excel reste votre outil de travail.",
        step2: "Le moteur comprend vos surfaces, vos formats de carreaux et vos options.",
        excel: { file: "tarifs-carrelage.xlsx", headers: ["Poste", "Condition", "Prix"], rows: [["Carrelage salle de bain", "10 m² · format standard", "CHF 1 650"], ["Dépose ancien carrelage", "10 m²", "CHF 440"], ["Étanchéité sous carrelage", "10 m²", "CHF 350"]] },
        chat: ["« Nous refaisons le carrelage de la salle de bain. »", "« Quelle surface faut-il carreler, murs et sol ? »", "« Quel format de carreaux avez-vous choisi ? »"],
        offer: { company: "Carrelages Riviera SA", rows: [["Carrelage de salle de bain (10 m²)", 1650], ["Dépose de l'ancien carrelage (10 m²)", 440], ["Étanchéité sous carrelage (10 m²)", 350]] },
        roi: "Deux salles de bain supplémentaires par an paient plusieurs années d'abonnement.",
      },
      demo: {
        brand: "Carrelages Riviera",
        eyebrow: "Riviera & Chablais · Exemple fictif",
        hero: { h1: "Votre carrelage chiffré au m² en une minute.", text: "Salles de bain, cuisines, sols et terrasses sur la Riviera vaudoise et dans le Chablais — obtenez un prix ferme en quelques secondes, directement sur ce site." },
        stats: [{ num: "4.9★", lbl: "SATISFACTION CLIENT" }, { num: "1 500+", lbl: "SALLES DE BAIN" }, { num: "< 1 min", lbl: "POUR UN DEVIS" }],
        servicesTitle: "Nos travaux de carrelage",
        servicesSub: "Choisissez une prestation, ou décrivez simplement votre projet dans l'onglet « Obtenir un devis ».",
        services: [
          { icon: "🛁", title: "Salles de bain", text: "Murs, sols, douches à l'italienne.", tag: "dès CHF 165/m²" },
          { icon: "🍳", title: "Cuisines", text: "Crédences et sols de cuisine.", tag: "dès CHF 140/m²" },
          { icon: "🏠", title: "Sols intérieurs", text: "Séjours, entrées, couloirs.", tag: "dès CHF 120/m²" },
          { icon: "☀️", title: "Terrasses", text: "Carrelage extérieur antidérapant.", tag: "dès CHF 150/m²" },
          { icon: "💧", title: "Étanchéité", text: "Sous carrelage, zones humides.", tag: "dès CHF 35/m²" },
          { icon: "✨", title: "Joints époxy", text: "Joints hygiéniques et durables.", tag: "dès CHF 14/m²" },
        ],
        about: {
          title: "Des carreleurs précis au millimètre",
          text: "Carrelages Riviera pose du carrelage depuis 2004 pour les particuliers, architectes et régies de la Riviera et du Chablais. En 2026, nous avons ajouté un assistant de devis instantané à notre site — plus rapide pour vous, moins d'administratif pour nous.",
          bullets: [["Pose soignée", "calepinage validé avec vous avant la pose."], ["Étanchéité garantie", "systèmes certifiés pour zones humides."], ["Prix transparent", "le devis reçu est le prix payé."]],
        },
        contact: { phone: "021 000 01 04", email: "hello@carrelages-riviera.demo", zone: "Riviera, Chablais, Lavaux", hours: "Lun–Ven, 7h–17h" },
        devisNote: "Répondez à quelques questions sur votre carrelage — vous recevrez un devis réel, que vous pourrez accepter ou refuser directement ici.",
        inputPlaceholder: "Décrivez votre projet de carrelage…",
        pdfCompany: { name: "Carrelages Riviera SA", address: "Rue du Simplon 9, 1800 Vevey", phone: "021 000 01 04", email: "hello@carrelages-riviera.demo" },
      },
      quote: {
        greeting: "Bonjour ! Je vous pose quelques questions rapides sur votre carrelage, puis je vous établis un devis ferme tout de suite après.",
        addressPlaceholder: "Adresse du chantier (rue, NPA, ville)",
        terms: "Devis ferme, valable 30 jours, main-d'œuvre et fournitures de pose comprises, carreaux selon le prix au m² indiqué. Support endommagé découvert à la dépose traité uniquement sur accord préalable. TVA suisse incluse le cas échéant.",
        q: {
          place: { text: "Où faut-il poser le carrelage ?", short: "Pièce", opts: { bathroom: "Salle de bain (murs et sol)", kitchen: "Cuisine (crédence et sol)", floor: "Sol intérieur (séjour, entrée)", terrace: "Terrasse ou balcon" } },
          surf: { text: "Quelle est la surface à carreler ?", short: "Surface", opts: { s1: "Environ 5 m²", s2: "Environ 10 m²", s3: "Environ 25 m²", s4: "Environ 50 m²", s5: "100 m² ou plus" } },
          format: { text: "Quel format de carreaux souhaitez-vous ?", short: "Format", opts: { std: "Format standard (jusqu'à 60 x 60 cm)", large: "Grand format (60 x 120 cm et plus)", mosaic: "Mosaïque" } },
          removal: { text: "Faut-il retirer l'ancien carrelage ?", short: "Dépose", opts: { none: "Non, le support est prêt", yes: "Oui, dépose de l'ancien carrelage" } },
          extras: { text: "Souhaitez-vous des options ?", short: "Options", none: "Aucune option", opts: { waterproof: "Étanchéité sous carrelage", epoxy: "Joints époxy", level: "Ragréage du support", silicone: "Joints silicone sanitaires" } },
          date: { text: "Pour quelle date souhaitez-vous la pose ?", short: "Date souhaitée" },
        },
        items: {
          tile_bathroom: "Carrelage de salle de bain ({m2} m²)",
          tile_kitchen: "Carrelage de cuisine ({m2} m²)",
          tile_floor: "Carrelage de sol intérieur ({m2} m²)",
          tile_terrace: "Carrelage de terrasse ({m2} m²)",
          removal: "Dépose de l'ancien carrelage ({m2} m²)",
          waterproof: "Étanchéité sous carrelage ({m2} m²)",
          epoxy: "Joints époxy ({m2} m²)",
          level: "Ragréage du support ({m2} m²)",
          silicone: "Joints silicone sanitaires",
        },
      },
    },
    en: {
      label: "Tiling",
      forWho: "tilers and tiling companies",
      pitch: "Price bathrooms, kitchens and terraces per m², without going back to the office.",
      emailNoun: "your tiling work",
      landing: {
        h1: ["YOU TILE.", "DEALZ PRICES."],
        question: "How many tiling requests do you lose because your hands are full of adhesive?",
        text: "Bathroom, kitchen, terrace: your customers want a price before they choose their tiles. Dealz answers them at any hour, asks the right questions (room, area, tile format, removal, waterproofing), calculates your price from your rates and prepares their quote.",
        clientQ: "How much to tile a bathroom of about 10 m², walls and floor?",
        values: [
          { icon: "📐", title: "Format and area priced", text: "Standard tiles, large format or mosaic: each format follows your own surcharge, per m²." },
          { icon: "💧", title: "Waterproofing never forgotten", text: "Tanking, epoxy grout, levelling, silicone: the technical items are in every quote." },
          { icon: "🔨", title: "Removal included", text: "The customer says whether the old tiles must come off, and the price adjusts by itself." },
          { icon: "📅", title: "Better-planned jobs", text: "Area, room and preferred date arrive together: you organise your weeks without needless call-backs." },
        ],
        step1: "Import your rates: price per m² by room, format surcharges, removal, waterproofing, grout. Your Excel stays your working tool.",
        step2: "The engine understands your areas, your tile formats and your options.",
        excel: { file: "tiling-rates.xlsx", headers: ["Item", "Condition", "Price"], rows: [["Bathroom tiling", "10 m² · standard format", "CHF 1,650"], ["Removing old tiles", "10 m²", "CHF 440"], ["Waterproofing under tiles", "10 m²", "CHF 350"]] },
        chat: ["“We're redoing the bathroom tiles.”", "“How much area needs tiling, walls and floor?”", "“Which tile format have you chosen?”"],
        offer: { company: "Carrelages Riviera SA", rows: [["Bathroom tiling (10 m²)", 1650], ["Removing the old tiles (10 m²)", 440], ["Waterproofing under tiles (10 m²)", 350]] },
        roi: "Two extra bathrooms a year pay for several years of subscription.",
      },
      demo: {
        brand: "Carrelages Riviera",
        eyebrow: "Riviera & Chablais · Fictional example",
        hero: { h1: "Your tiling priced per m² in a minute.", text: "Bathrooms, kitchens, floors and terraces on the Vaud Riviera and in the Chablais — get a firm price in seconds, right here on this site." },
        stats: [{ num: "4.9★", lbl: "CUSTOMER SATISFACTION" }, { num: "1,500+", lbl: "BATHROOMS" }, { num: "< 1 min", lbl: "FOR A QUOTE" }],
        servicesTitle: "Our tiling work",
        servicesSub: "Pick a service, or simply describe your project in the “Get a quote” tab.",
        services: [
          { icon: "🛁", title: "Bathrooms", text: "Walls, floors, walk-in showers.", tag: "from CHF 165/m²" },
          { icon: "🍳", title: "Kitchens", text: "Splashbacks and kitchen floors.", tag: "from CHF 140/m²" },
          { icon: "🏠", title: "Indoor floors", text: "Living rooms, entrances, hallways.", tag: "from CHF 120/m²" },
          { icon: "☀️", title: "Terraces", text: "Non-slip outdoor tiles.", tag: "from CHF 150/m²" },
          { icon: "💧", title: "Waterproofing", text: "Under tiles, wet areas.", tag: "from CHF 35/m²" },
          { icon: "✨", title: "Epoxy grout", text: "Hygienic, long-lasting joints.", tag: "from CHF 14/m²" },
        ],
        about: {
          title: "Tilers precise to the millimetre",
          text: "Since 2004, Carrelages Riviera has tiled for households, architects and property managers on the Riviera and in the Chablais. In 2026, we added an instant quote assistant to our website — faster for you, less paperwork for us.",
          bullets: [["Careful laying", "tile layout agreed with you before we start."], ["Guaranteed waterproofing", "certified systems for wet areas."], ["Transparent pricing", "the quote you receive is the price you pay."]],
        },
        contact: { phone: "021 000 01 04", email: "hello@carrelages-riviera.demo", zone: "Riviera, Chablais, Lavaux", hours: "Mon–Fri, 7am–5pm" },
        devisNote: "Answer a few questions about your tiling — you'll get a real quote that you can accept or decline right here.",
        inputPlaceholder: "Describe your tiling project…",
        pdfCompany: { name: "Carrelages Riviera SA", address: "Rue du Simplon 9, 1800 Vevey", phone: "021 000 01 04", email: "hello@carrelages-riviera.demo" },
      },
      quote: {
        greeting: "Hello! I'll ask you a few quick questions about your tiling, then put together a firm quote right away.",
        addressPlaceholder: "Site address (street, postcode, town)",
        terms: "Firm quote, valid for 30 days, labour and fixing materials included, tiles at the price per m² shown. Damaged substrate found during removal treated only with prior agreement. Swiss VAT included where applicable.",
        q: {
          place: { text: "Where do the tiles go?", short: "Room", opts: { bathroom: "Bathroom (walls and floor)", kitchen: "Kitchen (splashback and floor)", floor: "Indoor floor (living room, entrance)", terrace: "Terrace or balcony" } },
          surf: { text: "How much area needs tiling?", short: "Area", opts: { s1: "About 5 m²", s2: "About 10 m²", s3: "About 25 m²", s4: "About 50 m²", s5: "100 m² or more" } },
          format: { text: "Which tile format would you like?", short: "Format", opts: { std: "Standard format (up to 60 x 60 cm)", large: "Large format (60 x 120 cm and up)", mosaic: "Mosaic" } },
          removal: { text: "Do the old tiles need removing?", short: "Removal", opts: { none: "No, the surface is ready", yes: "Yes, remove the old tiles" } },
          extras: { text: "Would you like any options?", short: "Options", none: "No options", opts: { waterproof: "Waterproofing under tiles", epoxy: "Epoxy grout", level: "Surface levelling", silicone: "Sanitary silicone joints" } },
          date: { text: "When would you like the tiling done?", short: "Preferred date" },
        },
        items: {
          tile_bathroom: "Bathroom tiling ({m2} m²)",
          tile_kitchen: "Kitchen tiling ({m2} m²)",
          tile_floor: "Indoor floor tiling ({m2} m²)",
          tile_terrace: "Terrace tiling ({m2} m²)",
          removal: "Removing the old tiles ({m2} m²)",
          waterproof: "Waterproofing under tiles ({m2} m²)",
          epoxy: "Epoxy grout ({m2} m²)",
          level: "Surface levelling ({m2} m²)",
          silicone: "Sanitary silicone joints",
        },
      },
    },
    de: {
      label: "Plattenarbeiten",
      forWho: "Plattenleger und Plattenlegerbetriebe",
      pitch: "Bäder, Küchen und Terrassen pro m² berechnen — ohne zurück ins Büro zu müssen.",
      emailNoun: "Ihre Plattenarbeiten",
      landing: {
        h1: ["SIE VERLEGEN PLATTEN.", "DEALZ RECHNET."],
        question: "Wie viele Plattenleger-Anfragen verlieren Sie, weil Sie die Hände voller Kleber haben?",
        text: "Bad, Küche, Terrasse: Ihre Kunden wollen einen Preis, bevor sie ihre Platten wählen. Dealz antwortet ihnen rund um die Uhr, stellt die richtigen Fragen (Raum, Fläche, Plattenformat, Rückbau, Abdichtung), berechnet Ihren Preis nach Ihren Tarifen und erstellt die Offerte.",
        clientQ: "Was kostet es, ein Bad von etwa 10 m² zu plätteln, Wände und Boden?",
        values: [
          { icon: "📐", title: "Format und Fläche berechnet", text: "Standardplatten, Grossformat oder Mosaik: Jedes Format folgt Ihrem eigenen Zuschlag, pro m²." },
          { icon: "💧", title: "Abdichtung nie mehr vergessen", text: "Verbundabdichtung, Epoxidfugen, Ausgleich, Silikon: Die technischen Positionen sind in jeder Offerte." },
          { icon: "🔨", title: "Rückbau inbegriffen", text: "Der Kunde gibt an, ob alte Platten entfernt werden müssen, und der Preis passt sich an." },
          { icon: "📅", title: "Besser geplante Baustellen", text: "Fläche, Raum und Wunschtermin kommen zusammen: Sie planen Ihre Wochen ohne unnötige Rückrufe." },
        ],
        step1: "Importieren Sie Ihre Tarife: Preis pro m² nach Raum, Formatzuschläge, Rückbau, Abdichtung, Fugen. Ihr Excel bleibt Ihr Arbeitswerkzeug.",
        step2: "Die Engine versteht Ihre Flächen, Ihre Plattenformate und Ihre Optionen.",
        excel: { file: "tarife-platten.xlsx", headers: ["Position", "Bedingung", "Preis"], rows: [["Plattenarbeiten Bad", "10 m² · Standardformat", "CHF 1'650"], ["Alte Platten entfernen", "10 m²", "CHF 440"], ["Verbundabdichtung", "10 m²", "CHF 350"]] },
        chat: ["«Wir erneuern die Platten im Bad.»", "«Wie viel Fläche, Wände und Boden?»", "«Welches Plattenformat haben Sie gewählt?»"],
        offer: { company: "Carrelages Riviera SA", rows: [["Plattenarbeiten Bad (10 m²)", 1650], ["Alte Platten entfernen (10 m²)", 440], ["Verbundabdichtung (10 m²)", 350]] },
        roi: "Zwei zusätzliche Badezimmer pro Jahr bezahlen mehrere Jahre Abo.",
      },
      demo: {
        brand: "Carrelages Riviera",
        eyebrow: "Riviera & Chablais · Fiktives Beispiel",
        hero: { h1: "Ihre Plattenarbeiten pro m² in einer Minute berechnet.", text: "Bäder, Küchen, Böden und Terrassen an der Waadtländer Riviera und im Chablais — erhalten Sie in Sekunden einen verbindlichen Preis, direkt auf dieser Website." },
        stats: [{ num: "4.9★", lbl: "KUNDENZUFRIEDENHEIT" }, { num: "1'500+", lbl: "BADEZIMMER" }, { num: "< 1 Min.", lbl: "FÜR EINE OFFERTE" }],
        servicesTitle: "Unsere Plattenarbeiten",
        servicesSub: "Wählen Sie eine Leistung, oder beschreiben Sie Ihr Projekt einfach im Tab «Offerte erhalten».",
        services: [
          { icon: "🛁", title: "Badezimmer", text: "Wände, Böden, bodenebene Duschen.", tag: "ab CHF 165/m²" },
          { icon: "🍳", title: "Küchen", text: "Rückwände und Küchenböden.", tag: "ab CHF 140/m²" },
          { icon: "🏠", title: "Innenböden", text: "Wohnzimmer, Eingänge, Korridore.", tag: "ab CHF 120/m²" },
          { icon: "☀️", title: "Terrassen", text: "Rutschfeste Aussenplatten.", tag: "ab CHF 150/m²" },
          { icon: "💧", title: "Abdichtung", text: "Unter Platten, Nassbereiche.", tag: "ab CHF 35/m²" },
          { icon: "✨", title: "Epoxidfugen", text: "Hygienische, langlebige Fugen.", tag: "ab CHF 14/m²" },
        ],
        about: {
          title: "Plattenleger, millimetergenau",
          text: "Carrelages Riviera verlegt seit 2004 Platten für Privatpersonen, Architekten und Verwaltungen an der Riviera und im Chablais. 2026 haben wir unserer Website einen Assistenten für Sofort-Offerten hinzugefügt — schneller für Sie, weniger Administration für uns.",
          bullets: [["Sorgfältige Verlegung", "Verlegeplan vor Beginn mit Ihnen abgestimmt."], ["Garantierte Abdichtung", "zertifizierte Systeme für Nassbereiche."], ["Transparenter Preis", "die erhaltene Offerte ist der Preis, den Sie bezahlen."]],
        },
        contact: { phone: "021 000 01 04", email: "hello@carrelages-riviera.demo", zone: "Riviera, Chablais, Lavaux", hours: "Mo–Fr, 7–17 Uhr" },
        devisNote: "Beantworten Sie ein paar Fragen zu Ihren Platten — Sie erhalten eine echte Offerte, die Sie direkt hier annehmen oder ablehnen können.",
        inputPlaceholder: "Beschreiben Sie Ihr Plattenprojekt…",
        pdfCompany: { name: "Carrelages Riviera SA", address: "Rue du Simplon 9, 1800 Vevey", phone: "021 000 01 04", email: "hello@carrelages-riviera.demo" },
      },
      quote: {
        greeting: "Guten Tag! Ich stelle Ihnen ein paar kurze Fragen zu Ihren Plattenarbeiten und erstelle Ihnen gleich danach eine verbindliche Offerte.",
        addressPlaceholder: "Adresse der Baustelle (Strasse, PLZ, Ort)",
        terms: "Verbindliche Offerte, 30 Tage gültig, Arbeit und Verlegematerial inbegriffen, Platten zum angegebenen m²-Preis. Beim Rückbau entdeckter schadhafter Untergrund nur nach vorheriger Absprache. Schweizer MWST inbegriffen, sofern anwendbar.",
        q: {
          place: { text: "Wo sollen die Platten verlegt werden?", short: "Raum", opts: { bathroom: "Badezimmer (Wände und Boden)", kitchen: "Küche (Rückwand und Boden)", floor: "Innenboden (Wohnzimmer, Eingang)", terrace: "Terrasse oder Balkon" } },
          surf: { text: "Wie gross ist die Fläche?", short: "Fläche", opts: { s1: "Etwa 5 m²", s2: "Etwa 10 m²", s3: "Etwa 25 m²", s4: "Etwa 50 m²", s5: "100 m² oder mehr" } },
          format: { text: "Welches Plattenformat wünschen Sie?", short: "Format", opts: { std: "Standardformat (bis 60 x 60 cm)", large: "Grossformat (60 x 120 cm und mehr)", mosaic: "Mosaik" } },
          removal: { text: "Müssen alte Platten entfernt werden?", short: "Rückbau", opts: { none: "Nein, der Untergrund ist bereit", yes: "Ja, alte Platten entfernen" } },
          extras: { text: "Wünschen Sie Optionen?", short: "Optionen", none: "Keine Option", opts: { waterproof: "Verbundabdichtung", epoxy: "Epoxidfugen", level: "Untergrund ausgleichen", silicone: "Sanitär-Silikonfugen" } },
          date: { text: "Wann sollen die Platten verlegt werden?", short: "Wunschtermin" },
        },
        items: {
          tile_bathroom: "Plattenarbeiten Bad ({m2} m²)",
          tile_kitchen: "Plattenarbeiten Küche ({m2} m²)",
          tile_floor: "Plattenarbeiten Innenboden ({m2} m²)",
          tile_terrace: "Plattenarbeiten Terrasse ({m2} m²)",
          removal: "Alte Platten entfernen ({m2} m²)",
          waterproof: "Verbundabdichtung ({m2} m²)",
          epoxy: "Epoxidfugen ({m2} m²)",
          level: "Untergrund ausgleichen ({m2} m²)",
          silicone: "Sanitär-Silikonfugen",
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
