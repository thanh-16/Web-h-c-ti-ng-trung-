/**
 * tests/unit/pitchVisualizer.test.ts
 * Unit tests for Pitch UI Components: PitchVisualizer, ToneGuideCard, RecordButton
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { PitchVisualizer } from '@/components/pitch/PitchVisualizer';
import { ToneGuideCard } from '@/components/pitch/ToneGuideCard';
import { RecordButton } from '@/components/pitch/RecordButton';
import { SpeechService } from '@/services/speechService';
import { AudioContextManager } from '@/services/audioContext';
import { MandarinTone } from '@/services/toneScorer';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock HTMLCanvasElement.getContext
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    resetTransform: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
  }) as any;
});

describe('Pitch UI Components Suite', () => {
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
      container = null;
      root = null;
    }
  });

  describe('PitchVisualizer Component', () => {
    it('renders the canvas and displays target tone badge (Thanh 1 Chao 55)', () => {
      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 1,
            pitchPoints: [],
            currentPitch: 0,
            isRecording: false,
          })
        );
      });

      expect(container?.querySelector('canvas')).toBeTruthy();
      expect(container?.textContent).toContain('Thanh 1 (Âm Bình)');
      expect(container?.textContent).toContain('Chao 55');
      expect(container?.textContent).toContain('Sẵn sàng ghi âm');
    });

    it('displays live pitch in Hz and clarity when recording', () => {
      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 2,
            pitchPoints: [
              { timeMs: 100, f0: 220, chaoLevel: 3.5, rms: 0.2, clarity: 0.98, isVoiced: true },
            ],
            currentPitch: 220.5,
            currentClarity: 0.98,
            isRecording: true,
          })
        );
      });

      expect(container?.textContent).toContain('220.5 Hz');
      expect(container?.textContent).toContain('(98%)');
    });

    it('displays final match score badge when scoreResult is available', () => {
      const mockResult = {
        matchScore: 92,
        detectedTone: 4 as MandarinTone,
        targetTone: 4 as MandarinTone,
        feedbackVi: 'Rất chuẩn!',
        meanChaoError: 0.15,
        slopeCorrelation: 0.95,
        userMedianHz: 185,
      };

      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 4,
            pitchPoints: [],
            isRecording: false,
            scoreResult: mockResult,
          })
        );
      });

      expect(container?.textContent).toContain('Điểm khớp: 92%');
    });
  });

  describe('ToneGuideCard Component', () => {
    it('renders cards for all 4 tones with Vietnamese titles and Chao codes', () => {
      const handleSelect = vi.fn();

      act(() => {
        root.render(
          React.createElement(ToneGuideCard, {
            selectedTone: 1,
            onSelectTone: handleSelect,
          })
        );
      });

      expect(container?.textContent).toContain('Thanh 1 (Âm Bình)');
      expect(container?.textContent).toContain('Thanh 2 (Dương Bình)');
      expect(container?.textContent).toContain('Thanh 3 (Thượng Thanh)');
      expect(container?.textContent).toContain('Thanh 4 (Khứ Thanh)');
      expect(container?.textContent).toContain('55');
      expect(container?.textContent).toContain('35');
      expect(container?.textContent).toContain('214');
      expect(container?.textContent).toContain('51');
    });

    it('triggers onSelectTone callback when a tone card is clicked', () => {
      const handleSelect = vi.fn();

      act(() => {
        root.render(
          React.createElement(ToneGuideCard, {
            selectedTone: 1,
            onSelectTone: handleSelect,
          })
        );
      });

      const cards = container?.querySelectorAll('.cursor-pointer');
      expect(cards?.length).toBe(4);

      // Click Tone 3 card (index 2)
      act(() => {
        cards?.[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(handleSelect).toHaveBeenCalledWith(3);
    });

    it('calls SpeechService tone acoustic playback when sample button is clicked', async () => {
      const handleSelect = vi.fn();
      const playSpy = vi.spyOn(SpeechService.getInstance(), 'playToneAcousticModel').mockResolvedValue();
      vi.spyOn(AudioContextManager.getInstance(), 'getOrCreateContext').mockResolvedValue({} as any);

      act(() => {
        root.render(
          React.createElement(ToneGuideCard, {
            selectedTone: 1,
            onSelectTone: handleSelect,
          })
        );
      });

      const playButtons = container?.querySelectorAll('button[title="Nghe cao độ chuẩn"]');
      expect(playButtons?.length).toBe(4);

      await act(async () => {
        playButtons?.[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(playSpy).toHaveBeenCalledWith(2);
    });
  });

  describe('RecordButton Component', () => {
    it('renders idle state with "Bắt đầu phát âm" and calls onStart when clicked', () => {
      const onStart = vi.fn();
      const onStop = vi.fn();

      act(() => {
        root.render(
          React.createElement(RecordButton, {
            isRecording: false,
            onStart: onStart,
            onStop: onStop,
          })
        );
      });

      const button = container?.querySelector('button');
      expect(button?.textContent).toContain('Bắt đầu phát âm');

      act(() => {
        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onStop).not.toHaveBeenCalled();
    });

    it('renders active state with "Dừng thu âm" and calls onStop when clicked', () => {
      const onStart = vi.fn();
      const onStop = vi.fn();

      act(() => {
        root.render(
          React.createElement(RecordButton, {
            isRecording: true,
            onStart: onStart,
            onStop: onStop,
            rms: 0.35,
          })
        );
      });

      const button = container?.querySelector('button');
      expect(button?.textContent).toContain('Dừng thu âm');

      act(() => {
        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('renders error message when error is provided', () => {
      act(() => {
        root.render(
          React.createElement(RecordButton, {
            isRecording: false,
            onStart: vi.fn(),
            onStop: vi.fn(),
            error: 'Quyền microphone bị từ chối',
          })
        );
      });

      expect(container?.textContent).toContain('Quyền microphone bị từ chối');
    });
  });
});
