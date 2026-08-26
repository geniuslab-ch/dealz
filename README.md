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
`docs/mock-client.js`) runs a fully adaptive question flow — see "The mock-mode question flow is a
real clickable MCQ" below — and lets you click through Accept/Decline; accepting or reaching a
quote reveals the "Imaginez ceci sur VOTRE site" block with the Request-installation / Pricing /
Contact CTAs that route back into `index.html`.

To try the real conversational assistant instead, set `MOCK_MODE=false` and paste an
`ANTHROPIC_API_KEY` with available credit — everything else is identical.

**The live demo never breaks, even with an empty Anthropic account.** With `MOCK_MODE=false`, if
the real Claude call fails for any reason — no credit, rate limit, transient outage — `server.js`
catches it and silently falls back to the same scripted engine `MOCK_MODE` uses, so a visitor never
sees a broken conversation. It logs a warning server-side (`[/api/chat] Real Claude call failed —
falling back…`) so you notice and can fix the account issue; the visitor sees a working demo either
way. This was a real reported bug (the live demo failing outright when the API account had no
billing) — it's fixed at the server level, not worked around in the frontend.

**Why the public demo runs on `MOCK_MODE` at all, on purpose:** this deployment only serves
prospects evaluating Dealz — there's no real paying-customer traffic hitting it (that's the "natural
next step" multi-tenant work described later in this file). Paying real Anthropic credit for
strangers clicking around a marketing demo doesn't make sense, so the recommended setup for the
public URL is `MOCK_MODE=true` with no `ANTHROPIC_API_KEY` at all — zero API cost, unlimited free
tries, and (per below) a lead-capture gate that still gives you something for every trial.

## The mock-mode question flow is the full 25-category clickable MCQ bank

This started as 3 fixed questions asked by turn number regardless of what the customer had already
said (so answering everything in one message still got the same canned question echoed back), then
became a shorter adaptive ~8-question flow scoped to only what `pricing.json` actually prices. Per
an explicit product decision, it's now the **full 25-category question bank** (type de nettoyage,
type de bien, pièces, surface, niveaux, salles de bains, cuisine, état général, logement vide,
fenêtres, four, frigo, autres appareils de cuisine, tapis/moquette, canapé/textiles, accès sans
ascenseur, accès au logement, stationnement, date, animaux, situations particulières, plus
conditional blocks for fin-de-bail/après-travaux/nettoyage régulier, then contact info) — `src/mock.js`
/ `docs/mock-client.js` walk this as a declarative, ordered `STEPS` array, each step asked exactly
once as chips (single- or multi-select) or free text, with `applies(answers)` gating conditional
branches so a régulier-cleaning customer never sees fin-de-bail questions and vice versa.

**Deliberately not "smart skip-ahead" from free text.** Earlier versions tried to detect answers
already given in free text and skip that question — good for minimizing friction, bad for a
prospect trying to *evaluate* the tool, who wants to see it actually walk the full flow, and bad for
upsell (skipping the add-ons question because "four" was mentioned means never surfacing vitres/
frigo/moquette as options). So the full bank asks every applicable step regardless of what's already
been said, with one exception: the add-ons/textiles multi-select steps come back pre-selected with
whatever was already mentioned (via `question.preselected`), so nothing has to be re-typed to keep
it — they just stay visible to catch upsell opportunities the customer wouldn't have thought to ask
for. Category 24 ("Services supplémentaires") from the original brief was dropped as a literal
duplicate of categories 10–15 already asked individually.

Only the subset of steps that map to a `docs/pricing.json` variable feed `calculateQuote()`
(type/size → service_type+rooms, hours, état général → condition, fenêtres → windows add-on +
difficult-access surcharge, four/frigo/autres appareils/tapis/canapé → add-ons, accès sans ascenseur
→ floor surcharge). Everything else (type de bien, surface, cuisine, logement vide, animaux,
stationnement, date, situations particulières, etc.) is genuinely informational — it doesn't affect
the total, but it's collected on `quote.details` and printed as a "Détails complémentaires" section
in the PDF (`docs/pdf-generator.js`), so all those extra questions still pay off in the document the
customer receives. Nine new add-on line items were added to `pricing.json` to price the appliance/
textile categories the original bank listed alongside four/vitres/frigo (hotte, plaques de cuisson,
micro-ondes, lave-vaisselle, congélateur, canapé, fauteuil, matelas, rideaux) — same treatment as the
existing add-ons, and now also offered by the real Claude assistant (`src/claude.js`).

Each question comes back from the engine as a `question: { type: "single" | "multi" | "date",
options?: [...], preselected?: [...], minDate?: "YYYY-MM-DD" }` field alongside the assistant's
message; `docs/quote-app.js`'s `renderChipQuestion()` renders single/multi as clickable chips
(reusing the existing objection-picker chip styling, plus a `.selected` state for multi-select and
pre-selected chips) and `date` as a native `<input type="date">`. A chip click is sent back as a
normal chat message — its label text — through the exact same code path as typing, so the free-text
input at the bottom always still works as a natural fallback with no separate "Autre" UI needed for
it.

## The date question is a real calendar, gated by a per-company lead time

The "when do you want the cleaning?" question is a native date picker (not free text), and its `min`
attribute — and a defensive server/mock-side clamp behind it, in case that attribute gets bypassed —
comes from `pricing.min_lead_time_hours`. That's a per-company setting (documented as "set once
during onboarding" in `pricing.json`, next to the other company-level config like `minimum_price`):
some companies can send someone the same day, others need 24–72h notice, and this is what encodes
that difference deterministically, the same way pricing itself is a rule rather than a guess. Today's
demo default is `24`; a real company chooses their own value once, not per booking.

For **régulier** (recurring) cleaning, the date question asks for a *start date* instead of a single
appointment, and two more questions appear that a one-time booking doesn't need: which day of the
week (`jour_semaine`, Lundi–Samedi) and which time-of-day window (`heure_passage`, matin/après-midi/
fin de journée) the team should come — alongside the existing `frequence` question (chaque semaine /
toutes les 2 semaines / etc.), that's everything needed to actually schedule a recurring slot, not
just note that one exists. A one-time booking skips those and just asks whether its single date is
firm or flexible.

## Lead-capture gate on the public demo (`docs/lead-gate.js` + `src/leads.js`)

Since the public demo runs on free `MOCK_MODE` (see above), gating it isn't about protecting API
cost — it's a lead-gen feature: before the chat widget appears on `demo.html`, a short form asks for
a professional e-mail (+ optional phone/company name). Submitting posts to `POST /api/lead`, which
records the attempt in a Supabase `leads` table and caps how many times the *same e-mail* can try
the demo (`DEMO_TRIAL_LIMIT` in `.env`, default 3) — past the limit it shows a "contact us for a
personalized demo" message instead of the widget. This is a soft limit: the e-mail is self-reported
and unverified, so it slows down casual repeat visits rather than stopping a determined one.

Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (the **service role** key — this only ever runs
server-side in `src/leads.js`, never shipped to the browser) in `.env` to turn the gate on. Create
the table first:

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  phone text,
  company_name text,
  trial_count int not null default 1,
  source text default 'demo',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
```

Leave `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` empty and the gate fails open — `recordTrialAttempt()`
returns `{ allowed: true, configured: false }` and the widget is revealed with no gate at all — same
graceful-degradation pattern as `MOCK_MODE` and the SMTP dry-run fallback elsewhere in this repo.
The gate also fails open on the static/GitHub-Pages build specifically (no backend to call `POST
/api/lead` at all) — there's no API cost to protect there either, so gating would only add friction.
`docs/embed.js` (the snippet a real paying client embeds on *their own* site) deliberately does not
include this gate — it would be nonsensical to ask a cleaning company's own customers for a lead
form before they can get their own quote.

**The e-mail captured at the gate is what internal demo notifications get addressed to.** When you
decline or accept a quote in the demo, the *company-facing* copy (decline notification, the internal
half of a booking confirmation) is sent to whatever e-mail you typed into the gate — not to the
fictional `reservations@swissclean.demo` — via `sessionStorage`'s `dealz_company_email`, threaded
through as `companyEmail` in the `/api/decline` and `/api/accept` request bodies. The *customer*-
facing copies (the fictional end-customer's booking confirmation, counteroffers, etc.) are untouched
and still go to whatever contact info you entered as "the customer" partway through the
conversation — those two are deliberately different people in the story the demo is telling, and
personalizing one should never bleed into the other.

**Links inside notification e-mails are built from the actual request, not a hardcoded URL.**
`server.js`'s `requestBaseUrl(req)` derives the base URL (`https://your-deployment.vercel.app`, a
custom domain, `http://localhost:3000` — whatever the request actually came in on) from the incoming
request itself (`req.protocol` + `req.get("host")`, with `app.set("trust proxy", 1)` so this reports
correctly behind Vercel's proxy), so the "Faire une contre-offre" / "Voir l'offre" links inside
`counteroffer.html?token=...` and `offer.html?token=...` always point at wherever the app is actually
running — no more dead links to `localhost` on a real deployment. `APP_BASE_URL` in `.env` still
works as an explicit override if you ever need to force a specific canonical URL.

## The contact section is a mini Dealz conversation, not a form (`docs/contact-flow.js`)

`index.html`'s `#contact` section used to be a static lead form (name/company/e-mail/message,
client-side only, no backend). Per an explicit brief ("the form should feel like the product, not a
contact form with more fields"), it's now a self-contained chip-and-chat flow reusing the *exact*
visual language already built for the real widget — `.dealz-messages` / `.dealz-msg` / `.dop-chip` /
`.dealz-contact-form` from `styles.css`, the same "chip click sends the same text a free-text answer
would" pattern from `docs/quote-app.js` — rather than inventing a new component language. One
question at a time: company name → team size → how requests come in today (multi-select) → main
pain point → plan choice (three cards, or "not sure? let Dealz recommend" using a small deterministic
rule over the two previous answers — multi-person team wins to SCALE, refused-quotes/counteroffer
pain wins to CLOSE, otherwise CAPTURE) → monthly-vs-annual (computed from the chosen plan; the annual
side's only advantage is the CHF 390 install fee waived, not a lower SaaS price — matches the pricing
section's own installation panel) → site URL (light validation, auto-prepends `https://`) → contact
details (name/e-mail/phone, reusing the widget's own contact-form styling) → a recap card → submit.

Any question where "Autre" is a valid option asks one short free-text follow-up ("Vous pouvez
préciser :") and merges it into the stored answer, rather than either forcing free text everywhere or
silently discarding what doesn't fit a preset option. "← Modifier la réponse précédente" is available
on every step after the first — it discards that step's own (still-unanswered) block and the previous
step's answered block, then re-asks the previous question fresh, so correcting an answer never leaves
a stale answer bubble behind.

**Still genuinely a client-side-only flow, on purpose.** The submit button shows the same static
confirmation message the old form did — no `fetch` call, no new backend route. The brief was explicit
about not standing up infrastructure that wasn't already there for this; if/when this needs to reach
a real inbox or CRM, that's a deliberate follow-up, not something silently added here.

## What's actually happening on the demo (real mode)

- **Claude only asks questions and reads the customer's answers.** It never invents a price.
- Once it has enough information (service type, room count, add-ons), it asks for the customer's
  **name, e-mail, phone, and the cleaning address** — before showing the quote, not after — so the
  quote itself is personalized ("DEVIS DÉTAILLÉ — MARIE DUPONT") and the contact info is already on
  hand for the accept/decline/counteroffer loop that follows (no redundant second form). It then
  calls a `calculate_quote` tool with structured fields (service type, room count, add-ons,
  distance, plus the customer fields, which are split out before pricing math — see
  `src/claude.js`).
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

**1. Objection capture** (`docs/quote-app.js`) — clicking Refuser shows **seven** objection chips
(prix / date / périmètre / réflexion / concurrent / besoin d'infos / n'a plus besoin) plus a
free-text field, in a soft, non-aggressive tone ("Auriez-vous deux minutes pour me dire ce qui ne
convenait pas…").

**2. Classification — the "Objection Engine"** (`src/objections.js`) — a chip click already
carries its category; free text gets classified into the same categories via a cheap Claude Haiku
call in real mode, or a keyword heuristic in `MOCK_MODE` (zero API key needed either way). **Never
guesses when uncertain** — an unmatched or ambiguous message falls to `other` rather than picking a
specific-sounding wrong category, because a wrong CTA (e.g. offering a discount for what was
actually a scope objection) is worse than a generic "review the conversation" one. The raw customer
text is always included in the company email regardless of category, so the owner can override the
classification by reading it themselves.

**3. Human handoff by e-mail, no dashboard — different action per objection** (`src/notifications.js`,
`POST /api/decline`) — the company receives an email whose **subject line alone says what
happened**, e.g. `📅 Devis refusé — Date indisponible — Marie Dupont — CHF 490.00`, so the owner
understands without opening it. The one action link in the email adapts to the objection — this is
the actual point of the Objection Engine, not just classification:

| Objection | Primary action (`counteroffer.html`) | What the customer sees |
|---|---|---|
| Prix trop élevé | Faire une contre-offre (CHF amount) | New price, accept/decline |
| Date indisponible | Proposer une autre date | New date, accept/decline |
| Périmètre du service | Envoyer une offre révisée (checkboxes to remove line items — total recalculates server-side) | Revised itemized quote, accept/decline |
| Conditions / détails du nettoyage | Modifier l'offre — reuses the *same* revise action/form as "Périmètre" on purpose (both end in adjusting the offer's terms; no third form needed) | Revised itemized quote, accept/decline |
| A choisi un autre prestataire | Faire une contre-offre, or "Maintenir le prix" (closes with no customer email) | Same as price |
| A besoin d'informations | Répondre au client (free-text reply) | A plain answer, no accept/decline — nothing is pushed |
| A besoin de réfléchir | Relancer le client (one click, capped at once — no repeated nagging) | The original quote again |
| N'a plus besoin du service | Clôturer la demande (one click, no customer contact) | Nothing — closing, not selling, per the brief this shipped from |
| Autre raison | Voir la conversation | — |

Only `docs/counteroffer.html` exists as a page — it's **one adaptive form**, not nine different
pages, rendering different fields based on the category's configured `action` from the same
`CATEGORIES` table in `src/objections.js`. Same for the customer side: **one** `docs/offer.html`
renders a price, a date, a revised item list, or nothing, based on what the owner actually sent.
This was a deliberate simplification over building a dedicated page per objection type — the
"simplest implementation that preserves the intelligence" the brief asked for.

**4. Owner is always in control of anything committal** — nothing here auto-sends a price, a date,
or a scope change. `calculate_quote`/counteroffer amounts are always typed by a human before
sending (an AI-suggested discount that a rushed owner approves without checking margin is a real
way to erode a business's own pricing — deferred on purpose, not an oversight). Only the
*classification*, *subject line*, and *which form to show* are automated — that's where the
"intelligence" actually lives; the money decisions stay human.

**5. Customer responds** (`docs/offer.html`, `GET /api/offer/:token`, `POST /api/offer/:token/respond`)
— shows whatever changed (price/date/scope), Accepter/Refuser. Accepting triggers the same
booking-confirmation flow as a direct accept, using the *new* terms.

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

**Actually sending an email or writing to a calendar needs a real backend and cannot run on GitHub
Pages** — those side effects are inherently server-side. But *seeing what would be sent* doesn't:
every step of the loop (decline notification, counteroffer, reschedule, revised offer, follow-up,
booking confirmation) now renders an **"📧 Aperçu de l'e-mail (démo)"** panel right in the chat,
showing the actual To/Subject/body — real dry-run content from `sendEmail()` when there's a backend
running without SMTP configured, or a client-built equivalent (`docs/mock-client.js`,
`buildDeclineEmailPreview` / `buildBookingConfirmationPreview`, mirroring `src/notifications.js` +
`src/objections.js` closely enough to be representative) when there's no backend at all — so the
static/GitHub-Pages version of `demo.html` shows exactly what a real deployment would email,
without ever needing SMTP credentials or leaving the page.

The same pattern was added to `counteroffer.html` and `offer.html` (the owner-action and
customer-offer pages reached via email links) — every action that triggers an email now shows a
matching preview panel underneath the confirmation message, so the entire decline → objection →
counteroffer → accept loop is previewable end to end without ever configuring SMTP.

## The quote is a real PDF, viewed in a modal before any decision

The quote card in the chat shows a summary and one button — **"📄 Voir mon devis (PDF)"** — not
Accept/Decline directly. Clicking it opens a modal, generates a real PDF client-side (`docs/
pdf-generator.js`, using `jsPDF` lazy-loaded from a CDN only when a quote is actually delivered —
no cost to page load otherwise), and shows it in an embedded `<iframe>` with **Accepter/Refuser
directly below it**, matching the spec this shipped from precisely. The PDF itself contains the
company header (name/address/phone/email), the client's info, the itemized services, and the
total — verified for real, not just visually: generated one, decoded it, and ran `pdftotext` on the
actual bytes to confirm the content is correct (`%PDF-1.3` header, valid structure, correct text).

**No email is sent to the customer before they decide** — this was already true before this change
(the accept/decline handlers underneath the modal are untouched, just relocated), but now it's also
visually true: the PDF is generated and shown entirely client-side, and Accepter/Refuser inside the
modal call the exact same `handleAccept`/`handleDecline` functions as before — closing the modal
first, then running the identical flow. Nothing about the accept/decline/counteroffer logic changed;
only how the customer *gets to* that decision changed.

Same self-contained-CSS treatment as the rest of the widget — the modal's styles are duplicated
(by hand, documented) into `docs/embed.js`'s own stylesheet too, so it works identically on a
third-party site using the generic embed snippet, not just on `demo.html`.

## Setting up real Gmail sending and real Google Calendar

Two different questions with two very different answers:

**Sending real email through Gmail — no Google Cloud project needed.** `src/notifications.js`
already sends real email via standard SMTP (`nodemailer`), and Gmail's own SMTP server accepts
that directly:

1. On the Google Account that will send mail: Security → 2-Step Verification (turn it on if it
   isn't already) → App passwords → generate one for "Mail"
2. In `.env`: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`,
   `SMTP_USER=<that gmail address>`, `SMTP_PASS=<the 16-character app password>`
3. Restart the server — `src/notifications.js` picks up `SMTP_HOST` automatically and every
   "simulated" email in the console log starts actually sending

No OAuth, no API key, no Cloud project. This works with any SMTP provider, not just Gmail (Resend,
Postmark, your own mail server) — Gmail is just the fastest thing to try with an existing account.

**Real Google Calendar API writes (creating an event directly in a specific calendar) — this is a
different, bigger thing**, and this repo deliberately doesn't do it (see "Not included yet" below).
The current approach — a one-click "add to Google Calendar" link generated by
`googleCalendarLink()` in `src/notifications.js` — needs none of what follows. If you want real
API writes instead, here's what that actually requires, so the scope is clear before starting:

1. A Google Cloud project, with the **Google Calendar API** enabled
2. OAuth 2.0 credentials (Cloud Console → APIs & Services → Credentials) — a client ID/secret
3. A consent flow where each company grants Dealz access to *their own* calendar once (this is
   real, per-company scope — one company's OAuth grant doesn't give access to anyone else's
   calendar); the refresh token that results needs to be stored securely per company
4. Server-side: the `googleapis` npm package, `calendar.events.insert()` calls authenticated with
   that company's stored refresh token

None of this is wired up. If it's the next priority, it's a real, bounded piece of work — but it's
meaningfully bigger than the SMTP setup above, and multi-tenant credential storage (`src/store.js`
is in-memory only) would need solving first.

## The generic embed snippet (`docs/embed.js`)

This is the actual "add this to your existing website" artifact — the thing a real client pastes
into their real site, on a domain that isn't this one:

```html
<script src="https://YOUR-DEALZ-DOMAIN/embed.js" async></script>
```

One script tag, works on any CMS (WordPress, Wix, Squarespace, Webflow, a hand-written site) —
anywhere a `<script>` tag can go. It injects a floating launcher bubble + chat panel with
**self-contained CSS** (all rules scoped under `#dealz-embed-*` / `.dealz-*` class names, no
dependency on `styles.css`, so it can't clash with or be overridden by the host page's own styles),
then dynamically loads `pricing-engine-client.js`, `mock-client.js`, and `quote-app.js` from
wherever `embed.js` itself was loaded from — so the exact same conversation logic (Claude/mock
fallback, the full Objection Engine, accept/decline) runs identically to `demo.html`'s "Devis" tab.

**Why this is a separate file from `demo.html`, not a shared one:** `demo.html` shows the *ideal*
integration for the sales pitch — a "Devis" tab living inside a real site's own navigation, which
looks the most natural but assumes you can edit that site's markup/nav structure. `embed.js` is
what actually ships to a client's arbitrary site, where you can't assume that — a floating bubble
is the only pattern that reliably works with zero assumptions about the host page, which is exactly
how Intercom/Drift/Tidio-style widgets are built for the same reason.

**Cross-origin, for real:** a client's site and the Dealz server are different domains, so two
things had to be added beyond just injecting markup:

- `quote-app.js`'s API calls go through an `apiUrl(path)` helper that prefixes every request with
  `window.DEALZ_API_BASE` when it's set (same-origin pages like `demo.html` never set it, so
  nothing changes there); `embed.js` sets it to its own script origin before loading `quote-app.js`
- `server.js` sends permissive CORS headers (`Access-Control-Allow-Origin: *`) on every route, since
  the whole point is being called from a domain the server doesn't control ahead of time — a real
  multi-tenant deployment should allow-list each client's actual domain instead of `*`

**Verified working end-to-end**, not just plausible: served `docs/` on `localhost:3000` and a
separate bare-HTML test page (no styling, no framework) on `localhost:5050` with only
`<script src="http://localhost:3000/embed.js" async>` in it, then ran the full chat → personalized
quote flow through the browser from the `5050` origin — the widget rendered correctly on top of the
unstyled host page and the API calls reached the `3000` backend successfully.

`data-dealz-company="..."` on the script tag is read by `embed.js` but not yet used server-side —
this demo is single-tenant, so there's nothing yet to route by; see "Not included yet."

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
src/mock.js                    Adaptive clickable-question offline conversation for server-side
                                MOCK_MODE — see "The mock-mode question flow is a real clickable MCQ"
src/leads.js                    Lead-capture gate backing store (Supabase) + trial-limit logic for
                                 the public demo — see "Lead-capture gate on the public demo"
src/pricingEngine.js           Deterministic price calculation, French item labels
src/objections.js              The Objection Engine: 8 categories, each with a subject-line label,
                                emoji, and configured action (counteroffer/reschedule/revise/
                                reply/followup/close/review) — classifies via Claude Haiku in real
                                mode, keyword heuristic in MOCK_MODE
src/notifications.js           E-mail sending (real via SMTP, or logged to console when SMTP isn't
                                configured), one send function per objection action, + Google
                                Calendar "add event" link builder
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
docs/lead-gate.js                Lead-capture form in front of the demo widget — posts to
                                 /api/lead, fails open with no backend or no Supabase configured
docs/contact-flow.js            index.html's conversational contact/qualification flow — client-
                                 side only, no backend call on submit — see "The contact section
                                 is a mini Dealz conversation, not a form"
docs/pricing-engine-client.js   Browser port of src/pricingEngine.js — used by mock-client.js
docs/pricing.json               The example company's pricing rules — single source of truth
                                 (stand-in for a real client's Excel sheet), read by both the
                                 server and the browser fallback
docs/counteroffer.html          Owner-facing single-action page — one adaptive form covering all
                                 9 objection actions. Needs the real backend (no static fallback)
docs/offer.html                 Customer-facing response page — adapts to price/date/revised-scope/
                                 followup. Needs the real backend (no static fallback)
docs/pdf-generator.js           Generates the real devis PDF client-side (jsPDF, lazy-loaded) —
                                 shown in the quote modal before Accept/Decline
docs/embed.js                   The generic "add this to your real website" snippet — self-
                                 contained CSS, floating launcher, cross-origin (see "The generic
                                 embed snippet")
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
grid — `.dash-grid`) → **pricing (CAPTURE / CLOSE / SCALE)** → final CTA → **conversational contact
flow** (client-side only — see "Not included" and the dedicated section below). CTA copy changes
with funnel position: "Voir comment ça marche" in the hero, "Découvrir l'expérience" after How It
Works, "Essayer la démo gratuite" at pricing and the final CTA, "Demander l'installation" as the
closing ask.

**Pricing tells a progression, not a feature-count comparison** (rewritten from an earlier
Capture/Convert/Automate version per an explicit product brief — plan names are deliberately short,
untranslated, and stable across FR/DE/IT/EN). CAPTURE (CHF 49/mo, *"Ne manquez plus jamais une
demande"*) covers the whole core loop end to end — integration, AI conversation, deterministic
pricing, itemized quote, PDF, accept/decline, e-mail confirmation, calendar link — not a stripped
demo tier; accept/decline and the calendar link were deliberately never gated behind a higher plan.
CLOSE (CHF 79/mo, recommended, *"Ne laissez plus un « non » devenir une vente perdue"*) adds the
actual differentiator: the objection → counteroffer sales loop, framed as revenue recovered rather
than as more features. SCALE (CHF 149/mo, *"Quand une personne ne suffit plus pour gérer vos
réservations"*) is explicitly **not** "the plan where bookings become automatic" — they already are,
starting at CAPTURE (accept → confirmation → e-mail → calendar, no gate on any of it). SCALE is
about the complexity that shows up once a company has more than one person or calendar: multiple
collaborators, shared calendars, booking routing, multiple teams/locations, real Excel sync,
priority support.

**Installation is a separate, one-time, flat fee — not a bundled or ranged cost.** CHF 390 once,
shown as its own panel below the three cards (`.install-panel`) with what it actually covers
(pricing-grid mapping, widget integration, e-mail/Calendar config, testing, go-live) — replacing an
earlier CHF 199–499 range that read as ambiguous about whether setup was included in a plan's
monthly price. The panel also shows installation waived on an annual subscription (illustrated with
CLOSE: CHF 948/yr vs. CHF 79/mo + CHF 390) as informational copy only — there's no real annual-vs-
monthly billing toggle or payment system in this repo, so this is presented as a stated offer, not a
working checkout path.

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
product (this is the core pitch from the original commercial offer, and the SCALE tier explicitly
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
fees, distance-based travel fee, plus condition-based surcharges, a hard-to-reach-windows fee, and a
per-floor no-elevator fee). In a real deployment, this file is what you'd generate from a client's
actual Excel price list — the assistant and pricing-engine code don't need to change, only the data
(and the item labels in `pricingEngine.js` / `pricing-engine-client.js` if the client isn't
French-speaking).

The three condition-based variables (`condition_surcharge`, `difficult_access_windows_fee`,
`floor_fee_per_floor_no_elevator`) are deliberately *not* asked about on every conversation — the
system prompt in `src/claude.js` only tells the assistant to bring them up when the customer
mentions them unprompted (very dirty/cluttered, hard-to-reach windows, no elevator), keeping the
question flow short for the common case while still pricing accurately for the edge cases.

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
  "Setting up real Gmail sending and real Google Calendar" for exactly what real writes would need
- **Excel-upload auto-parsing** — arbitrary pricing spreadsheets vary too much in structure for
  reliable automated detection; the realistic MVP is a human manually mapping a client's Excel into
  `pricing.json` during paid onboarding (this is what the setup fee is partly for), not an AI parser
- **Multi-tenant routing** (one pricing config per client, selected by domain/API key or the
  `data-dealz-company` attribute `docs/embed.js` already reads and stores) — the architecture
  supports it (pricing is already just data), but this demo is single-tenant, and the CORS policy
  is wide-open (`*`) rather than allow-listing specific client domains
- **Automatic follow-up scheduling** — "Relancer le client" on a `thinking` objection sends
  immediately when the owner clicks it; there's no job queue to actually wait until "tomorrow" and
  send on its own. Real delayed scheduling needs a cron/queue and is capped-by-owner-click for now
- **Persisted lead/booking storage** — `src/store.js` is in-memory only (see "The sales loop"); the
  `index.html` contact form is client-side only (a confirmation message, nothing saved) — wiring it
  to a real inbox is a small serverless function or a third-party form backend
- Auth, rate limiting, and abuse protection on the API endpoints
- Real dashboard data — the numbers on `index.html` are hardcoded and clearly labeled as an example
