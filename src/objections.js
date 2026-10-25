const Anthropic = require("@anthropic-ai/sdk");

// The "Dealz Objection Engine": one config table drives the email subject,
// the CTA(s) shown to the owner, and which adaptive UI counteroffer.html
// renders — different objections genuinely need different actions, not one
// generic "make a counteroffer" for everything.
const CATEGORIES = {
  price: {
    label: "Prix trop élevé",
    emoji: "🔴",
    action: "counteroffer",
    primaryCta: "Faire une contre-offre",
    secondaryCta: "Maintenir le prix",
    showTotal: true,
  },
  timing: {
    label: "Date indisponible",
    emoji: "📅",
    action: "reschedule",
    primaryCta: "Proposer une autre date",
    showTotal: true,
  },
  scope: {
    label: "Périmètre du service",
    emoji: "🧹",
    action: "revise",
    primaryCta: "Envoyer une offre révisée",
    showTotal: true,
  },
  conditions: {
    label: "Conditions / détails du nettoyage",
    emoji: "🏠",
    // Reuses the same "revise" action as scope on purpose — both end in the
    // owner adjusting the offer's terms, and counteroffer.html already
    // renders an adaptive revise form; no need for a third variant.
    action: "revise",
    primaryCta: "Modifier l'offre",
    showTotal: true,
  },
  competitor: {
    label: "A choisi un autre prestataire",
    emoji: "🆚",
    action: "counteroffer",
    primaryCta: "Faire une contre-offre",
    secondaryCta: "Maintenir le prix",
    showTotal: true,
  },
  information: {
    label: "A besoin d'informations",
    emoji: "❓",
    action: "reply",
    primaryCta: "Répondre au client",
    showTotal: false,
  },
  thinking: {
    label: "A besoin de réfléchir",
    emoji: "🟡",
    action: "followup",
    primaryCta: "Relancer le client",
    showTotal: true,
  },
  not_needed: {
    label: "N'a plus besoin du service",
    emoji: "⚪",
    action: "close",
    primaryCta: "Clôturer la demande",
    showTotal: false,
  },
  other: {
    label: "Autre raison",
    emoji: "⚠️",
    action: "review",
    primaryCta: "Voir la conversation",
    showTotal: true,
  },
};

// Company-facing wording for the EN/DE demos (the decline e-mail and the
// counter-offer page). Keys mirror CATEGORIES; French stays in CATEGORIES.
const CATEGORY_I18N = {
  en: {
    price: { label: "Price too high", primaryCta: "Make a counter-offer", secondaryCta: "Keep the price" },
    timing: { label: "Date unavailable", primaryCta: "Propose another date" },
    scope: { label: "Scope of the service", primaryCta: "Send a revised offer" },
    conditions: { label: "Conditions / details of the service", primaryCta: "Adjust the offer" },
    competitor: { label: "Chose another provider", primaryCta: "Make a counter-offer", secondaryCta: "Keep the price" },
    information: { label: "Needs information", primaryCta: "Reply to the customer" },
    thinking: { label: "Needs time to think", primaryCta: "Follow up with the customer" },
    not_needed: { label: "No longer needs the service", primaryCta: "Close the request" },
    other: { label: "Other reason", primaryCta: "View the conversation" },
  },
  de: {
    price: { label: "Preis zu hoch", primaryCta: "Gegenangebot machen", secondaryCta: "Preis beibehalten" },
    timing: { label: "Termin nicht verfügbar", primaryCta: "Anderen Termin vorschlagen" },
    scope: { label: "Leistungsumfang", primaryCta: "Überarbeitete Offerte senden" },
    conditions: { label: "Bedingungen / Details der Leistung", primaryCta: "Offerte anpassen" },
    competitor: { label: "Hat einen anderen Anbieter gewählt", primaryCta: "Gegenangebot machen", secondaryCta: "Preis beibehalten" },
    information: { label: "Braucht Informationen", primaryCta: "Dem Kunden antworten" },
    thinking: { label: "Braucht Bedenkzeit", primaryCta: "Beim Kunden nachfassen" },
    not_needed: { label: "Braucht die Leistung nicht mehr", primaryCta: "Anfrage abschliessen" },
    other: { label: "Anderer Grund", primaryCta: "Unterhaltung ansehen" },
  },
};

// CATEGORIES[category] with its texts in `lang` (French when not EN/DE).
function categoryConfig(category, lang) {
  const cfg = CATEGORIES[category] || CATEGORIES.other;
  const local = (CATEGORY_I18N[lang] || {})[CATEGORIES[category] ? category : "other"];
  return local ? { ...cfg, ...local } : cfg;
}

const MOCK_MODE = process.env.MOCK_MODE === "true";
const client = MOCK_MODE ? null : new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";

const CATEGORY_KEYS = Object.keys(CATEGORIES);

/**
 * Classifies a free-text decline reason into one of CATEGORIES. When a chip
 * was clicked (not free text), the category is already known and this isn't
 * called. Uses a real Claude call outside MOCK_MODE (cheap, Haiku); falls
 * back to a keyword heuristic in MOCK_MODE so classification still works
 * with zero API key / credit. Always falls back to "other" rather than
 * guessing — a wrong CTA (e.g. offering a discount for a scope objection)
 * is worse than a generic "review the conversation" one.
 */
async function classifyObjection(text, context) {
  if (!text || !text.trim()) return { category: "other", summary: "" };

  if (client) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 100,
        system:
          "Tu classes le motif de refus d'un devis " +
          (context && context.sectorLabel ? `du secteur « ${context.sectorLabel} »` : "de nettoyage") +
          " en une seule catégorie parmi : " +
          CATEGORY_KEYS.join(", ") +
          '. Si le message est ambigu ou ne correspond clairement à aucune, réponds "other". ' +
          'Réponds uniquement avec un objet JSON strict: {"category": "...", "summary": "résumé en une courte phrase"}.',
        messages: [{ role: "user", content: text }],
      });
      const textBlock = response.content.find((b) => b.type === "text");
      const parsed = JSON.parse(textBlock.text);
      if (CATEGORIES[parsed.category]) {
        return { category: parsed.category, summary: parsed.summary || text };
      }
    } catch (e) {
      // fall through to heuristic
    }
  }

  return heuristicClassify(text);
}

function heuristicClassify(text) {
  const t = text.toLowerCase();
  if (/plus besoin|annuler|finalement non|ne veux plus|n'ai plus besoin/.test(t))
    return { category: "not_needed", summary: text };
  if (/autre (offre|entreprise|soci[ée]t[ée]|devis)|concurrent|ailleurs|moins cher|propos[ée]/.test(t))
    return { category: "competitor", summary: text };
  if (/cher|prix|budget|co[uû]te?|francs?\b|chf/.test(t)) return { category: "price", summary: text };
  if (/date|horaire|jour|semaine|disponib|convien|septembre|octobre|novembre|d[ée]cembre|janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t/.test(t))
    return { category: "timing", summary: text };
  if (/pas besoin de tout|sans le|retirer|enlever/.test(t)) return { category: "scope", summary: text };
  if (/acc[èe]s|[ée]tage|meubl[ée]|occup[ée]|[ée]tat du logement|ascenseur/.test(t))
    return { category: "conditions", summary: text };
  if (/r[ée]fl[ée]chir|penser|plus tard/.test(t)) return { category: "thinking", summary: text };
  if (/\?/.test(t) || /combien|comment|pourquoi|est-ce que/.test(t))
    return { category: "information", summary: text };
  return { category: "other", summary: text };
}

// Short, ready-to-send-but-editable replies per category — used when a
// real Claude call isn't available (MOCK_MODE or an API error), the same
// safety net classifyObjection already has via heuristicClassify. Generic
// on purpose: they don't reference the customer's specific wording, since
// there's no model here to tailor them.
const FALLBACK_REPLIES_I18N = {
  en: {
    price: "I understand the price is holding you back. Would you be open to reviewing some items of the quote so it fits your budget?",
    timing: "Thanks for letting us know — if the proposed date doesn't suit you, which days would work for you in the coming days?",
    scope: "Understood — would you like me to remove some items from the quote so it matches what you actually need?",
    conditions: "Thanks for the detail, it can indeed change the quote. May I send you an adjusted offer that takes these conditions into account?",
    competitor: "I understand your choice. If it helps, I'm open to reviewing our offer — would you be willing to discuss it?",
    information: "Of course, happy to help — just tell me a bit more about your question and I'll get back to you quickly.",
    thinking: "No problem, take all the time you need. I'm available if you have any questions in the meantime.",
    not_needed: "Understood, thanks for letting us know — we're here if your needs change.",
    other: "Thanks for your feedback — feel free to tell me what's making you hesitate, so I can help you better.",
  },
  de: {
    price: "Ich verstehe, dass der Preis ein Hindernis ist. Wären Sie offen dafür, einige Positionen der Offerte zu überprüfen, damit sie in Ihr Budget passt?",
    timing: "Danke für Ihre Rückmeldung — falls der vorgeschlagene Termin nicht passt, an welchen Tagen wären Sie in nächster Zeit verfügbar?",
    scope: "Verstanden — soll ich einige Positionen aus der Offerte streichen, damit sie Ihrem tatsächlichen Bedarf entspricht?",
    conditions: "Danke für den Hinweis, das kann die Offerte tatsächlich beeinflussen. Darf ich Ihnen ein angepasstes Angebot unter Berücksichtigung dieser Bedingungen senden?",
    competitor: "Ich verstehe Ihre Wahl. Falls es hilft, bin ich bereit, unser Angebot zu überdenken — wären Sie offen für ein Gespräch?",
    information: "Selbstverständlich, gerne — präzisieren Sie Ihre Frage einfach, und ich melde mich rasch bei Ihnen.",
    thinking: "Kein Problem, nehmen Sie sich die Zeit, die Sie brauchen. Bei Fragen bin ich in der Zwischenzeit gerne für Sie da.",
    not_needed: "Verstanden, danke für die Mitteilung — wir sind für Sie da, falls sich Ihr Bedarf ändert.",
    other: "Danke für Ihre Rückmeldung — sagen Sie mir gerne, was Sie zögern lässt, damit ich Sie besser unterstützen kann.",
  },
};

function fallbackReply(category, lang) {
  const set = FALLBACK_REPLIES_I18N[lang] || FALLBACK_REPLIES;
  return set[category] || set.other;
}

const FALLBACK_REPLIES = {
  price: "Je comprends que le prix soit un frein. Verriez-vous un intérêt à revoir certains éléments du devis pour l'ajuster à votre budget ?",
  timing: "Merci pour votre retour — si la date proposée ne convient pas, quelles disponibilités auriez-vous ces prochains jours ?",
  scope: "Je comprends — souhaitez-vous que je retire certains éléments du devis pour l'ajuster à vos besoins réels ?",
  conditions: "Merci de cette précision, cela peut effectivement influencer le devis. Puis-je vous proposer une offre ajustée en tenant compte de ces conditions ?",
  competitor: "Je comprends votre choix. Si cela peut aider, je suis ouvert(e) à revoir notre offre — seriez-vous partant(e) d'en discuter ?",
  information: "Bien sûr, je vous réponds volontiers — n'hésitez pas à préciser votre question, je reviens vers vous rapidement.",
  thinking: "Aucun souci, prenez le temps qu'il vous faut. Je reste disponible si vous avez des questions d'ici là.",
  not_needed: "Compris, merci de nous l'avoir signalé — nous restons à disposition si votre besoin évolue.",
  other: "Merci pour votre retour — n'hésitez pas à préciser ce qui vous ferait hésiter, afin que je puisse mieux vous accompagner.",
};

/**
 * Drafts a short, ready-to-adapt reply addressing the customer's specific
 * stated objection — included in the decline notification e-mail so the
 * owner has a starting point instead of a blank page, not something sent
 * automatically: the owner still reviews/edits/sends it themselves via the
 * existing counteroffer/reply flow, same human-in-the-loop posture as
 * every other customer-facing action in this app.
 */
async function draftSuggestedReply({ category, summary, rawText, quote, customer, context, lang }) {
  const cfg = CATEGORIES[category] || CATEGORIES.other;
  if (!client) return fallbackReply(category, lang);
  const language = lang === "en" ? "en anglais" : lang === "de" ? "en allemand (Suisse, sans ß)" : "en français";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system:
        "Tu rédiges, pour le compte d'une entreprise suisse " +
        (context && context.sectorLabel ? `du secteur « ${context.sectorLabel} »` : "de nettoyage") +
        ", une courte réponse (2 à 4 phrases, " + language + ", ton chaleureux et professionnel) à un client qui a refusé un devis. " +
        "La réponse doit répondre précisément à ce que le client a dit — jamais une formule générique — et orienter vers une solution concrète adaptée à la catégorie du refus. " +
        "Ne mentionne jamais de nouveau prix ou de remise chiffrée toi-même — l'entreprise décide du montant séparément. " +
        "Ne signe pas et n'ajoute pas de formule de politesse finale (bonjour/cordialement) — juste le corps du message, prêt à être complété par l'entreprise. " +
        "Réponds uniquement avec le texte de la réponse, sans guillemets ni JSON.",
      messages: [
        {
          role: "user",
          content:
            `Catégorie de refus : ${cfg.label}.\n` +
            `Message du client : "${rawText || summary || ""}"\n` +
            (quote?.total ? `Montant du devis initial : ${quote.currency || "CHF"} ${quote.total}.\n` : "") +
            (customer?.name ? `Prénom du client : ${customer.name}.\n` : ""),
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const draft = textBlock?.text?.trim();
    return draft || fallbackReply(category, lang);
  } catch (e) {
    return fallbackReply(category, lang);
  }
}

// The two categories whose label/emoji are cleaning-flavoured get neutral
// ones when the e-mail is for a sector demo (generic = true).
function categoryView(category, generic, lang) {
  const cfg = categoryConfig(category, lang);
  if (generic && category === "conditions") {
    const label = { en: "Conditions / details of the service", de: "Bedingungen / Details der Leistung" }[lang] || "Conditions / détails de la prestation";
    return { label, emoji: "📋" };
  }
  if (generic && category === "scope") return { label: cfg.label, emoji: "✂️" };
  return { label: cfg.label, emoji: cfg.emoji };
}

module.exports = { classifyObjection, draftSuggestedReply, CATEGORIES, categoryView, categoryConfig };
