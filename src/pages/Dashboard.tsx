// ─── Main Dashboard Page ─────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useHabitStore } from '../store/habitStore';
import { usePlayerStore } from '../store/playerStore';
import HabitCard from '../components/HabitCard';
import GlassCard from '../components/GlassCard';
import { getTotalCompletions, calculateStreak } from '../utils/attributeLogic';
import { getTodayStr } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const habits = useHabitStore((state) => state.habits);
  const { attributes, getOverallRating } = usePlayerStore();

  const totalCompletions = useMemo(() => getTotalCompletions(habits), [habits]);
  const streak = useMemo(() => calculateStreak(habits), [habits]);
  const overallRating = getOverallRating();
  const today = getTodayStr();

  // Today's completions count
  const todayCompletions = useMemo(
    () => habits.filter((h) => h.completionHistory.includes(today)).length,
    [habits, today]
  );

  // Find best attribute
  const bestAttribute = useMemo(() => {
    let best = { name: '', value: -1 };
    for (const [key, val] of Object.entries(attributes)) {
      if (val > best.value) {
        best = { name: key, value: val };
      }
    }
    return best;
  }, [attributes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-2"
      >
        <h1 className="text-2xl font-black font-display tracking-wider bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          LifeForge AI
        </h1>
        <p className="text-xs text-white/40 mt-1 font-medium tracking-wide">
          Forge your legend, one habit at a time
        </p>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="text-center py-3 px-2" delay={0.1}>
          <div className="text-2xl font-black font-display bg-gradient-to-b from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            {overallRating}
          </div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Rating</div>
        </GlassCard>

        <GlassCard className="text-center py-3 px-2" delay={0.15}>
          <div className="text-2xl font-black font-display text-blue-400">
            {streak}
          </div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Day Streak</div>
        </GlassCard>

        <GlassCard className="text-center py-3 px-2" delay={0.2}>
          <div className="text-2xl font-black font-display text-purple-400">
            {todayCompletions}
          </div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Today</div>
        </GlassCard>
      </div>

      {/* Best Attribute */}
      {bestAttribute.name && (
        <GlassCard className="py-2.5 px-4" delay={0.25}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Top Attribute</span>
            <span className="text-xs font-semibold text-emerald-400">
              +{bestAttribute.value}
            </span>
          </div>
          <p className="text-sm font-bold text-white/90 mt-0.5">{bestAttribute.name}</p>
        </GlassCard>
      )}

      {/* Today's Habits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Today's Progress
          </h2>
          <button
            onClick={() => navigate('/habits')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Manage Habits →
          </button>
        </div>

        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-3">🏋️</div>
            <p className="text-white/40 text-sm font-medium mb-4">
              No habits yet. Start your journey!
            </p>
            <button
              onClick={() => navigate('/habits')}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
            >
              Create Your First Habit
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit, index) => (
              <HabitCard key={habit.id} habit={habit} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
