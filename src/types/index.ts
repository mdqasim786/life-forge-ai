// ─── LifeForge AI Type Definitions ───────────────────────────────────────────

/** Available habit categories matching the six player attributes */
export type HabitCategory =
  | 'Deen'
  | 'CS Knowledge'
  | 'Mama'
  | 'Freelancing'
  | 'Social Media Platforms Update'
  | 'Automation Expert'
  | 'AI Systems Expert'
  | 'Fitness & Diet'
  | 'Self Growth';

/** Frequency options for habit recurrence */
export type HabitFrequency = 'daily' | 'weekly' | 'weekdays' | 'weekends';

/** Player attribute names mapped on the card */
export type AttributeName =
  | 'Fitness & Diet'
  | 'Self Growth'
  | 'Deen'
  | 'CS Scientist'
  | 'Agents Expert'
  | 'Human Being';

/** A single habit entry */
export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  createdAt: string; // ISO date string
  /** Array of ISO date strings (YYYY-MM-DD) when the habit was completed */
  completionHistory: string[];
}

/** Player attributes with values 1-99 */
export type Attributes = Record<AttributeName, number>;

/** Card tier based on overall rating */
export type CardTier = 'bronze' | 'silver' | 'gold' | 'icon';

/** User profile data */
export interface UserProfile {
  name: string;
  avatar: string; // base64 or URL
  joinDate: string; // ISO date string
}

/** Navigation tab definition */
export interface NavTab {
  id: string;
  label: string;
  path: string;
  icon: string;
}

/** Category-to-attribute mapping helper */
export const CATEGORY_ATTRIBUTE_MAP: Record<HabitCategory, AttributeName> = {
  'Fitness & Diet': 'Fitness & Diet',
  'Self Growth': 'Self Growth',
  Deen: 'Deen',
  'CS Knowledge': 'CS Scientist',
  Freelancing: 'CS Scientist',
  'Social Media Platforms Update': 'CS Scientist',
  'Automation Expert': 'Agents Expert',
  'AI Systems Expert': 'Agents Expert',
  Mama: 'Human Being',
};

/** Category display config */
export interface CategoryConfig {
  label: HabitCategory;
  color: string;
  bgColor: string;
  glowColor: string;
  icon: string;
}

/** All categories with visual configuration */
export const CATEGORIES: CategoryConfig[] = [
  {
    label: 'Deen',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    glowColor: 'rgba(52,211,153,0.4)',
    icon: '🕌',
  },
  {
    label: 'CS Knowledge',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    glowColor: 'rgba(96,165,250,0.4)',
    icon: '💻',
  },
  {
    label: 'Mama',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    glowColor: 'rgba(244,114,182,0.4)',
    icon: '💝',
  },
  {
    label: 'Freelancing',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    glowColor: 'rgba(192,132,252,0.4)',
    icon: '💰',
  },
  {
    label: 'Social Media Platforms Update',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    glowColor: 'rgba(56,189,248,0.4)',
    icon: '📱',
  },
  {
    label: 'Automation Expert',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    glowColor: 'rgba(34,211,238,0.4)',
    icon: '⚙️',
  },
  {
    label: 'AI Systems Expert',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    glowColor: 'rgba(167,139,250,0.4)',
    icon: '🤖',
  },
  {
    label: 'Fitness & Diet',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    glowColor: 'rgba(251,113,133,0.4)',
    icon: '💪',
  },
  {
    label: 'Self Growth',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    glowColor: 'rgba(251,191,36,0.4)',
    icon: '🌱',
  },
];

/** Navigation tabs configuration */
export const NAV_TABS: NavTab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: '📊' },
  { id: 'habits', label: 'Habits', path: '/habits', icon: '✅' },
  { id: 'my-card', label: 'My Card', path: '/my-card', icon: '🃏' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: '📈' },
];
