const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

/**
 * Persistent store for pending counteroffer/offer tokens (the decline ->
 * counteroffer -> offer -> accept flow). Backed by Supabase (the same
 * project the Dealz CRM already uses) — this used to be a plain in-memory
 * Map, which broke almost every real link in production: Vercel serverless
 * functions don't share memory between invocations, so the request that
 * creates a token (POST /api/decline) and the later request that reads it
 * (GET /api/counteroffer/:token, whenever the owner actually clicks the
 * e-mail) can land on completely different instances, making the token
 * look "expired" even seconds after creation.
 *
 * Falls back to an in-memory Map ONLY when SUPABASE_URL/SUPABASE_SERVICE_KEY
 * aren't set (e.g. local dev with no .env) — still has the cross-instance
 * problem, but keeps `npm start` working with zero setup, same posture as
 * MOCK_MODE and the SMTP dry-run fallback elsewhere in this codebase.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

const TTL_MS = 1000 * 60 * 60 * 48; // 48h

const memoryStore = new Map();

function makeToken() {
  return crypto.randomBytes(16).toString("hex");
}

async function put(data) {
  const token = makeToken();
  if (!supabase) {
    memoryStore.set(token, { data, createdAt: Date.now() });
    return token;
  }
  const { error } = await supabase.from("store_entries").insert({ token, data });
  if (error) throw error;
  return token;
}

async function get(token) {
  if (!supabase) {
    const entry = memoryStore.get(token);
    if (!entry) return null;
    if (Date.now() - entry.createdAt > TTL_MS) {
      memoryStore.delete(token);
      return null;
    }
    return entry.data;
  }
  const { data: row, error } = await supabase
    .from("store_entries")
    .select("data, created_at")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  if (Date.now() - new Date(row.created_at).getTime() > TTL_MS) {
    await supabase.from("store_entries").delete().eq("token", token);
    return null;
  }
  return row.data;
}

async function update(token, patch) {
  const entry = await get(token);
  if (!entry) return null;
  const next = { ...entry, ...patch };
  if (!supabase) {
    const existing = memoryStore.get(token);
    memoryStore.set(token, { data: next, createdAt: existing.createdAt });
    return next;
  }
  const { error } = await supabase.from("store_entries").update({ data: next }).eq("token", token);
  if (error) throw error;
  return next;
}

// Fixed-key entries (e.g. one WhatsApp conversation per sender), stored in
// the same table under a caller-chosen token so every serverless instance
// sees the same state. Same 48h expiry as put/get.
async function getKey(key) {
  return get(key);
}

async function setKey(key, data) {
  if (!supabase) {
    const existing = memoryStore.get(key);
    memoryStore.set(key, { data, createdAt: existing ? existing.createdAt : Date.now() });
    return;
  }
  const { error } = await supabase.from("store_entries").upsert({ token: key, data }, { onConflict: "token" });
  if (error) throw error;
}

async function deleteKey(key) {
  if (!supabase) return void memoryStore.delete(key);
  const { error } = await supabase.from("store_entries").delete().eq("token", key);
  if (error) throw error;
}

// Rate-limit counters (src/rateLimit.js) are only read during their own hour
// and would otherwise pile up: the daily cron deletes those older than a day.
async function purgeRateLimitKeys() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  if (!supabase) {
    let n = 0;
    for (const [k, v] of memoryStore) if (k.startsWith("rl:") && v.createdAt < cutoff) memoryStore.delete(k), n++;
    return n;
  }
  const { data, error } = await supabase
    .from("store_entries")
    .delete()
    .like("token", "rl:%")
    .lt("created_at", new Date(cutoff).toISOString())
    .select("token");
  if (error) throw error;
  return data.length;
}

module.exports = { put, get, update, getKey, setKey, deleteKey, purgeRateLimitKeys };
