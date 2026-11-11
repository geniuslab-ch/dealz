const { sendEmail, DEALZ_TEAM_EMAIL } = require("./notifications");
const crm = require("./crm");
const META = require("./sector-meta.json");
const { buildProcuration } = require("./procuration");

/**
 * The client onboarding form (docs/integration.html + docs/onboarding-form.js).
 *
 *   link(sessionId, lang)  → the personal form link, sent in the welcome
 *                            e-mail right after a Stripe payment (billing.js).
 *   sendWelcome(...)       → that welcome e-mail, in the client's language.
 *   prefill(session, lang) → what Stripe already knows (company, contact,
 *                            plan, website, currency) + the sector list.
 *   submit(body)           → the answers: e-mail to the Dealz team, a note
 *                            on the client in the CRM, a copy to the client.
 *
 * The form also works without a session (plain /integration.html link sent
 * by hand): nothing is prefilled, the client types everything.
 */

const LANGS = ["fr", "en", "de", "it"];
const langOf = (l) => (LANGS.includes(l) ? l : "fr");
const BASE = () => (process.env.APP_BASE_URL && !/localhost/.test(process.env.APP_BASE_URL) ? process.env.APP_BASE_URL : "https://dealz.website").replace(/\/$/, "");
const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

function link(sessionId, lang) {
  const l = langOf(lang);
  const page = l === "fr" ? "/integration.html" : `/${l}/integration.html`;
  return BASE() + page + (sessionId && SESSION_RE.test(sessionId) ? "?s=" + encodeURIComponent(sessionId) : "");
}

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---- welcome e-mail (after payment) ----

const WELCOME = {
  fr: {
    subject: (c) => (c ? `Votre installation Dealz pour ${c}` : "Votre installation Dealz : dernière étape"),
    hello: (n) => `Bonjour${n ? " " + n : ""},`,
    body: "Merci pour votre confiance, votre paiement est bien reçu. Pour que votre Dealz envoie des devis justes dès le premier jour, nous avons besoin de quelques informations sur vos prix, votre zone et votre WhatsApp.",
    time: "Le formulaire prend environ 10 minutes. Vos réponses sont gardées si vous faites une pause.",
    cta: "Remplir mon formulaire d'intégration",
    after: "À la fin du formulaire, un calendrier vous permet de réserver directement votre rendez-vous d'intégration de 30 minutes avec nous.",
    sign: "L'équipe Dealz",
  },
  en: {
    subject: (c) => (c ? `Your Dealz setup for ${c}` : "Your Dealz setup: last step"),
    hello: (n) => `Hello${n ? " " + n : ""},`,
    body: "Thank you for your trust, your payment has been received. So that your Dealz sends accurate quotes from day one, we need a few details about your prices, your area and your WhatsApp.",
    time: "The form takes about 10 minutes. Your answers are kept if you take a break.",
    cta: "Fill in my onboarding form",
    after: "At the end of the form, a calendar lets you book your 30-minute onboarding meeting with us straight away.",
    sign: "The Dealz team",
  },
  de: {
    subject: (c) => (c ? `Ihre Dealz-Einrichtung für ${c}` : "Ihre Dealz-Einrichtung: letzter Schritt"),
    hello: (n) => `Guten Tag${n ? " " + n : ""},`,
    body: "Vielen Dank für Ihr Vertrauen, Ihre Zahlung ist eingegangen. Damit Ihr Dealz vom ersten Tag an genaue Offerten verschickt, brauchen wir ein paar Angaben zu Ihren Preisen, Ihrem Gebiet und Ihrem WhatsApp.",
    time: "Das Formular dauert etwa 10 Minuten. Ihre Antworten bleiben gespeichert, wenn Sie eine Pause machen.",
    cta: "Mein Einrichtungsformular ausfüllen",
    after: "Am Ende des Formulars können Sie Ihr 30-minütiges Einrichtungsgespräch mit uns direkt im Kalender buchen.",
    sign: "Ihr Dealz-Team",
  },
  it: {
    subject: (c) => (c ? `La vostra messa in servizio Dealz per ${c}` : "La vostra messa in servizio Dealz: ultimo passo"),
    hello: (n) => `Buongiorno${n ? " " + n : ""},`,
    body: "Grazie per la vostra fiducia, abbiamo ricevuto il vostro pagamento. Perché il vostro Dealz invii preventivi precisi fin dal primo giorno, ci servono alcune informazioni sui vostri prezzi, la vostra zona e il vostro WhatsApp.",
    time: "Il modulo richiede circa 10 minuti. Le vostre risposte restano salvate se fate una pausa.",
    cta: "Compilare il mio modulo di messa in servizio",
    after: "Alla fine del modulo, un calendario vi permette di prenotare subito il vostro incontro di messa in servizio di 30 minuti con noi.",
    sign: "Il team Dealz",
  },
};

function button(href, label) {
  return `<p style="margin:26px 0;"><a href="${esc(href)}" style="display:inline-block;background:#0b5fff;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;">${esc(label)} →</a></p>`;
}

function shell(inner) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#10131a;max-width:560px;">
  <div style="background:#ffffff;padding:16px 22px;border:1px solid #e4e9f2;border-bottom:4px solid #0b5fff;border-radius:16px 16px 0 0;">
    <img src="${BASE()}/images/dealz-logo-sm.png" alt="Dealz" height="40" style="display:block;" />
  </div>
  <div style="border:1px solid #e4e9f2;border-top:none;border-radius:0 0 16px 16px;padding:22px;">${inner}</div>
</div>`;
}

async function sendWelcome({ to, name, company, lang, sessionId }) {
  if (!to) return { skipped: true };
  const w = WELCOME[langOf(lang)];
  const url = link(sessionId, lang);
  const html = shell(`
    <p>${esc(w.hello(name))}</p>
    <p>${esc(w.body)}</p>
    <p>${esc(w.time)}</p>
    ${button(url, w.cta)}
    <p style="font-size:13px;color:#5b6472;">${esc(url)}</p>
    <p>${esc(w.after)}</p>
    <p>${esc(w.sign)}<br/><a href="mailto:info@dealz.website" style="color:#0b5fff;">info@dealz.website</a></p>`);
  // A plain, personal subject (no emoji, no capitals, no "free"/"urgent"),
  // so spam filters read it as the transactional e-mail it is.
  return sendEmail({ to, subject: w.subject(String(company || "").trim().slice(0, 80)), html, replyTo: "info@dealz.website" });
}

// ---- prefill ----

function sectorList(lang) {
  const l = langOf(lang);
  return Object.keys(META)
    .map((slug) => ({ slug, label: (META[slug].i18n && META[slug].i18n[l] && META[slug].i18n[l].label) || META[slug].label }))
    .sort((a, b) => a.label.localeCompare(b.label, l));
}

// session: a Stripe Checkout Session (or null). Only fields the form asks.
function prefillFrom(session) {
  if (!session) return {};
  const m = session.metadata || {};
  const email = (session.customer_details && session.customer_details.email) || session.customer_email || "";
  const out = {
    company: m.company_name || "",
    contact_name: m.contact_name || (session.customer_details && session.customer_details.name) || "",
    contact_email: email,
    contact_phone: m.contact_phone || "",
    plan: ["CAPTURE", "CLOSE", "SCALE"].includes(m.plan) ? m.plan : "",
    currency: session.currency ? String(session.currency).toUpperCase() : "",
    country: { chf: "CH", eur: "FR", gbp: "UK", usd: "US" }[String(session.currency || "").toLowerCase()] || "",
  };
  if (m.website_url) {
    out.website = m.website_url;
  }
  Object.keys(out).forEach((k) => !out[k] && delete out[k]);
  return out;
}

// ---- submit ----

// Files uploaded in the form (price list, services list): attached to the
// team e-mail only. Any office format is fine; nothing executable.
const MAX_FILE_BYTES = 3 * 1024 * 1024 + 1024;
const FILE_EXT = /\.(xlsx|xls|xlsm|csv|ods|numbers|pdf|doc|docx|odt|pages|txt|rtf|png|jpe?g|heic|webp)$/i;
const FILE_FIELDS = { price_files: "Prestations et prix", logo_files: "Logo" };

function cleanFiles(list) {
  if (!Array.isArray(list)) return [];
  let total = 0;
  const out = [];
  for (const f of list.slice(0, 10)) {
    if (!f || !FILE_FIELDS[f.field] || typeof f.data !== "string") continue;
    const filename = String(f.name || "fichier").replace(/[\\/\r\n"<>]/g, "_").slice(0, 150);
    if (!FILE_EXT.test(filename)) continue;
    const content = Buffer.from(f.data, "base64");
    total += content.length;
    if (!content.length || content.length > MAX_FILE_BYTES || total > MAX_FILE_BYTES) continue;
    out.push({ field: f.field, label: FILE_FIELDS[f.field], filename, content });
  }
  return out;
}

const MAX_FIELD = 4000;
const MAX_ROWS = 80;

// The browser sends its own labelled summary (FR for the team, the client's
// language for their copy); only its shape is trusted, never its HTML.
function cleanSummary(summary) {
  if (!Array.isArray(summary)) return [];
  return summary.slice(0, 12).map((s) => ({
    title: String((s && s.title) || "").slice(0, 120),
    rows: (Array.isArray(s && s.rows) ? s.rows : [])
      .slice(0, MAX_ROWS)
      .map((r) => [String((r && r[0]) || "").slice(0, 300), String((r && r[1]) || "").slice(0, MAX_FIELD)]),
  }));
}

function summaryHtml(sections) {
  return sections
    .map(
      (s) => `<h3 style="font-size:15px;margin:22px 0 8px;color:#0b5fff;">${esc(s.title)}</h3>
<table style="border-collapse:collapse;width:100%;font-size:13.5px;">${s.rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 10px 6px 0;color:#5b6472;vertical-align:top;width:42%;border-bottom:1px solid #eef1f6;">${esc(k)}</td><td style="padding:6px 0;vertical-align:top;border-bottom:1px solid #eef1f6;white-space:pre-wrap;">${v ? esc(v) : "—"}</td></tr>`
        )
        .join("")}</table>`
    )
    .join("");
}

function summaryText(sections) {
  return sections.map((s) => `## ${s.title}\n` + s.rows.map(([k, v]) => `- ${k} : ${v || "—"}`).join("\n")).join("\n\n");
}

const DONE = {
  fr: { subject: "Vos réponses d'intégration Dealz", intro: "Merci ! Voici une copie de vos réponses. Une correction ? Répondez simplement à cet e-mail.", book: "Pas encore réservé votre rendez-vous d'intégration de 30 minutes ? Choisissez votre créneau ici :" },
  en: { subject: "Your Dealz onboarding answers", intro: "Thank you! Here is a copy of your answers. Anything to correct? Just reply to this email.", book: "Not booked your 30-minute onboarding meeting yet? Pick your slot here:" },
  de: { subject: "Ihre Dealz-Einrichtungsantworten", intro: "Vielen Dank! Hier ist eine Kopie Ihrer Antworten. Etwas zu korrigieren? Antworten Sie einfach auf diese E-Mail.", book: "Ihr 30-minütiges Einrichtungsgespräch noch nicht gebucht? Wählen Sie hier Ihren Termin:" },
  it: { subject: "Le vostre risposte per la messa in servizio Dealz", intro: "Grazie! Ecco una copia delle vostre risposte. Qualcosa da correggere? Rispondete semplicemente a questa e-mail.", book: "Non avete ancora prenotato il vostro incontro di messa in servizio di 30 minuti? Scegliete qui il vostro orario:" },
};

const CRM_COMPANIES_URL = "https://dealz.website/crm/companies.html";
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml" };

// What the CRM company record can take from the form. Prices beyond the
// minimum stay in the uploaded file until the team checks them.
function companyPayload(a, attached, company, email) {
  const num = (v) => {
    const n = parseFloat(String(v == null ? "" : v).replace(",", ".").replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };
  const miles = a.country === "UK" || a.country === "US";
  const free = num(a.free_km);
  const firstEmail = String(a.alert_emails || "").split(/[\s,;]+/).find((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
  const logo = attached.find((f) => f.field === "logo_files" && MIME[(f.filename.split(".").pop() || "").toLowerCase()]);
  const prices = attached.find((f) => f.field === "price_files" && /\.xlsx$/i.test(f.filename));
  const color = String(a.brand_color || "").trim();
  return {
    name: company,
    notifyEmail: firstEmail || email,
    website: String(a.website || "").trim().slice(0, 400) || undefined,
    brandColor: /^#[0-9a-f]{6}$/i.test(color) ? color : undefined,
    signature: String(a.signature || "").trim().slice(0, 1000) || undefined,
    plan: ["CAPTURE", "CLOSE", "SCALE"].includes(a.plan) ? a.plan : undefined,
    // Only when the client said customers already write to that number
    // (the form hides the field otherwise but keeps a value typed before).
    whatsappNumber: ["business", "personal"].includes(a.wa_status) ? String(a.wa_number || "").trim().slice(0, 40) || undefined : undefined,
    logo: logo ? { name: logo.filename, type: MIME[logo.filename.split(".").pop().toLowerCase()], data: logo.content.toString("base64") } : undefined,
    priceFile: prices ? { name: prices.filename, data: prices.content.toString("base64") } : undefined,
    pricing: {
      currency: a.currency || { CH: "CHF", FR: "EUR", UK: "GBP", US: "USD" }[a.country] || undefined,
      minimum_price: num(a.minimum),
      free_within_km: free === undefined ? undefined : Math.round(miles ? free * 1.609 : free),
      min_lead_time_hours: { "24h": 24, "48h": 48, "1w": 168 }[a.lead_time],
    },
  };
}

async function submit({ body, session }) {
  const a = (body && typeof body.answers === "object" && body.answers) || {};
  const str = (v) => String(v == null ? "" : v).trim().slice(0, 300);
  const email = str(a.contact_email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error("E-mail requis"), { status: 400 });
  const company = str(a.company) || email;
  const lang = langOf(body.lang);
  const team = cleanSummary(body.summary);
  const mine = cleanSummary(body.clientSummary).length ? cleanSummary(body.clientSummary) : team;
  if (!team.length) throw Object.assign(new Error("Réponses manquantes"), { status: 400 });

  const attached = cleanFiles(body.files);

  // Authorisation letter for the client's web agency, when they gave it.
  const PROC_NAME = { fr: "Procuration-Dealz", en: "Authorisation-Dealz", de: "Vollmacht-Dealz", it: "Procura-Dealz" };
  let procuration = null;
  if (a.procuration === true && str(a.agency_name)) {
    const date = new Date().toLocaleDateString({ fr: "fr-CH", en: "en-GB", de: "de-CH", it: "it-CH" }[lang], { year: "numeric", month: "long", day: "numeric" });
    procuration = {
      filename: `${PROC_NAME[lang]}-${company.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\-]+/g, "-").slice(0, 60)}.pdf`,
      content: buildProcuration({
        lang, name: str(a.contact_name) || email, email, company,
        agency: str(a.agency_name), agencyContact: str(a.agency_contact) || "—",
        website: str(a.website) || "—", date,
      }),
    };
    attached.push({ label: "Procuration (PDF généré)", filename: procuration.filename, content: procuration.content });
  }
  // Pre-fill the client's company in the CRM (dealz-crm /api/onboarding-company):
  // created, or only its empty fields filled. Before the team e-mail, so
  // the e-mail can say what happened.
  // Only for a confirmed Stripe payment: the form page itself is public, and
  // a delayed payment method can come back to the site before it is paid.
  const isPaid = !!session && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  const crmCompany = isPaid
    ? await crm.post("onboardingCompany", companyPayload(a, attached, company, email), { timeoutMs: 15000 }).catch((err) => ({ error: err.message }))
    : { skipped: session ? "paiement Stripe pas encore confirmé" : "formulaire sans lien de paiement" };
  const crmLine = crmCompany && crmCompany.id
    ? `<p style="margin:10px 0 0;">🏢 <b>CRM :</b> fiche entreprise <a href="${esc(CRM_COMPANIES_URL)}?id=${encodeURIComponent(crmCompany.id)}">${esc(crmCompany.id)}</a> ${crmCompany.created ? "créée" : "complétée"} (${esc((crmCompany.filled || []).join(", ") || "rien à compléter")}). ${crmCompany.pricingFromTemplate ? "Grille lue depuis notre modèle Excel." : "⚠️ Grille à vérifier à partir du fichier de prix joint avant de connecter WhatsApp."}</p>`
    : `<p style="margin:10px 0 0;">🏢 <b>CRM :</b> fiche entreprise non créée (${esc((crmCompany && (crmCompany.error || crmCompany.skipped)) || "inconnu")}), à créer à la main.</p>`;
  const filesLine = attached.length
    ? `<p style="margin:10px 0 0;">📎 <b>Fichiers joints :</b> ${attached.map((f) => `${esc(f.label)} (${esc(f.filename)})`).join(" · ")}</p>`
    : "";

  const it = lang === "it";
  const paid = session
    ? (it ? `Pagamento Stripe collegato: ${esc(session.id)}${session.customer ? " · cliente " + esc(session.customer) : ""}${isPaid ? "" : " · ⚠️ pagamento non ancora confermato"}`
          : `Paiement Stripe lié : ${esc(session.id)}${session.customer ? " · client " + esc(session.customer) : ""}${isPaid ? "" : " · ⚠️ paiement pas encore confirmé"}`)
    : it ? "Modulo aperto senza link di pagamento (link inviato a mano)." : "Formulaire ouvert sans lien de paiement (lien envoyé à la main).";
  const teamHtml = it ? shell(`
    <h2 style="margin:0 0 6px;font-size:19px;">📋 Modulo di messa in servizio ricevuto</h2>
    <p style="margin:0 0 4px;"><b>${esc(company)}</b> · ${esc(str(a.contact_name))} · <a href="mailto:${esc(email)}">${esc(email)}</a> · ${esc(str(a.contact_phone))}</p>
    <p style="margin:0;font-size:13px;color:#5b6472;">${paid} · Lingua: IT</p>
    ${filesLine}
    ${crmLine}
    ${summaryHtml(team)}
    <p style="margin-top:22px;">→ Prossimo passo: il cliente prenota l'incontro di 30 minuti su Calendly (altrimenti, le sue disponibilità sono qui sopra), poi verificare la scheda impresa nel CRM.</p>`) : shell(`
    <h2 style="margin:0 0 6px;font-size:19px;">📋 Formulaire d'intégration reçu</h2>
    <p style="margin:0 0 4px;"><b>${esc(company)}</b> · ${esc(str(a.contact_name))} · <a href="mailto:${esc(email)}">${esc(email)}</a> · ${esc(str(a.contact_phone))}</p>
    <p style="margin:0;font-size:13px;color:#5b6472;">${paid} · Langue : ${lang.toUpperCase()}</p>
    ${filesLine}
    ${crmLine}
    ${summaryHtml(team)}
    <p style="margin-top:22px;">→ Prochaine étape : le client réserve la réunion de 30 minutes sur Calendly (sinon, ses disponibilités sont ci-dessus), puis vérifier la fiche entreprise dans le CRM.</p>`);

  const results = await Promise.allSettled([
    sendEmail({ to: DEALZ_TEAM_EMAIL, subject: `📋 ${it ? "Messa in servizio" : "Intégration"} — ${company}`, html: teamHtml, replyTo: email, attachments: attached.map(({ filename, content }) => ({ filename, content })) }),
    crm.post("billingEvents", { type: "onboarding", email, companyName: company, note: `📋 Formulaire d'intégration reçu${attached.length ? " (fichiers dans l'e-mail : " + attached.map((f) => f.filename).join(", ") + ")" : ""}\n\n${summaryText(team)}`.slice(0, 20000) }),
    sendEmail({ to: email, subject: DONE[lang].subject, html: shell(`<p>${esc(DONE[lang].intro)}</p>${calendlyUrl() ? `<p>${esc(DONE[lang].book)} <a href="${esc(calendlyUrl())}" style="color:#0b5fff;">${esc(calendlyUrl())}</a></p>` : ""}${summaryHtml(mine)}`), replyTo: "info@dealz.website", attachments: procuration ? [procuration] : undefined }),
  ]);
  results.forEach((r, i) => r.status === "rejected" && console.error(`[onboarding] side effect ${i} failed:`, r.reason && r.reason.message));
  if (results[0].status === "rejected") throw Object.assign(new Error("Envoi impossible"), { status: 502 });
  return { ok: true };
}

// The Calendly page where clients book the 30-minute meeting. CALENDLY_URL
// (Vercel env) overrides the default; an invalid one falls back to asking
// for the client's availability.
const DEFAULT_CALENDLY = "https://calendly.com/dealz-website/30min";
function calendlyUrl() {
  const u = String(process.env.CALENDLY_URL || DEFAULT_CALENDLY).trim();
  return /^https:\/\/calendly\.com\/[\w\-/]+$/.test(u) ? u : "";
}

module.exports = { calendlyUrl, link, sendWelcome, sectorList, prefillFrom, submit, SESSION_RE };
