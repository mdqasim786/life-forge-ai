-- ─── Fix: Add default UUID to completions.id ─────────────────────────────────
-- The completions table has `id TEXT PRIMARY KEY` with NO default, but
-- `addCompletionToSupabase` was upserting rows without providing `id`.
-- This caused silent INSERT failures, so completions never reached the DB.
-- Fix: set a default value so new inserts work without an explicit `id`.
ALTER TABLE completions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
