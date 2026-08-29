const { createClient } = require("@supabase/supabase-js");
const defaultPricing = require("../docs/pricing.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

/**
 * Shared tenant registry (Supabase `companies` table, managed from the
 * Dealz CRM's own "Companies" page) — one row per real cleaning company,
 * looked up two ways depending on the channel:
 *   - by `phone_number_id` for WhatsApp (see src/whatsapp.js)
 *   - by `id` (a slug) for the website widget, sent as the
 *     data-dealz-company="..." attribute on docs/embed.js's script tag
 *
 * One company, one config, whichever channels they actually use — a
 * company with no phone_number_id set just never matches on WhatsApp
 * lookups, same idea for a company that doesn't use the website widget.
 *
 * Both lookups fall back to the original single-tenant demo company
 * (SwissClean Sàrl + docs/pricing.json) when nothing matches, so the
 * existing WHATSAPP_PHONE_NUMBER_ID deployment and the website demo keep
 * working unchanged for anyone who hasn't added real tenants yet.
 */

function defaultCompany() {
  return {
    id: null,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
    name: "SwissClean Sàrl",
    notifyEmail: process.env.COMPANY_NOTIFY_EMAIL,
    pricing: defaultPricing,
  };
}

function rowToCompany(row) {
  return {
    id: row.id,
    phoneNumberId: row.phone_number_id,
    name: row.name,
    notifyEmail: row.notify_email,
    pricing: row.pricing,
  };
}

async function getCompanyByPhoneNumberId(phoneNumberId) {
  if (!phoneNumberId) return null;

  if (supabase) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("phone_number_id", phoneNumberId)
      .maybeSingle();
    if (error) throw error;
    if (data) return rowToCompany(data);
  }

  // Falls back to the demo company when the inbound number is the one
  // already configured via WHATSAPP_PHONE_NUMBER_ID — no row needed in
  // `companies` for the very first (demo) number.
  if (phoneNumberId === process.env.WHATSAPP_PHONE_NUMBER_ID) return defaultCompany();
  return null;
}

// Used by the website widget — no fallback-by-env-var here (there's no
// single "default slug"), so an unrecognized or missing slug just means
// "use the demo": callers pass the resolved company straight to
// runTurn/runTurnMock, which already default to the demo when given
// `undefined`.
async function getCompanyBySlug(slug) {
  if (!slug || !supabase) return null;
  const { data, error } = await supabase.from("companies").select("*").eq("id", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToCompany(data) : null;
}

module.exports = { getCompanyByPhoneNumberId, getCompanyBySlug, defaultCompany };
