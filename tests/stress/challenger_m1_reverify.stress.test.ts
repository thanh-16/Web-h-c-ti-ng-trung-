import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  HSK_CURRICULUM,
  searchHskWords,
  normalizePinyin,
  normalizeVietnamese,
} from '@/data/hskCurriculum';
import { AudioContextManager } from '@/services/audioContext';

class MockAudioBufferSource {
  buffer: any = null;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  state: AudioContextState = 'suspended';
  sampleRate = 44100;
  destination = {};

  createBuffer(channels: number, length: number, sampleRate: number) {
    return { channels, length, sampleRate };
  }

  createBufferSource() {
    return new MockAudioBufferSource();
  }

  async resume() {
    this.state = 'running';
  }

  async close() {
    this.state = 'closed';
  }
}

describe('Challenger M1 Re-Verification Suite: Empirical Hard Proofs', () => {
  beforeEach(() => {
    (window as any).AudioContext = MockAudioContext;
    delete (window as any).webkitAudioContext;
    const manager = AudioContextManager.getInstance();
    (manager as any).ctx = null;
    (manager as any).isContextUnlocked = false;
    (manager as any).unlockListenersAttached = false;
  });

  afterEach(async () => {
    const manager = AudioContextManager.getInstance();
    await manager.closeContext();
  });

  describe('Item 2.1: Pinyin Normalization with Umlaut Diaeresis', () => {
    it('empirically verifies normalizePinyin("lǜ") === "lv"', () => {
      expect(normalizePinyin('lǜ')).toBe('lv');
    });

    it('empirically verifies all 4 tones of ü and decomposed combinations', () => {
      expect(normalizePinyin('lü')).toBe('lv');
      expect(normalizePinyin('lǖ')).toBe('lv');
      expect(normalizePinyin('lǘ')).toBe('lv');
      expect(normalizePinyin('lǚ')).toBe('lv');
      expect(normalizePinyin('lǜ')).toBe('lv');
      expect(normalizePinyin('nǚ')).toBe('nv');
      expect(normalizePinyin('NÜ')).toBe('nv');
      expect(normalizePinyin('Nǚ')).toBe('nv');
      // Decomposed u + combining diaeresis
      expect(normalizePinyin('u\u0308')).toBe('v');
      expect(normalizePinyin('lu\u0308')).toBe('lv');
    });
  });

  describe('Item 2.2: searchHskWords("yun lv") matches 韵律', () => {
    it('empirically verifies searchHskWords("yun lv") matches 韵律', () => {
      const results = searchHskWords('yun lv');
      expect(results.length).toBeGreaterThanOrEqual(1);
      const matched = results.find((w) => w.hanzi === '韵律');
      expect(matched, 'Expected 韵律 in results for "yun lv"').toBeDefined();
      expect(matched?.id).toBe('hsk3-30-yunlv');
    });

    it('empirically verifies compound without space "yunlv" also matches 韵律', () => {
      const results = searchHskWords('yunlv');
      expect(results.some((w) => w.hanzi === '韵律')).toBe(true);
    });

    it('empirically verifies numbered format "yun4 lv4" matches 韵律', () => {
      const results = searchHskWords('yun4 lv4');
      expect(results.some((w) => w.hanzi === '韵律')).toBe(true);
    });
  });

  describe('Item 2.3: searchHskWords("nihao") matches 你好', () => {
    it('empirically verifies searchHskWords("nihao") matches 你好', () => {
      const results = searchHskWords('nihao');
      expect(results.length).toBeGreaterThanOrEqual(1);
      const matched = results.find((w) => w.hanzi === '你好');
      expect(matched, 'Expected 你好 in results for "nihao"').toBeDefined();
      expect(matched?.pinyin).toBe('nǐ hǎo');
    });

    it('empirically verifies other common compound words without spaces', () => {
      expect(searchHskWords('xuexi').some((w) => w.hanzi === '学习')).toBe(true);
      expect(searchHskWords('pengyou').some((w) => w.hanzi === '朋友')).toBe(true);
      expect(searchHskWords('tianqi').some((w) => w.hanzi === '天气')).toBe(true);
      expect(searchHskWords('dianhua').some((w) => w.hanzi === '电话')).toBe(true);
    });
  });

  describe('Item 2.4: searchHskWords("hoc") matches 学', () => {
    it('empirically verifies searchHskWords("hoc") matches 学', () => {
      const results = searchHskWords('hoc');
      expect(results.length).toBeGreaterThanOrEqual(1);
      const matchedSingle = results.find((w) => w.hanzi === '学');
      const matchedCompound = results.find((w) => w.hanzi === '学习');
      expect(matchedSingle, 'Expected 学 in results for "hoc"').toBeDefined();
      expect(matchedCompound, 'Expected 学习 in results for "hoc"').toBeDefined();
    });

    it('empirically verifies case-insensitivity: "HOC" matches 学', () => {
      const results = searchHskWords('HOC');
      expect(results.some((w) => w.hanzi === '学')).toBe(true);
    });

    it('empirically verifies false positive prevention: accented "hóc" does NOT match 学', () => {
      const results = searchHskWords('hóc');
      expect(results.some((w) => w.hanzi === '学')).toBe(false);
      expect(results.some((w) => w.hanzi === '学习')).toBe(false);
    });
  });

  describe('Item 2.5: AudioContextManager.getInstance().unlockAudioContext() resolves cleanly', () => {
    it('empirically verifies unlockAudioContext() exists, returns Promise<boolean>, and resolves to true', async () => {
      const manager = AudioContextManager.getInstance();
      expect(typeof manager.unlockAudioContext).toBe('function');

      const unlockPromise = manager.unlockAudioContext();
      expect(unlockPromise).toBeInstanceOf(Promise);

      const result = await unlockPromise;
      expect(result).toBe(true);
      expect(manager.isUnlocked()).toBe(true);
      expect(manager.getContext()?.state).toBe('running');
    });

    it('empirically verifies unlockAudioContext() is idempotent under rapid concurrent calls', async () => {
      const manager = AudioContextManager.getInstance();
      const concurrentCalls = Array.from({ length: 25 }, () => manager.unlockAudioContext());
      const results = await Promise.all(concurrentCalls);

      expect(results.every((r) => r === true)).toBe(true);
      expect(manager.isUnlocked()).toBe(true);
    });
  });
});
