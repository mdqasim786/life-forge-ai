// ─── Analytics & Statistics Page ─────────────────────────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import { usePlayerStore } from '../store/playerStore';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import {
  calculateStreak,
  calculateWeeklyCompletion,
  getTotalCompletions,
  getBestAttribute,
  getWorstAttribute,
} from '../utils/attributeLogic';
import { getLastNDaysAsc, formatDateShort } from '../utils/dateUtils';
import type { AttributeName } from '../types';

const ATTRIBUTE_COLORS: Record<string, string> = {
  'Fitness & Diet': 'from-rose-500 to-rose-600',
  'Self Growth': 'from-amber-500 to-amber-600',
  Deen: 'from-emerald-500 to-emerald-600',
  'CS Scientist': 'from-blue-500 to-blue-600',
  'Agents Expert': 'from-violet-500 to-violet-600',
  'Human Being': 'from-pink-500 to-pink-600',
};

const Analytics: React.FC = () => {
  const habits = useHabitStore((state) => state.habits);
  const { attributes, getOverallRating } = usePlayerStore();

  const overallRating = getOverallRating();
  const totalCompletions = useMemo(() => getTotalCompletions(habits), [habits]);
  const streak = useMemo(() => calculateStreak(habits), [habits]);
  const weeklyCompletion = useMemo(() => calculateWeeklyCompletion(habits), [habits]);
  const bestAttr = useMemo(() => getBestAttribute(attributes), [attributes]);
  const worstAttr = useMemo(() => getWorstAttribute(attributes), [attributes]);

  // Weekly heatmap data
  const weekDays = useMemo(() => getLastNDaysAsc(7), []);
  const dailyCompletions = useMemo(() => {
    return weekDays.map((day) => {
      const count = habits.filter((h) => h.completionHistory.includes(day)).length;
      return { date: day, count };
    });
  }, [habits, weekDays]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { total: number; completed: number }> = {};
    for (const habit of habits) {
      if (!breakdown[habit.category]) {
        breakdown[habit.category] = { total: 0, completed: 0 };
      }
      breakdown[habit.category].total++;
      breakdown[habit.category].completed += habit.completionHistory.length;
    }
    return Object.entries(breakdown).sort(([, a], [, b]) => b.completed - a.completed);
  }, [habits]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-lg font-bold text-white">Analytics</h1>
        <p className="text-xs text-white/40 mt-0.5">
          Track your progress and performance
        </p>
      </motion.div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Overall Rating"
          value={overallRating}
          icon="⭐"
          color="from-yellow-500 to-yellow-600"
          delay={0.05}
        />
        <StatCard
          label="Current Streak"
          value={`${streak} days`}
          icon="🔥"
          color="from-orange-500 to-red-600"
          delay={0.1}
        />
        <StatCard
          label="Total Completions"
          value={totalCompletions}
          icon="✅"
          color="from-emerald-500 to-emerald-600"
          delay={0.15}
        />
        <StatCard
          label="Weekly Rate"
          value={`${weeklyCompletion}%`}
          icon="📊"
          color="from-blue-500 to-blue-600"
          delay={0.2}
        />
      </div>

      {/* Best & Worst Attributes */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Best Attribute"
          value={bestAttr.name}
          icon="🏆"
          color={ATTRIBUTE_COLORS[bestAttr.name] || 'from-emerald-500 to-emerald-600'}
          subtitle={`Value: ${bestAttr.value}`}
          delay={0.25}
        />
        <StatCard
          label="Needs Work"
          value={worstAttr.name}
          icon="📈"
          color={ATTRIBUTE_COLORS[worstAttr.name] || 'from-red-500 to-red-600'}
          subtitle={`Value: ${worstAttr.value}`}
          delay={0.3}
        />
      </div>

      {/* Weekly Activity */}
      <GlassCard className="p-4" delay={0.35}>
        <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">
          Last 7 Days Activity
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {dailyCompletions.map((day, index) => {
            const maxCount = Math.max(...dailyCompletions.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;
            const isToday = index === dailyCompletions.length - 1;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-white/30">
                  {day.count}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 5)}%` }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                  className={`
                    w-full rounded-lg transition-all duration-300
                    ${isToday
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30'
                      : day.count > 0
                      ? 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/40'
                      : 'bg-white/5'
                    }
                  `}
                />
                <span className={`text-[9px] font-medium ${isToday ? 'text-white/60' : 'text-white/30'}`}>
                  {formatDateShort(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Category Breakdown */}
      <GlassCard className="p-4" delay={0.4}>
        <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">
          Category Breakdown
        </h3>
        {categoryBreakdown.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No habits yet</p>
        ) : (
          <div className="space-y-2">
            {categoryBreakdown.map(([category, data], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3 py-1.5"
              >
                <span className="text-xs font-medium text-white/70 min-w-[100px] truncate">
                  {category}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((data.completed / Math.max(data.total, 1)) * 20, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + 0.1 * index }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/40"
                  />
                </div>
                <span className="text-xs font-mono text-white/40 min-w-[60px] text-right">
                  {data.completed} / {data.total}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* All Attributes Overview */}
      <GlassCard className="p-4" delay={0.45}>
        <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">
          All Attributes
        </h3>
        <div className="space-y-3">
          {(Object.entries(attributes) as [AttributeName, number][]).map(([name, value], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">{name}</span>
                <span className="text-xs font-bold font-display" style={{
                  color: value >= 80 ? '#fbbf24' : value >= 60 ? '#94a3b8' : value >= 40 ? '#d4a853' : '#ef4444'
                }}>
                  {value}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.3 + 0.1 * index }}
                  className={`h-full rounded-full bg-gradient-to-r ${ATTRIBUTE_COLORS[name] || 'from-blue-500 to-blue-600'}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;
