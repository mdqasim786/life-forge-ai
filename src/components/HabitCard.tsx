// ─── Individual Habit Row ────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import type { Habit } from '../types';
import CategoryBadge from './CategoryBadge';
import WeekCalendar from './WeekCalendar';
import { useHabitStore } from '../store/habitStore';
import { getTodayStr } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  index: number;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, index }) => {
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const removeHabit = useHabitStore((state) => state.removeHabit);

  const handleToggle = (dateStr: string) => {
    toggleCompletion(habit.id, dateStr);
  };

  const getFrequencyLabel = (): string => {
    switch (habit.frequency) {
      case 'daily': return 'Every day';
      case 'weekly': return 'Weekly';
      case 'weekdays': return 'Weekdays';
      case 'weekends': return 'Weekends';
      default: return 'Daily';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: Habit info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-semibold text-white/90 truncate">
              {habit.title}
            </h3>
            <CategoryBadge category={habit.category} size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">
              {getFrequencyLabel()}
            </span>
            <span className="text-[11px] text-white/20">
              · {habit.completionHistory.length} completions
            </span>
          </div>
        </div>

        {/* Right: Week calendar */}
        <div className="flex-shrink-0">
          <WeekCalendar
            completionHistory={habit.completionHistory}
            onToggle={handleToggle}
            createdAt={habit.createdAt}
          />
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => removeHabit(habit.id)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs hover:bg-red-500"
      >
        ✕
      </button>
    </motion.div>
  );
};

export default HabitCard;
