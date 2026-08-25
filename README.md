# Dealz — Devis de nettoyage instantané (demo)

A working demo of the quote assistant described in the *AI Cleaning Quote — Commercial Offer*: a
customer answers a few questions on a cleaning company's website and gets a real, itemized price —
computed from the company's own pricing rules, that they can accept or decline on the spot.

The **customer-facing site is entirely in French** (SwissClean Sàrl's primary market) and never
labels the assistant as "AI" — it just reads as the company's normal quote flow. This README is in
English since it's for the developer.

```
Client → Questions → Moteur de tarification → Prix → Devis accepté / refusé
```

## Try it in 30 seconds — no API key needed

```bash
npm install
cp .env.example .env
# leave MOCK_MODE=true (already the default) — no ANTHROPIC_API_KEY required
npm start
```

Open http://localhost:3000, click **✨ Obtenir un devis**, and answer the three canned prompts.
`src/mock.js` runs a small scripted conversation (no Anthropic call at all) that reproduces the
offer's exact example — 85m², 3 rooms, oven + windows → **CHF 490** — and lets you click through
Accept/Decline. It's a real static+Express app, so this also works if you just want to preview the
design without touching any AI code.

To try the real conversational assistant instead, set `MOCK_MODE=false` and paste an
`ANTHROPIC_API_KEY` with available credit — everything else is identical.

## What's actually happening (real mode)

- **Claude only asks questions and reads the customer's answers.** It never invents a price.
- Once it has enough information, it calls a `calculate_quote` tool with structured fields
  (service type, room count, add-ons, distance…).
- **The pricing engine** (plain JavaScript, [`src/pricingEngine.js`](src/pricingEngine.js)) is a
  deterministic function that reads [`src/pricing.json`](src/pricing.json) and computes the exact
  total. This is the "moteur de tarification" box in the flow — it's the source of truth, not the
  model.
- The result is returned to the frontend as a structured quote and rendered as a quote card with
  **Accepter / Refuser** buttons. Accepting shows a confirmation that the request was sent to the
  company by email and added to its Google Agenda — text only, no real email/calendar integration
  in this demo (see "Not included" below).

This is the same example from the offer, reproduced exactly by the pricing table:

> *"85m² apartment, 3-room, 1 bathroom, oven + windows"* → **CHF 490**
> (390 fin de bail + 40 four + 60 vitres)

## Why the assistant never says "AI"

By design — the client asked that the quote flow not be marketed as AI-based. The system prompt
(`src/claude.js`) tells the model to introduce itself as "the SwissClean quote assistant," never
volunteer that it's an AI, but answer honestly if a customer directly asks whether they're talking
to a human or a program. That's a deliberate transparency line: no AI branding in the marketing
copy, but no dishonesty if asked outright.

## Project layout

```
server.js              Express server, exposes POST /api/chat, routes to mock or real Claude
src/claude.js           System prompt (French), tool definition, Claude API call loop
src/mock.js             Scripted offline conversation for MOCK_MODE — no API key needed
src/pricingEngine.js    Deterministic price calculation, French item labels
src/pricing.json        The company's pricing rules (stand-in for their Excel sheet)
public/index.html       Full demo site (French) — Accueil / Prestations / À propos / Obtenir un devis / Contact
public/tabs.js          Tab navigation (no page reloads, no framework)
public/quote-app.js     The quote assistant UI, incl. Accept/Decline handling
public/styles.css       Site + chat styling, palette taken from public/images/dealz-logo.png
public/images/          Dealz logo (full + small nav version)
```

## Design

- The quote flow lives on its own **"Obtenir un devis" tab** rather than a floating chat bubble —
  it reads as a real page of the site, next to Accueil / Prestations / À propos / Contact, with a
  "comment ça marche" panel next to the chat itself.
- Colors (navy, blue, light blue, with red used only as a small Swiss accent) are pulled from the
  Dealz logo rather than an arbitrary palette.
- A dark **"DÉMO"** banner sits above the nav on every page — this is a fictional company, and that
  needs to stay obvious.

## Swapping in a real client's pricing

For the demo, pricing rules live in [`src/pricing.json`](src/pricing.json) as a small hand-written
table (per-room rates for end-of-tenancy cleaning, per-hour rate for regular cleaning, flat add-on
fees, distance-based travel fee). In a real deployment, this file is what you'd generate from a
client's actual Excel price list — the assistant and pricing-engine code don't need to change, only
the data (and the item labels in `pricingEngine.js` if the client isn't French-speaking).

## Model choice & cost

Defaults to **`claude-haiku-4-5`** (set in `.env` via `CLAUDE_MODEL`) — it's more than capable for
a structured Q&A-then-calculate flow like this, and keeps cost per conversation around
**$0.01–0.02**. Swap to `claude-sonnet-5` or `claude-opus-5` in `.env` if you want more nuanced
conversation handling; expect roughly 3–5x the cost per conversation in exchange.

## How this maps to "one solution, many clients"

This demo is intentionally structured so a new client doesn't require new code:

- **Pricing** is data (`pricing.json`), not logic — a new client's price list becomes a new JSON
  file (or a row in a database, DB-backed, per-tenant in a real multi-tenant deployment).
- **The assistant UI** (`public/quote-app.js` + `styles.css`) mounts into any page that has a
  `#dealz-messages` / `#dealz-input` / `#dealz-send` — drop that markup into a client's own "Get a
  Quote" page and point it at their `/api/chat` endpoint or tenant ID.
- **The backend** (`server.js`, `src/claude.js`) is shared infrastructure — one deployment can
  serve many clients by looking up the right pricing file/config per request (not implemented in
  this single-tenant demo, but the natural next step).

## Not included in this demo (out of scope for a proof of concept)

- Multi-tenant routing (one pricing config per client, selected by domain/API key)
- Real email and Google Calendar integration on Accept (currently just a confirmation message —
  wiring this up is a Gmail/Calendar API call keyed off the accepted quote + customer contact info,
  collected as an extra step before Accept in a production version)
- Persisted lead/booking storage (currently nothing is saved — it's a stateless demo)
- Auth, rate limiting, and abuse protection on `/api/chat`
- A real Excel-upload → `pricing.json` conversion step
