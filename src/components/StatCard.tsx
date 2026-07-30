// ─── Analytics Stat Card ─────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'from-emerald-500 to-emerald-600',
  subtitle,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 group hover:bg-white/[0.05] transition-all duration-300"
    >
      {/* Gradient accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color}`}
      />

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-lg shadow-lg`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: delay + 0.2 }}
            className="text-2xl font-bold text-white"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
