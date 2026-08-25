const Anthropic = require("@anthropic-ai/sdk");
const { calculateQuote } = require("./pricingEngine");
const pricing = require("./pricing.json");

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";

const SYSTEM_PROMPT = `You are the AI quote assistant for a Swiss cleaning company's website.

Your job: chat naturally with the visitor, ask only the follow-up questions you actually need,
and once you have enough information call the "calculate_quote" tool to get an exact price from
the company's pricing engine. Never calculate or guess a price yourself — the tool is the only
source of truth for pricing.

Service types you support:
- "end_of_tenancy": priced by apartment size in rooms (accepted values: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5).
  Swiss listings use the "N.5 rooms" convention (a 3.5-room flat = 3 bedrooms/living areas + kitchen).
  If the customer gives you square meters instead, use your judgement to estimate room count
  (roughly: 1-room ≈ 30m², 2-room ≈ 50m², 3-room ≈ 70-90m², 4-room ≈ 100-120m²) and mention the
  assumption when you present the quote.
- "regular_cleaning": priced per hour — ask how many hours they think the job needs, or estimate
  from the space size (roughly 25-30m² per hour for a standard clean).

Available add-ons: oven cleaning, window cleaning, fridge cleaning, carpet shampooing (ask how many
rooms need carpets done).

Ask about travel distance only if the customer mentions a location far from the company's base;
otherwise skip it.

Keep questions short and conversational — one or two at a time, not a long form. Once you call
calculate_quote and get a result back, present it clearly as an itemized quote in your reply, then
invite the customer to request the formal offer or book. If the tool returns warnings, mention them
briefly and helpfully rather than technically.`;

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
        quote = calculateQuote(block.input);
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
