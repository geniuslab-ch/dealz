/**
 * docs/parrainage.html's referral form. ?ref=<id> identifies which client
 * is doing the referring (from their own personal link, sent in the
 * Client welcome email — see dealz-crm's template.js buildClientTemplate).
 *
 * A visitor who reaches this page without ?ref= (e.g. via the generic
 * referral link in the site footer, not their own personal email link)
 * gets an e-mail-identify step first: POST /api/referral-identify resolves
 * their address to their own client id via the CRM, then the referral
 * form unlocks exactly as if they'd used their personal link.
 *
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

  function showMessage(elId, text, isError) {
    const msg = document.getElementById(elId);
    if (!msg) return;
    msg.textContent = text;
    msg.className = "dlg-msg show" + (isError ? " err" : " ok");
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function initReferralForm(referredById) {
    const submitBtn = document.getElementById("rf-submit");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", async () => {
      const companyName = (document.getElementById("rf-company").value || "").trim();
      const contactEmail = (document.getElementById("rf-email").value || "").trim();
      const contactPhone = (document.getElementById("rf-phone").value || "").trim();
      const note = (document.getElementById("rf-note").value || "").trim();

      if (!isValidEmail(contactEmail)) {
        showMessage("rf-msg", "Merci d'indiquer un e-mail professionnel valide pour votre confrère.", true);
        return;
      }

      submitBtn.disabled = true;
      showMessage("rf-msg", "Envoi…", false);

      try {
        const res = await fetch(apiUrl("/api/referral"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referredById, companyName, contactEmail, contactPhone, note }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showMessage("rf-msg", data.error || "Une erreur est survenue — réessayez dans un instant.", true);
          submitBtn.disabled = false;
          return;
        }
        document.getElementById("referral-form").style.display = "none";
        document.getElementById("referral-success").style.display = "block";
      } catch (err) {
        showMessage("rf-msg", "Une erreur est survenue — réessayez dans un instant.", true);
        submitBtn.disabled = false;
      }
    });
  }

  function initIdentifyStep() {
    const identifySection = document.getElementById("identify-section");
    const formSection = document.getElementById("referral-form-section");
    const identifyBtn = document.getElementById("id-submit");
    const emailInput = document.getElementById("id-email");
    if (!identifySection || !identifyBtn || !emailInput) return;

    identifySection.style.display = "block";

    identifyBtn.addEventListener("click", async () => {
      const email = (emailInput.value || "").trim();
      if (!isValidEmail(email)) {
        showMessage("id-msg", "Merci d'indiquer l'e-mail associé à votre compte Dealz.", true);
        return;
      }

      identifyBtn.disabled = true;
      showMessage("id-msg", "Vérification…", false);

      try {
        const res = await fetch(apiUrl("/api/referral-identify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.found) {
          showMessage(
            "id-msg",
            "Aucun compte client Dealz trouvé avec cet e-mail. Vérifiez l'adresse, ou utilisez le lien reçu dans votre e-mail de bienvenue.",
            true
          );
          identifyBtn.disabled = false;
          return;
        }
        identifySection.style.display = "none";
        formSection.style.display = "block";
        initReferralForm(String(data.id));
      } catch (err) {
        showMessage("id-msg", "Une erreur est survenue — réessayez dans un instant.", true);
        identifyBtn.disabled = false;
      }
    });
  }

  function init() {
    const referredById = getReferredById();
    const formSection = document.getElementById("referral-form-section");

    if (referredById) {
      if (formSection) formSection.style.display = "block";
      initReferralForm(referredById);
    } else {
      initIdentifyStep();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
