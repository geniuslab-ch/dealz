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

    // --- Itemized table ---
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
      if (idx % 2 === 1) {
        doc.setFillColor(247, 249, 253);
        doc.rect(marginX, y, pageWidth - marginX * 2, rowH, "F");
      }
      doc.setFontSize(10);
      doc.text(item.label, marginX + 3, y + 6);
      doc.text(fmtCHF(item.amount), pageWidth - marginX - 3, y + 6, { align: "right" });
      y += rowH;
    });

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
