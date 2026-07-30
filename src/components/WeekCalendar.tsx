// ─── 7-Day Week Calendar View ────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import { getLastNDaysAsc, formatDateDisplay, checkIsToday } from '../utils/dateUtils';

interface WeekCalendarProps {
  completionHistory: string[];
  onToggle: (dateStr: string) => void;
  /** YYYY-MM-DD string of the habit's creation date */
  createdAt: string;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  completionHistory,
  onToggle,
  createdAt,
}) => {
  const last7Days = getLastNDaysAsc(7);

  return (
    <div className="flex items-center gap-1.5">
      {last7Days.map((dateStr, index) => {
        const isCompleted = completionHistory.includes(dateStr);
        const isToday = checkIsToday(dateStr);
        // Check if this date is valid (habit existed on this date)
        const isValid = dateStr >= createdAt;
        const isFutureDate = dateStr > new Date().toISOString().split('T')[0];

        return (
          <motion.button
            key={dateStr}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={isToday && !isFutureDate ? { scale: 1.2 } : undefined}
            whileTap={isToday && !isFutureDate ? { scale: 0.9 } : undefined}
            onClick={() => {
              if (isToday && isValid && !isFutureDate) {
                onToggle(dateStr);
              }
            }}
            disabled={!isToday || !isValid || isFutureDate}
            className={`
              relative flex flex-col items-center gap-1 p-1.5 rounded-lg
              transition-all duration-200 min-w-[36px]
              ${isToday ? 'ring-2 ring-white/20' : ''}
              ${
                !isValid || isFutureDate
                  ? 'opacity-20 cursor-not-allowed'
                  : isToday
                  ? 'cursor-pointer'
                  : 'cursor-default'
              }
            `}
            title={`${formatDateDisplay(dateStr)}${isToday ? ' (Today)' : ''}`}
          >
            {/* Day label */}
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
              {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).charAt(0)}
            </span>

            {/* Completion square */}
            <div
              className={`
                w-7 h-7 rounded-md flex items-center justify-center
                transition-all duration-300
                ${isCompleted
                  ? 'bg-emerald-500/80 shadow-lg shadow-emerald-500/30 scale-100'
                  : isToday && isValid
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5 border border-white/10'
                }
                ${isToday && isValid && !isFutureDate ? 'hover:bg-emerald-500/60' : ''}
              `}
            >
              {isCompleted && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Date number */}
            <span className="text-[10px] text-white/50 font-medium">
              {new Date(dateStr + 'T00:00:00').getDate()}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default WeekCalendar;
