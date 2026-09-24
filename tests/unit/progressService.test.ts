import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ProgressService,
  getLocalDateString,
  calculateDateDiffInDays,
} from '@/services/progressService';

describe('ProgressService & Streak System', () => {
  let service: ProgressService;

  beforeEach(() => {
    localStorage.clear();
    ProgressService.resetInstance();
    service = ProgressService.getInstance();
  });

  describe('Date Helpers', () => {
    it('formats local date string as YYYY-MM-DD correctly', () => {
      const fixedDate = new Date(2026, 8, 25); // Sept 25, 2026
      expect(getLocalDateString(fixedDate)).toBe('2026-09-25');
    });

    it('calculates calendar day differences accurately across months', () => {
      expect(calculateDateDiffInDays('2026-09-24', '2026-09-25')).toBe(1);
      expect(calculateDateDiffInDays('2026-09-25', '2026-09-25')).toBe(0);
      expect(calculateDateDiffInDays('2026-09-20', '2026-09-25')).toBe(5);
      expect(calculateDateDiffInDays('2026-08-31', '2026-09-01')).toBe(1);
      expect(calculateDateDiffInDays('invalid', '2026-09-25')).toBe(999);
    });
  });

  describe('Streak Calculation Across Calendar Days', () => {
    it('initializes new user with streakDays = 1 and lastActiveDate = today', () => {
      const profile = service.getProfile();
      expect(profile.streakDays).toBe(1);
      expect(profile.lastActiveDate).toBe(getLocalDateString());
    });

    it('maintains streak when active multiple times on the same day (diff = 0)', () => {
      const today = new Date(2026, 8, 25);
      service.refreshStreak(today);
      expect(service.getProfile().streakDays).toBe(1);

      // Call again on same day
      service.refreshStreak(today);
      expect(service.getProfile().streakDays).toBe(1);
    });

    it('increments streak by 1 when active on the next consecutive day (diff = 1)', () => {
      // Simulate Day 1: 2026-09-24
      const day1 = new Date(2026, 8, 24);
      const profile = service.getProfile();
      profile.lastActiveDate = getLocalDateString(day1);
      profile.streakDays = 1;
      service.setProfile(profile);

      // Now active on Day 2: 2026-09-25
      const day2 = new Date(2026, 8, 25);
      const updated = service.refreshStreak(day2);
      expect(updated.streakDays).toBe(2);
      expect(updated.lastActiveDate).toBe('2026-09-25');
    });

    it('resets streak to 1 when user misses a day (diff >= 2)', () => {
      // Simulate streak of 5 ending on 2026-09-20
      const profile = service.getProfile();
      profile.lastActiveDate = '2026-09-20';
      profile.streakDays = 5;
      service.setProfile(profile);

      // User returns on 2026-09-25 (5 days later)
      const returnDate = new Date(2026, 8, 25);
      const updated = service.refreshStreak(returnDate);
      expect(updated.streakDays).toBe(1);
      expect(updated.lastActiveDate).toBe('2026-09-25');
    });

    it('handles backward clock adjustments safely without corrupting streak', () => {
      const profile = service.getProfile();
      profile.lastActiveDate = '2026-09-26';
      profile.streakDays = 3;
      service.setProfile(profile);

      const pastDate = new Date(2026, 8, 25);
      const updated = service.refreshStreak(pastDate);
      expect(updated.streakDays).toBe(3);
    });
  });

  describe('Word Mastery & Bookmark Toggles', () => {
    it('toggles mastered status on and off, automatically removing from review list', () => {
      const wordId = 'hsk1-01-ni';
      expect(service.isMastered(wordId)).toBe(false);

      // First mark as review
      service.toggleReview(wordId);
      expect(service.isReview(wordId)).toBe(true);

      // Then mark as mastered -> should become mastered and removed from review
      const res1 = service.toggleMastered(wordId);
      expect(res1.mastered).toBe(true);
      expect(service.isMastered(wordId)).toBe(true);
      expect(service.isReview(wordId)).toBe(false);

      // Toggle mastered again -> should unmark
      const res2 = service.toggleMastered(wordId);
      expect(res2.mastered).toBe(false);
      expect(service.isMastered(wordId)).toBe(false);
    });

    it('toggles review status on and off, automatically removing from mastered list', () => {
      const wordId = 'hsk1-02-hao';

      // First mark as mastered
      service.toggleMastered(wordId);
      expect(service.isMastered(wordId)).toBe(true);

      // Then mark as review -> should become review and removed from mastered
      const res1 = service.toggleReview(wordId);
      expect(res1.review).toBe(true);
      expect(service.isReview(wordId)).toBe(true);
      expect(service.isMastered(wordId)).toBe(false);

      // Toggle review again -> unmarks
      const res2 = service.toggleReview(wordId);
      expect(res2.review).toBe(false);
      expect(service.isReview(wordId)).toBe(false);
    });

    it('toggles favorite bookmarks independently', () => {
      const wordId = 'hsk1-03-xie';
      expect(service.isFavorite(wordId)).toBe(false);

      const res1 = service.toggleFavorite(wordId);
      expect(res1.favorite).toBe(true);
      expect(service.isFavorite(wordId)).toBe(true);

      const res2 = service.toggleFavorite(wordId);
      expect(res2.favorite).toBe(false);
      expect(service.isFavorite(wordId)).toBe(false);
    });
  });

  describe('Activity Recording & Statistics', () => {
    it('records practice time, tones, and strokes increments accurately', () => {
      service.recordActivity({ practiceTimeSec: 150, toneIncrement: 4, strokeIncrement: 5 });
      let p = service.getProfile();
      expect(p.totalPracticeTimeSec).toBe(150);
      expect(p.tonesCompleted).toBe(4);
      expect(p.strokesCompleted).toBe(5);

      service.recordActivity({ practiceTimeSec: 60, toneIncrement: 1, strokeIncrement: 2 });
      p = service.getProfile();
      expect(p.totalPracticeTimeSec).toBe(210);
      expect(p.tonesCompleted).toBe(5);
      expect(p.strokesCompleted).toBe(7);
    });

    it('computes learning stats with correct percentages', () => {
      service.toggleMastered('w1');
      service.toggleMastered('w2');
      service.toggleReview('w3');
      service.toggleFavorite('w4');
      service.recordActivity({ practiceTimeSec: 300 });

      const stats = service.getLearningStats(10);
      expect(stats.totalWords).toBe(10);
      expect(stats.masteredCount).toBe(2);
      expect(stats.reviewCount).toBe(1);
      expect(stats.favoriteCount).toBe(1);
      expect(stats.totalPracticeMinutes).toBe(5);
      expect(stats.masteryPercentage).toBe(20);
    });
  });

  describe('Badges System', () => {
    it('unlocks badges when thresholds are reached', () => {
      let badges = service.getBadges();
      const streak1 = badges.find((b) => b.id === 'streak_1');
      expect(streak1?.unlocked).toBe(true);

      const master5 = badges.find((b) => b.id === 'master_5');
      expect(master5?.unlocked).toBe(false);

      // Master 5 words
      ['w1', 'w2', 'w3', 'w4', 'w5'].forEach((id) => service.toggleMastered(id));

      badges = service.getBadges();
      expect(badges.find((b) => b.id === 'master_5')?.unlocked).toBe(true);
      expect(badges.find((b) => b.id === 'master_20')?.unlocked).toBe(false);
    });
  });

  describe('LocalStorage Resilience & Subscriptions', () => {
    it('persists profile to localStorage on modification', () => {
      service.updateDisplayName('Nguyễn Văn A');
      const raw = localStorage.getItem('hanzivibe_user_progress');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.displayName).toBe('Nguyễn Văn A');
    });

    it('recovers gracefully from corrupted localStorage JSON', () => {
      localStorage.setItem('hanzivibe_user_progress', '{invalid json');
      ProgressService.resetInstance();
      const newService = ProgressService.getInstance();
      expect(newService.getProfile().displayName).toBe('Học Viên Hanzi');
    });

    it('notifies subscribers on profile changes and allows unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);

      service.toggleMastered('test-word');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      service.toggleMastered('test-word-2');
      expect(listener).toHaveBeenCalledTimes(1); // not called again
    });

    it('resets progress cleanly', () => {
      service.toggleMastered('w1');
      service.toggleReview('w2');
      expect(service.getProfile().masteredWordIds.length).toBe(1);

      service.resetProgress();
      expect(service.getProfile().masteredWordIds.length).toBe(0);
      expect(service.getProfile().reviewWordIds.length).toBe(0);
    });
  });
});
