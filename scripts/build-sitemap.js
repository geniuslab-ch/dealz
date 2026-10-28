#!/usr/bin/env node
/**
 * Builds docs/sitemap.xml from the HTML pages under docs/ (committed, so
 * deploys need no build step). Run it again after adding or removing a page:
 *
 *   node scripts/build-sitemap.js
 *
 * Not listed: the widget pages (quote-window.html), the personal quote pages
 * (offer.html, counteroffer.html) and the private folder docs/p/.
 * Each page lists its French / German / English versions as hreflang
 * alternates; the French one is the x-default. No <lastmod>: the files carry
 * no editing date that would be true.
 */
const fs = require("fs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "docs");
const BASE = "https://dealz.website";
const SKIP_NAMES = new Set(["quote-window.html", "offer.html", "counteroffer.html"]);
const SKIP_DIRS = new Set(["p", "node_modules"]);
const LANGS = ["fr", "de", "en"];
// The privacy policy has a different file name in each language.
const SAME_PAGE = { "confidentialite.html": "privacy", "datenschutz.html": "privacy", "privacy.html": "privacy" };

function walk(dir, rel = "") {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (rel === "" && SKIP_DIRS.has(e.name)) continue;
      out = out.concat(walk(path.join(dir, e.name), rel ? rel + "/" + e.name : e.name));
    } else if (e.name.endsWith(".html") && !SKIP_NAMES.has(e.name)) {
      out.push(rel ? rel + "/" + e.name : e.name);
    }
  }
  return out;
}

const urlOf = (file) => BASE + "/" + file.replace(/(^|\/)index\.html$/, "$1");
const langOf = (file) => (/^(de|en)\//.test(file) ? file.slice(0, 2) : "fr");
const bare = (file) => file.replace(/^(de|en)\//, "");
function keyOf(file) {
  const b = bare(file);
  return SAME_PAGE[b] || b;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const files = walk(DOCS).sort();
const groups = new Map();
for (const f of files) {
  const k = keyOf(f);
  if (!groups.has(k)) groups.set(k, {});
  groups.get(k)[langOf(f)] = f;
}

const entries = [];
for (const f of files) {
  const g = groups.get(keyOf(f));
  const alts = LANGS.filter((l) => g[l]);
  let xml = "  <url>\n    <loc>" + esc(urlOf(f)) + "</loc>\n";
  if (alts.length > 1) {
    for (const l of alts) xml += '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + esc(urlOf(g[l])) + '" />\n';
    if (g.fr) xml += '    <xhtml:link rel="alternate" hreflang="x-default" href="' + esc(urlOf(g.fr)) + '" />\n';
  }
  entries.push(xml + "  </url>\n");
}

const out =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  entries.join("") +
  "</urlset>\n";
fs.writeFileSync(path.join(DOCS, "sitemap.xml"), out);
console.log("sitemap.xml: " + entries.length + " pages");
