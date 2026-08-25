const crypto = require("crypto");

/**
 * In-memory store for pending counteroffer/offer tokens. Fine for a demo /
 * single-process MVP; swap for a real database (Redis/Postgres) before real
 * production use — an in-memory Map is lost on every server restart and
 * doesn't work across multiple server instances.
 */

const store = new Map();
const TTL_MS = 1000 * 60 * 60 * 48; // 48h

function makeToken() {
  return crypto.randomBytes(16).toString("hex");
}

function put(data) {
  const token = makeToken();
  store.set(token, { ...data, createdAt: Date.now() });
  return token;
}

function get(token) {
  const entry = store.get(token);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(token);
    return null;
  }
  return entry;
}

function update(token, patch) {
  const entry = get(token);
  if (!entry) return null;
  const next = { ...entry, ...patch };
  store.set(token, next);
  return next;
}

module.exports = { put, get, update };
