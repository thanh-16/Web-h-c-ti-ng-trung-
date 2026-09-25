/**
 * tests/unit/annotationService.test.ts
 * Unit & Integration Test Suite for Document Annotations & AI Inline Translations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnnotationService } from '@/services/annotationService';
import { DocumentAnnotation } from '@/types/annotation';
import { GeminiAiService } from '@/services/geminiAiService';

describe('AnnotationService & Document Annotations Engine', () => {
  let service: AnnotationService;

  beforeEach(() => {
    localStorage.clear();
    AnnotationService.resetInstance();
    service = AnnotationService.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Lifecycle & Singleton Behavior', () => {
    it('returns the same singleton instance', () => {
      const instance1 = AnnotationService.getInstance();
      const instance2 = AnnotationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('creates a fresh instance after resetInstance()', () => {
      const instance1 = AnnotationService.getInstance();
      AnnotationService.resetInstance();
      const instance2 = AnnotationService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('2. Annotation CRUD Operations', () => {
    it('saves a new word annotation with generated ID and ISO timestamp', () => {
      const saved = service.saveAnnotation({
        queryText: '你好',
        targetType: 'word',
        pinyin: 'nǐ hǎo',
        sinoVietnamese: 'NHĨ HẢO',
        vietnameseMeaning: 'Xin chào',
        explanation: 'Lời chào thân mật phổ biến nhất trong tiếng Trung.',
        examples: [
          {
            chinese: '你好！很高兴认识你。',
            pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ.',
            vietnamese: 'Xin chào! Rất vui được làm quen với bạn.',
          },
        ],
        colorTag: 'cyan',
      });

      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
      expect(saved.queryText).toBe('你好');
      expect(saved.targetType).toBe('word');
      expect(saved.examples).toHaveLength(1);

      // Verify in getAnnotations()
      const all = service.getAnnotations();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(saved.id);
    });

    it('saves a full sentence annotation with context and illustrative examples', () => {
      const sentenceText = '今天天气非常好，阳光很温暖。';
      const saved = service.saveAnnotation({
        queryText: sentenceText,
        targetType: 'sentence',
        contextSentence: sentenceText,
        pinyin: 'Jīntiān tiānqì fēicháng hǎo, yángguāng hěn wēnnuǎn.',
        sinoVietnamese: 'Kim thiên thiên khí phi thường hảo...',
        vietnameseMeaning: 'Hôm nay thời tiết rất tốt, ánh nắng chan hòa ấm áp.',
        explanation: 'Câu trần thuật miêu tả thời tiết dùng phó từ fēicháng và hěn.',
        examples: [
          {
            chinese: '明天天气怎么样？',
            pinyin: 'Míngtiān tiānqì zěnmeyàng?',
            vietnamese: 'Ngày mai thời tiết thế nào?',
          },
          {
            chinese: '这里的阳光很舒服。',
            pinyin: 'Zhèlǐ de yángguāng hěn shūfu.',
            vietnamese: 'Ánh nắng ở đây rất dễ chịu.',
          },
        ],
        colorTag: 'purple',
      });

      expect(saved.targetType).toBe('sentence');
      expect(saved.queryText).toBe(sentenceText);
      expect(saved.examples).toHaveLength(2);
      expect(saved.colorTag).toBe('purple');
    });

    it('updates an existing annotation when queryText matches', () => {
      service.saveAnnotation({
        queryText: '学习',
        targetType: 'word',
        vietnameseMeaning: 'Học tập',
        explanation: 'Giải thích ban đầu',
        examples: [],
      });

      expect(service.getAnnotations()).toHaveLength(1);
      expect(service.getAnnotations()[0].explanation).toBe('Giải thích ban đầu');

      // Update with new explanation
      const updated = service.saveAnnotation({
        queryText: '学习',
        targetType: 'word',
        vietnameseMeaning: 'Học tập / Nghiên cứu',
        explanation: 'Giải thích chuyên sâu mới',
        examples: [
          {
            chinese: '我喜欢学习汉语。',
            pinyin: 'Wǒ xǐhuan xuéxí hànyǔ.',
            vietnamese: 'Tôi thích học tiếng Hán.',
          },
        ],
      });

      const all = service.getAnnotations();
      expect(all).toHaveLength(1);
      expect(all[0].explanation).toBe('Giải thích chuyên sâu mới');
      expect(all[0].vietnameseMeaning).toBe('Học tập / Nghiên cứu');
      expect(all[0].examples).toHaveLength(1);
      expect(all[0].id).toBe(updated.id);
    });

    it('retrieves annotation by id and returns undefined for non-existent id', () => {
      const saved = service.saveAnnotation({
        queryText: '朋友',
        targetType: 'word',
        vietnameseMeaning: 'Bạn bè',
        explanation: 'Bằng hữu',
        examples: [],
      });

      const found = service.getAnnotationById(saved.id);
      expect(found).toBeDefined();
      expect(found?.queryText).toBe('朋友');

      const notFound = service.getAnnotationById('non-existent-id-999');
      expect(notFound).toBeUndefined();
    });

    it('deletes an annotation by ID and returns true, returns false if ID does not exist', () => {
      const saved = service.saveAnnotation({
        queryText: '谢谢',
        targetType: 'word',
        vietnameseMeaning: 'Cảm ơn',
        explanation: 'Tạ tạ',
        examples: [],
      });

      expect(service.getAnnotations()).toHaveLength(1);

      const deleted = service.deleteAnnotation(saved.id);
      expect(deleted).toBe(true);
      expect(service.getAnnotations()).toHaveLength(0);

      // Deleting again returns false
      const deleteAgain = service.deleteAnnotation(saved.id);
      expect(deleteAgain).toBe(false);
    });

    it('clears all annotations', () => {
      service.saveAnnotation({ queryText: 'A', targetType: 'word', explanation: '', examples: [] });
      service.saveAnnotation({ queryText: 'B', targetType: 'word', explanation: '', examples: [] });
      service.saveAnnotation({ queryText: 'C', targetType: 'word', explanation: '', examples: [] });

      expect(service.getAnnotations()).toHaveLength(3);

      service.clearAll();
      expect(service.getAnnotations()).toHaveLength(0);
    });
  });

  describe('3. Reactive Subscription Pattern', () => {
    it('notifies subscribers immediately on subscription and on state changes', () => {
      const history: number[] = [];
      const unsubscribe = service.subscribe((items) => {
        history.push(items.length);
      });

      // Immediate notification with 0 items
      expect(history).toEqual([0]);

      // Add item
      service.saveAnnotation({
        queryText: '茶',
        targetType: 'word',
        explanation: 'Trà',
        examples: [],
      });
      expect(history).toEqual([0, 1]);

      // Delete item
      const item = service.getAnnotations()[0];
      service.deleteAnnotation(item.id);
      expect(history).toEqual([0, 1, 0]);

      unsubscribe();

      // Subsequent actions should not trigger listener
      service.saveAnnotation({
        queryText: '水',
        targetType: 'word',
        explanation: 'Nước',
        examples: [],
      });
      expect(history).toEqual([0, 1, 0]);
    });
  });

  describe('4. Storage Fallback & Offline Resilience', () => {
    it('gracefully handles localStorage QuotaExceededError by keeping in-memory state', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const saved = service.saveAnnotation({
        queryText: '米饭',
        targetType: 'word',
        vietnameseMeaning: 'Cơm',
        explanation: 'Mễ phản',
        examples: [],
      });

      expect(saved.queryText).toBe('米饭');
      expect(service.getAnnotations()).toHaveLength(1);
    });

    it('gracefully handles corrupted JSON in localStorage upon initialization', () => {
      localStorage.setItem('hanzivibe_document_annotations_v1', 'CORRUPTED_JSON_{[');

      AnnotationService.resetInstance();
      const freshService = AnnotationService.getInstance();

      expect(freshService.getAnnotations()).toEqual([]);
    });
  });

  describe('5. Integration: Gemini Circle Search & Annotation Pipeline', () => {
    it('integrates with GeminiAiService sentence fallback and produces valid DocumentAnnotation', () => {
      const gemini = GeminiAiService.getInstance();
      const testSentence = '我想去中国旅游，认识更多的朋友。';

      const circleResult = gemini.generateCircleSearchFallback({
        queryText: testSentence,
        contextSentence: testSentence,
      });

      expect(circleResult.targetType).toBe('sentence');
      expect(circleResult.examples).toBeDefined();
      expect(circleResult.examples!.length).toBeGreaterThan(0);

      // Save as annotation
      const annotation = service.saveAnnotation({
        queryText: circleResult.queryText,
        targetType: circleResult.targetType || 'sentence',
        contextSentence: testSentence,
        pinyin: circleResult.pinyin,
        sinoVietnamese: circleResult.sinoVietnamese,
        vietnameseMeaning: circleResult.vietnameseMeaning,
        explanation: circleResult.aiExplanation,
        examples: circleResult.examples || [],
        colorTag: 'purple',
      });

      expect(annotation.queryText).toBe(testSentence);
      expect(annotation.targetType).toBe('sentence');
      expect(annotation.examples.length).toBeGreaterThan(0);
      expect(annotation.colorTag).toBe('purple');

      // Check retrieval
      const retrieved = service.getAnnotationById(annotation.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.queryText).toBe(testSentence);
    });
  });
});
