import { describe, it, expect } from 'vitest';
import {
  HSK_CURRICULUM,
  getHskWordById,
  getHskWordsByTone,
  getHskWordsByLevel,
  searchHskWords,
  normalizePinyin,
} from '@/data/hskCurriculum';

describe('Empirical Adversarial Stress Suite: HSK Curriculum & Search Engine', () => {
  // -------------------------------------------------------------
  // 1. DATA VALIDATION: 30 WORDS & 100% FIELD INTEGRITY
  // -------------------------------------------------------------
  describe('Dataset Completeness & Structural Integrity', () => {
    it('contains exactly 30 authentic HSK vocabulary entries', () => {
      expect(HSK_CURRICULUM).toHaveLength(30);
    });

    it('enforces unique non-empty IDs matching naming convention', () => {
      const ids = HSK_CURRICULUM.map((w) => w.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(30);

      ids.forEach((id) => {
        expect(id).toMatch(/^hsk[1-3]-\d{2}-[a-z]+$/);
      });
    });

    it('verifies all 30 words satisfy mandatory field requirements', () => {
      HSK_CURRICULUM.forEach((word, index) => {
        const ctx = `Word #${index + 1} (${word.hanzi || 'UNKNOWN'})`;

        // Hanzi
        expect(word.hanzi, `${ctx}: hanzi must be defined`).toBeDefined();
        expect(typeof word.hanzi, `${ctx}: hanzi must be a string`).toBe('string');
        expect(word.hanzi.trim().length, `${ctx}: hanzi cannot be empty`).toBeGreaterThan(0);
        // Chinese character regex (CJK Unified Ideographs)
        expect(word.hanzi, `${ctx}: hanzi must contain CJK characters`).toMatch(/[\u4e00-\u9fa5]/);

        // Pinyin
        expect(word.pinyin, `${ctx}: pinyin must be defined`).toBeDefined();
        expect(word.pinyin.trim().length, `${ctx}: pinyin cannot be empty`).toBeGreaterThan(0);

        // Pinyin Numbered
        expect(word.pinyinNumbered, `${ctx}: pinyinNumbered must be defined`).toBeDefined();
        expect(word.pinyinNumbered.trim().length, `${ctx}: pinyinNumbered cannot be empty`).toBeGreaterThan(0);
        expect(word.pinyinNumbered, `${ctx}: pinyinNumbered must include tone digits`).toMatch(/\d/);

        // Tone & Tones array
        expect(word.tone, `${ctx}: tone must be between 1 and 5`).toBeGreaterThanOrEqual(1);
        expect(word.tone, `${ctx}: tone must be between 1 and 5`).toBeLessThanOrEqual(5);
        expect(Array.isArray(word.tones), `${ctx}: tones must be an array`).toBe(true);
        expect(word.tones.length, `${ctx}: tones must have at least 1 element`).toBeGreaterThanOrEqual(1);
        word.tones.forEach((t) => {
          expect(t, `${ctx}: each tone in tones must be 1-5`).toBeGreaterThanOrEqual(1);
          expect(t, `${ctx}: each tone in tones must be 1-5`).toBeLessThanOrEqual(5);
        });

        // Sino-Vietnamese
        expect(word.sinoVietnamese, `${ctx}: sinoVietnamese must be defined`).toBeDefined();
        expect(word.sinoVietnamese.trim().length, `${ctx}: sinoVietnamese cannot be empty`).toBeGreaterThan(0);

        // Vietnamese Meaning
        expect(word.vietnameseMeaning, `${ctx}: vietnameseMeaning must be defined`).toBeDefined();
        expect(word.vietnameseMeaning.trim().length, `${ctx}: vietnameseMeaning cannot be empty`).toBeGreaterThan(0);

        // HSK Level
        expect([1, 2, 3], `${ctx}: hskLevel must be 1, 2, or 3`).toContain(word.hskLevel);

        // Radical & Radical Meaning
        expect(word.radical, `${ctx}: radical must be defined`).toBeDefined();
        expect(word.radical.trim().length, `${ctx}: radical cannot be empty`).toBeGreaterThan(0);
        expect(word.radicalMeaning, `${ctx}: radicalMeaning must be defined`).toBeDefined();
        expect(word.radicalMeaning.trim().length, `${ctx}: radicalMeaning cannot be empty`).toBeGreaterThan(0);

        // Stroke Count
        expect(typeof word.strokeCount, `${ctx}: strokeCount must be a number`).toBe('number');
        expect(word.strokeCount, `${ctx}: strokeCount must be greater than 0`).toBeGreaterThan(0);
        expect(Number.isInteger(word.strokeCount), `${ctx}: strokeCount must be an integer`).toBe(true);

        // Decomposition, Mnemonic, Tone Analysis
        expect(word.decomposition.trim().length, `${ctx}: decomposition cannot be empty`).toBeGreaterThan(0);
        expect(word.mnemonic.trim().length, `${ctx}: mnemonic cannot be empty`).toBeGreaterThan(0);
        expect(word.toneAnalysis.trim().length, `${ctx}: toneAnalysis cannot be empty`).toBeGreaterThan(0);

        // Complete Example Sentence (Tier 4 Context)
        expect(word.exampleSentence, `${ctx}: exampleSentence must exist`).toBeDefined();
        expect(word.exampleSentence.chinese.trim().length, `${ctx}: sentence chinese cannot be empty`).toBeGreaterThan(0);
        expect(word.exampleSentence.chinese, `${ctx}: sentence chinese must contain CJK`).toMatch(/[\u4e00-\u9fa5]/);
        expect(word.exampleSentence.pinyin.trim().length, `${ctx}: sentence pinyin cannot be empty`).toBeGreaterThan(0);
        expect(word.exampleSentence.vietnamese.trim().length, `${ctx}: sentence vietnamese cannot be empty`).toBeGreaterThan(0);
        expect(word.exampleSentence.sinoVietnamese.trim().length, `${ctx}: sentence sinoVietnamese cannot be empty`).toBeGreaterThan(0);

        // Related words
        expect(Array.isArray(word.relatedWords), `${ctx}: relatedWords must be an array`).toBe(true);
        expect(word.relatedWords.length, `${ctx}: relatedWords should contain entries`).toBeGreaterThan(0);
        word.relatedWords.forEach((rw, rIdx) => {
          expect(rw.hanzi.trim().length, `${ctx} relatedWord #${rIdx} hanzi cannot be empty`).toBeGreaterThan(0);
          expect(rw.pinyin.trim().length, `${ctx} relatedWord #${rIdx} pinyin cannot be empty`).toBeGreaterThan(0);
          expect(rw.sinoVietnamese.trim().length, `${ctx} relatedWord #${rIdx} sinoVietnamese cannot be empty`).toBeGreaterThan(0);
          expect(rw.vietnamese.trim().length, `${ctx} relatedWord #${rIdx} vietnamese cannot be empty`).toBeGreaterThan(0);
        });
      });
    });
  });

  // -------------------------------------------------------------
  // 2. MULTI-TONE COVERAGE & DISTRIBUTION
  // -------------------------------------------------------------
  describe('Mandarin Tones Multi-Tone Representation', () => {
    it('verifies that Tone 1 has multiple words', () => {
      const tone1Words = getHskWordsByTone(1);
      expect(tone1Words.length).toBeGreaterThanOrEqual(4);
      // Explicit words verification
      const hanziList = tone1Words.map((w) => w.hanzi);
      expect(hanziList).toContain('家');
      expect(hanziList).toContain('天');
      expect(hanziList).toContain('心');
      expect(hanziList).toContain('书');
    });

    it('verifies that Tone 2 has multiple words', () => {
      const tone2Words = getHskWordsByTone(2);
      expect(tone2Words.length).toBeGreaterThanOrEqual(4);
      const hanziList = tone2Words.map((w) => w.hanzi);
      expect(hanziList).toContain('学');
      expect(hanziList).toContain('习');
      expect(hanziList).toContain('人');
      expect(hanziList).toContain('国');
    });

    it('verifies that Tone 3 has multiple words', () => {
      const tone3Words = getHskWordsByTone(3);
      expect(tone3Words.length).toBeGreaterThanOrEqual(4);
      const hanziList = tone3Words.map((w) => w.hanzi);
      expect(hanziList).toContain('你');
      expect(hanziList).toContain('好');
      expect(hanziList).toContain('语');
      expect(hanziList).toContain('水');
      expect(hanziList).toContain('友');
    });

    it('verifies that Tone 4 has multiple words', () => {
      const tone4Words = getHskWordsByTone(4);
      expect(tone4Words.length).toBeGreaterThanOrEqual(4);
      const hanziList = tone4Words.map((w) => w.hanzi);
      expect(hanziList).toContain('汉');
      expect(hanziList).toContain('爱');
      expect(hanziList).toContain('大');
      expect(hanziList).toContain('气');
      expect(hanziList).toContain('话');
    });

    it('verifies neutral tone (Tone 5) representation in compound vocabulary', () => {
      const tone5Words = getHskWordsByTone(5);
      expect(tone5Words.length).toBeGreaterThanOrEqual(1);
      const pengyou = tone5Words.find((w) => w.hanzi === '朋友');
      expect(pengyou).toBeDefined();
      expect(pengyou?.tones).toContain(5);
    });

    it('verifies level distribution spans HSK 1, HSK 2, and HSK 3', () => {
      const lvl1 = getHskWordsByLevel(1);
      const lvl2 = getHskWordsByLevel(2);
      const lvl3 = getHskWordsByLevel(3);

      expect(lvl1.length).toBeGreaterThan(0);
      expect(lvl2.length).toBeGreaterThan(0);
      expect(lvl3.length).toBeGreaterThan(0);
      expect(lvl1.length + lvl2.length + lvl3.length).toBe(30);
    });
  });

  // -------------------------------------------------------------
  // 3. ADVERSARIAL SEARCH QUERIES
  // -------------------------------------------------------------
  describe('Adversarial Search Queries & Edge Cases', () => {
    // 3.1 Empty & Whitespace Queries
    it('returns all 30 words for empty string', () => {
      const res = searchHskWords('');
      expect(res).toHaveLength(30);
    });

    it('returns all 30 words for whitespace-only strings', () => {
      expect(searchHskWords(' ')).toHaveLength(30);
      expect(searchHskWords('   ')).toHaveLength(30);
      expect(searchHskWords('\t')).toHaveLength(30);
      expect(searchHskWords('\n')).toHaveLength(30);
      expect(searchHskWords(' \t \n \r ')).toHaveLength(30);
    });

    it('safely handles non-string falsy inputs without crashing', () => {
      expect(searchHskWords(null as unknown as string)).toHaveLength(30);
      expect(searchHskWords(undefined as unknown as string)).toHaveLength(30);
    });

    // 3.2 Punctuation & Special Regex Characters
    it('safely handles regex and special characters without throwing syntax errors', () => {
      const dangerousInputs = [
        '.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\',
        '/', '.*', '.+', '(?=a)', '(?:)', '[\\]', '---', '===', '!!!', '???',
        '<script>', '`', '"', "'", ';;;', '&&', '||', '%', '#', '@', '~',
      ];

      dangerousInputs.forEach((input) => {
        expect(() => searchHskWords(input)).not.toThrow();
        const res = searchHskWords(input);
        expect(Array.isArray(res)).toBe(true);
      });
    });

    // 3.3 Diacritic Variations in Pinyin & Vietnamese
    it('finds words using unaccented Pinyin', () => {
      const resXue = searchHskWords('xue');
      expect(resXue.length).toBeGreaterThanOrEqual(2);
      expect(resXue.map((w) => w.hanzi)).toContain('学');
      expect(resXue.map((w) => w.hanzi)).toContain('学习');

      const resHao = searchHskWords('hao');
      expect(resHao.length).toBeGreaterThanOrEqual(1);
      expect(resHao.map((w) => w.hanzi)).toContain('好');
    });

    it('finds compound words when searched without space in pinyin (e.g. nihao, xuexi, pengyou)', () => {
      const resNihao = searchHskWords('nihao');
      expect(resNihao.some((w) => w.hanzi === '你好')).toBe(true);

      const resXuexi = searchHskWords('xuexi');
      expect(resXuexi.some((w) => w.hanzi === '学习')).toBe(true);

      const resPengyou = searchHskWords('pengyou');
      expect(resPengyou.some((w) => w.hanzi === '朋友')).toBe(true);
    });

    it('finds words using accented Pinyin with diacritics', () => {
      const resXueAccented = searchHskWords('xué');
      expect(resXueAccented.length).toBeGreaterThanOrEqual(2);
      expect(resXueAccented.map((w) => w.hanzi)).toContain('学');

      const resNi = searchHskWords('nǐ');
      expect(resNi.length).toBeGreaterThanOrEqual(1);
      expect(resNi.map((w) => w.hanzi)).toContain('你');
    });

    it('handles umlaut ü variations (v and ǜ)', () => {
      // 韵律: pinyin: yùn lǜ, pinyinNumbered: yun4 lv4
      const resLv = searchHskWords('lv');
      expect(resLv.some((w) => w.hanzi === '韵律')).toBe(true);

      const resLuWithAccent = searchHskWords('lǜ');
      expect(resLuWithAccent.some((w) => w.hanzi === '韵律')).toBe(true);

      // Testing full compound search with standard pinyin input 'yun lv'
      const resYunLv = searchHskWords('yun lv');
      // Empirical verification: does 'yun lv' find '韵律'?
      expect(resYunLv.some((w) => w.hanzi === '韵律')).toBe(true);
    });

    it('handles exact Vietnamese diacritics search', () => {
      // 'học' matches Sino-Vietnamese 'HỌC' and Vietnamese meaning
      const resHoc = searchHskWords('học');
      expect(resHoc.length).toBeGreaterThanOrEqual(2);
      expect(resHoc.map((w) => w.hanzi)).toContain('学');
      expect(resHoc.map((w) => w.hanzi)).toContain('学习');

      // 'gia đình' matches 'GIA' (家)
      const resGiaDinh = searchHskWords('gia đình');
      expect(resGiaDinh.some((w) => w.hanzi === '家')).toBe(true);

      // 'thời tiết' matches 'THIÊN KHÍ' (天气)
      const resThoiTiet = searchHskWords('thời tiết');
      expect(resThoiTiet.some((w) => w.hanzi === '天气')).toBe(true);
    });

    it('returns empty results for non-matching diacritic variations (e.g. hóc vs học)', () => {
      // 'hóc' (choked on bone) is completely different from 'học' (study)
      const resHocDiff = searchHskWords('hóc');
      // No word in HSK 30 curriculum has meaning or Sino-Vietnamese containing 'hóc'
      expect(resHocDiff.some((w) => w.hanzi === '学')).toBe(false);
      expect(resHocDiff.some((w) => w.hanzi === '学习')).toBe(false);
    });

    it('tests unaccented Vietnamese search (e.g. hoc for học)', () => {
      // Vietnamese users often type without accents on mobile or quick search
      const resHocUnaccented = searchHskWords('hoc');
      expect(resHocUnaccented.some((w) => w.hanzi === '学')).toBe(true);
    });

    // 3.4 Case-Insensitivity Testing
    it('is fully case-insensitive across uppercase, lowercase, and mixed-case', () => {
      const lower = searchHskWords('xue');
      const upper = searchHskWords('XUE');
      const mixed = searchHskWords('XuE');

      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
      expect(lower.map((w) => w.id)).toEqual(upper.map((w) => w.id));
      expect(lower.map((w) => w.id)).toEqual(mixed.map((w) => w.id));

      const svLower = searchHskWords('nhĩ');
      const svUpper = searchHskWords('NHĨ');
      const svMixed = searchHskWords('NhĨ');

      expect(svLower.length).toBe(svUpper.length);
      expect(svLower.length).toBe(svMixed.length);
      expect(svLower.map((w) => w.id)).toContain('hsk1-01-ni');
    });

    // 3.5 Numbered Pinyin Search
    it('searches successfully by numbered pinyin format', () => {
      const resNi3 = searchHskWords('ni3');
      expect(resNi3.length).toBeGreaterThanOrEqual(1);
      expect(resNi3.some((w) => w.hanzi === '你')).toBe(true);

      const resXue2 = searchHskWords('xue2');
      expect(resXue2.length).toBeGreaterThanOrEqual(1);
      expect(resXue2.some((w) => w.hanzi === '学')).toBe(true);

      const resYun4 = searchHskWords('yun4');
      expect(resYun4.some((w) => w.hanzi === '韵律')).toBe(true);
    });

    // 3.6 Non-matching terms & Noise
    it('returns empty array [] for non-existent Chinese, English, or gibberish', () => {
      expect(searchHskWords('饕餮')).toEqual([]);
      expect(searchHskWords('龘')).toEqual([]);
      expect(searchHskWords('qwertyuiopasdfghjkl')).toEqual([]);
      expect(searchHskWords('randomGibberish12345')).toEqual([]);
      expect(searchHskWords('999999999')).toEqual([]);
    });

    // 3.7 Boundary Inputs & Long Queries
    it('handles long strings gracefully without performance degradation', () => {
      const longNoise = 'a'.repeat(2000);
      const t0 = performance.now();
      const res = searchHskWords(longNoise);
      const t1 = performance.now();

      expect(res).toEqual([]);
      expect(t1 - t0).toBeLessThan(50); // Under 50ms
    });

    it('handles single-character boundary queries accurately', () => {
      const resSingleHanzi = searchHskWords('水');
      expect(resSingleHanzi.some((w) => w.hanzi === '水')).toBe(true);

      const resSingleLetter = searchHskWords('q');
      expect(resSingleLetter.length).toBeGreaterThan(0);
      // 'qì' (气), 'tiān qì' (天气)
      expect(resSingleLetter.some((w) => w.hanzi === '气')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 4. HELPER FUNCTIONS & NORMALIZER EDGE CASES
  // -------------------------------------------------------------
  describe('Helper Functions & normalizePinyin Stress Testing', () => {
    it('normalizes various pinyin tone diacritics correctly', () => {
      expect(normalizePinyin('nǐ')).toBe('ni');
      expect(normalizePinyin('hǎo')).toBe('hao');
      expect(normalizePinyin('xué')).toBe('xue');
      expect(normalizePinyin('hàn')).toBe('han');
      expect(normalizePinyin('lǜ')).toBe('lv');
      expect(normalizePinyin('nǚ')).toBe('nv');
      expect(normalizePinyin('')).toBe('');
      expect(normalizePinyin('plain')).toBe('plain');
    });

    it('retrieves word by ID and handles invalid IDs correctly', () => {
      const valid = getHskWordById('hsk1-01-ni');
      expect(valid).toBeDefined();
      expect(valid?.hanzi).toBe('你');

      expect(getHskWordById('')).toBeUndefined();
      expect(getHskWordById('non-existent')).toBeUndefined();
      expect(getHskWordById('__proto__')).toBeUndefined();
    });

    it('filters words by tone accurately and exhaustively', () => {
      for (const tone of [1, 2, 3, 4, 5] as const) {
        const words = getHskWordsByTone(tone);
        words.forEach((w) => {
          const match = w.tone === tone || w.tones.includes(tone);
          expect(match).toBe(true);
        });
      }
    });

    it('filters words by level accurately', () => {
      for (const lvl of [1, 2, 3] as const) {
        const words = getHskWordsByLevel(lvl);
        words.forEach((w) => {
          expect(w.hskLevel).toBe(lvl);
        });
      }
    });
  });
});
