// ─── Main Application ────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import MyCard from './pages/MyCard';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import { useAuthStore } from './store/authStore';
import { useHabitStore } from './store/habitStore';
import { usePlayerStore } from './store/playerStore';
import { loadAllFromSupabase, syncAllToSupabase, mergeHabitsWithServer, getLastLocalWrite } from './lib/sync';
import { isSupabaseConfigured, supabase } from './lib/supabase';

/** Loading splash screen shown while auth state is being resolved */
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-5xl mb-4"
      >
        ⚡
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-sm text-white/30 font-medium"
      >
        Loading LifeForge...
      </motion.div>
    </div>
  </div>
);

const App: React.FC = () => {
  const { user, loading, initialized, initialize } = useAuthStore();
  const loadHabits = useHabitStore((s) => s.loadHabits);
  const loadPlayerData = usePlayerStore((s) => s.loadPlayerData);
  const [syncing, setSyncing] = useState(false);
  const localHabits = useHabitStore((s) => s.habits);
  const lastSyncRef = useRef(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ── Initial sync: reconcile localStorage with Supabase ──────────────────
  useEffect(() => {
    if (!initialized) return;

    const syncData = async () => {
      if (!user) return;

      setSyncing(true);
      const data = await loadAllFromSupabase(user.id);
      const syncFlagKey = `life-forge-synced-${user.id}`;
      const hasSyncedBefore = localStorage.getItem(syncFlagKey);

      if (data && data.habits.length > 0) {
        // ── Server has habits → MERGE with local so unsynced ticks survive ──
        // Local (localStorage) may be fresher than the cloud: ticks made right
        // before a refresh can have their fire-and-forget sync aborted by the
        // browser, so we union the completion histories instead of replacing.
        const localHabits = useHabitStore.getState().habits;
        const mergedHabits = mergeHabitsWithServer(localHabits, data.habits);

        loadHabits(mergedHabits);
        loadPlayerData({ profile: data.profile, attributes: data.attributes });

        // Recalculate attributes from the merged completions (and re-sync them)
        usePlayerStore.getState().recalculateAttributes();

        // Push the merged state back to the cloud so nothing is lost
        if (mergedHabits.length > 0) {
          await syncAllToSupabase(
            user.id,
            mergedHabits,
            usePlayerStore.getState().profile,
            usePlayerStore.getState().attributes
          );
        }
        localStorage.setItem(syncFlagKey, 'true');
        setSyncing(false);
        return;
      }

      if (data && hasSyncedBefore) {
        // ── Previously synced, but server is clean (user deleted everything on another device) ──
        loadHabits(data.habits); // empty array
        loadPlayerData({ profile: data.profile, attributes: data.attributes });
        setSyncing(false);
        return;
      }

      // ── First time logging in on this device → migrate local data to cloud ──
      const localState = useHabitStore.getState();
      const playerState = usePlayerStore.getState();

      // Normalize attributes (idempotent) before pushing them to the cloud
      usePlayerStore.getState().recalculateAttributes();

      await syncAllToSupabase(
        user.id,
        localState.habits,
        playerState.profile,
        usePlayerStore.getState().attributes
      );

      // Re-fetch from Supabase to ensure local state has the proper server-generated IDs
      const refreshedData = await loadAllFromSupabase(user.id);
      if (refreshedData) {
        loadHabits(refreshedData.habits);
        loadPlayerData({ profile: refreshedData.profile, attributes: refreshedData.attributes });
      }
      localStorage.setItem(syncFlagKey, 'true');
      setSyncing(false);
    };

    syncData();
  }, [user, initialized, loadHabits, loadPlayerData]);

  // ── Real-time: listen for changes from OTHER devices ────────────────────
  const channelRef = useRef<any>(null);
  useEffect(() => {
    if (!user || !supabase) return;

    const reFetch = async () => {
      const now = Date.now();
      // Ignore realtime echoes of our OWN writes (they were already applied
      // locally and persisted) — prevents stale fetches wiping fresh ticks
      if (now - getLastLocalWrite() < 2000) return;
      // Rate-limit consecutive fetches triggered by rapid events
      if (now - lastSyncRef.current < 2000) return;
      lastSyncRef.current = now;

      const data = await loadAllFromSupabase(user.id);
      if (data) {
        loadHabits(data.habits);
        loadPlayerData({ profile: data.profile, attributes: data.attributes });
      }
    };

    channelRef.current = supabase
      .channel('life-forge-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` },
        reFetch
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${user.id}` },
        reFetch
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, loadHabits, loadPlayerData]);

  // Show loading while auth is initializing or data is syncing
  if (loading || !initialized || (user && syncing)) {
    return <LoadingScreen />;
  }

  // If Supabase is not configured, skip auth (localStorage-only mode)
  if (!isSupabaseConfigured()) {
    return (
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="habits" element={<Habits />} />
              <Route path="my-card" element={<MyCard />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    );
  }

  // Auth page for unauthenticated users
  if (!user) {
    return <Auth />;
  }

  // Main app for authenticated users
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="habits" element={<Habits />} />
            <Route path="my-card" element={<MyCard />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
