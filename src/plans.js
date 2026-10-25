/**
 * What each Dealz plan includes, as the pricing page lists it. A company's
 * plan comes from its CRM record (companies.plan). Demo pages and companies
 * without a plan yet get everything, so nothing changes for them.
 *
 *   CAPTURE  quote, PDF, online accept/decline, confirmation, calendar
 *   CLOSE    + decline recovery: reason detection, suggested reply,
 *              counter-offer / new date / follow-up from the e-mail
 *   SCALE    + team features (staff, calendars, assignment…)
 */
const PLAN_FEATURES = {
  CAPTURE: [],
  CLOSE: ["recovery"],
  SCALE: ["recovery", "team"],
};

function hasFeature(company, feature) {
  const plan = company && company.plan;
  if (!plan || !PLAN_FEATURES[plan]) return true;
  return PLAN_FEATURES[plan].includes(feature);
}

module.exports = { PLAN_FEATURES, hasFeature };
