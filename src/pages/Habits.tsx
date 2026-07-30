// ─── Habits Management Page ──────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import HabitCard from '../components/HabitCard';
import GlassCard from '../components/GlassCard';
import { CATEGORIES } from '../types';
import type { HabitCategory, HabitFrequency } from '../types';

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily', desc: 'Every day' },
  { value: 'weekdays', label: 'Weekdays', desc: 'Mon - Fri' },
  { value: 'weekends', label: 'Weekends', desc: 'Sat - Sun' },
  { value: 'weekly', label: 'Weekly', desc: 'Once a week' },
];

const Habits: React.FC = () => {
  const { habits, addHabit } = useHabitStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Self Growth');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit(title.trim(), category, frequency);
    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Habits</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {habits.length} habit{habits.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-1.5"
        >
          <span>+</span>
          <span>New Habit</span>
        </motion.button>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Habit Name */}
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Morning Prayer, LeetCode Practice..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                    autoFocus
                    maxLength={60}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setCategory(cat.label)}
                        className={`
                          flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium
                          transition-all duration-200 border
                          ${category === cat.label
                            ? `${cat.bgColor} ${cat.color} border-white/20`
                            : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFrequency(opt.value)}
                        className={`
                          flex-1 px-3 py-2 rounded-lg text-xs font-medium
                          transition-all duration-200 border
                          ${frequency === opt.value
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white/50 hover:text-white/70 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-emerald-500/40"
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      {habits.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-5xl mb-4"
          >
            📋
          </motion.div>
          <p className="text-white/40 text-sm font-medium">
            No habits defined yet.
          </p>
          <p className="text-white/20 text-xs mt-1">
            Click "New Habit" to start building your routine.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit, index) => (
            <HabitCard key={habit.id} habit={habit} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Habits;
