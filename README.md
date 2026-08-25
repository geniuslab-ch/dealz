# Dealz — AI Cleaning Quote (demo)

A working demo of the AI-powered quote assistant described in the *AI Cleaning Quote — Commercial
Offer*: a chat widget for a cleaning company's website that asks a customer a few questions and
returns an instant, itemized price — computed from the company's own pricing rules, not guessed by
the AI.

```
Customer → AI Questions → Pricing Engine → Price → Offer / Booking
```

## What's actually happening

- **The AI (Claude) only asks questions and reads the customer's answers.** It never invents a
  price.
- Once it has enough information, it calls a `calculate_quote` tool with structured fields
  (service type, room count, add-ons, distance…).
- **The pricing engine** (plain JavaScript, [`src/pricingEngine.js`](src/pricingEngine.js)) is a
  deterministic function that reads [`src/pricing.json`](src/pricing.json) and computes the exact
  total. This is the "Pricing Engine" box in the diagram — it's the source of truth, not the LLM.
- The result is returned to the frontend as a structured quote (itemized, in CHF) and rendered as
  a quote card in the chat.

This is the same example from the offer, reproduced exactly by the pricing table:

> *"85m² apartment, 3-room, 1 bathroom, oven + windows"* → **CHF 490**
> (390 end-of-tenancy + 40 oven + 60 windows)

## Project layout

```
server.js              Express server, exposes POST /api/chat
src/claude.js           System prompt, tool definition, Claude API call loop
src/pricingEngine.js    Deterministic price calculation
src/pricing.json        The company's pricing rules (stand-in for their Excel sheet)
public/index.html       A demo "client website" with the widget embedded
public/widget.js        The embeddable chat widget (vanilla JS, no build step)
public/styles.css       Widget + demo page styling
```

## Running it locally

```bash
npm install
cp .env.example .env
# edit .env and paste your ANTHROPIC_API_KEY (https://console.anthropic.com/)
npm start
```

Open http://localhost:3000 — it's a mock cleaning-company homepage with the chat bubble in the
bottom-right corner. Click it and describe a job.

## Swapping in a real client's pricing

For the demo, pricing rules live in [`src/pricing.json`](src/pricing.json) as a small hand-written
table (per-room rates for end-of-tenancy cleaning, per-hour rate for regular cleaning, flat add-on
fees, distance-based travel fee). In a real deployment, this file is what you'd generate from a
client's actual Excel price list — the AI and pricing-engine code don't need to change, only the
data.

## Model choice & cost

Defaults to **`claude-haiku-4-5`** (set in `.env` via `CLAUDE_MODEL`) — it's more than capable for
a structured Q&A-then-calculate flow like this, and keeps cost per conversation around
**$0.01–0.02**. Swap to `claude-sonnet-5` or `claude-opus-5` in `.env` if you want more nuanced
conversation handling; expect roughly 3–5x the cost per conversation in exchange.

## How this maps to "one solution, many clients"

This demo is intentionally structured so a new client doesn't require new code:

- **Pricing** is data (`pricing.json`), not logic — a new client's price list becomes a new JSON
  file (or a row in a database, DB-backed, per-tenant in a real multi-tenant deployment).
- **The widget** (`public/widget.js` + `styles.css`) is a single embeddable script — the same file
  can be dropped into any client's site, pointed at their own `/api/chat` endpoint or tenant ID.
- **The backend** (`server.js`, `src/claude.js`) is shared infrastructure — one deployment can
  serve many clients by looking up the right pricing file/config per request (not implemented in
  this single-tenant demo, but the natural next step).

## Not included in this demo (out of scope for a proof of concept)

- Multi-tenant routing (one pricing config per client, selected by domain/API key)
- Persisted lead/booking storage (currently nothing is saved — it's a stateless demo)
- Auth, rate limiting, and abuse protection on `/api/chat`
- A real Excel-upload → `pricing.json` conversion step
