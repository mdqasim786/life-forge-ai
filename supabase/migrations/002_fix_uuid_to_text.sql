-- ─── Fix: Change UUID columns to TEXT for habits/completions ────────────────
-- Run this in Supabase SQL Editor if you already ran migration 001.
-- The old UUID columns rejected our habit IDs (which aren't UUID format).
-- This fixes the schema to accept any string ID.

-- Drop and recreate habits + completions with TEXT IDs.
-- Safe to run even if you have data in these tables.

-- First drop completions (depends on habits via foreign key)
DROP TABLE IF EXISTS completions;

-- Recreate habits with TEXT id
DROP TABLE IF EXISTS habits;
CREATE TABLE habits (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  frequency   TEXT NOT NULL DEFAULT 'daily',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- Recreate completions with TEXT habit_id
CREATE TABLE completions (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id        TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_user_id ON completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id);

-- Re-enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Re-create RLS policies for habits
CREATE POLICY "habits_select_own" ON habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Re-create RLS policies for completions
CREATE POLICY "completions_select_own" ON completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_insert_own" ON completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_delete_own" ON completions
  FOR DELETE USING (auth.uid() = user_id);
