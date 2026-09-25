/**
 * blankPaperCanvas.test.ts
 * Unit tests for Blank Paper Memory Challenge in HanziCanvas:
 * - Freehand canvas drawing layer
 * - Retina/devicePixelRatio canvas scaling
 * - Toggle between Guided Quiz mode and Blank Paper mode
 * - "Đối Chiếu & Chấm Nét" comparison action with audio chime
 * - "Xóa viết lại" board clear action
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HanziCanvas } from '@/components/hanzi/HanziCanvas';
import { hanziAudio } from '@/services/hanziAudioFeedback';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill PointerEvent for JSDOM
if (typeof (globalThis as any).PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class extends MouseEvent {
    public pressure: number;
    constructor(type: string, params: any = {}) {
      super(type, params);
      this.pressure = params.pressure ?? 0.5;
    }
  };
}

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
  showOutline: vi.fn().mockResolvedValue(undefined),
  hideOutline: vi.fn().mockResolvedValue(undefined),
  cancelQuiz: vi.fn(),
  getCharacterData: vi.fn().mockResolvedValue({
    strokes: ['stroke1', 'stroke2'],
    medians: [[[0, 0]], [[10, 10]]],
  }),
  quiz: vi.fn(),
  _options: { strokeAnimationSpeed: 1.2 },
};

vi.mock('hanzi-writer', () => {
  return {
    default: {
      create: vi.fn((element, char, options) => {
        return mockHanziWriterInstance;
      }),
    },
  };
});

describe('Blank Paper Memory Challenge (Bảng Giấy Trắng Tự Do)', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();

    // Mock HTMLCanvasElement.getContext
    const mockContext2d = {
      scale: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
      clearRect: vi.fn(),
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: '#1e293b',
      lineWidth: 6,
    };

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext2d) as any;
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      top: 0,
      width: 360,
      height: 360,
    }) as any;
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

  it('renders default guided quiz mode initially', async () => {
    await act(async () => {
      root.render(
        React.createElement(HanziCanvas, {
          character: '你',
          pinyin: 'nǐ',
          sinoVietnamese: 'Nhĩ',
          meaning: 'Bạn, anh, chị',
        })
      );
    });

    const toggleBtn = container!.querySelector('[data-testid="btn-toggle-freehand-mode"]');
    expect(toggleBtn).not.toBeNull();
    expect(toggleBtn?.textContent).toContain('🎯 Luyện nét');

    // Freehand canvas should be hidden
    const freehandCanvas = container!.querySelector('[data-testid="freehand-canvas"]');
    expect(freehandCanvas).not.toBeNull();
    expect(freehandCanvas?.className).toContain('hidden');

    // Standard StrokeControls toolbar should be visible
    expect(container!.querySelector('[data-testid="stroke-controls"]')).not.toBeNull();
  });

  it('can start directly in freehand mode via initialFreehandMode prop', async () => {
    await act(async () => {
      root.render(
        React.createElement(HanziCanvas, {
          character: '好',
          initialFreehandMode: true,
        })
      );
    });

    // Freehand banner should be visible
    const banner = container!.querySelector('[data-testid="freehand-mode-banner"]');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Thử thách Giấy Trắng');

    // Freehand canvas should be visible and interactive
    const freehandCanvas = container!.querySelector('[data-testid="freehand-canvas"]');
    expect(freehandCanvas?.className).toContain('pointer-events-auto');
    expect(freehandCanvas?.className).not.toContain('hidden');

    // Mount should yield pointer events to freehand canvas
    const mount = container!.querySelector('[data-testid="hanzi-writer-mount"]') as HTMLElement;
    expect(mount.style.pointerEvents).toBe('none');

    // Freehand controls toolbar should be visible
    expect(container!.querySelector('[data-testid="freehand-controls-toolbar"]')).not.toBeNull();
  });

  it('toggles into freehand mode when button is clicked', async () => {
    await act(async () => {
      root.render(
        React.createElement(HanziCanvas, {
          character: '你',
          pinyin: 'nǐ',
        })
      );
    });

    const toggleBtn = container!.querySelector('[data-testid="btn-toggle-freehand-mode"]') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();

    await act(async () => {
      toggleBtn.click();
    });

    expect(toggleBtn.textContent).toContain('📄 Giấy trắng');
    expect(container!.querySelector('[data-testid="freehand-mode-banner"]')).not.toBeNull();
    expect(container!.querySelector('[data-testid="freehand-controls-toolbar"]')).not.toBeNull();
  });

  it('handles drawing pointers and triggers compare action with audio chime', async () => {
    const playChimeSpy = vi.spyOn(hanziAudio, 'playChime').mockResolvedValue(undefined);
    const onCompareSpy = vi.fn();

    await act(async () => {
      root.render(
        React.createElement(HanziCanvas, {
          character: '你',
          initialFreehandMode: true,
          onFreehandCompare: onCompareSpy,
        })
      );
    });

    const freehandCanvas = container!.querySelector('[data-testid="freehand-canvas"]') as HTMLCanvasElement;
    expect(freehandCanvas).not.toBeNull();

    // Simulate pointer down and move (drawing strokes)
    await act(async () => {
      freehandCanvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, clientY: 50 }));
      freehandCanvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 100 }));
      freehandCanvas.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 100 }));
    });

    // Check compare button
    const compareBtn = container!.querySelector('[data-testid="btn-freehand-compare"]') as HTMLButtonElement;
    expect(compareBtn).not.toBeNull();

    await act(async () => {
      compareBtn.click();
    });

    // Verify audio chime played
    expect(playChimeSpy).toHaveBeenCalled();
    // Verify comparison callback was fired
    expect(onCompareSpy).toHaveBeenCalled();
  });

  it('clears drawing and resets board when "Xóa viết lại" is clicked', async () => {
    await act(async () => {
      root.render(
        React.createElement(HanziCanvas, {
          character: '中',
          initialFreehandMode: true,
        })
      );
    });

    const clearBtn = container!.querySelector('[data-testid="btn-freehand-clear"]') as HTMLButtonElement;
    expect(clearBtn).not.toBeNull();

    await act(async () => {
      clearBtn.click();
    });

    // Should call HanziWriter's cancelQuiz or hide
    expect(mockHanziWriterInstance.cancelQuiz).toHaveBeenCalled();
  });
});
