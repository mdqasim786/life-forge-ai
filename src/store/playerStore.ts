// ─── Player Profile & Attributes Store (Zustand) ─────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attributes, UserProfile } from '../types';
import { useHabitStore } from './habitStore';
import {
  calculateAttributes,
  calculateOverallRating,
  getDefaultAttributes,
} from '../utils/attributeLogic';

interface PlayerState {
  profile: UserProfile;
  attributes: Attributes;

  /** Update user profile */
  updateProfile: (updates: Partial<UserProfile>) => void;

  /** Recalculate attributes based on current habits */
  recalculateAttributes: () => void;

  /** Get the current overall rating */
  getOverallRating: () => number;

  /** Get all attributes as a sorted array for display */
  getAttributesArray: () => { name: string; value: number }[];
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'LifeForge Player',
        avatar: '',
        joinDate: new Date().toISOString(),
      },

      attributes: getDefaultAttributes(),

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      recalculateAttributes: () => {
        const habits = useHabitStore.getState().habits;
        const currentAttributes = get().attributes;
        const updated = calculateAttributes(currentAttributes, habits);
        set({ attributes: updated });
      },

      getOverallRating: () => {
        return calculateOverallRating(get().attributes);
      },

      getAttributesArray: () => {
        const attrs = get().attributes;
        return Object.entries(attrs).map(([name, value]) => ({
          name,
          value,
        }));
      },
    }),
    {
      name: 'life-forge-player',
    }
  )
);
