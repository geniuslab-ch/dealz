/**
 * Unhides docs/demo.html's "WhatsApp Business" devis-mode tab once a real
 * trial number is configured server-side (GET /api/whatsapp-trial) — stays
 * hidden entirely (not shown as a broken/disabled option) until then, same
 * graceful-degradation posture as the rest of this codebase.
 */
(function () {
  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  async function init() {
    const tab = document.getElementById("devis-whatsapp-tab");
    const link = document.getElementById("whatsapp-trial-link");
    if (!tab || !link) return;

    try {
      const res = await fetch(apiUrl("/api/whatsapp-trial"));
      const data = await res.json();
      if (data.enabled && data.waLink) {
        link.href = data.waLink;
        tab.style.display = "";
      }
    } catch (err) {
      // No backend reachable (e.g. static hosting) — leave the tab hidden.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
