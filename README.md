# Dealz — AI sales assistant for Swiss cleaning companies

A B2B sales site + working product demo for Dealz: an AI-powered quotation assistant that cleaning
companies embed on their own website. A visitor to *that* site describes a cleaning job, answers a
few questions, and gets a real, itemized price — computed from the company's own pricing rules —
that they can accept or decline on the spot.

**This repo is two things on purpose, kept deliberately separate:**

1. **`docs/index.html`** — the actual product: a B2B sales funnel that sells Dealz *to cleaning
   company owners*. Problem → value → how it works → pricing → free demo → request installation.
2. **`docs/demo.html`** — the proof mechanism at the *end* of that funnel: a full illustrative
   cleaning-company website (SwissClean Sàrl, clearly labeled as fictional) with the Dealz quote
   widget embedded in it — the exact experience a prospect's own customers would see, styled
   differently from Dealz's own brand on purpose (see "Two visual identities" below).

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
  **Accepter / Refuser** buttons. `docs/quote-app.js` fires a `dealz:quote-delivered` DOM event
  that `demo.html` listens for to reveal its closing CTA block.
- **Accept** asks for name/e-mail/phone/address, then calls `POST /api/accept`, which sends real
  confirmation e-mails (to customer + company) and returns a **"Add to Google Calendar" link** —
  see "The sales loop" below.
- **Decline** doesn't just end the conversation — it walks through the full objection → human
  handoff → counteroffer loop described next.

This is the same example from the offer, reproduced exactly by the pricing table:

> *"85m² apartment, 3-room, 1 bathroom, oven + windows"* → **CHF 490**
> (390 fin de bail + 40 four + 60 vitres)

## The sales loop: "Dealz doesn't stop at no"

The core differentiator isn't the AI quote — every competitor will have one eventually. It's what
happens after a customer declines:

```
Devis → Client refuse → Dealz demande pourquoi → E-mail à l'entreprise avec le contexte complet
→ L'entreprise décide → Contre-offre → Dealz recontacte le client → Accepté → E-mail + Agenda
```

**1. Objection capture** (`docs/quote-app.js`) — clicking Refuser shows six objection chips (prix /
date / périmètre / réflexion / concurrent / question) plus a free-text field, in a soft,
non-aggressive tone ("Auriez-vous deux minutes pour me dire ce qui ne convenait pas…").

**2. Classification** (`src/objections.js`) — a chip click already carries its category; free text
gets classified into the same six categories via a cheap Claude Haiku call in real mode, or a
keyword heuristic in `MOCK_MODE` (zero API key needed either way).

**3. Human handoff by e-mail, no dashboard** (`src/notifications.js`, `POST /api/decline`) — the
company receives "🔴 Devis refusé — action possible": customer info, the original quote, the
objection category, the client's own words, and a **counteroffer link**. This is the entire
"company interface" for this feature — no login, no list to check.

**4. Counteroffer, owner-controlled** (`docs/counteroffer.html`, `GET/POST /api/counteroffer/:token`)
— a single-purpose page (not a dashboard) showing the context and one input: the CHF amount to
counter with, plus an optional message. Nothing is suggested or auto-calculated — the business
owner always decides the number, deliberately (an AI-suggested discount that a rushed owner
approves without checking margin is a real way to erode a business's own pricing — deferred on
purpose). Submitting emails
the customer a link to `docs/offer.html`.

**5. Customer responds** (`docs/offer.html`, `GET /api/offer/:token`, `POST /api/offer/:token/respond`)
— shows the new price, Accepter/Refuser. Accepting triggers the same booking-confirmation flow as
a direct accept.

**6. Booking confirmation** (`sendBookingConfirmation` in `src/notifications.js`) — e-mails both
parties and includes a **Google Calendar "add event" link**
(`calendar.google.com/calendar/render?...`). This is a deliberate MVP simplification over writing
directly to the company's Calendar via the Calendar API, which needs per-company OAuth consent —
real, correctly-deferred scope. A one-click add-to-calendar link needs zero credentials and ships
today.

**Persistence:** pending decline/counteroffer state lives in an in-memory `Map`
([`src/store.js`](src/store.js)), not a database — tokens expire after 48h and are lost on server
restart. Fine for a demo/MVP; swap for Redis or Postgres before real production traffic.

**E-mail sending is real code with a graceful dry-run fallback** (`src/notifications.js`): if
`SMTP_HOST` isn't set in `.env`, every "sent" e-mail is logged to the server console instead
(clearly marked `[EMAIL SIMULÉ]`, including any links) — so the entire loop above can be run and
verified end to end with zero email credentials. Set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`
(any provider — Gmail app password, Resend, Postmark, your own mail server) to start sending for
real, no code changes needed.

**This whole loop needs a real backend and cannot run on GitHub Pages** — email and calendar links
are inherently server-side. The static/GitHub-Pages version of `demo.html` still lets a visitor
click through objection chips (good UX, real product feel) but shows an honest "en conditions
réelles, ceci serait envoyé par e-mail…" message instead of calling the API, since there's no
server there to call.

## Why the demo assistant never says "AI"

By design — the client asked that the quote flow (as experienced by an end customer on
`demo.html`) not be marketed as AI-based, even though the surrounding sales site on `index.html`
is unapologetically about selling an "AI sales assistant." The system prompt (`src/claude.js`)
tells the model to introduce itself as "the SwissClean quote assistant," never volunteer that it's
an AI, but answer honestly if a customer directly asks whether they're talking to a human or a
program. That's a deliberate transparency line: no AI branding in the *customer-facing* quote
copy, but no dishonesty if asked outright, and full AI branding on the *sales* copy where it's the
actual selling point.

## No fake social proof (on `index.html` — Dealz's own site)

Per the client's explicit direction, `index.html` never claims Dealz has existing customers,
reviews, or history — no "2 300+ cleanings," no star ratings, no "since 2014." The mock dashboard
section is clearly labeled **"Exemple de tableau de bord — données de démonstration."** This rule
is specifically about Dealz's own traction claims. `demo.html`'s fictional SwissClean company *does*
show illustrative flavor text like "4.9★ / 2 300+ nettoyages / depuis 2014" — that's fine, it's
plausible content for a hypothetical example company, not a claim about Dealz, and the page is
bannered as a demo throughout.

## Two visual identities, on purpose

`index.html` (Dealz's own site) uses Dealz's navy/blue palette (`styles.css`). `demo.html` (the
fictional SwissClean site) uses a distinct teal/coral/yellow palette (`docs/demo.css`) — a
different "host site" brand. The chat widget itself (`.dealz-*`, `.quote-panel`, `.quote-side`)
keeps its Dealz navy/blue look regardless of which page it's on. The contrast is the point: it
visually proves "this is a different company's site, with the Dealz widget embedded in it," rather
than looking like one continuous Dealz-branded experience.

## Project layout

```
server.js                     Express server: /api/chat, /api/accept, /api/decline,
                                /api/counteroffer/:token, /api/offer/:token
src/claude.js                  System prompt (French), tool definition, Claude API call loop
src/mock.js                    Scripted offline conversation for server-side MOCK_MODE
src/pricingEngine.js           Deterministic price calculation, French item labels
src/objections.js              Classifies a decline reason into 6 categories (Claude Haiku in real
                                mode, keyword heuristic in MOCK_MODE)
src/notifications.js           E-mail sending (real via SMTP, or logged to console when SMTP isn't
                                configured) + Google Calendar "add event" link builder
src/store.js                   In-memory token store for pending decline/counteroffer state —
                                swap for a real DB before production traffic (see "The sales loop")

docs/                           Served by Express *and* by GitHub Pages — same files, both places
docs/index.html                 The B2B sales funnel — Dealz's actual homepage
docs/demo.html                  The fictional SwissClean website with the Dealz widget embedded —
                                 tabs (Accueil/Prestations/À propos/Devis/Contact), its own demo
                                 banner, its own tab-switcher (docs/demo-tabs.js)
docs/demo.css                   SwissClean's distinct teal/coral/yellow "host site" chrome — kept
                                 separate from styles.css on purpose (see "Two visual identities")
docs/demo-tabs.js               Minimal tab-switcher scoped to demo.html's nav
docs/quote-app.js               The quote assistant UI (used on demo.html's "Devis" tab): talks to
                                 /api/chat, falls back to the client-side mock when no backend
                                 answers, fires `dealz:quote-delivered` once a quote is shown
docs/mock-client.js             Browser port of src/mock.js — the GitHub Pages fallback engine
docs/pricing-engine-client.js   Browser port of src/pricingEngine.js — used by mock-client.js
docs/pricing.json               The example company's pricing rules — single source of truth
                                 (stand-in for a real client's Excel sheet), read by both the
                                 server and the browser fallback
docs/counteroffer.html          Owner-facing single-action page: view objection context, send a
                                 counteroffer. Needs the real backend (no static fallback)
docs/offer.html                 Customer-facing page for a countered offer: view + accept/decline.
                                 Needs the real backend (no static fallback)
docs/styles.css                 Dealz's own site + the shared chat-widget styling, palette taken
                                 from docs/images/dealz-logo.png
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

Hero (positioning) → problem ("combien de demandes perdez-vous ?") → business value (8 cards in a
4×2 grid — `.cols-4`, incl. the auto-Excel-sync, same-site-integration, and no-per-lead-fee points)
→ how it works (4 steps) → **"Excel → IA → devis" transform-flow**: a real-Excel-styled sheet →
a mock chat conversation → a mock PDF offer with Accepter/Refuser buttons, captioned explicitly
that the CHF shown is *the cleaning customer's* price, not Dealz's own price (this used to be two
separate, redundant sections — merged into one linear 3-panel story) → "couche de vente, pas un
remplacement" (vs. existing cleaning software) → **competitor comparison table** (3×2 dashboard
grid — `.dash-grid`) → **pricing (Capture / Convert / Automate)** → final CTA → contact / lead form
(client-side only — see "Not included"). CTA copy changes with funnel position: "Voir comment ça
marche" in the hero, "Découvrir l'expérience" after How It Works, "Essayer la démo gratuite" at
pricing and the final CTA, "Demander l'installation" as the closing ask.

**Pricing is outcome-based, not feature-count-based** (per the pricing-specialist critique this
shipped from): Capture (CHF 49/mo) covers the whole core loop — integration, AI conversation,
deterministic pricing, itemized quote, accept/decline, e-mail confirmation, calendar link. Convert
(CHF 79/mo, recommended) adds the actual differentiator — the objection → counteroffer sales loop.
Automate (CHF 149/mo) is deliberately narrow: only things that become real needs once a company has
more than one person taking bookings (shared calendar, real Excel sync, white-glove install,
priority support) — not a grab-bag of unrelated features padded on to make the top tier look
bigger. A single unified one-time setup fee (CHF 199–499, scaled by pricing-grid complexity) applies
across all three tiers, shown once below the cards rather than baked into each one.

**Why CHF 490 (the example client quote) still gets an explicit caption:** it's the canonical
worked example from the original commercial offer (390 fin de bail + 40 four + 60 vitres = 490,
matching what the live demo actually computes) — restructuring Dealz's own pricing to monthly
tiers + a setup *range* removed the exact-number collision that existed when Dealz's own Pilot
setup fee was also a flat CHF 490, but the "prix pour votre client" caption stayed anyway: it's good
practice regardless, and cheaper to keep than to re-verify every place "CHF 490" is quoted as the
worked example (including this README) if the number ever needs to move.

**The comparison table** (Operio, Timean, Flinko, Envestis, SwissOfferten) is built from each
competitor's own public site, fetched and read directly — not guessed or invented. None of the
five offer a conversational AI that prices a job live from the company's own rules; the real
market split is: all-in-one platforms that replace your whole stack at CHF 69–499/month (Operio,
Timean) vs. Dealz adding one thing to your existing stack at CHF 49–129/month. If any competitor's
site changes, re-verify before editing the table — don't touch the numbers from memory.

**Two remaining claims worth re-checking before this goes to a real prospect** (the accept/decline/
counteroffer/e-mail/calendar loop below is now real, working code — these two aren't yet): the
hero/value-grid/step-01 copy states pricing updates sync from Excel automatically, and that Dealz
embeds into the client's *existing* site rather than replacing it. Both are true of the *intended*
product (this is the core pitch from the original commercial offer, and "Automate" tier explicitly
sells real Excel sync) but aren't literally wired up yet — `docs/pricing.json` is a static file, not
a live Excel connection, and there's no generic "embed on any CMS" installer built. Keep the
marketing claim, but know it describes the product being sold, not (yet) this repo's current code.

`demo.html` is intentionally a different kind of page: a full illustrative cleaning-company site
(Accueil / Prestations / À propos / Devis / Contact tabs, its own teal/coral chrome), not funnel
copy. The "Devis" tab hosts the actual Dealz widget; once a quote is delivered, the "Imaginez ceci
sur VOTRE site" block appears with three CTAs (Demander l'installation / Voir les tarifs /
Contacter Dealz), all linking back into `index.html`'s anchors. A sticky dark banner
("Ceci est le site fictif d'une entreprise de nettoyage ayant intégré Dealz") stays visible on
every tab so nobody mistakes the illustrative company for a real Dealz customer.

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

## Not included yet (deliberately deferred, not oversights)

- **AI-suggested counteroffer amounts** — the owner always types the number themselves on
  `counteroffer.html`; letting the AI suggest a discount is a real way to erode a business's own
  margin if a rushed owner just clicks "send," so this is out of scope until there's real usage
  data to defend the suggestion logic (see "The sales loop" above)
- **Real Google Calendar API writes** (OAuth, per-company consent) — using one-click
  "add to calendar" links instead is a deliberate MVP simplification, not a placeholder; see
  "The sales loop"
- **Excel-upload auto-parsing** — arbitrary pricing spreadsheets vary too much in structure for
  reliable automated detection; the realistic MVP is a human manually mapping a client's Excel into
  `pricing.json` during paid onboarding (this is what the setup fee is partly for), not an AI parser
- **Multi-tenant routing** (one pricing config per client, selected by domain/API key) — the
  architecture supports it (pricing is already just data), but this demo is single-tenant
- **A generic "embed on any CMS" installer** — the widget mounts on `#dealz-messages` /
  `#dealz-input` / `#dealz-send`, but there's no drop-in script for Wix/Squarespace/WordPress yet
- **Persisted lead/booking storage** — `src/store.js` is in-memory only (see "The sales loop"); the
  `index.html` contact form is client-side only (a confirmation message, nothing saved) — wiring it
  to a real inbox is a small serverless function or a third-party form backend
- Auth, rate limiting, and abuse protection on the API endpoints
- Real dashboard data — the numbers on `index.html` are hardcoded and clearly labeled as an example
