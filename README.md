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

## Live demo (no install, share this with anyone)

**https://geniuslab-ch.github.io/dealz/** — GitHub Pages, static hosting, no server, no API key.
This is the same `docs/` folder Express serves locally, running with zero backend: `quote-app.js`
tries the real `/api/chat` first, and when that doesn't exist (static hosting has no server at all)
it transparently switches to `docs/mock-client.js` — a browser port of `src/mock.js` — for the rest
of the session. Send this URL to a prospect and the whole devis → accept/refuse flow works, for
free, forever, with nothing to configure.

*(One-time setup note for the repo owner: GitHub Pages needs enabling once at
Settings → Pages → Source: Deploy from a branch → Branch: `main`, folder: `/docs` → Save. Takes
about a minute to go live after that; every push to `main` updates it automatically.)*

## Run it locally — no API key needed

```bash
npm install
cp .env.example .env
# leave MOCK_MODE=true (already the default) — no ANTHROPIC_API_KEY required
npm start
```

Open http://localhost:3000, click **✨ Obtenir un devis**, and answer the three canned prompts.
`src/mock.js` (the server-side twin of `docs/mock-client.js`) runs a small scripted conversation
that reproduces the offer's exact example — 85m², 3 rooms, oven + windows → **CHF 490** — and lets
you click through Accept/Decline.

To try the real conversational assistant instead, set `MOCK_MODE=false` and paste an
`ANTHROPIC_API_KEY` with available credit — everything else is identical.

## What's actually happening (real mode)

- **Claude only asks questions and reads the customer's answers.** It never invents a price.
- Once it has enough information, it calls a `calculate_quote` tool with structured fields
  (service type, room count, add-ons, distance…).
- **The pricing engine** (plain JavaScript, [`src/pricingEngine.js`](src/pricingEngine.js)) is a
  deterministic function that reads [`docs/pricing.json`](docs/pricing.json) and computes the exact
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
server.js                     Express server, exposes POST /api/chat, routes to mock or real Claude
src/claude.js                  System prompt (French), tool definition, Claude API call loop
src/mock.js                    Scripted offline conversation for server-side MOCK_MODE
src/pricingEngine.js           Deterministic price calculation, French item labels

docs/                           Served by Express *and* by GitHub Pages — same files, both places
docs/index.html                 Full demo site (French) — Accueil / Prestations / À propos / Obtenir un devis / Contact
docs/tabs.js                    Tab navigation (no page reloads, no framework)
docs/quote-app.js               The quote assistant UI: talks to /api/chat, falls back to the
                                 client-side mock when no backend answers (see docs/mock-client.js)
docs/mock-client.js             Browser port of src/mock.js — the GitHub Pages fallback engine
docs/pricing-engine-client.js   Browser port of src/pricingEngine.js — used by mock-client.js
docs/pricing.json               The company's pricing rules — single source of truth (stand-in for
                                 their Excel sheet), read by both the server and the browser fallback
docs/styles.css                 Site + chat styling, palette taken from docs/images/dealz-logo.png
docs/images/                    Dealz logo (full + small nav version)
```

`docs/` is named that (not `public/`) specifically so GitHub Pages can serve it directly — Pages
only supports `/` or `/docs` as a source folder, and using `/docs` lets the exact same directory
back both the local Express app and the public static site, with zero duplication.

**Keeping the two engines in sync:** `src/pricingEngine.js` / `src/mock.js` (Node) and
`docs/pricing-engine-client.js` / `docs/mock-client.js` (browser) are deliberately near-identical
ports — same logic, no shared module, because the browser copy has to run with no build step and no
bundler. If you change the pricing logic or the scripted questions, update both pairs. They're
small and self-contained (~90 and ~60 lines) specifically to keep that hand-sync low-risk.

## Design

- The quote flow lives on its own **"Obtenir un devis" tab** rather than a floating chat bubble —
  it reads as a real page of the site, next to Accueil / Prestations / À propos / Contact, with a
  "comment ça marche" panel next to the chat itself.
- Colors (navy, blue, light blue, with red used only as a small Swiss accent) are pulled from the
  Dealz logo rather than an arbitrary palette.
- A dark **"DÉMO"** banner sits above the nav on every page — this is a fictional company, and that
  needs to stay obvious.

## Swapping in a real client's pricing

For the demo, pricing rules live in [`docs/pricing.json`](docs/pricing.json) as a small hand-written
table (per-room rates for end-of-tenancy cleaning, per-hour rate for regular cleaning, flat add-on
fees, distance-based travel fee). In a real deployment, this file is what you'd generate from a
client's actual Excel price list — the assistant and pricing-engine code don't need to change, only
the data (and the item labels in `pricingEngine.js` / `pricing-engine-client.js` if the client isn't
French-speaking).

## Model choice & cost

Defaults to **`claude-haiku-4-5`** (set in `.env` via `CLAUDE_MODEL`) — it's more than capable for
a structured Q&A-then-calculate flow like this, and keeps cost per conversation around
**$0.01–0.02**. Swap to `claude-sonnet-5` or `claude-opus-5` in `.env` if you want more nuanced
conversation handling; expect roughly 3–5x the cost per conversation in exchange.

## How this maps to "one solution, many clients"

This demo is intentionally structured so a new client doesn't require new code:

- **Pricing** is data (`pricing.json`), not logic — a new client's price list becomes a new JSON
  file (or a row in a database, DB-backed, per-tenant in a real multi-tenant deployment).
- **The assistant UI** (`docs/quote-app.js` + `styles.css`) mounts into any page that has a
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
