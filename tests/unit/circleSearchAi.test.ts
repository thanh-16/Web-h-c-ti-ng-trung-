/**
 * tests/unit/circleSearchAi.test.ts
 * Rigorous Unit & Adversarial Test Suite for Circle-to-Search AI Assistant
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GeminiAiService } from '@/services/geminiAiService';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { HSK1_SENTENCES } from '@/data/hskSentences';

describe('Circle-to-Search AI Assistant & Pedagogical Engine', () => {
  let service: GeminiAiService;

  beforeEach(() => {
    GeminiAiService.resetInstance();
    service = GeminiAiService.getInstance();
    service.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Character & Vocabulary Local Resolution (findLocalWordOrChar)', () => {
    it('resolves exact match from HSK Curriculum', () => {
      const match = service.findLocalWordOrChar('你');
      expect(match.matchedWord).toBeDefined();
      expect(match.matchedWord?.hanzi).toBe('你');
      expect(match.matchedWord?.sinoVietnamese).toBe('NHĨ');
    });

    it('resolves character breakdown from HSK 1 Sentences', () => {
      // '很' is in HSK 1 sentences
      const match = service.findLocalWordOrChar('很');
      expect(match.matchedWord || match.charInfo).toBeDefined();
      const pinyin = match.matchedWord?.pinyin || match.charInfo?.pinyin;
      expect(pinyin).toBe('hěn');
    });

    it('gracefully handles empty string and non-existent words', () => {
      const emptyMatch = service.findLocalWordOrChar('');
      expect(emptyMatch.matchedWord).toBeUndefined();
      expect(emptyMatch.charInfo).toBeUndefined();

      const alienMatch = service.findLocalWordOrChar('XYZ123');
      expect(alienMatch.matchedWord).toBeUndefined();
      expect(alienMatch.charInfo).toBeUndefined();
    });
  });

  describe('2. Prompt Construction (buildCircleSearchPrompt)', () => {
    it('builds general explanation prompt with context sentence', () => {
      const prompt = service.buildCircleSearchPrompt({
        queryText: '好',
        contextSentence: '今天天气非常好。',
        promptMode: 'explain',
      });

      expect(prompt).toContain('好');
      expect(prompt).toContain('今天天气非常好。');
      expect(prompt).toContain('Pinyin');
      expect(prompt).toContain('Âm Hán Việt');
      expect(prompt).toContain('Mẹo Nhớ');
    });

    it('builds etymology prompt for deep character composition analysis', () => {
      const prompt = service.buildCircleSearchPrompt({
        queryText: '学',
        promptMode: 'etymology',
      });

      expect(prompt).toContain('学');
      expect(prompt).toContain('chiết tự');
      expect(prompt).toContain('Bộ thủ');
    });

    it('builds custom student question prompt with context integration', () => {
      const question = 'Chữ này thường đứng trước hay sau danh từ?';
      const prompt = service.buildCircleSearchPrompt({
        queryText: '很',
        contextSentence: '他很高。',
        promptMode: 'custom',
        customQuestion: question,
      });

      expect(prompt).toContain('很');
      expect(prompt).toContain('他很高。');
      expect(prompt).toContain(question);
    });
  });

  describe('3. Offline Pedagogical Fallback Generation', () => {
    it('generates rich fallback for curriculum word with Pinyin and Hán Việt', () => {
      const fallback = service.generateCircleSearchFallback({
        queryText: '你',
        contextSentence: '你好！',
        promptMode: 'explain',
      });

      expect(fallback.queryText).toBe('你');
      expect(fallback.pinyin).toBe('nǐ');
      expect(fallback.sinoVietnamese).toBe('NHĨ');
      expect(fallback.isFallback).toBe(true);
      expect(fallback.aiExplanation).toContain('Phân Tích Chữ Được Khoanh');
      expect(fallback.aiExplanation).toContain('Mẹo Nhớ Đòn Bẩy Hán - Việt');
    });

    it('generates fallback for sentence character with contextual explanation', () => {
      const fallback = service.generateCircleSearchFallback({
        queryText: '高',
        contextSentence: '很高兴认识你。',
        promptMode: 'explain',
      });

      expect(fallback.queryText).toBe('高');
      expect(fallback.sinoVietnamese).toBe('CAO');
      expect(fallback.isFallback).toBe(true);
      expect(fallback.aiExplanation).toContain('很高兴认识你。');
    });

    it('generates safe pedagogical guidance for uncataloged characters without crash', () => {
      const fallback = service.generateCircleSearchFallback({
        queryText: '龘',
        promptMode: 'explain',
      });

      expect(fallback.queryText).toBe('龘');
      expect(fallback.isFallback).toBe(true);
      expect(fallback.aiExplanation).toContain('Tra Cứu Chữ Được Khoanh: **龘**');
    });
  });

  describe('4. Circle Search Query Execution & In-Memory Caching', () => {
    it('returns genuine fallback in < 50ms when no API key is provided', async () => {
      service.setApiKey('');
      const start = Date.now();
      const res = await service.queryUnknownWord({
        queryText: '你',
        contextSentence: '你好！',
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
      expect(res.queryText).toBe('你');
      expect(res.pinyin).toBe('nǐ');
      expect(res.isFallback).toBe(true);
      expect(res.aiExplanation.length).toBeGreaterThan(50);
    });

    it('caches repeated query requests to optimize latency and quota', async () => {
      service.setApiKey('test-dummy-api-key');

      // Mock fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Mocked Gemini AI response for circled word.' }],
              },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      // 1st request -> calls API
      const res1 = await service.queryUnknownWord({
        queryText: '好',
        promptMode: 'explain',
      });
      expect(res1.aiExplanation).toBe('Mocked Gemini AI response for circled word.');
      expect(res1.cached).toBeFalsy();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // 2nd request with same parameters -> served from cache
      const res2 = await service.queryUnknownWord({
        queryText: '好',
        promptMode: 'explain',
      });
      expect(res2.aiExplanation).toBe('Mocked Gemini AI response for circled word.');
      expect(res2.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // not called again!
    });
  });
});
