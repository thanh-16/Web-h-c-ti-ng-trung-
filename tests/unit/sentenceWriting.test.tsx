/**
 * sentenceWriting.test.tsx
 * Unit tests for HSK 1 Sentence Writing Curriculum, Memory Mode (Blind Writing), and SentenceWritingStudio
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HSK1_SENTENCES, HSK1_SENTENCE_CATEGORIES } from '@/data/hskSentences';
import { SentenceWritingStudio } from '@/components/hanzi/SentenceWritingStudio';
import { HanziCanvas } from '@/components/hanzi/HanziCanvas';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock HanziWriter
const mockWriter = {
  setCharacter: vi.fn().mockResolvedValue(undefined),
  updateDimensions: vi.fn(),
  animateCharacter: vi.fn().mockImplementation(({ onComplete }) => {
    onComplete?.({ canceled: false });
    return Promise.resolve({ canceled: false });
  }),
  loopCharacterAnimation: vi.fn().mockResolvedValue({ canceled: false }),
  pauseAnimation: vi.fn().mockResolvedValue(undefined),
  resumeAnimation: vi.fn().mockResolvedValue(undefined),
  highlightStroke: vi.fn().mockResolvedValue({ canceled: false }),
  showCharacter: vi.fn().mockResolvedValue({ canceled: false }),
  showOutline: vi.fn().mockResolvedValue(undefined),
  hideOutline: vi.fn().mockResolvedValue(undefined),
  cancelQuiz: vi.fn(),
  getCharacterData: vi.fn().mockResolvedValue({
    strokes: ['s1', 's2'],
    medians: [[[0, 0]], [[10, 10]]],
  }),
  quiz: vi.fn(),
  _options: { strokeAnimationSpeed: 1.2 },
};

vi.mock('hanzi-writer', () => {
  return {
    default: {
      create: vi.fn((el, char, opts) => {
        (mockWriter as any)._createdWith = opts;
        return mockWriter;
      }),
    },
  };
});

describe('HSK 1 Sentence Curriculum Dataset Integrity', () => {
  it('contains at least 10 authentic HSK 1 communicative sentences', () => {
    expect(HSK1_SENTENCES.length).toBeGreaterThanOrEqual(10);
  });

  it('validates that every sentence contains valid 4-tier Sino-Vietnamese data', () => {
    for (const sent of HSK1_SENTENCES) {
      expect(sent.id).toMatch(/^hsk1-sent-\d+$/);
      expect(sent.chinese.length).toBeGreaterThan(0);
      expect(sent.pinyin.length).toBeGreaterThan(0);
      expect(sent.sinoVietnamese.length).toBeGreaterThan(0);
      expect(sent.vietnamese.length).toBeGreaterThan(0);
      expect(sent.grammarTip.length).toBeGreaterThan(0);
      expect(sent.characters.length).toBeGreaterThan(0);

      // Verify each character in sentence
      for (const charItem of sent.characters) {
        expect(charItem.char.length).toBe(1);
        expect(/[\u4E00-\u9FFF]/.test(charItem.char)).toBe(true);
        expect(charItem.pinyin.length).toBeGreaterThan(0);
        expect(charItem.sinoVietnamese.length).toBeGreaterThan(0);
        expect(charItem.meaning.length).toBeGreaterThan(0);
      }
    }
  });

  it('ensures all sentence categories belong to HSK1_SENTENCE_CATEGORIES', () => {
    for (const sent of HSK1_SENTENCES) {
      expect(HSK1_SENTENCE_CATEGORIES).toContain(sent.category);
    }
  });
});

describe('HanziCanvas Memory Mode (Blind Writing)', () => {
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

  it('renders memory mode toggle button on canvas', async () => {
    await act(async () => {
      root.render(
        <HanziCanvas
          character="好"
          pinyin="hǎo"
          sinoVietnamese="HẢO"
          meaning="Tốt"
        />
      );
    });

    const toggleBtn = container?.querySelector('[data-testid="btn-toggle-memory-mode"]');
    expect(toggleBtn).toBeTruthy();
    expect(toggleBtn?.textContent).toContain('Nét mờ');
  });

  it('toggles memory mode to hide outline when clicked', async () => {
    await act(async () => {
      root.render(
        <HanziCanvas
          character="好"
          pinyin="hǎo"
          sinoVietnamese="HẢO"
          meaning="Tốt"
        />
      );
    });

    const toggleBtn = container?.querySelector('[data-testid="btn-toggle-memory-mode"]') as HTMLButtonElement;
    expect(toggleBtn).toBeTruthy();

    await act(async () => {
      toggleBtn.click();
    });

    // Check memory mode banner displayed
    const banner = container?.querySelector('[data-testid="memory-mode-banner"]');
    expect(banner).toBeTruthy();
    expect(banner?.textContent).toContain('Thử thách trí nhớ');
    expect(mockWriter.hideOutline).toHaveBeenCalled();
  });
});

describe('SentenceWritingStudio Component', () => {
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

  it('renders SentenceWritingStudio successfully with category filters and active sentence', async () => {
    await act(async () => {
      root.render(<SentenceWritingStudio />);
    });

    const studio = container?.querySelector('[data-testid="sentence-writing-studio"]');
    expect(studio).toBeTruthy();

    // Check categories rendered
    expect(container?.textContent).toContain('Chào hỏi & Làm quen');
    expect(container?.textContent).toContain('Điểm ngữ pháp bỏ túi');
  });

  it('displays sentence characters as clickable stepper buttons', async () => {
    await act(async () => {
      root.render(<SentenceWritingStudio initialSentenceId="hsk1-sent-01" />);
    });

    // Sentence 1 is "你好！" with characters 你 and 好
    expect(container?.textContent).toContain('你好！');
    expect(container?.textContent).toContain('Nhĩ hảo!');
    expect(container?.textContent).toContain('Xin chào bạn!');
  });
});
