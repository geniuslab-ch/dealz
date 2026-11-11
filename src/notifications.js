const nodemailer = require("nodemailer");
const { CATEGORIES, categoryView, categoryConfig } = require("./objections");
const { inlineImages, buildQuotePdf } = require("./emailAssets");
const { sectorDir } = require("../scripts/sector-urls");

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
// Links in e-mails. On Vercel without APP_BASE_URL this used to fall back to
// localhost, which made every link in those e-mails dead.
const APP_BASE_URL = process.env.APP_BASE_URL || (process.env.VERCEL ? "https://dealz.website" : "http://localhost:3000");

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
async function sendEmail({ to, subject, html, replyTo, icalEvent, attachments }) {
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
    if (attachments && attachments.length) {
      console.log("---");
      console.log("Pièce(s) jointe(s):", attachments.map((x) => `${x.filename} (${x.content.length} octets)`).join(", "));
    }
    console.log("================================================================================\n");
    return { simulated: true, preview: { to, subject, html } };
  }

  // Logos are embedded in the message (cid) instead of linked: many mail
  // clients (Infomaniak, Outlook, Apple Mail) block remote images and show
  // a broken-image box with the alt text instead (src/emailAssets.js).
  const inlined = await inlineImages(html);
  const allAttachments = [...(attachments || []), ...inlined.attachments];
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Dealz <${COMPANY_NOTIFY_EMAIL}>`,
    to,
    subject,
    html: inlined.html,
    // A plain-text part next to the HTML: HTML-only mail scores worse with
    // spam filters, and some clients show only text.
    text: htmlToText(html),
    ...(replyTo ? { replyTo } : {}),
    // A calendar invitation (.ics) mail clients turn into an "add to
    // calendar" event — used for staff assignments (src/scale.js).
    ...(icalEvent ? { icalEvent } : {}),
    // Files the client uploaded in the onboarding form (src/onboarding.js),
    // the quote PDF of a booking, and the inline logo images.
    ...(allAttachments.length ? { attachments: allAttachments } : {}),
  });
  return { simulated: false, to, subject, html };
}

function htmlToText(html) {
  return String(html)
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, "")
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, label) => {
      const l = label.replace(/<[^>]+>/g, "").trim();
      return !l || l === href || href.startsWith("mailto:") ? l || href.replace(/^mailto:/, "") : `${l} (${href})`;
    })
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|tr|li|table)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

// Short, credential-free description of a failed send (SMTP code + message).
function errorText(err) {
  if (!err) return "erreur inconnue";
  const code = err.responseCode || err.code;
  return `${code ? code + " " : ""}${(err.response || err.message || String(err)).slice(0, 200)}`;
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
// `logoUrl`/`tagline`/`signature` come from the company's own record (set
// in the CRM's companies.html) — each optional; with none of them it is
// just "Cordialement, [name]".
// The fictional demo companies (docs/secteurs/data/), by legal name — their
// e-mails sign with the full card: logo, team line, trade, tagline, contact.
const DEMO_COMPANIES = (() => {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(__dirname, "..", "docs", "secteurs", "data");
  const map = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const S = require(path.join(dir, f));
    map[S.fr.demo.pdfCompany.name] = S;
  }
  return map;
})();
const SITE_URL = (process.env.APP_BASE_URL && !/localhost/.test(process.env.APP_BASE_URL) ? process.env.APP_BASE_URL : "https://dealz.website").replace(/\/$/, "");
const TEAM = { fr: (n) => `Équipe ${n}`, en: (n) => `The ${n} team`, de: (n) => `Team ${n}`, it: (n) => `Il team ${n}` };

// Same layout as the Dealz team's own signature: logo on the left, a
// coloured bar, then "Team <brand>", the company name in its colour, an
// italic tagline and the contact lines. Tables and inline styles only, so it
// renders the same in every mail client.
function signatureCard({ logoUrl, team, name, icon, tagline, lines, accent }) {
  const esc = escapeHtml;
  const contact = lines
    .filter(Boolean)
    .map((l) =>
      l.href
        ? `<div style="font-size:14px; line-height:1.5;"><a href="${esc(l.href)}" style="color:${accent}; text-decoration:none;">${esc(l.text)}</a></div>`
        : `<div style="font-size:14px; line-height:1.5; color:#5b6472;">${esc(l.text)}</div>`
    )
    .join("");
  return `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px; border-collapse:collapse; font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
        <tr>
          ${logoUrl ? `<td style="vertical-align:middle; padding-right:18px;">
            <img src="${esc(logoUrl)}" alt="${esc(name)}" width="84" height="84" style="display:block; width:84px; height:84px; border-radius:16px;" />
          </td>` : ""}
          <td style="border-left:3px solid ${accent}; padding-left:18px; vertical-align:middle;">
            <div style="font-weight:bold; font-size:17px; color:#10131a; line-height:1.3;">${esc(team)}</div>
            <div style="font-weight:bold; font-size:15px; color:${accent}; margin-top:6px;">${icon ? esc(icon) + " " : ""}${esc(name)}</div>
            ${tagline ? `<div style="font-style:italic; color:#5b6472; font-size:13px; margin-top:4px;">${esc(tagline)}</div>` : ""}
            ${contact ? `<div style="margin-top:8px;">${contact}</div>` : ""}
          </td>
        </tr>
      </table>`;
}

// This signs off as the COMPANY, not Dealz — the customer's relationship
// is with the business, not with the software behind it. Demo companies get
// their full card; a real company's own record (logo, tagline, signature
// text from the CRM) fills the same card, each piece optional.
function signatureHtml(companyName = COMPANY_NAME, signature, logoUrl, tagline, lang = "fr") {
  // A stored token can carry null (no company on the cleaning demo); a
  // default parameter only covers undefined, so it would print "null".
  companyName = companyName || COMPANY_NAME;
  const l = ["en", "de", "it"].includes(lang) ? lang : "fr";
  const closing = l === "en" ? "Best regards" : l === "de" ? "Freundliche Grüsse" : l === "it" ? "Cordiali saluti" : "Cordialement";
  const opener = `<p style="margin:20px 0 0;">${closing},</p>`;

  const S = DEMO_COMPANIES[companyName];
  if (S) {
    const D = S[l].demo;
    const domain = D.contact.email.split("@")[1];
    const site = `${SITE_URL}${sectorDir(S.slug, l)}/demo.html`;
    return opener + signatureCard({
      logoUrl: logoUrl || `${SITE_URL}/images/demo-logos/${S.slug}-mark.png`,
      team: TEAM[l](D.brand),
      name: companyName,
      icon: S.icon,
      tagline: D.hero.h1,
      lines: [{ text: D.contact.email, href: "mailto:" + D.contact.email }, { text: D.contact.phone }, { text: domain, href: site }],
      accent: (S.colors && S.colors.main) || "#0b5fff",
    });
  }

  if (logoUrl || tagline || signature) {
    return opener + signatureCard({
      logoUrl,
      team: TEAM[l](companyName),
      name: companyName,
      tagline,
      lines: signature ? String(signature).split("\n").map((t) => ({ text: t })) : [],
      accent: "#0b5fff",
    });
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

// Company-facing wording of the decline e-mail, per demo language.
const DECLINE_TEXT = {
  fr: { basicNote: "Le client a refusé ce devis en ligne. Contactez-le si vous souhaitez en discuter.", refused: "Devis refusé", actionTitle: "Devis refusé — action possible", aClient: "un client", client: "Client", email: "E-mail", phone: "Téléphone", address: "Adresse",
        none: "(non fourni)", noneF: "(non fournie)", original: "Devis original", reason: "Motif du refus", message: "Message du client", suggested: "💬 Réponse suggérée (à relire et adapter avant envoi)",
        banner: (p, c, s) => `Démo Dealz${p} · <b>${c}</b> — secteur ${s}`, q: (t) => `« ${t} »` },
  en: { basicNote: "The customer declined this quote online. Get in touch with them if you'd like to discuss it.", refused: "Quote declined", actionTitle: "Quote declined — action possible", aClient: "a customer", client: "Customer", email: "Email", phone: "Phone", address: "Address",
        none: "(not provided)", noneF: "(not provided)", original: "Original quote", reason: "Reason for declining", message: "Customer's message", suggested: "💬 Suggested reply (review and adapt before sending)",
        banner: (p, c, s) => `Dealz demo${p} · <b>${c}</b> — ${s}`, q: (t) => `“${t}”` },
  de: { basicNote: "Der Kunde hat diese Offerte online abgelehnt. Kontaktieren Sie ihn, wenn Sie darüber sprechen möchten.", refused: "Offerte abgelehnt", actionTitle: "Offerte abgelehnt — Aktion möglich", aClient: "ein Kunde", client: "Kunde", email: "E-Mail", phone: "Telefon", address: "Adresse",
        none: "(nicht angegeben)", noneF: "(nicht angegeben)", original: "Ursprüngliche Offerte", reason: "Ablehnungsgrund", message: "Nachricht des Kunden", suggested: "💬 Antwortvorschlag (vor dem Senden prüfen und anpassen)",
        banner: (p, c, s) => `Dealz-Demo${p} · <b>${c}</b> — Branche ${s}`, q: (t) => `«${t}»` },
  it: { basicNote: "Il cliente ha rifiutato questo preventivo online. Contattatelo se desiderate parlarne.", refused: "Preventivo rifiutato", actionTitle: "Preventivo rifiutato — azione possibile", aClient: "un cliente", client: "Cliente", email: "E-mail", phone: "Telefono", address: "Indirizzo",
        none: "(non indicato)", noneF: "(non indicato)", original: "Preventivo iniziale", reason: "Motivo del rifiuto", message: "Messaggio del cliente", suggested: "💬 Risposta suggerita (da rileggere e adattare prima dell'invio)",
        banner: (p, c, s) => `Demo Dealz${p} · <b>${c}</b> — settore ${s}`, q: (t) => `«${t}»` },
};

function buildDeclineSubject({ category, customer, quote, generic, lang }) {
  const cfg = CATEGORIES[category] || CATEGORIES.other;
  const view = categoryView(category, generic, lang);
  const T = DECLINE_TEXT[lang] || DECLINE_TEXT.fr;
  const parts = [`${view.emoji} ${T.refused}`, view.label, customer.name || T.aClient];
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
  sectorLabel: sectorName,
  companyName: demoCompanyName,
  platformName,
  lang = "fr",
  basic = false,
}) {
  const cfg = categoryConfig(category, lang);
  const view = categoryView(category, !!sectorName, lang);
  const T = DECLINE_TEXT[lang] || DECLINE_TEXT.fr;
  const actionUrl = `${baseUrl}/counteroffer.html?token=${declineToken}`;

  // Sector demos: say whose quote this is, so the trial e-mail reads like
  // the real thing for that trade.
  const demoBanner = sectorName
    ? `<p style="margin:0 0 10px;font-size:12.5px;color:#5b6472;">${T.banner(platformName ? " × " + platformName : "", demoCompanyName, sectorName)}</p>`
    : "";

  // CAPTURE plan: the company learns the quote was declined and who to call
  // — no reason analysis, suggested reply or recovery action (that is CLOSE).
  if (basic) {
    return sendEmail({
      to: notifyEmail,
      subject: `${T.refused} — ${customer.name || T.aClient} — ${fmtCHF(quote.total)}`,
      html: `
    <h2>${T.refused}</h2>
    <p><b>${T.client} :</b> ${customer.name || T.none}<br/>
       <b>${T.email} :</b> ${customer.email || T.none}<br/>
       <b>${T.phone} :</b> ${customer.phone || T.none}<br/>
       <b>${T.address} :</b> ${customer.address || T.noneF}</p>
    <p><b>${T.original} :</b> ${fmtCHF(quote.total)}</p><table>${quoteItemsHtml(quote)}</table>
    <p>${T.basicNote}</p>`,
    });
  }

  const html = `
    ${demoBanner}
    <h2>${view.emoji} ${T.actionTitle}</h2>
    <p><b>${T.client} :</b> ${customer.name || T.none}<br/>
       <b>${T.email} :</b> ${customer.email || T.none}<br/>
       <b>${T.phone} :</b> ${customer.phone || T.none}<br/>
       <b>${T.address} :</b> ${customer.address || T.noneF}</p>
    ${cfg.showTotal ? `<p><b>${T.original} :</b> ${fmtCHF(quote.total)}</p><table>${quoteItemsHtml(quote)}</table>` : ""}
    <p><b>${T.reason} :</b> ${view.label}</p>
    ${rawText ? `<p><b>${T.message} :</b><br/>${T.q(rawText)}</p>` : ""}
    ${
      suggestedReply
        ? `<div style="background:#f7f9fd;border:1px solid #e4e9f2;border-radius:10px;padding:14px 16px;margin:14px 0;">
             <p style="margin:0 0 6px;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#5b6472;">${T.suggested}</p>
             <p style="margin:0;">${suggestedReply}</p>
           </div>`
        : ""
    }
    <p><a href="${actionUrl}" style="display:inline-block;background:#0b5fff;color:white;padding:10px 18px;border-radius:20px;text-decoration:none;font-weight:bold;">${cfg.primaryCta}</a></p>
  `;

  return sendEmail({
    to: notifyEmail,
    subject: buildDeclineSubject({ category, customer, quote, generic: !!sectorName, lang }),
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
  serviceNoun,
}) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${baseUrl}/offer.html?token=${offerToken}`;
  const t =
    lang === "en"
      ? { h2: `New offer from ${companyName}`, hello: `Hello ${customer.name || ""},`, intro: `Following your message, we're offering you a new price for ${serviceNoun || "your cleaning"}:`, cta: "View the offer", subject: `New offer — ${fmtCHF(amount)}` }
      : lang === "de"
      ? { h2: `Neues Angebot von ${companyName}`, hello: `Guten Tag ${customer.name || ""}`, intro: `Aufgrund Ihrer Nachricht bieten wir Ihnen einen neuen Preis für ${serviceNoun || "Ihre Reinigung"} an:`, cta: "Angebot ansehen", subject: `Neues Angebot — ${fmtCHF(amount)}` }
      : lang === "it"
      ? { h2: `Nuova offerta di ${companyName}`, hello: `Buongiorno ${customer.name || ""},`, intro: `In seguito al vostro messaggio, vi proponiamo un nuovo prezzo per ${serviceNoun || "la vostra pulizia"}:`, cta: "Vedere l'offerta", subject: `Nuova offerta — ${fmtCHF(amount)}` }
      : { h2: `Nouvelle offre de ${companyName}`, hello: `Bonjour ${customer.name || ""},`, intro: `Suite à votre message, nous vous proposons un nouveau prix pour ${serviceNoun || "votre nettoyage"} :`, cta: "Voir l'offre", subject: `Nouvelle offre — ${fmtCHF(amount)}` };
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
  serviceNoun,
}) {
  if (!customer.email) return { simulated: true, skipped: "no customer email" };
  const offerUrl = `${baseUrl}/offer.html?token=${offerToken}`;
  const t =
    lang === "en"
      ? { h2: `New date proposed — ${companyName}`, hello: `Hello ${customer.name || ""},`, intro: `We're proposing the following date for ${serviceNoun || "your cleaning"}:`, cta: "View the proposal", subject: "New date proposed" }
      : lang === "de"
      ? { h2: `Neuer Termin vorgeschlagen — ${companyName}`, hello: `Guten Tag ${customer.name || ""}`, intro: `Wir schlagen Ihnen folgenden Termin für ${serviceNoun || "Ihre Reinigung"} vor:`, cta: "Vorschlag ansehen", subject: "Neuer Termin vorgeschlagen" }
      : lang === "it"
      ? { h2: `Nuova data proposta — ${companyName}`, hello: `Buongiorno ${customer.name || ""},`, intro: `Vi proponiamo la data seguente per ${serviceNoun || "la vostra pulizia"}:`, cta: "Vedere la proposta", subject: "Nuova data proposta" }
      : { h2: `Nouvelle date proposée — ${companyName}`, hello: `Bonjour ${customer.name || ""},`, intro: `Nous vous proposons la date suivante pour ${serviceNoun || "votre nettoyage"} :`, cta: "Voir la proposition", subject: "Nouvelle date proposée" };
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
      : lang === "it"
      ? { h2: `Offerta rivista — ${companyName}`, hello: `Buongiorno ${customer.name || ""},`, intro: "Ecco il vostro preventivo rivisto:", cta: "Vedere l'offerta rivista", subject: `Preventivo rivisto — ${fmtCHF(quote.total)}` }
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
      : lang === "it"
      ? { h2: `Risposta di ${companyName}`, hello: `Buongiorno ${customer.name || ""},`, subject: "Risposta alla vostra domanda" }
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
      : lang === "it"
      ? { h2: "Ancora interessati?", hello: `Buongiorno ${customer.name || ""},`, intro: "Volevamo solo assicurarci che aveste tutte le informazioni necessarie. Il vostro preventivo è ancora disponibile:", cta: "Rivedere il preventivo", subject: "Ancora interessati alla nostra offerta?" }
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

async function sendBookingConfirmation({ quote, customer, notifyEmail = COMPANY_NOTIFY_EMAIL, companyName = COMPANY_NAME, signature, logoUrl, tagline, lang = "fr", serviceNoun, date, calendarFeedUrl, pdfCompany }) {
  const now = new Date();
  // The service date the customer chose (YYYY-MM-DD, 9:00 Swiss time);
  // without one, a placeholder 3 days out.
  const start = date ? new Date(`${date}T08:00:00.000Z`) : new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h duration placeholder
  const calTitle =
    serviceNoun
      ? `${companyName} — ${customer.name || "Client"}`
      : lang === "en" ? `Cleaning — ${customer.name || "Customer"}` : lang === "de" ? `Reinigung — ${customer.name || "Kunde"}` : lang === "it" ? `Pulizia — ${customer.name || "Cliente"}` : `Nettoyage — ${customer.name || "Client"}`;
  const calDetails =
    lang === "en"
      ? `Quote accepted (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`
      : lang === "de"
      ? `Offerte angenommen (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`
      : lang === "it"
      ? `Preventivo accettato (${fmtCHF(quote.total)}). ${quote.items.map((i) => i.label).join(", ")}.`
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
      ? { h2: "✓ Booking confirmed", thanks: (n) => (serviceNoun ? `Thank you ${n}! Your booking with ${companyName} is confirmed for ` : `Thank you ${n}! Your cleaning is confirmed for `), calLink: "Add to my Google Calendar", subject: "✓ Booking confirmed" }
      : lang === "de"
      ? { h2: "✓ Buchung bestätigt", thanks: (n) => (serviceNoun ? `Vielen Dank${n ? ", " + n : ""}! Ihre Buchung bei ${companyName} ist bestätigt für ` : `Vielen Dank${n ? ", " + n : ""}! Ihre Reinigung ist bestätigt für `), calLink: "Zu meinem Google Kalender hinzufügen", subject: "✓ Buchung bestätigt" }
      : lang === "it"
      ? { h2: "✓ Prenotazione confermata", thanks: (n) => (serviceNoun ? `Grazie ${n}! La vostra prenotazione presso ${companyName} è confermata per ` : `Grazie ${n}! La vostra pulizia è confermata per `), calLink: "Aggiungere al mio Google Calendar", subject: "✓ Prenotazione confermata" }
      : { h2: "✓ Réservation confirmée", thanks: (n) => (serviceNoun ? `Merci ${n} ! Votre réservation auprès de ${companyName} est confirmée pour ` : `Merci ${n} ! Votre nettoyage est confirmé pour `), calLink: "Ajouter à mon Google Agenda", subject: "✓ Réservation confirmée" };

  const customerHtml = `
    <h2>${t.h2}</h2>
    <p>${t.thanks(customer.name || "")}<b>${fmtCHF(quote.total)}</b>.</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p><a href="${calLink}">${t.calLink}</a></p>
    ${signatureHtml(companyName, signature, logoUrl, tagline, lang)}
  `;
  const C = {
    fr: { h2: "✓ Nouvelle réservation confirmée", amount: "Montant", cal: "Ajouter à l'agenda Google de l'entreprise", feed: "📅 Ce rendez-vous apparaît tout seul dans votre agenda si vous y êtes abonné. Pas encore fait ? Ajoutez une fois ce lien dans Google Agenda (« À partir de l'URL »), Outlook (« S'abonner à partir du web ») ou Apple Calendrier (« Nouvel abonnement ») :" },
    en: { h2: "✓ New booking confirmed", amount: "Amount", cal: "Add to the company's Google Calendar", feed: "📅 This appointment shows up in your calendar by itself once you're subscribed. Not done yet? Add this link once in Google Calendar (\"From URL\"), Outlook (\"Subscribe from web\") or Apple Calendar (\"New Calendar Subscription\"):" },
    de: { h2: "✓ Neue Buchung bestätigt", amount: "Betrag", cal: "Zum Google Kalender des Unternehmens hinzufügen", feed: "📅 Dieser Termin erscheint von selbst in Ihrem Kalender, sobald Sie ihn abonniert haben. Noch nicht? Fügen Sie diesen Link einmal in Google Kalender («Per URL»), Outlook («Aus dem Web abonnieren») oder Apple Kalender («Neues Kalenderabonnement») hinzu:" },
    it: { h2: "✓ Nuova prenotazione confermata", amount: "Importo", cal: "Aggiungere al Google Calendar dell'impresa", feed: "📅 Questo appuntamento appare da solo nella vostra agenda se vi siete abbonati. Non ancora? Aggiungete una volta questo link in Google Calendar («Da URL»), Outlook («Sottoscrivi dal web») o Calendario Apple («Nuovo calendario in abbonamento»):" },
  }[lang] || {};
  const D = DECLINE_TEXT[lang] || DECLINE_TEXT.fr;
  const companyHtml = `
    <h2>${C.h2 || "✓ Nouvelle réservation confirmée"}</h2>
    <p><b>${D.client} :</b> ${customer.name || D.none}<br/>
       <b>${D.email} :</b> ${customer.email || D.none}<br/>
       <b>${D.phone} :</b> ${customer.phone || D.none}<br/>
       <b>${D.address} :</b> ${customer.address || D.noneF}</p>
    <p><b>${C.amount || "Montant"} :</b> ${fmtCHF(quote.total)}</p>
    <table>${quoteItemsHtml(quote)}</table>
    <p><a href="${calLink}">${C.cal || "Ajouter à l'agenda Google de l'entreprise"}</a></p>
    ${calendarFeedUrl ? `<p style="font-size:13px;color:#5b6473;">${C.feed}<br/><a href="${calendarFeedUrl}">${calendarFeedUrl}</a></p>` : ""}
  `;

  // The devis as a PDF, attached to both e-mails: the same document the
  // customer can download in the quote widget (docs/pdf-generator.js).
  const pdf = await buildQuotePdf({
    quote,
    customer,
    lang,
    // pdfCompany: a sector demo's fictional company (address, phone, e-mail).
    company: { name: companyName, email: notifyEmail, logoUrl, ...(pdfCompany || {}) },
  });
  const pdfAttachments = pdf ? [pdf] : undefined;

  // allSettled, not all: a failure notifying the company (e.g. an unreal
  // fallback address) must never break the confirmation for the customer,
  // who's watching this happen live and would otherwise see a raw SMTP
  // error instead of "your booking is confirmed".
  const [customerResult, companyResult] = await Promise.allSettled([
    customer.email
      ? sendEmail({ to: customer.email, subject: t.subject, html: customerHtml, replyTo: notifyEmail, attachments: pdfAttachments })
      : Promise.resolve({ simulated: true, skipped: "no customer email" }),
    sendEmail({ to: notifyEmail, subject: C.h2 || "✓ Nouvelle réservation confirmée", html: companyHtml, attachments: pdfAttachments }),
  ]);

  if (customerResult.status === "rejected") {
    console.error("[sendBookingConfirmation] customer confirmation failed:", customerResult.reason);
  }
  if (companyResult.status === "rejected") {
    console.error("[sendBookingConfirmation] company notification failed:", companyResult.reason);
  }

  return {
    calendarLink: calLink,
    // The SMTP error travels back to the demo (see deliveryOf in server.js)
    // so a failed send is shown as failed instead of looking like a success.
    customerEmail:
      customerResult.status === "fulfilled"
        ? customerResult.value
        : { simulated: true, failed: true, error: errorText(customerResult.reason) },
    companyEmail:
      companyResult.status === "fulfilled"
        ? companyResult.value
        : { simulated: true, failed: true, error: errorText(companyResult.reason) },
  };
}

// ---- Install-request notification (docs/contact-flow.js's #contact flow) ----
const { sectorLabel } = require("./sectors");

// Team e-mails follow the client's language when it is Italian (NS,
// 2026-11-11: Ticino clients are handled in Italian); French otherwise.
const TEAM_TXT = {
  fr: {
    installH2: "🚀 Nouvelle demande d'installation Dealz", company: "Entreprise", contact: "Contact", email: "E-mail", phone: "Téléphone", site: "Site web",
    none: "(non fourni)", sector: "Secteur", general: "— (page générale)", plan: "Formule", pricesIn: " — prix en ", waLabel: "WhatsApp Business", waIncluded: "inclus dans la formule",
    noSite: " (pas de site internet : bouton WhatsApp uniquement)", team: "Taille de l'équipe", problem: "Problème principal", sources: "Sources de demandes actuelles",
    installSubject: "🚀 Demande d'installation", newProspect: "nouveau prospect", billing: { yearly: "annuel", onetime: "paiement unique", monthly: "mensuel" },
    refH2: "🤝 Nouveau parrainage", refBy: "Parrainé par", refProspect: "prospect CRM", message: "Message", refSubject: "🤝 Parrainage", lang: "Langue",
  },
  it: {
    installH2: "🚀 Nuova richiesta di installazione Dealz", company: "Impresa", contact: "Contatto", email: "E-mail", phone: "Telefono", site: "Sito web",
    none: "(non indicato)", sector: "Settore", general: "— (pagina generale)", plan: "Piano", pricesIn: " — prezzi in ", waLabel: "WhatsApp Business", waIncluded: "incluso nel piano",
    noSite: " (nessun sito web: solo pulsante WhatsApp)", team: "Dimensione del team", problem: "Problema principale", sources: "Fonti attuali delle richieste",
    installSubject: "🚀 Richiesta di installazione", newProspect: "nuovo potenziale cliente", billing: { yearly: "annuale", onetime: "pagamento unico", monthly: "mensile" },
    refH2: "🤝 Nuovo passaparola", refBy: "Raccomandato da", refProspect: "potenziale cliente CRM", message: "Messaggio", refSubject: "🤝 Passaparola", lang: "Lingua",
  },
};

async function sendInstallRequestNotification({
  companyName,
  contactName,
  contactEmail,
  contactPhone,
  websiteUrl,
  planChoice,
  billingChoice,
  whatsappAddon,
  currency,
  teamSize,
  mainProblem,
  requestSources,
  sector,
  sectorLabel: sectorName,
  notifyEmail = DEALZ_TEAM_EMAIL,
  lang = "fr",
}) {
  const T = TEAM_TXT[lang] || TEAM_TXT.fr;
  const sep = lang === "fr" ? " :" : ":";
  const html = `
    <h2>${T.installH2}</h2>
    <p><b>${T.company}${sep}</b> ${companyName || T.none}<br/>
       <b>${T.contact}${sep}</b> ${contactName || T.none}<br/>
       <b>${T.email}${sep}</b> ${contactEmail || T.none}<br/>
       <b>${T.phone}${sep}</b> ${contactPhone || T.none}<br/>
       <b>${T.site}${sep}</b> ${websiteUrl || T.none}</p>
    <p><b>${T.sector}${sep}</b> ${sectorName || sector || T.general}<br/>
       <b>${T.plan}${sep}</b> ${planChoice || "—"} (${T.billing[billingChoice] || T.billing.monthly})${currency ? T.pricesIn + String(currency).toUpperCase() : ""}<br/>
       <b>${T.waLabel}${sep}</b> ${T.waIncluded}${websiteUrl ? "" : T.noSite}<br/>
       <b>${T.team}${sep}</b> ${teamSize || "—"}<br/>
       <b>${T.problem}${sep}</b> ${mainProblem || "—"}<br/>
       <b>${T.sources}${sep}</b> ${requestSources || "—"}<br/>
       <b>${T.lang}${sep}</b> ${String(lang).toUpperCase()}</p>
  `;
  return sendEmail({
    to: notifyEmail,
    subject: `${T.installSubject}${sectorName ? " (" + sectorName + ")" : ""} — ${companyName || contactEmail || T.newProspect}`,
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
  lang = "fr",
}) {
  const T = TEAM_TXT[lang] || TEAM_TXT.fr;
  const sep = lang === "fr" ? " :" : ":";
  const html = `
    <h2>${T.refH2}</h2>
    <p><b>${T.refBy}${sep}</b> ${T.refProspect} #${referredById}</p>
    <p><b>${T.company}${sep}</b> ${companyName || T.none}<br/>
       <b>${T.email}${sep}</b> ${contactEmail || T.none}<br/>
       <b>${T.phone}${sep}</b> ${contactPhone || T.none}</p>
    ${note ? `<p><b>${T.message}${sep}</b> ${note}</p>` : ""}
  `;
  return sendEmail({
    to: notifyEmail,
    subject: `${T.refSubject} — ${companyName || contactEmail || T.newProspect}`,
    html,
  });
}

module.exports = {
  sendEmail,
  googleCalendarLink,
  signatureHtml,
  errorText,
  sendEmail,
  sendDeclineNotification,
  sendCounterofferToCustomer,
  sendRescheduleToCustomer,
  sendRevisedOfferToCustomer,
  sendReplyToCustomer,
  sendFollowupToCustomer,
  sendBookingConfirmation,
  sendInstallRequestNotification,
  sectorLabel,
  sendReferralNotification,
  googleCalendarLink,
  COMPANY_NOTIFY_EMAIL,
  DEALZ_TEAM_EMAIL,
};
