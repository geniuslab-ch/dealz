/**
 * Unhides docs/demo.html's "Essayer sur WhatsApp" card once a real trial
 * number is configured server-side (GET /api/whatsapp-trial) — stays
 * hidden entirely (not shown as a broken/disabled option) until then, same
 * graceful-degradation posture as the rest of this codebase.
 */
(function () {
  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  async function init() {
    const card = document.getElementById("whatsapp-trial-card");
    const link = document.getElementById("whatsapp-trial-link");
    if (!card || !link) return;

    try {
      const res = await fetch(apiUrl("/api/whatsapp-trial"));
      const data = await res.json();
      if (data.enabled && data.waLink) {
        link.href = data.waLink;
        card.style.display = "";
      }
    } catch (err) {
      // No backend reachable (e.g. static hosting) — leave the card hidden.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
