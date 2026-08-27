const defaultPricing = require("../docs/pricing.json");

/**
 * Tenant registry for the WhatsApp channel — one entry per cleaning
 * company's own WhatsApp number, keyed by that number's Meta-issued
 * `phone_number_id` (NOT the phone number itself — Meta's webhook payload
 * identifies the receiving number by this id, see value.metadata in
 * src/whatsapp.js).
 *
 * All these numbers live under Dealz's own Meta Business Account (WABA) —
 * one WABA can hold many phone numbers, and a single system-user access
 * token (WHATSAPP_ACCESS_TOKEN) can send/receive on behalf of any of them,
 * just by passing the right phone_number_id per call. Each number still
 * gets its own WhatsApp Business Profile (name, logo, category) set in
 * Meta's WhatsApp Manager, so it looks like that company's own WhatsApp to
 * their customers — even though Dealz manages it under one account.
 *
 * Onboarding a new client (manual, a few minutes in Meta's dashboard):
 *   1. Get a phone number from them that isn't currently active on the
 *      regular consumer WhatsApp app (or have them remove it from there
 *      first — a number can only be registered on one WhatsApp platform at
 *      a time).
 *   2. In Meta's WhatsApp Manager (business.facebook.com/wa/manage),
 *      add that number to Dealz's WABA and complete verification — Meta
 *      sends an SMS/voice code to the number, which the client reads out or
 *      forwards during the call/setup session.
 *   3. Set the number's WhatsApp Business Profile (display name, logo,
 *      category) to match the client's own branding.
 *   4. Copy the new number's "Phone number ID" from WhatsApp Manager and
 *      add an entry below with the client's pricing grid (same shape as
 *      docs/pricing.json — copy that file and adjust the numbers).
 *   5. Redeploy.
 *
 * `pricing` config isn't secret (no tokens live here), but does contain a
 * client's real prices — fine to commit for a handful of clients; move to
 * a real per-tenant admin UI / database once this grows past a dozen or so.
 */
const COMPANIES = {
  // The original single-tenant demo company — kept here so an existing
  // WHATSAPP_PHONE_NUMBER_ID deployment (registered before multi-tenant
  // support existed) keeps working without needing an entry of its own;
  // see getCompanyByPhoneNumberId's fallback below.

  // Example of a second, real client — replace phone_number_id and pricing
  // with their actual values once onboarded, then uncomment:
  // "123456789012345": {
  //   name: "Nom de l'entreprise Sàrl",
  //   notifyEmail: "contact@entreprise.ch",
  //   pricing: { ...same shape as docs/pricing.json... },
  // },
};

function getCompanyByPhoneNumberId(phoneNumberId) {
  if (!phoneNumberId) return null;

  const configured = COMPANIES[phoneNumberId];
  if (configured) return { phoneNumberId, ...configured };

  // Falls back to the original demo company when the inbound number is the
  // one already configured via WHATSAPP_PHONE_NUMBER_ID — no entry needed
  // above for the very first (demo) number.
  if (phoneNumberId === process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return {
      phoneNumberId,
      name: "SwissClean Sàrl",
      notifyEmail: process.env.COMPANY_NOTIFY_EMAIL,
      pricing: defaultPricing,
    };
  }

  return null;
}

module.exports = { getCompanyByPhoneNumberId };
