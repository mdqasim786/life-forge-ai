// ─── Bottom Navigation Bar ───────────────────────────────────────────────────

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_TABS } from '../types';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-2xl border-t border-white/[0.06]">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around py-1.5">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`
                  relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl
                  transition-all duration-200 min-w-[64px]
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/[0.06] rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative text-lg">{tab.icon}</span>
                <span className="relative text-[10px] font-semibold uppercase tracking-wider">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
