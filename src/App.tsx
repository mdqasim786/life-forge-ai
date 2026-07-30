// ─── Main Application ────────────────────────────────────────────────────────

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import MyCard from './pages/MyCard';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
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
