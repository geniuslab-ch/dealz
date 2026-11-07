/**
 * The site's public pages and their language versions, shared by
 * build-sitemap.js and build-seo.js so both always agree.
 *
 * Not public (left out of the sitemap, never canonical): the widget pages
 * (quote-window.html), the personal quote pages (offer.html, counteroffer.html)
 * and the private folder docs/p/. Demo pages (demo.html) are walked but marked
 * noindex: they are the fictional demo companies, not Dealz content.
 */
const fs = require("fs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "docs");
const BASE = "https://dealz.website";
const PRIVATE_NAMES = new Set(["quote-window.html", "offer.html", "counteroffer.html"]);
const SKIP_DIRS = new Set(["p", "node_modules"]);
const LANGS = ["fr", "de", "en"];
// The privacy policy has a different file name in each language.
const SAME_PAGE = { "confidentialite.html": "privacy", "datenschutz.html": "privacy", "privacy.html": "privacy" };

function walk(dir = DOCS, rel = "") {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (rel === "" && SKIP_DIRS.has(e.name)) continue;
      out = out.concat(walk(path.join(dir, e.name), rel ? rel + "/" + e.name : e.name));
    } else if (e.name.endsWith(".html")) {
      out.push(rel ? rel + "/" + e.name : e.name);
    }
  }
  return out.sort();
}

const isPrivate = (file) => PRIVATE_NAMES.has(path.basename(file));
const isDemo = (file) => path.basename(file) === "demo.html";
const isIndexable = (file) => !isPrivate(file) && !isDemo(file);
const urlOf = (file) => BASE + "/" + file.replace(/(^|\/)index\.html$/, "$1");
const langOf = (file) => (/^(de|en)\//.test(file) ? file.slice(0, 2) : "fr");
const bare = (file) => file.replace(/^(de|en)\//, "");
const keyOf = (file) => SAME_PAGE[bare(file)] || bare(file);

// Map of page key -> { fr, de, en } file paths, for the given files.
function groupsOf(files) {
  const groups = new Map();
  for (const f of files) {
    const k = keyOf(f);
    if (!groups.has(k)) groups.set(k, {});
    groups.get(k)[langOf(f)] = f;
  }
  return groups;
}

// [{ lang, href }] for every language version of `file` (fr, de, en, then
// x-default = French), or [] when the page exists in one language only.
function alternatesOf(file, groups) {
  const g = groups.get(keyOf(file));
  const langs = LANGS.filter((l) => g && g[l]);
  if (langs.length < 2) return [];
  const out = langs.map((l) => ({ lang: l, href: urlOf(g[l]) }));
  if (g.fr) out.push({ lang: "x-default", href: urlOf(g.fr) });
  return out;
}

module.exports = { DOCS, BASE, walk, isPrivate, isDemo, isIndexable, urlOf, langOf, groupsOf, alternatesOf };
