// ─── Habit State Store (Zustand) ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitCategory, HabitFrequency } from '../types';
import { getTodayStr } from '../utils/dateUtils';

interface HabitState {
  habits: Habit[];

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

/** Generate a unique ID */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

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
      },

      removeHabit: (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
      },

      toggleCompletion: (habitId, dateStr) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== habitId) return habit;

            const exists = habit.completionHistory.includes(dateStr);
            return {
              ...habit,
              completionHistory: exists
                ? habit.completionHistory.filter((d) => d !== dateStr)
                : [...habit.completionHistory, dateStr],
            };
          }),
        }));
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
