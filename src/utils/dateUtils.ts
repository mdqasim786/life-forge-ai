// ─── Date Utility Functions ──────────────────────────────────────────────────

import { format, subDays, isSameDay, isToday, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';
import type { HabitFrequency } from '../types';

/** Get today's date as YYYY-MM-DD string */
export const getTodayStr = (): string => format(new Date(), 'yyyy-MM-dd');

/** Get an array of the last N days as YYYY-MM-DD strings (most recent first) */
export const getLastNDays = (n: number): string[] => {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'));
};

/** Get an array of the last N days as YYYY-MM-DD strings (oldest first) */
export const getLastNDaysAsc = (n: number): string[] => {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => format(subDays(today, n - 1 - i), 'yyyy-MM-dd'));
};

/** Format a date string for display (e.g., "26 July") */
export const formatDateDisplay = (dateStr: string): string => {
  return format(parseISO(dateStr), 'd MMM');
};

/** Format a date string for short display (e.g., "Jul 26") */
export const formatDateShort = (dateStr: string): string => {
  return format(parseISO(dateStr), 'MMM d');
};

/** Check if a date string is today */
export const checkIsToday = (dateStr: string): boolean => {
  return isToday(parseISO(dateStr));
};

/** Get the current week's date range as YYYY-MM-DD strings */
export const getCurrentWeekDays = (): string[] => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'));
};

/** Check if a date string is in the completion history */
export const isDateCompleted = (dateStr: string, completionHistory: string[]): boolean => {
  return completionHistory.some(d => d === dateStr);
};

/**
 * Check whether the given date is allowed for the habit's frequency setting.
 * - 'weekdays' → only Mon–Fri allowed
 * - 'weekends'  → only Sat–Sun allowed
 * - 'daily' / 'weekly' → any day allowed
 */
export const isDayAllowedByFrequency = (frequency: HabitFrequency, dateStr: string): boolean => {
  const dayOfWeek = getDay(parseISO(dateStr)); // 0=Sun, 1=Mon … 6=Sat

  switch (frequency) {
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'daily':
    case 'weekly':
    default:
      return true;
  }
};
