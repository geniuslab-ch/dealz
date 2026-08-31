const nodemailer = require("nodemailer");
const { CATEGORIES } = require("./objections");

const COMPANY_NAME = "SwissClean Sàrl";
// Falls back to Dealz's own real inbox, NOT a fictional address — this used
// to default to "reservations@swissclean.demo", which doesn't exist and
// started hard-bouncing every notification the moment real SMTP went live
// (a customer accepting/declining on the demo with no companyEmail
// captured would see a raw SMTP error instead of a confirmation). The
// normal path still overrides this with the real visitor-supplied
// companyEmail (see docs/lead-gate.js / getCompanyEmail()) — this is only
// the safety-net default when that's missing.
const COMPANY_NOTIFY_EMAIL = process.env.COMPANY_NOTIFY_EMAIL || "dealz@dealz.website";
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

// Distinct from COMPANY_NOTIFY_EMAIL above: that one is the *fictional
// demo company's* inbox (SwissClean), used for notifications about a
// demo visitor's own simulated booking. This one is Dealz's own real
// inbox — for someone asking to install the real product on their site.
const DEALZ_TEAM_EMAIL = process.env.DEALZ_TEAM_EMAIL || "dealz@dealz.website";

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
async function sendEmail({ to, subject, html, replyTo }) {
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
    return { simulated: true, preview: { to, subject, html } };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Dealz <${COMPANY_NOTIFY_EMAIL}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
  return { simulated: false };
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmtCHF(n) {
  return `CHF ${Number(n).toFixed(2)}`;
}

function quoteItemsHtml(quote) {
  return quote.items
    .map((i) => `<tr><td>${i.label}</td><td style="text-align:right">${fmtCHF(i.amount)}</td></tr>`)
    .join("");
}

// Every customer-facing e-mail (counteroffer, reschedule, revised offer,
// free-text reply, follow-up) ends with this — without it, a message the
// owner personally wrote reads as if it came from nobody in particular.
// This signs off as the CLEANING COMPANY, not Dealz — the customer's
// relationship is with their cleaner, not with the software behind it.
// `logoUrl`/`tagline`/`signature` all come from the company's own record
// (set in the CRM's companies.html) — every piece is optional and each
// falls back gracefully: no logo -> no image column; no tagline -> no
// italic line; no signature text -> just "Cordialement, [name]".
function signatureHtml(companyName = COMPANY_NAME, signature, logoUrl, tagline, lang = "fr") {
  const closing = lang === "en" ? "Best regards" : lang === "de" ? "Freundliche Grüsse" : "Cordialement";
  const contactBlock = signature
    ? `<div style="font-size:12.5px; color:#5b6472; margin-top:6px; line-height:1.5;">${escapeHtml(signature).replace(/\n/g, "<br>")}</div>`
    : `<div style="font-size:13px; color:#10131a; margin-top:6px;">${closing}</div>`;

  if (logoUrl) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px; border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle; padding-right:16px;">
            <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)}" width="72" style="display:block; max-width:72px; height:auto; border-radius:8px;" />
          </td>
          <td style="border-left:3px solid #0b5fff; padding-left:16px; vertical-align:middle;">
            <div style="font-weight:bold; font-size:15px; color:#10131a;">${escapeHtml(companyName)}</div>
            ${tagline ? `<div style="font-style:italic; color:#5b6472; font-size:12.5px; margin-top:2px;">${escapeHtml(tagline)}</div>` : ""}
            ${contactBlock}
          </td>
        </tr>
      </table>
    `;
  }

  if (signature) {
    return `<p style="margin-top:20px; margin-bottom:0; white-space:normal;">${escapeHtml(signature).replace(/\n/g, "<br>")}</p>`;
  }
  return `
    <p style="margin-top:20px; margin-bottom:2px;">${closing},</p>
    <p style="margin:0; font-weight:bold;">${companyName}</p>
  `;
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

// ---- Objection Engine: subject line + owner notification ----

function buildDeclineSubject({ category, customer, quote }) {
  const cfg = CATEGORIES[category] || CATEGORIES.other;
  const parts = [`${cfg.emoji} Devis refusé`, cfg.label, customer.name || "un client"];
  if (cfg.showTotal && quote && quote.total) parts.push(fmtCHF(quote.total));
  return parts.join(" — ");
}

async function sendDeclineNotification({
  quote,
  category,
  summary,
  rawText,
  customer,
  declineToken,
  suggestedReply,
  baseUrl = APP_BASE_URL,
  notifyEmail = COMPANY_NOTIFY_EMAIL,
}) {
  const cfg = CATEGORIES[category] || CATEGORIES.other;
  const actionUrl = `${baseUrl}/counteroffer.html?token=${declineToken}`;

  const html = `
    <h2>${cfg.emoji} Devis refusé — action possible</h2>
    <p><b>Client :</b> ${customer.name || "(non fourni)"}<br/>
       <b>E-mail :</b> ${customer.email || "(non fourni)"}<br/>
       <b>Téléphone :</b> ${customer.phone || "(non fourni)"}<br/>
       <b>Adresse :</b> ${customer.address || "(non fournie)"}</p>
    ${cfg.showTotal ? `<p><b>Devis original :</b> ${fmtCHF(quote.total)}</p><table>${quoteItemsHtml(quote)}</table>` : ""}
    <p><b>Motif du refus :</b> ${cfg.label}</p>
    ${rawText ? `<p><b>Message du client :</b><br/>« ${rawText} »</p>` : ""}
    ${
      suggestedReply
        ? `<div style="background:#f7f9fd;border:1px solid #e4e9f2;border-radius:10px;padding:14px 16px;margin:14px 0;">
             <p style="margin:0 0 6px;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#5b6472;">💬 Réponse suggérée (à relire et adapter avant envoi)</p>
             <p style="margin:0;">${suggestedReply}</p>
           </div>`
        : ""
    }
    <p><a href="${actionUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">${cfg.primaryCta}</a></p>
  `;

  return sendEmail({
    to: notifyEmail,
    subject: buildDeclineSubject({ category, customer, quote }),
    html,
  });
}

// ---- Owner actions, one per objection type ----

async function sendCounterofferToCustomer({
  quote,
  amount,
  message,
  customer,
  offerToken,
  baseUrl = APP_BASE_URL,
  companyName = COMPANY_NAME,
  companyEmail,
  signature,
  logoUrl,
  tagline,
  lang = "fr",
}) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${baseUrl}/offer.html?token=${offerToken}`;
  const t =
    lang === "en"
      ? { h2: `New offer from ${companyName}`, hello: `Hello ${customer.name || ""},`, intro: "Following your message, we're offering you a new price for your cleaning:", cta: "View the offer", subject: `New offer — ${fmtCHF(amount)}` }
      : lang === "de"
      ? { h2: `Neues Angebot von ${companyName}`, hello: `Guten Tag ${customer.name || ""}`, intro: "Aufgrund Ihrer Nachricht bieten wir Ihnen einen neuen Preis für Ihre Reinigung an:", cta: "Angebot ansehen", subject: `Neues Angebot — ${fmtCHF(amount)}` }
      : { h2: `Nouvelle offre de ${companyName}`, hello: `Bonjour ${customer.name || ""},`, intro: "Suite à votre message, nous vous proposons un nouveau prix pour votre nettoyage :", cta: "Voir l'offre", subject: `Nouvelle offre — ${fmtCHF(amount)}` };
  const html = `
    <h2>${t.h2}</h2>
    <p>${t.hello}</p>
    <p>${t.intro}</p>
    <p style="font-size:22px;font-weight:bold;color:#0b5fff;">${fmtCHF(amount)}</p>
    ${message ? `<p>${message}</p>` : ""}
    <p><a href="${offerUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">${t.cta}</a></p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
  `;
  return sendEmail({ to: customer.email, subject: t.subject, html, replyTo: companyEmail });
}

async function sendRescheduleToCustomer({
  date,
  message,
  customer,
  offerToken,
  baseUrl = APP_BASE_URL,
  companyName = COMPANY_NAME,
  companyEmail,
  signature,
  logoUrl,
  tagline,
  lang = "fr",
}) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${baseUrl}/offer.html?token=${offerToken}`;
  const t =
    lang === "en"
      ? { h2: `New date proposed — ${companyName}`, hello: `Hello ${customer.name || ""},`, intro: "We're proposing the following date for your cleaning:", cta: "View the proposal", subject: "New date proposed" }
      : lang === "de"
      ? { h2: `Neuer Termin vorgeschlagen — ${companyName}`, hello: `Guten Tag ${customer.name || ""}`, intro: "Wir schlagen Ihnen folgenden Termin für Ihre Reinigung vor:", cta: "Vorschlag ansehen", subject: "Neuer Termin vorgeschlagen" }
      : { h2: `Nouvelle date proposée — ${companyName}`, hello: `Bonjour ${customer.name || ""},`, intro: "Nous vous proposons la date suivante pour votre nettoyage :", cta: "Voir la proposition", subject: "Nouvelle date proposée" };
  const html = `
    <h2>${t.h2}</h2>
    <p>${t.hello}</p>
    <p>${t.intro}</p>
    <p style="font-size:20px;font-weight:bold;color:#0b5fff;">${date}</p>
    ${message ? `<p>${message}</p>` : ""}
    <p><a href="${offerUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">${t.cta}</a></p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
  `;
  return sendEmail({ to: customer.email, subject: t.subject, html, replyTo: companyEmail });
}

async function sendRevisedOfferToCustomer({
  quote,
  message,
  customer,
  offerToken,
  baseUrl = APP_BASE_URL,
  companyName = COMPANY_NAME,
  companyEmail,
  signature,
  logoUrl,
  tagline,
  lang = "fr",
}) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${baseUrl}/offer.html?token=${offerToken}`;
  const t =
    lang === "en"
      ? { h2: `Revised offer — ${companyName}`, hello: `Hello ${customer.name || ""},`, intro: "Here is your revised quote:", cta: "View the revised offer", subject: `Revised quote — ${fmtCHF(quote.total)}` }
      : lang === "de"
      ? { h2: `Überarbeitetes Angebot — ${companyName}`, hello: `Guten Tag ${customer.name || ""}`, intro: "Hier ist Ihre überarbeitete Offerte:", cta: "Überarbeitetes Angebot ansehen", subject: `Überarbeitete Offerte — ${fmtCHF(quote.total)}` }
      : { h2: `Offre révisée — ${companyName}`, hello: `Bonjour ${customer.name || ""},`, intro: "Voici votre devis révisé :", cta: "Voir l'offre révisée", subject: `Devis révisé — ${fmtCHF(quote.total)}` };
  const html = `
    <h2>${t.h2}</h2>
    <p>${t.hello}</p>
    <p>${t.intro}</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p style="font-size:20px;font-weight:bold;color:#0b5fff;">${fmtCHF(quote.total)}</p>
    ${message ? `<p>${message}</p>` : ""}
    <p><a href="${offerUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">${t.cta}</a></p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
  `;
  return sendEmail({ to: customer.email, subject: t.subject, html, replyTo: companyEmail });
}

async function sendReplyToCustomer({ message, customer, companyName = COMPANY_NAME, companyEmail, signature, logoUrl, tagline, lang = "fr" }) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const t =
    lang === "en"
      ? { h2: `Reply from ${companyName}`, hello: `Hello ${customer.name || ""},`, subject: "Reply to your question" }
      : lang === "de"
      ? { h2: `Antwort von ${companyName}`, hello: `Guten Tag ${customer.name || ""}`, subject: "Antwort auf Ihre Frage" }
      : { h2: `Réponse de ${companyName}`, hello: `Bonjour ${customer.name || ""},`, subject: "Réponse à votre question" };
  const html = `
    <h2>${t.h2}</h2>
    <p>${t.hello}</p>
    <p>${message}</p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
  `;
  return sendEmail({ to: customer.email, subject: t.subject, html, replyTo: companyEmail });
}

async function sendFollowupToCustomer({
  quote,
  customer,
  offerToken,
  baseUrl = APP_BASE_URL,
  companyName = COMPANY_NAME,
  companyEmail,
  signature,
  logoUrl,
  tagline,
  lang = "fr",
}) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${baseUrl}/offer.html?token=${offerToken}`;
  const t =
    lang === "en"
      ? { h2: "Still interested?", hello: `Hello ${customer.name || ""},`, intro: "We just wanted to make sure you had all the information you need. Your quote is still available:", cta: "Review the quote", subject: "Still interested in our offer?" }
      : lang === "de"
      ? { h2: "Noch interessiert?", hello: `Guten Tag ${customer.name || ""}`, intro: "Wir wollten uns nur vergewissern, dass Sie alle nötigen Informationen haben. Ihre Offerte ist weiterhin verfügbar:", cta: "Offerte erneut ansehen", subject: "Noch Interesse an unserem Angebot?" }
      : { h2: "Toujours intéressé(e) ?", hello: `Bonjour ${customer.name || ""},`, intro: "Nous voulions juste nous assurer que vous aviez toutes les informations nécessaires. Votre devis reste disponible :", cta: "Revoir le devis", subject: "Toujours intéressé(e) par notre offre ?" };
  const html = `
    <h2>${t.h2}</h2>
    <p>${t.hello}</p>
    <p>${t.intro}</p>
    <p style="font-size:20px;font-weight:bold;color:#0b5fff;">${fmtCHF(quote.total)}</p>
    <p><a href="${offerUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">${t.cta}</a></p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
  `;
  return sendEmail({ to: customer.email, subject: t.subject, html, replyTo: companyEmail });
}

async function sendBookingConfirmation({ quote, customer, notifyEmail = COMPANY_NOTIFY_EMAIL, companyName = COMPANY_NAME, signature, logoUrl, tagline, lang = "fr" }) {
  const now = new Date();
  const start = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // placeholder: 3 days out
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h duration placeholder
  const calTitle =
    lang === "en" ? `Cleaning — ${customer.name || "Customer"}` : lang === "de" ? `Reinigung — ${customer.name || "Kunde"}` : `Nettoyage — ${customer.name || "Client"}`;
  const calDetails =
    lang === "en"
      ? `Quote accepted (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`
      : lang === "de"
      ? `Offerte angenommen (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`
      : `Devis accepté (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`;
  const calLink = googleCalendarLink({
    title: calTitle,
    details: calDetails,
    location: customer.address || "",
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  });

  const t =
    lang === "en"
      ? { h2: "✓ Booking confirmed", thanks: (n) => `Thank you ${n}! Your cleaning is confirmed for `, calLink: "Add to my Google Calendar", subject: "✓ Booking confirmed" }
      : lang === "de"
      ? { h2: "✓ Buchung bestätigt", thanks: (n) => `Vielen Dank${n ? ", " + n : ""}! Ihre Reinigung ist bestätigt für `, calLink: "Zu meinem Google Kalender hinzufügen", subject: "✓ Buchung bestätigt" }
      : { h2: "✓ Réservation confirmée", thanks: (n) => `Merci ${n} ! Votre nettoyage est confirmé pour `, calLink: "Ajouter à mon Google Agenda", subject: "✓ Réservation confirmée" };

  const customerHtml = `
    <h2>${t.h2}</h2>
    <p>${t.thanks(customer.name || "")}<b>${fmtCHF(quote.total)}</b>.</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p><a href="${calLink}">${t.calLink}</a></p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
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

  // allSettled, not all: a failure notifying the company (e.g. an unreal
  // fallback address) must never break the confirmation for the customer,
  // who's watching this happen live and would otherwise see a raw SMTP
  // error instead of "your booking is confirmed".
  const [customerResult, companyResult] = await Promise.allSettled([
    customer.email
      ? sendEmail({ to: customer.email, subject: t.subject, html: customerHtml, replyTo: notifyEmail })
      : Promise.resolve({ simulated: true, skipped: "no customer email" }),
    sendEmail({ to: notifyEmail, subject: "✓ Nouvelle réservation confirmée", html: companyHtml }),
  ]);

  if (customerResult.status === "rejected") {
    console.error("[sendBookingConfirmation] customer confirmation failed:", customerResult.reason);
  }
  if (companyResult.status === "rejected") {
    console.error("[sendBookingConfirmation] company notification failed:", companyResult.reason);
  }

  return {
    calendarLink: calLink,
    customerEmail: customerResult.status === "fulfilled" ? customerResult.value : { simulated: true, failed: true },
    companyEmail: companyResult.status === "fulfilled" ? companyResult.value : { simulated: true, failed: true },
  };
}

// ---- Install-request notification (docs/contact-flow.js's #contact flow) ----
async function sendInstallRequestNotification({
  companyName,
  contactName,
  contactEmail,
  contactPhone,
  websiteUrl,
  planChoice,
  billingChoice,
  teamSize,
  mainProblem,
  requestSources,
  notifyEmail = DEALZ_TEAM_EMAIL,
}) {
  const html = `
    <h2>🚀 Nouvelle demande d'installation Dealz</h2>
    <p><b>Entreprise :</b> ${companyName || "(non fourni)"}<br/>
       <b>Contact :</b> ${contactName || "(non fourni)"}<br/>
       <b>E-mail :</b> ${contactEmail || "(non fourni)"}<br/>
       <b>Téléphone :</b> ${contactPhone || "(non fourni)"}<br/>
       <b>Site web :</b> ${websiteUrl || "(non fourni)"}</p>
    <p><b>Formule :</b> ${planChoice || "—"} (${billingChoice === "yearly" ? "annuel" : "mensuel"})<br/>
       <b>Taille de l'équipe :</b> ${teamSize || "—"}<br/>
       <b>Problème principal :</b> ${mainProblem || "—"}<br/>
       <b>Sources de demandes actuelles :</b> ${requestSources || "—"}</p>
  `;
  return sendEmail({
    to: notifyEmail,
    subject: `🚀 Demande d'installation — ${companyName || contactEmail || "nouveau prospect"}`,
    html,
  });
}

// ---- Referral notification (docs/parrainage.html) ----
async function sendReferralNotification({
  referredById,
  companyName,
  contactEmail,
  contactPhone,
  note,
  notifyEmail = DEALZ_TEAM_EMAIL,
}) {
  const html = `
    <h2>🤝 Nouveau parrainage</h2>
    <p><b>Parrainé par :</b> prospect CRM #${referredById}</p>
    <p><b>Entreprise :</b> ${companyName || "(non fourni)"}<br/>
       <b>E-mail :</b> ${contactEmail || "(non fourni)"}<br/>
       <b>Téléphone :</b> ${contactPhone || "(non fourni)"}</p>
    ${note ? `<p><b>Message :</b> ${note}</p>` : ""}
  `;
  return sendEmail({
    to: notifyEmail,
    subject: `🤝 Parrainage — ${companyName || contactEmail || "nouveau prospect"}`,
    html,
  });
}

module.exports = {
  sendEmail,
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendRescheduleToCustomer,
  sendRevisedOfferToCustomer,
  sendReplyToCustomer,
  sendFollowupToCustomer,
  sendBookingConfirmation,
  sendInstallRequestNotification,
  sendReferralNotification,
  googleCalendarLink,
  COMPANY_NOTIFY_EMAIL,
  DEALZ_TEAM_EMAIL,
};
