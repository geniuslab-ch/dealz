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
  const EMAIL_KEY = "dealz_company_email";

  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  function revealChat() {
    const gate = document.getElementById("dealz-lead-gate");
    const chat = document.getElementById("dealz-chat-body");
    if (gate) gate.style.display = "none";
    if (chat) chat.style.display = "flex";
    // Lets the demo chat (already greeted on page load) show where the
    // "company" e-mails of this demo will land.
    window.dispatchEvent(new CustomEvent("dealz-lead-ok", { detail: { email: sessionStorage.getItem(EMAIL_KEY) || "" } }));
  }

  // Messages in the page's language (window.DEALZ_LANG).
  const MSG = {
    fr: { invalid: "Merci d'indiquer un e-mail valide.", checking: "Vérification…", error: "Une erreur est survenue.",
          limit: (n) => `Vous avez déjà essayé la démo ${n} fois — c'est le maximum en libre-accès. Contactez-nous pour une démo personnalisée avec votre propre grille tarifaire.` },
    en: { invalid: "Please enter a valid email.", checking: "Checking…", error: "Something went wrong.",
          limit: (n) => `You've already tried the demo ${n} times — that's the maximum for open access. Contact us for a personalised demo with your own price list.` },
    de: { invalid: "Bitte geben Sie eine gültige E-Mail-Adresse an.", checking: "Wird geprüft…", error: "Ein Fehler ist aufgetreten.",
          limit: (n) => `Sie haben die Demo bereits ${n}-mal getestet — das ist das Maximum im freien Zugang. Kontaktieren Sie uns für eine persönliche Demo mit Ihrer eigenen Preisliste.` },
  };
  const M = MSG[window.DEALZ_LANG] || MSG.fr;

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
        showMessage(M.invalid, true);
        return;
      }

      submitBtn.disabled = true;
      showMessage(M.checking, false);

      try {
        const res = await fetch(apiUrl("/api/lead"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone, companyName, sector: window.DEALZ_SECTOR || undefined }),
        });
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error("no-backend");
        }
        if (!res.ok) {
          showMessage(res.status === 400 ? M.invalid : M.error, true);
          submitBtn.disabled = false;
          return;
        }

        if (data.allowed) {
          sessionStorage.setItem(SESSION_KEY, "true");
          sessionStorage.setItem(EMAIL_KEY, email);
          revealChat();
          return;
        }

        showMessage(M.limit(data.trialsUsed - 1), true);
      } catch (err) {
        // No reachable backend at all — nothing to protect, let them through.
        sessionStorage.setItem(SESSION_KEY, "true");
        sessionStorage.setItem(EMAIL_KEY, email);
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
