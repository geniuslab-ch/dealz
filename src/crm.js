/**
 * Calls from this site into the Dealz CRM (the dealz-crm Vercel project),
 * authenticated with the shared X-Inbound-Secret header — CRM_INBOUND_SECRET
 * here must equal INBOUND_LEAD_SECRET there.
 *
 * Every call is awaited by its caller, with a short timeout: on Vercel a
 * function can be frozen as soon as its response is sent, so a request
 * started and not awaited ("fire-and-forget") may never reach the CRM.
 */

const TIMEOUT_MS = 5000;

// Each CRM endpoint has its own variable. The two newer ones fall back to
// a URL derived from an older variable, so existing deployments keep working
// until CRM_BILLING_EVENTS_URL / CRM_DEMO_ACTIVITY_URL are set.
const ENDPOINTS = {
  inboundLeads: () => process.env.CRM_INBOUND_URL,
  billingEvents: () =>
    process.env.CRM_BILLING_EVENTS_URL || derive(process.env.CRM_INBOUND_URL, /inbound-leads\/?$/, "billing-events"),
  demoTested: () => process.env.CRM_DEMO_TESTED_URL,
  demoActivity: () =>
    process.env.CRM_DEMO_ACTIVITY_URL || derive(process.env.CRM_DEMO_TESTED_URL, /demo-tested\/?$/, "demo-activity"),
  referral: () => process.env.CRM_REFERRAL_URL,
  referralIdentify: () => process.env.CRM_REFERRAL_IDENTIFY_URL,
};

// Only when the base really ends with the expected path — otherwise the old
// string replace silently posted to the wrong endpoint.
function derive(base, re, replacement) {
  return base && re.test(base) ? base.replace(re, replacement) : null;
}

function urlFor(endpoint) {
  return (process.env.CRM_INBOUND_SECRET && ENDPOINTS[endpoint]()) || null;
}

function isConfigured(endpoint) {
  return !!urlFor(endpoint);
}

// POSTs `payload` to a CRM endpoint and returns its JSON. Throws on a non-2xx
// answer, a network error or the timeout. Returns { skipped } when the
// endpoint or the secret isn't configured.
async function post(endpoint, payload, { timeoutMs = TIMEOUT_MS } = {}) {
  const url = urlFor(endpoint);
  if (!url) return { skipped: `CRM ${endpoint} not configured` };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Inbound-Secret": process.env.CRM_INBOUND_SECRET },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || `CRM responded ${resp.status}`);
  return data;
}

module.exports = { post, isConfigured };
