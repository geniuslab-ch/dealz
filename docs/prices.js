/**
 * Dealz's own prices, one list per currency. The single source for the
 * website (docs/currency.js, docs/pricing.js, docs/contact-flow.js) and
 * for Stripe Checkout (src/billing.js requires this file).
 *
 * Each market has its own numbers, deliberately precise (CHF 108.70, not
 * CHF 109): a price calculated to the cent, not padded.
 *
 *   plans   monthly price per plan
 *   setup   one-time setup fee on monthly billing (0 = none, e.g. the US)
 *   extra   price per conversation beyond the included ones
 *   once    lifetime launch offer, sold until ONCE_UNTIL
 *
 * Yearly billing is YEAR_MONTHS × the monthly price (2 months free), setup
 * included. Prices exclude VAT / sales tax.
 */
(function (root) {
  "use strict";

  var PRICES = {
    CHF: {
      plans: { CAPTURE: 58.4, CLOSE: 108.7, SCALE: 218.6 },
      setup: 290,
      extra: 0.3,
      once: { CAPTURE: 1717.3, CLOSE: 2660.8, SCALE: 3250.1 },
    },
    EUR: {
      plans: { CAPTURE: 38.7, CLOSE: 78.4, SCALE: 158.9 },
      setup: 190,
      extra: 0.25,
      once: { CAPTURE: 1137.9, CLOSE: 1919.1, SCALE: 2362.5 },
    },
    GBP: {
      plans: { CAPTURE: 38.6, CLOSE: 74.8, SCALE: 148.7 },
      setup: 190,
      extra: 0.25,
      once: { CAPTURE: 1135.1, CLOSE: 1830.9, SCALE: 2210.8 },
    },
    USD: {
      plans: { CAPTURE: 48.7, CLOSE: 98.6, SCALE: 198.4 },
      setup: 0,
      extra: 0.3,
      once: { CAPTURE: 1432.1, CLOSE: 2413.6, SCALE: 2949.8 },
    },
  };

  var api = {
    PRICES: PRICES,
    PLANS: ["CAPTURE", "CLOSE", "SCALE"],
    CURRENCIES: ["CHF", "EUR", "GBP", "USD"],
    YEAR_MONTHS: 10,
    CONVERSATIONS_INCLUDED: 100,
    ONCE_UNTIL: "2027-01-01T00:00:00+01:00",
    /** Price list for a currency code (any case); CHF when unknown. */
    list: function (code) {
      return PRICES[String(code || "").toUpperCase()] || PRICES.CHF;
    },
    /** Yearly price: YEAR_MONTHS × monthly, to the cent. */
    yearly: function (month) {
      return Math.round(month * 100 * api.YEAR_MONTHS) / 100;
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DealzPrices = api;
})(typeof window !== "undefined" ? window : this);
