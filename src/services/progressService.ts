/**
 * progressService.ts
 * Manages user profile, persistent daily streak calculation, word mastery & bookmarks.
 * Local-first storage with automatic localStorage persistence and memory fallback.
 */

import { UserProfile, UserBadge, LearningStats } from '@/types/auth';

const STORAGE_KEY = 'hanzivibe_user_progress';

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDateDiffInDays(fromDateStr: string, toDateStr: string): number {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  
  if (isNaN(y1) || isNaN(m1) || isNaN(d1) || isNaN(y2) || isNaN(m2) || isNaN(d2)) {
    return 999;
  }

  const date1 = new Date(y1, m1 - 1, d1).getTime();
  const date2 = new Date(y2, m2 - 1, d2).getTime();
  const diffMs = date2 - date1;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function createDefaultProfile(): UserProfile {
  const today = getLocalDateString();
  return {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    username: 'learner',
    displayName: 'Học Viên Hanzi',
    streakDays: 1,
    lastActiveDate: today,
    masteredWordIds: [],
    reviewWordIds: [],
    favoriteWordIds: [],
    totalPracticeTimeSec: 0,
    tonesCompleted: 0,
    strokesCompleted: 0,
    createdAt: new Date().toISOString(),
  };
}

export class ProgressService {
  private static instance: ProgressService | null = null;
  private currentProfile: UserProfile;
  private listeners: Set<(profile: UserProfile) => void> = new Set();
  private hasCheckedStreakToday: boolean = false;

  private constructor() {
    this.currentProfile = this.loadFromStorage();
    this.refreshStreak();
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  /**
   * Resets the singleton instance (useful for clean unit tests)
   */
  public static resetInstance(): void {
    ProgressService.instance = null;
  }

  /**
   * Loads profile from localStorage, with fallback to default in-memory profile
   */
  private loadFromStorage(): UserProfile {
    try {
      if (typeof window === 'undefined') {
        return createDefaultProfile();
      }
      const storage = window.localStorage;
      if (!storage) {
        return createDefaultProfile();
      }

      const data = storage.getItem(STORAGE_KEY);
      if (!data) {
        const defaultProfile = createDefaultProfile();
        this.saveToStorage(defaultProfile);
        return defaultProfile;
      }

      const parsed = JSON.parse(data) as Partial<UserProfile>;
      const today = getLocalDateString();

      return {
        id: parsed.id || 'user_' + Math.random().toString(36).substring(2, 9),
        username: parsed.username || 'learner',
        displayName: parsed.displayName || 'Học Viên Hanzi',
        avatarUrl: parsed.avatarUrl,
        streakDays: typeof parsed.streakDays === 'number' && parsed.streakDays >= 0 ? parsed.streakDays : 1,
        lastActiveDate: parsed.lastActiveDate || today,
        masteredWordIds: Array.isArray(parsed.masteredWordIds) ? parsed.masteredWordIds : [],
        reviewWordIds: Array.isArray(parsed.reviewWordIds) ? parsed.reviewWordIds : [],
        favoriteWordIds: Array.isArray(parsed.favoriteWordIds) ? parsed.favoriteWordIds : [],
        totalPracticeTimeSec: typeof parsed.totalPracticeTimeSec === 'number' ? parsed.totalPracticeTimeSec : 0,
        tonesCompleted: typeof parsed.tonesCompleted === 'number' ? parsed.tonesCompleted : 0,
        strokesCompleted: typeof parsed.strokesCompleted === 'number' ? parsed.strokesCompleted : 0,
        createdAt: parsed.createdAt || new Date().toISOString(),
      };
    } catch {
      const fallback = createDefaultProfile();
      return fallback;
    }
  }

  /**
   * Persists profile to localStorage
   */
  private saveToStorage(profile: UserProfile): void {
    this.currentProfile = profile;
    try {
      if (typeof window !== 'undefined') {
        const storage = window.localStorage;
        if (storage) {
          storage.setItem(STORAGE_KEY, JSON.stringify(profile));
        }
      }
    } catch (err) {
      console.warn('[ProgressService] Failed to save to localStorage (QuotaExceededError or SecurityError):', err);
    }
    this.notifyListeners();
  }

  /**
   * Calculates and updates daily streak based on calendar days
   */
  public refreshStreak(customDate?: Date): UserProfile {
    const todayStr = getLocalDateString(customDate);
    const lastDate = this.currentProfile.lastActiveDate;

    if (!lastDate) {
      this.currentProfile.streakDays = 1;
      this.currentProfile.lastActiveDate = todayStr;
      this.saveToStorage({ ...this.currentProfile });
      return this.currentProfile;
    }

    const diff = calculateDateDiffInDays(lastDate, todayStr);

    if (diff === 0) {
      // Same calendar day: maintain existing streak
      if (this.currentProfile.streakDays < 1) {
        this.currentProfile.streakDays = 1;
      }
    } else if (diff === 1) {
      // Exactly consecutive day (yesterday -> today): increment streak
      this.currentProfile.streakDays += 1;
      this.currentProfile.lastActiveDate = todayStr;
    } else if (diff > 1) {
      // Missed one or more days: reset to 1
      this.currentProfile.streakDays = 1;
      this.currentProfile.lastActiveDate = todayStr;
    } else {
      // Time went backwards, keep current streak
      this.currentProfile.lastActiveDate = todayStr;
    }

    this.saveToStorage({ ...this.currentProfile });
    this.hasCheckedStreakToday = true;
    return this.currentProfile;
  }

  public getProfile(): UserProfile {
    return { ...this.currentProfile };
  }

  public setProfile(profile: UserProfile): void {
    this.saveToStorage(profile);
  }

  public updateDisplayName(name: string): UserProfile {
    const trimmed = name.trim() || 'Học Viên Hanzi';
    const updated: UserProfile = {
      ...this.currentProfile,
      displayName: trimmed,
    };
    this.saveToStorage(updated);
    return updated;
  }

  public toggleMastered(wordId: string): { mastered: boolean; profile: UserProfile } {
    const isAlreadyMastered = this.currentProfile.masteredWordIds.includes(wordId);
    let newMastered = [...this.currentProfile.masteredWordIds];
    let newReview = [...this.currentProfile.reviewWordIds];

    if (isAlreadyMastered) {
      newMastered = newMastered.filter((id) => id !== wordId);
    } else {
      newMastered.push(wordId);
      // Once mastered, automatically remove from review list
      newReview = newReview.filter((id) => id !== wordId);
    }

    const updated: UserProfile = {
      ...this.currentProfile,
      masteredWordIds: newMastered,
      reviewWordIds: newReview,
    };

    this.saveToStorage(updated);
    return { mastered: !isAlreadyMastered, profile: updated };
  }

  public toggleReview(wordId: string): { review: boolean; profile: UserProfile } {
    const isAlreadyReview = this.currentProfile.reviewWordIds.includes(wordId);
    let newReview = [...this.currentProfile.reviewWordIds];
    let newMastered = [...this.currentProfile.masteredWordIds];

    if (isAlreadyReview) {
      newReview = newReview.filter((id) => id !== wordId);
    } else {
      newReview.push(wordId);
      // If marked for review, remove from mastered list
      newMastered = newMastered.filter((id) => id !== wordId);
    }

    const updated: UserProfile = {
      ...this.currentProfile,
      reviewWordIds: newReview,
      masteredWordIds: newMastered,
    };

    this.saveToStorage(updated);
    return { review: !isAlreadyReview, profile: updated };
  }

  public toggleFavorite(wordId: string): { favorite: boolean; profile: UserProfile } {
    const isAlreadyFavorite = this.currentProfile.favoriteWordIds.includes(wordId);
    const newFavorites = isAlreadyFavorite
      ? this.currentProfile.favoriteWordIds.filter((id) => id !== wordId)
      : [...this.currentProfile.favoriteWordIds, wordId];

    const updated: UserProfile = {
      ...this.currentProfile,
      favoriteWordIds: newFavorites,
    };

    this.saveToStorage(updated);
    return { favorite: !isAlreadyFavorite, profile: updated };
  }

  public isMastered(wordId: string): boolean {
    return this.currentProfile.masteredWordIds.includes(wordId);
  }

  public isReview(wordId: string): boolean {
    return this.currentProfile.reviewWordIds.includes(wordId);
  }

  public isFavorite(wordId: string): boolean {
    return this.currentProfile.favoriteWordIds.includes(wordId);
  }

  public recordActivity(options: {
    practiceTimeSec?: number;
    toneIncrement?: number;
    strokeIncrement?: number;
  }): UserProfile {
    const today = getLocalDateString();
    const updated: UserProfile = {
      ...this.currentProfile,
      lastActiveDate: today,
      totalPracticeTimeSec: this.currentProfile.totalPracticeTimeSec + (options.practiceTimeSec || 0),
      tonesCompleted: this.currentProfile.tonesCompleted + (options.toneIncrement || 0),
      strokesCompleted: this.currentProfile.strokesCompleted + (options.strokeIncrement || 0),
    };

    this.saveToStorage(updated);
    return updated;
  }

  public getLearningStats(totalCurriculumWords: number): LearningStats {
    const total = Math.max(1, totalCurriculumWords);
    const mastered = this.currentProfile.masteredWordIds.length;
    return {
      totalWords: total,
      masteredCount: mastered,
      reviewCount: this.currentProfile.reviewWordIds.length,
      favoriteCount: this.currentProfile.favoriteWordIds.length,
      streakDays: this.currentProfile.streakDays,
      totalPracticeMinutes: Math.round(this.currentProfile.totalPracticeTimeSec / 60),
      tonesCompleted: this.currentProfile.tonesCompleted,
      strokesCompleted: this.currentProfile.strokesCompleted,
      masteryPercentage: Math.min(100, Math.round((mastered / total) * 100)),
    };
  }

  public getBadges(): UserBadge[] {
    const p = this.currentProfile;
    return [
      {
        id: 'streak_1',
        title: 'Khởi Đầu Vững Chắc',
        description: 'Bắt đầu ngày học đầu tiên trên HanziVibe',
        icon: '🌱',
        category: 'streak',
        unlocked: p.streakDays >= 1,
      },
      {
        id: 'streak_3',
        title: '3 Ngày Tinh Tấn',
        description: 'Duy trì học liên tiếp 3 ngày',
        icon: '🔥',
        category: 'streak',
        unlocked: p.streakDays >= 3,
      },
      {
        id: 'streak_7',
        title: 'Tuần Lễ Kim Cương',
        description: 'Duy trì chuỗi học 7 ngày liên tục',
        icon: '💎',
        category: 'streak',
        unlocked: p.streakDays >= 7,
      },
      {
        id: 'master_5',
        title: 'Tập sự HSK',
        description: 'Thuộc trọn vẹn 5 từ vựng HSK',
        icon: '📖',
        category: 'mastery',
        unlocked: p.masteredWordIds.length >= 5,
      },
      {
        id: 'master_20',
        title: 'Bậc Thầy Chữ Hán',
        description: 'Thuộc trọn vẹn 20 từ vựng HSK',
        icon: '🏆',
        category: 'mastery',
        unlocked: p.masteredWordIds.length >= 20,
      },
      {
        id: 'stroke_10',
        title: 'Bút Thuận Tinh Thông',
        description: 'Hoàn thành 10 lượt luyện nét chữ Hán',
        icon: '✍️',
        category: 'stroke',
        unlocked: p.strokesCompleted >= 10,
      },
      {
        id: 'tone_10',
        title: 'Âm Điệu Chuẩn Xác',
        description: 'Hoàn thành 10 lượt luyện phát âm thanh điệu F0',
        icon: '🎙️',
        category: 'tone',
        unlocked: p.tonesCompleted >= 10,
      },
    ];
  }

  public resetProgress(): UserProfile {
    const fresh = createDefaultProfile();
    this.saveToStorage(fresh);
    return fresh;
  }

  public subscribe(listener: (profile: UserProfile) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const copy = { ...this.currentProfile };
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (e) {
        console.error('[ProgressService] Listener error:', e);
      }
    });
  }
}

export const progressService = ProgressService.getInstance();
export default progressService;
