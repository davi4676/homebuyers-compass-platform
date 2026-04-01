/**
 * Gamification System
 * XP, badges, achievements, streaks, and levels
 */

import type { UserTier } from './tiers'

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'credit' | 'savings' | 'negotiation' | 'education' | 'milestone' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirements: BadgeRequirement[];
}

export interface BadgeRequirement {
  type: 'action-complete' | 'savings-amount' | 'streak-days' | 'score-threshold' | 'custom';
  value: number | string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badgeId?: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
  target: number;
}

export interface UserProgress {
  userId: string;
  tier: UserTier;
  level: number; // 1-50
  xp: number;
  totalXp: number;
  currentStreak: number; // days
  longestStreak: number;
  lastActionDate: string;
  badges: string[]; // Badge IDs
  achievements: Achievement[];
  stats: {
    actionsCompleted: number;
    totalSavings: number;
    opportunitiesCompleted: number;
    daysActive: number;
  };
}

export const BADGES: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Completed your first assessment',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    xpReward: 50,
    requirements: [
      { type: 'action-complete', value: 'quiz-complete', description: 'Complete the quiz' },
    ],
  },
  {
    id: 'credit-master',
    name: 'Credit Master',
    description: 'Improved credit score by 50+ points',
    icon: '📈',
    category: 'credit',
    rarity: 'rare',
    xpReward: 200,
    requirements: [
      { type: 'score-threshold', value: 50, description: 'Improve credit score by 50 points' },
    ],
  },
  {
    id: 'savings-champion',
    name: 'Savings Champion',
    description: 'Identified $10,000+ in savings opportunities',
    icon: '💰',
    category: 'savings',
    rarity: 'epic',
    xpReward: 500,
    requirements: [
      { type: 'savings-amount', value: 10000, description: 'Identify $10,000+ in savings' },
    ],
  },
  {
    id: 'negotiation-pro',
    name: 'Negotiation Pro',
    description: 'Successfully negotiated $5,000+ in savings',
    icon: '🤝',
    category: 'negotiation',
    rarity: 'epic',
    xpReward: 500,
    requirements: [
      { type: 'savings-amount', value: 5000, description: 'Negotiate $5,000+ in savings' },
    ],
  },
  {
    id: 'streak-warrior',
    name: 'Streak Warrior',
    description: 'Maintained a 30-day action streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'legendary',
    xpReward: 1000,
    requirements: [
      { type: 'streak-days', value: 30, description: 'Maintain 30-day streak' },
    ],
  },
  {
    id: 'cost-master',
    name: 'Cost Master',
    description: 'Completed all cost optimization actions',
    icon: '📊',
    category: 'education',
    rarity: 'rare',
    xpReward: 300,
    requirements: [
      { type: 'action-complete', value: 'all-cost-actions', description: 'Complete all cost actions' },
    ],
  },
];

/**
 * Calculate XP needed for a level
 */
export function getXpForLevel(level: number): number {
  // Exponential curve: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate total XP needed to reach a level
 */
export function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

/**
 * Get level from total XP
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;

  while (xpNeeded <= totalXp) {
    level++;
    xpNeeded += getXpForLevel(level);
  }

  return level - 1;
}

/**
 * Calculate XP progress to next level
 */
export function getXpProgress(currentXp: number, currentLevel: number): {
  current: number;
  needed: number;
  progress: number; // 0-100
} {
  const xpForCurrentLevel = getTotalXpForLevel(currentLevel);
  const xpForNextLevel = getTotalXpForLevel(currentLevel + 1);
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const xpIntoLevel = currentXp - xpForCurrentLevel;

  return {
    current: xpIntoLevel,
    needed: xpNeededForNext,
    progress: Math.min((xpIntoLevel / xpNeededForNext) * 100, 100),
  };
}

/**
 * Award XP and check for level up
 */
export function awardXp(progress: UserProgress, xp: number): {
  newProgress: UserProgress;
  leveledUp: boolean;
  newLevel?: number;
} {
  const newTotalXp = progress.totalXp + xp;
  const oldLevel = progress.level;
  const newLevel = getLevelFromXp(newTotalXp);
  const leveledUp = newLevel > oldLevel;

  return {
    newProgress: {
      ...progress,
      totalXp: newTotalXp,
      level: newLevel,
      xp: newTotalXp - getTotalXpForLevel(newLevel),
    },
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}

/**
 * Check if user qualifies for a badge
 */
export function checkBadgeEligibility(progress: UserProgress, badge: Badge): boolean {
  // Check if already unlocked
  if (progress.badges.includes(badge.id)) return false;

  // Check requirements
  for (const requirement of badge.requirements) {
    switch (requirement.type) {
      case 'action-complete':
        // Would check action history
        break;
      case 'savings-amount':
        if (progress.stats.totalSavings < (requirement.value as number)) return false;
        break;
      case 'streak-days':
        if (progress.currentStreak < (requirement.value as number)) return false;
        break;
      case 'score-threshold':
        // Would check specific score improvements
        break;
    }
  }

  return true;
}

/**
 * Update streak
 */
export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  const lastAction = progress.lastActionDate ? new Date(progress.lastActionDate).toISOString().split('T')[0] : null;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = progress.currentStreak;

  if (lastAction === today) {
    // Already updated today
    return progress;
  } else if (lastAction === yesterday) {
    // Continue streak
    newStreak = progress.currentStreak + 1;
  } else {
    // Reset streak
    newStreak = 1;
  }

  return {
    ...progress,
    currentStreak: newStreak,
    longestStreak: Math.max(progress.longestStreak, newStreak),
    lastActionDate: today,
  };
}

/**
 * Initialize user progress
 */
export function initializeProgress(userId: string, tier: UserTier): UserProgress {
  return {
    userId,
    tier,
    level: 1,
    xp: 0,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActionDate: '',
    badges: [],
    achievements: [],
    stats: {
      actionsCompleted: 0,
      totalSavings: 0,
      opportunitiesCompleted: 0,
      daysActive: 0,
    },
  };
}

