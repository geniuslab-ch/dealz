const fs = require("fs");
const path = require("path");
const store = require("./store");
const { getSector } = require("./sectors");

/**
 * WhatsApp version of the sector demos (docs/secteurs/<slug>/demo.html):
 * the same questions, the same pricing function and the same decline →
 * counter-offer → accept chain as the website widget (docs/sector-quote.js),
 * driven by numbered replies instead of chips.
 *
 * The tester plays the customer right here on WhatsApp; the e-mails the
 * fictional company would receive (decline with its action button, booking)
 * go to the e-mail address they give at the end of the questions. When the
 * "company" then sends a counter-offer from that e-mail, it comes back to
 * the tester on WhatsApp (notifyCustomer below, called by server.js).
 *
 * Conversation state lives in src/store.js under one fixed key per sender,
 * because Vercel's serverless instances share no memory between messages.
 */

const DATA_DIR = path.join(__dirname, "..", "docs", "secteurs", "data");
const SECTORS = {};
for (const f of fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".js")).sort()) {
  const S = require(path.join(DATA_DIR, f));
  SECTORS[S.slug] = S;
}
const SLUGS = Object.keys(SECTORS);
const LANGS = ["fr", "en", "de"];

// Set once by server.js — the same functions behind /api/decline,
// /api/accept and /api/lead, so WhatsApp and the website send identical
// e-mails and CRM updates.
let deps = { processDecline: null, processAccept: null, recordLead: null, baseUrl: () => "" };
function configure(d) {
  deps = { ...deps, ...d };
}

const UI = {
  fr: {
    hello: "👋 Bienvenue dans la démo WhatsApp de *Dealz* !",
    pickSector: "Quel métier voulez-vous tester ? Répondez avec le numéro :",
    intro: (brand, label) => `Vous êtes le client de *${brand}* (exemple fictif — ${label}). Je vous pose quelques questions, puis je vous envoie un devis ferme, calculé avec les tarifs de l'entreprise.`,
    single: "_Répondez avec le numéro._",
    multi: "_Répondez avec un ou plusieurs numéros (ex. 1,3), ou 0 pour aucun._",
    none: "Aucune",
    date: (min) => `_Répondez avec une date (ex. ${min}), au plus tôt le ${min}._`,
    dateErr: (min) => `Merci d'indiquer une date valide, au plus tôt le ${min} (format JJ.MM.AAAA).`,
    misunderstood: "Je n'ai pas bien compris — répondez avec le numéro d'une option.",
    askEmail: (brand) => `Dernière étape : votre *adresse e-mail*.\n\nVous jouez le client ici, sur WhatsApp. Les e-mails que recevrait *${brand}* (refus avec action en un clic, réservation) arriveront à cette adresse — vous voyez ainsi les deux côtés.`,
    emailErr: "Cette adresse ne semble pas valide — réessayez (ex. nom@entreprise.ch).",
    quoteHead: (brand) => `🧾 *Devis ferme — ${brand}*`,
    total: "TOTAL",
    minimum: "Supplément au minimum de commande",
    decide: "Répondez *1* pour accepter ✅ ou *2* pour refuser ❌.",
    decideAgain: "Répondez *1* pour accepter ce devis, ou *2* pour le refuser.",
    accepted: (brand, email) => `✅ Réservation confirmée ! *${brand}* vient d'être notifiée — l'e-mail de réservation est parti à ${email}.`,
    calendar: "📅 Ajouter à l'agenda :",
    declineAsk: "Bien sûr. Qu'est-ce qui ne convenait pas ? Répondez avec le numéro, ou écrivez avec vos mots :",
    declined: (brand, email) => `Merci pour votre retour ! *${brand}* vient de recevoir le refus par e-mail (envoyé à ${email}), avec le motif, une réponse suggérée et un bouton d'action.\n\n👉 Ouvrez cet e-mail et faites une contre-offre : elle arrivera ici, sur WhatsApp.`,
    mailFailed: "⚠️ L'e-mail n'a pas pu être envoyé :",
    restart: "Pour recommencer ou tester un autre métier, écrivez *menu*.",
    error: "Un souci technique est survenu — réessayez dans un instant, ou écrivez *menu* pour recommencer.",
    textOnly: "Merci d'écrire votre réponse en texte — je ne traite pas encore les photos, notes vocales ou fichiers.",
    newOffer: (c, amt) => `💬 *${c}* vous propose une nouvelle offre : *${amt}*`,
    newDate: (c, d) => `📅 *${c}* vous propose une nouvelle date : *${d}*`,
    revised: (c, amt) => `🧾 *${c}* vous envoie un devis révisé : *${amt}*`,
    followup: (c) => `👋 *${c}* : votre devis est toujours disponible.`,
    reply: (c) => `💬 Réponse de *${c}* :`,
    viewOffer: "Voir l'offre et l'accepter :",
    booked: (c) => `✅ Réservation confirmée avec *${c}* — merci !`,
    end: "Merci d'avoir testé Dealz ! 🙌 Pour l'installer sur votre site et votre WhatsApp : https://dealz.website",
  },
  en: {
    hello: "👋 Welcome to the *Dealz* WhatsApp demo!",
    pickSector: "Which trade would you like to try? Reply with the number:",
    intro: (brand, label) => `You're a customer of *${brand}* (fictional example — ${label}). I'll ask you a few questions, then send you a firm quote calculated with the company's own rates.`,
    single: "_Reply with the number._",
    multi: "_Reply with one or more numbers (e.g. 1,3), or 0 for none._",
    none: "None",
    date: (min) => `_Reply with a date (e.g. ${min}), no earlier than ${min}._`,
    dateErr: (min) => `Please give a valid date, no earlier than ${min} (format DD.MM.YYYY).`,
    misunderstood: "Sorry, I didn't get that — reply with the number of an option.",
    askEmail: (brand) => `Last step: your *email address*.\n\nYou're playing the customer here on WhatsApp. The emails *${brand}* would receive (decline with a one-click action, booking) will go to this address — so you see both sides.`,
    emailErr: "That address doesn't look valid — please try again (e.g. name@company.ch).",
    quoteHead: (brand) => `🧾 *Firm quote — ${brand}*`,
    total: "TOTAL",
    minimum: "Minimum order adjustment",
    decide: "Reply *1* to accept ✅ or *2* to decline ❌.",
    decideAgain: "Reply *1* to accept this quote, or *2* to decline it.",
    accepted: (brand, email) => `✅ Booking confirmed! *${brand}* has just been notified — the booking email went to ${email}.`,
    calendar: "📅 Add to calendar:",
    declineAsk: "Of course. What didn't suit you? Reply with the number, or write it in your own words:",
    declined: (brand, email) => `Thanks for your feedback! *${brand}* has just received the decline by email (sent to ${email}), with the reason, a suggested reply and an action button.\n\n👉 Open that email and make a counter-offer: it will arrive right here on WhatsApp.`,
    mailFailed: "⚠️ The email could not be sent:",
    restart: "To start again or try another trade, type *menu*.",
    error: "A technical problem occurred — please try again in a moment, or type *menu* to start over.",
    textOnly: "Please write your answer as text — I can't handle photos, voice notes or files yet.",
    newOffer: (c, amt) => `💬 *${c}* is offering you a new price: *${amt}*`,
    newDate: (c, d) => `📅 *${c}* is proposing a new date: *${d}*`,
    revised: (c, amt) => `🧾 *${c}* is sending you a revised quote: *${amt}*`,
    followup: (c) => `👋 *${c}*: your quote is still available.`,
    reply: (c) => `💬 Reply from *${c}*:`,
    viewOffer: "View the offer and accept it:",
    booked: (c) => `✅ Booking confirmed with *${c}* — thank you!`,
    end: "Thanks for trying Dealz! 🙌 To set it up on your website and WhatsApp: https://dealz.website",
  },
  de: {
    hello: "👋 Willkommen zur WhatsApp-Demo von *Dealz*!",
    pickSector: "Welche Branche möchten Sie testen? Antworten Sie mit der Nummer:",
    intro: (brand, label) => `Sie sind Kunde von *${brand}* (fiktives Beispiel — ${label}). Ich stelle Ihnen ein paar Fragen und sende Ihnen dann eine verbindliche Offerte, berechnet mit den Tarifen des Unternehmens.`,
    single: "_Antworten Sie mit der Nummer._",
    multi: "_Antworten Sie mit einer oder mehreren Nummern (z. B. 1,3), oder 0 für keine._",
    none: "Keine",
    date: (min) => `_Antworten Sie mit einem Datum (z. B. ${min}), frühestens am ${min}._`,
    dateErr: (min) => `Bitte geben Sie ein gültiges Datum an, frühestens am ${min} (Format TT.MM.JJJJ).`,
    misunderstood: "Das habe ich nicht verstanden — antworten Sie mit der Nummer einer Option.",
    askEmail: (brand) => `Letzter Schritt: Ihre *E-Mail-Adresse*.\n\nSie spielen hier auf WhatsApp den Kunden. Die E-Mails, die *${brand}* erhalten würde (Absage mit Aktion per Klick, Buchung), gehen an diese Adresse — so sehen Sie beide Seiten.`,
    emailErr: "Diese Adresse scheint ungültig — bitte erneut versuchen (z. B. name@firma.ch).",
    quoteHead: (brand) => `🧾 *Verbindliche Offerte — ${brand}*`,
    total: "TOTAL",
    minimum: "Aufschlag auf Mindestbestellwert",
    decide: "Antworten Sie *1* zum Annehmen ✅ oder *2* zum Ablehnen ❌.",
    decideAgain: "Antworten Sie *1*, um diese Offerte anzunehmen, oder *2*, um sie abzulehnen.",
    accepted: (brand, email) => `✅ Buchung bestätigt! *${brand}* wurde soeben benachrichtigt — die Buchungs-E-Mail ging an ${email}.`,
    calendar: "📅 Zum Kalender hinzufügen:",
    declineAsk: "Natürlich. Was hat nicht gepasst? Antworten Sie mit der Nummer oder in Ihren eigenen Worten:",
    declined: (brand, email) => `Danke für Ihre Rückmeldung! *${brand}* hat die Absage soeben per E-Mail erhalten (an ${email}), mit Grund, Antwortvorschlag und Aktionsbutton.\n\n👉 Öffnen Sie diese E-Mail und machen Sie ein Gegenangebot: Es kommt hier auf WhatsApp an.`,
    mailFailed: "⚠️ Die E-Mail konnte nicht gesendet werden:",
    restart: "Um neu zu beginnen oder eine andere Branche zu testen, schreiben Sie *menu*.",
    error: "Ein technisches Problem ist aufgetreten — bitte versuchen Sie es gleich nochmals, oder schreiben Sie *menu*.",
    textOnly: "Bitte schreiben Sie Ihre Antwort als Text — Fotos, Sprachnachrichten oder Dateien kann ich noch nicht verarbeiten.",
    newOffer: (c, amt) => `💬 *${c}* macht Ihnen ein neues Angebot: *${amt}*`,
    newDate: (c, d) => `📅 *${c}* schlägt Ihnen ein neues Datum vor: *${d}*`,
    revised: (c, amt) => `🧾 *${c}* sendet Ihnen eine überarbeitete Offerte: *${amt}*`,
    followup: (c) => `👋 *${c}*: Ihre Offerte ist weiterhin verfügbar.`,
    reply: (c) => `💬 Antwort von *${c}*:`,
    viewOffer: "Angebot ansehen und annehmen:",
    booked: (c) => `✅ Buchung bestätigt mit *${c}* — vielen Dank!`,
    end: "Danke, dass Sie Dealz getestet haben! 🙌 Für Ihre Website und Ihr WhatsApp: https://dealz.website",
  },
};

// Same reasons, same order and same category keys as the website widget.
const OBJECTIONS = {
  fr: [["price", "💰 Le prix est trop élevé"], ["timing", "📅 La date ne convient pas"], ["scope", "✂️ Je n'ai pas besoin de tout"], ["conditions", "📋 Les conditions/détails ne conviennent pas"], ["thinking", "🤔 Je dois réfléchir"], ["competitor", "🆚 J'ai reçu une autre offre"], ["information", "❓ J'ai une autre question"], ["not_needed", "⚪ Je n'ai plus besoin du service"]],
  en: [["price", "💰 The price is too high"], ["timing", "📅 The date doesn't suit me"], ["scope", "✂️ I don't need everything"], ["conditions", "📋 The terms/details don't suit me"], ["thinking", "🤔 I need to think about it"], ["competitor", "🆚 I received another offer"], ["information", "❓ I have another question"], ["not_needed", "⚪ I no longer need the service"]],
  de: [["price", "💰 Der Preis ist zu hoch"], ["timing", "📅 Das Datum passt nicht"], ["scope", "✂️ Ich brauche nicht alles"], ["conditions", "📋 Die Bedingungen/Details passen nicht"], ["thinking", "🤔 Ich muss darüber nachdenken"], ["competitor", "🆚 Ich habe ein anderes Angebot erhalten"], ["information", "❓ Ich habe eine weitere Frage"], ["not_needed", "⚪ Ich brauche die Leistung nicht mehr"]],
};

// ---- the pre-filled first message from the "Try it on WhatsApp" button ----

const PREFILL = {
  fr: (label) => `Bonjour, je voudrais tester la démo Dealz — ${label}`,
  en: (label) => `Hello, I'd like to try the Dealz demo — ${label}`,
  de: (label) => `Hallo, ich möchte die Dealz-Demo testen — ${label}`,
};

// The "#slug" tag at the end makes detection exact; labels and greetings
// are only a fallback for people who type the message themselves.
function prefillText(slug, lang) {
  const S = SECTORS[slug];
  const l = LANGS.includes(lang) ? lang : "fr";
  if (!S) return PREFILL[l]("").replace(/ — $/, "");
  return `${PREFILL[l](S[l].label)} (#${slug})`;
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9#-]+/g, " ").replace(/\s+/g, " ").trim();
}

function detectLang(text) {
  const t = norm(text);
  if (/\b(hallo|guten|gruezi|ich|mochte|offerte)\b/.test(t)) return "de";
  if (/\b(hello|hi|hey|i d|like|try|quote)\b/.test(t)) return "en";
  if (/\b(bonjour|salut|je|voudrais|devis)\b/.test(t)) return "fr";
  return null;
}

function detectSector(text) {
  const tag = String(text).match(/#([a-z0-9-]+)/i);
  if (tag && SECTORS[tag[1].toLowerCase()]) {
    const slug = tag[1].toLowerCase();
    // The label right before the tag tells which language the page was in.
    const lang = LANGS.find((l) => norm(text).includes(norm(SECTORS[slug][l].label))) || null;
    return { slug, lang };
  }
  const t = " " + norm(text) + " ";
  for (const slug of SLUGS) {
    for (const l of LANGS) {
      if (t.includes(" " + norm(SECTORS[slug][l].label) + " ")) return { slug, lang: l };
    }
  }
  return null;
}

// ---- quote engine (mirrors docs/sector-quote.js) ----

function fill(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined ? vars[k] : m));
}
const H = {
  clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
  round5: (v) => Math.round(v / 5) * 5,
  round1: (v) => Math.round(v),
};
function fmtCHF(n) {
  return "CHF " + Number(n).toFixed(2);
}
function isoDatePlus(days) {
  const d = new Date(Date.now() + days * 864e5);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function showDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function parseDate(text) {
  let m = String(text).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  m = String(text).match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
  return null;
}

function optLabel(QT, q, opt) {
  const qt = QT.q[q.id] || {};
  return (qt.opts && qt.opts[opt.id]) || opt.id;
}

// Answers are stored as option ids (JSON-safe); the pricing functions want
// the option objects themselves, with their coefficients.
function hydrate(S, raw) {
  const a = {};
  for (const q of S.quote.questions) {
    const v = raw[q.id];
    if (v === undefined) continue;
    if (q.type === "single") a[q.id] = q.options.find((o) => o.id === v);
    else if (q.type === "multi") a[q.id] = v.map((id) => q.options.find((o) => o.id === id)).filter(Boolean);
    else a[q.id] = v;
  }
  return a;
}

function nextQuestion(S, raw) {
  const answers = hydrate(S, raw);
  return S.quote.questions.find((q) => raw[q.id] === undefined && !(q.when && !q.when(answers))) || null;
}

function buildQuote(S, lang, raw, customer) {
  const QT = S[lang].quote;
  const L = (key, vars) => fill((QT.items && QT.items[key]) || key, vars);
  const answers = hydrate(S, raw);
  const items = S.quote.compute(answers, L, H).filter((i) => i && isFinite(i.amount));
  let total = items.reduce((s, i) => s + i.amount, 0);
  if (S.quote.minimum && total < S.quote.minimum) {
    items.push({ label: UI[lang].minimum, amount: S.quote.minimum - total });
    total = S.quote.minimum;
  }
  items.forEach((i) => (i.amount = Math.round(i.amount * 100) / 100));
  const detailLines = [];
  for (const q of S.quote.questions) {
    const v = answers[q.id];
    const short = QT.q[q.id] && QT.q[q.id].short;
    if (v === undefined || !short) continue;
    const shown = q.type === "date" ? showDate(v) : Array.isArray(v) ? (v.length ? v.map((o) => optLabel(QT, q, o)).join(", ") : UI[lang].none) : optLabel(QT, q, v);
    detailLines.push(`${short} : ${shown}`);
  }
  return { currency: "CHF", items, total: Math.round(total * 100) / 100, customer, detailLines, sector: S.slug };
}

// ---- message formatting ----

// Menu order: alphabetical in the reader's language (same order when
// reading their numbered reply back).
function menuSlugs(lang) {
  return SLUGS.slice().sort((a, b) => SECTORS[a][lang].label.localeCompare(SECTORS[b][lang].label, lang));
}

function sectorMenu(lang) {
  const U = UI[lang];
  const lines = menuSlugs(lang).map((slug, i) => `${i + 1}. ${SECTORS[slug].icon || "•"} ${SECTORS[slug][lang].label}`);
  return `${U.hello}\n\n${U.pickSector}\n\n${lines.join("\n")}`;
}

function questionText(S, lang, q) {
  const QT = S[lang].quote;
  const U = UI[lang];
  const qt = QT.q[q.id] || {};
  if (q.type === "date") {
    const min = showDate(isoDatePlus(q.minDays === undefined ? 2 : q.minDays));
    return `${qt.text || q.id}\n\n${U.date(min)}`;
  }
  const lines = q.options.map((o, i) => `${i + 1}. ${optLabel(QT, q, o)}`);
  if (q.type === "multi") lines.push(`0. ${qt.none || U.none}`);
  return `${qt.text || q.id}\n\n${lines.join("\n")}\n\n${q.type === "multi" ? U.multi : U.single}`;
}

function quoteText(S, lang, quote) {
  const U = UI[lang];
  const lines = quote.items.map((i) => `• ${i.label} — ${fmtCHF(i.amount)}`);
  const details = quote.detailLines.length ? `\n\n_${quote.detailLines.join(" · ")}_` : "";
  return `${U.quoteHead(S[lang].demo.brand)}\n\n${lines.join("\n")}\n\n*${U.total} : ${fmtCHF(quote.total)}*${details}\n\n${S[lang].quote.terms}\n\n${U.decide}`;
}

// Word-overlap match of a typed answer against the options, like the
// website's matchOptions: only a clear single winner is accepted.
function matchOption(QT, q, text) {
  const words = (s) => norm(s).split(" ").filter((w) => w.length >= 3 || /^\d+$/.test(w));
  const u = words(text);
  if (!u.length) return null;
  const scored = q.options
    .map((opt) => {
      const lt = words(optLabel(QT, q, opt));
      const hitL = lt.filter((w) => u.includes(w)).length;
      const hitU = u.filter((w) => lt.includes(w)).length;
      return { opt, score: Math.max(lt.length ? hitL / lt.length : 0, (hitU / u.length) * 0.85) };
    })
    .sort((a, b) => b.score - a.score);
  if (scored[0].score < 0.6 || (scored[1] && scored[1].score === scored[0].score)) return null;
  return scored[0].opt;
}

// Reads the reply to the pending question; returns the stored value, or
// null when it can't be understood.
function readAnswer(S, lang, q, text) {
  const QT = S[lang].quote;
  if (q.type === "date") {
    const iso = parseDate(text);
    return iso && iso >= isoDatePlus(q.minDays === undefined ? 2 : q.minDays) ? iso : null;
  }
  const nums = String(text).match(/\d+/g);
  if (q.type === "multi") {
    if (nums && nums.every((n) => Number(n) <= q.options.length)) {
      if (nums.length === 1 && Number(nums[0]) === 0) return [];
      const ids = [...new Set(nums.map(Number).filter((n) => n >= 1).map((n) => q.options[n - 1].id))];
      return ids.length ? ids : null;
    }
    const hit = matchOption(QT, q, text);
    return hit ? [hit.id] : null;
  }
  if (nums && nums.length === 1 && Number(nums[0]) >= 1 && Number(nums[0]) <= q.options.length && String(text).trim().length <= 4) {
    return q.options[Number(nums[0]) - 1].id;
  }
  const hit = matchOption(QT, q, text);
  return hit ? hit.id : null;
}

// ---- conversation ----

function sessionKey(phoneNumberId, from) {
  return `wa:${phoneNumberId}:${from}`;
}

const RESTART_RE = /^(menu|menü|start|restart|demo|démo|reset|neu|nouveau|recommencer)$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startSector(session, slug, lang, reply) {
  const S = SECTORS[slug];
  Object.assign(session, { slug, lang, answers: {}, step: "questions", quote: null, waitingFor: null });
  await reply(`${S[lang].quote.greeting}\n\n${UI[lang].intro(S[lang].demo.brand, S[lang].label)}`);
  await askNext(session, reply);
}

async function askNext(session, reply) {
  const S = SECTORS[session.slug];
  const q = nextQuestion(S, session.answers);
  if (q) {
    session.waitingFor = q.id;
    await reply(questionText(S, session.lang, q));
    return;
  }
  session.waitingFor = null;
  if (session.email) return sendQuote(session, reply);
  session.step = "email";
  await reply(UI[session.lang].askEmail(S[session.lang].demo.brand));
}

async function sendQuote(session, reply) {
  const S = SECTORS[session.slug];
  const customer = { name: session.name || "", phone: "+" + session.from, whatsapp: session.from, waNumberId: session.phoneNumberId, email: "" };
  session.quote = buildQuote(S, session.lang, session.answers, customer);
  session.step = "decide";
  await reply(quoteText(S, session.lang, session.quote));
}

function deliveryNote(lang, delivery) {
  const d = delivery && delivery.company;
  return d && d.state === "failed" ? `\n\n${UI[lang].mailFailed} ${d.error || ""}` : "";
}

async function handle(session, text, reply) {
  const U = UI[session.lang || "fr"];

  // A sector button pressed again (or a new one) always restarts cleanly.
  const found = detectSector(text);
  if (found && (found.slug !== session.slug || /#/.test(text) || !session.slug)) {
    const lang = found.lang || detectLang(text) || session.lang || "fr";
    return startSector(session, found.slug, lang, reply);
  }
  if (RESTART_RE.test(text.trim()) || !session.slug && session.step !== "menu") {
    session.lang = detectLang(text) || session.lang || "fr";
    Object.assign(session, { slug: null, step: "menu", answers: {}, quote: null, waitingFor: null });
    return reply(sectorMenu(session.lang));
  }

  if (session.step === "menu") {
    const n = Number((text.match(/\d+/) || [])[0]);
    if (n >= 1 && n <= SLUGS.length) return startSector(session, menuSlugs(session.lang)[n - 1], session.lang, reply);
    // "Hallo", "Hello"… in the menu switches its language.
    session.lang = detectLang(text) || session.lang;
    return reply(sectorMenu(session.lang));
  }

  const S = SECTORS[session.slug];
  const lang = session.lang;

  if (session.step === "questions") {
    const q = S.quote.questions.find((x) => x.id === session.waitingFor) || nextQuestion(S, session.answers);
    const value = readAnswer(S, lang, q, text);
    if (value === null) {
      const min = showDate(isoDatePlus(q.minDays === undefined ? 2 : q.minDays));
      return reply(q.type === "date" ? U.dateErr(min) : U.misunderstood);
    }
    session.answers[q.id] = value;
    return askNext(session, reply);
  }

  if (session.step === "email") {
    const email = text.trim().replace(/^mailto:/i, "");
    if (!EMAIL_RE.test(email)) return reply(U.emailErr);
    session.email = email;
    try {
      await deps.recordLead({ email, phone: "+" + session.from, companyName: "", sector: getSector(session.slug, lang) });
    } catch (err) {
      console.error("[whatsapp demo] lead record failed:", err.message);
    }
    return sendQuote(session, reply);
  }

  if (session.step === "decide") {
    const t = norm(text);
    if (/^(1|oui|yes|ja|ok|accept\w*|annehmen)\b/.test(t)) {
      const data = await deps.processAccept({ quote: session.quote, customer: session.quote.customer, companyEmail: session.email, sector: session.slug, lang });
      session.step = "done";
      await reply(U.accepted(S[lang].demo.brand, session.email) + deliveryNote(lang, data.delivery) + (data.calendarLink ? `\n\n${U.calendar} ${data.calendarLink}` : ""));
      return reply(`${U.end}\n\n${U.restart}`);
    }
    if (/^(2|non|no|nein|refus\w*|decline|ablehnen)\b/.test(t)) {
      session.step = "reason";
      const lines = OBJECTIONS[lang].map((o, i) => `${i + 1}. ${o[1]}`);
      return reply(`${U.declineAsk}\n\n${lines.join("\n")}`);
    }
    return reply(U.decideAgain);
  }

  if (session.step === "reason") {
    const n = /^\s*\d+\s*$/.test(text) ? Number(text) : 0;
    const o = n >= 1 && n <= OBJECTIONS[lang].length ? OBJECTIONS[lang][n - 1] : null;
    const data = await deps.processDecline(
      { quote: session.quote, category: o ? o[0] : null, text: o ? o[1] : text, customer: session.quote.customer, companyEmail: session.email, sector: session.slug, lang },
      deps.baseUrl()
    );
    session.step = "declined";
    return reply(`${U.declined(S[lang].demo.brand, session.email)}${deliveryNote(lang, data.delivery)}\n\n${U.restart}`);
  }

  // After the end of a flow, any message brings the menu back.
  return reply(U.restart);
}

/**
 * One inbound text from Meta's webhook. `reply(text)` sends a WhatsApp
 * message back to the same person from the same number.
 */
async function handleIncoming({ phoneNumberId, from, text, name }, reply) {
  const key = sessionKey(phoneNumberId, from);
  const session = (await store.getKey(key)) || { from, phoneNumberId, step: "new", answers: {} };
  if (name) session.name = name;
  try {
    await handle(session, String(text || "").trim(), reply);
  } catch (err) {
    console.error("[whatsapp demo]", err);
    await reply(UI[session.lang || "fr"].error).catch(() => {});
  }
  session.updatedAt = Date.now();
  await store.setKey(key, session);
}

function langOf(lang) {
  return LANGS.includes(lang) ? lang : "fr";
}

/**
 * The fictional company answered a WhatsApp customer from the e-mail flow
 * (counter-offer, new date, revised quote, follow-up, written reply, or the
 * customer booked from the offer page): tell them on WhatsApp too.
 * Free-form messages only reach people who wrote in the last 24h — a demo
 * tester normally has, so a failure here is just logged.
 */
async function notifyCustomer({ customer, lang, kind, companyName, amount, date, message, url }, send) {
  if (!customer || !customer.whatsapp) return;
  const U = UI[langOf(lang)];
  const c = companyName || "";
  const head = {
    price: () => U.newOffer(c, fmtCHF(amount)),
    date: () => U.newDate(c, date),
    revise: () => U.revised(c, fmtCHF(amount)),
    followup: () => U.followup(c),
    reply: () => U.reply(c),
    booked: () => U.booked(c),
  }[kind];
  if (!head) return;
  const parts = [head()];
  if (message) parts.push(kind === "reply" ? message : `« ${message} »`);
  if (url) parts.push(`${U.viewOffer}\n${url}`);
  if (kind === "booked") parts.push(U.end);
  try {
    await send(customer.whatsapp, parts.join("\n\n"), customer.waNumberId);
  } catch (err) {
    console.error("[whatsapp demo] customer notification failed:", err.message);
  }
}

module.exports = { configure, handleIncoming, notifyCustomer, prefillText, textOnlyReply: (lang) => UI[langOf(lang)].textOnly, SLUGS };
