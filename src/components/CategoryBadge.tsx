// ─── Category Badge ──────────────────────────────────────────────────────────

import React from 'react';
import type { HabitCategory } from '../types';
import { CATEGORIES } from '../types';

interface CategoryBadgeProps {
  category: HabitCategory;
  size?: 'sm' | 'md';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'sm' }) => {
  const config = CATEGORIES.find((c) => c.label === category);
  if (!config) return null;

  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-sm px-3 py-1 gap-1.5';

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.color}
        ${sizeClasses}
        border border-white/5
      `}
    >
      <span className="text-xs">{config.icon}</span>
      <span className="truncate max-w-[120px]">{config.label}</span>
    </span>
  );
};

export default CategoryBadge;
