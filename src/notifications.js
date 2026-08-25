const nodemailer = require("nodemailer");
const { CATEGORIES } = require("./objections");

const COMPANY_NAME = "SwissClean Sàrl";
const COMPANY_NOTIFY_EMAIL = process.env.COMPANY_NOTIFY_EMAIL || "reservations@swissclean.demo";
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

/**
 * Sends an email if SMTP_HOST is configured; otherwise logs the content to
 * the console and returns { simulated: true }. Same graceful-degradation
 * pattern as MOCK_MODE — this lets the whole decline -> counteroffer ->
 * accept loop run and be verified end to end with zero email credentials,
 * and starts actually sending the moment SMTP_* is set in .env.
 */
async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    console.log("\n===== [EMAIL SIMULÉ — configurez SMTP_HOST dans .env pour un envoi réel] =====");
    console.log("À:", to);
    console.log("Objet:", subject);
    console.log("---");
    console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (links.length) {
      console.log("---");
      console.log("Lien(s):", links.join(", "));
    }
    console.log("================================================================================\n");
    return { simulated: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Dealz <${COMPANY_NOTIFY_EMAIL}>`,
    to,
    subject,
    html,
  });
  return { simulated: false };
}

function fmtCHF(n) {
  return `CHF ${Number(n).toFixed(2)}`;
}

function quoteItemsHtml(quote) {
  return quote.items
    .map((i) => `<tr><td>${i.label}</td><td style="text-align:right">${fmtCHF(i.amount)}</td></tr>`)
    .join("");
}

/**
 * A one-click "add to Google Calendar" link — no OAuth, no credentials, no
 * server-side Calendar API integration needed. Deliberate MVP simplification
 * over writing directly to the company's Calendar via the Calendar API
 * (which needs per-company OAuth consent — real scope, correctly deferred).
 */
function googleCalendarLink({ title, details, location, startISO, endISO }) {
  const fmt = (iso) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    location: location || "",
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function sendDeclineNotification({ quote, category, summary, rawText, customer, declineToken }) {
  const counterofferUrl = `${APP_BASE_URL}/counteroffer.html?token=${declineToken}`;
  const html = `
    <h2>🔴 Devis refusé — action possible</h2>
    <p><b>Client :</b> ${customer.name || "(non fourni)"}<br/>
       <b>E-mail :</b> ${customer.email || "(non fourni)"}</p>
    <p><b>Devis original :</b> ${fmtCHF(quote.total)}</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p><b>Motif du refus :</b> ${CATEGORIES[category] || category}</p>
    ${rawText ? `<p><b>Message du client :</b><br/>« ${rawText} »</p>` : ""}
    <p><a href="${counterofferUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">Envoyer une contre-offre</a></p>
  `;
  return sendEmail({
    to: COMPANY_NOTIFY_EMAIL,
    subject: `🔴 Devis refusé — ${customer.name || "un client"} (${CATEGORIES[category] || category})`,
    html,
  });
}

async function sendCounterofferToCustomer({ quote, amount, message, customer, offerToken }) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${APP_BASE_URL}/offer.html?token=${offerToken}`;
  const html = `
    <h2>Nouvelle offre de ${COMPANY_NAME}</h2>
    <p>Bonjour ${customer.name || ""},</p>
    <p>Suite à votre message, nous vous proposons un nouveau prix pour votre nettoyage :</p>
    <p style="font-size:22px;font-weight:bold;color:#0b5fff;">${fmtCHF(amount)}</p>
    ${message ? `<p>${message}</p>` : ""}
    <p><a href="${offerUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">Voir l'offre</a></p>
  `;
  return sendEmail({ to: customer.email, subject: `Nouvelle offre — ${fmtCHF(amount)}`, html });
}

async function sendBookingConfirmation({ quote, customer }) {
  const now = new Date();
  const start = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // placeholder: 3 days out
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h duration placeholder
  const calLink = googleCalendarLink({
    title: `Nettoyage — ${customer.name || "Client"}`,
    details: `Devis accepté (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`,
    location: customer.address || "",
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  });

  const customerHtml = `
    <h2>✓ Réservation confirmée</h2>
    <p>Merci ${customer.name || ""} ! Votre nettoyage est confirmé pour <b>${fmtCHF(quote.total)}</b>.</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p><a href="${calLink}">Ajouter à mon Google Agenda</a></p>
  `;
  const companyHtml = `
    <h2>✓ Nouvelle réservation confirmée</h2>
    <p><b>Client :</b> ${customer.name || "(non fourni)"}<br/>
       <b>E-mail :</b> ${customer.email || "(non fourni)"}<br/>
       <b>Téléphone :</b> ${customer.phone || "(non fourni)"}<br/>
       <b>Adresse :</b> ${customer.address || "(non fournie)"}</p>
    <p><b>Montant :</b> ${fmtCHF(quote.total)}</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p><a href="${calLink}">Ajouter à l'agenda Google de l'entreprise</a></p>
  `;

  const results = await Promise.all([
    customer.email
      ? sendEmail({ to: customer.email, subject: "✓ Réservation confirmée", html: customerHtml })
      : Promise.resolve({ simulated: true, skipped: "no customer email" }),
    sendEmail({ to: COMPANY_NOTIFY_EMAIL, subject: "✓ Nouvelle réservation confirmée", html: companyHtml }),
  ]);

  return { calendarLink: calLink, customerEmail: results[0], companyEmail: results[1] };
}

module.exports = {
  sendEmail,
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendBookingConfirmation,
  googleCalendarLink,
  COMPANY_NOTIFY_EMAIL,
};
