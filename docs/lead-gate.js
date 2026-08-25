/**
 * Lead-capture gate in front of the demo chat widget: asks for a
 * professional e-mail (+ optional phone/company) before revealing the
 * widget, and records the attempt via POST /api/lead so a prospect can only
 * try the live demo a limited number of times (see src/leads.js).
 *
 * Fails open on purpose: if there's no backend to call (e.g. this page
 * hosted as static files with no Express server — see docs/mock-client.js
 * for the same pattern elsewhere), or if Supabase isn't configured on the
 * backend, the widget is revealed directly with no gate. There's no real
 * API cost to protect in either of those cases, so gating would only add
 * friction for nothing.
 */
(function () {
  const SESSION_KEY = "dealz_lead_ok";

  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  function revealChat() {
    const gate = document.getElementById("dealz-lead-gate");
    const chat = document.getElementById("dealz-chat-body");
    if (gate) gate.style.display = "none";
    if (chat) chat.style.display = "flex";
  }

  function showMessage(text, isError) {
    const msg = document.getElementById("dlg-msg");
    if (!msg) return;
    msg.textContent = text;
    msg.className = "dlg-msg show" + (isError ? " err" : " ok");
  }

  function init() {
    const gate = document.getElementById("dealz-lead-gate");
    const submitBtn = document.getElementById("dlg-submit");
    if (!gate || !submitBtn) return;

    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      revealChat();
      return;
    }

    submitBtn.addEventListener("click", async () => {
      const email = (document.getElementById("dlg-email").value || "").trim();
      const phone = (document.getElementById("dlg-phone").value || "").trim();
      const companyName = (document.getElementById("dlg-company").value || "").trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Merci d'indiquer un e-mail valide.", true);
        return;
      }

      submitBtn.disabled = true;
      showMessage("Vérification…", false);

      try {
        const res = await fetch(apiUrl("/api/lead"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone, companyName }),
        });
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error("no-backend");
        }
        if (!res.ok) {
          showMessage(data.error || "Une erreur est survenue.", true);
          submitBtn.disabled = false;
          return;
        }

        if (data.allowed) {
          sessionStorage.setItem(SESSION_KEY, "true");
          revealChat();
          return;
        }

        showMessage(
          `Vous avez déjà essayé la démo ${data.trialsUsed - 1} fois — c'est le maximum en libre-accès. ` +
            "Contactez-nous pour une démo personnalisée avec votre propre grille tarifaire.",
          true
        );
      } catch (err) {
        // No reachable backend at all — nothing to protect, let them through.
        sessionStorage.setItem(SESSION_KEY, "true");
        revealChat();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
