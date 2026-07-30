// ─── Glassmorphism Card Container ────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
  /** Delay before animation starts (seconds) */
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(255,255,255,0.05)',
  hoverGlow = false,
  onClick,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hoverGlow ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-lg shadow-black/20
        transition-all duration-300
        ${hoverGlow ? 'cursor-pointer hover:border-white/20' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Shimmer line on top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
