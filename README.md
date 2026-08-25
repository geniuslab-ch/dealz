# Dealz — AI sales assistant for Swiss cleaning companies

A B2B sales site + working product demo for Dealz: an AI-powered quotation assistant that cleaning
companies embed on their own website. A visitor to *that* site describes a cleaning job, answers a
few questions, and gets a real, itemized price — computed from the company's own pricing rules —
that they can accept or decline on the spot.

**This repo is two things on purpose, kept deliberately separate:**

1. **`docs/index.html`** — the actual product: a B2B sales funnel that sells Dealz *to cleaning
   company owners*. Problem → value → how it works → pricing → free demo → request installation.
2. **`docs/demo.html`** — the proof mechanism at the *end* of that funnel: the interactive quote
   experience a prospect's own customers would see, using an illustrative example company
   (SwissClean Sàrl, clearly labeled as fictional) and example pricing.

The site never mixes the two — no "I'm a customer / I'm a cleaning company" fork on the homepage.
Visitors land on the sales pitch first; the interactive demo is the climax, not the entry point.

Both pages are **entirely in French** (the target market) and this README is in English since it's
for the developer.

```
Visiteur → Comprendre Dealz → Croire Dealz → Essayer Dealz → Demander l'installation
```

## Live demo (no install, share this with anyone)

**https://geniuslab-ch.github.io/dealz/** — GitHub Pages, static hosting, no server, no API key.
This is the same `docs/` folder Express serves locally, running with zero backend: `quote-app.js`
(used only on `demo.html`) tries the real `/api/chat` first, and when that doesn't exist (static
hosting has no server at all) it transparently switches to `docs/mock-client.js` — a browser port
of `src/mock.js` — for the rest of the session. Send this URL to a prospect and the whole funnel →
demo → devis → accept/refuse flow works, for free, forever, with nothing to configure.

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

Open http://localhost:3000 for the sales funnel, or http://localhost:3000/demo.html to jump
straight to the interactive quote experience. `src/mock.js` (the server-side twin of
`docs/mock-client.js`) runs a small scripted conversation that reproduces the offer's exact
example — 85m², 3 rooms, oven + windows → **CHF 490** — and lets you click through Accept/Decline;
accepting or reaching a quote reveals the "Imaginez ceci sur VOTRE site" block with the
Request-installation / Pricing / Contact CTAs that route back into `index.html`.

To try the real conversational assistant instead, set `MOCK_MODE=false` and paste an
`ANTHROPIC_API_KEY` with available credit — everything else is identical.

## What's actually happening on the demo (real mode)

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
  in this demo (see "Not included" below). Either way, `docs/quote-app.js` fires a
  `dealz:quote-delivered` DOM event that `demo.html` listens for to reveal its closing CTA block.

This is the same example from the offer, reproduced exactly by the pricing table:

> *"85m² apartment, 3-room, 1 bathroom, oven + windows"* → **CHF 490**
> (390 fin de bail + 40 four + 60 vitres)

## Why the demo assistant never says "AI"

By design — the client asked that the quote flow (as experienced by an end customer on
`demo.html`) not be marketed as AI-based, even though the surrounding sales site on `index.html`
is unapologetically about selling an "AI sales assistant." The system prompt (`src/claude.js`)
tells the model to introduce itself as "the SwissClean quote assistant," never volunteer that it's
an AI, but answer honestly if a customer directly asks whether they're talking to a human or a
program. That's a deliberate transparency line: no AI branding in the *customer-facing* quote
copy, but no dishonesty if asked outright, and full AI branding on the *sales* copy where it's the
actual selling point.

## No fake social proof

Per the client's explicit direction, `index.html` never claims Dealz has existing customers,
reviews, or history — no "2 300+ cleanings," no star ratings, no "since 2014." The mock dashboard
section is clearly labeled **"Exemple de tableau de bord — données de démonstration."** The
interactive demo is labeled **"Démo interactive — SwissClean Sàrl, exemple fictif."** Credibility
over fabricated traction.

## Project layout

```
server.js                     Express server, exposes POST /api/chat, routes to mock or real Claude
src/claude.js                  System prompt (French), tool definition, Claude API call loop
src/mock.js                    Scripted offline conversation for server-side MOCK_MODE
src/pricingEngine.js           Deterministic price calculation, French item labels

docs/                           Served by Express *and* by GitHub Pages — same files, both places
docs/index.html                 The B2B sales funnel — Dealz's actual homepage
docs/demo.html                  The standalone interactive demo, linked from index.html's CTAs
docs/quote-app.js               The quote assistant UI (used on demo.html only): talks to
                                 /api/chat, falls back to the client-side mock when no backend
                                 answers, fires `dealz:quote-delivered` once a quote is shown
docs/mock-client.js             Browser port of src/mock.js — the GitHub Pages fallback engine
docs/pricing-engine-client.js   Browser port of src/pricingEngine.js — used by mock-client.js
docs/pricing.json               The example company's pricing rules — single source of truth
                                 (stand-in for a real client's Excel sheet), read by both the
                                 server and the browser fallback
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

## Funnel structure (`index.html`)

Hero (positioning) → problem ("combien de demandes perdez-vous ?") → business value (7 cards,
incl. the auto-Excel-sync and same-site-integration points) → how it works (4 steps) →
differentiator ("l'IA pose les questions, vos règles décident") → Excel → AI transformation →
"couche de vente, pas un remplacement" (vs. existing cleaning software) → **competitor comparison
table** → example dashboard → pricing (Pilot / Standard / Pro) → final CTA → contact / lead form
(client-side only — see "Not included"). CTA copy changes with funnel position: "Voir comment ça
marche" in the hero, "Découvrir l'expérience" after How It Works, "Essayer la démo gratuite" at
pricing and the final CTA, "Demander l'installation" as the closing ask.

**The comparison table** (Operio, Timean, Flinko, Envestis, SwissOfferten) is built from each
competitor's own public site, fetched and read directly — not guessed or invented. None of the
five offer a conversational AI that prices a job live from the company's own rules; the real
market split is: all-in-one platforms that replace your whole stack at CHF 69–499/month (Operio,
Timean) vs. Dealz adding one thing to your existing stack at CHF 49–129/month. If any competitor's
site changes, re-verify before editing the table — don't touch the numbers from memory.

**Two claims worth re-checking before this goes to a real prospect:** the hero/value-grid/step-01
copy states pricing updates sync from Excel automatically, and that Dealz embeds into the client's
*existing* site rather than replacing it. Both are true of the *intended* product (this is the
core pitch from the original commercial offer) but aren't literally wired up in this demo —
`docs/pricing.json` is a static file, not a live Excel connection. Keep the marketing claim, but
know it describes the product being sold, not (yet) this repo's current code.

`demo.html` is intentionally different: no funnel copy, just the demo intro, the chat panel, and —
once a quote is delivered — the "Imaginez ceci sur VOTRE site" block with three CTAs (Demander
l'installation / Voir les tarifs / Contacter Dealz), all linking back into `index.html`'s anchors.

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
- Persisted lead/booking storage — the `index.html` contact form and the demo's Accept/Decline are
  both client-side only right now (a confirmation message, nothing saved); wiring the lead form to
  a real inbox is a small serverless function or a third-party form backend (the repo has no
  backend for GitHub Pages to call, so this needs a hosted endpoint either way)
- Auth, rate limiting, and abuse protection on `/api/chat`
- A real Excel-upload → `pricing.json` conversion step
- Real dashboard data — the numbers on `index.html` are hardcoded and clearly labeled as an example
