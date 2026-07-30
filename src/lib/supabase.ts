// ─── Supabase Client ─────────────────────────────────────────────────────────
// Provides a configured Supabase client if environment variables are set.
// Falls back to null so the app still works with localStorage-only mode.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isSupabaseConfigured = (): boolean =>
  !!supabaseUrl && !!supabaseAnonKey;

export type SupabaseClient = NonNullable<typeof supabase>;
