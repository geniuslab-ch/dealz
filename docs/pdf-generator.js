/**
 * Generates the real, downloadable devis PDF shown in the quote modal.
 * Uses jsPDF (loaded lazily from a CDN by quote-app.js, only when a quote
 * is actually delivered — no cost to page load otherwise). Pure client-side,
 * no server round-trip, works identically in MOCK_MODE and on GitHub Pages.
 */
(function () {
  const COMPANY = {
    name: "SwissClean Sàrl",
    address: "Chemin du Point-du-Jour 10, 1012 Lausanne",
    phone: "022 000 00 00",
    email: "hello@swissclean.demo",
  };

  function fmtCHF(n) {
    return `CHF ${Number(n).toFixed(2)}`;
  }

  function fmtDate(d, lang) {
    const locale = lang === "en" ? "en-CH" : lang === "de" ? "de-CH" : "fr-CH";
    return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  }

  // Labels for the extra, non-pricing context collected by the full MCQ
  // question flow (docs/mock-client.js) — shown as a compact recap so all
  // those questions actually pay off in the document, not just the total.
  const TYPE_NETTOYAGE_LABELS = {
    fr: {
      regular: "Nettoyage régulier",
      ponctuel: "Nettoyage ponctuel",
      profondeur: "Nettoyage en profondeur",
      fin_de_bail: "Nettoyage de fin de bail / état des lieux",
      demenagement: "Nettoyage après déménagement",
      apres_travaux: "Nettoyage après travaux",
      bureau: "Nettoyage professionnel / bureau",
    },
    en: {
      regular: "Regular cleaning",
      ponctuel: "One-off cleaning",
      profondeur: "Deep cleaning",
      fin_de_bail: "End of tenancy / handover cleaning",
      demenagement: "Post-move cleaning",
      apres_travaux: "Post-renovation cleaning",
      bureau: "Professional / office cleaning",
    },
    de: {
      regular: "Regelmässige Reinigung",
      ponctuel: "Einmalige Reinigung",
      profondeur: "Tiefenreinigung",
      fin_de_bail: "Endreinigung / Wohnungsübergabe",
      demenagement: "Reinigung nach Umzug",
      apres_travaux: "Reinigung nach Bauarbeiten",
      bureau: "Büroreinigung",
    },
  };
  const DETAIL_LABELS = {
    fr: {
      type_nettoyage: "Type de nettoyage",
      type_bien: "Type de bien",
      surface: "Surface",
      etages_niveaux: "Niveaux du logement",
      etages_nombre: "Étages à nettoyer",
      salles_bain: "Salles de bains / WC",
      cuisine: "Cuisine",
      logement_vide: "Logement vide ?",
      fenetres_type: "Type de nettoyage des fenêtres",
      fenetres_nombre: "Nombre de fenêtres",
      four_etat: "État du four",
      frigo: "Réfrigérateur",
      acces_logement: "Accès au logement",
      stationnement: "Stationnement",
      date_nettoyage: "Date souhaitée",
      date_imperative: "Date impérative ?",
      travaux_type: "Travaux réalisés",
      niveau_poussiere: "Niveau de poussière après travaux",
      frequence: "Fréquence souhaitée",
      jour_semaine: "Jour de passage préféré",
      heure_passage: "Heure de passage préférée",
      vide_avant: "Logement vidé avant nettoyage ?",
      date_etat_des_lieux: "Date de l'état des lieux",
      garantie_remise_etat: "Garantie de remise en état",
      animaux: "Animaux",
      situations_particulieres: "Situations particulières",
    },
    en: {
      type_nettoyage: "Type of cleaning",
      type_bien: "Property type",
      surface: "Surface area",
      etages_niveaux: "Property levels",
      etages_nombre: "Floors to clean",
      salles_bain: "Bathrooms / toilets",
      cuisine: "Kitchen",
      logement_vide: "Property empty?",
      fenetres_type: "Type of window cleaning",
      fenetres_nombre: "Number of windows",
      four_etat: "Oven condition",
      frigo: "Fridge",
      acces_logement: "Property access",
      stationnement: "Parking",
      date_nettoyage: "Requested date",
      date_imperative: "Fixed date?",
      travaux_type: "Work carried out",
      niveau_poussiere: "Dust level after work",
      frequence: "Requested frequency",
      jour_semaine: "Preferred day",
      heure_passage: "Preferred time",
      vide_avant: "Cleared before cleaning?",
      date_etat_des_lieux: "Handover inspection date",
      garantie_remise_etat: "Handover-condition guarantee",
      animaux: "Pets",
      situations_particulieres: "Special circumstances",
    },
    de: {
      type_nettoyage: "Art der Reinigung",
      type_bien: "Objekttyp",
      surface: "Fläche",
      etages_niveaux: "Ebenen der Wohnung",
      etages_nombre: "Zu reinigende Stockwerke",
      salles_bain: "Badezimmer / WC",
      cuisine: "Küche",
      logement_vide: "Wohnung leer?",
      fenetres_type: "Art der Fensterreinigung",
      fenetres_nombre: "Anzahl Fenster",
      four_etat: "Zustand des Backofens",
      frigo: "Kühlschrank",
      acces_logement: "Zugang zur Wohnung",
      stationnement: "Parkmöglichkeit",
      date_nettoyage: "Gewünschtes Datum",
      date_imperative: "Verbindliches Datum?",
      travaux_type: "Durchgeführte Arbeiten",
      niveau_poussiere: "Staubgrad nach den Arbeiten",
      frequence: "Gewünschte Häufigkeit",
      jour_semaine: "Bevorzugter Wochentag",
      heure_passage: "Bevorzugte Uhrzeit",
      vide_avant: "Vor Reinigung geräumt?",
      date_etat_des_lieux: "Datum der Wohnungsübergabe",
      garantie_remise_etat: "Garantie für Wohnungsübergabe",
      animaux: "Haustiere",
      situations_particulieres: "Besondere Umstände",
    },
  };

  function detailLines(details, lang) {
    if (!details) return [];
    const labels = DETAIL_LABELS[lang] || DETAIL_LABELS.fr;
    const typeLabels = TYPE_NETTOYAGE_LABELS[lang] || TYPE_NETTOYAGE_LABELS.fr;
    return Object.keys(labels)
      .map((key) => {
        let value = details[key];
        if (key === "type_nettoyage" && value) value = typeLabels[value] || value;
        if (Array.isArray(value)) value = value.join(", ");
        return value ? `${labels[key]} : ${value}` : null;
      })
      .filter(Boolean);
  }

  const STRINGS = {
    fr: { docTitle: "DEVIS", client: "CLIENT", details: "Détails complémentaires", service: "Prestation", amount: "Montant", total: "TOTAL", terms: "Devis ferme, valable 30 jours. TVA suisse incluse le cas échéant.", generated: "Document généré automatiquement — SwissClean Sàrl, site de démonstration." },
    en: { docTitle: "QUOTE", client: "CUSTOMER", details: "Additional details", service: "Service", amount: "Amount", total: "TOTAL", terms: "Firm quote, valid for 30 days. Swiss VAT included where applicable.", generated: "Automatically generated document — SwissClean Sàrl, demo site." },
    de: { docTitle: "OFFERTE", client: "KUNDE", details: "Weitere Details", service: "Leistung", amount: "Betrag", total: "TOTAL", terms: "Feste Offerte, gültig 30 Tage. Schweizer MWST wo anwendbar inbegriffen.", generated: "Automatisch erstelltes Dokument — SwissClean Sàrl, Demo-Website." },
  };

  // Returns { doc, blobUrl } — doc is the jsPDF instance (for .save()),
  // blobUrl is for previewing in an <iframe> without triggering a download.
  function generate(quote, customer, lang) {
    lang = lang || window.DEALZ_LANG || "fr";
    const s = STRINGS[lang] || STRINGS.fr;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 18;
    let y = 20;

    // --- Company header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(11, 18, 32); // navy
    doc.text(COMPANY.name, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(91, 100, 114); // muted
    doc.text(COMPANY.address, marginX, y + 6);
    doc.text(`${COMPANY.phone} · ${COMPANY.email}`, marginX, y + 11);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(11, 95, 255); // blue
    doc.text(s.docTitle, pageWidth - marginX, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(91, 100, 114);
    doc.text(fmtDate(new Date(), lang), pageWidth - marginX, y + 6, { align: "right" });

    y += 22;
    doc.setDrawColor(228, 233, 242);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 10;

    // --- Client block ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(11, 18, 32);
    doc.text(s.client, marginX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(16, 19, 26);
    const clientLines = [
      customer.name || "—",
      customer.email || "",
      customer.phone || "",
      customer.address || "",
    ].filter(Boolean);
    clientLines.forEach((line) => {
      doc.text(line, marginX, y);
      y += 5.5;
    });

    y += 8;

    // --- Extra context collected by the question flow (optional) ---
    const extraLines = detailLines(quote.details, lang);
    if (extraLines.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(11, 18, 32);
      doc.text(s.details, marginX, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(91, 100, 114);
      extraLines.forEach((line) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, marginX, y);
        y += 4.6;
      });
      y += 6;
    }

    // --- Itemized table ---
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(11, 18, 32);
    doc.rect(marginX, y, pageWidth - marginX * 2, 9, "F");
    doc.text(s.service, marginX + 3, y + 6);
    doc.text(s.amount, pageWidth - marginX - 3, y + 6, { align: "right" });
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 19, 26);
    quote.items.forEach((item, idx) => {
      const rowH = 9;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(247, 249, 253);
        doc.rect(marginX, y, pageWidth - marginX * 2, rowH, "F");
      }
      doc.setFontSize(10);
      doc.text(item.label, marginX + 3, y + 6);
      doc.text(fmtCHF(item.amount), pageWidth - marginX - 3, y + 6, { align: "right" });
      y += rowH;
    });

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setFillColor(232, 241, 255); // blue-light
    doc.setTextColor(6, 63, 199); // blue-dark
    doc.rect(marginX, y, pageWidth - marginX * 2, 11, "F");
    doc.text(s.total, marginX + 3, y + 7.5);
    doc.text(fmtCHF(quote.total), pageWidth - marginX - 3, y + 7.5, { align: "right" });
    y += 20;

    // --- Footer ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(91, 100, 114);
    doc.text(s.terms, marginX, y);
    doc.text(s.generated, marginX, y + 5);

    const blobUrl = doc.output("bloburl");
    return { doc, blobUrl };
  }

  window.DealzPDF = { generate };
})();
