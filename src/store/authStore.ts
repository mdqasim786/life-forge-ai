// ─── Authentication Store ────────────────────────────────────────────────────
// Manages Supabase auth state: session, login, signup, logout.

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  /** Check for existing session on app start & subscribe to changes */
  initialize: () => Promise<void>;

  /** Sign in with email & password */
  signIn: (email: string, password: string) => Promise<{ error?: string }>;

  /** Sign up with email & password, then auto-create a profile */
  signUp: (email: string, password: string) => Promise<{ error?: string }>;

  /** Sign out */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (!supabase) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false, initialized: true });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null, loading: false });
      });
    } catch {
      set({ user: null, loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: 'Supabase not configured' };

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  },

  signUp: async (email, password) => {
    if (!supabase) return { error: 'Supabase not configured' };

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };

      // Profile is auto-created by the database trigger (handle_new_user)
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' };
    }
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
