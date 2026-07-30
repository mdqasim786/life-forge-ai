// ─── FIFA-Style Player Card for Personal Development ────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { getCardTier } from '../utils/attributeLogic';
import type { CardTier, AttributeName } from '../types';

/** Card tier configuration */
const TIER_CONFIG: Record<CardTier, {
  label: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  accentColor: string;
  particleCount: number;
  starCount: number;
}> = {
  bronze: {
    label: 'BRONZE',
    bgGradient: 'linear-gradient(180deg, #3b2a1a 0%, #2a1f14 30%, #1a1410 100%)',
    borderColor: '#8B6914',
    glowColor: 'rgba(139,105,20,0.3)',
    textColor: '#d4a853',
    accentColor: '#8B6914',
    particleCount: 0,
    starCount: 1,
  },
  silver: {
    label: 'SILVER',
    bgGradient: 'linear-gradient(180deg, #3a3a4a 0%, #2a2a38 30%, #1a1a28 100%)',
    borderColor: '#a8b4c8',
    glowColor: 'rgba(168,180,200,0.3)',
    textColor: '#c8d4e0',
    accentColor: '#8a9ab0',
    particleCount: 0,
    starCount: 2,
  },
  gold: {
    label: 'GOLD',
    bgGradient: 'linear-gradient(180deg, #3a2a0a 0%, #2a1f08 30%, #1a1408 100%)',
    borderColor: '#ffd700',
    glowColor: 'rgba(255,215,0,0.4)',
    textColor: '#ffd700',
    accentColor: '#ffd700',
    particleCount: 8,
    starCount: 3,
  },
  icon: {
    label: 'ICON',
    bgGradient: 'linear-gradient(180deg, #0a0a3a 0%, #1a0a2a 30%, #0a0a1a 100%)',
    borderColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.5)',
    textColor: '#e8d8ff',
    accentColor: '#a855f7',
    particleCount: 15,
    starCount: 5,
  },
};

/** Left-side attributes on the card */
const LEFT_ATTRIBUTES: AttributeName[] = ['Fitness & Diet', 'Self Growth', 'Deen'];

/** Right-side attributes on the card */
const RIGHT_ATTRIBUTES: AttributeName[] = ['CS Scientist', 'Agents Expert', 'Human Being'];

/** Single stat bar on the card */
const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <span className="text-[9px] font-bold uppercase tracking-wider min-w-[16px]" style={{ color }}>
      {value}
    </span>
    <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.3 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  </div>
);

/** Floating particle for gold/icon tiers */
const Particle: React.FC<{ index: number; tier: CardTier }> = ({ index, tier }) => {
  const isIcon = tier === 'icon';
  const size = Math.random() * 3 + 1;
  const duration = Math.random() * 3 + 2;
  const delay = Math.random() * 2;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: isIcon
          ? `radial-gradient(circle, rgba(168,85,247,0.8), rgba(168,85,247,0))`
          : `radial-gradient(circle, rgba(255,215,0,0.8), rgba(255,215,0,0))`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

/** Star rating display */
const Stars: React.FC<{ count: number; color: string }> = ({ count, color }) => (
  <div className="flex justify-center gap-1 mt-1">
    {Array.from({ length: count }).map((_, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 + i * 0.15 }}
        className="text-sm"
        style={{ color, textShadow: `0 0 8px ${color}` }}
      >
        ★
      </motion.span>
    ))}
  </div>
);

/** Position-specific stat label */
const StatLabel: React.FC<{ name: string; isLeft: boolean }> = ({ name, isLeft }) => {
  // Shorten names for the card layout
  const shortName = name
    .replace('Fitness & Diet', 'FIT')
    .replace('Self Growth', 'GROWTH')
    .replace('CS Scientist', 'CS')
    .replace('Agents Expert', 'AGENTS')
    .replace('Human Being', 'HUMAN')
    .replace('Deen', 'DEEN');

  return (
    <div className={`text-[8px] font-bold uppercase tracking-[0.15em] text-white/60 mb-0.5 ${isLeft ? 'text-left' : 'text-right'}`}>
      {shortName}
    </div>
  );
};

const PlayerCard: React.FC = () => {
  const { profile, attributes, getOverallRating } = usePlayerStore();
  const rating = getOverallRating();
  const tier = getCardTier(rating);
  const config = TIER_CONFIG[tier];

  // Avatar placeholder with initials
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarSrc = profile.avatar || '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full max-w-[340px] mx-auto"
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-40"
        style={{
          background: `radial-gradient(ellipse at center, ${config.glowColor}, transparent 70%)`,
        }}
      />

      {/* Main card container */}
      <div
        className="relative rounded-2xl overflow-hidden border-2"
        style={{
          background: config.bgGradient,
          borderColor: config.borderColor,
          boxShadow: `0 0 40px ${config.glowColor}, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Particles for gold/icon */}
        {tier !== 'bronze' && tier !== 'silver' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: config.particleCount }).map((_, i) => (
              <Particle key={i} index={i} tier={tier} />
            ))}
          </div>
        )}

        {/* Card Header - Overall Rating */}
        <div className="relative px-4 pt-3 pb-2 flex items-center justify-between">
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: config.textColor }}
            >
              {config.label}
            </div>
            <div className="text-[8px] text-white/40 uppercase tracking-wider">LIFEFORGE</div>
          </div>
          <div className="text-right">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-5xl font-black leading-none"
              style={{ color: config.textColor, textShadow: `0 0 20px ${config.glowColor}` }}
            >
              {rating}
            </motion.div>
            <div className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5">OVERALL</div>
          </div>
        </div>

        {/* Card Body - Avatar & Attributes */}
        <div className="relative px-3 py-2">
          {/* Decorative line */}
          <div
            className="absolute left-3 right-3 top-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.borderColor}, transparent)`,
            }}
          />

          <div className="flex items-stretch gap-2 min-h-[140px]">
            {/* Left attributes */}
            <div className="flex-1 flex flex-col justify-center py-1">
              {LEFT_ATTRIBUTES.map((attr) => {
                const val = attributes[attr];
                const attrColors: Record<string, string> = {
                  'Fitness & Diet': '#f43f5e',
                  'Self Growth': '#f59e0b',
                  Deen: '#10b981',
                };
                return (
                  <div key={attr} className="mb-0.5">
                    <StatLabel name={attr} isLeft={true} />
                    <StatBar label={attr} value={val} color={attrColors[attr] || '#ffffff'} />
                  </div>
                );
              })}
            </div>

            {/* Center - Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center px-1">
              <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
                className="w-[70px] h-[70px] rounded-full overflow-hidden border-2 flex items-center justify-center"
                style={{
                  borderColor: config.borderColor,
                  boxShadow: `0 0 20px ${config.glowColor}`,
                }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="text-lg font-black"
                    style={{ color: config.textColor }}
                  >
                    {initials}
                  </span>
                )}
              </motion.div>

              {/* Stars */}
              <Stars count={config.starCount} color={config.accentColor} />
            </div>

            {/* Right attributes */}
            <div className="flex-1 flex flex-col justify-center py-1">
              {RIGHT_ATTRIBUTES.map((attr) => {
                const val = attributes[attr];
                const attrColors: Record<string, string> = {
                  'CS Scientist': '#3b82f6',
                  'Agents Expert': '#8b5cf6',
                  'Human Being': '#ec4899',
                };
                return (
                  <div key={attr} className="mb-0.5">
                    <StatLabel name={attr} isLeft={false} />
                    <StatBar label={attr} value={val} color={attrColors[attr] || '#ffffff'} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card Footer - Player Name */}
        <div className="relative px-4 py-2.5 text-center">
          <div
            className="absolute left-3 right-3 top-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.borderColor}, transparent)`,
            }}
          />
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm font-black uppercase tracking-[0.15em]"
            style={{
              color: config.textColor,
              textShadow: `0 0 10px ${config.glowColor}`,
            }}
          >
            {profile.name}
          </motion.div>
          <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] mt-0.5">
            Self-Improvement Athlete
          </div>
        </div>

        {/* Bottom shine overlay for premium feel */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.03) 0%, transparent 100%)',
          }}
        />
      </div>
    </motion.div>
  );
};

export default PlayerCard;
