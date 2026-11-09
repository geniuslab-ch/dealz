#!/usr/bin/env node
/**
 * Writes the SEO block into the <head> of every page under docs/ (between the
 * SEO:START / SEO:END markers, replaced on each run, so it is safe to rerun):
 *
 *   - favicon and app icons (every page except the widget pages);
 *   - indexable pages: <link rel="canonical"> and hreflang alternates
 *     (same language groups as the sitemap, see site-pages.js);
 *   - demo pages (fictional demo companies): <meta name="robots" noindex>;
 *   - JSON-LD: Organization + WebSite on the home pages, BreadcrumbList on
 *     the sector pages.
 *
 * Run it after build-sectors.js (which rewrites the sector pages) and after
 * editing any page's <head>:
 *
 *   npm run build:seo
 */
const fs = require("fs");
const path = require("path");
const { DOCS, BASE, walk, isPrivate, isDemo, isIndexable, urlOf, langOf, groupsOf, alternatesOf } = require("./site-pages");

const START = "<!-- SEO:START (scripts/build-seo.js) -->";
const END = "<!-- SEO:END -->";

const L = {
  fr: { home: "Accueil", sectors: "Secteurs", desc: "Assistant de vente IA qui répond aux clients sur WhatsApp et sur le site, calcule le prix selon les tarifs de l'entreprise et prépare le devis 24/7." },
  en: { home: "Home", sectors: "Sectors", desc: "AI sales assistant that answers customers on WhatsApp and on the website, prices the job from the business's own rates and prepares the quote 24/7." },
  de: { home: "Startseite", sectors: "Branchen", desc: "KI-Verkaufsassistent, der Kunden auf WhatsApp und auf der Website antwortet, den Preis nach den Tarifen des Betriebs berechnet und rund um die Uhr die Offerte erstellt." },
};
const HOME = { fr: "index.html", en: "en/index.html", de: "de/index.html" };
const { frenchPathOf } = require("./sector-urls");
const HUB = { fr: "secteurs/index.html", en: "en/sectors/index.html", de: "de/branchen/index.html" };

// Sector labels per language, from the sector data files.
const DATA_DIR = path.join(DOCS, "secteurs", "data");
const sectors = {};
for (const f of fs.readdirSync(DATA_DIR)) {
  if (!f.endsWith(".js") || f.startsWith("_")) continue;
  const S = require(path.join(DATA_DIR, f));
  if (S && S.slug) sectors[S.slug] = S;
}

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const jsonLd = (obj) => '  <script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, "\\u003c") + "</script>\n";

function icons() {
  return '  <link rel="icon" href="/favicon.ico" sizes="48x48" />\n' +
    '  <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/favicon-32.png" />\n' +
    '  <link rel="icon" type="image/png" sizes="192x192" href="/images/icons/icon-192.png" />\n' +
    '  <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />\n';
}

function structuredData(file) {
  const lang = langOf(file);
  const t = L[lang];
  if (file === HOME[lang]) {
    return jsonLd({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": BASE + "/#organization",
          name: "Dealz",
          url: BASE + "/",
          logo: BASE + "/images/dealz-logo-sm.png",
          email: "dealz@dealz.website",
          telephone: "+41786372553",
          sameAs: [
            "https://www.facebook.com/profile.php?id=61596199507869",
            "https://www.instagram.com/dealz.website",
            "https://www.tiktok.com/@dealz.website",
            "https://www.linkedin.com/company/scharer/",
          ],
          address: {
            "@type": "PostalAddress",
            streetAddress: "Rue des Cygnes 33b",
            postalCode: "1400",
            addressLocality: "Yverdon-les-Bains",
            addressRegion: "VD",
            addressCountry: "CH",
          },
          description: t.desc,
          areaServed: ["CH", "FR", "GB", "US"],
        },
        {
          "@type": "WebSite",
          "@id": BASE + "/#website",
          name: "Dealz",
          url: BASE + "/",
          inLanguage: ["fr", "en", "de"],
          publisher: { "@id": BASE + "/#organization" },
        },
      ],
    });
  }
  const crumbs = [{ name: t.home, url: urlOf(HOME[lang]) }];
  const m = frenchPathOf(file).replace(/^(de|en)\//, "").match(/^secteurs\/(?:([^/]+)\/)?index\.html$/);
  if (!m) return "";
  crumbs.push({ name: t.sectors, url: urlOf(HUB[lang]) });
  if (m[1]) {
    const S = sectors[m[1]];
    if (!S || !S[lang]) return "";
    crumbs.push({ name: S[lang].label, url: urlOf(file) });
  }
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  });
}

// Demo pages: noindex, but crawlers (Bing) still report a missing description.
// Written only when the page has none of its own.
const DEMO_DESC = {
  fr: (company, sector) => "Démo Dealz" + (sector ? " pour le secteur " + sector.toLowerCase() + "," : "") + " avec " + company + " (entreprise fictive) : demandez un devis sur le site ou sur WhatsApp, voyez le prix calculé et l'offre en PDF.",
  en: (company, sector) => "Dealz demo" + (sector ? " for " + sector.toLowerCase() + "," : "") + " with " + company + " (a fictional company): request a quote on the website or on WhatsApp, see the calculated price and the PDF offer.",
  de: (company, sector) => "Dealz-Demo" + (sector ? " für " + sector : "") + " mit " + company + " (fiktives Unternehmen): Offerte auf der Website oder per WhatsApp anfragen, berechneten Preis und PDF-Offerte ansehen.",
};
function demoDescription(file, html) {
  const lang = langOf(file);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const company = title.split(" — ")[0].trim() || "SwissClean Sàrl";
  const m = frenchPathOf(file).replace(/^(de|en)\//, "").match(/^secteurs\/([^/]+)\/demo\.html$/);
  const S = m && sectors[m[1]];
  return DEMO_DESC[lang](company, S && S[lang] ? S[lang].label : "");
}

function block(file, groups, html) {
  // Quote window (iframe widget) and personal quote pages: keep them out of search results.
  if (path.basename(file) === "quote-window.html") return "  " + START + '\n  <meta name="robots" content="noindex" />\n  ' + END + "\n";
  let out = icons();
  if (isPrivate(file)) out += '  <meta name="robots" content="noindex" />\n';
  if (isIndexable(file)) {
    out += '  <link rel="canonical" href="' + attr(urlOf(file)) + '" />\n';
    for (const a of alternatesOf(file, groups)) {
      out += '  <link rel="alternate" hreflang="' + a.lang + '" href="' + attr(a.href) + '" />\n';
    }
    out += structuredData(file);
  } else if (isDemo(file)) {
    out += '  <meta name="robots" content="noindex, follow" />\n';
    if (!/<meta name="description"/.test(html.replace(/<!-- SEO:START[\s\S]*?SEO:END -->/, ""))) {
      out += '  <meta name="description" content="' + attr(demoDescription(file, html)) + '" />\n';
    }
  }
  return "  " + START + "\n" + out + "  " + END + "\n";
}

const all = walk();
const groups = groupsOf(all.filter(isIndexable));
let changed = 0;
for (const file of all) {
  const full = path.join(DOCS, file);
  const html = fs.readFileSync(full, "utf8");
  let next = html;
  // Drop the previous block and any hand-written tags it now owns.
  const a = next.indexOf("  " + START), b = next.indexOf(END);
  if (a >= 0 && b > a) next = next.slice(0, a) + next.slice(b + END.length + 1);
  if (!isPrivate(file)) {
    next = next.replace(/^[ \t]*<link rel="(canonical|alternate" hreflang="[^"]*"|icon"|apple-touch-icon")[^>]*>\n/gm, "");
  }
  const head = next.indexOf("</head>");
  if (head < 0) { console.warn("no </head>: " + file); continue; }
  next = next.slice(0, head) + block(file, groups, next) + next.slice(head);
  if (next !== html) { fs.writeFileSync(full, next); changed++; }
}
console.log("SEO block: " + changed + " of " + all.length + " pages updated");
