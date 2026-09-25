/**
 * tests/unit/security.test.ts
 * Enterprise Security Suite for HanziVibe:
 * - Anti-XSS Sanitization & Safe Markdown Rendering
 * - Safari Incognito & QuotaExceededError Resilience
 * - Zip-Bomb / Decompression Bomb Resource Exhaustion Defense
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeHtml,
  renderSafeMarkdownInline,
  isLocalStorageAccessible,
} from '@/utils/security';
import {
  decompressFlate,
  MAX_DECOMPRESSED_STREAM_BYTES,
  MAX_TOTAL_PDF_EXTRACTED_BYTES,
} from '@/services/pdfTextExtractor';
import { AnnotationService } from '@/services/annotationService';
import { ProgressService } from '@/services/progressService';
import { SrsService } from '@/services/srsService';

describe('HanziVibe Enterprise Security Gate', () => {
  describe('1. OWASP A03: Injection & XSS Defense (escapeHtml & renderSafeMarkdownInline)', () => {
    it('escapes dangerous HTML characters (&, <, >, ", \') into safe entities', () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
    });

    it('neutralizes event handler injection (<img onerror=alert(1)>)', () => {
      const payload = '<img src=x onerror="alert(document.domain)">';
      const rendered = renderSafeMarkdownInline(payload);
      expect(rendered).toContain('&lt;img src=x onerror=&quot;alert(document.domain)&quot;&gt;');
      expect(rendered).not.toContain('<img');
    });

    it('neutralizes iframe and svg payloads', () => {
      const payload = '<svg onload=alert(1)><iframe src="javascript:alert(1)"></iframe>';
      const rendered = renderSafeMarkdownInline(payload);
      expect(rendered).not.toContain('<svg');
      expect(rendered).not.toContain('<iframe');
      expect(rendered).toContain('&lt;svg');
      expect(rendered).toContain('&lt;iframe');
    });

    it('safely renders allowed Markdown syntax while neutralizing mixed XSS vectors', () => {
      const mixed = 'Từ **你好** có mã: `<script>evil()</script>` và *pinyin*';
      const rendered = renderSafeMarkdownInline(mixed);

      // Markdown tokens are properly styled
      expect(rendered).toContain('<strong class="text-white font-semibold">你好</strong>');
      expect(rendered).toContain('<em class="text-cyber-cyan font-mono">pinyin</em>');
      expect(rendered).toContain('<code class=');

      // Embedded script is neutralized
      expect(rendered).toContain('&lt;script&gt;evil()&lt;/script&gt;');
      expect(rendered).not.toContain('<script>');
    });

    it('handles empty or null inputs gracefully without crashing', () => {
      expect(escapeHtml('')).toBe('');
      expect(renderSafeMarkdownInline('')).toBe('');
    });
  });

  describe('2. OWASP A04: Insecure Design & Client Storage Defense (Safari Incognito & Quota)', () => {
    beforeEach(() => {
      localStorage.clear();
      AnnotationService.resetInstance();
      ProgressService.resetInstance();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      localStorage.clear();
    });

    it('detects normal storage capability accurately', () => {
      expect(isLocalStorageAccessible()).toBe(true);
    });

    it('detects blocked storage when setItem throws SecurityError (Safari Incognito)', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const err = new DOMException('The operation is insecure.', 'SecurityError');
        throw err;
      });

      expect(isLocalStorageAccessible()).toBe(false);
    });

    it('AnnotationService handles Safari Incognito SecurityError upon initialization and writing', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });

      // Does not throw
      const service = AnnotationService.getInstance();
      expect(service.getAnnotations()).toEqual([]);

      // Writing keeps memory state without throwing
      const saved = service.saveAnnotation({
        queryText: '谢谢',
        targetType: 'word',
        vietnameseMeaning: 'Cảm ơn',
        explanation: 'Lời cảm ơn',
        examples: [],
      });

      expect(saved.queryText).toBe('谢谢');
      expect(service.getAnnotations()).toHaveLength(1);
    });

    it('ProgressService handles Safari Incognito SecurityError gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });

      // Does not throw
      const service = ProgressService.getInstance();
      const profile = service.getProfile();
      expect(profile).toBeDefined();
      expect(profile.streakDays).toBeGreaterThanOrEqual(1);

      // Mutating profile does not throw
      const updated = service.updateDisplayName('Test Learner');
      expect(updated.displayName).toBe('Test Learner');
    });

    it('AnnotationService bounds in-memory cache to 500 items to prevent memory bloat', () => {
      const service = AnnotationService.getInstance();
      for (let i = 0; i < 520; i++) {
        service.saveAnnotation({
          queryText: `Word_${i}`,
          targetType: 'word',
          vietnameseMeaning: `Meaning_${i}`,
          explanation: `Exp_${i}`,
          examples: [],
        });
      }

      // Memory cache is pruned to 500
      expect(service.getAnnotations().length).toBeLessThanOrEqual(500);
    });

    it('SrsService handles Safari Incognito SecurityError gracefully and keeps in-memory state', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });

      SrsService.resetInstance();
      const service = SrsService.getInstance();
      const cards = service.getAllCards();
      expect(cards.length).toBeGreaterThan(0);

      // Reviewing card in Safari Incognito does not throw
      const reviewed = service.reviewCard(cards[0].id, 3);
      expect(reviewed).not.toBeNull();
      expect(reviewed?.repetition).toBe(1);
    });

    it('SrsService bounds card history to last 50 entries to prevent LocalStorage QuotaExceededError', () => {
      const service = SrsService.getInstance();
      const card = service.getAllCards()[0];

      // Simulate 60 reviews
      for (let i = 0; i < 60; i++) {
        service.reviewCard(card.id, 3, `2026-09-${String((i % 28) + 1).padStart(2, '0')}`);
      }

      const updated = service.getAllCards().find((c) => c.id === card.id);
      expect(updated).toBeDefined();
      expect(updated!.history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('3. Resource Exhaustion & Zip-Bomb Defense (pdfTextExtractor)', () => {
    it('defines explicit safety thresholds for stream decompression and total extraction', () => {
      expect(MAX_DECOMPRESSED_STREAM_BYTES).toBe(10 * 1024 * 1024); // 10 MB
      expect(MAX_TOTAL_PDF_EXTRACTED_BYTES).toBe(50 * 1024 * 1024); // 50 MB
    });

    it('decompressFlate respects byte limit threshold when stream exceeds maxBytes', async () => {
      // Create a stream that emits more than 100 bytes
      const testData = new Uint8Array(500).fill(65); // 500 'A's

      // If DecompressionStream and CompressionStream are available in test environment, test limit
      if (typeof DecompressionStream !== 'undefined' && typeof CompressionStream !== 'undefined') {
        const inputStream = new ReadableStream({
          start(controller) {
            controller.enqueue(testData);
            controller.close();
          },
        });
        const stream = inputStream.pipeThrough(new CompressionStream('deflate'));
        const compressedBuffer = await new Response(stream).arrayBuffer();
        const compressedBytes = new Uint8Array(compressedBuffer);

        // Decompress with small limit (e.g. 50 bytes) -> should abort and return null
        const result = await decompressFlate(compressedBytes, 50);
        expect(result).toBeNull();

        // Decompress with generous limit (e.g. 1000 bytes) -> should succeed
        const validResult = await decompressFlate(compressedBytes, 1000);
        expect(validResult).not.toBeNull();
        expect(validResult?.length).toBe(500);
      }
    });
  });
});
