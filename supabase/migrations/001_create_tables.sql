-- ─── LifeForge AI — Supabase Schema ───────────────────────────────────────────
-- Run this in your Supabase project's SQL Editor (or via `supabase migration`).

/* ─── Profiles ──────────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL DEFAULT 'LifeForge Player',
  avatar    TEXT NOT NULL DEFAULT '',
  join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attributes JSONB NOT NULL DEFAULT '{
    "Fitness & Diet": 50,
    "Self Growth": 50,
    "Deen": 50,
    "CS Scientist": 50,
    "Agents Expert": 50,
    "Human Being": 50
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar, join_date, attributes)
  VALUES (
    NEW.id,
    'LifeForge Player',
    '',
    NOW(),
    '{
      "Fitness & Diet": 50,
      "Self Growth": 50,
      "Deen": 50,
      "CS Scientist": 50,
      "Agents Expert": 50,
      "Human Being": 50
    }'::jsonb
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/* ─── Habits ────────────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,
  frequency   TEXT NOT NULL DEFAULT 'daily',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

/* ─── Completions ───────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS completions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id        UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_user_id ON completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id);

/* ─── Row-Level Security ────────────────────────────────────────────────────── */
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update only their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Habits: users can CRUD only their own habits
CREATE POLICY "habits_select_own" ON habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Completions: users can CRUD only their own completions
CREATE POLICY "completions_select_own" ON completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_insert_own" ON completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_delete_own" ON completions
  FOR DELETE USING (auth.uid() = user_id);
