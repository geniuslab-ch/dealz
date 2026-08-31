/**
 * Conversational contact/qualification flow for index.html's #contact
 * section — replaces a static lead form with a mini Dealz-style experience:
 * a few chip-based questions, a plan recommendation, and a recap before
 * submitting. Deliberately mirrors the visual language and interaction
 * patterns already built for the real widget (docs/quote-app.js /
 * docs/mock-client.js) — same message bubbles, same chip styling, same
 * "always-available free-text input" fallback — rather than inventing a
 * new component language.
 *
 * On submit, POSTs to /api/install-request (server.js) — fire-and-forget,
 * the confirmation bubble always shows regardless of the network result.
 * That endpoint e-mails the Dealz team and forwards the lead into the CRM
 * (see src/notifications.js / dealz-crm's /api/inbound-leads).
 */
(function () {
  const PLANS = {
    CAPTURE: { price: 49, tagline: "Ne manquez plus aucune demande." },
    CLOSE: { price: 79, tagline: "Ne laissez plus un « non » devenir une vente perdue." },
    SCALE: { price: 149, tagline: "Plus de demandes sans plus de gestion." },
  };

  const STEPS = [
    {
      id: "company_name",
      kind: "text",
      question: "Quel est le nom de votre entreprise ?",
      placeholder: "Nom de votre entreprise",
    },
    {
      id: "team_size",
      kind: "single",
      question: "Combien de personnes prennent actuellement les demandes ou réservations ?",
      options: ["👤 Moi uniquement", "👥 2–5 personnes", "👥 6–15 personnes", "🏢 Plus de 15", "Autre"],
      allowOther: true,
    },
    {
      id: "request_sources",
      kind: "multi",
      question: "Comment recevez-vous actuellement vos demandes ?",
      options: ["🌐 Site web", "📧 Email", "📞 Téléphone", "💬 WhatsApp", "📱 Réseaux sociaux", "Autre"],
      allowOther: true,
    },
    {
      id: "main_problem",
      kind: "single",
      question: "Quel est votre principal problème aujourd'hui ?",
      options: [
        "❌ Je manque parfois des demandes",
        "⏰ Je réponds trop tard",
        "🧮 Les devis me prennent trop de temps",
        "💸 Des clients refusent mes devis",
        "🔄 Je dois gérer les contre-offres manuellement",
        "👥 Nous sommes plusieurs à gérer les réservations",
        "📅 La gestion des agendas est compliquée",
        "Autre",
      ],
      allowOther: true,
    },
    { id: "plan_choice", kind: "plan", question: "Quelle formule vous intéresse ?" },
    { id: "billing_choice", kind: "billing", question: "Comment souhaitez-vous commencer ?" },
    {
      id: "website_url",
      kind: "url",
      question: "Sur quel site souhaitez-vous installer Dealz ?",
      placeholder: "https://www.votreentreprise.ch",
    },
    {
      id: "contact_info",
      kind: "contact_form",
      question: "Et où pouvons-nous vous envoyer votre récapitulatif ?",
    },
  ];

  function recommendPlan(answers) {
    const team = answers.team_size || "";
    const problem = answers.main_problem || "";
    if (/6–15|Plus de 15/.test(team)) return "SCALE";
    if (/plusieurs à gérer|agendas/.test(problem)) return "SCALE";
    if (/refusent mes devis|contre-offres/.test(problem)) return "CLOSE";
    return "CAPTURE";
  }

  function recommendReason(plan) {
    if (plan === "SCALE") {
      return "Vous êtes plusieurs à gérer les réservations, ou la gestion des agendas devient compliquée — SCALE ajoute les collaborateurs, les agendas partagés et la répartition automatique dont vous avez besoin.";
    }
    if (plan === "CLOSE") {
      return "Vous recevez déjà des demandes, mais votre principal problème semble être la récupération des devis refusés ou des contre-offres. CLOSE est donc probablement la formule la plus adaptée.";
    }
    return "Votre priorité aujourd'hui est de ne manquer aucune demande — CAPTURE couvre exactement ce besoin, sans rien de superflu.";
  }

  // Display-only translation, same safe pattern as docs/quote-app.js: the
  // *stored* answer (state.answers, submitted to /api/install-request and
  // recommendPlan()'s own French-keyword matching) always stays the
  // original French string — only what's rendered on screen is translated.
  // Zero risk to the plan-recommendation logic or the internal Dealz-team
  // notification email, which stays French either way.
  const I18N = {
    "Quel est le nom de votre entreprise ?": { en: "What's the name of your company?", de: "Wie heisst Ihr Unternehmen?" },
    "Nom de votre entreprise": { en: "Your company name", de: "Name Ihres Unternehmens" },
    "Combien de personnes prennent actuellement les demandes ou réservations ?": { en: "How many people currently handle enquiries or bookings?", de: "Wie viele Personen bearbeiten derzeit Anfragen oder Buchungen?" },
    "👤 Moi uniquement": { en: "👤 Just me", de: "👤 Nur ich" },
    "👥 2–5 personnes": { en: "👥 2–5 people", de: "👥 2–5 Personen" },
    "👥 6–15 personnes": { en: "👥 6–15 people", de: "👥 6–15 Personen" },
    "🏢 Plus de 15": { en: "🏢 More than 15", de: "🏢 Mehr als 15" },
    "Autre": { en: "Other", de: "Andere" },
    "Comment recevez-vous actuellement vos demandes ?": { en: "How do you currently receive enquiries?", de: "Wie erhalten Sie derzeit Ihre Anfragen?" },
    "🌐 Site web": { en: "🌐 Website", de: "🌐 Website" },
    "📧 Email": { en: "📧 Email", de: "📧 E-Mail" },
    "📞 Téléphone": { en: "📞 Phone", de: "📞 Telefon" },
    "💬 WhatsApp": { en: "💬 WhatsApp", de: "💬 WhatsApp" },
    "📱 Réseaux sociaux": { en: "📱 Social media", de: "📱 Soziale Medien" },
    "Quel est votre principal problème aujourd'hui ?": { en: "What's your main problem today?", de: "Was ist heute Ihr grösstes Problem?" },
    "❌ Je manque parfois des demandes": { en: "❌ I sometimes miss enquiries", de: "❌ Mir entgehen manchmal Anfragen" },
    "⏰ Je réponds trop tard": { en: "⏰ I reply too late", de: "⏰ Ich antworte zu spät" },
    "🧮 Les devis me prennent trop de temps": { en: "🧮 Quotes take too much of my time", de: "🧮 Offerten kosten mich zu viel Zeit" },
    "💸 Des clients refusent mes devis": { en: "💸 Customers decline my quotes", de: "💸 Kunden lehnen meine Offerten ab" },
    "🔄 Je dois gérer les contre-offres manuellement": { en: "🔄 I have to handle counter-offers manually", de: "🔄 Ich muss Gegenangebote manuell bearbeiten" },
    "👥 Nous sommes plusieurs à gérer les réservations": { en: "👥 Several of us handle bookings", de: "👥 Mehrere von uns verwalten Buchungen" },
    "📅 La gestion des agendas est compliquée": { en: "📅 Managing calendars is complicated", de: "📅 Die Terminverwaltung ist kompliziert" },
    "Quelle formule vous intéresse ?": { en: "Which plan are you interested in?", de: "Welcher Plan interessiert Sie?" },
    "Comment souhaitez-vous commencer ?": { en: "How would you like to get started?", de: "Wie möchten Sie starten?" },
    "Sur quel site souhaitez-vous installer Dealz ?": { en: "Which site would you like to install Dealz on?", de: "Auf welcher Website möchten Sie Dealz installieren?" },
    "Et où pouvons-nous vous envoyer votre récapitulatif ?": { en: "And where can we send your summary?", de: "Und wohin dürfen wir Ihnen Ihre Zusammenfassung senden?" },
    "Quelques questions rapides": { en: "A few quick questions", de: "Ein paar kurze Fragen" },
    "C'est prêt": { en: "All set", de: "Bereit" },
    "Écrivez votre réponse…": { en: "Type your answer…", de: "Schreiben Sie Ihre Antwort…" },
    "Répondez ci-dessus…": { en: "Answer above…", de: "Oben antworten…" },
    "← Modifier la réponse précédente": { en: "← Edit the previous answer", de: "← Vorherige Antwort ändern" },
    "Vous pouvez préciser :": { en: "Feel free to specify:", de: "Sie können es näher erläutern:" },
    "Votre précision…": { en: "Your details…", de: "Ihre Angabe…" },
    "Valider mes choix": { en: "Confirm my choices", de: "Auswahl bestätigen" },
    "Aucune de ces réponses": { en: "None of these", de: "Keine dieser Antworten" },
    "RECOMMANDÉ": { en: "RECOMMENDED", de: "EMPFOHLEN" },
    "CLOSE ⭐": { en: "CLOSE ⭐", de: "CLOSE ⭐" },
    "Choisir CLOSE ⭐": { en: "Choose CLOSE ⭐", de: "CLOSE ⭐ wählen" },
    "Choisir CAPTURE": { en: "Choose CAPTURE", de: "CAPTURE wählen" },
    "Choisir SCALE": { en: "Choose SCALE", de: "SCALE wählen" },
    "💡 Pas sûr ? Laissez Dealz vous recommander une formule.": { en: "💡 Not sure? Let Dealz recommend a plan for you.", de: "💡 Unsicher? Lassen Sie sich von Dealz einen Plan empfehlen." },
    "Mensuel": { en: "Monthly", de: "Monatlich" },
    "Annuel": { en: "Yearly", de: "Jährlich" },
    "Choisir mensuel": { en: "Choose monthly", de: "Monatlich wählen" },
    "Choisir annuel": { en: "Choose yearly", de: "Jährlich wählen" },
    "Pas besoin de changer votre site. Dealz s'intègre directement à celui que vous utilisez déjà.": {
      en: "No need to change your site. Dealz integrates directly with the one you already use.",
      de: "Sie müssen Ihre Website nicht ändern. Dealz wird direkt in die integriert, die Sie bereits nutzen.",
    },
    "Prénom / Nom": { en: "First / last name", de: "Vorname / Name" },
    "E-mail professionnel": { en: "Work email", de: "Geschäftliche E-Mail" },
    "Téléphone (optionnel)": { en: "Phone (optional)", de: "Telefon (optional)" },
    "Continuer →": { en: "Continue →", de: "Weiter →" },
    "Tout est bon ?": { en: "Everything look good?", de: "Passt alles?" },
    "VOTRE DEMANDE DEALZ": { en: "YOUR DEALZ REQUEST", de: "IHRE DEALZ-ANFRAGE" },
    "Entreprise": { en: "Company", de: "Unternehmen" },
    "Formule": { en: "Plan", de: "Plan" },
    "Facturation": { en: "Billing", de: "Abrechnung" },
    "Annuelle": { en: "Yearly", de: "Jährlich" },
    "Mensuelle": { en: "Monthly", de: "Monatlich" },
    "Abonnement": { en: "Subscription", de: "Abonnement" },
    "Installation": { en: "Setup", de: "Einrichtung" },
    "OFFERTE": { en: "FREE", de: "GRATIS" },
    "Site": { en: "Website", de: "Website" },
    "Votre objectif": { en: "Your goal", de: "Ihr Ziel" },
    "🚀 Demander mon installation Dealz": { en: "🚀 Request my Dealz setup", de: "🚀 Meine Dealz-Einrichtung anfragen" },
    "Modifier mes réponses": { en: "Edit my answers", de: "Meine Antworten ändern" },
    "Demande envoyée ✓": { en: "Request sent ✓", de: "Anfrage gesendet ✓" },
    "👋 Bonjour ! Je suis Dealz. Je peux vous aider à voir quelle formule correspond le mieux à votre entreprise. On commence ?": {
      en: "👋 Hi! I'm Dealz. I can help you see which plan fits your business best. Shall we get started?",
      de: "👋 Hallo! Ich bin Dealz. Ich helfe Ihnen gerne herauszufinden, welcher Plan am besten zu Ihrem Unternehmen passt. Fangen wir an?",
    },
    "Oui, allons-y →": { en: "Yes, let's go →", de: "Ja, los geht's →" },
    "Hmm, cette adresse ne ressemble pas tout à fait à une URL — vous pouvez réessayer ?": {
      en: "Hmm, that doesn't quite look like a URL — could you try again?",
      de: "Hmm, das sieht nicht ganz nach einer URL aus — können Sie es nochmals versuchen?",
    },
    "Merci ! Votre demande est bien enregistrée. Nous allons examiner votre site et votre configuration afin de préparer l'installation de Dealz. Vous recevrez votre récapitulatif par e-mail.": {
      en: "Thank you! Your request has been recorded. We'll review your site and setup to prepare your Dealz installation. You'll receive your summary by email.",
      de: "Vielen Dank! Ihre Anfrage wurde erfasst. Wir prüfen Ihre Website und Konfiguration, um die Installation von Dealz vorzubereiten. Sie erhalten Ihre Zusammenfassung per E-Mail.",
    },
    "+ CHF 390 d'installation unique": { en: "+ CHF 390 one-time setup fee", de: "+ CHF 390 einmalige Einrichtungsgebühr" },
    "Vous économisez CHF 390 sur l'installation.": { en: "You save CHF 390 on setup.", de: "Sie sparen CHF 390 bei der Einrichtung." },
    "Vous êtes plusieurs à gérer les réservations, ou la gestion des agendas devient compliquée — SCALE ajoute les collaborateurs, les agendas partagés et la répartition automatique dont vous avez besoin.": {
      en: "Several of you manage bookings, or calendar management is becoming complicated — SCALE adds the team members, shared calendars, and automatic assignment you need.",
      de: "Mehrere Personen verwalten bei Ihnen Buchungen, oder die Terminverwaltung wird kompliziert — SCALE bietet die Mitarbeiterkonten, geteilten Kalender und automatische Zuteilung, die Sie brauchen.",
    },
    "Vous recevez déjà des demandes, mais votre principal problème semble être la récupération des devis refusés ou des contre-offres. CLOSE est donc probablement la formule la plus adaptée.": {
      en: "You're already receiving enquiries, but your main issue seems to be recovering declined quotes or counter-offers. CLOSE is likely the best fit for you.",
      de: "Sie erhalten bereits Anfragen, aber Ihr Hauptproblem scheint die Nachverfolgung abgelehnter Offerten oder Gegenangebote zu sein. CLOSE ist daher wahrscheinlich der passende Plan.",
    },
    "Votre priorité aujourd'hui est de ne manquer aucune demande — CAPTURE couvre exactement ce besoin, sans rien de superflu.": {
      en: "Your priority today is not missing a single enquiry — CAPTURE covers exactly that, without anything extra.",
      de: "Ihre Priorität ist es, keine Anfrage mehr zu verpassen — CAPTURE deckt genau das ab, ohne unnötigen Schnickschnack.",
    },
    "Ne manquez plus aucune demande.": { en: "Never miss another enquiry.", de: "Verpassen Sie keine Anfrage mehr." },
    "Ne laissez plus un « non » devenir une vente perdue.": {
      en: "Stop letting a \"no\" become a lost sale.",
      de: "Lassen Sie ein „Nein“ nicht mehr zu einem verlorenen Verkauf werden.",
    },
    "Plus de demandes sans plus de gestion.": { en: "More enquiries without more admin.", de: "Mehr Anfragen ohne mehr Verwaltungsaufwand." },
  };

  function T(fr) {
    const lang = window.DEALZ_LANG;
    if (!lang || lang === "fr" || !fr) return fr;
    const entry = I18N[fr];
    return (entry && entry[lang]) || fr;
  }

  // ---- Small lang-aware helpers for strings built with interpolation,
  // which a plain T() exact-match lookup can't catch. ----
  function perMonth(n) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `CHF ${n} / month`;
    if (lang === "de") return `CHF ${n} / Monat`;
    return `CHF ${n} / mois`;
  }
  function perYear(n) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `CHF ${n} / year`;
    if (lang === "de") return `CHF ${n} / Jahr`;
    return `CHF ${n} / an`;
  }
  function chooseLabel(plan) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `Choose ${plan} →`;
    if (lang === "de") return `${plan} wählen →`;
    return `Choisir ${plan} →`;
  }
  function recommendedSuffix(key) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `${key} (recommended by Dealz)`;
    if (lang === "de") return `${key} (von Dealz empfohlen)`;
    return `${key} (recommandé par Dealz)`;
  }
  function recommendLabel(plan) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `🤖 Dealz recommends: ${plan}`;
    if (lang === "de") return `🤖 Dealz empfiehlt: ${plan}`;
    return `🤖 Dealz vous recommande : ${plan}`;
  }
  function stepProgress(i, total) {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return `Step ${i} of ${total}`;
    if (lang === "de") return `Schritt ${i} von ${total}`;
    return `Étape ${i} sur ${total}`;
  }
  function billingLine(mode, monthly, yearly) {
    const lang = window.DEALZ_LANG;
    if (mode === "yearly") {
      if (lang === "en") return `Yearly — CHF ${yearly}/year (setup free)`;
      if (lang === "de") return `Jährlich — CHF ${yearly}/Jahr (Einrichtung gratis)`;
      return `Annuel — CHF ${yearly}/an (installation offerte)`;
    }
    if (lang === "en") return `Monthly — CHF ${monthly}/month + CHF 390 setup`;
    if (lang === "de") return `Monatlich — CHF ${monthly}/Monat + CHF 390 Einrichtung`;
    return `Mensuel — CHF ${monthly}/mois + CHF 390 installation`;
  }
  function installedLine() {
    const lang = window.DEALZ_LANG;
    if (lang === "en") return "<s>CHF 390 setup</s> — <b>FREE</b>";
    if (lang === "de") return "<s>CHF 390 Einrichtung</s> — <b>GRATIS</b>";
    return "<s>CHF 390 installation</s> — <b>OFFERTE</b>";
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = T(text);
    return e;
  }

  function scrollToBottom(c) {
    c.scrollTop = c.scrollHeight;
  }

  function assistantBubble(text) {
    return el("div", "dealz-msg assistant", text);
  }
  function userBubble(text) {
    return el("div", "dealz-msg user", text);
  }

  const state = { answers: {}, stepIndex: -1, blocks: [] };
  let container, input, sendBtn, progressEl;
  let pendingText = null; // { onSubmit(value) } — set whenever the shared input bar should act on the next Enter/Envoyer
  let started = false;

  function updateProgress() {
    if (!started) {
      progressEl.textContent = T("Quelques questions rapides");
      return;
    }
    if (state.stepIndex >= STEPS.length) {
      progressEl.textContent = T("C'est prêt");
      return;
    }
    progressEl.textContent = stepProgress(state.stepIndex + 1, STEPS.length);
  }

  function setInputMode(mode, placeholder) {
    // mode: 'text' (free-text expected) or 'off' (chips/cards handle this step)
    if (mode === "text") {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = T(placeholder) || T("Écrivez votre réponse…");
      input.focus();
    } else {
      input.disabled = true;
      sendBtn.disabled = true;
      input.value = "";
      input.placeholder = T("Répondez ci-dessus…");
    }
  }

  function disableBlock(wrap) {
    wrap.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
  }

  function backLink(wrap) {
    if (state.stepIndex <= 0) return;
    const back = el("button", "flow-back", "← Modifier la réponse précédente");
    back.type = "button";
    back.addEventListener("click", goBack);
    wrap.appendChild(back);
  }

  // Called from the "← Modifier" link on the *current*, not-yet-answered
  // step: drop that empty block, then drop the previous step's block and
  // its recorded answer so it can be redone.
  function goBack() {
    if (state.stepIndex <= 0) return;
    const currentBlock = state.blocks[state.stepIndex];
    if (currentBlock) currentBlock.remove();
    state.blocks[state.stepIndex] = null;

    const prevIndex = state.stepIndex - 1;
    const prevBlock = state.blocks[prevIndex];
    if (prevBlock) prevBlock.remove();
    state.blocks[prevIndex] = null;
    if (STEPS[prevIndex]) delete state.answers[STEPS[prevIndex].id];

    advanceTo(prevIndex);
  }

  function goToStep(index) {
    for (let i = state.blocks.length - 1; i >= index; i--) {
      if (state.blocks[i]) {
        state.blocks[i].remove();
        state.blocks[i] = null;
      }
      if (STEPS[i]) delete state.answers[STEPS[i].id];
    }
    state.stepIndex = index;
    renderStep(index);
  }

  function advanceTo(nextIndex) {
    state.stepIndex = nextIndex;
    renderStep(nextIndex);
  }

  // ---- "Autre" precision follow-up, shared by single/multi steps ----
  function needsOtherDetail(step, rawAnswer) {
    if (!step.allowOther) return false;
    return Array.isArray(rawAnswer) ? rawAnswer.includes("Autre") : rawAnswer === "Autre";
  }

  function askOtherDetail(wrap, step, rawAnswer) {
    wrap.appendChild(assistantBubble("Vous pouvez préciser :"));
    setInputMode("text", "Votre précision…");
    pendingText = {
      onSubmit: (detail) => {
        wrap.appendChild(userBubble(detail));
        const merged = Array.isArray(rawAnswer)
          ? rawAnswer.map((v) => (v === "Autre" ? `Autre : ${detail}` : v))
          : `Autre : ${detail}`;
        state.answers[step.id] = merged;
        setInputMode("off");
        advanceTo(state.stepIndex + 1);
      },
    };
  }

  // ---- Chip rendering (single / multi) — mirrors docs/quote-app.js ----
  function renderChipsInto(wrap, step) {
    const picker = el("div", "dop-chips flow-chips");
    const selected = new Set();

    step.options.forEach((label) => {
      const btn = el("button", "dop-chip", label);
      btn.type = "button";
      btn.addEventListener("click", () => {
        if (step.kind === "multi") {
          btn.classList.toggle("selected");
          if (selected.has(label)) selected.delete(label);
          else selected.add(label);
        } else {
          disableBlock(wrap);
          wrap.appendChild(userBubble(label));
          if (needsOtherDetail(step, label)) {
            askOtherDetail(wrap, step, label);
          } else {
            state.answers[step.id] = label;
            advanceTo(state.stepIndex + 1);
          }
        }
      });
      picker.appendChild(btn);
    });
    wrap.appendChild(picker);

    if (step.kind === "multi") {
      const confirmBtn = el("button", "dcf-submit", "Valider mes choix");
      confirmBtn.type = "button";
      confirmBtn.addEventListener("click", () => {
        const chosen = Array.from(selected);
        disableBlock(wrap);
        wrap.appendChild(userBubble(chosen.length ? chosen.map(T).join(", ") : "Aucune de ces réponses"));
        if (needsOtherDetail(step, chosen)) {
          askOtherDetail(wrap, step, chosen);
        } else {
          state.answers[step.id] = chosen;
          advanceTo(state.stepIndex + 1);
        }
      });
      wrap.appendChild(confirmBtn);
    }
  }

  // ---- Plan choice ----
  function renderPlanChoice(wrap) {
    const grid = el("div", "flow-plan-grid");
    Object.keys(PLANS).forEach((key) => {
      const plan = PLANS[key];
      const card = el("div", "flow-plan-card" + (key === "CLOSE" ? " featured" : ""));
      if (key === "CLOSE") card.appendChild(el("span", "flow-plan-badge", "RECOMMANDÉ"));
      card.appendChild(el("div", "flow-plan-name", key === "CLOSE" ? "CLOSE ⭐" : key));
      card.appendChild(el("div", "flow-plan-price", perMonth(plan.price)));
      card.appendChild(el("div", "flow-plan-tagline", plan.tagline));
      const pick = el("button", "btn btn-secondary flow-plan-pick", key === "CLOSE" ? "Choisir CLOSE ⭐" : `Choisir ${key}`);
      pick.type = "button";
      pick.addEventListener("click", () => choosePlan(wrap, key, false));
      card.appendChild(pick);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    const helper = el("div", "flow-recommend-prompt");
    const helperBtn = el("button", "flow-recommend-btn", "💡 Pas sûr ? Laissez Dealz vous recommander une formule.");
    helperBtn.type = "button";
    helperBtn.addEventListener("click", () => {
      helper.remove();
      showRecommendation(wrap);
    });
    helper.appendChild(helperBtn);
    wrap.appendChild(helper);
  }

  function showRecommendation(wrap) {
    const plan = recommendPlan(state.answers);
    const box = el("div", "flow-recommendation");
    box.appendChild(el("div", "flow-recommendation-label", recommendLabel(plan)));
    box.appendChild(el("p", "flow-recommendation-reason", recommendReason(plan)));
    box.appendChild(el("div", "flow-recommendation-price", perMonth(PLANS[plan].price)));
    const pick = el("button", "btn btn-primary", chooseLabel(plan));
    pick.type = "button";
    pick.addEventListener("click", () => choosePlan(wrap, plan, true));
    box.appendChild(pick);
    wrap.appendChild(box);
    scrollToBottom(container);
  }

  function choosePlan(wrap, key, wasRecommended) {
    disableBlock(wrap);
    wrap.appendChild(userBubble(wasRecommended ? recommendedSuffix(key) : key));
    state.answers.plan_choice = key;
    advanceTo(state.stepIndex + 1);
  }

  // ---- Billing choice ----
  function renderBillingChoice(wrap) {
    const plan = state.answers.plan_choice || "CAPTURE";
    const monthly = PLANS[plan].price;
    const yearly = monthly * 12;

    const grid = el("div", "flow-billing-grid");

    const monthlyCard = el("div", "flow-billing-card");
    monthlyCard.appendChild(el("div", "flow-billing-label", "Mensuel"));
    monthlyCard.appendChild(el("div", "flow-billing-price", perMonth(monthly)));
    monthlyCard.appendChild(el("div", "flow-billing-line", "+ CHF 390 d'installation unique"));
    const pickMonthly = el("button", "btn btn-secondary flow-billing-pick", "Choisir mensuel");
    pickMonthly.type = "button";
    pickMonthly.addEventListener("click", () => chooseBilling(wrap, "monthly", monthly, yearly));
    monthlyCard.appendChild(pickMonthly);
    grid.appendChild(monthlyCard);

    const yearlyCard = el("div", "flow-billing-card highlight");
    yearlyCard.appendChild(el("span", "flow-plan-badge", "RECOMMANDÉ"));
    yearlyCard.appendChild(el("div", "flow-billing-label", "Annuel"));
    yearlyCard.appendChild(el("div", "flow-billing-price", perYear(yearly)));
    const line = el("div", "flow-billing-line");
    line.innerHTML = installedLine();
    yearlyCard.appendChild(line);
    yearlyCard.appendChild(el("div", "flow-billing-save", "Vous économisez CHF 390 sur l'installation."));
    const pickYearly = el("button", "btn btn-primary flow-billing-pick", "Choisir annuel");
    pickYearly.type = "button";
    pickYearly.addEventListener("click", () => chooseBilling(wrap, "yearly", monthly, yearly));
    yearlyCard.appendChild(pickYearly);
    grid.appendChild(yearlyCard);

    wrap.appendChild(grid);
  }

  function chooseBilling(wrap, mode, monthly, yearly) {
    disableBlock(wrap);
    wrap.appendChild(userBubble(billingLine(mode, monthly, yearly)));
    state.answers.billing_choice = mode;
    state.answers.billing_monthly = monthly;
    state.answers.billing_yearly = yearly;
    advanceTo(state.stepIndex + 1);
  }

  // ---- Contact info (reuses the demo widget's contact-form styling) ----
  function renderContactFields(wrap) {
    const form = el("div", "dealz-contact-form");
    form.appendChild(
      el("p", "dcf-intro", "Pas besoin de changer votre site. Dealz s'intègre directement à celui que vous utilisez déjà.")
    );

    const nameInput = el("input", "dcf-input");
    nameInput.placeholder = T("Prénom / Nom");
    const emailInput = el("input", "dcf-input");
    emailInput.type = "email";
    emailInput.placeholder = T("E-mail professionnel");
    emailInput.required = true;
    const phoneInput = el("input", "dcf-input");
    phoneInput.placeholder = T("Téléphone (optionnel)");

    form.appendChild(nameInput);
    form.appendChild(emailInput);
    form.appendChild(phoneInput);

    const submit = el("button", "dcf-submit", "Continuer →");
    submit.type = "button";
    submit.addEventListener("click", () => {
      if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.focus();
        return;
      }
      disableBlock(wrap);
      form.querySelectorAll("input").forEach((i) => (i.disabled = true));
      wrap.appendChild(
        userBubble(
          [nameInput.value.trim(), emailInput.value.trim(), phoneInput.value.trim()].filter(Boolean).join(" · ")
        )
      );
      state.answers.contact_name = nameInput.value.trim();
      state.answers.contact_email = emailInput.value.trim();
      state.answers.contact_phone = phoneInput.value.trim();
      advanceTo(state.stepIndex + 1);
    });
    form.appendChild(submit);

    wrap.appendChild(form);
  }

  // ---- Summary ----
  // Fire-and-forget: the confirmation bubble always shows regardless of
  // whether this succeeds, matching this whole flow's original "no
  // backend, never break the visible confirmation" posture — the
  // difference now is a real notification actually goes out when the
  // network call succeeds, instead of nothing happening at all.
  function submitInstallRequest(a) {
    fetch("/api/install-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: a.company_name || "",
        contactName: a.contact_name || "",
        contactEmail: a.contact_email || "",
        contactPhone: a.contact_phone || "",
        websiteUrl: a.website_url || "",
        planChoice: a.plan_choice || "",
        billingChoice: a.billing_choice || "",
        teamSize: a.team_size || "",
        mainProblem: a.main_problem || "",
        requestSources: a.request_sources || "",
      }),
    }).catch((err) => console.error("[install-request] failed to submit:", err));
  }

  function renderSummary() {
    updateProgress();
    setInputMode("off");
    const wrap = el("div", "flow-block");
    container.appendChild(wrap);
    state.blocks[STEPS.length] = wrap;

    wrap.appendChild(assistantBubble("Tout est bon ?"));

    const a = state.answers;
    const card = el("div", "flow-summary-card");
    card.appendChild(el("div", "flow-summary-title", "VOTRE DEMANDE DEALZ"));

    const rows = [
      ["Entreprise", a.company_name || "—"],
      ["Formule", a.plan_choice || "—"],
      ["Facturation", a.billing_choice === "yearly" ? "Annuelle" : "Mensuelle"],
      [
        "Abonnement",
        a.billing_choice === "yearly" ? perYear(a.billing_yearly) : perMonth(a.billing_monthly),
      ],
      ["Installation", a.billing_choice === "yearly" ? "OFFERTE" : "CHF 390"],
      ["Site", a.website_url || "—"],
      ["Votre objectif", a.main_problem || "—"],
    ];
    rows.forEach(([label, value]) => {
      const row = el("div", "flow-summary-row");
      row.appendChild(el("span", "flow-summary-label", label));
      row.appendChild(el("span", "flow-summary-value", value));
      card.appendChild(row);
    });
    wrap.appendChild(card);

    const actions = el("div", "flow-summary-actions");
    const submitBtn = el("button", "btn btn-primary", "🚀 Demander mon installation Dealz");
    submitBtn.type = "button";
    submitBtn.addEventListener("click", () => {
      actions.querySelectorAll("button").forEach((b) => (b.disabled = true));
      submitInstallRequest(a);
      renderConfirmation();
    });
    const editBtn = el("button", "btn btn-secondary", "Modifier mes réponses");
    editBtn.type = "button";
    editBtn.addEventListener("click", () => goToStep(STEPS.length - 1));
    actions.appendChild(submitBtn);
    actions.appendChild(editBtn);
    wrap.appendChild(actions);

    scrollToBottom(container);
  }

  function renderConfirmation() {
    const msg = el(
      "div",
      "dealz-msg system-success",
      "Merci ! Votre demande est bien enregistrée. Nous allons examiner votre site et votre configuration afin de préparer l'installation de Dealz. Vous recevrez votre récapitulatif par e-mail."
    );
    container.appendChild(msg);
    scrollToBottom(container);
    progressEl.textContent = T("Demande envoyée ✓");
  }

  // ---- text/url step rendering ----
  function renderTextStep(wrap, step) {
    setInputMode("text", step.placeholder);
    const handler = {
      onSubmit: (value) => {
        let stored = value;
        if (step.kind === "url") {
          let v = value.trim();
          if (!/^https?:\/\//i.test(v)) v = "https://" + v;
          if (!/^https?:\/\/[^\s]+\.[^\s]{2,}/i.test(v)) {
            wrap.appendChild(assistantBubble("Hmm, cette adresse ne ressemble pas tout à fait à une URL — vous pouvez réessayer ?"));
            scrollToBottom(container);
            pendingText = handler; // re-arm — the failed attempt must not brick the input
            return;
          }
          stored = v;
        }
        wrap.appendChild(userBubble(stored));
        state.answers[step.id] = stored;
        setInputMode("off");
        advanceTo(state.stepIndex + 1);
      },
    };
    pendingText = handler;
  }

  function renderStep(index) {
    started = true;
    updateProgress();
    if (index >= STEPS.length) return renderSummary();
    const step = STEPS[index];

    const wrap = el("div", "flow-block");
    container.appendChild(wrap);
    state.blocks[index] = wrap;

    wrap.appendChild(assistantBubble(step.question));

    if (step.kind === "text" || step.kind === "url") {
      renderTextStep(wrap, step);
    } else if (step.kind === "single" || step.kind === "multi") {
      renderChipsInto(wrap, step);
    } else if (step.kind === "plan") {
      renderPlanChoice(wrap);
    } else if (step.kind === "billing") {
      renderBillingChoice(wrap);
    } else if (step.kind === "contact_form") {
      renderContactFields(wrap);
    }

    backLink(wrap);
    scrollToBottom(container);
  }

  function renderIntro() {
    container.appendChild(
      assistantBubble("👋 Bonjour ! Je suis Dealz. Je peux vous aider à voir quelle formule correspond le mieux à votre entreprise. On commence ?")
    );
    const startBtn = el("button", "btn btn-primary", "Oui, allons-y →");
    startBtn.type = "button";
    const wrap = el("div", "flow-block");
    wrap.appendChild(startBtn);
    container.appendChild(wrap);
    startBtn.addEventListener("click", () => {
      startBtn.disabled = true;
      advanceTo(0);
    });
    setInputMode("off");
    scrollToBottom(container);
  }

  function submitPendingText() {
    const value = input.value.trim();
    if (!value || !pendingText) return;
    const handler = pendingText;
    pendingText = null;
    handler.onSubmit(value);
    input.value = "";
  }

  function init() {
    container = document.getElementById("contact-messages");
    input = document.getElementById("contact-input");
    sendBtn = document.getElementById("contact-send");
    progressEl = document.getElementById("contact-progress");
    if (!container || !input || !sendBtn) return;

    sendBtn.addEventListener("click", submitPendingText);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitPendingText();
    });

    renderIntro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
