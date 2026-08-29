/**
 * Dealz generic embed snippet — the actual "add this to your existing site"
 * script. One tag, works on any CMS (WordPress, Wix, Squarespace, Webflow,
 * a hand-written site, anything that allows a <script> tag):
 *
 *   <script src="https://dealz.website/embed.js" data-dealz-company="swissclean" async></script>
 *
 * By default it injects a floating launcher bubble + chat panel —
 * self-contained CSS, doesn't touch or depend on the host page's styling —
 * then loads the same quote-app.js used everywhere else in this project,
 * so the conversation logic (Claude/mock fallback, the objection engine,
 * accept/decline) is identical to demo.html. This bubble mode is the right
 * choice for no-code platforms (Wix, Shopify, WordPress, Squarespace) where
 * nobody has access to the site's own nav markup to hook a proper tab into.
 *
 * When a developer DOES have code access to the site (a hand-built site, a
 * Next.js/React app, anything with a real navbar component), two things
 * change the experience:
 *
 *   data-dealz-launcher="false"   — suppresses the floating bubble/panel
 *                                   entirely; you drive it yourself
 *   data-dealz-mode="window"      — opens the quote flow as an in-page
 *                                   modal (backdrop + centered card, stays
 *                                   on the current page — not a new browser
 *                                   tab/window) instead of the chat panel; "chat"
 *                                   (the default) keeps the panel
 *   window.DealzWidget.open()/.close()/.toggle() — opens/closes the panel
 *                                   (mode "chat") or the modal (mode
 *                                   "window") from your own nav button
 *
 * Example for a hand-built "Devis" nav tab, opened as an in-page modal:
 *   <script src="https://dealz.website/embed.js" data-dealz-company="acme"
 *           data-dealz-launcher="false" data-dealz-mode="window" async></script>
 *   <button onclick="DealzWidget.open()">Devis</button>
 *
 * `data-dealz-company` is the tenant slug (set in the CRM's companies.html)
 * — /api/chat, /api/pricing, /api/decline and /api/accept all resolve it
 * server-side via getCompanyBySlug to route to that company's own pricing,
 * name and notify email.
 */
(function () {
  var CURRENT_SCRIPT = document.currentScript;
  var API_BASE = (CURRENT_SCRIPT && CURRENT_SCRIPT.getAttribute("data-api-base")) || "";
  window.DEALZ_COMPANY = (CURRENT_SCRIPT && CURRENT_SCRIPT.getAttribute("data-dealz-company")) || "";
  var ORIGIN = (function () {
    if (API_BASE) return API_BASE.replace(/\/$/, "");
    if (CURRENT_SCRIPT && CURRENT_SCRIPT.src) {
      try {
        return new URL(CURRENT_SCRIPT.src).origin;
      } catch (e) {}
    }
    return "";
  })();

  var STYLE = document.createElement("style");
  STYLE.textContent = [
    ":root{--dz-navy:#0b1220;--dz-blue:#0b5fff;--dz-blue-dark:#063fc7;--dz-sky-light:#eef6ff;",
    "--dz-green:#17a672;--dz-green-light:#e4f7ef;--dz-ink:#10131a;--dz-muted:#5b6472;--dz-line:#e4e9f2;}",
    "#dealz-embed-launcher{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;",
    "background:linear-gradient(135deg,var(--dz-blue),var(--dz-blue-dark));color:#fff;border:none;cursor:pointer;",
    "font-size:26px;box-shadow:0 6px 18px rgba(11,95,255,0.4);z-index:999999;font-family:sans-serif;}",
    "#dealz-embed-panel{position:fixed;bottom:96px;right:24px;width:360px;max-width:calc(100vw - 32px);",
    "height:520px;max-height:calc(100vh - 140px);background:#fff;border-radius:14px;",
    "box-shadow:0 12px 40px rgba(11,18,32,0.25);display:none;flex-direction:column;overflow:hidden;",
    "z-index:999999;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;}",
    "#dealz-embed-panel.dealz-embed-open{display:flex;}",
    "#dealz-embed-panel *{box-sizing:border-box;}",
    ".dealz-embed-header{background:linear-gradient(120deg,var(--dz-blue),var(--dz-navy));color:#fff;",
    "padding:14px 16px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}",
    ".dealz-embed-header .t{font-weight:bold;font-size:14px;}",
    ".dealz-embed-header .s{font-size:11px;color:#b9d6d5;}",
    ".dealz-embed-header button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1;}",
    ".dealz-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fbfcff;}",
    ".dealz-messages>*{flex-shrink:0;}",
    ".dealz-msg{max-width:82%;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.45;white-space:pre-wrap;}",
    ".dealz-msg.user{align-self:flex-end;background:linear-gradient(135deg,var(--dz-blue),var(--dz-blue-dark));color:#fff;border-bottom-right-radius:3px;}",
    ".dealz-msg.assistant{align-self:flex-start;background:var(--dz-sky-light);color:var(--dz-ink);border-bottom-left-radius:3px;}",
    ".dealz-msg.typing{align-self:flex-start;background:var(--dz-sky-light);color:var(--dz-muted);font-style:italic;}",
    ".dealz-msg.system-success{align-self:stretch;background:var(--dz-green-light);color:#0d6b4b;border:1px solid rgba(23,166,114,.3);}",
    ".dealz-msg.system-decline{align-self:stretch;background:#f3f4f6;color:var(--dz-muted);border:1px solid var(--dz-line);}",
    ".dealz-msg.system-success a,.dealz-msg.system-decline a{color:inherit;font-weight:700;}",
    ".dealz-quote-card{align-self:stretch;background:#fff;border:1.5px solid var(--dz-blue);border-radius:12px;overflow:hidden;font-size:13px;}",
    ".qc-head{background:linear-gradient(120deg,var(--dz-blue),var(--dz-navy));color:#fff;padding:8px 12px;font-weight:800;font-size:11px;letter-spacing:.04em;}",
    ".qc-row{display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid #f0f2f6;}",
    ".qc-total{display:flex;justify-content:space-between;padding:10px 12px;font-weight:800;background:var(--dz-sky-light);color:var(--dz-blue-dark);}",
    ".qc-actions{display:flex;gap:8px;padding:10px 12px;background:#fafbfd;}",
    ".qc-actions button{flex:1;border:none;border-radius:18px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;}",
    ".qc-accept{background:linear-gradient(135deg,var(--dz-green),#0d8f5f);color:#fff;}",
    ".qc-decline{background:#fff;color:var(--dz-muted);border:1.5px solid var(--dz-line)!important;}",
    ".qc-actions button:disabled{opacity:.45;cursor:default;}",
    ".dealz-email-preview{align-self:stretch;background:#fff;border:1.5px dashed var(--dz-line);border-radius:12px;overflow:hidden;font-size:12.5px;}",
    ".dealz-email-preview .dep-head{background:#fafbfd;color:var(--dz-muted);padding:7px 12px;font-weight:700;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;border-bottom:1px solid var(--dz-line);}",
    ".dealz-email-preview .dep-meta{padding:9px 12px;border-bottom:1px solid var(--dz-line);color:var(--dz-ink);line-height:1.6;}",
    ".dealz-email-preview .dep-body{padding:11px 12px;color:var(--dz-ink);}",
    ".dealz-email-preview .dep-body table{width:100%;border-collapse:collapse;}",
    ".dealz-email-preview .dep-body td{padding:4px 0;font-size:12.5px;}",
    ".dealz-email-preview .dep-body h2{font-size:14px;margin:0 0 8px;}",
    ".dealz-email-preview .dep-body a{color:var(--dz-blue);}",
    ".dealz-objection-picker{align-self:stretch;display:flex;flex-direction:column;gap:8px;}",
    ".dop-chips{display:flex;flex-wrap:wrap;gap:6px;}",
    ".dop-chip{border:1.5px solid var(--dz-line);background:#fff;border-radius:16px;padding:6px 11px;font-size:11.5px;font-weight:600;cursor:pointer;color:var(--dz-ink);font-family:inherit;}",
    ".dop-chip:disabled{opacity:.4;}",
    ".dop-chip.selected{border-color:var(--dz-blue);background:var(--dz-sky-light);color:var(--dz-blue-dark);font-weight:700;}",
    ".dop-free{display:flex;gap:6px;}",
    ".dop-free-input{flex:1;border:1.5px solid var(--dz-line);border-radius:16px;padding:7px 12px;font-size:12px;font-family:inherit;outline:none;}",
    ".dop-free-btn{background:var(--dz-navy);color:#fff;border:none;border-radius:16px;padding:0 14px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;}",
    ".dealz-contact-form{align-self:stretch;background:#fff;border:1px solid var(--dz-line);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:7px;}",
    ".dcf-intro{font-size:12px;color:var(--dz-muted);margin:0 0 2px;font-weight:600;}",
    ".dcf-input{border:1.5px solid var(--dz-line);border-radius:8px;padding:7px 10px;font-size:12.5px;font-family:inherit;outline:none;width:100%;}",
    ".dcf-submit{margin-top:2px;background:linear-gradient(135deg,var(--dz-blue),var(--dz-blue-dark));color:#fff;border:none;border-radius:16px;padding:8px 12px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;}",
    ".dealz-inputbar{display:flex;gap:8px;padding:12px;border-top:1px solid var(--dz-line);background:#fff;flex-shrink:0;}",
    ".dealz-inputbar input{flex:1;border:1.5px solid var(--dz-line);border-radius:20px;padding:9px 13px;font-size:13px;font-family:inherit;outline:none;}",
    ".dealz-inputbar button{background:linear-gradient(135deg,var(--dz-blue),var(--dz-blue-dark));color:#fff;border:none;border-radius:20px;padding:0 16px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;}",
    ".dealz-inputbar button:disabled{opacity:.5;}",
    ".dealz-pdf-overlay{position:fixed;inset:0;background:rgba(11,18,32,.55);display:flex;align-items:center;justify-content:center;z-index:1000001;padding:20px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;}",
    ".dealz-pdf-modal{background:#fff;border-radius:18px;width:100%;max-width:520px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);}",
    ".dealz-pdf-modal-head{background:linear-gradient(120deg,var(--dz-blue),var(--dz-navy));color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:14px;flex-shrink:0;}",
    ".dealz-pdf-modal-head button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;}",
    ".dealz-pdf-body{flex:1;min-height:280px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:10px;overflow-y:auto;}",
    ".dealz-pdf-loading{color:var(--dz-muted);font-size:13.5px;text-align:center;margin:40px 0;}",
    ".dealz-pdf-frame{width:100%;height:48vh;min-height:260px;border:1px solid var(--dz-line);border-radius:10px;}",
    ".dealz-pdf-download{font-size:13px;font-weight:700;color:var(--dz-blue-dark);text-decoration:none;}",
    ".dealz-pdf-actions{display:flex;gap:10px;padding:14px;border-top:1px solid var(--dz-line);flex-shrink:0;}",
    ".dealz-pdf-actions button{flex:1;padding:11px;font-size:14px;border-radius:22px;}",
  ].join("");
  // Applied unconditionally (both modes need the launcher bubble's CSS,
  // even in "window" mode where the chat-panel rules below just go unused).
  document.head.appendChild(STYLE);

  // "window" opens the quote flow as its own popup instead of the in-page
  // chat panel — any other value, or the attribute being absent, keeps the
  // default in-page "chat" panel.
  var mode = (CURRENT_SCRIPT && CURRENT_SCRIPT.getAttribute("data-dealz-mode")) || "chat";

  // "false" suppresses the floating bubble for sites that drive the
  // panel/popup from their own nav tab instead (see window.DealzWidget
  // below) — any other value, or the attribute being absent, keeps the
  // default bubble.
  var showLauncher = (CURRENT_SCRIPT && CURRENT_SCRIPT.getAttribute("data-dealz-launcher")) !== "false";

  var launcher = null;
  if (showLauncher) {
    launcher = document.createElement("button");
    launcher.id = "dealz-embed-launcher";
    launcher.setAttribute("aria-label", "Ouvrir le devis en ligne");
    launcher.textContent = "💬";
    document.body.appendChild(launcher);
  }

  if (mode === "window") {
    // A "pop-up" should stay on the page the visitor is already on — not
    // open a separate browser tab/window (jarring, and easily blocked by
    // popup blockers). This is an in-page modal instead: a backdrop +
    // centered card, with quote-window.html loaded inside via iframe
    // (?embedded=1 drops its own header/close since the modal card
    // supplies those). Same self-contained page, just presented in-page.
    var MODAL_STYLE = document.createElement("style");
    MODAL_STYLE.textContent =
      "#dealz-modal-overlay{position:fixed;inset:0;background:rgba(11,18,32,.55);display:none;" +
      "align-items:center;justify-content:center;z-index:1000000;padding:20px;}" +
      "#dealz-modal-overlay.open{display:flex;}" +
      "#dealz-modal-card{position:relative;width:100%;max-width:480px;height:85vh;max-height:700px;" +
      "background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);}" +
      "#dealz-modal-close{position:absolute;top:10px;right:10px;z-index:2;background:rgba(11,18,32,.5);" +
      "color:#fff;border:none;border-radius:50%;width:30px;height:30px;font-size:16px;cursor:pointer;line-height:1;}" +
      "#dealz-modal-iframe{width:100%;height:100%;border:0;display:block;}";
    document.head.appendChild(MODAL_STYLE);

    var overlay = null;
    var iframe = null;
    function ensureModal() {
      if (overlay) return;
      overlay = document.createElement("div");
      overlay.id = "dealz-modal-overlay";
      overlay.innerHTML =
        '<div id="dealz-modal-card">' +
        '<button id="dealz-modal-close" aria-label="Fermer">✕</button>' +
        '<iframe id="dealz-modal-iframe" title="Devis en ligne"></iframe>' +
        "</div>";
      document.body.appendChild(overlay);
      iframe = document.getElementById("dealz-modal-iframe");
      document.getElementById("dealz-modal-close").addEventListener("click", closeModal);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
    function openModal() {
      ensureModal();
      if (!iframe.src) {
        iframe.src =
          ORIGIN +
          "/quote-window.html?company=" +
          encodeURIComponent(window.DEALZ_COMPANY) +
          "&api-base=" +
          encodeURIComponent(ORIGIN) +
          "&embedded=1";
      }
      overlay.classList.add("open");
    }
    function closeModal() {
      if (overlay) overlay.classList.remove("open");
    }
    function toggleModal() {
      if (overlay && overlay.classList.contains("open")) closeModal();
      else openModal();
    }
    if (launcher) launcher.addEventListener("click", openModal);
    window.DealzWidget = { open: openModal, close: closeModal, toggle: toggleModal };
    return;
  }

  var panel = document.createElement("div");
  panel.id = "dealz-embed-panel";
  panel.innerHTML =
    '<div class="dealz-embed-header">' +
    '<div><div class="t">Devis en ligne</div><div class="s">Réponse habituellement instantanée</div></div>' +
    '<button id="dealz-embed-close" aria-label="Fermer">✕</button>' +
    "</div>" +
    '<div class="dealz-messages" id="dealz-messages"></div>' +
    '<div class="dealz-inputbar">' +
    '<input id="dealz-input" type="text" placeholder="Décrivez votre besoin de nettoyage…" autocomplete="off" />' +
    '<button id="dealz-send">Envoyer</button>' +
    "</div>";
  document.body.appendChild(panel);

  // Swaps the generic "Devis en ligne" header for "[Company] · Devis" —
  // matching demo.html's "SwissClean · Devis" — once the tenant's real name
  // resolves. Left as the generic default (never blocks panel open) when
  // there's no company slug, or the lookup fails/returns nothing.
  if (window.DEALZ_COMPANY) {
    fetch(ORIGIN + "/api/company-info?company=" + encodeURIComponent(window.DEALZ_COMPANY))
      .then(function (r) { return r.json(); })
      .then(function (info) {
        if (info && info.name) {
          var titleEl = panel.querySelector(".dealz-embed-header .t");
          if (titleEl) titleEl.textContent = info.name + " · Devis";
        }
      })
      .catch(function () {});
  }

  function openPanel() {
    panel.classList.add("dealz-embed-open");
  }
  function closePanel() {
    panel.classList.remove("dealz-embed-open");
  }
  function togglePanel() {
    panel.classList.toggle("dealz-embed-open");
  }

  if (launcher) {
    launcher.addEventListener("click", togglePanel);
  }
  document.getElementById("dealz-embed-close").addEventListener("click", closePanel);

  // Public API for a hand-built nav tab elsewhere on the page, e.g.
  // <button onclick="DealzWidget.open()">Devis</button> — works whether or
  // not the floating bubble is also shown.
  window.DealzWidget = { open: openPanel, close: closePanel, toggle: togglePanel };

  // Tells quote-app.js's API calls to target the Dealz backend explicitly
  // rather than the host page's own origin — required for cross-origin
  // embedding (a client's site and the Dealz server are different domains).
  window.DEALZ_API_BASE = ORIGIN;

  // Load the shared widget logic (same file used on demo.html) from wherever
  // this embed script itself was loaded from — works regardless of which
  // domain a client's site pulls it from.
  ["/pricing-engine-client.js", "/mock-client.js", "/quote-app.js"].forEach(function (path) {
    var s = document.createElement("script");
    s.src = ORIGIN + path;
    document.body.appendChild(s);
  });
})();
