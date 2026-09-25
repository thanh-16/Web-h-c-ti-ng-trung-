/**
 * hskLessons.test.ts
 * Rigorous Unit Test Suite for HSK 1-2 Thematic Lessons Curriculum
 * Validates 100% data integrity, authentic CJK characters, 4-tier pedagogical alignments,
 * dialogues, reading stories, grammar points, and vocabulary items.
 */

import { describe, it, expect } from 'vitest';
import {
  HSK_LESSONS,
  getLessonById,
  getAllLessonCategories,
} from '@/data/hskLessons';

describe('HSK 1-2 Thematic Lessons Curriculum (HSK_LESSONS)', () => {
  it('contains exactly 8 authentic, structured lessons covering major daily life themes', () => {
    expect(HSK_LESSONS.length).toBe(8);
  });

  it('guarantees unique IDs across all lessons', () => {
    const ids = HSK_LESSONS.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(HSK_LESSONS.length);
  });

  it('ensures each lesson metadata adheres strictly to HskLesson schema', () => {
    for (const lesson of HSK_LESSONS) {
      expect(lesson.id).toMatch(/^lesson-\d{2}-[a-z0-9-]+$/);
      expect(lesson.title.trim().length).toBeGreaterThan(0);
      expect(lesson.chineseTitle.trim().length).toBeGreaterThan(0);
      expect(['HSK 1', 'HSK 2']).toContain(lesson.level);
      expect(lesson.category.trim().length).toBeGreaterThan(0);
      expect(lesson.icon.trim().length).toBeGreaterThan(0);
      expect(lesson.description.trim().length).toBeGreaterThan(15);
    }
  });

  it('verifies that all dialogues have at least 4 conversational turns with complete 4-tier translations', () => {
    for (const lesson of HSK_LESSONS) {
      expect(lesson.dialogue.length).toBeGreaterThanOrEqual(4);

      for (const turn of lesson.dialogue) {
        expect(turn.speaker.trim().length).toBeGreaterThan(0);
        expect(turn.chinese.trim().length).toBeGreaterThan(0);
        expect(/[\u4E00-\u9FFF]/.test(turn.chinese)).toBe(true);

        expect(turn.pinyin.trim().length).toBeGreaterThan(0);
        expect(turn.sinoVietnamese.trim().length).toBeGreaterThan(0);
        expect(turn.vietnamese.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('verifies readingStory has authentic Chinese text, Pinyin, and Vietnamese translation', () => {
    for (const lesson of HSK_LESSONS) {
      const story = lesson.readingStory;
      expect(story.title.trim().length).toBeGreaterThan(0);
      expect(story.content.trim().length).toBeGreaterThan(30);
      expect(/[\u4E00-\u9FFF]/.test(story.content)).toBe(true);
      expect(story.pinyin.trim().length).toBeGreaterThan(30);
      expect(story.vietnamese.trim().length).toBeGreaterThan(30);
    }
  });

  it('verifies grammar points provide formula structures, explanations, and practical examples', () => {
    for (const lesson of HSK_LESSONS) {
      expect(lesson.grammarPoints.length).toBeGreaterThanOrEqual(1);

      for (const gp of lesson.grammarPoints) {
        expect(gp.title.trim().length).toBeGreaterThan(0);
        expect(gp.structure.trim().length).toBeGreaterThan(0);
        expect(gp.explanation.trim().length).toBeGreaterThan(10);
        expect(gp.examples.length).toBeGreaterThanOrEqual(1);

        for (const eg of gp.examples) {
          expect(eg.chinese.trim().length).toBeGreaterThan(0);
          expect(/[\u4E00-\u9FFF]/.test(eg.chinese)).toBe(true);
          expect(eg.pinyin.trim().length).toBeGreaterThan(0);
          expect(eg.vietnamese.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('verifies vocabulary items have valid Hanzi, Pinyin, Sino-Vietnamese, and Vietnamese translations', () => {
    for (const lesson of HSK_LESSONS) {
      expect(lesson.vocabulary.length).toBeGreaterThanOrEqual(5);

      for (const vocab of lesson.vocabulary) {
        expect(vocab.hanzi.trim().length).toBeGreaterThan(0);
        expect(/[\u4E00-\u9FFF]/.test(vocab.hanzi)).toBe(true);
        expect(vocab.pinyin.trim().length).toBeGreaterThan(0);
        expect(vocab.sinoVietnamese.trim().length).toBeGreaterThan(0);
        expect(vocab.vietnamese.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('validates getLessonById() retrieves correct lesson or undefined for missing ID', () => {
    const lesson1 = getLessonById('lesson-01-greeting');
    expect(lesson1).toBeDefined();
    expect(lesson1?.title).toContain('Chào Hỏi');

    const lessonMissing = getLessonById('lesson-non-existent-99');
    expect(lessonMissing).toBeUndefined();
  });

  it('validates getAllLessonCategories() returns unique, non-empty categories', () => {
    const categories = getAllLessonCategories();
    expect(categories.length).toBeGreaterThanOrEqual(5);

    const uniqueSet = new Set(categories);
    expect(uniqueSet.size).toBe(categories.length);

    for (const cat of categories) {
      expect(cat.trim().length).toBeGreaterThan(0);
    }
  });
});
