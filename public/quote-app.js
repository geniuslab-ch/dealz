(function () {
  let messages = [];
  let sending = false;
  let greeted = false;

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

  function renderQuoteCard(container, quote) {
    const card = el("div", "dealz-quote-card");
    card.appendChild(el("div", "qc-head", "ESTIMATED QUOTE"));
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

    const typing = el("div", "dealz-msg typing", "Typing…");
    container.appendChild(typing);
    scrollToBottom(container);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      typing.remove();

      if (!res.ok) {
        renderAssistantText(container, `Error: ${data.error || "something went wrong"}`);
        return;
      }

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
      renderAssistantText(container, "Network error — is the server running?");
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
        "Hi! Tell me a bit about the cleaning job you need — apartment size, type of cleaning, " +
          "and any extras like oven or windows — and I'll work out a price on the spot."
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
