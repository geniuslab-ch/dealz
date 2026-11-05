/**
 * Shows Dealz's own prices in the visitor's currency: CHF in Switzerland
 * (and Liechtenstein), GBP in the UK, EUR in Europe, USD everywhere else.
 * Each currency has its own price list (docs/prices.js, loaded first):
 * the numbers change with the currency, not only the symbol.
 *
 * The country comes from the server (GET /api/geo, which reads Vercel's
 * x-vercel-ip-country header); until it answers, or if it can't, the
 * computer's time zone is used (Europe/Zurich = CHF), then the browser
 * language's region, then CHF. The time zone comes first because an
 * English or German browser in Switzerland ("en-GB", "de-DE") would
 * otherwise show GBP or EUR.
 *
 * Preview another market from anywhere: ?currency=EUR (or GBP, USD, CHF)
 * or a country code (?currency=FR, ?currency=UK, ?currency=US) shows that
 * market's prices and keeps them for the rest of the visit (sessionStorage).
 * While a preview is on, a small bar at the top of the page says so and
 * links back to the visitor's own prices (?currency=auto, which also
 * clears the preview).
 * A preview only changes what is shown: .billingCode, which the contact
 * flow sends to checkout and to the install request, stays the visitor's
 * own currency.
 *
 * Markup:
 *   <span data-price="CLOSE"></span>        a price from the list: a plan
 *                                            (CAPTURE, CLOSE, SCALE),
 *                                            "PLAN.year", "PLAN.once",
 *                                            "setup" or "extra"
 *   <span data-price="48.30"></span>        a fixed amount, only formatted
 *   <p data-tax-note></p>                   "Prices in CHF, excl. VAT."
 *   [data-if-setup] / [data-if-no-setup]    shown only when the currency
 *                                            has / has no setup fee
 *   [data-currency-only="USD"]              shown only in these currencies
 *   [data-currency-not="USD"]               hidden in these currencies
 * Scripts use window.DealzCurrency.format(n) and .price(key).
 */
(function () {
  "use strict";

  var EURO = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS NO AD MC SM VA ME AL BA MK RS".split(" ");
  var SYMBOL = { CHF: "CHF ", EUR: "€", GBP: "£", USD: "$" };
  var TAX_NOTE = {
    fr: { CHF: "Prix en CHF, hors TVA.", EUR: "Prix en euros, HT.", GBP: "Prix en livres sterling, hors TVA.", USD: "Prix en dollars US, hors taxes." },
    en: { CHF: "Prices in CHF, excl. VAT.", EUR: "Prices in euros, excl. VAT.", GBP: "Prices in pounds sterling, excl. VAT.", USD: "Prices in US dollars, excl. sales tax." },
    de: { CHF: "Preise in CHF, exkl. MWST.", EUR: "Preise in Euro, zzgl. MwSt.", GBP: "Preise in britischen Pfund, zzgl. MwSt.", USD: "Preise in US-Dollar, zzgl. Steuern." },
  };

  function currencyFor(country) {
    country = String(country || "").toUpperCase();
    if (!country) return null;
    if (country === "CH" || country === "LI") return "CHF";
    if (country === "GB" || country === "UK" || country === "GG" || country === "JE" || country === "IM") return "GBP";
    if (EURO.indexOf(country) >= 0) return "EUR";
    return "USD";
  }

  // The computer's time zone: Swiss, British and US zones, and the euro
  // zone's capitals. Anything else gives no answer.
  var ZONE = {
    "Europe/Zurich": "CH", "Europe/Vaduz": "LI", "Europe/Busingen": "CH",
    "Europe/London": "GB", "Europe/Guernsey": "GG", "Europe/Jersey": "JE", "Europe/Isle_of_Man": "IM", "Europe/Belfast": "GB",
    "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Vienna": "AT", "Europe/Brussels": "BE", "Europe/Amsterdam": "NL",
    "Europe/Luxembourg": "LU", "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Lisbon": "PT", "Europe/Dublin": "IE",
    "Europe/Monaco": "MC", "Europe/Andorra": "AD",
  };
  function fromTimeZone() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (ZONE[tz]) return currencyFor(ZONE[tz]);
      if (/^America\/(New_York|Chicago|Denver|Phoenix|Los_Angeles|Anchorage|Detroit|Boise|Indiana|Kentucky|North_Dakota)/.test(tz) || tz === "Pacific/Honolulu") return "USD";
    } catch (e) {}
    return null;
  }

  function fromBrowser() {
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var m = String(langs[i]).match(/-([A-Za-z]{2})$/);
      if (m) return currencyFor(m[1]);
    }
    return null;
  }

  // ?currency=GBP or ?currency=UK: a currency code, else a country code.
  // ?currency=auto (or reset) ends a preview: "auto" is returned.
  function fromUrl() {
    var m = /[?&]currency=([A-Za-z]{2,5})(?:[&#]|$)/.exec(location.search);
    if (!m) return null;
    var v = m[1].toUpperCase();
    if (v === "AUTO" || v === "RESET") return "AUTO";
    if (SYMBOL[v]) return v;
    return v.length === 2 ? currencyFor(v) : null;
  }

  function load(key) {
    try { var v = sessionStorage.getItem(key); return v && SYMBOL[v] ? v : null; } catch (e) { return null; }
  }

  // "dealz-currency": the visitor's own currency (country, else browser).
  // "dealz-currency-preview": a market picked with ?currency=, display only.
  var preview = fromUrl();
  if (preview === "AUTO") {
    preview = null;
    try { sessionStorage.removeItem("dealz-currency-preview"); } catch (e) {}
  } else if (preview) {
    try { sessionStorage.setItem("dealz-currency-preview", preview); } catch (e) {}
  } else {
    preview = load("dealz-currency-preview");
  }
  var stored = load("dealz-currency");
  var billing = stored || fromTimeZone() || fromBrowser() || "CHF";
  var code = preview || billing;

  function list() {
    return window.DealzPrices ? window.DealzPrices.list(code) : null;
  }

  // A price key from the markup ("CLOSE", "CLOSE.year", "setup"...) or a
  // plain number. Unknown keys give NaN.
  function price(key) {
    var s = String(key == null ? "" : key);
    if (s !== "" && !isNaN(Number(s))) return Number(s);
    var L = list();
    if (!L) return NaN;
    var parts = s.split(".");
    var plan = parts[0];
    if (plan === "setup") return L.setup;
    if (plan === "extra") return L.extra;
    if (!(plan in L.plans)) return NaN;
    if (parts[1] === "year") return window.DealzPrices.yearly(L.plans[plan]);
    if (parts[1] === "once") return L.once[plan];
    return L.plans[plan];
  }

  // "48.30" stays "48.30"; whole amounts drop the decimals ("390"), and
  // thousands get a separator ("1'897.10" in CHF, "1,897.10" otherwise).
  function format(n) {
    var v = Number(n);
    var whole = Math.round(v * 100) % 100 === 0;
    var s = v.toFixed(whole ? 0 : 2);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, code === "CHF" ? "'" : ",");
    return SYMBOL[code] + parts.join(".");
  }

  function each(root, sel, fn) {
    var els = (root || document).querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) fn(els[i]);
  }
  function inList(attr) {
    return String(attr || "").toUpperCase().split(/[\s,]+/).indexOf(code) >= 0;
  }

  function apply(root) {
    each(root, "[data-price]", function (el) {
      var v = price(el.getAttribute("data-price"));
      if (!isNaN(v)) el.textContent = format(v);
    });
    var L = list();
    var lang = (document.documentElement.lang || "fr").slice(0, 2);
    each(root, "[data-tax-note]", function (el) {
      el.textContent = (TAX_NOTE[lang] || TAX_NOTE.fr)[code];
    });
    if (L) {
      each(root, "[data-if-setup]", function (el) { el.hidden = !L.setup; });
      each(root, "[data-if-no-setup]", function (el) { el.hidden = !!L.setup; });
    }
    each(root, "[data-currency-only]", function (el) { el.hidden = !inList(el.getAttribute("data-currency-only")); });
    each(root, "[data-currency-not]", function (el) { el.hidden = inList(el.getAttribute("data-currency-not")); });
  }

  function set(next) {
    if (!next || !SYMBOL[next]) return;
    billing = next;
    try { sessionStorage.setItem("dealz-currency", billing); } catch (e) {}
    if (preview || next === code) return;
    code = next;
    apply();
    window.dispatchEvent(new CustomEvent("dealz-currency", { detail: { code: code } }));
  }

  // The bar shown while a ?currency= preview is on, so a preview never
  // looks like the visitor's real prices.
  var BAR = {
    fr: ["Aperçu des prix en ", "Revenir à mes prix"],
    en: ["Previewing prices in ", "Back to my prices"],
    de: ["Vorschau der Preise in ", "Zurück zu meinen Preisen"],
  };
  function previewBar() {
    if (!preview || !document.body || document.getElementById("dealz-currency-preview")) return;
    var t = BAR[(document.documentElement.lang || "fr").slice(0, 2)] || BAR.fr;
    // Keep the rest of the query (e.g. ?checkout=success&s=... after Stripe).
    var q = location.search.replace(/^\?/, "").split("&").filter(function (p) { return p && !/^currency=/i.test(p); });
    q.push("currency=auto");
    var url = location.pathname + "?" + q.join("&") + location.hash;
    var bar = document.createElement("div");
    bar.id = "dealz-currency-preview";
    bar.setAttribute("role", "status");
    bar.style.cssText = "position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:2147483001;" +
      "max-width:calc(100% - 32px);box-sizing:border-box;padding:10px 16px;border-radius:999px;" +
      "background:#111;color:#fff;font:14px/1.3 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25);text-align:center;";
    var text = document.createElement("span");
    text.textContent = t[0] + preview + " · ";
    var link = document.createElement("a");
    link.href = url;
    link.textContent = t[1];
    link.style.cssText = "color:#fff;text-decoration:underline;font-weight:600;";
    bar.appendChild(text);
    bar.appendChild(link);
    document.body.appendChild(bar);
  }

  window.DealzCurrency = {
    format: format,
    price: price,
    apply: apply,
    get code() { return code; },
    get billingCode() { return billing; },
    get setup() { var L = list(); return L ? L.setup : 0; },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { apply(); previewBar(); });
  else { apply(); previewBar(); }

  if (!stored) {
    fetch((window.DEALZ_API_BASE || "") + "/api/geo")
      .then(function (r) { return r.json(); })
      .then(function (d) { set(currencyFor(d.country)); })
      .catch(function () {});
  }
})();
