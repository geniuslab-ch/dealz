-- Persistent store for the main Dealz site's pending counteroffer/offer
-- tokens (decline -> counteroffer -> offer -> accept flow). Replaces the
-- old in-memory Map, which silently lost almost every token in production
-- because Vercel serverless functions don't share memory between
-- invocations — the request that creates a token and the later request
-- that reads it can land on different instances entirely.
--
-- Run once in the SAME Supabase project the Dealz CRM already uses
-- (Table Editor > SQL Editor > New query > paste > Run). Safe to re-run.

create table if not exists store_entries (
  token text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_entries_created_at on store_entries(created_at);

alter table store_entries enable row level security;
