import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoadmapService } from '@/services/roadmapService';
import { HSK_ROADMAP_UNITS } from '@/data/hskRoadmap';

describe('RoadmapService & HSK 1 Curriculum Journey', () => {
  let service: RoadmapService;

  beforeEach(() => {
    localStorage.clear();
    service = RoadmapService.getInstance();
    service.resetProgress();
  });

  describe('1. Curriculum Integrity & Structure', () => {
    it('has 6 core HSK 1 pedagogical units', () => {
      expect(HSK_ROADMAP_UNITS).toBeDefined();
      expect(HSK_ROADMAP_UNITS.length).toBe(6);
    });

    it('contains sequential lessons with valid IDs and word lists', () => {
      const allLessons = service.getAllLessons();
      expect(allLessons.length).toBeGreaterThanOrEqual(20);

      // Verify lessons have sequential ordering
      for (let i = 0; i < allLessons.length; i++) {
        expect(allLessons[i].order).toBe(i + 1);
        expect(allLessons[i].wordIds.length).toBeGreaterThan(0);
        expect(allLessons[i].title).toBeTruthy();
        expect(allLessons[i].goal).toBeTruthy();
      }
    });
  });

  describe('2. Progression & Locking Logic', () => {
    it('unlocks the very first lesson by default for new learners', () => {
      const allLessons = service.getAllLessons();
      const firstLesson = allLessons[0];
      expect(service.isLessonUnlocked(firstLesson.id)).toBe(true);
    });

    it('keeps subsequent lessons locked until prerequisites are finished', () => {
      const allLessons = service.getAllLessons();
      const secondLesson = allLessons[1];
      const thirdLesson = allLessons[2];

      expect(service.isLessonUnlocked(secondLesson.id)).toBe(false);
      expect(service.isLessonUnlocked(thirdLesson.id)).toBe(false);
    });

    it('unlocks lesson 2 immediately after completing lesson 1', () => {
      const allLessons = service.getAllLessons();
      const firstLesson = allLessons[0];
      const secondLesson = allLessons[1];

      expect(service.isLessonUnlocked(secondLesson.id)).toBe(false);

      // Complete lesson 1 with 3 stars
      const progress = service.completeLesson(firstLesson.id, 3, 100);
      expect(progress.isCompleted).toBe(true);
      expect(progress.stars).toBe(3);

      // Lesson 2 should now be unlocked!
      expect(service.isLessonUnlocked(secondLesson.id)).toBe(true);
    });
  });

  describe('3. Metrics & Statistics Calculation', () => {
    it('calculates completion percentage and star totals accurately', () => {
      expect(service.getCompletionPercentage()).toBe(0);
      expect(service.getTotalStars()).toBe(0);

      const all = service.getAllLessons();
      service.completeLesson(all[0].id, 3, 100);
      service.completeLesson(all[1].id, 2, 85);

      expect(service.getTotalStars()).toBe(5);
      const expectedPercentage = Math.round((2 / all.length) * 100);
      expect(service.getCompletionPercentage()).toBe(expectedPercentage);
    });

    it('returns the next active uncompleted lesson correctly', () => {
      const all = service.getAllLessons();
      expect(service.getCurrentActiveLesson().id).toBe(all[0].id);

      service.completeLesson(all[0].id, 3);
      expect(service.getCurrentActiveLesson().id).toBe(all[1].id);

      service.completeLesson(all[1].id, 3);
      expect(service.getCurrentActiveLesson().id).toBe(all[2].id);
    });
  });

  describe('4. Storage Resilience & Fallback', () => {
    it('gracefully handles localStorage exceptions without crashing', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const all = service.getAllLessons();
      expect(() => {
        service.completeLesson(all[0].id, 3);
      }).not.toThrow();

      setItemSpy.mockRestore();
    });
  });
});
