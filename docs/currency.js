/**
 * Shows Dealz's own prices in the visitor's currency: CHF in Switzerland
 * (and Liechtenstein), GBP in the UK, EUR in Europe, USD everywhere else.
 * Each currency has its own price list (docs/prices.js, loaded first):
 * the numbers change with the currency, not only the symbol.
 *
 * The country comes from the server (GET /api/geo, which reads Vercel's
 * x-vercel-ip-country header); until it answers, or if it can't, the
 * browser language's region is used, then CHF.
 *
 * Preview another market from anywhere: ?currency=EUR (or GBP, USD, CHF)
 * or a country code (?currency=FR, ?currency=UK, ?currency=US) shows that
 * market's prices and keeps them for the rest of the visit (sessionStorage).
 * Stripe Checkout still bills in the visitor's real currency (server.js).
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

  function fromBrowser() {
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var m = String(langs[i]).match(/-([A-Za-z]{2})$/);
      if (m) return currencyFor(m[1]);
    }
    return null;
  }

  // ?currency=GBP or ?currency=UK: a currency code, else a country code.
  function fromUrl() {
    var m = /[?&]currency=([A-Za-z]{2,3})(?:[&#]|$)/.exec(location.search);
    if (!m) return null;
    var v = m[1].toUpperCase();
    if (SYMBOL[v]) return v;
    return v.length === 2 ? currencyFor(v) : null;
  }

  var stored = fromUrl();
  if (stored) {
    try { sessionStorage.setItem("dealz-currency", stored); } catch (e) {}
  } else {
    try { stored = sessionStorage.getItem("dealz-currency"); } catch (e) {}
  }
  var code = (stored && SYMBOL[stored] && stored) || fromBrowser() || "CHF";

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
    if (!next || !SYMBOL[next] || next === code) return;
    code = next;
    try { sessionStorage.setItem("dealz-currency", code); } catch (e) {}
    apply();
    window.dispatchEvent(new CustomEvent("dealz-currency", { detail: { code: code } }));
  }

  window.DealzCurrency = {
    format: format,
    price: price,
    apply: apply,
    get code() { return code; },
    get setup() { var L = list(); return L ? L.setup : 0; },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { apply(); });
  else apply();

  if (!stored) {
    fetch((window.DEALZ_API_BASE || "") + "/api/geo")
      .then(function (r) { return r.json(); })
      .then(function (d) { set(currencyFor(d.country)); })
      .catch(function () {});
  }
})();
