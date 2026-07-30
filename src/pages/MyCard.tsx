// ─── Player Card Page ────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import PlayerCard from '../components/PlayerCard';
import GlassCard from '../components/GlassCard';
import { usePlayerStore } from '../store/playerStore';
import { useHabitStore } from '../store/habitStore';
import { getCardTier } from '../utils/attributeLogic';
import { CATEGORIES } from '../types';
import type { AttributeName } from '../types';

const ATTRIBUTE_COLORS: Record<AttributeName, string> = {
  'Fitness & Diet': 'from-rose-500 to-rose-600',
  'Self Growth': 'from-amber-500 to-amber-600',
  Deen: 'from-emerald-500 to-emerald-600',
  'CS Scientist': 'from-blue-500 to-blue-600',
  'Agents Expert': 'from-violet-500 to-violet-600',
  'Human Being': 'from-pink-500 to-pink-600',
};

const ATTRIBUTE_ICONS: Record<AttributeName, string> = {
  'Fitness & Diet': '💪',
  'Self Growth': '🌱',
  Deen: '🕌',
  'CS Scientist': '💻',
  'Agents Expert': '🤖',
  'Human Being': '💝',
};

const MyCard: React.FC = () => {
  const { attributes, getOverallRating, profile, updateProfile } = usePlayerStore();
  const habits = useHabitStore((state) => state.habits);
  const rating = getOverallRating();
  const tier = getCardTier(rating);

  const TIER_LABELS: Record<string, { label: string; color: string; range: string }> = {
    bronze: { label: 'Bronze', color: 'text-amber-600', range: '1-69' },
    silver: { label: 'Silver', color: 'text-slate-300', range: '70-79' },
    gold: { label: 'Gold', color: 'text-yellow-400', range: '80-93' },
    icon: { label: 'ICON', color: 'text-purple-400', range: '94-99' },
  };

  // Group habits by attribute for display
  const attributeHabits = Object.keys(attributes).reduce((acc, key) => {
    const attr = key as AttributeName;
    const matching = habits.filter(
      (h) => CATEGORIES.some(
        (c) => c.label === h.category && (
          (attr === 'CS Scientist' && ['CS Knowledge', 'Freelancing', 'Social Media Platforms Update'].includes(h.category)) ||
          (attr === 'Agents Expert' && ['Automation Expert', 'AI Systems Expert'].includes(h.category)) ||
          (attr === 'Human Being' && h.category === 'Mama') ||
          (attr === 'Fitness & Diet' && h.category === 'Fitness & Diet') ||
          (attr === 'Self Growth' && h.category === 'Self Growth') ||
          (attr === 'Deen' && h.category === 'Deen')
        )
      )
    );
    acc[attr] = matching;
    return acc;
  }, {} as Record<AttributeName, typeof habits>);

  const [isEditing, setIsEditing] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(profile.name);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-lg font-bold text-white">My Player Card</h1>
        <p className="text-xs text-white/40 mt-0.5">
          Current Tier: <span className={`font-bold ${TIER_LABELS[tier].color}`}>{TIER_LABELS[tier].label}</span>
          {' '}({TIER_LABELS[tier].range})
        </p>
      </motion.div>

      {/* Player Card */}
      <PlayerCard />

      {/* Name Editor */}
      <GlassCard className="p-4" delay={0.3}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Player Name</span>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button onClick={handleSaveName} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">Save</button>
              <button onClick={() => { setIsEditing(false); setNameInput(profile.name); }} className="px-3 py-1.5 bg-white/5 text-white/50 rounded-lg text-xs hover:text-white/70 transition-colors">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-xs text-white/30 hover:text-white/50 transition-colors">
              ✏️ Edit
            </button>
          )}
        </div>
        <p className="text-sm font-bold text-white mt-1">{profile.name}</p>
      </GlassCard>

      {/* All Attributes */}
      <div>
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
          All Attributes
        </h2>
        <div className="space-y-2">
          {(Object.entries(attributes) as [AttributeName, number][]).map(([name, value], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{ATTRIBUTE_ICONS[name]}</span>
                  <span className="text-sm font-medium text-white/80">{name}</span>
                </div>
                <span className="text-sm font-black font-display" style={{
                  color: value >= 80 ? '#fbbf24' : value >= 60 ? '#94a3b8' : value >= 40 ? '#d4a853' : '#ef4444'
                }}>
                  {value}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                  className={`h-full rounded-full bg-gradient-to-r ${ATTRIBUTE_COLORS[name]}`}
                  style={{
                    boxShadow: `0 0 8px ${
                      name === 'Fitness & Diet' ? '#f43f5e' :
                      name === 'Self Growth' ? '#f59e0b' :
                      name === 'Deen' ? '#10b981' :
                      name === 'CS Scientist' ? '#3b82f6' :
                      name === 'Agents Expert' ? '#8b5cf6' :
                      '#ec4899'
                    }40`,
                  }}
                />
              </div>

              {/* Related habits */}
              {attributeHabits[name] && attributeHabits[name].length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {attributeHabits[name].map((h) => (
                    <span key={h.id} className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      {h.title}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tier Progress */}
      <GlassCard className="p-4" delay={0.5}>
        <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">
          Evolution Progress
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(TIER_LABELS).map(([key, t]) => {
            const tierKey = key as keyof typeof TIER_LABELS;
            const isCurrent = key === tier;
            const isUnlocked = ['bronze', 'silver', 'gold', 'icon'].indexOf(key) <= ['bronze', 'silver', 'gold', 'icon'].indexOf(tier);
            return (
              <div
                key={key}
                className={`
                  text-center p-2 rounded-lg border transition-all duration-300
                  ${isCurrent
                    ? 'bg-white/10 border-white/20 shadow-lg'
                    : isUnlocked
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/[0.02] border-white/[0.04] opacity-40'
                  }
                `}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${t.color}`}>
                  {t.label}
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">{t.range}</div>
                {isCurrent && (
                  <div className="text-[8px] text-emerald-400 mt-1 font-bold">● ACTIVE</div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};

export default MyCard;
