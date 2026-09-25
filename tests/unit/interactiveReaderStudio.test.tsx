/**
 * interactiveReaderStudio.test.tsx
 * Unit Tests for InteractiveReaderStudio component with HSK Thematic Lessons
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { InteractiveReaderStudio } from '@/components/reading/InteractiveReaderStudio';
import { HSK_LESSONS } from '@/data/hskLessons';

// Mock SpeechService
vi.mock('@/services/speechService', () => ({
  SpeechService: {
    getInstance: () => ({
      speak: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    }),
  },
}));

// Mock AnnotationService
vi.mock('@/services/annotationService', () => ({
  annotationService: {
    subscribe: vi.fn((cb) => {
      cb([]);
      return vi.fn();
    }),
    getAnnotations: vi.fn(() => []),
    saveAnnotation: vi.fn(),
    deleteAnnotation: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// Mock CircleToSearchOverlay and Modal to simplify DOM rendering in tests
vi.mock('@/components/ai', () => ({
  CircleToSearchOverlay: ({ sentenceText, onCircleWord }: any) => (
    <div data-testid="circle-search-overlay" onClick={() => onCircleWord('你好')}>
      {sentenceText}
    </div>
  ),
  CircleToSearchModal: ({ isOpen, queryText }: any) => (
    isOpen ? <div data-testid="circle-search-modal">{queryText}</div> : null
  ),
}));

describe('InteractiveReaderStudio Component with HSK Thematic Lessons', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
  });

  it('renders InteractiveReaderStudio successfully with 8 HSK lessons curriculum', () => {
    act(() => {
      root.render(<InteractiveReaderStudio />);
    });

    expect(container?.textContent).toContain('Đọc Tài Liệu & Khoanh Chữ Hỏi AI');
    expect(container?.textContent).toContain('Giáo trình HSK (8 Bài)');
    expect(container?.textContent).toContain('Bài 1: Chào Hỏi & Làm Quen');
  });

  it('displays dialogue turns by default for the active lesson', () => {
    act(() => {
      root.render(<InteractiveReaderStudio />);
    });

    // Check that Lesson 1 dialogue turns appear
    expect(container?.textContent).toContain('Đại Vệ (大卫)');
    expect(container?.textContent).toContain('Tiểu Minh (小明)');
    expect(container?.textContent).toContain('Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?');
    expect(container?.textContent).toContain('Nhĩ hảo! Thỉnh vấn');
  });

  it('switches to reading story sub-tab when user clicks "Bài đọc hiểu"', () => {
    act(() => {
      root.render(<InteractiveReaderStudio />);
    });

    const storyTabBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Bài đọc hiểu')
    );
    expect(storyTabBtn).toBeDefined();

    act(() => {
      storyTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Reading story content should now be visible in CircleToSearchOverlay
    expect(container?.textContent).toContain('Bạn Mới Ở Đại Học');
    const overlay = container?.querySelector('[data-testid="circle-search-overlay"]');
    expect(overlay).not.toBeNull();
    expect(overlay?.textContent).toContain('我叫大卫');
  });

  it('switches to grammar & vocabulary sub-tab when user clicks "Ngữ pháp & Từ vựng"', () => {
    act(() => {
      root.render(<InteractiveReaderStudio />);
    });

    const grammarTabBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Ngữ pháp & Từ vựng')
    );
    expect(grammarTabBtn).toBeDefined();

    act(() => {
      grammarTabBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Grammar points & vocabulary cards should appear
    expect(container?.textContent).toContain('Điểm Ngữ Pháp Then Chốt');
    expect(container?.textContent).toContain('Chủ ngữ + 是 + Danh từ/Cụm danh từ');
    expect(container?.textContent).toContain('Từ Vựng Trọng Tâm Của Bài');
    expect(container?.textContent).toContain('你好');
    expect(container?.textContent).toContain('NHĨ HẢO');
  });

  it('switches lesson when user clicks another lesson card', () => {
    act(() => {
      root.render(<InteractiveReaderStudio />);
    });

    // Find card for Lesson 3 (Ẩm thực)
    const lesson3Btn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Bài 3: Ẩm Thực')
    );
    expect(lesson3Btn).toBeDefined();

    act(() => {
      lesson3Btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container?.textContent).toContain('Bài 3: Ẩm Thực & Gọi Món');
    expect(container?.textContent).toContain('服务员');
  });

  it('triggers onPracticeCharacter callback when character button is clicked', () => {
    const handlePractice = vi.fn();

    act(() => {
      root.render(<InteractiveReaderStudio onPracticeCharacter={handlePractice} />);
    });

    // In dialogue mode, find character practice button for '你'
    const charBtn = Array.from(container?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.trim() === '你'
    );
    expect(charBtn).toBeDefined();

    act(() => {
      charBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handlePractice).toHaveBeenCalledWith('你');
  });
});
