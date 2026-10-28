/**
 * Cookie banner + Google Analytics. Nothing is sent to Google, and no
 * cookie is set, until the visitor presses Accept: the Google tag is only
 * loaded after that. The choice is kept in localStorage for 6 months, then
 * asked again. Changing it later: any element with [data-cookie-settings]
 * (the privacy pages, the footer link added below) reopens the banner;
 * choosing Decline afterwards also deletes the _ga cookies.
 *
 * Wording follows <html lang> (fr / de / en); the measurement ID is the
 * only configuration.
 */
(function () {
  var GA_ID = "G-G1184YDRCM";
  var KEY = "dealz_consent";
  var MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

  var lang = (document.documentElement.lang || "fr").slice(0, 2);
  if (lang !== "de" && lang !== "en") lang = "fr";
  var T = {
    fr: {
      text: "Nous utilisons Google Analytics pour mesurer l'audience du site. Il ne dépose de cookies que si vous acceptez.",
      accept: "Accepter", decline: "Refuser", more: "En savoir plus",
      settings: "Réglages des cookies", label: "Cookies", href: "/confidentialite.html"
    },
    de: {
      text: "Wir verwenden Google Analytics, um die Reichweite der Website zu messen. Cookies werden nur gesetzt, wenn Sie zustimmen.",
      accept: "Akzeptieren", decline: "Ablehnen", more: "Mehr erfahren",
      settings: "Cookie-Einstellungen", label: "Cookies", href: "/de/datenschutz.html"
    },
    en: {
      text: "We use Google Analytics to measure the site's audience. It only sets cookies if you accept.",
      accept: "Accept", decline: "Decline", more: "Learn more",
      settings: "Cookie settings", label: "Cookies", href: "/en/privacy.html"
    }
  }[lang];

  function readChoice() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && (c.v === "granted" || c.v === "denied") && Date.now() - c.t < MAX_AGE_MS) return c.v;
    } catch (e) {}
    return null;
  }
  function saveChoice(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
  }

  function loadAnalytics() {
    window["ga-disable-" + GA_ID] = false;
    if (window.__dealzGA) return;
    window.__dealzGA = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function deleteAnalyticsCookies() {
    window["ga-disable-" + GA_ID] = true;
    var host = location.hostname, parts = host.split("."), domains = [host, "." + host];
    if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0 && name.indexOf("_gid") !== 0) return;
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      domains.forEach(function (d) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d;
      });
    });
  }

  var CSS =
    ".dealz-consent{position:fixed;left:16px;bottom:16px;z-index:2147483000;max-width:440px;box-sizing:border-box;" +
    "padding:16px 18px;background:#fff;color:#10131a;border:1px solid #e4e9f2;border-radius:14px;" +
    "box-shadow:0 8px 30px rgba(11,18,32,.18);font:14px/1.5 Poppins,system-ui,-apple-system,Segoe UI,sans-serif}" +
    ".dealz-consent p{margin:0 0 12px}" +
    ".dealz-consent a{color:#063fc7}" +
    ".dealz-consent-actions{display:flex;gap:8px}" +
    ".dealz-consent button{flex:1;min-height:40px;padding:8px 14px;border-radius:10px;border:1.5px solid #0b5fff;" +
    "font:600 14px Poppins,system-ui,sans-serif;cursor:pointer}" +
    ".dealz-consent button[data-v=granted]{background:#0b5fff;color:#fff}" +
    ".dealz-consent button[data-v=denied]{background:#fff;color:#0b5fff}" +
    ".dealz-consent button:focus-visible{outline:3px solid #4fa8ff;outline-offset:2px}" +
    "@media (max-width:520px){.dealz-consent{left:10px;right:10px;bottom:10px;max-width:none}}";

  var banner = null;
  function hideBanner() { if (banner) { banner.remove(); banner = null; } }
  function choose(v) {
    saveChoice(v);
    hideBanner();
    if (v === "granted") loadAnalytics(); else deleteAnalyticsCookies();
  }
  function showBanner() {
    if (banner) return;
    if (!document.getElementById("dealz-consent-css")) {
      var st = document.createElement("style");
      st.id = "dealz-consent-css";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    banner = document.createElement("div");
    banner.className = "dealz-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", T.label);
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(T.text + " "));
    var a = document.createElement("a");
    a.href = T.href;
    a.textContent = T.more;
    p.appendChild(a);
    var row = document.createElement("div");
    row.className = "dealz-consent-actions";
    [["denied", T.decline], ["granted", T.accept]].forEach(function (b) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-v", b[0]);
      btn.textContent = b[1];
      btn.addEventListener("click", function () { choose(b[0]); });
      row.appendChild(btn);
    });
    banner.appendChild(p);
    banner.appendChild(row);
    document.body.appendChild(banner);
  }

  function init() {
    var legal = document.querySelector(".site-footer-legal");
    if (legal) {
      legal.appendChild(document.createTextNode(" · "));
      var s = document.createElement("a");
      s.href = "#";
      s.setAttribute("data-cookie-settings", "");
      s.textContent = T.settings;
      legal.appendChild(s);
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-cookie-settings]");
      if (!t) return;
      e.preventDefault();
      showBanner();
    });
    if (!readChoice()) showBanner();
  }

  var choice = readChoice();
  if (choice === "granted") loadAnalytics();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
