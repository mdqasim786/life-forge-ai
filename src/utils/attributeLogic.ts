// ─── Attribute Calculation Logic ─────────────────────────────────────────────

import { format, addDays, subDays, parseISO } from 'date-fns';
import type { Attributes, AttributeName, Habit, HabitCategory } from '../types';
import { CATEGORY_ATTRIBUTE_MAP } from '../types';
import { getTodayStr, getLastNDaysAsc } from './dateUtils';

/** Clamp an attribute value between 1 and 99 */
const clamp = (value: number): number => Math.max(1, Math.min(99, Math.round(value)));

/** Build a zeroed attribute set (used for per-day deltas) */
const zeroAttributes = (): Attributes => ({
  'Fitness & Diet': 0,
  'Self Growth': 0,
  Deen: 0,
  'CS Scientist': 0,
  'Agents Expert': 0,
  'Human Being': 0,
});

/**
 * Compute the attribute delta for ONE specific day based on completion history.
 * - +1 for each habit completed that day
 * - -2 for each habit that existed before that day but was NOT completed
 */
export const calculateDayDelta = (habits: Habit[], dayStr: string): Attributes => {
  const delta = zeroAttributes();

  for (const habit of habits) {
    const attr = CATEGORY_ATTRIBUTE_MAP[habit.category];
    if (!attr) continue;

    if (habit.completionHistory.includes(dayStr)) {
      delta[attr] += 1; // Completed → +1
    } else if (habit.createdAt < dayStr) {
      delta[attr] -= 2; // Missed → -2
    }
  }

  return delta;
};

/** Add a day-delta to a base attribute set, keeping values clamped to [1, 99] */
export const applyAttributeDelta = (
  base: Attributes,
  delta: Attributes
): Attributes => {
  const updated: Attributes = { ...base };
  for (const name of Object.keys(base) as AttributeName[]) {
    updated[name] = clamp(base[name] + delta[name]);
  }
  return updated;
};

/**
 * Fold every day between baseDate (exclusive) and today (exclusive) into the
 * base attributes — each past day's +1/-2 delta is applied exactly ONCE.
 *
 * This is what makes attribute recalculation IDEMPOTENT: refreshing the page
 * any number of times on the same day never re-applies today's (or any past
 * day's) delta, so the rating can't bleed down on every refresh.
 */
export const foldMissedDays = (
  base: Attributes,
  baseDate: string, // YYYY-MM-DD
  habits: Habit[],
  today: string // YYYY-MM-DD
): Attributes => {
  let result = { ...base };
  let cursor = addDays(parseISO(baseDate), 1);
  const yesterday = subDays(parseISO(today), 1);

  while (cursor <= yesterday) {
    result = applyAttributeDelta(
      result,
      calculateDayDelta(habits, format(cursor, 'yyyy-MM-dd'))
    );
    cursor = addDays(cursor, 1);
  }

  return result;
};

/**
 * Calculate updated attributes based on today's habit completions.
 *
 * Rules:
 * - +1 for each completed habit today
 * - -2 for each existing habit NOT completed today
 * - Attributes clamped to [1, 99]
 *
 * NOTE: This applies today's delta incrementally on top of the supplied
 * attributes, so repeated calls compound. Prefer `calculateDayDelta` +
 * `foldMissedDays` + `applyAttributeDelta` (see playerStore) for idempotent
 * recalculation.
 */
export const calculateAttributes = (
  currentAttributes: Attributes,
  habits: Habit[],
): Attributes => {
  const today = getTodayStr();
  const updated: Attributes = { ...currentAttributes };

  // Group habits by their mapped attribute
  const habitsByAttribute = new Map<AttributeName, Habit[]>();

  for (const habit of habits) {
    const attr = CATEGORY_ATTRIBUTE_MAP[habit.category];
    if (!habitsByAttribute.has(attr)) {
      habitsByAttribute.set(attr, []);
    }
    habitsByAttribute.get(attr)!.push(habit);
  }

  for (const [attribute, attrHabits] of habitsByAttribute.entries()) {
    let delta = 0;

    for (const habit of attrHabits) {
      const wasCompletedToday = habit.completionHistory.includes(today);

      if (wasCompletedToday) {
        delta += 1; // Completed → +1
      } else {
        // Only penalize if the habit was created before today
        const createdBeforeToday = habit.createdAt < today;
        if (createdBeforeToday) {
          delta -= 2; // Missed → -2
        }
      }
    }

    updated[attribute] = clamp(updated[attribute] + delta);
  }

  return updated;
};

/**
 * Calculate overall rating as average of all six attributes.
 */
export const calculateOverallRating = (attributes: Attributes): number => {
  const values = Object.values(attributes);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.max(1, Math.min(99, Math.round(sum / values.length)));
};

/**
 * Determine card tier based on overall rating.
 */
export const getCardTier = (rating: number): 'bronze' | 'silver' | 'gold' | 'icon' => {
  if (rating >= 94) return 'icon';
  if (rating >= 80) return 'gold';
  if (rating >= 70) return 'silver';
  return 'bronze';
};

/**
 * Get the best and worst attributes.
 */
export const getBestAttribute = (attributes: Attributes): { name: AttributeName; value: number } => {
  let best: AttributeName = 'Fitness & Diet';
  let bestVal = -1;
  for (const [key, val] of Object.entries(attributes)) {
    if (val > bestVal) {
      bestVal = val;
      best = key as AttributeName;
    }
  }
  return { name: best, value: bestVal };
};

export const getWorstAttribute = (attributes: Attributes): { name: AttributeName; value: number } => {
  let worst: AttributeName = 'Fitness & Diet';
  let worstVal = 100;
  for (const [key, val] of Object.entries(attributes)) {
    if (val < worstVal) {
      worstVal = val;
      worst = key as AttributeName;
    }
  }
  return { name: worst, value: worstVal };
};

/**
 * Calculate current streak of consecutive days with at least one completion.
 */
export const calculateStreak = (habits: Habit[]): number => {
  // Collect all unique days where at least one habit was completed
  const completionDays = new Set<string>();
  for (const habit of habits) {
    for (const date of habit.completionHistory) {
      completionDays.add(date);
    }
  }

  const sortedDays = Array.from(completionDays).sort().reverse();
  let streak = 0;
  const today = getTodayStr();

  // Check if today is completed (or yesterday if today hasn't started)
  let checkDate = today;
  for (const day of sortedDays) {
    if (day === checkDate) {
      streak++;
      // Move to previous day
      const d = new Date(day);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (day < checkDate) {
      // Gap found, break
      break;
    }
  }

  // If today is not completed, check if streak ended yesterday
  if (!completionDays.has(today) && streak === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (completionDays.has(yesterdayStr)) {
      // Recalculate starting from yesterday
      checkDate = yesterdayStr;
      for (const day of sortedDays) {
        if (day === checkDate) {
          streak++;
          const d = new Date(day);
          d.setDate(d.getDate() - 1);
          checkDate = d.toISOString().split('T')[0];
        } else if (day < checkDate) {
          break;
        }
      }
    }
  }

  return streak;
};

/**
 * Calculate weekly completion percentage across all habits.
 */
export const calculateWeeklyCompletion = (habits: Habit[]): number => {
  const last7Days = getLastNDaysAsc(7);
  let totalPossible = 0;
  let totalCompleted = 0;

  for (const habit of habits) {
    for (const day of last7Days) {
      const createdBeforeOrOn = habit.createdAt <= day;
      if (createdBeforeOrOn) {
        totalPossible++;
        if (habit.completionHistory.includes(day)) {
          totalCompleted++;
        }
      }
    }
  }

  if (totalPossible === 0) return 0;
  return Math.round((totalCompleted / totalPossible) * 100);
};

/**
 * Get total number of habit completions across all habits.
 */
export const getTotalCompletions = (habits: Habit[]): number => {
  return habits.reduce((sum, h) => sum + h.completionHistory.length, 0);
};

/**
 * Initialize default attributes with all values at 50.
 */
export const getDefaultAttributes = (): Attributes => ({
  'Fitness & Diet': 50,
  'Self Growth': 50,
  Deen: 50,
  'CS Scientist': 50,
  'Agents Expert': 50,
  'Human Being': 50,
});
