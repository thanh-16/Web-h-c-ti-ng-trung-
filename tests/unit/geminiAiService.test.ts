import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GeminiAiService } from '@/services/geminiAiService';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';

describe('GeminiAiService & Pedagogical Assistant', () => {
  let service: GeminiAiService;
  const testWord = HSK_CURRICULUM[0]; // 你 (nǐ - NHĨ)

  beforeEach(() => {
    GeminiAiService.resetInstance();
    service = GeminiAiService.getInstance();
    service.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Prompt Construction (buildPrompt)', () => {
    it('builds comprehensive etymology prompt with character attributes', () => {
      const prompt = service.buildPrompt(testWord, 'etymology');
      expect(prompt).toContain(testWord.hanzi);
      expect(prompt).toContain(testWord.pinyin);
      expect(prompt).toContain(testWord.sinoVietnamese);
      expect(prompt).toContain(testWord.radical);
      expect(prompt).toContain('chiết tự');
    });

    it('builds mnemonic prompt focusing on Sino-Vietnamese phonetic association', () => {
      const prompt = service.buildPrompt(testWord, 'mnemonic');
      expect(prompt).toContain(testWord.hanzi);
      expect(prompt).toContain(testWord.sinoVietnamese);
      expect(prompt).toContain('Hán - Việt');
      expect(prompt).toContain('mẹo nhớ');
    });

    it('builds 3 communicative sentences prompt with 3-line format specification', () => {
      const prompt = service.buildPrompt(testWord, 'sentences');
      expect(prompt).toContain(testWord.hanzi);
      expect(prompt).toContain('3 câu ví dụ');
      expect(prompt).toContain('Pinyin');
      expect(prompt).toContain('tiếng Việt');
    });

    it('builds custom query prompt injecting student question alongside character context', () => {
      const customQ = 'Phân biệt cách dùng giữa 你 và 您?';
      const prompt = service.buildPrompt(testWord, 'custom', customQ);
      expect(prompt).toContain(testWord.hanzi);
      expect(prompt).toContain(customQ);
    });
  });

  describe('Pedagogical Fallback Generation (Offline Resilience)', () => {
    it('generates rich etymology markdown containing radical, stroke count and decomposition', () => {
      const content = service.generatePedagogicalFallback(testWord, 'etymology');
      expect(content).toContain(testWord.hanzi);
      expect(content).toContain(testWord.radical);
      expect(content).toContain(String(testWord.strokeCount));
      expect(content).toContain('Chiết Tự Chữ Hán');
      expect(content).toContain('Bộ thủ:');
    });

    it('generates mnemonic markdown bridging Sino-Vietnamese sound and memory hooks', () => {
      const content = service.generatePedagogicalFallback(testWord, 'mnemonic');
      expect(content).toContain(testWord.hanzi);
      expect(content).toContain(testWord.sinoVietnamese);
      expect(content).toContain(testWord.vietnameseMeaning);
      expect(content).toContain('Đòn Bẩy Ngữ Âm');
    });

    it('generates 3 communicative sentences with Chinese, Pinyin, and Vietnamese translations', () => {
      const content = service.generatePedagogicalFallback(testWord, 'sentences');
      expect(content).toContain('Câu 1:');
      expect(content).toContain('Câu 2:');
      expect(content).toContain('Câu 3:');
      expect(content).toContain('Chữ Hán:');
      expect(content).toContain('Pinyin:');
      expect(content).toContain('Tiếng Việt:');
    });
  });

  describe('API Handling, Timeout & Graceful Degradation', () => {
    it('returns immediate fallback when API key is empty', async () => {
      service.setApiKey('');
      const res = await service.generateContent({
        word: testWord,
        promptType: 'etymology',
      });

      expect(res.isFallback).toBe(true);
      expect(res.content).toContain(testWord.hanzi);
      expect(res.content).toContain('Chiết Tự Chữ Hán');
    });

    it('handles successful Gemini API response when API key is provided', async () => {
      service.setApiKey('test_valid_key');

      const mockApiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '### Phân Tích Chữ 你 từ Gemini 1.5 Flash\nChữ gồm bộ Nhân đứng...',
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const res = await service.generateContent({
        word: testWord,
        promptType: 'etymology',
      });

      expect(res.isFallback).toBe(false);
      expect(res.content).toContain('Phân Tích Chữ 你 từ Gemini 1.5 Flash');
    });

    it('falls back seamlessly to built-in curriculum data on network failure', async () => {
      service.setApiKey('test_key');

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error / connection refused'));

      const res = await service.generateContent({
        word: testWord,
        promptType: 'sentences',
      });

      expect(res.isFallback).toBe(true);
      expect(res.content).toContain('Câu 1:');
      expect(res.content).toContain(testWord.exampleSentence.chinese);
    });

    it('caches responses in-memory to prevent repeated API latency', async () => {
      service.setApiKey('test_key');

      const mockApiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Cached Gemini Content' }],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      // First call
      const res1 = await service.generateContent({
        word: testWord,
        promptType: 'mnemonic',
      });
      expect(res1.content).toBe('Cached Gemini Content');
      expect(res1.cached).toBeUndefined();

      // Second call: should hit in-memory cache
      const res2 = await service.generateContent({
        word: testWord,
        promptType: 'mnemonic',
      });
      expect(res2.content).toBe('Cached Gemini Content');
      expect(res2.cached).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
