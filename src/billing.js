const Stripe = require("stripe");
const store = require("./store");
const { sendEmail } = require("./notifications");

/**
 * Dealz's own subscriptions, paid with Stripe Checkout from the website's
 * "Request my Dealz setup" chat (docs/contact-flow.js).
 *
 *   POST /api/stripe/checkout  → a Checkout Session for the chosen plan,
 *                                 billing and currency; returns its URL.
 *   POST /api/stripe/webhook   → verified events: fulfilment (the company
 *                                 becomes a Client in the CRM with its plan,
 *                                 the Dealz team is told), renewals, failed
 *                                 payments, plan changes, cancellations,
 *                                 disputes, refunds, fraud warnings.
 *
 * The catalog is created on demand: one Product per plan (plus setup and
 * the WhatsApp add-on), one Price per currency and billing period, found
 * again by lookup_key. Amounts are the same numbers in every currency.
 */

const PLANS = {
  CAPTURE: { name: "Dealz CAPTURE", month: 48.3, once: 1420.3 },
  CLOSE: { name: "Dealz CLOSE", month: 77.5, once: 1897.1 },
  SCALE: { name: "Dealz SCALE", month: 145.2, once: 2158.8 },
};
const SETUP = { id: "dealz_setup", name: "Installation Dealz", amount: 390 };
const WHATSAPP = { id: "dealz_whatsapp", name: "Option WhatsApp Dealz", month: 25 };
const CURRENCIES = ["chf", "eur", "gbp", "usd"];
// The lifetime payment is a launch offer.
const ONE_TIME_UNTIL = new Date("2027-01-01T00:00:00+01:00");
// Tags these sessions in the Stripe Dashboard (8 random letters suffix).
const INTEGRATION_ID = "dealz_contact_flow_qvkrmtwa";

let client = null;
function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe n'est pas configuré (STRIPE_SECRET_KEY).");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

const EURO = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS NO AD MC SM VA ME AL BA MK RS".split(" ");
function currencyForCountry(country) {
  const c = String(country || "").toUpperCase();
  if (!c) return null;
  if (c === "CH" || c === "LI") return "chf";
  if (["GB", "UK", "GG", "JE", "IM"].includes(c)) return "gbp";
  if (EURO.includes(c)) return "eur";
  return "usd";
}

// ---- catalog ----

async function ensureProduct(id, name) {
  try {
    return await stripe().products.retrieve(id);
  } catch (err) {
    if (err.code !== "resource_missing") throw err;
    return stripe().products.create({ id, name });
  }
}

// One Price per product × currency × period, found by its lookup_key.
async function ensurePrice({ productId, productName, amount, currency, interval }) {
  const key = `${productId}_${interval || "once"}_${currency}_${Math.round(amount * 100)}`;
  const found = await stripe().prices.list({ lookup_keys: [key], limit: 1 });
  if (found.data.length) return found.data[0].id;
  await ensureProduct(productId, productName);
  const price = await stripe().prices.create({
    product: productId,
    currency,
    unit_amount: Math.round(amount * 100),
    lookup_key: key,
    ...(interval ? { recurring: { interval } } : {}),
  });
  return price.id;
}

// ---- checkout ----

/**
 * plan: CAPTURE | CLOSE | SCALE; billing: monthly | yearly | onetime.
 * Amounts always come from this file, never from the browser.
 */
async function createCheckout({ plan, billing, whatsapp, currency, lang, lead, baseUrl }) {
  const P = PLANS[plan];
  if (!P) throw Object.assign(new Error("Formule inconnue"), { status: 400 });
  if (!["monthly", "yearly", "onetime"].includes(billing)) throw Object.assign(new Error("Facturation inconnue"), { status: 400 });
  if (billing === "onetime" && new Date() >= ONE_TIME_UNTIL) throw Object.assign(new Error("L'offre de paiement unique est terminée."), { status: 400 });
  const cur = CURRENCIES.includes(currency) ? currency : "chf";
  const productId = "dealz_" + plan.toLowerCase();

  const items = [];
  if (billing === "onetime") {
    items.push({ price: await ensurePrice({ productId, productName: P.name, amount: P.once, currency: cur }), quantity: 1 });
  } else {
    const interval = billing === "yearly" ? "year" : "month";
    const amount = billing === "yearly" ? Math.round(P.month * 1200) / 100 : P.month;
    items.push({ price: await ensurePrice({ productId, productName: P.name, amount, currency: cur, interval }), quantity: 1 });
    // Monthly: one-time setup fee on the first invoice (free on yearly).
    if (billing === "monthly") items.push({ price: await ensurePrice({ productId: SETUP.id, productName: SETUP.name, amount: SETUP.amount, currency: cur }), quantity: 1 });
    if (whatsapp) {
      const wa = billing === "yearly" ? WHATSAPP.month * 12 : WHATSAPP.month;
      items.push({ price: await ensurePrice({ productId: WHATSAPP.id, productName: WHATSAPP.name, amount: wa, currency: cur, interval }), quantity: 1 });
    }
  }

  const l = ["en", "de"].includes(lang) ? lang : "fr";
  const page = `${baseUrl}${l === "fr" ? "" : "/" + l}/index.html`;
  const metadata = {
    plan,
    billing,
    whatsapp: whatsapp ? "yes" : "no",
    company_name: String(lead.companyName || "").slice(0, 400),
    contact_name: String(lead.contactName || "").slice(0, 400),
    contact_phone: String(lead.contactPhone || "").slice(0, 100),
    website_url: String(lead.websiteUrl || "").slice(0, 400),
    lang: l,
  };

  const session = await stripe().checkout.sessions.create({
    mode: billing === "onetime" ? "payment" : "subscription",
    line_items: items,
    customer_email: lead.contactEmail || undefined,
    ...(billing === "onetime" ? { customer_creation: "always" } : { subscription_data: { metadata } }),
    metadata,
    locale: l,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    integration_identifier: INTEGRATION_ID,
    success_url: `${page}?checkout=success#contact`,
    cancel_url: `${page}?checkout=cancel#contact`,
  });
  return { url: session.url, id: session.id };
}

// ---- webhook ----

const fmt = (amount, currency) => `${String(currency || "").toUpperCase()} ${(Number(amount || 0) / 100).toFixed(2)}`;
const BILLING_FR = { monthly: "mensuel", yearly: "annuel", onetime: "paiement unique" };

async function customerEmail(customerId) {
  if (!customerId) return null;
  try {
    const c = await stripe().customers.retrieve(customerId);
    return c && !c.deleted ? c.email : null;
  } catch (err) {
    return null;
  }
}

// Plan of a subscription, from its products (dealz_capture…), not metadata.
function planOfSubscription(sub) {
  for (const item of (sub.items && sub.items.data) || []) {
    const product = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
    const m = /^dealz_(capture|close|scale)$/.exec(product);
    if (m) return { plan: m[1].toUpperCase(), billing: item.price.recurring && item.price.recurring.interval === "year" ? "yearly" : "monthly" };
  }
  return { plan: null, billing: null };
}

async function forwardToCrm(payload) {
  const base = process.env.CRM_INBOUND_URL;
  if (!base || !process.env.CRM_INBOUND_SECRET) return { skipped: "CRM not configured" };
  const url = base.replace(/inbound-leads\/?$/, "billing-events");
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Inbound-Secret": process.env.CRM_INBOUND_SECRET },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || `CRM responded ${resp.status}`);
  return data;
}

async function tellTeam(subject, lines) {
  const to = process.env.DEALZ_TEAM_EMAIL || "dealz@dealz.website";
  await sendEmail({ to, subject, html: `<h2>${subject}</h2><p>${lines.filter(Boolean).join("<br/>")}</p>` });
}

// Fulfilment: the payment for a new Dealz client went through.
async function fulfil(session) {
  const m = session.metadata || {};
  const email = (session.customer_details && session.customer_details.email) || session.customer_email;
  const amount = fmt(session.amount_total, session.currency);
  const label = `${m.plan} ${BILLING_FR[m.billing] || ""}${m.whatsapp === "yes" ? " + WhatsApp" : ""}`;
  await tellTeam(`💳 Nouveau client Dealz — ${m.company_name || email} — ${label}`, [
    `<b>Entreprise :</b> ${m.company_name || "—"}`,
    `<b>Contact :</b> ${m.contact_name || "—"} · ${email || "—"} · ${m.contact_phone || "—"}`,
    `<b>Site :</b> ${m.website_url || "—"}`,
    `<b>Formule :</b> ${label}`,
    `<b>Payé :</b> ${amount}`,
    `<b>Stripe :</b> client ${session.customer || "—"}${session.subscription ? " · abonnement " + session.subscription : ""}`,
    "→ Prochaine étape : créer l'entreprise dans le CRM (formule déjà indiquée) et planifier l'installation.",
  ]);
  await forwardToCrm({
    type: "paid",
    email,
    companyName: m.company_name,
    contactName: m.contact_name,
    contactPhone: m.contact_phone,
    websiteUrl: m.website_url,
    plan: m.plan,
    billing: m.billing,
    note: `💳 Paiement Stripe reçu — ${label} — ${amount} (client Stripe ${session.customer || "—"})`,
  });
}

async function handleEvent(event) {
  const o = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      // Async methods (bank transfer…) complete as "unpaid" and are
      // fulfilled on async_payment_succeeded instead.
      if (o.payment_status === "paid" || o.payment_status === "no_payment_required") await fulfil(o);
      return;
    case "checkout.session.async_payment_failed": {
      const email = (o.customer_details && o.customer_details.email) || o.customer_email;
      await tellTeam(`⚠️ Paiement échoué — ${(o.metadata || {}).company_name || email}`, [`Le paiement différé de ${email} (${fmt(o.amount_total, o.currency)}) a échoué. À recontacter.`]);
      return;
    }
    case "customer.subscription.created":
      return; // covered by checkout.session.completed
    case "customer.subscription.updated": {
      const prev = (event.data.previous_attributes) || {};
      const { plan, billing } = planOfSubscription(o);
      const email = await customerEmail(o.customer);
      if (prev.items && plan) {
        await forwardToCrm({ type: "plan_changed", email, plan, billing, note: `🔁 Formule modifiée : ${plan} ${BILLING_FR[billing]}` });
        await tellTeam(`🔁 Changement de formule — ${email}`, [`Nouvelle formule : ${plan} ${BILLING_FR[billing]}`]);
      } else if (prev.cancel_at_period_end === false && o.cancel_at_period_end) {
        const end = new Date(o.cancel_at * 1000 || Date.now()).toLocaleDateString("fr-CH");
        await forwardToCrm({ type: "note", email, note: `⏳ Résiliation programmée — fin le ${end}` });
        await tellTeam(`⏳ Résiliation programmée — ${email}`, [`L'abonnement ${plan || ""} prendra fin le ${end}.`]);
      } else if (prev.status && o.status !== prev.status) {
        await forwardToCrm({ type: "note", email, note: `Abonnement : statut ${prev.status} → ${o.status}` });
      }
      return;
    }
    case "customer.subscription.deleted": {
      const email = await customerEmail(o.customer);
      const { plan } = planOfSubscription(o);
      await forwardToCrm({ type: "cancelled", email, note: `❌ Abonnement ${plan || ""} terminé` });
      await tellTeam(`❌ Abonnement terminé — ${email}`, [`L'abonnement ${plan || ""} est terminé. Désactiver le widget / passer la formule à « — » dans le CRM.`]);
      return;
    }
    case "invoice.paid":
      // The first invoice is the checkout itself; only renewals are noted.
      if (o.billing_reason === "subscription_cycle") {
        await forwardToCrm({ type: "note", email: o.customer_email || (await customerEmail(o.customer)), note: `✅ Renouvellement payé — ${fmt(o.amount_paid, o.currency)}` });
      }
      return;
    case "invoice.payment_failed": {
      const email = o.customer_email || (await customerEmail(o.customer));
      await forwardToCrm({ type: "note", email, note: `⚠️ Échec de paiement — ${fmt(o.amount_due, o.currency)} (Stripe relance automatiquement)` });
      await tellTeam(`⚠️ Échec de paiement — ${email}`, [`Facture de ${fmt(o.amount_due, o.currency)} impayée. Stripe relance automatiquement ; prévenir le client si besoin.`]);
      return;
    }
    case "charge.dispute.created":
      await tellTeam(`🚨 Litige ouvert — ${fmt(o.amount, o.currency)}`, [`Motif : ${o.reason}. À traiter dans le Dashboard Stripe avant l'échéance.`]);
      return;
    case "charge.refunded":
      await tellTeam(`↩️ Remboursement — ${fmt(o.amount_refunded, o.currency)}`, [`Charge ${o.id}${o.billing_details && o.billing_details.email ? " · " + o.billing_details.email : ""}.`]);
      return;
    case "radar.early_fraud_warning.created":
      await tellTeam(`🚨 Alerte fraude Stripe`, [`Charge ${o.charge} — type ${o.fraud_type}. Vérifier et rembourser si nécessaire.`]);
      return;
    default:
      return;
  }
}

/**
 * Verifies the signature on the raw body, then handles each event once
 * (Stripe retries deliveries; the event id is remembered for 48h).
 */
async function handleWebhook(rawBody, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw Object.assign(new Error("STRIPE_WEBHOOK_SECRET missing"), { status: 500 });
  let event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw Object.assign(new Error("Invalid signature"), { status: 400 });
  }
  const key = "stripe-evt:" + event.id;
  if (await store.getKey(key)) return { duplicate: true };
  await handleEvent(event);
  await store.setKey(key, { type: event.type, at: Date.now() });
  return { ok: true, type: event.type };
}

module.exports = { createCheckout, handleWebhook, currencyForCountry, PLANS };
