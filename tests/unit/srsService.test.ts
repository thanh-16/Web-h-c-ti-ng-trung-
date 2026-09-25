/**
 * tests/unit/srsService.test.ts
 * Unit test suite for SrsService and SuperMemo SM-2 algorithm
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SrsService } from '@/services/srsService';
import { SrsCard } from '@/types/srs';

describe('SrsService & SuperMemo SM-2 Engine', () => {
  let service: SrsService;

  beforeEach(() => {
    localStorage.clear();
    SrsService.resetInstance();
    service = SrsService.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Lifecycle & Initial Seeding', () => {
    it('returns the same singleton instance and creates fresh on reset', () => {
      const s1 = SrsService.getInstance();
      const s2 = SrsService.getInstance();
      expect(s1).toBe(s2);

      SrsService.resetInstance();
      const s3 = SrsService.getInstance();
      expect(s1).not.toBe(s3);
    });

    it('seeds 30 HSK 1 curriculum cards by default on empty storage', () => {
      const allCards = service.getAllCards();
      expect(allCards.length).toBe(30);
      expect(allCards[0].hanzi).toBeDefined();
      expect(allCards[0].easeFactor).toBe(2.5);
      expect(allCards[0].repetition).toBe(0);
    });
  });

  describe('2. SuperMemo SM-2 Algorithm Calculation', () => {
    const dummyCard: SrsCard = {
      id: 'test-card',
      wordId: 'word-1',
      hanzi: '学',
      pinyin: 'xué',
      sinoVietnamese: 'HỌC',
      vietnameseMeaning: 'Học tập',
      repetition: 2,
      intervalDays: 3,
      easeFactor: 2.5,
      nextDueDate: '2026-09-25',
      history: [],
    };

    it('resets repetition to 0 and interval to 1 on rating 1 (Again / Quên)', () => {
      const next = service.calculateNextReview(dummyCard, 1, '2026-09-25');
      expect(next.repetition).toBe(0);
      expect(next.intervalDays).toBe(1);
      expect(next.easeFactor).toBe(2.3); // 2.5 - 0.2
      expect(next.nextDueDate).toBe('2026-09-26');
    });

    it('advances repetition and calculates conservative interval on rating 2 (Hard / Khó)', () => {
      const next = service.calculateNextReview(dummyCard, 2, '2026-09-25');
      expect(next.repetition).toBe(3);
      expect(next.intervalDays).toBe(4); // round(3 * 1.2) = 4
      expect(next.easeFactor).toBe(2.35); // 2.5 - 0.15
      expect(next.nextDueDate).toBe('2026-09-29');
    });

    it('progresses interval according to standard SM-2 on rating 3 (Good / Nhớ tốt)', () => {
      const next = service.calculateNextReview(dummyCard, 3, '2026-09-25');
      expect(next.repetition).toBe(3);
      expect(next.intervalDays).toBe(8); // round(3 * 2.5) = 8
      expect(next.easeFactor).toBe(2.5);
      expect(next.nextDueDate).toBe('2026-10-03');
    });

    it('awards interval bonus and increases easeFactor on rating 4 (Easy / Rất dễ)', () => {
      const next = service.calculateNextReview(dummyCard, 4, '2026-09-25');
      expect(next.repetition).toBe(3);
      expect(next.intervalDays).toBe(10); // round(3 * 2.5 * 1.3) = 10
      expect(next.easeFactor).toBe(2.65); // 2.5 + 0.15
      expect(next.nextDueDate).toBe('2026-10-05');
    });

    it('never drops easeFactor below MIN_EASE_FACTOR (1.3)', () => {
      const fragileCard: SrsCard = {
        ...dummyCard,
        easeFactor: 1.35,
      };
      const next = service.calculateNextReview(fragileCard, 1, '2026-09-25');
      expect(next.easeFactor).toBe(1.3);
    });
  });

  describe('3. Card Review & Progression', () => {
    it('reviews a card, updates fields and adds to history log', () => {
      const allCards = service.getAllCards();
      const firstCard = allCards[0];

      const reviewed = service.reviewCard(firstCard.id, 3, '2026-09-25');
      expect(reviewed).not.toBeNull();
      expect(reviewed?.repetition).toBe(1);
      expect(reviewed?.intervalDays).toBe(1);
      expect(reviewed?.lastReviewedDate).toBe('2026-09-25');
      expect(reviewed?.history.length).toBe(1);
      expect(reviewed?.history[0].rating).toBe(3);
    });

    it('returns null when reviewing an unknown card id', () => {
      const res = service.reviewCard('non-existent-id', 3);
      expect(res).toBeNull();
    });

    it('filters cards due on or before a given date', () => {
      const today = '2026-09-25';
      const dueCards = service.getDueCards(today);
      expect(dueCards.length).toBe(30); // initially all seeded cards are due today

      // Review first card with rating 4 (due in 2 days: 2026-09-27)
      service.reviewCard(dueCards[0].id, 4, today);

      const dueTodayAfterReview = service.getDueCards(today);
      expect(dueTodayAfterReview.length).toBe(29);

      // Check date 3 days later
      const dueInFuture = service.getDueCards('2026-09-28');
      expect(dueInFuture.length).toBe(30); // includes the card again
    });
  });

  describe('4. Custom Card Addition & Deduplication', () => {
    it('adds a new custom card from document annotations', () => {
      const custom = service.addCard({
        wordId: 'custom-1',
        hanzi: '咖啡',
        pinyin: 'kāfēi',
        sinoVietnamese: 'CÀ PHÊ',
        vietnameseMeaning: 'Cà phê',
      });

      expect(custom.id).toBeDefined();
      expect(custom.hanzi).toBe('咖啡');
      expect(service.getAllCards().length).toBe(31);
    });

    it('does not duplicate an existing card when adding same hanzi', () => {
      service.addCard({
        wordId: 'dup-1',
        hanzi: '茶',
        pinyin: 'chá',
        sinoVietnamese: 'TRÀ',
        vietnameseMeaning: 'Trà',
      });
      const initialCount = service.getAllCards().length;

      // Add again
      const dup = service.addCard({
        wordId: 'dup-2',
        hanzi: '茶',
        pinyin: 'chá',
        sinoVietnamese: 'TRÀ',
        vietnameseMeaning: 'Trà',
      });

      expect(service.getAllCards().length).toBe(initialCount);
      expect(dup.hanzi).toBe('茶');
    });
  });

  describe('5. Reactive Subscriptions & Statistics', () => {
    it('notifies subscribers on card reviews', () => {
      let callCount = 0;
      const unsubscribe = service.subscribe(() => {
        callCount += 1;
      });

      expect(callCount).toBe(1); // initial notification

      const firstCard = service.getAllCards()[0];
      service.reviewCard(firstCard.id, 3);
      expect(callCount).toBe(2);

      unsubscribe();
      service.reviewCard(firstCard.id, 4);
      expect(callCount).toBe(2); // not called after unsubscribe
    });

    it('calculates stats accurately for total, due, learning, and mastered', () => {
      const stats1 = service.getStats('2026-09-25');
      expect(stats1.totalCards).toBe(30);
      expect(stats1.dueToday).toBe(30);
      expect(stats1.mastered).toBe(0);
      expect(stats1.learning).toBe(30);

      // Advance one card to repetition = 3
      const card = service.getAllCards()[0];
      service.reviewCard(card.id, 3, '2026-09-25'); // rep 1
      service.reviewCard(card.id, 3, '2026-09-26'); // rep 2
      service.reviewCard(card.id, 3, '2026-09-29'); // rep 3 -> Mastered!

      const stats2 = service.getStats('2026-09-25');
      expect(stats2.mastered).toBe(1);
      expect(stats2.learning).toBe(29);
    });
  });
});
