/**
 * Translated URLs of the site's pages.
 *
 * The French pages keep their French paths (/secteurs/<slug>/). The English,
 * German and Italian pages use paths in their own language:
 *
 *   /secteurs/toiture/   /en/sectors/roofing/   /de/branchen/dach/   /it/settori/tetti/
 *   /parrainage.html     /en/referral.html      /de/empfehlung.html  /it/passaparola.html
 *
 * The sector's internal id (S.slug, the data file name, DEALZ_SECTOR) stays
 * the French slug everywhere; only the public URL changes. The old EN/DE
 * paths (/en/secteurs/…, /de/secteurs/…, /en|de/parrainage.html) are
 * redirected by vercel.json (written by scripts/build-redirects.js), so
 * links already sent on WhatsApp or by e-mail keep working.
 *
 * Used by build-sectors.js, build-seo.js, build-redirects.js and the server
 * (src/notifications.js). Adding a sector: add its slugs here.
 */
const SECTOR_SLUGS = {
  carrelage: { en: "tiling", de: "plattenleger" , it: "piastrelle" },
  conciergerie: { en: "property-maintenance", de: "hauswartung" , it: "custode-immobili" },
  debarras: { en: "house-clearance", de: "raeumung" , it: "sgomberi" },
  demenagement: { en: "moving", de: "umzug" , it: "traslochi" },
  desinfection: { en: "pest-control", de: "schaedlingsbekaempfung" , it: "disinfestazione" },
  elagage: { en: "tree-surgery", de: "baumpflege" , it: "potatura-alberi" },
  electricien: { en: "electrician", de: "elektriker" , it: "elettricista" },
  facades: { en: "facades", de: "fassaden" , it: "facciate" },
  impression: { en: "printing-signage", de: "druck-beschriftung" , it: "stampa-insegne" },
  isolation: { en: "insulation", de: "waermedaemmung" , it: "isolamento" },
  jardinage: { en: "gardening", de: "gartenbau" , it: "giardinaggio" },
  "lavage-auto": { en: "car-detailing", de: "autowaesche" , it: "lavaggio-auto" },
  "location-evenementiel": { en: "event-rental", de: "eventmaterial-vermietung" , it: "noleggio-eventi" },
  "location-materiel": { en: "equipment-rental", de: "geraetevermietung" , it: "noleggio-attrezzature" },
  "location-vehicules": { en: "vehicle-rental", de: "fahrzeugvermietung" , it: "noleggio-veicoli" },
  "montage-meubles": { en: "furniture-assembly", de: "moebelmontage" , it: "montaggio-mobili" },
  "nettoyage-textiles": { en: "upholstery-cleaning", de: "polsterreinigung" , it: "pulizia-tappezzeria" },
  nettoyage: { en: "cleaning", de: "reinigung" , it: "pulizie" },
  peinture: { en: "painting", de: "maler" , it: "pittura" },
  "photo-video": { en: "photography-video", de: "fotografie-video" , it: "foto-video" },
  piscines: { en: "pool-maintenance", de: "poolunterhalt" , it: "manutenzione-piscine" },
  platrerie: { en: "plastering", de: "gipser" , it: "gessatore" },
  pressing: { en: "dry-cleaning", de: "waescherei" , it: "lavanderia" },
  renovation: { en: "renovation", de: "renovation" , it: "ristrutturazione" },
  sanitaire: { en: "plumbing-heating", de: "sanitaer-heizung" , it: "idraulica-riscaldamento" },
  serrurerie: { en: "locksmith", de: "schluesseldienst" , it: "fabbro" },
  sols: { en: "flooring", de: "bodenbelaege" , it: "pavimenti" },
  stores: { en: "blinds-shutters", de: "storen" , it: "tende-tapparelle" },
  toiture: { en: "roofing", de: "dach" , it: "tetti" },
  traiteur: { en: "catering", de: "catering" , it: "catering" },
  "transport-livraison": { en: "transport-delivery", de: "transport-lieferung" , it: "trasporti-consegne" },
  vitres: { en: "window-cleaning", de: "fensterreinigung" , it: "pulizia-vetri" },
};

// Folder of the sector pages in each language.
const SECTOR_BASE = { fr: "/secteurs", en: "/en/sectors", de: "/de/branchen", it: "/it/settori" };
// Folder they used before (EN/DE pages had the French folder name).
const OLD_SECTOR_BASE = { en: "/en/secteurs", de: "/de/secteurs" };

// Other pages whose file name differs per language.
const PAGES = {
  referral: { fr: "/parrainage.html", en: "/en/referral.html", de: "/de/empfehlung.html", it: "/it/passaparola.html" },
  privacy: { fr: "/confidentialite.html", en: "/en/privacy.html", de: "/de/datenschutz.html", it: "/it/privacy.html" },
  terms: { fr: "/conditions.html", en: "/en/terms.html", de: "/de/agb.html", it: "/it/condizioni.html" },
};
const OLD_PAGES = { "/en/parrainage.html": PAGES.referral.en, "/de/parrainage.html": PAGES.referral.de };

function sectorSlug(slug, lang) {
  if (lang === "fr") return slug;
  const t = SECTOR_SLUGS[slug];
  if (!t || !t[lang]) throw new Error("No " + lang + " URL slug for sector '" + slug + "' (scripts/sector-urls.js)");
  return t[lang];
}

// "/en/sectors/roofing" (no trailing slash): the sector's folder.
const sectorDir = (slug, lang) => SECTOR_BASE[lang] + "/" + sectorSlug(slug, lang);
// "/en/sectors/roofing/": the sector's landing page.
const sectorUrl = (slug, lang) => sectorDir(slug, lang) + "/";

// For a docs/ file path ("en/sectors/roofing/demo.html"), the French
// equivalent ("secteurs/toiture/demo.html"), so language versions of a page
// share one key. Other files are returned unchanged.
function frenchPathOf(file) {
  for (const lang of ["en", "de", "it"]) {
    const base = SECTOR_BASE[lang].slice(1) + "/";
    if (!file.startsWith(base)) continue;
    const rest = file.slice(base.length);
    const i = rest.indexOf("/");
    if (i < 0) return "secteurs/" + rest;
    const local = rest.slice(0, i);
    const slug = Object.keys(SECTOR_SLUGS).find((s) => SECTOR_SLUGS[s][lang] === local);
    return "secteurs/" + (slug || local) + rest.slice(i);
  }
  for (const k of Object.keys(PAGES)) {
    for (const lang of ["en", "de", "it"]) if ("/" + file === PAGES[k][lang]) return PAGES[k].fr.slice(1);
  }
  return file;
}

module.exports = { SECTOR_SLUGS, SECTOR_BASE, OLD_SECTOR_BASE, PAGES, OLD_PAGES, sectorSlug, sectorDir, sectorUrl, frenchPathOf };
