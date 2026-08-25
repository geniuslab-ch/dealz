const Anthropic = require("@anthropic-ai/sdk");

const CATEGORIES = {
  price: "Prix trop élevé",
  timing: "Date/horaire ne convient pas",
  scope: "Ne veut pas tous les services",
  thinking: "Doit réfléchir",
  competitor: "A reçu une autre offre",
  question: "A une autre question",
  other: "Autre",
};

const MOCK_MODE = process.env.MOCK_MODE === "true";
const client = MOCK_MODE ? null : new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";

/**
 * Classifies a free-text decline reason into one of CATEGORIES. When a chip
 * was clicked (not free text), the category is already known and this isn't
 * called. Uses a real Claude call outside MOCK_MODE (cheap, Haiku); falls
 * back to a keyword heuristic in MOCK_MODE so classification still works
 * with zero API key / credit.
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
          "price, timing, scope, thinking, competitor, question, other. Réponds uniquement avec " +
          'un objet JSON strict: {"category": "...", "summary": "résumé en une courte phrase"}.',
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
  if (/autre (offre|entreprise|soci[ée]t[ée]|devis)|concurrent|ailleurs|moins cher|propos[ée]/.test(t))
    return { category: "competitor", summary: text };
  if (/cher|prix|budget|co[uû]te?|francs?\b|chf/.test(t)) return { category: "price", summary: text };
  if (/date|horaire|jour|semaine|disponib|convien|septembre|octobre|novembre|d[ée]cembre|janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t/.test(t))
    return { category: "timing", summary: text };
  if (/pas besoin|sans le|retirer|enlever/.test(t)) return { category: "scope", summary: text };
  if (/r[ée]fl[ée]chir|penser|plus tard/.test(t)) return { category: "thinking", summary: text };
  if (/\?/.test(t)) return { category: "question", summary: text };
  return { category: "other", summary: text };
}

module.exports = { classifyObjection, CATEGORIES };
