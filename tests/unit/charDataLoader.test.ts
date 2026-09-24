/**
 * charDataLoader.test.ts
 * Unit tests for 4-Tier Resilient Character Data Loader
 * Validates Tier 1 (Memory) -> Tier 2 (CacheStorage) -> Tier 3 (Local) -> Tier 4 (CDN)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resilientCharDataLoader,
  saveToCacheStorage,
  isValidCharacterJson,
  clearMemoryCache,
  clearAllCharDataCache,
  getMemoryCacheSize,
  setMemoryCharData,
  preloadCharData,
  CACHE_STORAGE_NAME,
} from '@/services/charDataLoader';
import type { CharacterJson } from 'hanzi-writer';

const MOCK_CHAR_DATA: CharacterJson = {
  strokes: [
    'M 272 567 Q 306 613 342 669 Z',
    'M 241 527 Q 262 506 258 375 Z',
  ],
  medians: [
    [[317, 812], [342, 786]],
    [[241, 527], [262, 506]],
  ],
  radStrokes: [0, 1],
};

describe('charDataLoader 4-Tier Pipeline', () => {
  const originalFetch = global.fetch;
  const originalCaches = (global as any).caches;

  beforeEach(() => {
    clearMemoryCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalCaches !== undefined) {
      (global as any).caches = originalCaches;
    } else {
      delete (global as any).caches;
    }
  });

  describe('Tier 1: In-Memory Map Cache', () => {
    it('returns character data instantly from memory without invoking network or storage', async () => {
      setMemoryCharData('你', MOCK_CHAR_DATA);
      expect(getMemoryCacheSize()).toBe(1);

      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const result = await resilientCharDataLoader('你');
      expect(result).toEqual(MOCK_CHAR_DATA);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('supports callback pattern (onLoad)', async () => {
      setMemoryCharData('好', MOCK_CHAR_DATA);
      const onLoadSpy = vi.fn();

      const result = await resilientCharDataLoader('好', onLoadSpy);
      expect(result).toEqual(MOCK_CHAR_DATA);
      expect(onLoadSpy).toHaveBeenCalledWith(MOCK_CHAR_DATA);
    });
  });

  describe('Tier 2: Browser CacheStorage (PWA Offline Cache)', () => {
    it('retrieves from CacheStorage when memory cache misses, and populates Tier 1', async () => {
      const mockResponse = {
        ok: true,
        json: async () => MOCK_CHAR_DATA,
      };

      const mockCache = {
        match: vi.fn().mockResolvedValue(mockResponse),
        put: vi.fn().mockResolvedValue(undefined),
      };

      (global as any).caches = {
        open: vi.fn().mockResolvedValue(mockCache),
        delete: vi.fn().mockResolvedValue(true),
      };

      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const result = await resilientCharDataLoader('学');
      expect(result).toEqual(MOCK_CHAR_DATA);
      expect(mockCache.match).toHaveBeenCalledWith('/data/hanzi/%E5%AD%A6.json');
      expect(fetchSpy).not.toHaveBeenCalled();

      // Verify Tier 1 memory cache was populated
      expect(getMemoryCacheSize()).toBe(1);

      // Subsequent call hits Tier 1
      mockCache.match.mockClear();
      const secondResult = await resilientCharDataLoader('学');
      expect(secondResult).toEqual(MOCK_CHAR_DATA);
      expect(mockCache.match).not.toHaveBeenCalled();
    });
  });

  describe('Tier 3: Local Next.js Bundled Data (/data/hanzi/[char].json)', () => {
    it('fetches local bundled asset when CacheStorage misses, and stores in Tier 1 and Tier 2', async () => {
      const mockCache = {
        match: vi.fn().mockResolvedValue(null), // Tier 2 miss
        put: vi.fn().mockResolvedValue(undefined),
      };

      (global as any).caches = {
        open: vi.fn().mockResolvedValue(mockCache),
      };

      // Mock fetch: returns local json
      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return {
            ok: true,
            json: async () => MOCK_CHAR_DATA,
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });

      const result = await resilientCharDataLoader('大');
      expect(result).toEqual(MOCK_CHAR_DATA);
      expect(global.fetch).toHaveBeenCalledWith('/data/hanzi/%E5%A4%A7.json');

      // Verify written to Tier 2 (CacheStorage)
      expect(mockCache.put).toHaveBeenCalled();

      // Verify written to Tier 1
      expect(getMemoryCacheSize()).toBe(1);
    });
  });

  describe('Tier 4: CDN Fallback (jsDelivr / unpkg)', () => {
    it('falls back to jsDelivr CDN when local asset fetch fails', async () => {
      // Tier 2 miss
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return { ok: false, status: 404 } as Response;
        }
        if (url.includes('cdn.jsdelivr.net')) {
          return {
            ok: true,
            json: async () => MOCK_CHAR_DATA,
          } as Response;
        }
        return { ok: false, status: 500 } as Response;
      });

      const result = await resilientCharDataLoader('天');
      expect(result).toEqual(MOCK_CHAR_DATA);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/%E5%A4%A9.json'),
        expect.any(Object)
      );

      // Verify saved to memory cache
      expect(getMemoryCacheSize()).toBe(1);
    });

    it('falls back to unpkg if jsDelivr fails', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/') || url.includes('jsdelivr.net')) {
          return { ok: false, status: 502 } as Response;
        }
        if (url.includes('unpkg.com')) {
          return {
            ok: true,
            json: async () => MOCK_CHAR_DATA,
          } as Response;
        }
        return { ok: false, status: 500 } as Response;
      });

      const result = await resilientCharDataLoader('日');
      expect(result).toEqual(MOCK_CHAR_DATA);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('unpkg.com/hanzi-writer-data@2.0.1/%E6%97%A5.json'),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling & Validation', () => {
    it('throws informative Vietnamese error message when all tiers fail', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response);
      const onErrorSpy = vi.fn();

      await expect(
        resilientCharDataLoader('🚀', undefined, onErrorSpy)
      ).rejects.toThrow(/Không thể tải dữ liệu nét chữ Hán cho '🚀'/);

      expect(onErrorSpy).toHaveBeenCalled();
    });

    it('rejects empty or whitespace characters immediately', async () => {
      await expect(resilientCharDataLoader('')).rejects.toThrow('Ký tự chữ Hán không hợp lệ.');
      await expect(resilientCharDataLoader('   ')).rejects.toThrow('Ký tự chữ Hán không được để trống.');
    });

    it('validates schema correctly using isValidCharacterJson', () => {
      expect(isValidCharacterJson(MOCK_CHAR_DATA)).toBe(true);
      expect(isValidCharacterJson(null)).toBe(false);
      expect(isValidCharacterJson({})).toBe(false);
      expect(isValidCharacterJson({ strokes: [] })).toBe(false);
      expect(isValidCharacterJson({ strokes: ['M 0 0 Z'], medians: [] })).toBe(false);
      expect(isValidCharacterJson({ strokes: ['M 0 0 Z'], medians: [[[0, 0]]] })).toBe(true);
    });

    it('preloadCharData preloads multiple characters concurrently', async () => {
      setMemoryCharData('你', MOCK_CHAR_DATA);
      setMemoryCharData('好', MOCK_CHAR_DATA);

      const results = await preloadCharData(['你', '好']);
      expect(results.length).toBe(2);
      expect(results[0]).toEqual(MOCK_CHAR_DATA);
    });

    it('clearAllCharDataCache clears memory and requests cache deletion', async () => {
      setMemoryCharData('你', MOCK_CHAR_DATA);
      expect(getMemoryCacheSize()).toBe(1);

      const deleteSpy = vi.fn().mockResolvedValue(true);
      (global as any).caches = {
        delete: deleteSpy,
      };

      await clearAllCharDataCache();
      expect(getMemoryCacheSize()).toBe(0);
      expect(deleteSpy).toHaveBeenCalledWith(CACHE_STORAGE_NAME);
    });
  });
});
