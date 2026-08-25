const Anthropic = require("@anthropic-ai/sdk");
const { calculateQuote } = require("./pricingEngine");
const pricing = require("../docs/pricing.json");

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";

const SYSTEM_PROMPT = `Tu es l'assistant de devis du site web de SwissClean Sàrl, une entreprise de
nettoyage suisse. Tu t'exprimes toujours en français, sur un ton chaleureux et professionnel.

Ta mission : discuter naturellement avec le visiteur, ne poser que les questions de suivi
nécessaires, puis, une fois que tu as assez d'informations, appeler l'outil "calculate_quote" pour
obtenir un prix exact depuis le moteur de tarification de l'entreprise. Ne calcule et n'invente
jamais un prix toi-même — l'outil est la seule source de vérité pour les tarifs.

Ne te présente jamais spontanément comme une intelligence artificielle ou un robot — présente-toi
simplement comme l'assistant de devis de SwissClean. Si le client te demande explicitement si tu es
un humain ou un programme automatisé, réponds honnêtement que tu es un assistant automatisé de
SwissClean, sans en faire l'argument central de la conversation.

Prestations disponibles :
- "end_of_tenancy" (nettoyage de fin de bail) : facturé selon la taille du logement en pièces
  (valeurs acceptées : 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5 — convention suisse "X.5 pièces", où un
  3.5 pièces correspond à 3 chambres/pièces de vie + cuisine). Si le client donne une surface en m²
  plutôt qu'un nombre de pièces, estime le nombre de pièces le plus proche (environ : 1 pièce ≈
  30m², 2 pièces ≈ 50m², 3 pièces ≈ 70-90m², 4 pièces ≈ 100-120m²) et précise cette estimation
  lorsque tu présentes le devis.
- "regular_cleaning" (nettoyage régulier) : facturé à l'heure — demande combien d'heures le client
  estime nécessaires, ou estime à partir de la surface (environ 25-30m² par heure).

Options disponibles : nettoyage du four, nettoyage des vitres, nettoyage du frigo, shampoing
moquette (demande combien de pièces sont concernées).

Ne demande la distance de déplacement que si le client mentionne un lieu éloigné de la zone
habituelle de l'entreprise ; sinon, ignore ce point.

Trois autres détails peuvent influencer le prix, mais ne les demande QUE quand c'est pertinent dans
le fil de la conversation (jamais comme une liste de questions systématique) :
- L'état général du logement (normal, sale, très sale/encombré) — utile surtout pour un nettoyage de
  fin de bail ou si le client mentionne spontanément que c'est très sale.
- Si l'option "nettoyage des vitres" est demandée et que le client mentionne des vitres difficiles
  d'accès (baies vitrées, hauteur, etc.), signale qu'un supplément s'applique.
- Le nombre d'étages sans ascenseur, seulement si le client mentionne un immeuble sans ascenseur ou
  un étage élevé.
Si rien de tout cela n'est mentionné, n'en parle pas et laisse ces champs vides.

Pose des questions courtes et naturelles — une ou deux à la fois, jamais un long formulaire. Une
fois que tu as tous les détails du service (type de prestation, taille, options), demande le nom du
client, son e-mail, son téléphone, et l'adresse du logement à nettoyer — en une ou deux questions
groupées, pas un formulaire — avant d'appeler calculate_quote. Ces informations servent à
personnaliser le devis et à pouvoir recontacter le client ; inclus-les dans l'appel à
calculate_quote. Si le client refuse de les donner ou ne répond pas clairement, n'insiste pas plus
de deux fois — appelle quand même calculate_quote avec les champs que tu as, le reste vide.

Une fois que tu as appelé calculate_quote et reçu un résultat, présente-le clairement comme un devis
détaillé et chiffré. Précise explicitement qu'il s'agit d'un devis ferme et réel (pas juste une
estimation indicative) et que le client peut l'accepter ou le refuser directement dans la
conversation. Si l'outil renvoie des avertissements, mentionne-les brièvement et simplement, sans
jargon technique.`;

const CALCULATE_QUOTE_TOOL = {
  name: "calculate_quote",
  description:
    "Compute an exact cleaning price quote from structured job details, using the company's " +
    "pricing rules. Call this once — and only once — you have gathered enough information from " +
    "the customer to fill in the fields confidently.",
  input_schema: {
    type: "object",
    properties: {
      service_type: {
        type: "string",
        enum: ["end_of_tenancy", "regular_cleaning"],
      },
      rooms: {
        type: "string",
        description:
          "Apartment size in rooms using the Swiss convention, e.g. '3', '3.5', '4.5'. " +
          "Required for end_of_tenancy.",
      },
      hours: {
        type: "number",
        description: "Estimated cleaning hours. Required for regular_cleaning.",
      },
      addons: {
        type: "array",
        items: { type: "string", enum: ["oven", "windows", "fridge", "carpet_shampoo"] },
      },
      carpet_rooms: {
        type: "number",
        description: "Number of rooms needing carpet shampoo, if 'carpet_shampoo' is in addons.",
      },
      distance_km: {
        type: "number",
        description: "Approximate travel distance in km from the company's base, if known.",
      },
      condition: {
        type: "string",
        enum: ["normal", "dirty", "very_dirty"],
        description:
          "General condition/cleanliness of the property, only if the customer mentioned it " +
          "(e.g. very dirty, cluttered, needs deep cleaning). Omit if not discussed.",
      },
      difficult_access_windows: {
        type: "boolean",
        description:
          "True only if 'windows' is in addons AND the customer mentioned hard-to-reach windows " +
          "(bay windows, height, etc). Omit otherwise.",
      },
      floors_no_elevator: {
        type: "number",
        description:
          "Number of floors to climb without an elevator, only if the customer mentioned no " +
          "elevator or a high floor. Omit if not discussed.",
      },
      customer_name: { type: "string", description: "Customer's name, if provided." },
      customer_email: { type: "string", description: "Customer's email, if provided." },
      customer_phone: { type: "string", description: "Customer's phone number, if provided." },
      customer_address: {
        type: "string",
        description: "Address of the property to be cleaned, if provided.",
      },
    },
    required: ["service_type"],
  },
};

/**
 * Runs one turn of the conversation. `history` is the full message array the
 * client maintains (no server-side session state — keeps the demo stateless).
 * Returns { messages: [...new assistant/tool messages to append...], quote: {...} | null }
 */
async function runTurn(history) {
  const messages = [...history];
  let quote = null;

  for (let i = 0; i < 4; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [CALCULATE_QUOTE_TOOL],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      break;
    }

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];

    for (const block of toolUseBlocks) {
      if (block.name === "calculate_quote") {
        const { customer_name, customer_email, customer_phone, customer_address, ...pricingInput } =
          block.input;
        quote = calculateQuote(pricingInput);
        quote.customer = {
          name: customer_name || "",
          email: customer_email || "",
          phone: customer_phone || "",
          address: customer_address || "",
        };
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(quote),
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Unknown tool.",
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return { messages: messages.slice(history.length), quote, model: MODEL, currency: pricing.currency };
}

module.exports = { runTurn, MODEL };
