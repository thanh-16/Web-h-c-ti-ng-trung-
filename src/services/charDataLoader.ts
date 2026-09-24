/**
 * charDataLoader.ts
 * 4-Tier Resilient Character Data Loader for HanziWriter & HanziVibe (汉字韵)
 *
 * Tier 1: In-memory Map cache (0ms instant lookup)
 * Tier 2: Browser CacheStorage / PWA Cache (IndexedDB/Cache API)
 * Tier 3: Local bundled Next.js static assets (/data/hanzi/${char}.json)
 * Tier 4: CDN fallback (jsDelivr / unpkg)
 *
 * Automatically propagates loaded assets into higher tiers (T3/T4 -> T2 -> T1)
 * for 100% offline PWA capability.
 */

import type { CharacterJson, CharDataLoaderFn } from 'hanzi-writer';

export const CACHE_STORAGE_NAME = 'hanzivibe-char-data-v1';

// Tier 1: In-Memory Map Cache
const memoryCache = new Map<string, CharacterJson>();

/**
 * Saves character data to browser CacheStorage (Tier 2)
 */
export async function saveToCacheStorage(char: string, data: CharacterJson): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_STORAGE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    await cache.put(`/data/hanzi/${encodeURIComponent(char)}.json`, response);
  } catch (err) {
    // Non-fatal cache write failure (e.g., storage quota exceeded, private browsing)
    console.warn(`[charDataLoader] Failed to save '${char}' to CacheStorage:`, err);
  }
}

/**
 * 4-Tier Resilient Character Data Loader function
 * Compatible with HanziWriter's charDataLoader option
 */
export const resilientCharDataLoader: CharDataLoaderFn = async (
  char: string,
  onLoad?: (data: CharacterJson) => void,
  onError?: (err?: any) => void
): Promise<CharacterJson> => {
  if (!char || typeof char !== 'string') {
    const err = new Error('Ký tự chữ Hán không hợp lệ.');
    if (onError) onError(err);
    throw err;
  }

  const targetChar = char.trim();
  if (targetChar.length === 0) {
    const err = new Error('Ký tự chữ Hán không được để trống.');
    if (onError) onError(err);
    throw err;
  }

  // Tier 1: In-Memory Map Cache
  if (memoryCache.has(targetChar)) {
    const data = memoryCache.get(targetChar)!;
    if (onLoad) onLoad(data);
    return data;
  }

  // Tier 2: Browser CacheStorage (PWA Offline Cache)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_STORAGE_NAME);
      const cachedResponse = await cache.match(`/data/hanzi/${encodeURIComponent(targetChar)}.json`);
      if (cachedResponse && cachedResponse.ok) {
        const data = (await cachedResponse.json()) as CharacterJson;
        if (isValidCharacterJson(data)) {
          memoryCache.set(targetChar, data);
          if (onLoad) onLoad(data);
          return data;
        }
      }
    } catch {
      // Non-fatal Tier 2 cache check failure, proceed to Tier 3
    }
  }

  // Tier 3: Local Next.js Static Bundled Data (/public/data/hanzi/[char].json)
  try {
    const localUrl = `/data/hanzi/${encodeURIComponent(targetChar)}.json`;
    const localRes = await fetch(localUrl);
    if (localRes.ok) {
      const data = (await localRes.json()) as CharacterJson;
      if (isValidCharacterJson(data)) {
        memoryCache.set(targetChar, data);
        await saveToCacheStorage(targetChar, data);
        if (onLoad) onLoad(data);
        return data;
      }
    }
  } catch {
    // Local fetch failed (e.g., file not found or offline mode), fallback to Tier 4
  }

  // Tier 4: Public CDN Fallbacks (jsDelivr -> unpkg)
  const cdnUrls = [
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(targetChar)}.json`,
    `https://unpkg.com/hanzi-writer-data@2.0.1/${encodeURIComponent(targetChar)}.json`,
  ];

  for (const url of cdnUrls) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

      const res = await fetch(url, {
        signal: controller?.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as CharacterJson;
        if (isValidCharacterJson(data)) {
          memoryCache.set(targetChar, data);
          await saveToCacheStorage(targetChar, data);
          if (onLoad) onLoad(data);
          return data;
        }
      }
    } catch {
      // Continue to next CDN url
      continue;
    }
  }

  const finalError = new Error(
    `Không thể tải dữ liệu nét chữ Hán cho '${targetChar}' (Đã thử Bộ nhớ đệm, Local và CDN).`
  );
  if (onError) onError(finalError);
  throw finalError;
};

/**
 * Validates that character data adheres to expected schema
 */
export function isValidCharacterJson(data: any): data is CharacterJson {
  return (
    data !== null &&
    typeof data === 'object' &&
    Array.isArray(data.strokes) &&
    data.strokes.length > 0 &&
    Array.isArray(data.medians) &&
    data.medians.length > 0
  );
}

/**
 * Preload an array of characters or a multi-character string
 */
export async function preloadCharData(chars: string | string[]): Promise<CharacterJson[]> {
  const charArray = typeof chars === 'string' ? Array.from(chars) : chars;
  const uniqueChars = Array.from(new Set(charArray)).filter((c) => c.trim().length > 0);

  const results = await Promise.allSettled(
    uniqueChars.map((char) => resilientCharDataLoader(char, () => {}, () => {}))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<CharacterJson> => r.status === 'fulfilled')
    .map((r) => r.value);
}

/**
 * Utility to query memory cache size
 */
export function getMemoryCacheSize(): number {
  return memoryCache.size;
}

/**
 * Utility to check if character is already in memory
 */
export function isCharDataInMemory(char: string): boolean {
  return memoryCache.has(char.trim());
}

/**
 * Set custom character data in memory (useful for testing or custom fonts)
 */
export function setMemoryCharData(char: string, data: CharacterJson): void {
  memoryCache.set(char.trim(), data);
}

/**
 * Clear in-memory cache
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
}

/**
 * Clear all cache layers (Memory and CacheStorage)
 */
export async function clearAllCharDataCache(): Promise<void> {
  clearMemoryCache();
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      await caches.delete(CACHE_STORAGE_NAME);
    } catch {
      // Ignore cache deletion error
    }
  }
}

export default resilientCharDataLoader;
