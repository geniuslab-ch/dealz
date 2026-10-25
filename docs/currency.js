/**
 * Shows Dealz's own prices in the visitor's currency: CHF in Switzerland
 * (and Liechtenstein), GBP in the UK, EUR in Europe, USD everywhere else.
 * The amounts are the same numbers in every currency — only the currency
 * changes.
 *
 * The country comes from the server (GET /api/geo, which reads Vercel's
 * x-vercel-ip-country header); until it answers, or if it can't, the
 * browser language's region is used, then CHF.
 *
 * Markup: <span data-price="48.30"></span> is filled with the formatted
 * amount. Scripts use window.DealzCurrency.format(n).
 */
(function () {
  "use strict";

  var EURO = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS NO AD MC SM VA ME AL BA MK RS".split(" ");
  var SYMBOL = { CHF: "CHF ", EUR: "€", GBP: "£", USD: "$" };

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

  var stored = null;
  try { stored = sessionStorage.getItem("dealz-currency"); } catch (e) {}
  var code = stored || fromBrowser() || "CHF";

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

  function apply(root) {
    var els = (root || document).querySelectorAll("[data-price]");
    for (var i = 0; i < els.length; i++) els[i].textContent = format(els[i].getAttribute("data-price"));
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
    apply: apply,
    get code() { return code; },
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
