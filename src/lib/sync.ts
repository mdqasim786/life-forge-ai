// ─── Supabase Sync Logic ─────────────────────────────────────────────────────
// Pure functions that read/write Supabase data.
// Takes userId + data as parameters (no store imports) to avoid circular deps.

import { supabase } from './supabase';
import type { Habit, Attributes } from '../types';

/** Regenerate IDs that aren't valid UUIDs (needed for habits created before UUID fix) */
const ensureValidUuid = (id: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  return id;
};

/* ─── Load: Pull all data from Supabase ─────────────────────────────────── */

export interface SupabaseData {
  habits: Habit[];
  attributes: Attributes;
  profile: { name: string; avatar: string; joinDate: string };
}

/**
 * Load all habits, completions, and profile for a user from Supabase.
 * Merges completions into habits as completionHistory arrays.
 */
export const loadAllFromSupabase = async (
  userId: string
): Promise<SupabaseData | null> => {
  if (!supabase) return null;

  const [habitsResult, completionsResult, profileResult] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('completions').select('*').eq('user_id', userId),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ]);

  // Merge completions into habits
  const completions = completionsResult.data ?? [];
  const completionMap = new Map<string, string[]>();
  for (const c of completions) {
    const existing = completionMap.get(c.habit_id) ?? [];
    existing.push(c.completion_date);
    completionMap.set(c.habit_id, existing);
  }

  const habits: Habit[] = (habitsResult.data ?? []).map((h: any) => ({
    id: h.id,
    title: h.title,
    category: h.category,
    frequency: h.frequency ?? 'daily',
    createdAt: h.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    completionHistory: completionMap.get(h.id) ?? [],
  }));

  const profileData = profileResult.data;
  const attributes: Attributes = profileData?.attributes ?? {
    'Fitness & Diet': 50,
    'Self Growth': 50,
    Deen: 50,
    'CS Scientist': 50,
    'Agents Expert': 50,
    'Human Being': 50,
  };

  const profile = {
    name: profileData?.name ?? 'LifeForge Player',
    avatar: profileData?.avatar ?? '',
    joinDate: profileData?.join_date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
  };

  return { habits, attributes, profile };
};

/* ─── Initial Sync: Upload all local data to Supabase ───────────────────── */

export const syncAllToSupabase = async (
  userId: string,
  habits: Habit[],
  profile: { name: string; avatar: string; joinDate: string },
  attributes: Attributes
): Promise<void> => {
  if (!supabase) return;

  if (habits.length > 0) {
    const habitRows = habits.map((h) => ({
      id: ensureValidUuid(h.id),
      user_id: userId,
      title: h.title,
      category: h.category,
      frequency: h.frequency,
      created_at: h.createdAt,
    }));
    await supabase.from('habits').upsert(habitRows, { onConflict: 'id' });

    const completionRows = habits.flatMap((h) =>
      h.completionHistory.map((date) => ({
        user_id: userId,
        habit_id: ensureValidUuid(h.id),
        completion_date: date,
      }))
    );
    if (completionRows.length > 0) {
      await supabase.from('completions').upsert(completionRows, {
        onConflict: 'habit_id,completion_date',
      });
    }
  }

  await supabase.from('profiles').upsert(
    { id: userId, name: profile.name, avatar: profile.avatar, join_date: profile.joinDate, attributes },
    { onConflict: 'id' }
  );
};

/* ─── Single Habit ──────────────────────────────────────────────────────── */

export const syncHabitToSupabase = async (
  userId: string,
  habit: Habit
): Promise<void> => {
  if (!supabase) return;
  await supabase.from('habits').upsert({
    id: ensureValidUuid(habit.id),
    user_id: userId,
    title: habit.title,
    category: habit.category,
    frequency: habit.frequency,
    created_at: habit.createdAt,
  }, { onConflict: 'id' });
};

export const deleteHabitFromSupabase = async (
  userId: string,
  habitId: string
): Promise<void> => {
  if (!supabase) return;
  const safeId = ensureValidUuid(habitId);
  await Promise.all([
    supabase.from('habits').delete().eq('id', safeId).eq('user_id', userId),
    supabase.from('completions').delete().eq('habit_id', safeId).eq('user_id', userId),
  ]);
};

/* ─── Completions ───────────────────────────────────────────────────────── */

export const addCompletionToSupabase = async (
  userId: string,
  habitId: string,
  dateStr: string
): Promise<void> => {
  if (!supabase) return;
  const safeId = ensureValidUuid(habitId);
  await supabase.from('completions').upsert({
    user_id: userId,
    habit_id: safeId,
    completion_date: dateStr,
  }, { onConflict: 'habit_id,completion_date' });
};

export const removeCompletionFromSupabase = async (
  userId: string,
  habitId: string,
  dateStr: string
): Promise<void> => {
  if (!supabase) return;
  const safeId = ensureValidUuid(habitId);
  await supabase
    .from('completions')
    .delete()
    .eq('habit_id', safeId)
    .eq('user_id', userId)
    .eq('completion_date', dateStr);
};

/* ─── Profile & Attributes ──────────────────────────────────────────────── */

export const syncProfileToSupabase = async (
  userId: string,
  profile: { name: string; avatar: string }
): Promise<void> => {
  if (!supabase) return;
  await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name,
    avatar: profile.avatar,
  }, { onConflict: 'id' });
};

export const syncAttributesToSupabase = async (
  userId: string,
  attributes: Attributes
): Promise<void> => {
  if (!supabase) return;
  await supabase.from('profiles').upsert({
    id: userId,
    attributes,
  }, { onConflict: 'id' });
};
