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
async function classifyObjection(text) {
  if (!text || !text.trim()) return { category: "other", summary: "" };

  if (client) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 100,
        system:
          "Tu classes le motif de refus d'un devis de nettoyage en une seule catégorie parmi : " +
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

module.exports = { classifyObjection, CATEGORIES };
