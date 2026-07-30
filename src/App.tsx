// ─── Main Application ────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
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
import { loadAllFromSupabase, syncAllToSupabase } from './lib/sync';
import { isSupabaseConfigured } from './lib/supabase';

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

  useEffect(() => {
    initialize();
  }, [initialize]);

  // When auth state changes → load or clear data
  useEffect(() => {
    if (!initialized) return;

    const syncData = async () => {
      if (user) {
        setSyncing(true);
        // Try loading from Supabase
        const data = await loadAllFromSupabase(user.id);

        if (data && data.habits.length > 0) {
          // Supabase has data → use it (source of truth)
          loadHabits(data.habits);
          loadPlayerData({ profile: data.profile, attributes: data.attributes });
        } else {
          // No Supabase data yet → migrate localStorage data to cloud
          const localHabits = useHabitStore.getState().habits;
          const localPlayer = usePlayerStore.getState();

          if (localHabits.length > 0) {
            await syncAllToSupabase(
              user.id,
              localHabits,
              localPlayer.profile,
              localPlayer.attributes
            );
          } else {
            // Fresh user with no data → create default profile in Supabase
            await syncAllToSupabase(
              user.id,
              [],
              localPlayer.profile,
              localPlayer.attributes
            );
          }
        }
        setSyncing(false);
      }
    };

    syncData();
  }, [user, initialized, loadHabits, loadPlayerData]);

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
