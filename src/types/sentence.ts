/**
 * sentence.ts
 * Type definitions for HSK Sentence Writing Practice & Curriculum
 */

export interface HskSentenceChar {
  char: string;
  pinyin: string;
  sinoVietnamese: string;
  meaning: string;
  radical?: string;
  strokeCount?: number;
}

export interface HskSentence {
  id: string;
  category: string;
  chinese: string;
  pinyin: string;
  sinoVietnamese: string;
  vietnamese: string;
  grammarTip: string;
  characters: HskSentenceChar[];
}
