/**
 * tests/stress/charDataLoader.stress.test.ts
 *
 * Empirical Adversarial Stress Test Suite for 4-Tier Character Data Loader:
 * 1. Schema & Data Integrity of all 97 bundled character files in public/data/hanzi/
 * 2. 4-Tier Fallback Pipeline (Memory -> CacheStorage -> Local -> CDN jsDelivr -> CDN unpkg -> Exhaustion)
 * 3. Offline Resilience & Network Interruption Handling
 * 4. Corrupt & Malformed Data Adversarial Fuzzing
 * 5. Concurrency & In-Flight Fetch Deduplication (Adversarial Challenge)
 * 6. Timer & CacheStorage Latency Resilience
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
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

const VALID_MOCK_CHAR: CharacterJson = {
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

describe('Empirical Adversarial Stress Suite: charDataLoader', () => {
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

  // =========================================================================
  // SUITE 1: 97 Offline Character Datasets Integrity Verification
  // =========================================================================
  describe('Suite 1: Empirical Verification of 97 Offline Character Datasets', () => {
    const hanziDir = path.resolve(process.cwd(), 'public/data/hanzi');

    it('verifies that public/data/hanzi exists and contains exactly 97 character files', () => {
      expect(fs.existsSync(hanziDir)).toBe(true);
      const files = fs.readdirSync(hanziDir).filter((f) => f.endsWith('.json'));
      expect(files.length).toBe(97);
    });

    it('verifies that each of the 97 character files is valid JSON with non-empty strokes and medians', () => {
      const files = fs.readdirSync(hanziDir).filter((f) => f.endsWith('.json'));
      const failureList: string[] = [];

      for (const file of files) {
        const fullPath = path.join(hanziDir, file);
        try {
          const raw = fs.readFileSync(fullPath, 'utf-8');
          const parsed = JSON.parse(raw);

          if (!isValidCharacterJson(parsed)) {
            failureList.push(`${file}: failed isValidCharacterJson`);
            continue;
          }

          // Strict SVG path check on each stroke
          for (let i = 0; i < parsed.strokes.length; i++) {
            const stroke = parsed.strokes[i];
            if (typeof stroke !== 'string' || !stroke.startsWith('M') || stroke.length < 5) {
              failureList.push(`${file}: stroke[${i}] is malformed SVG`);
            }
          }

          // Strict coordinate check on each median
          for (let i = 0; i < parsed.medians.length; i++) {
            const strokeMedians = parsed.medians[i];
            if (!Array.isArray(strokeMedians) || strokeMedians.length === 0) {
              failureList.push(`${file}: median[${i}] is empty`);
              continue;
            }
            for (const pt of strokeMedians) {
              if (
                !Array.isArray(pt) ||
                pt.length !== 2 ||
                typeof pt[0] !== 'number' ||
                typeof pt[1] !== 'number' ||
                isNaN(pt[0]) ||
                isNaN(pt[1])
              ) {
                failureList.push(`${file}: median point is invalid coordinate`);
              }
            }
          }

          // Stroke and median length parity
          if (parsed.strokes.length !== parsed.medians.length) {
            failureList.push(
              `${file}: strokes.length (${parsed.strokes.length}) !== medians.length (${parsed.medians.length})`
            );
          }
        } catch (err: any) {
          failureList.push(`${file}: JSON parse error: ${err.message}`);
        }
      }

      expect(failureList).toEqual([]);
    });
  });

  // =========================================================================
  // SUITE 2: 4-Tier Fallback Pipeline
  // =========================================================================
  describe('Suite 2: 4-Tier Fallback Pipeline Stress Testing', () => {
    it('Tier 1: returns character instantly from memory with zero I/O or network', async () => {
      setMemoryCharData('学', VALID_MOCK_CHAR);

      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;
      const cachesSpy = vi.fn();
      (global as any).caches = { open: cachesSpy };

      const start = performance.now();
      const result = await resilientCharDataLoader('学');
      const elapsed = performance.now() - start;

      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(cachesSpy).not.toHaveBeenCalled();
      expect(elapsed).toBeLessThan(10);
    });

    it('Tier 2: CacheStorage hit populates Tier 1 memory and avoids network fetch', async () => {
      const mockMatch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => VALID_MOCK_CHAR,
      });
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: mockMatch,
          put: vi.fn(),
        }),
      };

      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const result = await resilientCharDataLoader('中');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(mockMatch).toHaveBeenCalledWith('/data/hanzi/%E4%B8%AD.json');

      // Subsequent call hits Tier 1
      mockMatch.mockClear();
      const secondResult = await resilientCharDataLoader('中');
      expect(secondResult).toEqual(VALID_MOCK_CHAR);
      expect(mockMatch).not.toHaveBeenCalled();
    });

    it('Tier 3: Local file fetch populates both Tier 1 and Tier 2', async () => {
      const mockPut = vi.fn().mockResolvedValue(undefined);
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: mockPut,
        }),
      };

      const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
        if (url === '/data/hanzi/%E6%96%87.json') {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });
      global.fetch = fetchSpy;

      const result = await resilientCharDataLoader('文');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(fetchSpy).toHaveBeenCalledWith('/data/hanzi/%E6%96%87.json');
      expect(mockPut).toHaveBeenCalled();
      expect(getMemoryCacheSize()).toBe(1);
    });

    it('Tier 4a: Fallback to jsDelivr CDN when local asset returns 404', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return { ok: false, status: 404 } as Response;
        }
        if (url.includes('cdn.jsdelivr.net')) {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        return { ok: false, status: 500 } as Response;
      });
      global.fetch = fetchSpy;

      const result = await resilientCharDataLoader('国');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/%E5%9B%BD.json'),
        expect.any(Object)
      );
      expect(getMemoryCacheSize()).toBe(1);
    });

    it('Tier 4b: Fallback to unpkg CDN when jsDelivr fails with 500 or network error', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return { ok: false, status: 404 } as Response;
        }
        if (url.includes('jsdelivr.net')) {
          throw new Error('Network error: jsDelivr unreachable');
        }
        if (url.includes('unpkg.com')) {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        return { ok: false, status: 500 } as Response;
      });
      global.fetch = fetchSpy;

      const result = await resilientCharDataLoader('家');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('unpkg.com/hanzi-writer-data@2.0.1/%E5%AE%B6.json'),
        expect.any(Object)
      );
    });

    it('Tier Exhaustion: throws clean Vietnamese error and triggers onError callback', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
        }),
      };
      global.fetch = vi.fn().mockRejectedValue(new Error('Complete network failure'));

      const onError = vi.fn();
      await expect(resilientCharDataLoader('龙', undefined, onError)).rejects.toThrow(
        /Không thể tải dữ liệu nét chữ Hán cho '龙' \(Đã thử Bộ nhớ đệm, Local và CDN\)\./
      );
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Không thể tải dữ liệu nét chữ Hán cho \'龙\''),
        })
      );
    });
  });

  // =========================================================================
  // SUITE 3: Offline Resilience & Network Failure
  // =========================================================================
  describe('Suite 3: Offline Resilience & Network Failure Simulation', () => {
    it('succeeds offline when local asset is present even though external CDN is unreachable', async () => {
      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        throw new TypeError('Failed to fetch (offline)');
      });

      const result = await resilientCharDataLoader('你');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/data/hanzi/%E4%BD%A0.json');
    });

    it('succeeds offline from Tier 2 CacheStorage when network is completely down and local fetch throws', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue({
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          }),
        }),
      };

      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await resilientCharDataLoader('好');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles offline failure gracefully when no tiers have data without unhandled rejection', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      let caughtErr: Error | null = null;
      try {
        await resilientCharDataLoader('汉');
      } catch (err: any) {
        caughtErr = err;
      }

      expect(caughtErr).not.toBeNull();
      expect(caughtErr?.message).toContain("Không thể tải dữ liệu nét chữ Hán cho '汉'");
    });
  });

  // =========================================================================
  // SUITE 4: Corrupt & Malformed Data Adversarial Fuzzing
  // =========================================================================
  describe('Suite 4: Corrupt & Malformed Data Handling', () => {
    it('bypasses corrupt JSON in CacheStorage (Tier 2 SyntaxError) and falls back to Tier 3', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue({
            ok: true,
            json: async () => {
              throw new SyntaxError('Unexpected token < in JSON at position 0');
            },
          }),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });

      const result = await resilientCharDataLoader('日');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(global.fetch).toHaveBeenCalledWith('/data/hanzi/%E6%97%A5.json');
    });

    it('bypasses invalid schema in CacheStorage (empty strokes) and falls back to Tier 3', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ strokes: [], medians: [] }),
          }),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });

      const result = await resilientCharDataLoader('月');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(global.fetch).toHaveBeenCalledWith('/data/hanzi/%E6%9C%88.json');
    });

    it('bypasses corrupt Tier 3 local response (missing medians) and falls back to Tier 4 CDN', async () => {
      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(undefined),
        }),
      };

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return {
            ok: true,
            json: async () => ({ strokes: ['M 0 0 Z'] }), // medians missing
          } as Response;
        }
        if (url.includes('cdn.jsdelivr.net')) {
          return {
            ok: true,
            json: async () => VALID_MOCK_CHAR,
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });

      const result = await resilientCharDataLoader('山');
      expect(result).toEqual(VALID_MOCK_CHAR);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/%E5%B1%B1.json'),
        expect.any(Object)
      );
    });

    it('validates schema boundaries exhaustively in isValidCharacterJson', () => {
      expect(isValidCharacterJson(null)).toBe(false);
      expect(isValidCharacterJson(undefined)).toBe(false);
      expect(isValidCharacterJson(123)).toBe(false);
      expect(isValidCharacterJson('string')).toBe(false);
      expect(isValidCharacterJson(true)).toBe(false);
      expect(isValidCharacterJson([])).toBe(false);
      expect(isValidCharacterJson({})).toBe(false);
      expect(isValidCharacterJson({ strokes: [] })).toBe(false);
      expect(isValidCharacterJson({ strokes: ['M 0 0 Z'] })).toBe(false);
      expect(isValidCharacterJson({ strokes: ['M 0 0 Z'], medians: [] })).toBe(false);
      expect(isValidCharacterJson({ strokes: [], medians: [[[0, 0]]] })).toBe(false);
      expect(isValidCharacterJson({ strokes: 'not an array', medians: [[[0, 0]]] })).toBe(false);
      expect(isValidCharacterJson({ strokes: ['M 0 0 Z'], medians: 'not an array' })).toBe(false);
      expect(isValidCharacterJson({ strokes: ['M 0 0 Z'], medians: [[[0, 0]]] })).toBe(true);
      expect(isValidCharacterJson(VALID_MOCK_CHAR)).toBe(true);
    });

    it('rejects invalid inputs immediately with Vietnamese error messages', async () => {
      await expect(resilientCharDataLoader('')).rejects.toThrow('Ký tự chữ Hán không hợp lệ.');
      await expect(resilientCharDataLoader('   ')).rejects.toThrow('Ký tự chữ Hán không được để trống.');
      await expect(resilientCharDataLoader(null as any)).rejects.toThrow('Ký tự chữ Hán không hợp lệ.');
      await expect(resilientCharDataLoader(undefined as any)).rejects.toThrow('Ký tự chữ Hán không hợp lệ.');
      await expect(resilientCharDataLoader(123 as any)).rejects.toThrow('Ký tự chữ Hán không hợp lệ.');
    });
  });

  // =========================================================================
  // SUITE 5: Concurrency & In-Flight Fetch Deduplication (Adversarial Challenge)
  // =========================================================================
  describe('Suite 5: Concurrency & In-Flight Fetch Deduplication (Adversarial Findings)', () => {
    it('Vulnerability 1: proves that rapid concurrent requests for the same character trigger redundant duplicate fetch calls instead of deduplicating in-flight requests', async () => {
      let fetchCallCount = 0;
      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        fetchCallCount++;
        // Simulate real-world 30ms latency for network/disk I/O
        await new Promise((resolve) => setTimeout(resolve, 30));
        return {
          ok: true,
          json: async () => VALID_MOCK_CHAR,
        } as Response;
      });

      // Fire 10 concurrent requests for the same character simultaneously
      const promises = Array.from({ length: 10 }, () => resilientCharDataLoader('水'));
      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      for (const res of results) {
        expect(res).toEqual(VALID_MOCK_CHAR);
      }

      // Hard assertion for in-flight fetch deduplication:
      // When 10 concurrent requests request the same character in flight, exactly 1 fetch should be performed!
      // This assertion will FAIL if charDataLoader lacks in-flight promise deduplication.
      expect(
        fetchCallCount,
        `CRITICAL DEFECT: Expected in-flight fetch deduplication (1 fetch), but got ${fetchCallCount} duplicate network calls!`
      ).toBe(1);
    });

    it('Vulnerability 2: proves that failed CDN fetches leak active setTimeout timers (timeoutId not cleared on fetch rejection)', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
        }),
      };

      // Both CDN urls fail with network error
      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('/data/hanzi/')) {
          return { ok: false, status: 404 } as Response;
        }
        throw new TypeError('Network error: CDN unreachable');
      });

      try {
        await resilientCharDataLoader('未');
      } catch {
        // Expected failure
      }

      // In charDataLoader.ts line 114:
      // setTimeout is called for each CDN attempt (2 CDN URLs -> 2 timers created)
      // When fetch throws in line 116, it jumps to catch (line 131), skipping line 120 (clearTimeout(timeoutId))!
      // Therefore clearTimeout is NEVER called for these 2 timers!
      const cdnTimeoutsCreated = setTimeoutSpy.mock.calls.filter((call) => call[1] === 6000).length;
      const cdnTimeoutsCleared = clearTimeoutSpy.mock.calls.length;

      expect(cdnTimeoutsCreated).toBe(2);
      expect(
        cdnTimeoutsCleared,
        `RESOURCE LEAK: ${cdnTimeoutsCreated} CDN timeout timers created, but only ${cdnTimeoutsCleared} were cleared on fetch failure!`
      ).toBe(cdnTimeoutsCreated);
    });

    it('Vulnerability 3: verifies that saveToCacheStorage is non-blocking and does not delay returning character data', async () => {
      let cachePutFinished = false;
      const slowCachePut = vi.fn().mockImplementation(async () => {
        // Simulate 80ms slow CacheStorage disk write
        await new Promise((resolve) => setTimeout(resolve, 80));
        cachePutFinished = true;
      });

      (global as any).caches = {
        open: vi.fn().mockResolvedValue({
          match: vi.fn().mockResolvedValue(null),
          put: slowCachePut,
        }),
      };

      global.fetch = vi.fn().mockImplementation(async () => {
        return {
          ok: true,
          json: async () => VALID_MOCK_CHAR,
        } as Response;
      });

      const start = performance.now();
      await resilientCharDataLoader('木');
      const duration = performance.now() - start;

      // In optimal design, memoryCache is set and returned immediately, while CacheStorage write is non-blocking.
      expect(cachePutFinished).toBe(false);
      expect(duration).toBeLessThan(70);

      // Clean up slow background timer by awaiting it
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cachePutFinished).toBe(true);
    });
  });
});
