#!/usr/bin/env node
/**
 * Builds docs/sitemap.xml from the HTML pages under docs/ (committed, so
 * deploys need no build step). Run it again after adding or removing a page:
 *
 *   node scripts/build-sitemap.js
 *
 * Lists the indexable pages only (see site-pages.js): no widget, personal
 * quote, private or demo pages. Each page lists its French / German / English
 * versions as hreflang alternates; the French one is the x-default.
 * <lastmod> is the page's last change: today if it has uncommitted edits,
 * otherwise its last git commit.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { DOCS, walk, isIndexable, urlOf, groupsOf, alternatesOf } = require("./site-pages");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const git = (args) => execFileSync("git", args, {
  cwd: path.join(__dirname, ".."),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
}).trim();
const TODAY = new Date().toISOString().slice(0, 10);

// Date of the page's last change: today when it has uncommitted edits (the
// usual case right after `npm run build`), otherwise its last commit date.
function lastModified(file) {
  const rel = path.join("docs", file);
  try {
    if (git(["status", "--porcelain", "--", rel])) return TODAY;
    const out = git(["log", "-1", "--format=%cs", "--", rel]);
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : TODAY;
  } catch (e) {
    return "";
  }
}

const files = walk().filter(isIndexable);
const groups = groupsOf(files);

const entries = files.map((f) => {
  let xml = "  <url>\n    <loc>" + esc(urlOf(f)) + "</loc>\n";
  const date = lastModified(f);
  if (date) xml += "    <lastmod>" + date + "</lastmod>\n";
  for (const a of alternatesOf(f, groups)) {
    xml += '    <xhtml:link rel="alternate" hreflang="' + a.lang + '" href="' + esc(a.href) + '" />\n';
  }
  return xml + "  </url>\n";
});

const out =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  entries.join("") +
  "</urlset>\n";
fs.writeFileSync(path.join(DOCS, "sitemap.xml"), out);
console.log("sitemap.xml: " + entries.length + " pages");
