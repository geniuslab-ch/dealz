/**
 * docs/parrainage.html's referral form. ?ref=<id> identifies which client
 * is doing the referring (from their own personal link, sent in the
 * Client welcome email — see dealz-crm's template.js buildClientTemplate).
 * Submits to POST /api/referral on this same server, which forwards to
 * the CRM's /api/referral-leads webhook.
 */
(function () {
  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  function getReferredById() {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref");
  }

  function showMessage(text, isError) {
    const msg = document.getElementById("rf-msg");
    if (!msg) return;
    msg.textContent = text;
    msg.className = "dlg-msg show" + (isError ? " err" : " ok");
  }

  function init() {
    const submitBtn = document.getElementById("rf-submit");
    if (!submitBtn) return;

    const referredById = getReferredById();
    if (!referredById) {
      showMessage(
        "Ce lien de parrainage semble incomplet — utilisez le lien reçu dans l'e-mail de bienvenue Dealz.",
        true
      );
      submitBtn.disabled = true;
      return;
    }

    submitBtn.addEventListener("click", async () => {
      const companyName = (document.getElementById("rf-company").value || "").trim();
      const contactEmail = (document.getElementById("rf-email").value || "").trim();
      const contactPhone = (document.getElementById("rf-phone").value || "").trim();
      const note = (document.getElementById("rf-note").value || "").trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        showMessage("Merci d'indiquer un e-mail professionnel valide pour votre confrère.", true);
        return;
      }

      submitBtn.disabled = true;
      showMessage("Envoi…", false);

      try {
        const res = await fetch(apiUrl("/api/referral"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referredById, companyName, contactEmail, contactPhone, note }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showMessage(data.error || "Une erreur est survenue — réessayez dans un instant.", true);
          submitBtn.disabled = false;
          return;
        }
        document.getElementById("referral-form").style.display = "none";
        document.getElementById("referral-success").style.display = "block";
      } catch (err) {
        showMessage("Une erreur est survenue — réessayez dans un instant.", true);
        submitBtn.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
