/**
 * The three proof cards under the price picker in #tarifs (landing pages
 * and every sector page, which copies the same markup):
 *
 *   1. the "first quote in 30 days" guarantee (plain text, no script);
 *   2. "1 extra job = X months paid": an average job value divided by the
 *      CLOSE monthly price. The visitor can type their own job value.
 *      The default comes from data-job-chf on [data-pz-proof] (the median of
 *      the 32 sector sample quotes on the landing page, the page's own
 *      sample quote on a sector page). Other markets scale it by their
 *      CLOSE price against CHF, the same price-level ratio Dealz already
 *      uses between its own price lists (docs/prices.js);
 *   3. what a full-time administrative assistant costs an employer in the
 *      visitor's market only, with its sources (ASSISTANT below). The market
 *      follows the price list shown (docs/currency.js: country, else time
 *      zone, else browser language, or a ?currency= preview): CHF =
 *      Switzerland, EUR = France, GBP = UK, USD = US.
 *
 * Templates and labels live in data-t-* attributes, so this file only holds
 * numbers, source links and the market names.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-pz-proof]");
  var C = window.DealzCurrency;
  var P = window.DealzPrices;
  if (!root || !C || !P) return;
  var T = root.dataset;
  var lang = (document.documentElement.lang || "fr").slice(0, 2);

  // Monthly employer cost of a full-time administrative assistant, to the
  // cent, and how it is computed. Update together with the sources.
  //
  // CHF 6'586.43 = (72'760 × 1.064 + 1'620.50) / 12
  //   72'760: kfmv salary recommendations 2025, level C (Kauffrau/Kaufmann
  //   EFZ, Sachbearbeitung), age 30-34, base region, median, 13th salary
  //   included (BFS ESS 2022 + 1.7 %). + AVS/AI/APG 5.3 % and AC 1.1 %
  //   employer share (2026), + LPP: half of the 7 % savings credit on the
  //   coordinated salary (72'760 - 26'460). Family allowances and accident
  //   insurance are left out, so this is a floor ("at least").
  // EUR 3'692.76 = 2'500 / (1 - 0.323)
  //   2'500: average gross monthly salary FTE of "employés", private sector,
  //   2024 (Insee Première n° 2079). 32.3 %: share of non-wage costs in
  //   French labour costs, 2025 (Eurostat, 31 March 2026).
  // GBP 2'852.53 = (29'803 + 15 % × (29'803 - 5'000) + 3 % × (29'803 - 6'240)) / 12
  //   29'803: median gross annual pay, full-time, SOC 4159 "Other
  //   administrative occupations n.e.c.", ASHE 2026 provisional, table 14
  //   (ONS). Employer NI 15 % above £5,000 (2026-27) and the 3 % minimum
  //   employer pension on qualifying earnings (£6,240-£50,270).
  // USD 5'783.45 = 47'540 / 0.685 / 12
  //   47'540: median annual wage, secretaries and administrative assistants
  //   (except legal, medical, executive), May 2025 (BLS). Wages are 68.5 %
  //   of total compensation for full-time private industry workers, June
  //   2026 (BLS ECEC); the rest is benefits.
  var ASSISTANT = {
    CHF: {
      month: 6586.43,
      sources: [
        ["kfmv, Lohnempfehlungen 2025 (OFS/BFS ESS)", "https://kfmv.ch/fileadmin/products/Ratgeber/20250901_kfmv_ratgeber_lohnempfehlungen_2025.pdf"],
        ["Swissmem, assurances sociales 2026", "https://www.swissmem.ch/fr/competences/ressources-humaines/droit-du-travail/assurances-sociales-2026.html"],
      ],
    },
    EUR: {
      month: 3692.76,
      sources: [
        ["Insee Première n° 2079 (2025)", "https://www.insee.fr/fr/statistiques/fichier/8657156/ip2079.pdf"],
        ["Eurostat, labour costs 2025", "https://ec.europa.eu/eurostat/product?code=ddn-20260331-2"],
      ],
    },
    GBP: {
      month: 2852.53,
      sources: [
        ["ONS, ASHE 2026", "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/bulletins/annualsurveyofhoursandearnings/latest"],
        ["GOV.UK, employer NI 2026-27", "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027"],
        ["GOV.UK, workplace pensions", "https://www.gov.uk/workplace-pensions/what-you-your-employer-and-the-government-pay"],
      ],
    },
    USD: {
      month: 5783.45,
      sources: [
        ["BLS, Occupational Outlook (May 2025)", "https://www.bls.gov/ooh/Office-and-Administrative-Support/Secretaries-and-administrative-assistants.htm"],
        ["BLS, Employer Costs for Employee Compensation (June 2026)", "https://www.bls.gov/news.release/ecec.htm"],
      ],
    },
  };

  var WHERE = {
    fr: { CHF: "en Suisse", EUR: "en France", GBP: "au Royaume-Uni", USD: "aux États-Unis" },
    en: { CHF: "in Switzerland", EUR: "in France", GBP: "in the UK", USD: "in the US" },
    de: { CHF: "in der Schweiz", EUR: "in Frankreich", GBP: "im Vereinigten Königreich", USD: "in den USA" },
    it: { CHF: "in Svizzera", EUR: "in Francia", GBP: "nel Regno Unito", USD: "negli Stati Uniti" },
  };

  var input = root.querySelector("[data-proof-input]");
  var custom = null; // the visitor's own job value, in the shown currency

  function fill(tpl, vars) {
    return String(tpl || "").replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
  }
  function each(sel, fn) {
    [].forEach.call(root.querySelectorAll(sel), fn);
  }
  function cents(n) { return Math.round(n * 100) / 100; }

  function close() { return P.list(C.code).plans.CLOSE; }
  // The default job value in the shown currency.
  function defaultJob() {
    var chf = Number(T.jobChf) || 0;
    return cents(chf * close() / P.list("CHF").plans.CLOSE);
  }

  function monthsText(job) {
    // "17.0 months", or "15.7 years" from two years on.
    var m = job / close();
    if (m >= 24) return fill(T.tYears, { n: (m / 12).toFixed(1) });
    return fill(T.tMonths, { n: m.toFixed(1) });
  }

  function renderJob() {
    var job = custom != null ? custom : defaultJob();
    each("[data-proof-months]", function (el) { el.textContent = monthsText(job); });
    each("[data-proof-job]", function (el) { el.textContent = C.format(job); });
  }

  function render() {
    var code = C.code;
    if (input && custom == null) input.value = defaultJob().toFixed(2);
    each("[data-proof-currency]", function (el) { el.textContent = code; });
    renderJob();

    var A = ASSISTANT[code];
    if (!A) return;
    each("[data-proof-assistant]", function (el) { el.textContent = C.format(A.month); });
    each("[data-proof-where]", function (el) { el.textContent = (WHERE[lang] || WHERE.fr)[code]; });
    each("[data-proof-times]", function (el) { el.textContent = String(Math.floor(A.month / close())); });
    each("[data-proof-sources]", function (el) {
      el.textContent = "";
      A.sources.forEach(function (s, i) {
        if (i) el.appendChild(document.createTextNode(" · "));
        var a = document.createElement("a");
        a.href = s[1];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s[0];
        el.appendChild(a);
      });
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      var v = parseFloat(String(input.value).replace(/['\s]/g, "").replace(",", "."));
      custom = isFinite(v) && v > 0 ? v : null;
      renderJob();
    });
  }

  // A currency change resets the job value to that market's default.
  window.addEventListener("dealz-currency", function () { custom = null; render(); });
  render();
})();
