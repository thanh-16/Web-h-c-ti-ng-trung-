import { describe, it, expect } from 'vitest';
import {
  HSK_CURRICULUM,
  getHskWordById,
  getHskWordsByTone,
  getHskWordsByLevel,
  searchHskWords,
} from '@/data/hskCurriculum';

describe('HSK Curriculum Data Store Integrity', () => {
  it('contains at least 25 authentic HSK vocabulary entries', () => {
    expect(HSK_CURRICULUM.length).toBeGreaterThanOrEqual(25);
  });

  it('covers all 4 Mandarin Chinese tones (Tone 1, 2, 3, 4)', () => {
    const tonesPresent = new Set<number>();
    HSK_CURRICULUM.forEach((w) => {
      tonesPresent.add(w.tone);
      w.tones.forEach((t) => tonesPresent.add(t));
    });

    expect(tonesPresent.has(1)).toBe(true);
    expect(tonesPresent.has(2)).toBe(true);
    expect(tonesPresent.has(3)).toBe(true);
    expect(tonesPresent.has(4)).toBe(true);
  });

  it('verifies 100% field completeness for every word (no undefined or dummy values)', () => {
    HSK_CURRICULUM.forEach((word) => {
      expect(word.id).toBeDefined();
      expect(word.id.trim().length).toBeGreaterThan(0);

      // Tier 1: Chữ Hán
      expect(word.hanzi).toBeDefined();
      expect(word.hanzi.trim().length).toBeGreaterThan(0);

      // Tier 2: Pinyin & tones
      expect(word.pinyin).toBeDefined();
      expect(word.pinyin.trim().length).toBeGreaterThan(0);
      expect(word.pinyinNumbered).toBeDefined();
      expect(word.tone).toBeGreaterThanOrEqual(1);
      expect(word.tone).toBeLessThanOrEqual(5);
      expect(Array.isArray(word.tones)).toBe(true);
      expect(word.tones.length).toBeGreaterThan(0);

      // Tier 3: Âm Hán Việt
      expect(word.sinoVietnamese).toBeDefined();
      expect(word.sinoVietnamese.trim().length).toBeGreaterThan(0);

      // Tier 4: Nghĩa tiếng Việt
      expect(word.vietnameseMeaning).toBeDefined();
      expect(word.vietnameseMeaning.trim().length).toBeGreaterThan(0);

      // Pedagogical details
      expect([1, 2, 3]).toContain(word.hskLevel);
      expect(word.radical).toBeDefined();
      expect(word.radical.trim().length).toBeGreaterThan(0);
      expect(word.radicalMeaning).toBeDefined();
      expect(word.strokeCount).toBeGreaterThan(0);

      // Context sentence
      expect(word.exampleSentence).toBeDefined();
      expect(word.exampleSentence.chinese.trim().length).toBeGreaterThan(0);
      expect(word.exampleSentence.pinyin.trim().length).toBeGreaterThan(0);
      expect(word.exampleSentence.vietnamese.trim().length).toBeGreaterThan(0);
    });
  });

  it('guarantees unique IDs across the curriculum', () => {
    const ids = HSK_CURRICULUM.map((w) => w.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('retrieves word by ID accurately', () => {
    const word = getHskWordById('hsk1-01-ni');
    expect(word).toBeDefined();
    expect(word?.hanzi).toBe('你');
    expect(word?.sinoVietnamese).toBe('NHĨ');

    const nonExistent = getHskWordById('non-existent-id');
    expect(nonExistent).toBeUndefined();
  });

  it('filters words by tone accurately', () => {
    const tone1Words = getHskWordsByTone(1);
    expect(tone1Words.length).toBeGreaterThan(0);
    tone1Words.forEach((w) => {
      const hasTone1 = w.tone === 1 || w.tones.includes(1);
      expect(hasTone1).toBe(true);
    });

    const tone4Words = getHskWordsByTone(4);
    expect(tone4Words.length).toBeGreaterThan(0);
  });

  it('filters words by HSK level correctly', () => {
    const level1 = getHskWordsByLevel(1);
    const level2 = getHskWordsByLevel(2);
    const level3 = getHskWordsByLevel(3);

    expect(level1.length).toBeGreaterThan(0);
    expect(level2.length).toBeGreaterThan(0);
    expect(level3.length).toBeGreaterThan(0);
    expect(level1.length + level2.length + level3.length).toBe(HSK_CURRICULUM.length);
  });

  it('searches curriculum by hanzi, pinyin, and Vietnamese keywords', () => {
    const searchByHanzi = searchHskWords('学');
    expect(searchByHanzi.some((w) => w.hanzi.includes('学'))).toBe(true);

    const searchByPinyin = searchHskWords('xue');
    expect(searchByPinyin.length).toBeGreaterThan(0);

    const searchBySinoVietnamese = searchHskWords('HỌC');
    expect(searchBySinoVietnamese.length).toBeGreaterThan(0);

    const searchByVietnamese = searchHskWords('gia đình');
    expect(searchByVietnamese.length).toBeGreaterThan(0);
  });
});
