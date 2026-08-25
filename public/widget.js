(function () {
  const STORAGE_KEY = "dealz_demo_history";

  let messages = [];
  let sending = false;

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
    const bubble = el("div", "dealz-msg user", text);
    container.appendChild(bubble);
    scrollToBottom(container);
  }

  function renderAssistantText(container, text) {
    const bubble = el("div", "dealz-msg assistant", text);
    container.appendChild(bubble);
    scrollToBottom(container);
  }

  function renderQuoteCard(container, quote) {
    const card = el("div", "dealz-quote-card");
    const head = el("div", "qc-head", "ESTIMATED QUOTE");
    card.appendChild(head);
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
          const text = extractText(msg.content);
          if (text) renderAssistantText(container, text);
        }
      }

      if (data.quote) {
        renderQuoteCard(container, data.quote);
      }
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
    const launcher = el("button", null, "💬");
    launcher.id = "dealz-launcher";
    document.body.appendChild(launcher);

    const widget = el("div");
    widget.id = "dealz-widget";
    widget.innerHTML = `
      <div class="dealz-header">
        <div>
          <div class="title">AI Cleaning Quote</div>
          <div class="subtitle">Usually replies instantly</div>
        </div>
        <button id="dealz-close" aria-label="Close">✕</button>
      </div>
      <div class="dealz-messages" id="dealz-messages"></div>
      <div class="dealz-inputbar">
        <input id="dealz-input" type="text" placeholder="Describe your cleaning job…" autocomplete="off" />
        <button id="dealz-send">Send</button>
      </div>
    `;
    document.body.appendChild(widget);

    const messagesEl = widget.querySelector("#dealz-messages");
    const input = widget.querySelector("#dealz-input");
    const sendBtn = widget.querySelector("#dealz-send");
    const closeBtn = widget.querySelector("#dealz-close");

    launcher.addEventListener("click", () => {
      widget.classList.toggle("open");
      if (widget.classList.contains("open") && messages.length === 0) {
        renderAssistantText(
          messagesEl,
          "Hi! Tell me a bit about the cleaning job you need — for example, apartment size, " +
            "type of cleaning, and any extras like oven or windows — and I'll work out a price."
        );
      }
    });
    closeBtn.addEventListener("click", () => widget.classList.remove("open"));

    sendBtn.addEventListener("click", () => sendMessage(messagesEl, input, sendBtn, input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage(messagesEl, input, sendBtn, input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
