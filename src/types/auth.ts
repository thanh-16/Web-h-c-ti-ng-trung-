/**
 * auth.ts
 * Type definitions for HanziVibe User Profile, Auth, Streak and Progress Tracking
 */

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  streakDays: number;
  lastActiveDate: string; // ISO format: 'YYYY-MM-DD'
  masteredWordIds: string[];
  reviewWordIds: string[];
  favoriteWordIds: string[];
  totalPracticeTimeSec: number;
  tonesCompleted: number;
  strokesCompleted: number;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'mastery' | 'practice' | 'tone' | 'stroke';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LearningStats {
  totalWords: number;
  masteredCount: number;
  reviewCount: number;
  favoriteCount: number;
  streakDays: number;
  totalPracticeMinutes: number;
  tonesCompleted: number;
  strokesCompleted: number;
  masteryPercentage: number;
}
