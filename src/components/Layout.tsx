// ─── Main Layout Wrapper ─────────────────────────────────────────────────────

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative max-w-2xl mx-auto px-4 pb-24 pt-6">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <Navigation />
    </div>
  );
};

export default Layout;
