(function () {
  const COMPANY_NAME = "SwissClean Sàrl";

  const OBJECTION_CHIPS = [
    { category: "price", label: "💰 Le prix est trop élevé" },
    { category: "timing", label: "📅 La date ne convient pas" },
    { category: "scope", label: "🧹 Je n'ai pas besoin de tout" },
    { category: "conditions", label: "🏠 Les conditions/détails ne conviennent pas" },
    { category: "thinking", label: "🤔 Je dois réfléchir" },
    { category: "competitor", label: "🆚 J'ai reçu une autre offre" },
    { category: "information", label: "❓ J'ai une autre question" },
    { category: "not_needed", label: "⚪ Je n'ai plus besoin du service" },
  ];

  let messages = [];
  let sending = false;
  let greeted = false;
  let useStaticFallback = false;
  let pricingPromise = null;

  // Set by embed.js when this widget is loaded on a third-party site (a
  // different origin than the Dealz backend) — API calls need an absolute
  // URL in that case. Same-origin pages (demo.html served by this repo's
  // own server) leave this unset and every call stays relative, unchanged.
  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  function loadPricing() {
    if (!pricingPromise) {
      pricingPromise = fetch(apiUrl("/pricing.json")).then((r) => r.json());
    }
    return pricingPromise;
  }

  // Talks to the real backend. Throws a plain Error (network failure, or a
  // non-JSON response like a static host's 404 page) when no backend exists
  // at all — that's the signal to fall back to the offline client-side mock,
  // as opposed to a *reachable* backend returning a real error (bad API key,
  // no credit, etc.), which should be shown to the user as-is.
  async function callBackend(payloadMessages) {
    const res = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payloadMessages }),
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("no-backend");
    }
    if (!res.ok) {
      const err = new Error(data.error || "une erreur est survenue");
      err.isAppError = true;
      throw err;
    }
    return data;
  }

  // Same shape as callBackend, for the decline/accept/counteroffer endpoints.
  async function postJSON(path, body) {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("no-backend");
    }
    if (!res.ok) {
      const err = new Error(data.error || "une erreur est survenue");
      err.isAppError = true;
      throw err;
    }
    return data;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  function renderUserMessage(container, text) {
    container.appendChild(el("div", "dealz-msg user", text));
    scrollToBottom(container);
  }

  function renderAssistantText(container, text) {
    container.appendChild(el("div", "dealz-msg assistant", text));
    scrollToBottom(container);
  }

  function renderSystemMessage(container, text, kind, html) {
    const bubble = el("div", `dealz-msg ${kind}`);
    if (html) bubble.innerHTML = html;
    else bubble.textContent = text;
    container.appendChild(bubble);
    scrollToBottom(container);
  }

  // ---- Contact capture (name/email/phone/address) ----
  function renderContactForm(container, { intro, submitLabel, needAddress }, onSubmit) {
    const wrap = el("div", "dealz-contact-form");
    if (intro) wrap.appendChild(el("p", "dcf-intro", intro));

    const nameInput = el("input", "dcf-input");
    nameInput.placeholder = "Nom";
    const emailInput = el("input", "dcf-input");
    emailInput.type = "email";
    emailInput.placeholder = "E-mail";
    emailInput.required = true;
    const phoneInput = el("input", "dcf-input");
    phoneInput.placeholder = "Téléphone (optionnel)";

    wrap.appendChild(nameInput);
    wrap.appendChild(emailInput);
    wrap.appendChild(phoneInput);

    let addressInput = null;
    if (needAddress) {
      addressInput = el("input", "dcf-input");
      addressInput.placeholder = "Adresse (optionnel)";
      wrap.appendChild(addressInput);
    }

    const submitBtn = el("button", "dcf-submit", submitLabel);
    wrap.appendChild(submitBtn);

    submitBtn.addEventListener("click", () => {
      if (!emailInput.value.trim()) {
        emailInput.focus();
        return;
      }
      submitBtn.disabled = true;
      wrap.querySelectorAll("input").forEach((i) => (i.disabled = true));
      onSubmit({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput ? addressInput.value.trim() : "",
      });
    });

    container.appendChild(wrap);
    scrollToBottom(container);
  }

  // ---- Objection picker (chips + free text) ----
  function renderObjectionPicker(container, onPick) {
    const wrap = el("div", "dealz-objection-picker");
    const chipsRow = el("div", "dop-chips");
    OBJECTION_CHIPS.forEach((chip) => {
      const btn = el("button", "dop-chip", chip.label);
      btn.addEventListener("click", () => {
        wrap.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
        onPick({ category: chip.category, text: chip.label });
      });
      chipsRow.appendChild(btn);
    });
    wrap.appendChild(chipsRow);

    const freeRow = el("div", "dop-free");
    const freeInput = el("input", "dop-free-input");
    freeInput.placeholder = "Ou décrivez avec vos mots (ex: « Autre entreprise à CHF 420 »)";
    const freeBtn = el("button", "dop-free-btn", "Envoyer");
    freeRow.appendChild(freeInput);
    freeRow.appendChild(freeBtn);
    wrap.appendChild(freeRow);

    function submitFree() {
      if (!freeInput.value.trim()) return;
      wrap.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
      onPick({ category: null, text: freeInput.value.trim() });
    }
    freeBtn.addEventListener("click", submitFree);
    freeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitFree();
    });

    container.appendChild(wrap);
    scrollToBottom(container);
  }

  function simulatedAcceptHtml() {
    return (
      `✓ Merci ! Votre devis a été transmis à ${COMPANY_NAME}. Vous recevrez la confirmation ` +
      `par e-mail, et le rendez-vous a été ajouté à l'agenda Google de l'entreprise. Une personne ` +
      `de l'équipe vous contactera si besoin pour finaliser les détails.` +
      `<br/><br/><i style="opacity:.7">(Mode démonstration statique — aucun e-mail réel n'est envoyé ici.)</i>`
    );
  }

  async function confirmBooking(container, quote, customer) {
    if (useStaticFallback) {
      renderSystemMessage(container, null, "system-success", simulatedAcceptHtml());
      return;
    }
    try {
      const data = await postJSON("/api/accept", { quote, customer });
      renderSystemMessage(
        container,
        null,
        "system-success",
        `✓ Réservation confirmée ! Un e-mail de confirmation a été envoyé, et le rendez-vous ` +
          `est prêt à être ajouté à l'agenda de l'entreprise.` +
          (data.calendarLink
            ? `<br/><br/><a href="${data.calendarLink}" target="_blank" rel="noopener">📅 Ajouter à mon Google Agenda</a>`
            : "")
      );
    } catch (err) {
      if (err.isAppError) {
        renderSystemMessage(container, `Erreur : ${err.message}`, "system-decline");
      } else {
        renderSystemMessage(container, null, "system-success", simulatedAcceptHtml());
      }
    }
  }

  function handleAccept(container, quote) {
    // Contact info is normally already captured earlier in the conversation
    // (the assistant asks for it before delivering the quote) — only fall
    // back to asking again here if that didn't happen for some reason.
    if (quote.customer && quote.customer.email) {
      confirmBooking(container, quote, quote.customer);
      return;
    }
    renderContactForm(
      container,
      { intro: "Pour confirmer votre réservation :", submitLabel: "✓ Confirmer la réservation", needAddress: true },
      (customer) => confirmBooking(container, quote, customer)
    );
  }

  async function submitDecline(container, quote, category, text, customer) {
    try {
      await postJSON("/api/decline", { quote, category, text, customer });
      renderSystemMessage(
        container,
        "Merci pour votre retour ! Nous avons transmis votre message à l'équipe — vous serez " +
          "recontacté(e) rapidement si une meilleure offre est possible.",
        "system-decline"
      );
    } catch (err) {
      renderSystemMessage(
        container,
        err.isAppError ? `Erreur : ${err.message}` : "Une erreur est survenue.",
        "system-decline"
      );
    }
  }

  function handleDecline(container, quote) {
    renderAssistantText(
      container,
      "Bien sûr. Auriez-vous deux minutes pour me dire ce qui ne convenait pas dans notre offre ?"
    );
    renderObjectionPicker(container, ({ category, text }) => {
      renderUserMessage(container, text);

      if (useStaticFallback) {
        renderSystemMessage(
          container,
          null,
          "system-decline",
          `Merci pour votre retour ! En conditions réelles, ce message serait transmis à ` +
            `${COMPANY_NAME} par e-mail, avec une action adaptée à votre motif de refus.` +
            `<br/><br/><i style="opacity:.7">(Mode démonstration statique — aucun e-mail réel n'est envoyé ici.)</i>`
        );
        return;
      }

      // Contact info is normally already captured earlier, before the quote
      // was delivered — only ask again here if that didn't happen.
      if (quote.customer && quote.customer.email) {
        submitDecline(container, quote, category, text, quote.customer);
        return;
      }

      renderContactForm(
        container,
        { intro: "Pour vous recontacter si besoin, laissez-nous vos coordonnées :", submitLabel: "Envoyer" },
        (customer) => submitDecline(container, quote, category, text, customer)
      );
    });
  }

  // ---- PDF modal: the quote opens as a real PDF, viewed without leaving
  // Dealz, with Accepter/Refuser directly below it — not shown until the
  // customer chooses to view it, per the brief this shipped from.
  const PDF_LIB_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  let pdfLibPromise = null;

  function loadPdfLibs() {
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise((resolve, reject) => {
      const jspdfScript = document.createElement("script");
      jspdfScript.src = PDF_LIB_URL;
      jspdfScript.onload = () => {
        const genScript = document.createElement("script");
        genScript.src = (window.DEALZ_API_BASE || "") + "/pdf-generator.js";
        genScript.onload = resolve;
        genScript.onerror = reject;
        document.body.appendChild(genScript);
      };
      jspdfScript.onerror = reject;
      document.body.appendChild(jspdfScript);
    });
    return pdfLibPromise;
  }

  function closePdfModal() {
    const overlay = document.getElementById("dealz-pdf-overlay");
    if (overlay) overlay.remove();
  }

  async function openPdfModal(container, quote) {
    const overlay = el("div", "dealz-pdf-overlay");
    overlay.id = "dealz-pdf-overlay";
    overlay.innerHTML =
      '<div class="dealz-pdf-modal">' +
      '<div class="dealz-pdf-modal-head">' +
      '<span>📄 Votre devis</span>' +
      '<button class="dealz-pdf-close" aria-label="Fermer">✕</button>' +
      "</div>" +
      '<div class="dealz-pdf-body"><p class="dealz-pdf-loading">Génération du devis…</p></div>' +
      '<div class="dealz-pdf-actions">' +
      '<button class="qc-accept" id="dealz-pdf-accept">✓ Accepter le devis</button>' +
      '<button class="qc-decline" id="dealz-pdf-decline">Refuser</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".dealz-pdf-close").addEventListener("click", closePdfModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePdfModal();
    });

    const acceptBtn = overlay.querySelector("#dealz-pdf-accept");
    const declineBtn = overlay.querySelector("#dealz-pdf-decline");
    acceptBtn.addEventListener("click", () => {
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      closePdfModal();
      handleAccept(container, quote);
    });
    declineBtn.addEventListener("click", () => {
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      closePdfModal();
      handleDecline(container, quote);
    });

    try {
      await loadPdfLibs();
      const { doc, blobUrl } = window.DealzPDF.generate(quote, quote.customer || {});
      const body = overlay.querySelector(".dealz-pdf-body");
      body.innerHTML = "";
      const iframe = el("iframe", "dealz-pdf-frame");
      iframe.src = blobUrl;
      iframe.title = "Devis PDF";
      body.appendChild(iframe);
      const dl = el("a", "dealz-pdf-download", "⬇ Télécharger le PDF");
      dl.href = blobUrl;
      dl.download = "devis-swissclean.pdf";
      body.appendChild(dl);
    } catch (err) {
      const body = overlay.querySelector(".dealz-pdf-body");
      body.innerHTML =
        '<p class="dealz-pdf-loading">Impossible de générer le PDF (connexion requise). ' +
        "Vous pouvez tout de même accepter ou refuser ci-dessous.</p>";
    }
  }

  function renderQuoteCard(container, quote) {
    const card = el("div", "dealz-quote-card");
    const headLabel = quote.customer && quote.customer.name
      ? `DEVIS DÉTAILLÉ — ${quote.customer.name.toUpperCase()}`
      : "DEVIS DÉTAILLÉ";
    card.appendChild(el("div", "qc-head", headLabel));
    quote.items.forEach((item) => {
      const row = el("div", "qc-row");
      row.appendChild(el("span", null, item.label));
      row.appendChild(el("span", null, `CHF ${item.amount.toFixed(2)}`));
      card.appendChild(row);
    });
    const total = el("div", "qc-total");
    total.appendChild(el("span", null, "TOTAL"));
    total.appendChild(el("span", null, `CHF ${quote.total.toFixed(2)}`));
    card.appendChild(total);

    const actions = el("div", "qc-actions");
    const viewBtn = el("button", "qc-accept", "📄 Voir mon devis (PDF)");
    viewBtn.style.flex = "1 1 100%";
    actions.appendChild(viewBtn);
    card.appendChild(actions);

    viewBtn.addEventListener("click", () => openPdfModal(container, quote));

    container.appendChild(card);
    scrollToBottom(container);
    document.dispatchEvent(new CustomEvent("dealz:quote-delivered", { detail: quote }));
  }

  function extractText(content) {
    if (typeof content === "string") return content;
    return content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }

  async function sendMessage(container, input, sendBtn, text) {
    if (!text.trim() || sending) return;
    sending = true;
    sendBtn.disabled = true;

    messages.push({ role: "user", content: text });
    renderUserMessage(container, text);
    input.value = "";

    const typing = el("div", "dealz-msg typing", "En train d'écrire…");
    container.appendChild(typing);
    scrollToBottom(container);

    try {
      let data;
      try {
        if (useStaticFallback) throw new Error("no-backend");
        data = await callBackend(messages);
      } catch (err) {
        if (err.isAppError) {
          typing.remove();
          renderAssistantText(container, `Erreur : ${err.message}`);
          return;
        }
        // No reachable backend at all (e.g. this page hosted as static files,
        // no Express server behind it) — switch to the offline demo engine
        // for the rest of the session and keep going transparently.
        useStaticFallback = true;
        const pricing = await loadPricing();
        data = window.DealzMock.runTurnMock(pricing, messages);
      }

      typing.remove();
      messages.push(...data.messages);

      for (const msg of data.messages) {
        if (msg.role === "assistant") {
          const t = extractText(msg.content);
          if (t) renderAssistantText(container, t);
        }
      }

      if (data.quote) renderQuoteCard(container, data.quote);
    } catch (err) {
      typing.remove();
      renderAssistantText(container, "Une erreur est survenue — veuillez réessayer.");
    } finally {
      sending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function init() {
    const container = document.getElementById("dealz-messages");
    const input = document.getElementById("dealz-input");
    const sendBtn = document.getElementById("dealz-send");
    if (!container || !input || !sendBtn) return;

    function greet() {
      if (greeted) return;
      greeted = true;
      renderAssistantText(
        container,
        "Bonjour ! Décrivez-moi votre besoin — taille du logement, type de nettoyage, et toute " +
          "option souhaitée comme le four ou les vitres — et je vous établis un devis tout de suite."
      );
    }

    greet();

    sendBtn.addEventListener("click", () => sendMessage(container, input, sendBtn, input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage(container, input, sendBtn, input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
