const store = require("./store");

/**
 * Per-IP limit for the public forms that write into the CRM (install
 * request, referral, demo lead gate), so a script can't flood the pipeline.
 * Counts live in src/store.js (shared by every serverless instance), one key
 * per form, IP and hour. Not atomic — a burst of parallel requests can slip a
 * few over the limit — which is fine for this purpose.
 *
 * Fails open: if the store errors, the request goes through, like the rest
 * of this codebase's graceful-degradation posture.
 */
const HOUR_MS = 60 * 60 * 1000;
const PREFIX = "rl:";

function clientIp(req) {
  return req.get("x-real-ip") || req.ip || "unknown";
}

function rateLimit(name, maxPerHour) {
  return async (req, res, next) => {
    try {
      const key = `${PREFIX}${name}:${clientIp(req)}:${Math.floor(Date.now() / HOUR_MS)}`;
      const entry = (await store.getKey(key)) || { count: 0 };
      if (entry.count >= maxPerHour) {
        return res.status(429).json({ error: "Trop de demandes — réessayez dans une heure." });
      }
      await store.setKey(key, { count: entry.count + 1 });
    } catch (err) {
      console.error(`[rate-limit] ${name}: store failed, letting the request through:`, err.message);
    }
    next();
  };
}

module.exports = { rateLimit, PREFIX };
