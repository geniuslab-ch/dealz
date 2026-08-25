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

  function fmtDate(d) {
    return d.toLocaleDateString("fr-CH", { year: "numeric", month: "long", day: "numeric" });
  }

  // Labels for the extra, non-pricing context collected by the full MCQ
  // question flow (docs/mock-client.js) — shown as a compact recap so all
  // those questions actually pay off in the document, not just the total.
  const TYPE_NETTOYAGE_LABELS = {
    regular: "Nettoyage régulier",
    ponctuel: "Nettoyage ponctuel",
    profondeur: "Nettoyage en profondeur",
    fin_de_bail: "Nettoyage de fin de bail / état des lieux",
    demenagement: "Nettoyage après déménagement",
    apres_travaux: "Nettoyage après travaux",
    bureau: "Nettoyage professionnel / bureau",
  };
  const DETAIL_LABELS = {
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
    vide_avant: "Logement vidé avant nettoyage ?",
    date_etat_des_lieux: "Date de l'état des lieux",
    garantie_remise_etat: "Garantie de remise en état",
    animaux: "Animaux",
    situations_particulieres: "Situations particulières",
  };

  function detailLines(details) {
    if (!details) return [];
    return Object.keys(DETAIL_LABELS)
      .map((key) => {
        let value = details[key];
        if (key === "type_nettoyage" && value) value = TYPE_NETTOYAGE_LABELS[value] || value;
        if (Array.isArray(value)) value = value.join(", ");
        return value ? `${DETAIL_LABELS[key]} : ${value}` : null;
      })
      .filter(Boolean);
  }

  // Returns { doc, blobUrl } — doc is the jsPDF instance (for .save()),
  // blobUrl is for previewing in an <iframe> without triggering a download.
  function generate(quote, customer) {
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
    doc.text("DEVIS", pageWidth - marginX, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(91, 100, 114);
    doc.text(fmtDate(new Date()), pageWidth - marginX, y + 6, { align: "right" });

    y += 22;
    doc.setDrawColor(228, 233, 242);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 10;

    // --- Client block ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(11, 18, 32);
    doc.text("CLIENT", marginX, y);
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
    const extraLines = detailLines(quote.details);
    if (extraLines.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(11, 18, 32);
      doc.text("Détails complémentaires", marginX, y);
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
    doc.text("Prestation", marginX + 3, y + 6);
    doc.text("Montant", pageWidth - marginX - 3, y + 6, { align: "right" });
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
    doc.text("TOTAL", marginX + 3, y + 7.5);
    doc.text(fmtCHF(quote.total), pageWidth - marginX - 3, y + 7.5, { align: "right" });
    y += 20;

    // --- Footer ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(91, 100, 114);
    doc.text("Devis ferme, valable 30 jours. TVA suisse incluse le cas échéant.", marginX, y);
    doc.text("Document généré automatiquement — SwissClean Sàrl, site de démonstration.", marginX, y + 5);

    const blobUrl = doc.output("bloburl");
    return { doc, blobUrl };
  }

  window.DealzPDF = { generate };
})();
