/**
 * Generic, fully client-side quote widget for the sector demo sites
 * (docs/secteurs/<slug>/demo.html). Reads one sector definition from
 * window.DEALZ_SECTORS[window.DEALZ_SECTOR] (docs/secteurs/data/<slug>.js):
 * a language-neutral question list + pricing function, and per-language
 * texts. No backend, no AI call — same chat look and the same CSS classes as
 * the cleaning demo's docs/quote-app.js, so it costs nothing to run and can
 * never produce a surprise bill.
 *
 * Flow: greeting -> one question at a time (chips / multi-chips / date) ->
 * contact details -> quote card -> PDF modal -> accept (booking preview) or
 * decline (objection picker + company-facing e-mail preview).
 */
(function () {
  "use strict";

  var LANG = window.DEALZ_LANG || "fr";
  var SECTOR, TXT, QT, DEMO, LOGIC;
  function useSector(slug) {
    var s = (window.DEALZ_SECTORS || {})[slug];
    if (!s) return false;
    SECTOR = s;
    TXT = s[LANG] || s.fr;
    QT = TXT.quote;
    DEMO = TXT.demo;
    LOGIC = s.quote;
    return true;
  }
  if (!useSector(window.DEALZ_SECTOR)) return;

  var UI_ALL = {
    fr: {
      typing: "En train d'écrire…",
      acceptDone: function (c) { return "✓ Réservation confirmée !"; },
      declineDone: function (c) { return "Merci pour votre retour ! " + c + " reçoit un e-mail de refus avec une réponse suggérée et un bouton d'action."; },
      dlv: {
        company: "E-mail « entreprise » (ce que reçoit " + "{c}" + ")",
        customer: "E-mail « client final »",
        sent: function (to) { return "envoyé à <b>" + to + "</b> — vérifiez aussi vos spams."; },
        failed: function (to, e) { return "<b>non envoyé</b>" + (to ? " à " + to : "") + " — erreur d'envoi : <code>" + (e || "inconnue") + "</code>"; },
        simulated: "non envoyé : l'envoi d'e-mails n'est pas configuré sur ce serveur.",
        skipped: "aucune adresse renseignée.",
        intro: function (to, c) { return "📩 Démo : les e-mails que reçoit " + c + " arriveront à <b>" + to + "</b> dès que le client aura accepté ou refusé le devis."; },
      },
      addCalendar: "📅 Ajouter à mon agenda",
      error: function (m) { return "Erreur : " + m; },
      quoteReady: function (n) { return (n ? "Merci " + n + " ! " : "") + "Voici votre devis, ferme et détaillé — vous pouvez l'accepter ou le refuser ci-dessous."; },
      contactIntro: "Jouez maintenant le client : indiquez une adresse e-mail réelle, <b>différente de la vôtre</b>, pour recevoir ce que reçoit le client final (devis accepté, contre-offre…).",
      name: "Nom du client", email: "E-mail du client (réel, différent du vôtre)", phone: "Téléphone (optionnel)", address: "Adresse",
      sameEmail: "Pour tester les deux côtés, utilisez une autre adresse que celle donnée au début (les e-mails « entreprise » y arrivent déjà).",
      cont: "Continuer",
      confirmDate: "Confirmer la date",
      dateErr: function (min) { return "Merci de choisir une date valide (au plus tôt : " + min + ")."; },
      confirmChoices: "Valider mes choix",
      noneOption: "Aucune de ces options",
      noneChosen: "Aucune option",
      quoteHead: "DEVIS DÉTAILLÉ", total: "TOTAL", minimum: "Supplément au minimum de commande",
      viewPdf: "📄 Voir mon devis (PDF)", yourQuote: "📄 Votre devis", generating: "Génération du devis…",
      accept: "✓ Accepter le devis", decline: "Refuser", close: "Fermer", download: "⬇ Télécharger le PDF",
      pdfError: "Impossible de générer le PDF (connexion requise). Vous pouvez tout de même accepter ou refuser ci-dessous.",
      logoHint: "💡 Avec Dealz, ce devis porte votre logo, vos coordonnées et vos conditions.",
      restart: "↺ Nouveau devis",
      declineAsk: "Bien sûr. Auriez-vous deux minutes pour me dire ce qui ne convenait pas dans notre offre ?",
      freePh: "Ou décrivez avec vos mots…", send: "Envoyer",
      declineThanks: function (c) { return "Merci pour votre retour ! En conditions réelles, ce message serait transmis à " + c + " par e-mail, avec une action adaptée à votre motif de refus."; },
      acceptThanks: function (c) { return "✓ Merci ! Votre devis a été transmis à " + c + ". Vous recevrez la confirmation par e-mail."; },
      staticNote: "(Mode démonstration — aucun e-mail réel n'est envoyé ici.)",
      previewHead: "📧 Aperçu de l'e-mail (démo)", to: "À :", subject: "Objet :",
      postCta: "Merci d'avoir testé l'assistant de devis Dealz !", integrate: "Intégrer Dealz", contact: "Nous contacter",
      misunderstood: "Je n'ai pas bien compris — choisissez l'une des options proposées ci-dessus.",
      afterQuote: "Votre devis est prêt ci-dessus. Pour en établir un nouveau, cliquez sur « Nouveau devis ».",
      terms: "Devis ferme, valable 30 jours. TVA suisse incluse le cas échéant.",
      generated: function (b) { return "Document généré automatiquement — " + b + ", site de démonstration."; },
      objections: [
        ["price", "💰 Le prix est trop élevé", "Prix trop élevé", "🔴", "Proposer une remise ciblée, ou retirer une option pour rentrer dans le budget du client."],
        ["timing", "📅 La date ne convient pas", "Date indisponible", "📅", "Proposer deux ou trois autres créneaux disponibles."],
        ["scope", "✂️ Je n'ai pas besoin de tout", "Périmètre du service", "✂️", "Proposer une version allégée, sans les options inutiles."],
        ["conditions", "📋 Les conditions/détails ne conviennent pas", "Conditions / détails", "📋", "Clarifier les conditions et adapter le devis aux détails demandés."],
        ["thinking", "🤔 Je dois réfléchir", "A besoin de réfléchir", "🟡", "Programmer une relance douce dans 48 h."],
        ["competitor", "🆚 J'ai reçu une autre offre", "A reçu une autre offre", "🆚", "Demander le montant concurrent, puis s'aligner ou valoriser la différence."],
        ["information", "❓ J'ai une autre question", "A besoin d'informations", "❓", "Répondre directement à la question du client."],
        ["not_needed", "⚪ Je n'ai plus besoin du service", "N'a plus besoin du service", "⚪", "Remercier le client et clôturer la demande."],
      ],
      other: "Autre raison",
      emailDeclineTitle: "Devis refusé — action possible",
      client: "Client", clientEmail: "E-mail", clientPhone: "Téléphone", clientAddress: "Adresse",
      originalQuote: "Devis original", reason: "Motif du refus", clientMsg: "Message du client", action: "Action suggérée",
      notProvided: "(non fourni)",
      bookingTitle: "✓ Réservation confirmée",
      bookingBody: function (n, c, t) { return "Merci " + n + " ! Votre réservation auprès de " + c + " est confirmée pour <b>" + t + "</b>."; },
      bookingFoot: "Le vrai e-mail contient aussi un lien « Ajouter à mon agenda ».",
      declineSubject: function (label, name, total) { return "Devis refusé — " + label + " — " + name + (total ? " — " + total : ""); },
      aClient: "un client",
      pdfTitleDoc: "DEVIS",
    },
    en: {
      typing: "Typing…",
      acceptDone: function (c) { return "✓ Booking confirmed!"; },
      declineDone: function (c) { return "Thanks for the feedback! " + c + " gets a decline email with a suggested reply and an action button."; },
      dlv: {
        company: "“Company” email (what {c} receives)",
        customer: "“End customer” email",
        sent: function (to) { return "sent to <b>" + to + "</b> — check your spam folder too."; },
        failed: function (to, e) { return "<b>not sent</b>" + (to ? " to " + to : "") + " — sending error: <code>" + (e || "unknown") + "</code>"; },
        simulated: "not sent: email sending isn't configured on this server.",
        skipped: "no address provided.",
        intro: function (to, c) { return "📩 Demo: the emails " + c + " receives will land in <b>" + to + "</b> as soon as the customer accepts or declines the quote."; },
      },
      addCalendar: "📅 Add to my calendar",
      error: function (m) { return "Error: " + m; },
      quoteReady: function (n) { return (n ? "Thank you " + n + "! " : "") + "Here is your firm, detailed quote — you can accept or decline it below."; },
      contactIntro: "Now play the customer: enter a real email address, <b>different from yours</b>, to receive what the end customer receives (accepted quote, counter-offer…).",
      name: "Customer name", email: "Customer email (real, not yours)", phone: "Phone (optional)", address: "Address",
      sameEmail: "To test both sides, use a different address from the one given at the start (the “company” emails already go there).",
      cont: "Continue",
      confirmDate: "Confirm date",
      dateErr: function (min) { return "Please choose a valid date (earliest: " + min + ")."; },
      confirmChoices: "Confirm my choices",
      noneOption: "None of these",
      noneChosen: "No option",
      quoteHead: "DETAILED QUOTE", total: "TOTAL", minimum: "Minimum order adjustment",
      viewPdf: "📄 View my quote (PDF)", yourQuote: "📄 Your quote", generating: "Generating your quote…",
      accept: "✓ Accept quote", decline: "Decline", close: "Close", download: "⬇ Download PDF",
      pdfError: "Couldn't generate the PDF (connection required). You can still accept or decline below.",
      logoHint: "💡 With Dealz, this quote carries your logo, your contact details and your terms.",
      restart: "↺ New quote",
      declineAsk: "Of course. Would you have two minutes to tell me what didn't work in our offer?",
      freePh: "Or describe it in your own words…", send: "Send",
      declineThanks: function (c) { return "Thanks for the feedback! Under real conditions, this message would be sent to " + c + " by email, with an action tailored to your reason for declining."; },
      acceptThanks: function (c) { return "✓ Thank you! Your quote has been sent to " + c + ". You'll receive a confirmation by email."; },
      staticNote: "(Demo mode — no real email is sent here.)",
      previewHead: "📧 Email preview (demo)", to: "To:", subject: "Subject:",
      postCta: "Thanks for trying the Dealz quote assistant!", integrate: "Add Dealz to my site", contact: "Contact us",
      misunderstood: "I didn't quite get that — please pick one of the options above.",
      afterQuote: "Your quote is ready above. To create a new one, click “New quote”.",
      terms: "Firm quote, valid for 30 days. Swiss VAT included where applicable.",
      generated: function (b) { return "Automatically generated document — " + b + ", demo site."; },
      objections: [
        ["price", "💰 The price is too high", "Price too high", "🔴", "Offer a targeted discount, or drop an option to fit the customer's budget."],
        ["timing", "📅 The date doesn't suit me", "Date unavailable", "📅", "Offer two or three other available slots."],
        ["scope", "✂️ I don't need everything", "Scope of service", "✂️", "Offer a lighter version without the unnecessary options."],
        ["conditions", "📋 The terms/details don't suit me", "Terms / details", "📋", "Clarify the terms and adapt the quote to the requested details."],
        ["thinking", "🤔 I need to think about it", "Needs time to think", "🟡", "Schedule a gentle follow-up in 48 hours."],
        ["competitor", "🆚 I received another offer", "Received another offer", "🆚", "Ask for the competing amount, then match it or highlight the difference."],
        ["information", "❓ I have another question", "Needs information", "❓", "Answer the customer's question directly."],
        ["not_needed", "⚪ I no longer need the service", "No longer needs the service", "⚪", "Thank the customer and close the request."],
      ],
      other: "Other reason",
      emailDeclineTitle: "Quote declined — action possible",
      client: "Customer", clientEmail: "Email", clientPhone: "Phone", clientAddress: "Address",
      originalQuote: "Original quote", reason: "Reason for declining", clientMsg: "Customer's message", action: "Suggested action",
      notProvided: "(not provided)",
      bookingTitle: "✓ Booking confirmed",
      bookingBody: function (n, c, t) { return "Thank you " + n + "! Your booking with " + c + " is confirmed for <b>" + t + "</b>."; },
      bookingFoot: "The real email also contains an “Add to my calendar” link.",
      declineSubject: function (label, name, total) { return "Quote declined — " + label + " — " + name + (total ? " — " + total : ""); },
      aClient: "a customer",
      pdfTitleDoc: "QUOTE",
    },
    de: {
      typing: "Schreibt…",
      acceptDone: function (c) { return "✓ Buchung bestätigt!"; },
      declineDone: function (c) { return "Danke für Ihr Feedback! " + c + " erhält eine Ablehnungs-E-Mail mit Antwortvorschlag und Aktionsknopf."; },
      dlv: {
        company: "E-Mail «Unternehmen» (was {c} erhält)",
        customer: "E-Mail «Endkunde»",
        sent: function (to) { return "gesendet an <b>" + to + "</b> — prüfen Sie auch den Spam-Ordner."; },
        failed: function (to, e) { return "<b>nicht gesendet</b>" + (to ? " an " + to : "") + " — Versandfehler: <code>" + (e || "unbekannt") + "</code>"; },
        simulated: "nicht gesendet: Der E-Mail-Versand ist auf diesem Server nicht eingerichtet.",
        skipped: "keine Adresse angegeben.",
        intro: function (to, c) { return "📩 Demo: Die E-Mails, die " + c + " erhält, landen in <b>" + to + "</b>, sobald der Kunde die Offerte annimmt oder ablehnt."; },
      },
      addCalendar: "📅 Zu meinem Kalender hinzufügen",
      error: function (m) { return "Fehler: " + m; },
      quoteReady: function (n) { return (n ? "Vielen Dank " + n + "! " : "") + "Hier ist Ihre feste, detaillierte Offerte — Sie können sie unten annehmen oder ablehnen."; },
      contactIntro: "Spielen Sie jetzt den Kunden: Geben Sie eine echte E-Mail-Adresse an, <b>nicht Ihre eigene</b>, um zu erhalten, was der Endkunde erhält (angenommene Offerte, Gegenangebot…).",
      name: "Name des Kunden", email: "E-Mail des Kunden (echt, nicht Ihre)", phone: "Telefon (optional)", address: "Adresse",
      sameEmail: "Um beide Seiten zu testen, verwenden Sie eine andere Adresse als zu Beginn (die «Unternehmens»-E-Mails gehen bereits dorthin).",
      cont: "Weiter",
      confirmDate: "Datum bestätigen",
      dateErr: function (min) { return "Bitte wählen Sie ein gültiges Datum (frühestens: " + min + ")."; },
      confirmChoices: "Auswahl bestätigen",
      noneOption: "Keine davon",
      noneChosen: "Keine Option",
      quoteHead: "DETAILLIERTE OFFERTE", total: "TOTAL", minimum: "Aufschlag auf Mindestbestellwert",
      viewPdf: "📄 Meine Offerte ansehen (PDF)", yourQuote: "📄 Ihre Offerte", generating: "Offerte wird erstellt…",
      accept: "✓ Offerte annehmen", decline: "Ablehnen", close: "Schliessen", download: "⬇ PDF herunterladen",
      pdfError: "PDF konnte nicht erstellt werden (Verbindung erforderlich). Sie können unten trotzdem annehmen oder ablehnen.",
      logoHint: "💡 Mit Dealz trägt diese Offerte Ihr Logo, Ihre Kontaktdaten und Ihre Bedingungen.",
      restart: "↺ Neue Offerte",
      declineAsk: "Natürlich. Hätten Sie zwei Minuten, um mir zu sagen, was an unserem Angebot nicht gepasst hat?",
      freePh: "Oder beschreiben Sie es mit eigenen Worten…", send: "Senden",
      declineThanks: function (c) { return "Danke für Ihr Feedback! Unter realen Bedingungen würde diese Nachricht per E-Mail an " + c + " übermittelt, mit einer auf Ihren Ablehnungsgrund abgestimmten Massnahme."; },
      acceptThanks: function (c) { return "✓ Vielen Dank! Ihre Offerte wurde an " + c + " übermittelt. Sie erhalten eine Bestätigung per E-Mail."; },
      staticNote: "(Demo-Modus — es wird hier keine echte E-Mail versendet.)",
      previewHead: "📧 E-Mail-Vorschau (Demo)", to: "An:", subject: "Betreff:",
      postCta: "Danke, dass Sie den Dealz-Offertassistenten ausprobiert haben!", integrate: "Dealz integrieren", contact: "Kontakt aufnehmen",
      misunderstood: "Das habe ich nicht ganz verstanden — bitte wählen Sie eine der oben angezeigten Optionen.",
      afterQuote: "Ihre Offerte steht oben bereit. Für eine neue klicken Sie auf «Neue Offerte».",
      terms: "Feste Offerte, gültig 30 Tage. Schweizer MWST wo anwendbar inbegriffen.",
      generated: function (b) { return "Automatisch erstelltes Dokument — " + b + ", Demo-Website."; },
      objections: [
        ["price", "💰 Der Preis ist zu hoch", "Preis zu hoch", "🔴", "Gezielten Rabatt anbieten oder eine Option streichen, um ins Budget zu passen."],
        ["timing", "📅 Das Datum passt nicht", "Datum nicht verfügbar", "📅", "Zwei oder drei andere freie Termine vorschlagen."],
        ["scope", "✂️ Ich brauche nicht alles", "Leistungsumfang", "✂️", "Eine schlankere Variante ohne unnötige Optionen anbieten."],
        ["conditions", "📋 Die Bedingungen/Details passen nicht", "Bedingungen / Details", "📋", "Bedingungen klären und die Offerte an die gewünschten Details anpassen."],
        ["thinking", "🤔 Ich muss darüber nachdenken", "Braucht Bedenkzeit", "🟡", "In 48 Stunden sanft nachfassen."],
        ["competitor", "🆚 Ich habe ein anderes Angebot erhalten", "Hat anderes Angebot erhalten", "🆚", "Nach dem Konkurrenzbetrag fragen, dann angleichen oder den Unterschied hervorheben."],
        ["information", "❓ Ich habe eine weitere Frage", "Braucht Informationen", "❓", "Die Frage des Kunden direkt beantworten."],
        ["not_needed", "⚪ Ich brauche die Leistung nicht mehr", "Braucht die Leistung nicht mehr", "⚪", "Dem Kunden danken und die Anfrage abschliessen."],
      ],
      other: "Anderer Grund",
      emailDeclineTitle: "Offerte abgelehnt — Aktion möglich",
      client: "Kunde", clientEmail: "E-Mail", clientPhone: "Telefon", clientAddress: "Adresse",
      originalQuote: "Ursprüngliche Offerte", reason: "Ablehnungsgrund", clientMsg: "Nachricht des Kunden", action: "Vorgeschlagene Aktion",
      notProvided: "(nicht angegeben)",
      bookingTitle: "✓ Buchung bestätigt",
      bookingBody: function (n, c, t) { return "Vielen Dank " + n + "! Ihre Buchung bei " + c + " ist bestätigt für <b>" + t + "</b>."; },
      bookingFoot: "Die echte E-Mail enthält zusätzlich einen Link «Zu meinem Kalender hinzufügen».",
      declineSubject: function (label, name, total) { return "Offerte abgelehnt — " + label + " — " + name + (total ? " — " + total : ""); },
      aClient: "ein Kunde",
      pdfTitleDoc: "OFFERTE",
    },
  };
  var UI = UI_ALL[LANG] || UI_ALL.fr;

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function fmtCHF(n) { return "CHF " + Number(n).toFixed(2); }
  function fmtDate(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(LANG === "en" ? "en-CH" : LANG === "de" ? "de-CH" : "fr-CH", { year: "numeric", month: "long", day: "numeric" });
  }
  function isoDatePlus(days) {
    var d = new Date(Date.now() + days * 864e5);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] !== undefined ? vars[k] : m; });
  }
  function optLabel(q, opt) {
    var qt = QT.q[q.id] || {};
    return (qt.opts && qt.opts[opt.id]) || opt.id;
  }
  function L(key, vars) { return fill((QT.items && QT.items[key]) || key, vars); }
  var H = {
    clamp: function (v, a, b) { return Math.min(b, Math.max(a, v)); },
    round5: function (v) { return Math.round(v / 5) * 5; },
    round1: function (v) { return Math.round(v); },
  };

  // ---------- state ----------
  var container, input, sendBtn;
  var answers, pending, pendingWrap, customer, lastQuote, busy;

  function resetState() {
    answers = {};
    pending = null;
    pendingWrap = null;
    customer = null;
    lastQuote = null;
    busy = false;
  }

  function scroll() { container.scrollTop = container.scrollHeight; }
  // French typography: keep ? ! : ; » attached to the preceding word.
  function typo(text) { return LANG === "fr" ? String(text).replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0") : text; }
  function assistant(text) { container.appendChild(el("div", "dealz-msg assistant", typo(text))); scroll(); }
  // For our own fixed strings that carry markup (e.g. <b>), never user input.
  function assistantHtml(html) {
    var b = el("div", "dealz-msg assistant");
    b.innerHTML = typo(html);
    container.appendChild(b);
    scroll();
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function user(text) { container.appendChild(el("div", "dealz-msg user", text)); scroll(); }
  function system(kind, html) {
    var b = el("div", "dealz-msg " + kind);
    b.innerHTML = html;
    container.appendChild(b);
    scroll();
  }

  // ---------- question flow ----------
  function nextQuestion() {
    for (var i = 0; i < LOGIC.questions.length; i++) {
      var q = LOGIC.questions[i];
      if (answers[q.id] !== undefined) continue;
      if (q.when && !q.when(answers)) continue;
      return q;
    }
    return null;
  }

  function ask() {
    var q = nextQuestion();
    if (!q) { askContact(); return; }
    var qt = QT.q[q.id] || {};
    assistant(qt.text || q.id);
    pending = q;
    if (q.type === "date") renderDate(q);
    else renderChips(q);
  }

  function answerDisplay(q, value) {
    if (q.type === "date" || q.type === "text") return q.type === "date" ? fmtDate(value) : value;
    if (Array.isArray(value)) return value.length ? value.map(function (o) { return optLabel(q, o); }).join(", ") : UI.noneChosen;
    return optLabel(q, value);
  }

  function commit(q, value) {
    pending = null;
    answers[q.id] = value;
    user(answerDisplay(q, value));
    ask();
  }

  function renderChips(q) {
    var wrap = el("div", "dealz-objection-picker");
    var row = el("div", "dop-chips");
    var picked = [];
    var noneBtn = null;
    q.options.forEach(function (opt) {
      var btn = el("button", "dop-chip", optLabel(q, opt));
      btn.addEventListener("click", function () {
        if (q.type === "multi") {
          btn.classList.toggle("selected");
          var idx = picked.indexOf(opt);
          if (idx >= 0) picked.splice(idx, 1); else picked.push(opt);
          if (noneBtn) noneBtn.classList.remove("selected");
        } else {
          wrap.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
          commit(q, opt);
        }
      });
      row.appendChild(btn);
    });
    if (q.type === "multi") {
      noneBtn = el("button", "dop-chip", (QT.q[q.id] && QT.q[q.id].none) || UI.noneOption);
      noneBtn.addEventListener("click", function () {
        picked.length = 0;
        row.querySelectorAll(".dop-chip").forEach(function (b) { b.classList.remove("selected"); });
        noneBtn.classList.add("selected");
      });
      row.appendChild(noneBtn);
    }
    wrap.appendChild(row);
    pendingWrap = wrap;
    if (q.type === "multi") {
      var ok = el("button", "dcf-submit", UI.confirmChoices);
      ok.addEventListener("click", function () {
        wrap.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
        commit(q, picked.slice());
      });
      wrap.appendChild(ok);
    }
    container.appendChild(wrap);
    scroll();
  }

  function renderDate(q) {
    var min = isoDatePlus(q.minDays === undefined ? 2 : q.minDays);
    var wrap = el("div", "dealz-objection-picker");
    var inp = el("input", "dcf-input");
    inp.type = "date";
    inp.min = min;
    wrap.appendChild(inp);
    var msg = el("p", "dlg-msg");
    wrap.appendChild(msg);
    var ok = el("button", "dcf-submit", UI.confirmDate);
    ok.addEventListener("click", function () {
      if (!inp.value || inp.value < min) {
        msg.textContent = UI.dateErr(min);
        msg.className = "dlg-msg show err";
        return;
      }
      wrap.querySelectorAll("input, button").forEach(function (n) { n.disabled = true; });
      commit(q, inp.value);
    });
    wrap.appendChild(ok);
    pendingWrap = wrap;
    container.appendChild(wrap);
    scroll();
  }

  // Typed answers: map free text onto the pending question when possible.
  // Scores each option by word overlap (both directions); a single-choice
  // question only accepts a clear, unambiguous winner — "ascenseur" alone
  // matches three floor options, so it is rejected rather than guessed.
  var STOP = { de: 1, du: 1, des: 1, la: 1, le: 1, les: 1, un: 1, une: 1, et: 1, ou: 1, en: 1, au: 1, aux: 1, the: 1, an: 1, and: 1, or: 1, of: 1, der: 1, die: 1, das: 1, und: 1, oder: 1, ein: 1, eine: 1 };
  function toks(str) {
    return norm(str).split(" ").filter(function (w) { return w && !STOP[w] && (w.length >= 3 || /^\d+$/.test(w)); });
  }
  function matchOptions(q, text, multi) {
    var u = toks(text);
    if (!u.length) return [];
    var tn = " " + norm(text) + " ";
    var scored = q.options.map(function (opt) {
      var label = norm(optLabel(q, opt));
      var lt = toks(label);
      var score;
      if (tn.indexOf(" " + label + " ") >= 0) score = 100;
      else {
        var hitL = lt.filter(function (w) { return u.indexOf(w) >= 0; }).length;
        var hitU = u.filter(function (w) { return lt.indexOf(w) >= 0; }).length;
        score = Math.round(100 * Math.max(lt.length ? hitL / lt.length : 0, (hitU / u.length) * 0.85));
      }
      return { opt: opt, score: score };
    }).sort(function (a, b) { return b.score - a.score; });
    if (multi) return scored.filter(function (x) { return x.score >= 50; }).map(function (x) { return x.opt; });
    if (!scored.length || scored[0].score < 60) return [];
    if (scored[1] && scored[1].score === scored[0].score) return [];
    return [scored[0].opt];
  }

  function parseDate(text) {
    var m = String(text).match(/(\d{4})-(\d{2})-(\d{2})/) || null;
    if (m) return m[0];
    m = String(text).match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (m) return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
    return null;
  }

  function disablePending() {
    if (pendingWrap) pendingWrap.querySelectorAll("input, button").forEach(function (n) { n.disabled = true; });
    pendingWrap = null;
  }

  function handleTyped(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    if (!pending) {
      user(text);
      assistant(lastQuote ? UI.afterQuote : UI.misunderstood);
      return;
    }
    var q = pending;
    if (q.type === "date") {
      var iso = parseDate(text);
      var min = isoDatePlus(q.minDays === undefined ? 2 : q.minDays);
      user(text);
      if (iso && iso >= min) {
        disablePending();
        pending = null;
        answers[q.id] = iso;
        ask();
      } else assistant(UI.dateErr(min));
      return;
    }
    var hits = matchOptions(q, text, q.type === "multi");
    user(text);
    if (!hits.length) { assistant(UI.misunderstood); return; }
    disablePending();
    pending = null;
    answers[q.id] = q.type === "multi" ? hits : hits[0];
    ask();
  }

  // ---------- contact + quote ----------
  function askContact() {
    assistantHtml(UI.contactIntro);
    var wrap = el("div", "dealz-contact-form");
    var nameI = el("input", "dcf-input"); nameI.placeholder = UI.name;
    var emailI = el("input", "dcf-input"); emailI.type = "email"; emailI.placeholder = UI.email;
    var phoneI = el("input", "dcf-input"); phoneI.placeholder = UI.phone;
    wrap.appendChild(nameI); wrap.appendChild(emailI); wrap.appendChild(phoneI);
    var addrI = null;
    if (SECTOR.needsAddress) {
      addrI = el("input", "dcf-input");
      addrI.placeholder = QT.addressPlaceholder || UI.address;
      wrap.appendChild(addrI);
    }
    var go = el("button", "dcf-submit", UI.cont);
    go.addEventListener("click", function () {
      if (!emailI.value.trim()) { emailI.focus(); return; }
      if (companyEmail() && emailI.value.trim().toLowerCase() === companyEmail().toLowerCase()) {
        assistant(UI.sameEmail);
        emailI.focus();
        return;
      }
      if (addrI && !addrI.value.trim()) { addrI.focus(); return; }
      go.disabled = true;
      wrap.querySelectorAll("input").forEach(function (i) { i.disabled = true; });
      customer = { name: nameI.value.trim(), email: emailI.value.trim(), phone: phoneI.value.trim(), address: addrI ? addrI.value.trim() : "" };
      user([customer.name, customer.email, customer.phone].filter(Boolean).join(" · "));
      deliverQuote();
    });
    wrap.appendChild(go);
    container.appendChild(wrap);
    scroll();
  }

  function buildQuote() {
    var items = LOGIC.compute(answers, L, H).filter(function (i) { return i && isFinite(i.amount); });
    var total = items.reduce(function (s, i) { return s + i.amount; }, 0);
    if (LOGIC.minimum && total < LOGIC.minimum) {
      items.push({ label: UI.minimum, amount: LOGIC.minimum - total });
      total = LOGIC.minimum;
    }
    items.forEach(function (i) { i.amount = Math.round(i.amount * 100) / 100; });
    var details = [];
    LOGIC.questions.forEach(function (q) {
      if (answers[q.id] === undefined) return;
      var short = (QT.q[q.id] && QT.q[q.id].short) || null;
      if (!short) return;
      details.push(short + " : " + answerDisplay(q, answers[q.id]));
    });
    return { items: items, total: Math.round(total * 100) / 100, customer: customer, detailLines: details, sector: SECTOR.slug };
  }

  function deliverQuote() {
    busy = true;
    var typing = el("div", "dealz-msg typing", UI.typing);
    container.appendChild(typing);
    scroll();
    setTimeout(function () {
      typing.remove();
      busy = false;
      lastQuote = buildQuote();
      assistant(UI.quoteReady(customer.name));
      renderQuoteCard(lastQuote);
    }, 700);
  }

  function renderQuoteCard(quote) {
    var card = el("div", "dealz-quote-card");
    var head = el("div", "qc-head");
    head.textContent = UI.quoteHead + (quote.customer && quote.customer.name ? " — " + quote.customer.name.toUpperCase() : "");
    card.appendChild(head);
    quote.items.forEach(function (it) {
      var row = el("div", "qc-row");
      row.appendChild(el("span", null, it.label));
      row.appendChild(el("span", null, fmtCHF(it.amount)));
      card.appendChild(row);
    });
    var tot = el("div", "qc-total");
    tot.appendChild(el("span", null, UI.total));
    tot.appendChild(el("span", null, fmtCHF(quote.total)));
    card.appendChild(tot);
    var actions = el("div", "qc-actions");
    var view = el("button", "qc-accept", UI.viewPdf);
    view.style.flex = "1 1 100%";
    view.addEventListener("click", function () { openPdf(quote); });
    actions.appendChild(view);
    var again = el("button", "dop-chip", UI.restart);
    again.style.flex = "1 1 100%";
    again.addEventListener("click", restart);
    actions.appendChild(again);
    card.appendChild(actions);
    container.appendChild(card);
    scroll();
    document.dispatchEvent(new CustomEvent("dealz:quote-delivered", { detail: quote }));
  }

  // ---------- PDF modal ----------
  // The fictional company's logo (docs/images/demo-logos/), as a PNG data
  // URL for the PDF; resolves to null if it can't be loaded.
  var logoPromise = null;
  function loadLogo() {
    if (logoPromise) return logoPromise;
    logoPromise = new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        try {
          var c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d").drawImage(img, 0, 0);
          resolve({ data: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight });
        } catch (e) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.src = "/images/demo-logos/" + SECTOR.slug + ".png";
    });
    return logoPromise;
  }

  var pdfLibPromise = null;
  function loadPdfLibs() {
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise(function (resolve, reject) {
      function loadGen() {
        if (window.DealzPDF) return resolve();
        var g = document.createElement("script");
        g.src = "/pdf-generator.js";
        g.onload = resolve;
        g.onerror = reject;
        document.body.appendChild(g);
      }
      if (window.jspdf) return loadGen();
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = loadGen;
      s.onerror = reject;
      document.body.appendChild(s);
    });
    return pdfLibPromise;
  }

  function closePdf() {
    var o = document.getElementById("dealz-pdf-overlay");
    if (o) o.remove();
  }

  function openPdf(quote) {
    closePdf();
    var overlay = el("div", "dealz-pdf-overlay");
    overlay.id = "dealz-pdf-overlay";
    overlay.innerHTML =
      '<div class="dealz-pdf-modal"><div class="dealz-pdf-modal-head"><span></span>' +
      '<button class="dealz-pdf-close" aria-label="' + UI.close + '">✕</button></div>' +
      '<div class="dealz-pdf-body"><p class="dealz-pdf-loading"></p></div>' +
      '<div class="dealz-pdf-actions"><button class="qc-accept" id="dealz-pdf-accept"></button>' +
      '<button class="qc-decline" id="dealz-pdf-decline"></button></div></div>';
    overlay.querySelector(".dealz-pdf-modal-head span").textContent = UI.yourQuote;
    overlay.querySelector(".dealz-pdf-loading").textContent = UI.generating;
    var acc = overlay.querySelector("#dealz-pdf-accept");
    var dec = overlay.querySelector("#dealz-pdf-decline");
    acc.textContent = UI.accept;
    dec.textContent = UI.decline;
    document.body.appendChild(overlay);
    overlay.querySelector(".dealz-pdf-close").addEventListener("click", closePdf);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closePdf(); });
    acc.addEventListener("click", function () { closePdf(); handleAccept(quote); });
    dec.addEventListener("click", function () { closePdf(); handleDecline(quote); });

    Promise.all([loadPdfLibs(), loadLogo()]).then(function (r) {
      var company = Object.assign({}, DEMO.pdfCompany, r[1] ? { logo: r[1] } : {});
      var res = window.DealzPDF.generate(quote, quote.customer || {}, LANG, {
        company: company,
        detailLines: quote.detailLines,
        terms: QT.terms || UI.terms,
        generated: UI.generated(DEMO.brand),
      });
      var body = overlay.querySelector(".dealz-pdf-body");
      body.innerHTML = "";
      var iframe = el("iframe", "dealz-pdf-frame");
      iframe.src = res.blobUrl;
      iframe.title = UI.yourQuote;
      body.appendChild(iframe);
      var dl = el("a", "dealz-pdf-download", UI.download);
      dl.href = res.blobUrl;
      dl.download = "devis-" + SECTOR.slug + ".pdf";
      body.appendChild(dl);
      body.appendChild(el("p", "dealz-pdf-hint", UI.logoHint));
    }).catch(function () {
      overlay.querySelector(".dealz-pdf-body").innerHTML = '<p class="dealz-pdf-loading"></p>';
      overlay.querySelector(".dealz-pdf-loading").textContent = UI.pdfError;
    });
  }

  // ---------- accept / decline (real e-mails via the backend, simulated fallback) ----------
  function emailPreview(preview) {
    var wrap = el("div", "dealz-email-preview");
    var head = el("div", "dep-head", UI.previewHead);
    var meta = el("div", "dep-meta");
    meta.innerHTML = "<b>" + UI.to + "</b> " + preview.to + "<br/><b>" + UI.subject + "</b> " + preview.subject;
    var body = el("div", "dep-body");
    body.innerHTML = preview.html;
    wrap.appendChild(head); wrap.appendChild(meta); wrap.appendChild(body);
    container.appendChild(wrap);
    scroll();
  }

  function itemsTable(quote) {
    return "<table>" + quote.items.map(function (i) {
      return '<tr><td>' + i.label + '</td><td style="text-align:right">' + fmtCHF(i.amount) + "</td></tr>";
    }).join("") + "</table>";
  }

  function postCta() {
    var wrap = el("div", "dealz-post-cta");
    wrap.appendChild(el("p", "dpc-text", UI.postCta));
    var actions = el("div", "dpc-actions");
    var a = el("a", "dpc-btn dpc-btn-primary", UI.integrate);
    a.href = window.DEALZ_CTA_HREF || "/secteurs/" + SECTOR.slug + "/#contact";
    var c = el("a", "dpc-btn dpc-btn-secondary", UI.contact);
    c.href = "mailto:dealz@dealz.website";
    actions.appendChild(a); actions.appendChild(c);
    wrap.appendChild(actions);
    container.appendChild(wrap);
    scroll();
  }

  // One line per e-mail with its real outcome, so a failed send is visible
  // instead of being reported as delivered.
  function deliveryHtml(delivery) {
    if (!delivery) return "";
    var lines = [];
    [["company", UI.dlv.company.replace("{c}", DEMO.brand)], ["customer", UI.dlv.customer]].forEach(function (k) {
      var d = delivery[k[0]];
      if (!d) return;
      var icon = d.state === "sent" ? "📩" : d.state === "skipped" ? "➖" : "⚠️";
      var text = d.state === "sent" ? UI.dlv.sent(escapeHtml(d.to || "")) :
        d.state === "failed" ? UI.dlv.failed(escapeHtml(d.to || ""), escapeHtml(d.error || "")) :
        d.state === "simulated" ? UI.dlv.simulated : UI.dlv.skipped;
      lines.push(icon + " " + k[1] + " : " + text);
    });
    return lines.length ? "<br/><br/>" + lines.join("<br/>") : "";
  }

  function companyEmail() {
    try { return sessionStorage.getItem("dealz_company_email") || ""; } catch (e) { return ""; }
  }

  // Same contract as quote-app.js's postJSON: a non-JSON answer means "no
  // backend at all" (static hosting) -> caller falls back to a simulation;
  // a JSON error from a reachable backend is shown as-is.
  async function postJSON(path, body) {
    var res = await fetch((window.DEALZ_API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    var data;
    try { data = await res.json(); } catch (e) { throw new Error("no-backend"); }
    if (!res.ok) {
      var err = new Error(data.error || "error");
      err.isAppError = true;
      throw err;
    }
    return data;
  }

  function simulatedAccept(quote) {
    system("system-success", UI.acceptThanks(DEMO.brand) + '<br/><br/><i style="opacity:.7">' + UI.staticNote + "</i>");
    var c = quote.customer || {};
    emailPreview({
      to: c.email || UI.notProvided,
      subject: UI.bookingTitle,
      html: "<h2>" + UI.bookingTitle + "</h2><p>" + UI.bookingBody(c.name || "", DEMO.brand, fmtCHF(quote.total)) + "</p>" + itemsTable(quote) +
        "<p><i>" + UI.bookingFoot + "</i></p>",
    });
  }

  // Real flow: the visitor plays the fictional company, so the e-mails go
  // through the same /api/accept as the cleaning demo — the company-side
  // notification lands in the mailbox the visitor typed at the lead gate.
  async function handleAccept(quote) {
    pending = null;
    try {
      var data = await postJSON("/api/accept", { quote: quote, customer: quote.customer || {}, companyEmail: companyEmail(), sector: SECTOR.slug, platform: window.DEALZ_PLATFORM || undefined, lang: LANG });
      system(
        "system-success",
        UI.acceptDone(DEMO.brand) + deliveryHtml(data.delivery) +
          (data.calendarLink ? '<br/><br/><a href="' + data.calendarLink + '" target="_blank" rel="noopener">' + UI.addCalendar + "</a>" : "")
      );
      if (data.emailPreview) emailPreview(data.emailPreview);
    } catch (err) {
      if (err.isAppError) { system("system-decline", UI.error(err.message)); return; }
      simulatedAccept(quote);
    }
    postCta();
  }

  function handleDecline(quote) {
    assistant(UI.declineAsk);
    var wrap = el("div", "dealz-objection-picker");
    var row = el("div", "dop-chips");
    UI.objections.forEach(function (o) {
      var btn = el("button", "dop-chip", o[1]);
      btn.addEventListener("click", function () {
        wrap.querySelectorAll("button, input").forEach(function (n) { n.disabled = true; });
        finishDecline(quote, o, o[1]);
      });
      row.appendChild(btn);
    });
    wrap.appendChild(row);
    var free = el("div", "dop-free");
    var fi = el("input", "dop-free-input");
    fi.placeholder = UI.freePh;
    var fb = el("button", "dop-free-btn", UI.send);
    free.appendChild(fi); free.appendChild(fb);
    wrap.appendChild(free);
    function submitFree() {
      if (!fi.value.trim()) return;
      wrap.querySelectorAll("button, input").forEach(function (n) { n.disabled = true; });
      finishDecline(quote, null, fi.value.trim());
    }
    fb.addEventListener("click", submitFree);
    fi.addEventListener("keydown", function (e) { if (e.key === "Enter") submitFree(); });
    container.appendChild(wrap);
    scroll();
  }

  function simulatedDecline(quote, o, text) {
    var c = quote.customer || {};
    var label = o ? o[2] : UI.other;
    var emoji = o ? o[3] : "⚠️";
    var action = o ? o[4] : UI.objections[0][4];
    system("system-decline", UI.declineThanks(DEMO.brand) + '<br/><br/><i style="opacity:.7">' + UI.staticNote + "</i>");
    emailPreview({
      to: DEMO.contact.email,
      subject: emoji + " " + UI.declineSubject(label, c.name || UI.aClient, fmtCHF(quote.total)),
      html: "<h2>" + emoji + " " + UI.emailDeclineTitle + "</h2>" +
        "<p><b>" + UI.client + " :</b> " + (c.name || UI.notProvided) + "<br/><b>" + UI.clientEmail + " :</b> " + (c.email || UI.notProvided) +
        "<br/><b>" + UI.clientPhone + " :</b> " + (c.phone || UI.notProvided) + "<br/><b>" + UI.clientAddress + " :</b> " + (c.address || UI.notProvided) + "</p>" +
        "<p><b>" + UI.originalQuote + " :</b> " + fmtCHF(quote.total) + "</p>" + itemsTable(quote) +
        "<p><b>" + UI.reason + " :</b> " + label + "</p>" +
        "<p><b>" + UI.clientMsg + " :</b><br/>« " + text.replace(/</g, "&lt;") + " »</p>" +
        "<p><b>" + UI.action + " :</b> " + action + "</p>",
    });
  }

  async function finishDecline(quote, o, text) {
    user(text);
    try {
      var data = await postJSON("/api/decline", { quote: quote, category: o ? o[0] : null, text: text, customer: quote.customer || {}, companyEmail: companyEmail(), sector: SECTOR.slug, platform: window.DEALZ_PLATFORM || undefined, lang: LANG });
      system("system-decline", UI.declineDone(DEMO.brand) + deliveryHtml(data.delivery));
      if (data.emailPreview) emailPreview(data.emailPreview);
    } catch (err) {
      if (err.isAppError) system("system-decline", UI.error(err.message));
      else simulatedDecline(quote, o, text);
    }
    postCta();
  }

  // ---------- lifecycle ----------
  // Reminds the visitor where the "company" e-mails of this demo will land,
  // at the top of the conversation.
  function showDeliveryIntro(email) {
    if (!email || !container || container.querySelector(".dealz-delivery-intro")) return;
    var b = el("div", "dealz-msg system-success dealz-delivery-intro");
    b.innerHTML = UI.dlv.intro(escapeHtml(email), DEMO.brand);
    container.insertBefore(b, container.firstChild);
  }

  function greet() {
    assistant(QT.greeting);
    showDeliveryIntro(companyEmail());
    ask();
  }

  function restart() {
    container.innerHTML = "";
    resetState();
    greet();
  }

  function init() {
    container = document.getElementById("dealz-messages");
    input = document.getElementById("dealz-input");
    sendBtn = document.getElementById("dealz-send");
    if (!container || !input || !sendBtn) return;
    resetState();
    function submit() {
      var v = input.value;
      input.value = "";
      handleTyped(v);
    }
    sendBtn.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    window.addEventListener("dealz-lead-ok", function (e) { showDeliveryIntro(e.detail && e.detail.email); });
    greet();
  }

  // Pages that offer several trades (private prospect demos) switch the
  // engine at runtime; the conversation restarts for the chosen trade.
  window.DealzSectorQuote = {
    setSector: function (slug) {
      if (!useSector(slug)) return false;
      window.DEALZ_SECTOR = slug;
      if (container) restart();
      return true;
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
