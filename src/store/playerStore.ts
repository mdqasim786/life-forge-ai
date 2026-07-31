// ─── Player Profile & Attributes Store (Zustand) ─────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, subDays, parseISO } from 'date-fns';
import type { Attributes, AttributeName, UserProfile } from '../types';
import { useHabitStore } from './habitStore';
import { useAuthStore } from './authStore';
import {
  calculateDayDelta,
  applyAttributeDelta,
  foldMissedDays,
  calculateOverallRating,
  getDefaultAttributes,
} from '../utils/attributeLogic';
import { syncProfileToSupabase, syncAttributesToSupabase } from '../lib/sync';
import { getTodayStr } from '../utils/dateUtils';

interface PlayerState {
  profile: UserProfile;
  attributes: Attributes;

  /** Snapshot of attributes with every day up to `attributesBaseDate` folded in exactly once */
  attributesBase: Attributes;
  /** Last date already folded into `attributesBase` (YYYY-MM-DD); '' = not migrated yet */
  attributesBaseDate: string;

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
      attributesBase: getDefaultAttributes(),
      attributesBaseDate: '',

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
        const today = getTodayStr();
        const yesterday = format(subDays(parseISO(today), 1), 'yyyy-MM-dd');
        const state = get();

        // Migration: if no base snapshot exists yet, adopt the current
        // attributes as the baseline — undoing today's delta (which gets
        // re-applied fresh below) so the displayed rating doesn't jump.
        let base = state.attributesBase;
        let baseDate = state.attributesBaseDate;
        if (!baseDate) {
          const todayDelta = calculateDayDelta(habits, today);
          base = { ...state.attributes };
          for (const name of Object.keys(base) as AttributeName[]) {
            base[name] = base[name] - todayDelta[name];
          }
          baseDate = yesterday;
        }

        // Fold each day between the base date and yesterday exactly once.
        // Past days are immutable — their delta can never be re-applied.
        base = foldMissedDays(base, baseDate, habits, today);

        // Today's contribution is recomputed fresh each time → IDEMPOTENT:
        // refreshing any number of times on the same day yields the exact
        // same result, so the rating can never drop on refresh.
        const updated = applyAttributeDelta(base, calculateDayDelta(habits, today));

        set({ attributes: updated, attributesBase: base, attributesBaseDate: yesterday });

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
