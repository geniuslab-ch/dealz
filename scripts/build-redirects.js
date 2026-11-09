#!/usr/bin/env node
/**
 * Writes into vercel.json the permanent redirects from the old English and
 * German URLs (French folder names: /en/secteurs/toiture/, /de/parrainage.html)
 * to the translated ones (/en/sectors/roofing/, /de/empfehlung.html), see
 * sector-urls.js, so links already sent keep working. The generated rules are
 * recognised by their source path and replaced on each run; hand-written
 * rules are kept first, in their order.
 *
 *   npm run build:redirects   (also part of npm run build)
 */
const fs = require("fs");
const path = require("path");
const { SECTOR_SLUGS, OLD_SECTOR_BASE, OLD_PAGES, sectorDir, SECTOR_BASE } = require("./sector-urls");

const FILE = path.join(__dirname, "..", "vercel.json");
const config = JSON.parse(fs.readFileSync(FILE, "utf8"));

const generated = [];
for (const lang of Object.keys(OLD_SECTOR_BASE)) {
  const old = OLD_SECTOR_BASE[lang];
  for (const slug of Object.keys(SECTOR_SLUGS)) {
    generated.push({ source: old + "/" + slug + "/:path*", destination: sectorDir(slug, lang) + "/:path*", permanent: true });
  }
  generated.push({ source: old + "/:path*", destination: SECTOR_BASE[lang] + "/", permanent: true });
}
for (const [from, to] of Object.entries(OLD_PAGES)) generated.push({ source: from, destination: to, permanent: true });

const isGenerated = (r) =>
  Object.values(OLD_SECTOR_BASE).some((b) => r.source === b + "/:path*" || r.source.startsWith(b + "/")) || OLD_PAGES[r.source];
const kept = (config.redirects || []).filter((r) => !isGenerated(r));
config.redirects = kept.concat(generated);
fs.writeFileSync(FILE, JSON.stringify(config, null, 2) + "\n");
console.log("vercel.json: " + generated.length + " translated-URL redirects (" + kept.length + " hand-written kept)");
