(function () {
  const COMPANY_NAME = "SwissClean Sàrl";
  const COMPANY_EMAIL = "reservations@swissclean.demo";

  let messages = [];
  let sending = false;
  let greeted = false;
  let useStaticFallback = false;
  let pricingPromise = null;

  function loadPricing() {
    if (!pricingPromise) {
      pricingPromise = fetch("/pricing.json").then((r) => r.json());
    }
    return pricingPromise;
  }

  // Talks to the real backend. Throws a plain Error (network failure, or a
  // non-JSON response like a static host's 404 page) when no backend exists
  // at all — that's the signal to fall back to the offline client-side mock,
  // as opposed to a *reachable* backend returning a real error (bad API key,
  // no credit, etc.), which should be shown to the user as-is.
  async function callBackend(payloadMessages) {
    const res = await fetch("/api/chat", {
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

  function renderSystemMessage(container, text, kind) {
    container.appendChild(el("div", `dealz-msg ${kind}`, text));
    scrollToBottom(container);
  }

  function renderQuoteCard(container, quote) {
    const card = el("div", "dealz-quote-card");
    card.appendChild(el("div", "qc-head", "DEVIS DÉTAILLÉ"));
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
    const acceptBtn = el("button", "qc-accept", "✓ Accepter le devis");
    const declineBtn = el("button", "qc-decline", "Refuser");
    actions.appendChild(acceptBtn);
    actions.appendChild(declineBtn);
    card.appendChild(actions);

    acceptBtn.addEventListener("click", () => {
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      renderSystemMessage(
        container,
        `✓ Merci ! Votre devis a été transmis à ${COMPANY_NAME}. Vous recevrez la confirmation ` +
          `par e-mail à l'adresse fournie, et le rendez-vous a été ajouté à l'agenda Google de ` +
          `l'entreprise (${COMPANY_EMAIL}). Une personne de l'équipe vous contactera si besoin pour ` +
          `finaliser les détails.`,
        "system-success"
      );
    });

    declineBtn.addEventListener("click", () => {
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      renderSystemMessage(
        container,
        "Pas de souci ! Vous pouvez ajuster votre demande ci-dessous — par exemple changer la " +
          "taille du logement ou les options — et obtenir un nouveau devis.",
        "system-decline"
      );
    });

    container.appendChild(card);
    scrollToBottom(container);
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

    document.addEventListener("dealz:tab", (e) => {
      if (e.detail.tab === "quote") greet();
    });
    if (document.getElementById("tab-quote").classList.contains("active")) greet();

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
