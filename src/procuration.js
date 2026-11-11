/**
 * The authorisation letter ("procuration") a client gives in the onboarding
 * form, so Dealz can ask the agency that runs their website for access and
 * install the WhatsApp button / quote form. A one-page A4 PDF, written by
 * hand (no PDF library on the server): Helvetica, WinAnsi text, so French
 * and German accents print correctly.
 */

const TEXT = {
  fr: {
    title: "Procuration",
    subtitle: "Accès au site internet pour l'installation de Dealz",
    body: (d) => [
      `Je soussigné(e) ${d.name}, agissant pour l'entreprise ${d.company}, autorise Dealz (dealz.website) à contacter ${d.agency} (${d.agencyContact}), qui gère le site internet ${d.website}.`,
      "Dealz peut demander à cette personne un accès à l'administration du site, uniquement pour y installer le bouton WhatsApp et le formulaire de devis Dealz, et pour les maintenir.",
      "Cette autorisation ne permet aucune autre modification du site. Je peux la retirer à tout moment par un simple e-mail à info@dealz.website.",
    ],
    done: (d) => `Fait le ${d.date}, par validation électronique du formulaire d'intégration Dealz.`,
    sign: "Nom et e-mail du mandant",
  },
  en: {
    title: "Letter of authorisation",
    subtitle: "Website access to install Dealz",
    body: (d) => [
      `I, ${d.name}, acting for the company ${d.company}, authorise Dealz (dealz.website) to contact ${d.agency} (${d.agencyContact}), who manages the website ${d.website}.`,
      "Dealz may ask this person for access to the website's administration, only to install the Dealz WhatsApp button and quote form, and to maintain them.",
      "This authorisation allows no other change to the website. I can withdraw it at any time with an email to info@dealz.website.",
    ],
    done: (d) => `Given on ${d.date}, by electronic confirmation of the Dealz onboarding form.`,
    sign: "Name and email of the principal",
  },
  de: {
    title: "Vollmacht",
    subtitle: "Zugang zur Website für die Einrichtung von Dealz",
    body: (d) => [
      `Ich, ${d.name}, handelnd für das Unternehmen ${d.company}, bevollmächtige Dealz (dealz.website), ${d.agency} (${d.agencyContact}) zu kontaktieren, die/der die Website ${d.website} betreut.`,
      "Dealz darf diese Person um Zugang zur Verwaltung der Website bitten, ausschliesslich um den WhatsApp-Button und das Offertenformular von Dealz einzurichten und zu warten.",
      "Diese Vollmacht erlaubt keine anderen Änderungen an der Website. Ich kann sie jederzeit mit einer E-Mail an info@dealz.website widerrufen.",
    ],
    done: (d) => `Erteilt am ${d.date}, durch elektronische Bestätigung des Dealz-Einrichtungsformulars.`,
    sign: "Name und E-Mail der Vollmachtgeberin / des Vollmachtgebers",
  },
  it: {
    title: "Procura",
    subtitle: "Accesso al sito web per la messa in servizio di Dealz",
    body: (d) => [
      `Io, ${d.name}, in rappresentanza dell'impresa ${d.company}, autorizzo Dealz (dealz.website) a contattare ${d.agency} (${d.agencyContact}), che gestisce il sito web ${d.website}.`,
      "Dealz può chiedere a questa persona l'accesso all'amministrazione del sito, unicamente per installare e mantenere il pulsante WhatsApp e il modulo di preventivo Dealz.",
      "Questa procura non consente nessun'altra modifica al sito. Posso revocarla in qualsiasi momento con un'e-mail a info@dealz.website.",
    ],
    done: (d) => `Rilasciata il ${d.date}, tramite conferma elettronica del modulo di messa in servizio Dealz.`,
    sign: "Nome ed e-mail del mandante",
  },
};

// WinAnsi (cp1252) bytes for a PDF string: escape, map typographic quotes,
// drop anything Helvetica can't show.
const CP1252 = { "€": 0x80, "‚": 0x82, "„": 0x84, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "–": 0x96, "—": 0x97 };
function pdfString(str) {
  let out = "";
  for (const ch of String(str)) {
    let code = CP1252[ch] != null ? CP1252[ch] : ch.codePointAt(0);
    if (code > 255) code = 0x3f; // "?"
    const c = String.fromCharCode(code);
    if (c === "(" || c === ")" || c === "\\") out += "\\" + c;
    else if (code < 32) out += " ";
    else out += c;
  }
  return "(" + out + ")";
}

// Rough Helvetica widths (per 1000 em) for line wrapping.
function textWidth(str, size) {
  let w = 0;
  for (const ch of str) w += /[il.,;:'!|]/.test(ch) ? 260 : /[mwMW]/.test(ch) ? 820 : /[A-Z]/.test(ch) ? 660 : 540;
  return (w * size) / 1000;
}
function wrap(str, size, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of String(str).split(/\s+/)) {
    const next = line ? line + " " + word : word;
    if (textWidth(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * d: { lang, name, email, company, agency, agencyContact, website, date }
 * Returns a Buffer holding the PDF.
 */
function buildProcuration(d) {
  const T = TEXT[d.lang] || TEXT.fr;
  const W = 595.28, H = 841.89, M = 64, maxW = W - 2 * M;
  const ops = [];
  let y = H - 80;
  const text = (str, size, bold, color) => {
    ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color || "0.06 0.07 0.1"} rg ${M} ${y.toFixed(2)} Td ${pdfString(str)} Tj ET`);
  };
  // Brand bar
  ops.push(`0.043 0.373 1 rg 0 ${H - 18} ${W} 18 re f`);
  text("Dealz", 13, true, "0.043 0.373 1");
  y -= 44;
  text(T.title, 22, true);
  y -= 22;
  text(T.subtitle, 12, false, "0.36 0.39 0.45");
  y -= 40;
  for (const para of T.body(d)) {
    for (const line of wrap(para, 11.5, maxW)) {
      text(line, 11.5);
      y -= 17;
    }
    y -= 10;
  }
  y -= 8;
  for (const line of wrap(T.done(d), 11.5, maxW)) {
    text(line, 11.5);
    y -= 17;
  }
  y -= 30;
  ops.push(`0.89 0.91 0.95 RG 1 w ${M} ${y + 14} m ${M + 260} ${y + 14} l S`);
  text(T.sign, 9.5, false, "0.36 0.39 0.45");
  y -= 18;
  text(`${d.name} · ${d.email}`, 11.5, true);
  y -= 16;
  text(d.company, 11.5);

  const stream = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (pdf += String(o).padStart(10, "0") + " 00000 n \n"));
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

module.exports = { buildProcuration };
