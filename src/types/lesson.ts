/**
 * lesson.ts
 * Type definitions for Thematic HSK Graded Lessons, Dialogues, and Reading Stories
 */

export interface LessonDialogueTurn {
  speaker: string;
  avatar?: string;
  chinese: string;
  pinyin: string;
  sinoVietnamese: string;
  vietnamese: string;
}

export interface LessonGrammarPoint {
  title: string;
  structure: string;
  explanation: string;
  examples: {
    chinese: string;
    pinyin: string;
    vietnamese: string;
  }[];
}

export interface LessonVocabItem {
  hanzi: string;
  pinyin: string;
  sinoVietnamese: string;
  vietnamese: string;
}

export interface HskLesson {
  id: string;
  title: string;
  chineseTitle: string;
  level: string; // 'HSK 1' | 'HSK 2'
  category: string;
  icon: string;
  description: string;
  dialogue: LessonDialogueTurn[];
  readingStory: {
    title: string;
    content: string;
    pinyin: string;
    vietnamese: string;
  };
  grammarPoints: LessonGrammarPoint[];
  vocabulary: LessonVocabItem[];
}
