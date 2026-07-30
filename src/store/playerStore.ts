// ─── Player Profile & Attributes Store (Zustand) ─────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attributes, UserProfile } from '../types';
import { useHabitStore } from './habitStore';
import { useAuthStore } from './authStore';
import {
  calculateAttributes,
  calculateOverallRating,
  getDefaultAttributes,
} from '../utils/attributeLogic';
import { syncProfileToSupabase, syncAttributesToSupabase } from '../lib/sync';

interface PlayerState {
  profile: UserProfile;
  attributes: Attributes;

  /** Bulk-replace player data (used when loading from Supabase) */
  loadPlayerData: (data: { profile: UserProfile; attributes: Attributes }) => void;

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

      loadPlayerData: (data) => {
        set({ profile: data.profile, attributes: data.attributes });
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));

        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          const newProfile = { ...get().profile, ...updates };
          syncProfileToSupabase(userId, { name: newProfile.name, avatar: newProfile.avatar });
        }
      },

      recalculateAttributes: () => {
        const habits = useHabitStore.getState().habits;
        const currentAttributes = get().attributes;
        const updated = calculateAttributes(currentAttributes, habits);
        set({ attributes: updated });

        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          syncAttributesToSupabase(userId, updated);
        }
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
