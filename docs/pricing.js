/**
 * Price picker for the #tarifs section of the landing page (and of every
 * sector page, which reuses the same markup — see scripts/build-sectors.js).
 *
 *  - Three plans (CAPTURE / CLOSE / SCALE), WhatsApp included in every one.
 *    Picking a plan and a billing period (monthly, annual, lifetime launch
 *    offer) updates the summary.
 *  - Every amount comes from the visitor's currency price list
 *    (docs/prices.js through docs/currency.js); the wording of the live
 *    notes comes from the data-t-* attributes, so this file holds no text
 *    in any language.
 *  - "Continue" stores the choice in window.DEALZ_PICK and announces it with
 *    a "dealz-pick" event; docs/contact-flow.js (#contact) answers the plan
 *    questions with it.
 *  - Without JavaScript the markup still shows every price (in CHF): this
 *    script adds .js-pricing to the section, which reveals the switches.
 */
(function () {
  "use strict";

  var section = document.getElementById("tarifs");
  var root = section && section.querySelector("[data-pz]");
  if (!root) return;
  section.classList.add("js-pricing");

  var T = root.dataset;
  var C = window.DealzCurrency;
  var onceUntil = T.onceUntil ? Date.parse(T.onceUntil) : NaN;
  var onceOpen = isNaN(onceUntil) || Date.now() < onceUntil;

  var plans = {};
  [].forEach.call(root.querySelectorAll(".pz-plan[data-plan]"), function (el) {
    plans[el.dataset.plan] = { el: el, pick: el.querySelector(".pz-pick") };
  });
  var nameEl = root.querySelector("[data-pz-name]");
  var noteEl = root.querySelector("[data-pz-note]");
  var contBtn = root.querySelector("[data-pz-continue]");
  var bills = {};
  [].forEach.call(root.querySelectorAll(".pz-bill"), function (el) {
    bills[el.dataset.bill] = { el: el, input: el.querySelector("input"), amount: el.querySelector("[data-pz-amount]") };
  });

  var state = { plan: "CLOSE", bill: "yearly" };

  // A link can preselect the choice, e.g. from the WhatsApp catalogue:
  // ?plan=CAPTURE|CLOSE|SCALE and ?billing=monthly|yearly|onetime.
  (function fromUrl() {
    var q = location.search;
    var p = /[?&]plan=([A-Za-z]+)/.exec(q);
    var b = /[?&]billing=([A-Za-z]+)/.exec(q);
    if (p && plans[p[1].toUpperCase()]) state.plan = p[1].toUpperCase();
    if (b && bills[b[1].toLowerCase()]) state.bill = b[1].toLowerCase();
    if (state.bill === "onetime" && !onceOpen) state.bill = "yearly";
  })();

  function fill(tpl, vars) {
    return String(tpl || "").replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
  }
  // The amount shown follows the price key, so a currency change re-renders it.
  function setAmount(el, key) {
    el.setAttribute("data-price", key);
    if (C) {
      var v = C.price(key);
      if (!isNaN(v)) el.textContent = C.format(v);
    }
  }

  function render() {
    Object.keys(plans).forEach(function (key) {
      var p = plans[key];
      var on = key === state.plan;
      p.el.classList.toggle("is-selected", on);
      p.pick.classList.toggle("btn-primary", on);
      p.pick.classList.toggle("btn-secondary", !on);
      p.pick.setAttribute("aria-pressed", on ? "true" : "false");
      p.pick.textContent = fill(on ? T.tPicked : T.tPick, { plan: key });
    });

    nameEl.textContent = state.plan;
    setAmount(bills.monthly.amount, state.plan);
    setAmount(bills.yearly.amount, state.plan + ".year");
    setAmount(bills.onetime.amount, state.plan + ".once");

    bills.onetime.el.hidden = !onceOpen;
    if (!onceOpen && state.bill === "onetime") state.bill = "yearly";
    Object.keys(bills).forEach(function (k) {
      var on = k === state.bill;
      bills[k].el.classList.toggle("is-selected", on);
      bills[k].input.checked = on;
    });

    var setup = C ? C.setup : 290;
    var install = C ? C.format(setup) : "CHF " + setup;
    var noteKey = "tNote" + state.bill.charAt(0).toUpperCase() + state.bill.slice(1);
    if (!setup && T[noteKey + "Nosetup"]) noteKey += "Nosetup";
    noteEl.textContent = fill(T[noteKey], { install: install });
    contBtn.textContent = fill(T.tCont, { plan: state.plan });
  }

  // The choice the #contact chat will answer for the visitor.
  function announce() {
    var pick = { plan: state.plan, billing: state.bill };
    window.DEALZ_PICK = pick;
    try { window.dispatchEvent(new CustomEvent("dealz-pick", { detail: pick })); } catch (e) {}
  }

  var narrow = window.matchMedia ? window.matchMedia("(max-width: 900px)") : { matches: false };
  function selectPlan(key) {
    state.plan = key;
    render();
    // Stacked layout: the summary sits below all three cards, so bring it up.
    if (narrow.matches) {
      var sum = root.querySelector(".pz-sum");
      if (sum && sum.scrollIntoView) sum.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // ---- events ----
  Object.keys(plans).forEach(function (key) {
    var p = plans[key];
    p.pick.addEventListener("click", function (e) { e.preventDefault(); selectPlan(key); });
    // The whole card is a target too, except its own links, buttons and details.
    p.el.addEventListener("click", function (e) {
      if (e.target.closest("a, button, details, summary")) return;
      selectPlan(key);
    });
  });

  Object.keys(bills).forEach(function (k) {
    bills[k].input.addEventListener("change", function () { state.bill = k; render(); });
  });

  contBtn.addEventListener("click", announce);

  // Amounts are re-formatted when the visitor's currency becomes known.
  window.addEventListener("dealz-currency", render);

  render();
})();
