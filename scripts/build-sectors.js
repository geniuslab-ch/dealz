#!/usr/bin/env node
/**
 * Builds the per-sector landing pages, demo sites and the sectors hub from
 * docs/secteurs/data/<slug>.js (one definition per sector, also loaded by
 * the browser for the demo's quote engine). Output is plain static HTML
 * under docs/ — committed, so deploys need no build step.
 *
 *   node scripts/build-sectors.js          # validate + write
 *   node scripts/build-sectors.js --check  # validate only
 *
 * Languages: a language is built only when EVERY sector defines that
 * language's texts (S.fr / S.en / S.de) and STR has an entry for it.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const DATA_DIR = path.join(DOCS, "secteurs", "data");
const CHECK_ONLY = process.argv.includes("--check");
const PARTIAL = process.argv.includes("--partial"); // dev only: build whatever sector files exist

// Display order on the hub (the order the sectors were requested in).
const ORDER = [
  "demenagement", "jardinage", "peinture", "nettoyage-textiles", "lavage-auto", "location-evenementiel",
  "desinfection", "photo-video", "transport-livraison", "pressing", "location-vehicules", "conciergerie",
  "piscines", "vitres", "montage-meubles", "impression", "traiteur", "location-materiel",
];

const STR = {
  fr: {
    htmlLang: "fr",
    base: "/secteurs",
    home: "/index.html",
    demoHome: "/demo.html",
    indexFile: "index.html",
    cleaningLabel: "Nettoyage",
    cleaningPitch: "Fin de bail, entretien régulier, bureaux : le devis instantané d'origine.",
    seeDemoNav: "✨ Essayer la démo",
    navHome: "Accueil", navProblem: "Le problème", navHow: "Comment ça marche", navPricing: "Tarifs", navContact: "Contact", navSectors: "Secteurs",
    forWho: function (s) { return "Pour les " + s.fr.forWho; },
    sectorsHeroEyebrow: "Dealz par secteur",
    sectorsH1: ["VOTRE MÉTIER.", "VOTRE DEALZ."],
    sectorsQuestion: "Quel que soit votre secteur, vos clients demandent d'abord un prix.",
    sectorsText: "Dealz s'adapte à votre activité : des questions pensées pour votre métier, un prix calculé selon vos propres tarifs, et un devis prêt à valider. Choisissez votre secteur pour découvrir la page dédiée et essayer une démo sur un site fictif de votre métier.",
    discover: "Découvrir →", tryDemo: "Essayer la démo",
    sectorsCtaTitle: "Votre secteur n'est pas dans la liste ?",
    sectorsCtaText: "Dealz fonctionne dès que vous pouvez chiffrer un service à partir de quelques questions. Parlez-nous de votre métier.",
    problemEyebrow: "Le problème", problemTitle: "Combien de demandes de devis perdez-vous ?",
    problemSub: "Chaque minute sans réponse est une occasion de plus pour vos concurrents.",
    without: "Sans Dealz", withDealz: "Avec Dealz",
    clientPrefix: "Client : ",
    withoutLines: ["Entreprise : « Merci de nous appeler. »", "Le client appelle. Personne ne répond.", "Le client envoie un e-mail. Réponse... plus tard.", "Le client a déjà contacté 3 concurrents."],
    withLines: ["Dealz répond instantanément, à toute heure.", "Quelques questions rapides et ciblées.", "Un prix ferme, calculé selon vos propres tarifs."],
    withLast: "Une demande qualifiée arrive directement chez vous.",
    valueEyebrow: "Pourquoi Dealz", valueTitle: "Plus de demandes. Moins d'interruptions.",
    valueSub: "Dealz ne remplace pas votre équipe — il filtre et qualifie avant qu'un devis n'atterrisse sur votre bureau.",
    genericValues: [
      { icon: "🌙", title: "Disponible 24/7", text: "L'assistant continue de travailler en dehors de vos heures d'ouverture." },
      { icon: "🏷️", title: "Vos propres tarifs, toujours à jour", text: "Dealz lit votre grille tarifaire Excel. Modifiez un prix, l'assistant se met à jour — sans ressaisie." },
      { icon: "🔗", title: "Intégré à votre site actuel", text: "Pas un nouveau site, pas de redirection — Dealz s'ajoute directement au vôtre, avec votre marque." },
      { icon: "💸", title: "Pas de commission par lead", text: "Contrairement aux plateformes de mise en relation, vos demandes restent chez vous — tarif fixe." },
    ],
    stepsEyebrow: "Comment ça marche", stepsTitle: "Quatre étapes, aucune complexité",
    step1Title: "Connectez vos tarifs", step2Title: "Dealz apprend vos règles",
    step3Title: "L'IA discute avec vos clients", step3Text: "Elle ne pose que les questions nécessaires pour chiffrer précisément le besoin.",
    step4Title: "Le client reçoit un prix", step4Text: "Devis généré instantanément — vous récupérez une demande qualifiée, prête à convertir.",
    discoverExp: "Découvrir l'expérience →",
    changeEyebrow: "Ce qui change tout", changeTitle: "De votre Excel à un devis accepté — en une conversation.",
    changeSub: "L'IA pose les questions. Vos règles tarifaires décident. Elle n'invente jamais un prix.",
    offerHead: "📄 Devis — ", offerTotal: "Prix pour votre client", accept: "✓ Client : Accepter", decline: "Refuser",
    acceptedMsg: "✓ Devis accepté par le client — confirmation envoyée par e-mail, rendez-vous ajouté à l'agenda de l'entreprise.",
    declinedMsg: "Le client a refusé ce devis — il peut ajuster sa demande et en recevoir un nouveau instantanément.",
    diffNote: function (total) { return "☝️ <b>CHF " + total + " est le prix payé par le client de l'entreprise — pas le tarif de Dealz.</b> Les formules Dealz (dès CHF 49/mois) sont plus bas sur cette page."; },
    layerEyebrow: "Ce que Dealz n'est pas", layerTitle: "Dealz est la couche de vente IA. Pas un remplacement.",
    layerSub: "Vous avez déjà vos outils de planification, de facturation et de gestion. Dealz occupe une autre place : la première conversation avec le client.",
    keep: "Vous gardez", add: "Dealz ajoute",
    keepList: ["✓ Votre CRM existant", "✓ Votre comptabilité", "✓ Votre facturation", "✓ Votre planning", "✓ Votre Excel", "✓ Vos logiciels actuels"],
    addList: ["+ Assistant de devis IA, intégré à votre site actuel", "+ Synchronisation automatique avec votre Excel", "+ Estimations instantanées", "+ Qualification des leads", "+ Génération de devis", "+ Relance client"],
    layerNote: "Ne remplacez pas votre logiciel. Ajoutez une couche de vente IA.",
    ctaEyebrow: "Prêt à essayer ?", ctaTitle: "Vos clients demandent déjà : « Combien ça coûte ? »",
    ctaLead: "Laissez Dealz répondre — pendant que vous vous concentrez sur le reste.",
    ctaDemo: "✨ Essayer la démo gratuite", ctaInstall: "Demander l'installation",
    ctaReassure: "Aucun engagement. Découvrez le parcours client avant de décider.",
    contactEyebrow: "Contact", contactTitle: "Parlons de votre entreprise",
    contactSub: "Répondez à quelques questions. Dealz vous aidera à trouver la formule la plus adaptée.",
    panelTitle: "Dealz · Configuration", panelSub: "Quelques questions rapides", inputPh: "Écrivez votre réponse…", sendLabel: "Envoyer",
    emailLbl: "E-mail", zoneLbl: "Zone d'intervention", zoneVal: "Toute la Suisse romande",
    otherSectors: "Autres secteurs", otherSectorsTitle: "Dealz pour tous les métiers de service",
    footerLine: function (s) { return "Dealz — Assistant de vente IA pour les " + s.fr.forWho + " suisses. 🇨🇭"; },
    slogan: "Keep your website. Keep your tools. Add Dealz.",
    referral: "Déjà client ? Gardez le secret… ou présentez un confrère 😏",
    allSectors: "Tous les secteurs",
    // demo
    demoBanner: function (s) { return "Ceci est le site fictif d'une entreprise du secteur « " + s.fr.label + " » ayant intégré Dealz."; },
    discoverDealz: "Découvrir Dealz →",
    tabHome: "Accueil", tabServices: "Prestations", tabAbout: "À propos", tabQuote: "✨ Obtenir un devis", tabContact: "Contact",
    ctaQuoteInstant: "✨ Obtenir un devis instantané", seeServices: "Voir nos prestations",
    whyEyebrow: function (d) { return "Pourquoi " + d.brand; },
    whyTitle: "Un prix clair, avant même de réserver",
    whySub: "Répondez à quelques questions et obtenez immédiatement un devis détaillé.",
    whyCards: [
      { icon: "⚡", title: "Prix instantané", text: "Devis détaillé en moins d'une minute, à toute heure." },
      { icon: "🎯", title: "Guidé pas à pas", text: "Quelques questions simples — pas de formulaire compliqué." },
      { icon: "🔒", title: "Devis ferme", text: "Le prix annoncé est le prix payé." },
    ],
    servicesEyebrow: "Prestations",
    aboutEyebrow: "À propos",
    contactDemoTitle: "Parlez à une personne, ou obtenez un devis instantané",
    contactDemoSub: "Vous préférez répondre à quelques questions plutôt que téléphoner ? Rendez-vous dans l'onglet <b>Obtenir un devis</b>.",
    phoneLbl: "Téléphone", mailLbl: "E-mail", zoneLbl2: "Zone d'intervention", hoursLbl: "Horaires",
    devisEyebrow: "✨ Obtenir un devis", devisTitle: "Votre prix en moins d'une minute",
    howTitle: "Comment ça marche",
    flow: ["Vous décrivez votre besoin", "Quelques questions rapides", "Calcul selon notre grille tarifaire", "Devis ferme affiché", "Vous acceptez ou refusez"],
    quoteSub: "Réponse habituellement instantanée", quoteWord: "Devis",
    tabPage: "📄 Onglet dédié", tabPopup: "🪟 Pop-up", tabChat: "💬 Widget de chat", tabWhatsapp: "📱 WhatsApp Business",
    notePage: "Onglet dédié — comme celui sur lequel vous venez de cliquer en allant sur « ✨ Obtenir un devis ». Le devis vit sur une vraie page de votre site, sous votre propre en-tête et navigation, sans jamais le quitter.",
    notePopup: "Un bouton « Devis » dans votre menu ouvre le même devis en plein écran, dans sa propre fenêtre — davantage d'espace que la bulle, sans jamais quitter votre site.",
    noteChat: "Une bulle flottante sur votre site, dans un coin de l'écran — l'intégration la plus simple : une seule ligne de code, fonctionne sur n'importe quelle plateforme (Wix, Shopify, WordPress, site fait main…). Cliquez sur la bulle en bas à droite pour l'essayer.",
    noteWhatsapp: "Vos clients écrivent directement sur votre WhatsApp Business — sans rien installer sur leur téléphone.",
    tryPopup: "Essayer le pop-up →", tryWhatsapp: "Essayer sur WhatsApp →", openQuote: "Ouvrir le devis en ligne", closeLbl: "Fermer", quoteTitle: "Devis en ligne",
    gateIntro: "Avant votre devis instantané, laissez-nous vos coordonnées professionnelles :",
    gateCompany: "Nom de votre entreprise (optionnel)", gateEmail: "E-mail professionnel", gatePhone: "Téléphone (optionnel)", gateGo: "Essayer la démo",
    followTitle: "Imaginez ceci sur VOTRE site.",
    followLines: "Vos prix. Vos services. Votre marque. Vos clients.<br />Votre assistant de vente IA, disponible 24 heures sur 24.",
    followInstall: "Demander l'installation", followPricing: "Voir les tarifs", followContact: "Contacter Dealz",
    footerDemo: function (d) { return d.pdfCompany.name + " — site de démonstration, cette entreprise n'existe pas réellement."; },
    poweredBy: "Propulsé par",
  },
};

// ---------- helpers ----------
// French typography: a non-breaking space before ? ! : ; » and after «, so a
// closing mark never wraps onto a line of its own. Set per language in main().
let TYPO_LANG = "fr";
function esc(s) {
  let t = String(s == null ? "" : s);
  if (TYPO_LANG === "fr") t = t.replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function fill(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] !== undefined ? vars[k] : m; });
}
function write(file, content) {
  if (CHECK_ONLY) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
const CP1252_SAFE = /^[ -~ -ÿ–—‘’“”…Œœ€]*$/;

// ---------- load + validate ----------
function loadSectors() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".js") && !f.startsWith("_"));
  const map = {};
  files.forEach((f) => {
    const s = require(path.join(DATA_DIR, f));
    if (s.slug + ".js" !== f) throw new Error(f + ": slug '" + s.slug + "' must match the file name");
    map[s.slug] = s;
  });
  const missing = ORDER.filter((slug) => !map[slug]);
  const extra = Object.keys(map).filter((slug) => !ORDER.includes(slug));
  return { map, missing, extra };
}

function validateSector(S, lang, errors) {
  const where = S.slug + "/" + lang;
  const T = S[lang];
  const err = (m) => errors.push(where + ": " + m);
  if (!T) return err("missing language block");
  ["label", "forWho", "pitch", "emailNoun"].forEach((k) => { if (!T[k]) err("missing " + k); });
  const L = T.landing || {};
  ["question", "text", "clientQ", "step1", "step2", "roi"].forEach((k) => { if (!L[k]) err("landing." + k + " missing"); });
  if (!Array.isArray(L.h1) || L.h1.length !== 2) err("landing.h1 must be [line1, line2]");
  if (!Array.isArray(L.values) || L.values.length !== 4) err("landing.values must have exactly 4 cards");
  if (!L.excel || !L.excel.rows || L.excel.rows.length !== 3 || L.excel.headers.length !== 3) err("landing.excel needs 3 headers and 3 rows");
  if (!Array.isArray(L.chat) || L.chat.length !== 3) err("landing.chat needs 3 lines");
  if (!L.offer || !L.offer.rows || L.offer.rows.length !== 3) err("landing.offer needs 3 rows");
  const D = T.demo || {};
  ["brand", "eyebrow", "servicesTitle", "servicesSub", "devisNote", "inputPlaceholder"].forEach((k) => { if (!D[k]) err("demo." + k + " missing"); });
  if (!D.hero || !D.hero.h1 || !D.hero.text) err("demo.hero incomplete");
  if (!D.stats || D.stats.length !== 3) err("demo.stats needs 3 entries");
  if (!D.services || D.services.length !== 6) err("demo.services needs exactly 6 cards");
  if (!D.about || !D.about.title || !D.about.text || !D.about.bullets || D.about.bullets.length !== 3) err("demo.about incomplete (3 bullets)");
  if (!D.contact || !D.contact.phone || !D.contact.email || !D.contact.zone || !D.contact.hours) err("demo.contact incomplete");
  if (!D.pdfCompany || !D.pdfCompany.name || !D.pdfCompany.address) err("demo.pdfCompany incomplete");
  const Q = T.quote || {};
  if (!Q.greeting || !Q.q || !Q.items) return err("quote block incomplete");
  if (S.needsAddress && !Q.addressPlaceholder) err("quote.addressPlaceholder missing (needsAddress)");

  // question texts
  S.quote.questions.forEach((q) => {
    const qt = Q.q[q.id];
    if (!qt || !qt.text) return err("question " + q.id + ": missing text");
    if (!qt.short) err("question " + q.id + ": missing short label");
    if (qt.short && !CP1252_SAFE.test(qt.short)) err("question " + q.id + ": short label has non-PDF-safe characters");
    if (q.type === "date") return;
    (q.options || []).forEach((o) => {
      const lab = qt.opts && qt.opts[o.id];
      if (!lab) err("question " + q.id + ": missing label for option " + o.id);
      else if (!CP1252_SAFE.test(lab)) err("question " + q.id + "/" + o.id + ": label has non-PDF-safe characters: " + lab);
    });
  });

  // pricing: run compute over EVERY reachable answer combination (multi-choice
  // questions enumerate all subsets), so rare branches — "nothing selected",
  // the most expensive path — cannot hide. Capped, then sampled beyond that.
  const H = { clamp: (v, a, b) => Math.min(b, Math.max(a, v)), round5: (v) => Math.round(v / 5) * 5, round1: (v) => Math.round(v) };
  const usedKeys = new Set();
  const reported = new Set();
  const once = (m) => { if (!reported.has(m) && reported.size < 12) { reported.add(m); err(m); } };
  const Lfn = (key, vars) => {
    usedKeys.add(key);
    if (!(key in Q.items)) { once("compute used unknown item key '" + key + "'"); return key; }
    return fill(Q.items[key], vars);
  };
  const CAP = 150000;
  let count = 0;
  let capped = false;
  function check(a) {
    let items;
    try { items = S.quote.compute(a, Lfn, H); } catch (e) { once("compute threw: " + e.message + " for " + JSON.stringify(Object.keys(a))); return; }
    if (!Array.isArray(items) || !items.length) { once("compute returned no items for some answer set"); return; }
    let total = 0;
    items.forEach((i) => {
      if (!i.label || /\{\w+\}/.test(i.label)) once("unresolved/empty label: " + i.label);
      else if (!CP1252_SAFE.test(i.label)) once("item label has non-PDF-safe characters: " + i.label);
      if (!isFinite(i.amount)) once("non-finite amount for " + i.label);
      total += i.amount;
    });
    if (!(total > 0)) once("non-positive total for some answer set");
    else if (total > 1e6) once("absurd total " + total);
  }
  function rec(i, a) {
    if (count >= CAP) { capped = true; return; }
    if (i === S.quote.questions.length) { count++; check(a); return; }
    const q = S.quote.questions[i];
    if (q.when && !q.when(a)) return rec(i + 1, a);
    if (q.type === "date") return rec(i + 1, Object.assign({}, a, { [q.id]: "2030-01-01" }));
    if (q.type === "multi") {
      for (let m = 0; m < (1 << q.options.length); m++) {
        rec(i + 1, Object.assign({}, a, { [q.id]: q.options.filter((_, b) => m & (1 << b)) }));
        if (count >= CAP) { capped = true; return; }
      }
      return;
    }
    for (const o of q.options) {
      rec(i + 1, Object.assign({}, a, { [q.id]: o }));
      if (count >= CAP) { capped = true; return; }
    }
  }
  rec(0, {});
  if (capped) err("too many answer combinations to enumerate exhaustively (> " + CAP + ")");
  Object.keys(Q.items).forEach((k) => { if (!usedKeys.has(k)) err("item key '" + k + "' is never used by compute (dead text)"); });
}

// ---------- shared markup ----------
function extractTarifs(lang) {
  const cfg = STR[lang];
  const html = fs.readFileSync(path.join(DOCS, cfg.indexFile), "utf8");
  const start = html.indexOf('<section id="tarifs">');
  const end = html.indexOf("</section>", start);
  if (start < 0 || end < 0) throw new Error("could not find #tarifs section in " + cfg.indexFile);
  return html.slice(start, end + "</section>".length);
}

function fonts() {
  return '  <link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
    '  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />\n';
}

function sectorsChips(lang, currentSlug, all) {
  const cfg = STR[lang];
  return all
    .filter((s) => s.slug !== currentSlug)
    .map((s) => '<a class="sector-chip" href="' + cfg.base + "/" + s.slug + '/">' + esc(s.icon) + " " + esc(s[lang].label) + "</a>")
    .join("\n          ");
}

function siteNav(lang, slug, withAnchors) {
  const cfg = STR[lang];
  const links = withAnchors
    ? '      <a href="#probleme">' + cfg.navProblem + '</a>\n      <a href="#comment-ca-marche">' + cfg.navHow + '</a>\n      <a href="#tarifs">' + cfg.navPricing + '</a>\n      <a href="#contact">' + cfg.navContact + "</a>\n"
    : "";
  const demo = slug ? '      <a href="' + cfg.base + "/" + slug + '/demo.html" class="cta">' + cfg.seeDemoNav + "</a>\n" : "";
  return '  <nav class="nav">\n    <div class="nav-logo">\n      <a href="' + cfg.home + '"><img src="/images/dealz-logo-sm.png" alt="Dealz" /></a>\n' +
    '      <span class="nav-slogan">Keep your website.<br>Keep your tools.<br>Add Dealz.</span>\n    </div>\n    <div class="nav-links">\n' +
    (withAnchors ? "" : '      <a href="' + cfg.home + '">' + cfg.navHome + "</a>\n") + links + '      <a href="' + cfg.base + '/">' + cfg.navSectors + "</a>\n" + demo + "    </div>\n  </nav>\n";
}

// ---------- landing ----------
function buildLanding(S, lang, all, tarifs) {
  const cfg = STR[lang];
  const T = S[lang];
  const L = T.landing;
  const demoUrl = cfg.base + "/" + S.slug + "/demo.html";
  const colors = ["c-blue", "c-sky", "c-navy", "c-red"];
  const cards = L.values.concat(cfg.genericValues).map((v, i) =>
    '        <div class="svc-card ' + colors[i % 4] + '">\n          <div class="svc-icon">' + esc(v.icon) + "</div>\n          <h3>" + esc(v.title) + "</h3>\n          <p>" + esc(v.text) + "</p>\n        </div>"
  ).join("\n");
  const total = L.offer.rows.reduce((s, r) => s + r[1], 0);
  const money = (n) => "CHF " + Number(n).toFixed(2);

  const tarifsHtml = tarifs
    .replace(/<p class="pricing-roi-note">[\s\S]*?<\/p>/, '<p class="pricing-roi-note">💡 ' + esc(L.roi) + "</p>")
    .replace(/href="\/demo\.html"/g, 'href="' + demoUrl + '"');

  const title = "Dealz pour " + T.label.toLowerCase() + " — devis instantané par IA";
  const desc = T.pitch + " Dealz répond à vos clients 24/7, calcule votre prix selon vos tarifs et prépare le devis. Dès CHF 49/mois.";

  return `<!doctype html>
<html lang="${cfg.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
${fonts()}  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
<!-- Généré par scripts/build-sectors.js depuis docs/secteurs/data/${S.slug}.js — ne pas éditer à la main. -->

${siteNav(lang, S.slug, true)}
  <section class="hero">
    <div class="hero-inner">
      <span class="eyebrow">${esc(cfg.forWho(S))}</span>
      <h1>${esc(L.h1[0])}<br>${esc(L.h1[1])}</h1>
      <p class="hero-question">${esc(L.question)}</p>
      <p>${esc(L.text)}</p>
      <p class="hero-usp">Pas de nouveau site. Pas de nouveau logiciel.<br><b>Vous gardez vos outils. Dealz s'ajoute.</b></p>
      <div class="hero-ctas">
        <a href="${demoUrl}" class="btn btn-primary">Voir Dealz en action →</a>
        <a href="#contact" class="btn btn-secondary">Parlez-nous →</a>
      </div>
      <p class="hero-tagline">${cfg.slogan}</p>
    </div>
  </section>

  <section id="probleme" class="section-alt">
    <div class="section-inner">
      <span class="eyebrow">${cfg.problemEyebrow}</span>
      <h2 class="section-title">${cfg.problemTitle}</h2>
      <p class="section-sub">${cfg.problemSub}</p>
      <div class="problem-grid">
        <div class="problem-card without">
          <div class="pc-label">${cfg.without}</div>
          <div class="problem-line q">${cfg.clientPrefix}« ${esc(L.clientQ)} »</div>
${cfg.withoutLines.map((l) => '          <div class="problem-line">' + esc(l) + "</div>").join("\n")}
        </div>
        <div class="problem-card with">
          <div class="pc-label">${cfg.withDealz}</div>
          <div class="problem-line q">${cfg.clientPrefix}« ${esc(L.clientQ)} »</div>
${cfg.withLines.map((l) => '          <div class="problem-line">' + esc(l) + "</div>").join("\n")}
          <div class="problem-line q">${cfg.withLast}</div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="section-inner">
      <span class="eyebrow">${cfg.valueEyebrow}</span>
      <h2 class="section-title">${cfg.valueTitle}</h2>
      <p class="section-sub">${cfg.valueSub}</p>
      <div class="cards-grid cols-4">
${cards}
      </div>
    </div>
  </section>

  <section id="comment-ca-marche" class="section-alt">
    <div class="section-inner">
      <span class="eyebrow">${cfg.stepsEyebrow}</span>
      <h2 class="section-title">${cfg.stepsTitle}</h2>
      <div class="steps-grid">
        <div class="step-card"><div class="step-num">01</div><h3>${cfg.step1Title}</h3><p>${esc(L.step1)}</p></div>
        <div class="step-card"><div class="step-num">02</div><h3>${cfg.step2Title}</h3><p>${esc(L.step2)}</p></div>
        <div class="step-card"><div class="step-num">03</div><h3>${cfg.step3Title}</h3><p>${cfg.step3Text}</p></div>
        <div class="step-card"><div class="step-num">04</div><h3>${cfg.step4Title}</h3><p>${cfg.step4Text}</p></div>
      </div>
      <div style="text-align:center; margin-top: 36px;">
        <a href="${demoUrl}" class="btn btn-primary">${cfg.discoverExp}</a>
      </div>
    </div>
  </section>

  <section>
    <div class="section-inner">
      <span class="eyebrow">${cfg.changeEyebrow}</span>
      <h2 class="section-title">${cfg.changeTitle}</h2>
      <p class="section-sub">${cfg.changeSub}</p>
      <div class="transform-flow">
        <div class="real-excel">
          <div class="excel-titlebar">📗 ${esc(L.excel.file)}</div>
          <table class="excel-grid">
            <thead><tr><th class="rn"></th><th>A</th><th>B</th><th>C</th></tr></thead>
            <tbody>
              <tr><td class="rn">1</td>${L.excel.headers.map((h) => '<td class="hdr">' + esc(h) + "</td>").join("")}</tr>
${L.excel.rows.map((r, i) => '              <tr><td class="rn">' + (i + 2) + "</td>" + r.map((c) => "<td>" + esc(c) + "</td>").join("") + "</tr>").join("\n")}
            </tbody>
          </table>
        </div>
        <div class="flow-arrow">→</div>
        <div class="diff-chat">
          <div class="dealz-msg user" style="align-self:flex-start; max-width: 100%;">${esc(L.chat[0])}</div>
          <div class="dealz-msg assistant" style="max-width: 100%;">${esc(L.chat[1])}</div>
          <div class="dealz-msg assistant" style="max-width: 100%;">${esc(L.chat[2])}</div>
        </div>
        <div class="flow-arrow">→</div>
        <div class="pdf-offer">
          <div class="pdf-head">${cfg.offerHead}${esc(L.offer.company)}</div>
          <div class="pdf-body">
${L.offer.rows.map((r) => '            <div class="pdf-row"><span>' + esc(r[0]) + "</span><span>" + money(r[1]) + "</span></div>").join("\n")}
            <div class="pdf-total"><span>${cfg.offerTotal}</span><span>${money(total)}</span></div>
          </div>
          <div class="pdf-actions">
            <button class="qc-accept" id="pdf-accept">${cfg.accept}</button>
            <button class="qc-decline" id="pdf-decline">${cfg.decline}</button>
          </div>
          <div class="pdf-result" id="pdf-result"></div>
        </div>
      </div>
      <p class="diff-note">${cfg.diffNote(Number(total).toFixed(0))}</p>
    </div>
  </section>

  <section>
    <div class="section-inner">
      <span class="eyebrow">${cfg.layerEyebrow}</span>
      <h2 class="section-title">${cfg.layerTitle}</h2>
      <p class="section-sub">${cfg.layerSub}</p>
      <div class="layer-grid">
        <div class="layer-card keep"><div class="lc-title">${cfg.keep}</div><ul>
${cfg.keepList.map((l) => "          <li>" + esc(l) + "</li>").join("\n")}
        </ul></div>
        <div class="layer-card add"><div class="lc-title">${cfg.add}</div><ul>
${cfg.addList.map((l) => "          <li>" + esc(l) + "</li>").join("\n")}
        </ul></div>
      </div>
      <p class="diff-note" style="margin-top:24px;"><b>${cfg.layerNote}</b></p>
    </div>
  </section>

  ${tarifsHtml}

  <section class="section-alt">
    <div class="section-inner">
      <div class="final-cta">
        <span class="eyebrow" style="background:rgba(255,255,255,0.15); color:white;">${cfg.ctaEyebrow}</span>
        <h2>${cfg.ctaTitle}</h2>
        <p class="lead-line">${cfg.ctaLead}</p>
        <div class="hero-ctas">
          <a href="${demoUrl}" class="btn btn-primary">${cfg.ctaDemo}</a>
          <a href="#contact" class="btn btn-secondary" style="background:transparent; color:white; border-color:rgba(255,255,255,0.4);">${cfg.ctaInstall}</a>
        </div>
        <div class="reassurance">${cfg.ctaReassure}</div>
      </div>
    </div>
  </section>

  <section id="contact">
    <div class="section-inner">
      <span class="eyebrow">${cfg.contactEyebrow}</span>
      <h2 class="section-title">${cfg.contactTitle}</h2>
      <p class="section-sub">${cfg.contactSub}</p>
      <div class="quote-panel contact-panel">
        <div class="quote-panel-head">
          <div class="title">${cfg.panelTitle}</div>
          <div class="subtitle" id="contact-progress">${cfg.panelSub}</div>
        </div>
        <div class="dealz-messages" id="contact-messages"></div>
        <div class="dealz-inputbar" id="contact-inputbar">
          <input id="contact-input" type="text" placeholder="${cfg.inputPh}" autocomplete="off" />
          <button id="contact-send">${cfg.sendLabel}</button>
        </div>
      </div>
      <div class="contact-grid" style="margin-top:36px;">
        <div class="contact-card"><div class="lbl">${cfg.emailLbl}</div><div class="val">dealz@dealz.website</div></div>
        <div class="contact-card"><div class="lbl">${cfg.zoneLbl}</div><div class="val">${cfg.zoneVal}</div></div>
      </div>
    </div>
  </section>

  <section class="section-alt">
    <div class="section-inner">
      <span class="eyebrow">${cfg.otherSectors}</span>
      <h2 class="section-title">${cfg.otherSectorsTitle}</h2>
      <div class="sector-chips">
          ${sectorsChips(lang, S.slug, all)}
          <a class="sector-chip" href="${cfg.home}">🧽 ${cfg.cleaningLabel}</a>
      </div>
      <p class="pricing-note" style="text-align:center;"><a href="${cfg.base}/" style="color:var(--blue-dark); font-weight:700;">${cfg.allSectors} →</a></p>
    </div>
  </section>

  <footer class="site-footer">
    <div>${esc(cfg.footerLine(S))}</div>
    <div class="site-footer-slogan">${cfg.slogan}</div>
    <div class="site-footer-referral"><a href="/parrainage.html">${cfg.referral}</a></div>
  </footer>

  <script>window.DEALZ_SECTOR = "${S.slug}";</script>
  <script src="/contact-flow.js"></script>
  <script>
    (function () {
      var acceptBtn = document.getElementById("pdf-accept");
      var declineBtn = document.getElementById("pdf-decline");
      var result = document.getElementById("pdf-result");
      if (!acceptBtn) return;
      acceptBtn.addEventListener("click", function () {
        acceptBtn.disabled = true; declineBtn.disabled = true;
        result.textContent = ${JSON.stringify(cfg.acceptedMsg)};
        result.className = "pdf-result show success";
      });
      declineBtn.addEventListener("click", function () {
        acceptBtn.disabled = true; declineBtn.disabled = true;
        result.textContent = ${JSON.stringify(cfg.declinedMsg)};
        result.className = "pdf-result show decline";
      });
    })();
  </script>
</body>
</html>
`;
}

// ---------- demo site ----------
function buildDemo(S, lang) {
  const cfg = STR[lang];
  const T = S[lang];
  const D = T.demo;
  const c = S.colors;
  const landingUrl = cfg.base + "/" + S.slug + "/";
  const cards = (list) => list.map((x) => '        <div class="sc-card"><div class="icon">' + esc(x.icon) + "</div><h3>" + esc(x.title) + "</h3><p>" + esc(x.text) + "</p>" + (x.tag ? '<span class="tag">' + esc(x.tag) + "</span>" : "") + "</div>").join("\n");
  const title = D.pdfCompany.name + " — Site de démonstration (propulsé par Dealz)";

  return `<!doctype html>
<html lang="${cfg.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
${fonts()}  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/demo.css" />
  <style>
    :root { --sc-teal: ${c.main}; --sc-teal-dark: ${c.dark}; --sc-teal-light: ${c.light}; --sc-coral: ${c.accent}; --sc-coral-dark: ${c.accentDark}; --sc-bg: ${c.bg}; }
  </style>
</head>
<body class="swissclean">
<!-- Généré par scripts/build-sectors.js depuis docs/secteurs/data/${S.slug}.js — ne pas éditer à la main. -->

  <div class="sc-demo-banner">
    <span class="tag">DÉMO</span>
    ${esc(cfg.demoBanner(S))}
    <a href="${landingUrl}">${cfg.discoverDealz}</a>
  </div>

  <nav class="sc-nav">
    <div class="sc-nav-logo"><span class="dot">${esc(S.icon)}</span> ${esc(D.brand)}</div>
    <div class="sc-nav-links">
      <button data-tab="accueil" class="active">${cfg.tabHome}</button>
      <button data-tab="prestations">${cfg.tabServices}</button>
      <button data-tab="apropos">${cfg.tabAbout}</button>
      <button data-tab="devis" class="cta">${cfg.tabQuote}</button>
      <button data-tab="contact">${cfg.tabContact}</button>
    </div>
  </nav>

  <section id="sc-tab-accueil" class="sc-tab active">
    <div class="sc-hero">
      <div class="sc-hero-inner">
        <span class="sc-eyebrow">${esc(D.eyebrow)}</span>
        <h1>${esc(D.hero.h1)}</h1>
        <p>${esc(D.hero.text)}</p>
        <div>
          <button class="sc-btn sc-btn-primary" data-goto="devis">${cfg.ctaQuoteInstant}</button>
          <button class="sc-btn sc-btn-secondary" data-goto="prestations">${cfg.seeServices}</button>
        </div>
      </div>
      <div class="sc-hero-strip">
${D.stats.map((s) => '        <div class="stat"><div class="num">' + esc(s.num) + '</div><div class="lbl">' + esc(s.lbl) + "</div></div>").join("\n")}
      </div>
    </div>
    <div class="sc-section-inner">
      <span class="sc-eyebrow">${esc(cfg.whyEyebrow(D))}</span>
      <h2 class="sc-title">${cfg.whyTitle}</h2>
      <p class="sc-sub">${cfg.whySub}</p>
      <div class="sc-cards">
${cards(D.why || cfg.whyCards)}
      </div>
    </div>
  </section>

  <section id="sc-tab-prestations" class="sc-tab">
    <div class="sc-section-inner">
      <span class="sc-eyebrow">${cfg.servicesEyebrow}</span>
      <h2 class="sc-title">${esc(D.servicesTitle)}</h2>
      <p class="sc-sub">${esc(D.servicesSub)}</p>
      <div class="sc-cards">
${cards(D.services)}
      </div>
      <div style="text-align:center; margin-top: 32px;">
        <button class="sc-btn sc-btn-primary" data-goto="devis">${cfg.ctaQuoteInstant}</button>
      </div>
    </div>
  </section>

  <section id="sc-tab-apropos" class="sc-tab">
    <div class="sc-section-inner">
      <span class="sc-eyebrow">${cfg.aboutEyebrow}</span>
      <h2 class="sc-title">${esc(D.about.title)}</h2>
      <p class="sc-sub" style="margin-bottom:0;">${esc(D.about.text)}</p>
      <ul class="sc-about-list">
${D.about.bullets.map((b) => '        <li><span class="sc-check">✓</span><span><b>' + esc(b[0]) + "</b> — " + esc(b[1]) + "</span></li>").join("\n")}
      </ul>
    </div>
  </section>

  <section id="sc-tab-contact" class="sc-tab">
    <div class="sc-section-inner">
      <span class="sc-eyebrow">${cfg.tabContact}</span>
      <h2 class="sc-title">${cfg.contactDemoTitle}</h2>
      <p class="sc-sub">${cfg.contactDemoSub}</p>
      <div class="sc-contact-grid">
        <div class="sc-contact-card"><div class="lbl">${cfg.phoneLbl}</div><div class="val">${esc(D.contact.phone)}</div></div>
        <div class="sc-contact-card"><div class="lbl">${cfg.mailLbl}</div><div class="val">${esc(D.contact.email)}</div></div>
        <div class="sc-contact-card"><div class="lbl">${cfg.zoneLbl2}</div><div class="val">${esc(D.contact.zone)}</div></div>
        <div class="sc-contact-card"><div class="lbl">${cfg.hoursLbl}</div><div class="val">${esc(D.contact.hours)}</div></div>
      </div>
    </div>
  </section>

  <section id="sc-tab-devis" class="sc-tab">
    <div class="sc-section-inner">
      <span class="sc-eyebrow">${cfg.devisEyebrow}</span>
      <h2 class="sc-title">${cfg.devisTitle}</h2>
      <p class="sc-devis-note">${esc(D.devisNote)}</p>

      <div class="devis-mode-tabs" id="devis-mode-tabs">
        <button class="dmt-btn active" data-devis-mode="page">${cfg.tabPage}</button>
        <button class="dmt-btn" data-devis-mode="popup">${cfg.tabPopup}</button>
        <button class="dmt-btn" data-devis-mode="chat">${cfg.tabChat}</button>
        <button class="dmt-btn" data-devis-mode="whatsapp" id="devis-whatsapp-tab" style="display: none">${cfg.tabWhatsapp}</button>
      </div>

      <div class="devis-mode-panel active" data-devis-panel="page">
        <p class="sc-devis-note">${cfg.notePage}</p>
        <div class="quote-wrap" id="quote-wrap-anchor">
          <div class="quote-side">
            <h3>${cfg.howTitle}</h3>
            <div class="flow-steps">
${cfg.flow.map((f, i) => '              <div class="flow-step"><div class="num">' + (i + 1) + '</div><span class="label">' + esc(f) + "</span></div>").join('\n              <div class="flow-connector"></div>\n')}
            </div>
          </div>

          <div class="quote-panel-slot" id="quote-panel-slot">
            <!-- .quote-panel is the single, real chat instance — JS moves this
                 exact node between this slot and the floating bubble slot
                 depending on the active tab, so there is only ever one
                 conversation/state. -->
            <div class="quote-panel" id="quote-panel">
              <div class="quote-panel-head">
                <div class="title">${esc(D.brand)} · ${cfg.quoteWord}</div>
                <div class="subtitle">${cfg.quoteSub}</div>
              </div>

              <div class="dealz-lead-gate" id="dealz-lead-gate">
                <p class="dlg-intro">${cfg.gateIntro}</p>
                <input class="dcf-input" id="dlg-company" placeholder="${cfg.gateCompany}" />
                <input class="dcf-input" id="dlg-email" type="email" placeholder="${cfg.gateEmail}" required />
                <input class="dcf-input" id="dlg-phone" placeholder="${cfg.gatePhone}" />
                <button class="dcf-submit" id="dlg-submit">${cfg.gateGo}</button>
                <p class="dlg-msg" id="dlg-msg"></p>
              </div>

              <div class="dealz-chat-body" id="dealz-chat-body" style="display: none">
                <div class="dealz-messages" id="dealz-messages"></div>
                <div class="dealz-inputbar">
                  <input id="dealz-input" type="text" placeholder="${esc(D.inputPlaceholder)}" autocomplete="off" />
                  <button id="dealz-send">${cfg.sendLabel}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="devis-mode-panel" data-devis-panel="popup">
        <p class="sc-devis-note">${cfg.notePopup}</p>
        <div class="devis-mode-try">
          <button class="sc-btn sc-btn-primary" id="try-popup-btn">${cfg.tryPopup}</button>
        </div>
      </div>

      <div class="devis-mode-panel" data-devis-panel="chat">
        <p class="sc-devis-note">${cfg.noteChat}</p>
      </div>

      <div class="devis-mode-panel" data-devis-panel="whatsapp">
        <p class="sc-devis-note">${cfg.noteWhatsapp}</p>
        <div class="devis-mode-try">
          <a href="#" id="whatsapp-trial-link" class="sc-btn sc-btn-primary" target="_blank" rel="noopener">${cfg.tryWhatsapp}</a>
        </div>
      </div>

      <!-- Real floating bubble, matching embed.js's bubble mode — shown only
           while the "Widget de chat" tab is active; .quote-panel is moved in
           here, so the bubble opens the exact same live conversation. -->
      <button id="demo-widget-launcher" class="demo-widget-launcher" aria-label="${cfg.openQuote}">💬</button>
      <div id="demo-widget-panel-slot" class="demo-widget-panel-slot"></div>

      <!-- Pop-up: an in-page modal (backdrop + centered card) loading this
           sector's quote-window.html in an iframe — what a real client site
           gets via embed.js's data-dealz-mode="window". -->
      <div id="demo-popup-overlay" class="demo-popup-overlay">
        <div class="demo-popup-card">
          <button id="demo-popup-close" class="demo-popup-close" aria-label="${cfg.closeLbl}">✕</button>
          <iframe id="demo-popup-iframe" title="${cfg.quoteTitle}"></iframe>
        </div>
      </div>

      <div class="demo-followup" id="demo-followup">
        <h2>${cfg.followTitle}</h2>
        <div class="imagine-lines">${cfg.followLines}</div>
        <div class="demo-followup-ctas">
          <a href="${landingUrl}#contact" class="btn btn-primary">${cfg.followInstall}</a>
          <a href="${landingUrl}#tarifs" class="btn btn-secondary">${cfg.followPricing}</a>
          <a href="mailto:dealz@dealz.website" class="btn btn-secondary">${cfg.followContact}</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="sc-footer">
    ${esc(cfg.footerDemo(D))}
    ${cfg.poweredBy} <a href="${landingUrl}">⚡ Dealz</a>.
  </footer>

  <script>window.DEALZ_LANG = "${lang}"; window.DEALZ_SECTOR = "${S.slug}";</script>
  <script src="/demo-tabs.js"></script>
  <script src="/secteurs/data/${S.slug}.js"></script>
  <script src="/sector-quote.js"></script>
  <script src="/lead-gate.js"></script>
  <script src="/whatsapp-trial-card.js"></script>
  <script>
    document.addEventListener("dealz:quote-delivered", function () {
      var el = document.getElementById("demo-followup");
      if (!el.classList.contains("show")) {
        el.classList.add("show");
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    // Switches between the four "how this looks on your site" panels (same
    // behaviour as the SwissClean demo). The chat mode is the real
    // floating-bubble behaviour: the single .quote-panel node is physically
    // moved between the inline slot and the fixed-position bubble slot.
    (function () {
      var tabButtons = document.querySelectorAll("#devis-mode-tabs .dmt-btn");
      var panels = document.querySelectorAll(".devis-mode-panel");
      var quotePanel = document.getElementById("quote-panel");
      var inlineSlot = document.getElementById("quote-panel-slot");
      var bubbleSlot = document.getElementById("demo-widget-panel-slot");
      var launcher = document.getElementById("demo-widget-launcher");

      function setMode(mode) {
        tabButtons.forEach(function (b) { b.classList.toggle("active", b.dataset.devisMode === mode); });
        panels.forEach(function (p) { p.classList.toggle("active", p.dataset.devisPanel === mode); });
        if (mode === "chat") {
          bubbleSlot.appendChild(quotePanel);
          launcher.classList.add("show");
          bubbleSlot.classList.remove("open");
        } else {
          inlineSlot.appendChild(quotePanel);
          launcher.classList.remove("show");
          bubbleSlot.classList.remove("open");
        }
      }
      tabButtons.forEach(function (btn) {
        btn.addEventListener("click", function () { setMode(btn.dataset.devisMode); });
      });
      launcher.addEventListener("click", function () { bubbleSlot.classList.toggle("open"); });
    })();

    // Pop-up mode: in-page modal (stays on this page), not a new window.
    (function () {
      var overlay = document.getElementById("demo-popup-overlay");
      var iframe = document.getElementById("demo-popup-iframe");
      function openPopup() {
        if (!iframe.src) iframe.src = "${cfg.base}/${S.slug}/quote-window.html?embedded=1";
        overlay.classList.add("open");
      }
      function closePopup() { overlay.classList.remove("open"); }
      document.getElementById("try-popup-btn").addEventListener("click", openPopup);
      document.getElementById("demo-popup-close").addEventListener("click", closePopup);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) closePopup(); });
    })();
  </script>
</body>
</html>
`;
}

// ---------- pop-up / embedded quote page ----------
// Counterpart of docs/quote-window.html for a sector: the same page real
// client sites get via embed.js's "window" mode, loaded in an iframe by the
// demo's Pop-up tab. Reuses quote-window.html's own stylesheet verbatim
// (extracted at build time) so both look identical, themed with the sector's
// palette, plus the lead gate (the pop-up can be opened before the gate was
// passed on the page) and the post-quote call-to-action styles.
function buildQuoteWindow(S, lang) {
  const cfg = STR[lang];
  const D = S[lang].demo;
  const c = S.colors;
  const src = fs.readFileSync(path.join(DOCS, "quote-window.html"), "utf8");
  const a = src.indexOf("<style>"), b = src.indexOf("</style>");
  if (a < 0 || b < 0) throw new Error("could not find the stylesheet in docs/quote-window.html");
  const baseCss = src.slice(a + "<style>".length, b);
  const extraCss = `
  :root{--dz-blue:${c.main};--dz-blue-dark:${c.dark};--dz-navy:${c.dark};--dz-sky-light:${c.light};}
  .dealz-lead-gate{flex:1;display:flex;flex-direction:column;gap:8px;padding:20px 18px;justify-content:center;}
  .dlg-intro{font-size:13.5px;color:var(--dz-muted);margin:0 0 4px;font-weight:600;}
  .dlg-msg{font-size:12.5px;margin:6px 0 0;display:none;} .dlg-msg.show{display:block;} .dlg-msg.ok{color:var(--dz-green);} .dlg-msg.err{color:#e30613;}
  .dealz-chat-body{flex:1;display:flex;flex-direction:column;min-height:0;}
  .dealz-post-cta{align-self:stretch;background:#fff;border:1.5px solid var(--dz-blue);border-radius:14px;overflow:hidden;}
  .dealz-post-cta .dpc-text{margin:0;padding:14px 14px 10px;font-size:13.5px;font-weight:700;color:var(--dz-ink);}
  .dealz-post-cta .dpc-actions{display:flex;gap:10px;padding:4px 14px 14px;}
  .dealz-post-cta .dpc-btn{flex:1;text-align:center;border-radius:20px;padding:9px 12px;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer;}
  .dealz-post-cta .dpc-btn-primary{background:linear-gradient(135deg,var(--dz-blue),var(--dz-blue-dark));color:#fff;}
  .dealz-post-cta .dpc-btn-secondary{background:#fff;color:var(--dz-muted);border:1.5px solid var(--dz-line);}
  `;
  return `<!doctype html>
<html lang="${cfg.htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(D.brand)} · ${cfg.quoteWord}</title>
<!-- Généré par scripts/build-sectors.js depuis docs/secteurs/data/${S.slug}.js — ne pas éditer à la main.
     ?embedded=1 : masque l'en-tête et les marges pour une intégration en iframe (mode « pop-up »). -->
<style>${baseCss}${extraCss}</style>
</head>
<body>
  <div id="dealz-window">
    <div class="dealz-embed-header" id="dealz-window-header">
      <div class="dealz-header-brand"><div><div class="t">${esc(D.brand)} · ${cfg.quoteWord}</div><div class="s">${cfg.quoteSub}</div></div></div>
      <button id="dealz-window-close" aria-label="${cfg.closeLbl}">✕</button>
    </div>

    <div class="dealz-lead-gate" id="dealz-lead-gate">
      <p class="dlg-intro">${cfg.gateIntro}</p>
      <input class="dcf-input" id="dlg-company" placeholder="${cfg.gateCompany}" />
      <input class="dcf-input" id="dlg-email" type="email" placeholder="${cfg.gateEmail}" required />
      <input class="dcf-input" id="dlg-phone" placeholder="${cfg.gatePhone}" />
      <button class="dcf-submit" id="dlg-submit">${cfg.gateGo}</button>
      <p class="dlg-msg" id="dlg-msg"></p>
    </div>

    <div class="dealz-chat-body" id="dealz-chat-body" style="display: none">
      <div class="dealz-messages" id="dealz-messages"></div>
      <div class="dealz-inputbar">
        <input id="dealz-input" type="text" placeholder="${esc(D.inputPlaceholder)}" autocomplete="off" />
        <button id="dealz-send">${cfg.sendLabel}</button>
      </div>
    </div>
  </div>

  <script>
    var params = new URLSearchParams(location.search);
    window.DEALZ_API_BASE = params.get("api-base") || location.origin;
    window.DEALZ_LANG = "${lang}";
    window.DEALZ_SECTOR = "${S.slug}";
    if (params.get("embedded") === "1") document.body.classList.add("dz-embedded");
    // Closing only works if this page was opened as a popup window; otherwise go back.
    document.getElementById("dealz-window-close").addEventListener("click", function () {
      window.close();
      setTimeout(function () { if (!window.closed && window.history.length > 1) window.history.back(); }, 50);
    });
  </script>
  <script src="/secteurs/data/${S.slug}.js"></script>
  <script src="/sector-quote.js"></script>
  <script src="/lead-gate.js"></script>
</body>
</html>
`;
}

// ---------- hub ----------
function buildHub(lang, all) {
  const cfg = STR[lang];
  const card = (icon, label, pitch, landing, demo) =>
    '      <div class="sector-card">\n        <div class="sector-icon">' + esc(icon) + "</div>\n        <h3>" + esc(label) + "</h3>\n        <p>" + esc(pitch) + '</p>\n        <div class="sector-links"><a class="btn btn-primary" href="' + landing + '">' + cfg.discover + '</a><a class="btn btn-secondary" href="' + demo + '">' + cfg.tryDemo + "</a></div>\n      </div>";
  const cards = [card("🧽", cfg.cleaningLabel, cfg.cleaningPitch, cfg.home, cfg.demoHome)]
    .concat(all.map((s) => card(s.icon, s[lang].label, s[lang].pitch, cfg.base + "/" + s.slug + "/", cfg.base + "/" + s.slug + "/demo.html")))
    .join("\n");
  const title = "Dealz par secteur — devis instantané par IA pour votre métier";
  const desc = "Déménagement, jardinage, peinture, pressing, piscines, traiteurs… Découvrez Dealz pour votre secteur et essayez une démo adaptée à votre métier.";
  return `<!doctype html>
<html lang="${cfg.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
${fonts()}  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
<!-- Généré par scripts/build-sectors.js — ne pas éditer à la main. -->

${siteNav(lang, null, false)}
  <section class="hero">
    <div class="hero-inner">
      <span class="eyebrow">${cfg.sectorsHeroEyebrow}</span>
      <h1>${esc(cfg.sectorsH1[0])}<br>${esc(cfg.sectorsH1[1])}</h1>
      <p class="hero-question">${cfg.sectorsQuestion}</p>
      <p>${cfg.sectorsText}</p>
      <p class="hero-tagline">${cfg.slogan}</p>
    </div>
  </section>

  <section>
    <div class="section-inner">
      <div class="sector-grid">
${cards}
      </div>
    </div>
  </section>

  <section class="section-alt">
    <div class="section-inner">
      <div class="final-cta">
        <h2>${cfg.sectorsCtaTitle}</h2>
        <p class="lead-line">${cfg.sectorsCtaText}</p>
        <div class="hero-ctas">
          <a href="mailto:dealz@dealz.website" class="btn btn-primary">${cfg.followContact}</a>
          <a href="${cfg.home}#tarifs" class="btn btn-secondary" style="background:transparent; color:white; border-color:rgba(255,255,255,0.4);">${cfg.navPricing}</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div>Dealz — Assistant de vente IA pour entreprises de services suisses. 🇨🇭</div>
    <div class="site-footer-slogan">${cfg.slogan}</div>
    <div class="site-footer-referral"><a href="/parrainage.html">${cfg.referral}</a></div>
  </footer>
</body>
</html>
`;
}

// Keeps the "Votre métier" chips on the main French page in sync with the
// sector list (between the SECTORS-CHIPS markers in docs/index.html).
function injectIndexChips(all) {
  const file = path.join(DOCS, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const start = "<!-- SECTORS-CHIPS:START -->";
  const end = "<!-- SECTORS-CHIPS:END -->";
  const a = html.indexOf(start), b = html.indexOf(end);
  if (a < 0 || b < 0) throw new Error("SECTORS-CHIPS markers missing in docs/index.html");
  const chips = '<div class="sector-chips">\n        ' + sectorsChips("fr", null, all).replace(/\n          /g, "\n        ") + "\n      </div>\n      ";
  write(file, html.slice(0, a + start.length) + "\n      " + chips + html.slice(b));
}

// ---------- main ----------
function main() {
  const { map, missing, extra } = loadSectors();
  const errors = [];
  if (missing.length && !PARTIAL) errors.push("missing sector files: " + missing.join(", "));
  if (extra.length) errors.push("sector files not listed in ORDER: " + extra.join(", "));
  const all = ORDER.filter((s) => map[s]).map((s) => map[s]);

  const langs = Object.keys(STR).filter((l) => all.length && all.every((s) => s[l]));
  all.forEach((S) => {
    ["slug", "icon", "colors", "quote"].forEach((k) => { if (!S[k]) errors.push(S.slug + ": missing " + k); });
    langs.forEach((l) => validateSector(S, l, errors));
  });
  if (errors.length) {
    console.error("Sector validation failed:\n - " + errors.join("\n - "));
    process.exit(1);
  }

  let pages = 0;
  langs.forEach((lang) => {
    TYPO_LANG = lang;
    const cfg = STR[lang];
    const tarifs = extractTarifs(lang);
    const baseDir = path.join(DOCS, cfg.base);
    write(path.join(baseDir, "index.html"), buildHub(lang, all));
    pages++;
    all.forEach((S) => {
      write(path.join(baseDir, S.slug, "index.html"), buildLanding(S, lang, all, tarifs));
      write(path.join(baseDir, S.slug, "demo.html"), buildDemo(S, lang));
      write(path.join(baseDir, S.slug, "quote-window.html"), buildQuoteWindow(S, lang));
      pages += 3;
    });
  });
  if (langs.includes("fr")) injectIndexChips(all);

  // Static slug -> metadata map for the server (src/sectors.js): used by the
  // install-request e-mail / CRM lead and by the real demo e-mails, which are
  // sent under the demo company's name with the trade's own vocabulary.
  const meta = {};
  all.forEach((S) => {
    const d = S.fr.demo;
    meta[S.slug] = {
      label: S.fr.label,
      emailNoun: S.fr.emailNoun,
      company: { name: d.pdfCompany.name, email: d.contact.email, phone: d.contact.phone, address: d.pdfCompany.address },
    };
  });
  write(path.join(ROOT, "src", "sector-meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log((CHECK_ONLY ? "OK (check only) — " : "Built ") + all.length + " sectors, languages [" + langs.join(", ") + "], " + pages + " pages.");
}

main();
