// ─── Habit State Store (Zustand) ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitCategory, HabitFrequency } from '../types';
import { getTodayStr, isDayAllowedByFrequency } from '../utils/dateUtils';
import { useAuthStore } from './authStore';
import { usePlayerStore } from './playerStore';
import {
  syncHabitToSupabase,
  deleteHabitFromSupabase,
  addCompletionToSupabase,
  removeCompletionFromSupabase,
} from '../lib/sync';

interface HabitState {
  habits: Habit[];

  /** Bulk-replace all habits (used when loading from Supabase) */
  loadHabits: (habits: Habit[]) => void;

  /** Add a new habit */
  addHabit: (title: string, category: HabitCategory, frequency: HabitFrequency) => void;

  /** Remove a habit by ID */
  removeHabit: (id: string) => void;

  /** Toggle completion status for a habit on a specific date */
  toggleCompletion: (habitId: string, dateStr: string) => void;

  /** Get a specific habit by ID */
  getHabit: (id: string) => Habit | undefined;

  /** Check if a habit is completed today */
  isCompletedToday: (habitId: string) => boolean;
}

/** Generate a unique ID (UUID v4) */
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

      loadHabits: (habits) => {
        set({ habits });
      },

      addHabit: (title, category, frequency) => {
        const newHabit: Habit = {
          id: generateId(),
          title,
          category,
          frequency,
          createdAt: getTodayStr(),
          completionHistory: [],
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));

        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          syncHabitToSupabase(userId, newHabit);
        }

        // Recalculate attributes
        usePlayerStore.getState().recalculateAttributes();
      },

      removeHabit: (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));

        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          deleteHabitFromSupabase(userId, id);
        }

        // Recalculate attributes
        usePlayerStore.getState().recalculateAttributes();
      },

      toggleCompletion: (habitId, dateStr) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        // Block toggling if the frequency doesn't allow this day of the week
        if (!isDayAllowedByFrequency(habit.frequency, dateStr)) return;

        let wasCompleted = habit.completionHistory.includes(dateStr);

        set((state) => {
          return {
            habits: state.habits.map((h) => {
              if (h.id !== habitId) return h;
              return {
                ...h,
                completionHistory: wasCompleted
                  ? h.completionHistory.filter((d) => d !== dateStr)
                  : [...h.completionHistory, dateStr],
              };
            }),
          };
        });

        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          if (wasCompleted) {
            removeCompletionFromSupabase(userId, habitId, dateStr);
          } else {
            addCompletionToSupabase(userId, habitId, dateStr);
          }
        }

        // Recalculate attributes
        usePlayerStore.getState().recalculateAttributes();
      },

      getHabit: (id) => {
        return get().habits.find((h) => h.id === id);
      },

      isCompletedToday: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return false;
        return habit.completionHistory.includes(getTodayStr());
      },
    }),
    {
      name: 'life-forge-habits',
    }
  )
);
