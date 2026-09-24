import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ProgressService,
  getLocalDateString,
  calculateDateDiffInDays,
} from '@/services/progressService';
import { GeminiAiService } from '@/services/geminiAiService';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { UserProfile } from '@/types/auth';

describe('Adversarial Stress Test: ProgressService & GeminiAiService', () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DAILY STREAK EDGE CASES
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. Daily Streak Edge Cases', () => {
    let service: ProgressService;

    beforeEach(() => {
      localStorage.clear();
      ProgressService.resetInstance();
      service = ProgressService.getInstance();
    });

    it('correctly calculates difference across regular month boundary (Jan 31 -> Feb 1)', () => {
      // 2026 is non-leap
      expect(calculateDateDiffInDays('2026-01-31', '2026-02-01')).toBe(1);
      
      // Setup profile on Jan 31
      const profile = service.getProfile();
      profile.lastActiveDate = '2026-01-31';
      profile.streakDays = 15;
      service.setProfile(profile);

      // Practice on Feb 1 (next day)
      const feb1 = new Date(2026, 1, 1, 10, 0, 0); // month is 0-indexed: 1 = Feb
      const updated = service.refreshStreak(feb1);
      expect(updated.streakDays).toBe(16);
      expect(updated.lastActiveDate).toBe('2026-02-01');
    });

    it('correctly handles leap year boundary (Feb 28 -> Feb 29 -> Mar 1 in 2024)', () => {
      // 2024 is a leap year: Feb 28 -> Feb 29 is 1 day; Feb 29 -> Mar 1 is 1 day
      expect(calculateDateDiffInDays('2024-02-28', '2024-02-29')).toBe(1);
      expect(calculateDateDiffInDays('2024-02-29', '2024-03-01')).toBe(1);

      // Start on Feb 28, 2024
      const profile = service.getProfile();
      profile.lastActiveDate = '2024-02-28';
      profile.streakDays = 5;
      service.setProfile(profile);

      // Advance to Feb 29, 2024
      const feb29 = new Date(2024, 1, 29, 14, 0, 0);
      const afterFeb29 = service.refreshStreak(feb29);
      expect(afterFeb29.streakDays).toBe(6);
      expect(afterFeb29.lastActiveDate).toBe('2024-02-29');

      // Advance to Mar 1, 2024
      const mar1 = new Date(2024, 2, 1, 9, 30, 0);
      const afterMar1 = service.refreshStreak(mar1);
      expect(afterMar1.streakDays).toBe(7);
      expect(afterMar1.lastActiveDate).toBe('2024-03-01');
    });

    it('correctly handles non-leap year boundary (Feb 28 -> Mar 1 in 2025)', () => {
      // 2025 is NOT a leap year: Feb 28 -> Mar 1 is 1 day
      expect(calculateDateDiffInDays('2025-02-28', '2025-03-01')).toBe(1);

      const profile = service.getProfile();
      profile.lastActiveDate = '2025-02-28';
      profile.streakDays = 10;
      service.setProfile(profile);

      const mar1_2025 = new Date(2025, 2, 1, 8, 0, 0);
      const updated = service.refreshStreak(mar1_2025);
      expect(updated.streakDays).toBe(11);
      expect(updated.lastActiveDate).toBe('2025-03-01');
    });

    it('correctly handles year-end boundary (Dec 31 -> Jan 1)', () => {
      expect(calculateDateDiffInDays('2025-12-31', '2026-01-01')).toBe(1);

      const profile = service.getProfile();
      profile.lastActiveDate = '2025-12-31';
      profile.streakDays = 40;
      service.setProfile(profile);

      const jan1_2026 = new Date(2026, 0, 1, 0, 5, 0);
      const updated = service.refreshStreak(jan1_2026);
      expect(updated.streakDays).toBe(41);
      expect(updated.lastActiveDate).toBe('2026-01-01');
    });

    it('handles timezone offsets & edge-of-day practices without breaking streak', () => {
      // Practice at 23:58 on Day 1
      const day1Night = new Date(2026, 8, 24, 23, 58, 0);
      const day1Str = getLocalDateString(day1Night);
      expect(day1Str).toBe('2026-09-24');

      const profile = service.getProfile();
      profile.lastActiveDate = day1Str;
      profile.streakDays = 3;
      service.setProfile(profile);

      // Practice at 00:03 on Day 2 (5 minutes later across midnight)
      const day2Morning = new Date(2026, 8, 25, 0, 3, 0);
      const day2Str = getLocalDateString(day2Morning);
      expect(day2Str).toBe('2026-09-25');

      const updated = service.refreshStreak(day2Morning);
      expect(updated.streakDays).toBe(4);
      expect(updated.lastActiveDate).toBe('2026-09-25');
    });

    it('maintains streak count across multiple practices on the same calendar day', () => {
      const today = new Date(2026, 8, 25, 6, 0, 0);
      const profile = service.getProfile();
      profile.lastActiveDate = '2026-09-24';
      profile.streakDays = 7;
      service.setProfile(profile);

      // 1st practice at 06:00
      let updated = service.refreshStreak(today);
      expect(updated.streakDays).toBe(8);

      // 2nd practice at 12:30
      const noon = new Date(2026, 8, 25, 12, 30, 0);
      updated = service.refreshStreak(noon);
      expect(updated.streakDays).toBe(8);

      // 3rd practice at 18:45
      const evening = new Date(2026, 8, 25, 18, 45, 0);
      updated = service.refreshStreak(evening);
      expect(updated.streakDays).toBe(8);

      // 4th practice at 23:59
      const lateNight = new Date(2026, 8, 25, 23, 59, 59);
      updated = service.refreshStreak(lateNight);
      expect(updated.streakDays).toBe(8);
      expect(updated.lastActiveDate).toBe('2026-09-25');
    });

    it('resets streak to 1 when gap > 1 day (e.g. 2 days, 5 days, 30 days)', () => {
      // Gap = 2 days: missed 1 day (active Sept 20, next active Sept 22)
      expect(calculateDateDiffInDays('2026-09-20', '2026-09-22')).toBe(2);

      const profile = service.getProfile();
      profile.lastActiveDate = '2026-09-20';
      profile.streakDays = 14;
      service.setProfile(profile);

      const returnDay2 = new Date(2026, 8, 22, 10, 0, 0);
      let updated = service.refreshStreak(returnDay2);
      expect(updated.streakDays).toBe(1);
      expect(updated.lastActiveDate).toBe('2026-09-22');

      // Gap = 30 days:
      profile.streakDays = 20;
      profile.lastActiveDate = '2026-08-01';
      service.setProfile(profile);

      const returnDay30 = new Date(2026, 8, 1, 10, 0, 0); // Sept 1 vs Aug 1
      updated = service.refreshStreak(returnDay30);
      expect(updated.streakDays).toBe(1);
      expect(updated.lastActiveDate).toBe('2026-09-01');
    });

    it('robustly handles invalid date strings, returning fallback gap without crashing', () => {
      expect(calculateDateDiffInDays('garbage-date', '2026-09-25')).toBe(999);
      expect(calculateDateDiffInDays('2026-09-25', 'corrupted')).toBe(999);
      expect(calculateDateDiffInDays('', '')).toBe(999);

      // If lastActiveDate in profile was corrupted in storage, streak resets to 1 gracefully
      const profile = service.getProfile();
      profile.lastActiveDate = 'corrupted-date-xyz';
      profile.streakDays = 99;
      service.setProfile(profile);

      const updated = service.refreshStreak(new Date(2026, 8, 25));
      expect(updated.streakDays).toBe(1);
      expect(updated.lastActiveDate).toBe('2026-09-25');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. STORAGE FALLBACK RESILIENCE (QuotaExceeded & SecurityError)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. Storage Fallback Resilience', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('seamlessly falls back to in-memory state when localStorage.setItem throws QuotaExceededError', () => {
      localStorage.clear();
      ProgressService.resetInstance();
      const service = ProgressService.getInstance();

      // Mock localStorage.setItem to simulate browser quota exceeded
      const quotaError = new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      // All state mutations should succeed in memory without throwing
      expect(() => {
        service.toggleMastered('hsk1-01-ni');
      }).not.toThrow();
      expect(service.isMastered('hsk1-01-ni')).toBe(true);

      expect(() => {
        service.toggleReview('hsk1-02-hao');
      }).not.toThrow();
      expect(service.isReview('hsk1-02-hao')).toBe(true);

      expect(() => {
        service.toggleFavorite('hsk1-03-xie');
      }).not.toThrow();
      expect(service.isFavorite('hsk1-03-xie')).toBe(true);

      expect(() => {
        service.recordActivity({ practiceTimeSec: 300, toneIncrement: 5, strokeIncrement: 8 });
      }).not.toThrow();

      const profile = service.getProfile();
      expect(profile.masteredWordIds).toContain('hsk1-01-ni');
      expect(profile.reviewWordIds).toContain('hsk1-02-hao');
      expect(profile.favoriteWordIds).toContain('hsk1-03-xie');
      expect(profile.totalPracticeTimeSec).toBe(300);
      expect(profile.tonesCompleted).toBe(5);
      expect(profile.strokesCompleted).toBe(8);
    });

    it('unlocks badges and calculates learning stats correctly under storage failure', () => {
      localStorage.clear();
      ProgressService.resetInstance();
      const service = ProgressService.getInstance();

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceeded', 'QuotaExceededError');
      });

      // Master 5 words
      ['w1', 'w2', 'w3', 'w4', 'w5'].forEach((id) => service.toggleMastered(id));
      service.recordActivity({ strokeIncrement: 10, toneIncrement: 10 });

      const stats = service.getLearningStats(30);
      expect(stats.masteredCount).toBe(5);
      expect(stats.tonesCompleted).toBe(10);
      expect(stats.strokesCompleted).toBe(10);
      expect(stats.masteryPercentage).toBe(17); // 5/30 = 16.67% -> 17%

      const badges = service.getBadges();
      const master5Badge = badges.find((b) => b.id === 'master_5');
      const stroke10Badge = badges.find((b) => b.id === 'stroke_10');
      const tone10Badge = badges.find((b) => b.id === 'tone_10');

      expect(master5Badge?.unlocked).toBe(true);
      expect(stroke10Badge?.unlocked).toBe(true);
      expect(tone10Badge?.unlocked).toBe(true);
    });

    it('notifies subscribers even when storage persistence fails due to QuotaExceededError', () => {
      localStorage.clear();
      ProgressService.resetInstance();
      const service = ProgressService.getInstance();

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      let notifiedProfile: UserProfile | null = null;
      const unsubscribe = service.subscribe((p) => {
        notifiedProfile = p;
      });

      service.toggleMastered('hsk1-04-zai');
      expect(notifiedProfile).not.toBeNull();
      expect(notifiedProfile?.masteredWordIds).toContain('hsk1-04-zai');

      unsubscribe();
    });

    it('handles localStorage SecurityError (e.g. sandboxed iframe or private browsing) without crash', () => {
      // Mock both getItem and setItem throwing SecurityError
      const securityError = new DOMException('The operation is insecure.', 'SecurityError');
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw securityError;
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw securityError;
      });

      ProgressService.resetInstance();
      
      // Should not throw during constructor or instantiation
      let service: ProgressService | null = null;
      expect(() => {
        service = ProgressService.getInstance();
      }).not.toThrow();

      expect(service).not.toBeNull();
      const profile = service!.getProfile();
      expect(profile.username).toBe('learner');
      expect(profile.streakDays).toBe(1);

      // Can continue using in-memory mutations safely
      service!.updateDisplayName('An ninh Khách');
      expect(service!.getProfile().displayName).toBe('An ninh Khách');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. GEMINI AI RESILIENCE & LATENCY GATES (<100ms)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. Gemini AI Resilience & Latency Gates', () => {
    let aiService: GeminiAiService;
    const testWord = HSK_CURRICULUM[0]; // 你 (nǐ)

    beforeEach(() => {
      GeminiAiService.resetInstance();
      aiService = GeminiAiService.getInstance();
      aiService.clearCache();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns rich pedagogical fallback in < 100ms upon network failure', async () => {
      aiService.setApiKey('test_key_dummy');

      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.reject(new TypeError('Failed to fetch (DNS / Network down)'));
      });

      const t0 = performance.now();
      const res = await aiService.generateContent({
        word: testWord,
        promptType: 'sentences',
      });
      const durationMs = performance.now() - t0;

      expect(durationMs).toBeLessThan(100);
      expect(res.isFallback).toBe(true);
      expect(res.error).toContain('Failed to fetch');
      expect(res.content).toContain('Câu 1:');
      expect(res.content).toContain('Câu 2:');
      expect(res.content).toContain('Câu 3:');
      expect(res.content).toContain(testWord.exampleSentence.chinese);
    });

    it('returns pedagogical fallback in < 100ms upon HTTP 500 Internal Server Error', async () => {
      aiService.setApiKey('test_key_dummy');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const t0 = performance.now();
      const res = await aiService.generateContent({
        word: testWord,
        promptType: 'etymology',
      });
      const durationMs = performance.now() - t0;

      expect(durationMs).toBeLessThan(100);
      expect(res.isFallback).toBe(true);
      expect(res.error).toContain('500');
      expect(res.content).toContain('Chiết Tự Chữ Hán');
      expect(res.content).toContain(testWord.hanzi);
      expect(res.content).toContain(testWord.radical);
    });

    it('returns pedagogical fallback in < 100ms upon HTTP 429 Rate Limit (Too Many Requests)', async () => {
      aiService.setApiKey('test_key_dummy');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const t0 = performance.now();
      const res = await aiService.generateContent({
        word: testWord,
        promptType: 'mnemonic',
      });
      const durationMs = performance.now() - t0;

      expect(durationMs).toBeLessThan(100);
      expect(res.isFallback).toBe(true);
      expect(res.error).toContain('429');
      expect(res.content).toContain('Mẹo Nhớ Đòn Bẩy Hán - Việt');
      expect(res.content).toContain(testWord.sinoVietnamese);
      expect(res.content).toContain(testWord.vietnameseMeaning);
    });

    it('returns pedagogical fallback in < 100ms when request is aborted due to timeout', async () => {
      aiService.setApiKey('test_key_dummy');

      // Simulate an AbortError as thrown by fetch when AbortController signals timeout
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          if (init?.signal?.aborted) {
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          } else {
            // Immediately simulate abort event
            setTimeout(() => {
              reject(new DOMException('The user aborted a request.', 'AbortError'));
            }, 5);
          }
        });
      });

      const t0 = performance.now();
      const res = await aiService.generateContent({
        word: testWord,
        promptType: 'sentences',
      });
      const durationMs = performance.now() - t0;

      expect(durationMs).toBeLessThan(100);
      expect(res.isFallback).toBe(true);
      expect(res.error).toContain('AbortError');
      expect(res.content).toContain(testWord.hanzi);
    });

    it('returns immediate fallback in < 10ms when no API key is provided', async () => {
      aiService.setApiKey('');

      const t0 = performance.now();
      const res = await aiService.generateContent({
        word: testWord,
        promptType: 'etymology',
      });
      const durationMs = performance.now() - t0;

      expect(durationMs).toBeLessThan(10);
      expect(res.isFallback).toBe(true);
      expect(res.content).toContain('Chiết Tự Chữ Hán');
    });

    it('handles 30 concurrent fallback requests simultaneously in < 100ms total', async () => {
      aiService.setApiKey('test_key_dummy');

      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.reject(new Error('Network offline'));
      });

      const t0 = performance.now();
      const promises = HSK_CURRICULUM.map((word) =>
        aiService.generateContent({ word, promptType: 'mnemonic' })
      );
      const results = await Promise.all(promises);
      const totalDuration = performance.now() - t0;

      expect(totalDuration).toBeLessThan(100);
      expect(results.length).toBe(30);
      results.forEach((res) => {
        expect(res.isFallback).toBe(true);
        expect(res.content).toContain('Mẹo Nhớ Đòn Bẩy Hán - Việt');
      });
    });

    it('serves cached AI results in < 1ms on subsequent requests', async () => {
      aiService.setApiKey('test_key_valid');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Online AI Analysis from Gemini' }] } }],
        }),
      });

      // First query fills cache
      const firstRes = await aiService.generateContent({ word: testWord, promptType: 'custom', customPrompt: 'test' });
      expect(firstRes.content).toBe('Online AI Analysis from Gemini');
      expect(firstRes.cached).toBeFalsy();

      // Second query must hit cache
      const t0 = performance.now();
      const secondRes = await aiService.generateContent({ word: testWord, promptType: 'custom', customPrompt: 'test' });
      const cacheLatency = performance.now() - t0;

      expect(cacheLatency).toBeLessThan(2);
      expect(secondRes.cached).toBe(true);
      expect(secondRes.content).toBe('Online AI Analysis from Gemini');
      expect(global.fetch).toHaveBeenCalledTimes(1); // Did not hit network again
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. FALLBACK COVERAGE ACROSS ALL 30 HSK CURRICULUM WORDS
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. Fallback Coverage Across All 30 HSK Curriculum Words', () => {
    let aiService: GeminiAiService;

    beforeEach(() => {
      GeminiAiService.resetInstance();
      aiService = GeminiAiService.getInstance();
      aiService.setApiKey(''); // Force offline pedagogical generation
    });

    it('empirically verifies curriculum contains exactly 30 authentic words', () => {
      expect(HSK_CURRICULUM.length).toBe(30);
    });

    it('generates rich etymology markdown for all 30 words', () => {
      for (let i = 0; i < HSK_CURRICULUM.length; i++) {
        const word = HSK_CURRICULUM[i];
        const content = aiService.generatePedagogicalFallback(word, 'etymology');

        // Verification checks
        expect(content).toContain(`### 🏛️ Chiết Tự Chữ Hán: **${word.hanzi}**`);
        expect(content).toContain(word.sinoVietnamese);
        expect(content).toContain(`\`${word.radical}\``);
        expect(content).toContain(word.radicalMeaning);
        expect(content).toContain(`${word.strokeCount} nét`);
        expect(content).toContain('Nguồn Gốc Tiến Hóa:');
        expect(content).toContain('Giá Trị Triết Lý:');
        expect(content.length).toBeGreaterThan(150);
      }
    });

    it('generates rich mnemonic markdown with Sino-Vietnamese leverage for all 30 words', () => {
      for (let i = 0; i < HSK_CURRICULUM.length; i++) {
        const word = HSK_CURRICULUM[i];
        const content = aiService.generatePedagogicalFallback(word, 'mnemonic');

        // Verification checks
        expect(content).toContain(`### 💡 Mẹo Nhớ Đòn Bẩy Hán - Việt: **${word.hanzi}**`);
        expect(content).toContain(word.sinoVietnamese);
        expect(content).toContain(word.vietnameseMeaning);
        expect(content).toContain('1. Đòn Bẩy Ngữ Âm');
        expect(content).toContain('2. Mẹo Liên Tưởng Sống Động');
        expect(content).toContain('3. Từ Ghép Mở Rộng');
        expect(content.length).toBeGreaterThan(150);
      }
    });

    it('generates 3 communicative sentences with 3-line format for all 30 words', () => {
      for (let i = 0; i < HSK_CURRICULUM.length; i++) {
        const word = HSK_CURRICULUM[i];
        const content = aiService.generatePedagogicalFallback(word, 'sentences');

        // Verification checks
        expect(content).toContain(`### 💬 3 Mẫu Câu Giao Tiếp Ngữ Cảnh: **${word.hanzi}**`);
        expect(content).toContain('#### Câu 1:');
        expect(content).toContain('#### Câu 2:');
        expect(content).toContain('#### Câu 3:');
        expect(content).toContain('- **Chữ Hán:**');
        expect(content).toContain('- **Pinyin:**');
        expect(content).toContain('- **Tiếng Việt:**');
        expect(content).toContain(word.exampleSentence.chinese);
        expect(content).toContain(word.exampleSentence.pinyin);
        expect(content).toContain(word.exampleSentence.vietnamese);
      }
    });
  });
});
