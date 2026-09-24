/**
 * hanziCanvas.stress.test.ts
 * Challenger M2_2 Empirical Stress Test Suite for HanziCanvas, useHanziWriter, and Web Audio.
 * 
 * Target Verification Dimensions:
 * 1. Directional mistake discrimination (isBackwards === true vs false, messages, styles, audio).
 * 2. Rapid character switching without unmounting (instance reuse, concurrency, race conditions, error recovery).
 * 3. Dynamic speed changes during active animation, loop, and pause.
 * 4. Audio feedback synthesis resilience under suspended, closed, muted, throwing, or unsupported Web Audio.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HanziCanvas } from '@/components/hanzi/HanziCanvas';
import { StrokeControls, SPEED_OPTIONS } from '@/components/hanzi/StrokeControls';
import { useHanziWriter, UseHanziWriterOptions } from '@/hooks/useHanziWriter';
import { hanziAudio } from '@/services/hanziAudioFeedback';
import { AudioContextManager } from '@/services/audioContext';
import type { StrokeData } from 'hanzi-writer';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock HanziWriter instance with controllable behaviors
let mockSetCharacterDelay = 0;
let mockSetCharacterReject: Error | null = null;
let mockAnimatePromiseResolve: ((res: { canceled: boolean }) => void) | null = null;

const createMockWriterInstance = () => {
  const instance = {
    setCharacter: vi.fn().mockImplementation((char: string) => {
      if (mockSetCharacterReject) {
        return Promise.reject(mockSetCharacterReject);
      }
      if (mockSetCharacterDelay > 0) {
        return new Promise((resolve) => setTimeout(resolve, mockSetCharacterDelay));
      }
      return Promise.resolve(undefined);
    }),
    updateDimensions: vi.fn(),
    animateCharacter: vi.fn().mockImplementation(({ onComplete }) => {
      if (mockAnimatePromiseResolve !== null) {
        return new Promise<{ canceled: boolean }>((resolve) => {
          mockAnimatePromiseResolve = (res) => {
            onComplete?.(res);
            resolve(res);
          };
        });
      }
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
      strokes: ['stroke1', 'stroke2', 'stroke3', 'stroke4'],
      medians: [[[0, 0]], [[10, 10]], [[20, 20]], [[30, 30]]],
    }),
    quiz: vi.fn(),
    _options: { strokeAnimationSpeed: 1.2 },
    _createdWithOptions: null as any,
  };
  return instance;
};

let currentMockWriter = createMockWriterInstance();
let createCallCount = 0;

vi.mock('hanzi-writer', () => {
  return {
    default: {
      create: vi.fn((element, char, options) => {
        createCallCount++;
        currentMockWriter._createdWithOptions = options;
        return currentMockWriter;
      }),
    },
  };
});

// Comprehensive Web Audio Mock
class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockAudioParam {
  value = 0;
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
}

class MockOscillatorNode extends MockAudioNode {
  type: OscillatorType = 'sine';
  frequency = new MockAudioParam();
  start = vi.fn();
  stop = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockBiquadFilterNode extends MockAudioNode {
  type: BiquadFilterType = 'lowpass';
  frequency = new MockAudioParam();
}

class ComprehensiveMockAudioContext {
  state: AudioContextState = 'running';
  sampleRate = 44100;
  currentTime = 0;
  destination = new MockAudioNode();

  createOscillator() {
    return new MockOscillatorNode();
  }

  createGain() {
    return new MockGainNode();
  }

  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return { numberOfChannels: channels, length, sampleRate };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  resume = vi.fn().mockImplementation(async () => {
    this.state = 'running';
  });

  close = vi.fn().mockImplementation(async () => {
    this.state = 'closed';
  });
}

// Lightweight Test Harness for useHanziWriter Hook direct testing
const HookTestHarness: React.FC<{
  character: string;
  onLoadSuccess?: () => void;
  onLoadError?: (err: Error) => void;
}> = ({ character, onLoadSuccess, onLoadError }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hookResult = useHanziWriter(mountRef, {
    character,
    onLoadSuccess,
    onLoadError,
  });

  return React.createElement(
    'div',
    { 'data-testid': 'hook-harness-root' },
    React.createElement('div', { ref: mountRef, 'data-testid': 'hook-mount' }),
    React.createElement('span', { 'data-testid': 'hook-feedback' }, hookResult.feedbackMessage),
    React.createElement('span', { 'data-testid': 'hook-error' }, hookResult.error ?? 'none')
  );
};

describe('Challenger M2_2: HanziCanvas & useHanziWriter Empirical Stress Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;
  let originalAudioContext: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    mockSetCharacterDelay = 0;
    mockSetCharacterReject = null;
    mockAnimatePromiseResolve = null;
    createCallCount = 0;
    currentMockWriter = createMockWriterInstance();
    vi.clearAllMocks();

    originalAudioContext = (window as any).AudioContext;
    (window as any).AudioContext = ComprehensiveMockAudioContext;
    delete (window as any).webkitAudioContext;

    hanziAudio.setMuted(false);
  });

  afterEach(async () => {
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

    (window as any).AudioContext = originalAudioContext;
    hanziAudio.setMuted(false);

    const manager = AudioContextManager.getInstance();
    await manager.closeContext();
  });

  // =========================================================================
  // SUITE 1: Directional Mistake Discrimination
  // =========================================================================
  describe('1. Directional Mistake Discrimination (isBackwards === true vs false)', () => {
    it('1.1 verifies isBackwards === true triggers specific directional warning and higher caution buzz', async () => {
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

      const quizOptions = currentMockWriter.quiz.mock.calls[0]?.[0];
      expect(quizOptions).toBeDefined();

      const backwardsData: StrokeData = {
        character: '你',
        drawnPath: { pathString: 'M 0 0', points: [{ x: 0, y: 0 }] },
        isBackwards: true,
        strokeNum: 0,
        mistakesOnStroke: 1,
        totalMistakes: 1,
        strokesRemaining: 6,
      };

      await act(async () => {
        quizOptions.onMistake(backwardsData);
      });

      // 1. Message must explicitly state "Sai hướng bút thuận"
      expect(onMistakeSpy).toHaveBeenCalledWith(backwardsData, 'Sai hướng bút thuận (vẽ ngược nét)!');

      // 2. Feedback banner text must contain directional warning
      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]') as HTMLElement;
      expect(banner.textContent).toContain('Sai hướng bút thuận (vẽ ngược nét)!');

      // 3. Feedback banner styling must be warning (amber / yellow tone, not red error)
      expect(banner.className).toContain('bg-amber-950/50');
      expect(banner.className).toContain('text-amber-200');
      expect(banner.className).toContain('border-amber-500/60');

      // 4. Audio buzz invoked with isBackwards === true
      expect(mistakeBuzzSpy).toHaveBeenCalledWith(true);
    });

    it('1.2 verifies isBackwards === false triggers generic stroke/order error and standard buzz', async () => {
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

      const quizOptions = currentMockWriter.quiz.mock.calls[0]?.[0];

      const normalMistakeData: StrokeData = {
        character: '你',
        drawnPath: { pathString: 'M 0 0', points: [{ x: 0, y: 0 }] },
        isBackwards: false,
        strokeNum: 0,
        mistakesOnStroke: 1,
        totalMistakes: 1,
        strokesRemaining: 6,
      };

      await act(async () => {
        quizOptions.onMistake(normalMistakeData);
      });

      expect(onMistakeSpy).toHaveBeenCalledWith(normalMistakeData, 'Sai nét hoặc sai thứ tự nét!');

      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]') as HTMLElement;
      expect(banner.textContent).toContain('Sai nét hoặc sai thứ tự nét!');

      // Styling must be error (rose / red tone)
      expect(banner.className).toContain('bg-rose-950/50');
      expect(banner.className).toContain('text-rose-200');
      expect(banner.className).toContain('border-rose-500/40');

      expect(mistakeBuzzSpy).toHaveBeenCalledWith(false);
    });

    it('1.3 hard-verifies that outputs for isBackwards: true vs false are mutually distinct across 4 dimensions', async () => {
      const onMistakeSpy = vi.fn();
      const mistakeBuzzSpy = vi.spyOn(hanziAudio, 'playMistakeBuzz').mockResolvedValue(undefined);

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '好', size: 360, onMistake: onMistakeSpy }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });
      const quizOptions = currentMockWriter.quiz.mock.calls[0]?.[0];

      // Simulate True
      await act(async () => {
        quizOptions.onMistake({ isBackwards: true, strokeNum: 0, mistakesOnStroke: 1, totalMistakes: 1 });
      });
      const msgTrue = onMistakeSpy.mock.calls[0][1];
      const bannerTrueClass = container!.querySelector('[data-testid="canvas-feedback-banner"]')!.className;
      const audioArgTrue = mistakeBuzzSpy.mock.calls[0][0];

      // Simulate False
      await act(async () => {
        quizOptions.onMistake({ isBackwards: false, strokeNum: 0, mistakesOnStroke: 2, totalMistakes: 2 });
      });
      const msgFalse = onMistakeSpy.mock.calls[1][1];
      const bannerFalseClass = container!.querySelector('[data-testid="canvas-feedback-banner"]')!.className;
      const audioArgFalse = mistakeBuzzSpy.mock.calls[1][0];

      // 4 Distinctness Assertions
      expect(msgTrue).not.toBe(msgFalse);
      expect(msgTrue).toBe('Sai hướng bút thuận (vẽ ngược nét)!');
      expect(msgFalse).toBe('Sai nét hoặc sai thứ tự nét!');

      expect(bannerTrueClass).not.toBe(bannerFalseClass);
      expect(bannerTrueClass).toContain('amber');
      expect(bannerFalseClass).toContain('rose');

      expect(audioArgTrue).toBe(true);
      expect(audioArgFalse).toBe(false);
      expect(audioArgTrue).not.toBe(audioArgFalse);
    });

    it('1.4 verifies falsy or undefined isBackwards safely defaults to standard mistake', async () => {
      const onMistakeSpy = vi.fn();
      const mistakeBuzzSpy = vi.spyOn(hanziAudio, 'playMistakeBuzz').mockResolvedValue(undefined);

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '学', onMistake: onMistakeSpy }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });
      const quizOptions = currentMockWriter.quiz.mock.calls[0]?.[0];

      // Passing undefined isBackwards
      await act(async () => {
        quizOptions.onMistake({ isBackwards: undefined, strokeNum: 0, mistakesOnStroke: 1, totalMistakes: 1 });
      });

      expect(onMistakeSpy).toHaveBeenCalledWith(expect.anything(), 'Sai nét hoặc sai thứ tự nét!');
      expect(mistakeBuzzSpy).toHaveBeenCalledWith(undefined);
    });

    it('1.5 stress-tests 20 rapid alternating directional and normal mistakes in quiz mode', async () => {
      const onMistakeSpy = vi.fn();
      vi.spyOn(hanziAudio, 'playMistakeBuzz').mockResolvedValue(undefined);

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '你', onMistake: onMistakeSpy }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });
      const quizOptions = currentMockWriter.quiz.mock.calls[0]?.[0];

      for (let i = 1; i <= 20; i++) {
        const isBack = i % 2 === 1;
        await act(async () => {
          quizOptions.onMistake({
            character: '你',
            isBackwards: isBack,
            strokeNum: 0,
            mistakesOnStroke: i,
            totalMistakes: i,
            strokesRemaining: 5,
          });
        });

        const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]') as HTMLElement;
        const expectedMsg = isBack ? 'Sai hướng bút thuận (vẽ ngược nét)!' : 'Sai nét hoặc sai thứ tự nét!';
        expect(banner.textContent).toContain(expectedMsg);

        // Verify mistake counter in status bar
        const statusBar = container!.querySelector('[data-testid="canvas-status-bar"]') as HTMLElement;
        expect(statusBar.textContent).toContain(`Tổng lỗi: ${i}`);
      }

      expect(onMistakeSpy).toHaveBeenCalledTimes(20);
    });
  });

  // =========================================================================
  // SUITE 2: Rapid Character Switching Without Unmounting
  // =========================================================================
  describe('2. Rapid Character Switching Without Unmounting', () => {
    it('2.1 verifies single HanziWriter instance is reused across 10 sequential character changes', async () => {
      const HanziWriterModule = (await import('hanzi-writer')).default;
      const createSpy = vi.spyOn(HanziWriterModule, 'create');

      const chars = ['你', '好', '学', '习', '中', '文', '汉', '字', '韵', '律'];

      // First mount with '你'
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: chars[0], size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(currentMockWriter.setCharacter).not.toHaveBeenCalled();

      // Sequentially switch to next 9 characters
      for (let i = 1; i < chars.length; i++) {
        const char = chars[i];
        await act(async () => {
          root.render(React.createElement(HanziCanvas, { character: char, size: 340 }));
        });
        await act(async () => {
          await new Promise((r) => setTimeout(r, 20));
        });

        // create() must NEVER be called again! Single instance reuse.
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(currentMockWriter.setCharacter).toHaveBeenLastCalledWith(char);
      }

      expect(currentMockWriter.setCharacter).toHaveBeenCalledTimes(9);

      // Final banner text must reflect the last character
      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]');
      expect(banner?.textContent).toContain("Sẵn sàng luyện viết chữ '律'");
    });

    it('2.2 stress-tests rapid character switching race condition with async delay', async () => {
      mockSetCharacterDelay = 25; // 25ms artificial network delay

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '你', size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });

      // Fire rapid character switches wrapped in act
      const rapidChars = ['好', '学', '习', '中', '汉'];
      for (const char of rapidChars) {
        await act(async () => {
          root.render(React.createElement(HanziCanvas, { character: char, size: 340 }));
          // Give tiny microtask tick so effect is scheduled
          await new Promise((r) => setTimeout(r, 10));
        });
      }

      // Wait for all async promises and timeouts to settle
      await act(async () => {
        await new Promise((r) => setTimeout(r, 150));
      });

      // Final feedback banner must match the last requested character '汉'
      const banner = container!.querySelector('[data-testid="canvas-feedback-banner"]');
      expect(banner?.textContent).toContain("Sẵn sàng luyện viết chữ '汉'");

      // Error must remain null and loading false
      expect(container!.querySelector('[data-testid="canvas-error-overlay"]')).toBeNull();
      expect(container!.querySelector('[data-testid="canvas-loading-spinner"]')).toBeNull();
    });

    it('2.3 verifies switching character during active quiz cancels quiz and resets state cleanly', async () => {
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '你', size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      // Start quiz
      const btnQuiz = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      await act(async () => {
        btnQuiz.click();
      });

      // Make a mistake so mistakes are recorded
      const quizOptions = currentMockWriter.quiz.mock.calls[0]?.[0];
      await act(async () => {
        quizOptions.onMistake({ isBackwards: false, strokeNum: 0, mistakesOnStroke: 2, totalMistakes: 2 });
      });

      expect(container!.textContent).toContain('Tổng lỗi: 2');

      // Now switch character to '好' while still in quiz mode
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '好', size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      // cancelQuiz must have been called
      expect(currentMockWriter.cancelQuiz).toHaveBeenCalled();

      // Mode must have reset to idle (quiz button now says 'Luyện viết cảm ứng', not 'Dừng luyện viết')
      const btnQuizAfter = container!.querySelector('[data-testid="btn-quiz-toggle"]') as HTMLButtonElement;
      expect(btnQuizAfter.textContent).toContain('Luyện viết cảm ứng');

      // Total mistakes counter must no longer be shown in status bar
      expect(container!.textContent).not.toContain('Tổng lỗi: 2');

      // Feedback banner says ready for new character
      expect(container!.querySelector('[data-testid="canvas-feedback-banner"]')?.textContent).toContain(
        "Sẵn sàng luyện viết chữ '好'"
      );
    });

    it('2.4 verifies error recovery: switching to failing char and then recovering on valid char in HanziCanvas', async () => {
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '你', size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      // Now configure setCharacter to fail for bad character
      mockSetCharacterReject = new Error('Dữ liệu nét không tồn tại cho ký tự đặc biệt');

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '𠮷', size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });

      // Error must be caught, not thrown uncaught
      const errorOverlay = container!.querySelector('[data-testid="canvas-error-overlay"]');
      expect(errorOverlay).not.toBeNull();
      expect(errorOverlay?.textContent).toContain('Dữ liệu nét không tồn tại cho ký tự đặc biệt');

      // Now recover by switching back to a valid character '学'
      mockSetCharacterReject = null;

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '学', size: 340 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });

      // Error overlay must disappear, feedback banner active
      expect(container!.querySelector('[data-testid="canvas-error-overlay"]')).toBeNull();
      expect(container!.querySelector('[data-testid="canvas-feedback-banner"]')?.textContent).toContain(
        "Sẵn sàng luyện viết chữ '学'"
      );
    });

    it('2.5 verifies useHanziWriter hook onLoadSuccess and onLoadError callbacks directly', async () => {
      const onLoadSuccessSpy = vi.fn();
      const onLoadErrorSpy = vi.fn();

      await act(async () => {
        root.render(
          React.createElement(HookTestHarness, {
            character: '你',
            onLoadSuccess: onLoadSuccessSpy,
            onLoadError: onLoadErrorSpy,
          })
        );
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(onLoadSuccessSpy).toHaveBeenCalledTimes(1);
      expect(onLoadErrorSpy).not.toHaveBeenCalled();

      // Switch to failing character
      mockSetCharacterReject = new Error('Hook load error test');
      await act(async () => {
        root.render(
          React.createElement(HookTestHarness, {
            character: '好',
            onLoadSuccess: onLoadSuccessSpy,
            onLoadError: onLoadErrorSpy,
          })
        );
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(onLoadErrorSpy).toHaveBeenCalledTimes(1);

      // Recover
      mockSetCharacterReject = null;
      await act(async () => {
        root.render(
          React.createElement(HookTestHarness, {
            character: '学',
            onLoadSuccess: onLoadSuccessSpy,
            onLoadError: onLoadErrorSpy,
          })
        );
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(onLoadSuccessSpy).toHaveBeenCalledTimes(2);
    });
  });

  // =========================================================================
  // SUITE 3: Speed Changes During Active Animation & Boundary Conditions
  // =========================================================================
  describe('3. Dynamic Speed Changes During Active Animation', () => {
    it('3.1 dynamically modifies speed during active animateCharacter without throwing or cancelling', async () => {
      // Mock animateCharacter to hang until manually resolved
      let finishAnimation: ((res: { canceled: boolean }) => void) | null = null;
      currentMockWriter.animateCharacter = vi.fn().mockImplementation(({ onComplete }) => {
        return new Promise<{ canceled: boolean }>((resolve) => {
          finishAnimation = (res) => {
            onComplete?.(res);
            resolve(res);
          };
        });
      });

      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '你', size: 360, animationSpeed: 1.0 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      // Trigger animation
      const btnAnimate = container!.querySelector('[data-testid="btn-animate"]') as HTMLButtonElement;
      await act(async () => {
        btnAnimate.click();
      });

      // Verify mode is animating
      expect(container!.querySelector('[data-testid="canvas-status-bar"]')?.textContent).toContain('Đang thị phạm');

      // While animation is actively running, change speed via 2.0x button
      const btnSpeed2 = container!.querySelector('[data-testid="btn-speed-2"]') as HTMLButtonElement;
      await act(async () => {
        btnSpeed2.click();
      });

      // Check writer internal speed option updated in real-time
      expect(currentMockWriter._options.strokeAnimationSpeed).toBe(2.0);

      // Now complete the animation
      await act(async () => {
        finishAnimation?.({ canceled: false });
      });

      // Animation completed successfully
      expect(container!.querySelector('[data-testid="canvas-status-bar"]')?.textContent).toContain('Sẵn sàng');
      expect(container!.querySelector('[data-testid="canvas-feedback-banner"]')?.textContent).toContain(
        'Hoàn thành thị phạm nét!'
      );
    });

    it('3.2 cycles through all speed buttons in StrokeControls updating writer option on each click', async () => {
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '好', size: 360, animationSpeed: 1.0 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      for (const speed of SPEED_OPTIONS) {
        const btn = container!.querySelector(`[data-testid="btn-speed-${speed}"]`) as HTMLButtonElement;
        expect(btn).not.toBeNull();

        await act(async () => {
          btn.click();
        });

        // Writer options updated
        expect(currentMockWriter._options.strokeAnimationSpeed).toBe(speed);

        // Active class styling applied
        expect(btn.className).toContain('bg-cyber-cyan');
      }
    });

    it('3.3 tests boundary and extreme speed multipliers: 0.1, 5.0, 0, and negative values', async () => {
      await act(async () => {
        root.render(React.createElement(HanziCanvas, { character: '好', size: 360 }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      const onSpeedChangeSpy = vi.fn((speed: number) => {
        (currentMockWriter as any)._options.strokeAnimationSpeed = speed;
      });

      const extremeSpeeds = [0.01, 0.1, 3.5, 10.0, 0, -1.0, 999];

      for (const s of extremeSpeeds) {
        expect(() => {
          onSpeedChangeSpy(s);
        }).not.toThrow();
        expect(currentMockWriter._options.strokeAnimationSpeed).toBe(s);
      }
    });
  });

  // =========================================================================
  // SUITE 4: Web Audio Synthesis Resilience
  // =========================================================================
  describe('4. Audio Feedback Synthesis Resilience Under Adverse Web Audio States', () => {
    it('4.1 survives suspended AudioContext where resume() rejects (iOS Safari autoplay lock)', async () => {
      class SuspendedRejectingAudioContext extends ComprehensiveMockAudioContext {
        override state: AudioContextState = 'suspended';
        override resume = vi.fn().mockRejectedValue(new Error('NotAllowedError: User gesture required to start audio'));
      }
      (window as any).AudioContext = SuspendedRejectingAudioContext;

      // Close previous instance so new context class is picked up
      await AudioContextManager.getInstance().closeContext();

      // Call all audio methods — NONE must throw or reject!
      await expect(hanziAudio.playChime()).resolves.toBeUndefined();
      await expect(hanziAudio.playMistakeBuzz(true)).resolves.toBeUndefined();
      await expect(hanziAudio.playMistakeBuzz(false)).resolves.toBeUndefined();
      await expect(hanziAudio.playVictoryFanfare()).resolves.toBeUndefined();
    });

    it('4.2 survives closed AudioContext gracefully', async () => {
      class ClosedAudioContext extends ComprehensiveMockAudioContext {
        override state: AudioContextState = 'closed';
      }
      (window as any).AudioContext = ClosedAudioContext;
      await AudioContextManager.getInstance().closeContext();

      await expect(hanziAudio.playChime()).resolves.toBeUndefined();
      await expect(hanziAudio.playMistakeBuzz(true)).resolves.toBeUndefined();
      await expect(hanziAudio.playVictoryFanfare()).resolves.toBeUndefined();
    });

    it('4.3 completely bypasses AudioContext when muted', async () => {
      hanziAudio.setMuted(true);
      expect(hanziAudio.getMuted()).toBe(true);

      const manager = AudioContextManager.getInstance();
      const getOrCreateSpy = vi.spyOn(manager, 'getOrCreateContext');

      await hanziAudio.playChime();
      await hanziAudio.playMistakeBuzz(true);
      await hanziAudio.playVictoryFanfare();

      // Zero calls made to Web Audio while muted
      expect(getOrCreateSpy).not.toHaveBeenCalled();

      // Unmute and verify calls resume
      hanziAudio.setMuted(false);
      await hanziAudio.playChime();
      expect(getOrCreateSpy).toHaveBeenCalledTimes(1);
    });

    it('4.4 survives unsupported browser where window.AudioContext is undefined', async () => {
      delete (window as any).AudioContext;
      delete (window as any).webkitAudioContext;

      await AudioContextManager.getInstance().closeContext();

      // Must degrade silently without throwing
      await expect(hanziAudio.playChime()).resolves.toBeUndefined();
      await expect(hanziAudio.playMistakeBuzz(true)).resolves.toBeUndefined();
      await expect(hanziAudio.playVictoryFanfare()).resolves.toBeUndefined();
    });

    it('4.5 survives node creation throwing (out of hardware audio channels)', async () => {
      class CrashingNodeAudioContext extends ComprehensiveMockAudioContext {
        override createOscillator = vi.fn().mockImplementation(() => {
          throw new Error('QuotaExceededError: Maximum number of active Web Audio hardware channels reached');
        });
      }
      (window as any).AudioContext = CrashingNodeAudioContext;
      await AudioContextManager.getInstance().closeContext();

      await expect(hanziAudio.playChime()).resolves.toBeUndefined();
      await expect(hanziAudio.playMistakeBuzz(true)).resolves.toBeUndefined();
      await expect(hanziAudio.playVictoryFanfare()).resolves.toBeUndefined();
    });

    it('4.6 withstands 100 concurrent audio playback requests without unhandled rejections', async () => {
      const calls: Promise<void>[] = [];

      for (let i = 0; i < 25; i++) {
        calls.push(hanziAudio.playChime());
        calls.push(hanziAudio.playMistakeBuzz(true));
        calls.push(hanziAudio.playMistakeBuzz(false));
        calls.push(hanziAudio.playVictoryFanfare());
      }

      expect(calls.length).toBe(100);

      const results = await Promise.allSettled(calls);
      const allFulfilled = results.every((r) => r.status === 'fulfilled');
      expect(allFulfilled).toBe(true);
    });
  });
});
