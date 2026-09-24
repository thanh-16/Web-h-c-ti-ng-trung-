/**
 * hanziCanvas.test.ts
 * Unit tests for HanziCanvas, CalligraphyGrid, StrokeControls, and useHanziWriter hook logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CalligraphyGrid } from '@/components/hanzi/CalligraphyGrid';
import { StrokeControls } from '@/components/hanzi/StrokeControls';
import { HanziCanvas } from '@/components/hanzi/HanziCanvas';
import { hanziAudio } from '@/services/hanziAudioFeedback';
import type { StrokeData } from 'hanzi-writer';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock HanziWriter
const mockHanziWriterInstance = {
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
  cancelQuiz: vi.fn(),
  getCharacterData: vi.fn().mockResolvedValue({
    strokes: ['stroke1', 'stroke2', 'stroke3'],
    medians: [[[0, 0]], [[10, 10]], [[20, 20]]],
  }),
  quiz: vi.fn(),
  _options: { strokeAnimationSpeed: 1.2 },
};

vi.mock('hanzi-writer', () => {
  return {
    default: {
      create: vi.fn((element, char, options) => {
        // Record options passed for verification
        (mockHanziWriterInstance as any)._createdWithOptions = options;
        return mockHanziWriterInstance;
      }),
    },
  };
});

describe('Hanzi Calligraphy Canvas Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  describe('CalligraphyGrid (田字格 / 米字格)', () => {
    it('renders Tian Zi Ge (田字格) with horizontal and vertical cross lines and no diagonals', async () => {
      await act(async () => {
        root.render(React.createElement(CalligraphyGrid, { size: 360, type: 'tian' }));
      });

      const svg = container!.querySelector('[data-testid="calligraphy-grid"]');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('data-grid-type')).toBe('tian');

      // Check cross lines exist
      expect(container!.querySelector('[data-testid="grid-cross-horizontal"]')).not.toBeNull();
      expect(container!.querySelector('[data-testid="grid-cross-vertical"]')).not.toBeNull();

      // Check diagonals do NOT exist in Tian Zi Ge
      expect(container!.querySelector('[data-testid="grid-diagonal-tl-br"]')).toBeNull();
      expect(container!.querySelector('[data-testid="grid-diagonal-tr-bl"]')).toBeNull();
    });

    it('renders Mi Zi Ge (米字格) with cross lines and both diagonal guidelines', async () => {
      await act(async () => {
        root.render(React.createElement(CalligraphyGrid, { size: 500, type: 'mi', gridColor: '#EF4444' }));
      });

      const svg = container!.querySelector('[data-testid="calligraphy-grid"]');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('data-grid-type')).toBe('mi');

      // Check both diagonals exist
      expect(container!.querySelector('[data-testid="grid-diagonal-tl-br"]')).not.toBeNull();
      expect(container!.querySelector('[data-testid="grid-diagonal-tr-bl"]')).not.toBeNull();
    });
  });

  describe('StrokeControls Component', () => {
    it('renders all control buttons and responds to click events', async () => {
      const onAnimate = vi.fn();
      const onStartQuiz = vi.fn();
      const onCancelQuiz = vi.fn();
      const onShowHint = vi.fn();
      const onReset = vi.fn();
      const onSpeedChange = vi.fn();
      const onToggleMute = vi.fn();

      await act(async () => {
        root.render(
          React.createElement(StrokeControls, {
            mode: 'idle',
            speed: 1.0,
            isMuted: false,
            onAnimate,
            onStartQuiz,
            onCancelQuiz,
            onShowHint,
            onReset,
            onSpeedChange,
            onToggleMute,
          })
        );
      });

      // Animate button
      const btnAnimate = container!.querySelector('[data-testid="btn-animate"]') as HTMLButtonElement;
      expect(btnAnimate).not.toBeNull();
      await act(async () => {
        btnAnimate.click();
      });
      expect(onAnimate).toHaveBeenCalledTimes(1);

      // Quiz toggle button
      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      expect(btnQuiz).not.toBeNull();
      await act(async () => {
        btnQuiz.click();
      });
      expect(onStartQuiz).toHaveBeenCalledTimes(1);

      // Hint button
      const btnHint = container!.querySelector('[data-testid="btn-hint"]') as HTMLButtonElement;
      await act(async () => {
        btnHint.click();
      });
      expect(onShowHint).toHaveBeenCalledTimes(1);

      // Reset button
      const btnReset = container!.querySelector('[data-testid="btn-reset"]') as HTMLButtonElement;
      await act(async () => {
        btnReset.click();
      });
      expect(onReset).toHaveBeenCalledTimes(1);

      // Speed selection button 1.5x
      const btnSpeed15 = container!.querySelector('[data-testid="btn-speed-1.5"]') as HTMLButtonElement;
      await act(async () => {
        btnSpeed15.click();
      });
      expect(onSpeedChange).toHaveBeenCalledWith(1.5);

      // Mute toggle button
      const btnMute = container!.querySelector('[data-testid="btn-mute-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnMute.click();
      });
      expect(onToggleMute).toHaveBeenCalledTimes(1);
    });

    it('displays active state and switch action when in quiz mode', async () => {
      const onCancelQuiz = vi.fn();

      await act(async () => {
        root.render(
          React.createElement(StrokeControls, {
            mode: 'quiz',
            speed: 1.0,
            onAnimate: vi.fn(),
            onStartQuiz: vi.fn(),
            onCancelQuiz,
            onShowHint: vi.fn(),
            onReset: vi.fn(),
            onSpeedChange: vi.fn(),
          })
        );
      });

      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      expect(btnQuiz.textContent).toContain('Dừng luyện viết');

      await act(async () => {
        btnQuiz.click();
      });
      expect(onCancelQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('HanziCanvas Component & iOS Touch Lock', () => {
    it('applies mandatory iOS Safari CSS touch-action and overscroll containment rules', async () => {
      await act(async () => {
        root.render(
          React.createElement(HanziCanvas, {
            character: '你',
            pinyin: 'nǐ',
            sinoVietnamese: 'NHĨ',
            size: 360,
          })
        );
      });

      const canvasContainer = container!.querySelector('[data-testid="hanzi-canvas-container"]') as HTMLElement;
      expect(canvasContainer).not.toBeNull();

      // Verify touch lockdown styles
      expect(canvasContainer.style.touchAction).toBe('none');
      expect(canvasContainer.style.overscrollBehavior).toBe('none');
      expect(canvasContainer.style.userSelect).toBe('none');
    });

    it('initializes HanziWriter with SVG renderer and proper configuration', async () => {
      await act(async () => {
        root.render(
          React.createElement(HanziCanvas, {
            character: '好',
            size: 380,
            animationSpeed: 1.5,
          })
        );
      });

      // Wait for async effect mount
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const options = (mockHanziWriterInstance as any)._createdWithOptions;
      expect(options).toBeDefined();
      expect(options.renderer).toBe('svg'); // Crisp Retina rendering
      expect(options.width).toBe(380);
      expect(options.height).toBe(380);
      expect(options.strokeAnimationSpeed).toBe(1.5);
    });

    it('reuses existing HanziWriter instance on character switch instead of recreating', async () => {
      const HanziWriterModule = (await import('hanzi-writer')).default;
      const createSpy = vi.spyOn(HanziWriterModule, 'create');

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '你', size: 340 }));
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const initialCallCount = createSpy.mock.calls.length;

      // Re-render with new character '好'
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '好', size: 340 }));
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      // Confirm HanziWriter.create was NOT called again (preventing listener leaks)
      expect(createSpy.mock.calls.length).toBe(initialCallCount);
      // Confirm setCharacter('好') was called on the existing instance
      expect(mockHanziWriterInstance.setCharacter).toHaveBeenCalledWith('好');
    });
  });

  describe('Directional Mistake Detection & Audio Feedback', () => {
    it('distinguishes backwards strokes (isBackwards: true) with specific Vietnamese warning', async () => {
      const onMistakeSpy = vi.fn();
      const mistakeBuzzSpy = vi.spyOn(hanziAudio, 'playMistakeBuzz').mockResolvedValue(undefined);

      await act(async () => {
        root.render(
          React.createElement(HanziCanvas, {
            character: '你',
            size: 360,
            onMistake: onMistakeSpy,
          })
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      // Start quiz
      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });

      // Extract quiz options registered with writer.quiz()
      const quizOptions = mockHanziWriterInstance.quiz.mock.calls[0]?.[0];
      expect(quizOptions).toBeDefined();

      // Simulate a backwards stroke mistake
      const backwardsMistakeData: StrokeData = {
        character: '你',
        drawnPath: { pathString: 'M 0 0', points: [{ x: 0, y: 0 }] },
        isBackwards: true,
        strokeNum: 0,
        mistakesOnStroke: 1,
        totalMistakes: 1,
        strokesRemaining: 7,
      };

      await act(async () => {
        quizOptions.onMistake(backwardsMistakeData);
      });

      // Verify callback was triggered with pedagogical Vietnamese message
      expect(onMistakeSpy).toHaveBeenCalledWith(
        backwardsMistakeData,
        'Sai hướng bút thuận (vẽ ngược nét)!'
      );

      // Verify feedback banner displays directional warning
      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]');
      expect(banner?.textContent).toContain('Sai hướng bút thuận (vẽ ngược nét)!');

      // Verify audio feedback was triggered with caution flag (isBackwards = true)
      expect(mistakeBuzzSpy).toHaveBeenCalledWith(true);
    });

    it('displays standard mistake message when stroke is wrong order or shape (isBackwards: false)', async () => {
      const onMistakeSpy = vi.fn();
      const mistakeBuzzSpy = vi.spyOn(hanziAudio, 'playMistakeBuzz').mockResolvedValue(undefined);

      await act(async () => {
        root.render(
          React.createElement(HanziCanvas, {
            character: '你',
            size: 360,
            onMistake: onMistakeSpy,
          })
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });

      const quizOptions = mockHanziWriterInstance.quiz.mock.calls[0]?.[0];

      // Simulate an incorrect stroke (not backwards)
      const wrongStrokeData: StrokeData = {
        character: '你',
        drawnPath: { pathString: 'M 0 0', points: [{ x: 0, y: 0 }] },
        isBackwards: false,
        strokeNum: 0,
        mistakesOnStroke: 1,
        totalMistakes: 1,
        strokesRemaining: 7,
      };

      await act(async () => {
        quizOptions.onMistake(wrongStrokeData);
      });

      expect(onMistakeSpy).toHaveBeenCalledWith(
        wrongStrokeData,
        'Sai nét hoặc sai thứ tự nét!'
      );

      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]');
      expect(banner?.textContent).toContain('Sai nét hoặc sai thứ tự nét!');

      expect(mistakeBuzzSpy).toHaveBeenCalledWith(false);
    });

    it('triggers pleasant chime on correct stroke and fanfare on completion', async () => {
      const onCorrectSpy = vi.fn();
      const onCompleteSpy = vi.fn();
      const chimeSpy = vi.spyOn(hanziAudio, 'playChime').mockResolvedValue(undefined);
      const fanfareSpy = vi.spyOn(hanziAudio, 'playVictoryFanfare').mockResolvedValue(undefined);

      await act(async () => {
        root.render(
          React.createElement(HanziCanvas, {
            character: '你',
            size: 360,
            onCorrectStroke: onCorrectSpy,
            onQuizComplete: onCompleteSpy,
          })
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });

      const quizOptions = mockHanziWriterInstance.quiz.mock.calls[0]?.[0];

      // 1. Correct Stroke
      const correctStrokeData: StrokeData = {
        character: '你',
        drawnPath: { pathString: 'M 0 0', points: [{ x: 0, y: 0 }] },
        isBackwards: false,
        strokeNum: 0,
        mistakesOnStroke: 0,
        totalMistakes: 0,
        strokesRemaining: 6,
      };

      await act(async () => {
        quizOptions.onCorrectStroke(correctStrokeData);
      });

      expect(onCorrectSpy).toHaveBeenCalledWith(correctStrokeData);
      expect(chimeSpy).toHaveBeenCalledTimes(1);

      // 2. Complete Quiz
      await act(async () => {
        quizOptions.onComplete({ character: '你', totalMistakes: 0 });
      });

      expect(onCompleteSpy).toHaveBeenCalledWith({ character: '你', totalMistakes: 0 });
      expect(fanfareSpy).toHaveBeenCalledTimes(1);

      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]');
      expect(banner?.textContent).toContain('Xuất sắc! Bạn đã viết hoàn hảo chữ \'你\'');
    });
  });
});
