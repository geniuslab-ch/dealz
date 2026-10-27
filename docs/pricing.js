/**
 * Price picker for the #tarifs section of the landing page (and of every
 * sector page, which reuses the same markup — see scripts/build-sectors.js).
 *
 *  - Two tabs: "I have a website" (CAPTURE / CLOSE / SCALE, with an optional
 *    WhatsApp add-on) and "no website" (WhatsApp only).
 *  - Picking a plan, the add-on and a billing period updates the summary.
 *    Every amount comes from data-* attributes in the markup, so a price
 *    change is an HTML edit; the wording of the live notes comes from the
 *    data-t-* attributes, so this file holds no text in any language.
 *  - "Continue" stores the choice in window.DEALZ_PICK and announces it with
 *    a "dealz-pick" event; docs/contact-flow.js (#contact) answers the plan
 *    questions with it.
 *  - Without JavaScript the markup still shows every price: this script adds
 *    .js-pricing to the section, which is what reveals the tabs and switches.
 *
 * Amounts are shown through DealzCurrency (docs/currency.js) like the rest
 * of the site: same numbers, the currency follows the visitor.
 */
(function () {
  "use strict";

  var section = document.getElementById("tarifs");
  var root = section && section.querySelector("[data-pz]");
  if (!root) return;
  section.classList.add("js-pricing");

  var T = root.dataset;
  var cents = function (v) { return Math.round(parseFloat(v) * 100); };
  var WA_MONTH = cents(T.waMonth || "25");
  var INSTALL = cents(T.install || "390");
  var onceUntil = T.onceUntil ? Date.parse(T.onceUntil) : NaN;
  var onceOpen = isNaN(onceUntil) || Date.now() < onceUntil;

  var tabs = [].slice.call(root.querySelectorAll(".pz-tab"));
  var panels = [].slice.call(root.querySelectorAll(".pz-panel"));
  var plans = {};
  [].forEach.call(root.querySelectorAll('[data-panel="site"] .pz-plan[data-plan]'), function (el) {
    plans[el.dataset.plan] = { el: el, month: cents(el.dataset.month), once: cents(el.dataset.once), pick: el.querySelector(".pz-pick") };
  });
  var wa = root.querySelector('[data-panel="wa"] .pz-plan');
  var addon = root.querySelector(".pz-addon");
  var toggle = root.querySelector("[data-pz-toggle]");
  var nameEl = root.querySelector("[data-pz-name]");
  var noteEl = root.querySelector("[data-pz-note]");
  var contBtn = root.querySelector("[data-pz-continue]");
  var onceWaLine = root.querySelector("[data-pz-once-wa]");
  var bills = {};
  [].forEach.call(root.querySelectorAll(".pz-bill"), function (el) {
    bills[el.dataset.bill] = { el: el, input: el.querySelector("input"), amount: el.querySelector("[data-pz-amount]") };
  });

  var state = { mode: "site", plan: "CLOSE", wa: false, bill: "yearly" };

  function fmt(c) {
    var n = c / 100;
    if (window.DealzCurrency) return window.DealzCurrency.format(n);
    return "CHF " + (c % 100 ? n.toFixed(2) : String(n));
  }
  function setAmount(el, c) {
    el.setAttribute("data-price", String(c / 100));
    el.textContent = fmt(c);
  }
  function fill(tpl, vars) {
    return String(tpl || "").replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
  }

  function render() {
    var site = state.mode === "site";
    var plan = plans[state.plan];
    var waOn = state.wa;

    // Tabs and panels.
    tabs.forEach(function (tab) {
      var on = tab.dataset.mode === state.mode;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) { p.hidden = p.dataset.panel !== state.mode; });

    // Plan cards.
    Object.keys(plans).forEach(function (key) {
      var p = plans[key];
      var on = key === state.plan;
      p.el.classList.toggle("is-selected", on);
      p.pick.classList.toggle("btn-primary", on);
      p.pick.classList.toggle("btn-secondary", !on);
      p.pick.setAttribute("aria-pressed", on ? "true" : "false");
      p.pick.textContent = fill(on ? T.tPicked : T.tPick, { plan: key });
    });

    // WhatsApp add-on.
    toggle.setAttribute("aria-checked", waOn ? "true" : "false");
    addon.classList.toggle("is-on", waOn);

    // Summary: name, the three billing options, note, button.
    var monthly = plan.month + (waOn ? WA_MONTH : 0);
    nameEl.textContent = state.plan + (waOn ? " + " + T.tWa : "");
    setAmount(bills.monthly.amount, monthly);
    setAmount(bills.yearly.amount, monthly * 12);
    setAmount(bills.onetime.amount, plan.once);
    if (onceWaLine) onceWaLine.hidden = !waOn;

    bills.onetime.el.hidden = !onceOpen;
    if (!onceOpen && state.bill === "onetime") state.bill = "yearly";
    Object.keys(bills).forEach(function (k) {
      var on = k === state.bill;
      bills[k].el.classList.toggle("is-selected", on);
      bills[k].input.checked = on;
    });

    var vars = { install: fmt(INSTALL), wa: fmt(WA_MONTH) };
    noteEl.textContent = fill(T["tNote" + state.bill.charAt(0).toUpperCase() + state.bill.slice(1) + (waOn ? "Wa" : "")], vars);
    contBtn.textContent = fill(waOn ? T.tContWa : T.tCont, { plan: state.plan });
  }

  function setMode(mode) {
    state.mode = mode;
    render();
  }

  // The choice the #contact chat will answer for the visitor.
  function announce() {
    var pick = state.mode === "wa"
      ? { plan: "WHATSAPP", whatsapp: false, billing: "monthly" }
      : { plan: state.plan, whatsapp: state.wa, billing: state.bill };
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
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { setMode(tab.dataset.mode); });
    tab.addEventListener("keydown", function (e) {
      var next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % tabs.length
        : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + tabs.length) % tabs.length
        : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
      if (next < 0) return;
      e.preventDefault();
      setMode(tabs[next].dataset.mode);
      tabs[next].focus();
    });
  });

  Object.keys(plans).forEach(function (key) {
    var p = plans[key];
    p.pick.addEventListener("click", function (e) { e.preventDefault(); selectPlan(key); });
    // The whole card is a target too, except its own links, buttons and details.
    p.el.addEventListener("click", function (e) {
      if (e.target.closest("a, button, details, summary")) return;
      selectPlan(key);
    });
  });

  toggle.addEventListener("click", function () { state.wa = !state.wa; render(); });
  Object.keys(bills).forEach(function (k) {
    bills[k].input.addEventListener("change", function () { state.bill = k; render(); });
  });

  contBtn.addEventListener("click", announce);
  if (wa) {
    var waCta = wa.querySelector("[data-pz-wa-continue]");
    if (waCta) waCta.addEventListener("click", function () { state.mode = "wa"; announce(); });
  }

  [].forEach.call(root.querySelectorAll("[data-pz-goto]"), function (btn) {
    btn.addEventListener("click", function () {
      state.wa = state.wa || btn.dataset.pzGoto === "site";
      setMode(btn.dataset.pzGoto);
      var tab = root.querySelector('.pz-tab[data-mode="' + btn.dataset.pzGoto + '"]');
      if (tab && tab.scrollIntoView) tab.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // Amounts are re-formatted when the visitor's currency becomes known.
  window.addEventListener("dealz-currency", render);

  // A link to .../#tarifs-whatsapp opens the "no website" tab directly.
  function fromHash() {
    if (location.hash !== "#tarifs-whatsapp") return;
    setMode("wa");
    section.scrollIntoView();
  }
  window.addEventListener("hashchange", fromHash);

  render();
  fromHash();
})();
