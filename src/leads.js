const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

const FREE_TRIAL_LIMIT = Number(process.env.DEMO_TRIAL_LIMIT) || 3;

/**
 * Records a demo-trial attempt for this e-mail and returns whether they're
 * still within their free-trial allowance for the public demo.
 *
 * This is a soft limit — the e-mail is self-reported and unverified, so a
 * determined visitor can reset their count with a new address. It's meant
 * to slow down casual repeat use of a paid API, not to be real anti-abuse.
 *
 * Fails open when Supabase isn't configured (no SUPABASE_URL/
 * SUPABASE_SERVICE_KEY in .env) so the public demo never breaks because of
 * this — matches the same graceful-degradation pattern as MOCK_MODE and the
 * SMTP dry-run fallback elsewhere in this codebase.
 */
async function recordTrialAttempt({ email, phone, companyName }) {
  if (!supabase) {
    return { allowed: true, trialsUsed: 1, limit: FREE_TRIAL_LIMIT, configured: false };
  }

  const { data: existing, error: selectErr } = await supabase
    .from("leads")
    .select("id, trial_count")
    .eq("email", email)
    .maybeSingle();

  if (selectErr) {
    console.error("[leads] select failed, failing open:", selectErr.message);
    return { allowed: true, trialsUsed: 1, limit: FREE_TRIAL_LIMIT, configured: true };
  }

  if (existing) {
    const trialsUsed = existing.trial_count + 1;
    const allowed = trialsUsed <= FREE_TRIAL_LIMIT;
    if (allowed) {
      const { error: updateErr } = await supabase
        .from("leads")
        .update({ trial_count: trialsUsed, phone, company_name: companyName, last_seen_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (updateErr) console.error("[leads] update failed:", updateErr.message);
    }
    return { allowed, trialsUsed, limit: FREE_TRIAL_LIMIT, configured: true };
  }

  const { error: insertErr } = await supabase
    .from("leads")
    .insert({ email, phone, company_name: companyName, trial_count: 1, source: "demo" });
  if (insertErr) console.error("[leads] insert failed:", insertErr.message);

  return { allowed: true, trialsUsed: 1, limit: FREE_TRIAL_LIMIT, configured: true };
}

module.exports = { recordTrialAttempt };
