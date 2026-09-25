/**
 * annotation.ts
 * Type definitions for Document Annotations & AI Inline Translations
 */

export interface IllustrativeExample {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

export interface DocumentAnnotation {
  id: string;
  queryText: string;
  targetType: 'word' | 'sentence';
  contextSentence?: string;
  pinyin?: string;
  sinoVietnamese?: string;
  vietnameseMeaning?: string;
  explanation: string;
  examples: IllustrativeExample[];
  createdAt: string;
  colorTag?: 'cyan' | 'amber' | 'emerald' | 'purple';
}
