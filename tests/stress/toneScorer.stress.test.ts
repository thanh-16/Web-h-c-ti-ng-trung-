/**
 * tests/stress/toneScorer.stress.test.ts
 * Challenger M3_2 Empirical Adversarial Stress Test Suite for Tone Scorer & Pitch Visualizer
 *
 * Challenge Dimensions:
 * 1. Speaker Invariance: Male (110 Hz) vs Female (260 Hz) across Tones 1, 2, 3, 4
 * 2. Degenerate Contours: Flat pitch to Tone 4, Reverse pitch to Tone 2, Inverted Tone 3
 * 3. Rapid Recording Toggles: Asynchronous start/stop races and concurrent toggles in usePitchDetector
 * 4. Canvas Boundary Stress: Empty, single, overflowing (>500 samples), zero-dimension, and invalid data in PitchVisualizer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  scorePitchContour,
  semitoneNormalize,
  getChaoTargetValue,
  calculateMedianF0,
  generateChaoCurve,
  MandarinTone,
  PitchRecordPoint,
} from '@/services/toneScorer';
import { PitchVisualizer } from '@/components/pitch/PitchVisualizer';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { AudioContextManager } from '@/services/audioContext';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Helper to generate synthetic PitchRecordPoint sequence matching a target Chao curve
 */
function generateSyntheticPitchPoints(
  tone: MandarinTone,
  medianHz: number,
  steps: number = 50,
  durationMs: number = 1000
): PitchRecordPoint[] {
  const points: PitchRecordPoint[] = [];
  const denominator = Math.max(1, steps - 1);

  for (let i = 0; i < steps; i++) {
    const t = i / denominator;
    const chao = getChaoTargetValue(tone, t);
    // Inverse semitone normalization: S = (Chao - 3.0) / 2.0 * 6.0 = (Chao - 3.0) * 3.0
    const semitones = (chao - 3.0) * 3.0;
    const f0 = medianHz * Math.pow(2, semitones / 12.0);

    points.push({
      timeMs: Math.round(t * durationMs),
      f0,
      chaoLevel: chao,
      rms: 0.25,
      clarity: 0.98,
      isVoiced: true,
    });
  }

  return points;
}

/**
 * Helper to generate flat pitch points
 */
function generateFlatPitchPoints(
  f0Hz: number,
  chaoLevel: number,
  steps: number = 50,
  durationMs: number = 1000
): PitchRecordPoint[] {
  const points: PitchRecordPoint[] = [];
  const denominator = Math.max(1, steps - 1);

  for (let i = 0; i < steps; i++) {
    const t = i / denominator;
    points.push({
      timeMs: Math.round(t * durationMs),
      f0: f0Hz,
      chaoLevel,
      rms: 0.25,
      clarity: 0.95,
      isVoiced: true,
    });
  }

  return points;
}

describe('Challenger M3_2: Tone Scorer & Pitch Visualizer Adversarial Suite', () => {
  // =========================================================================
  // Dimension 1: Speaker Invariance (Male 110 Hz vs Female 260 Hz)
  // =========================================================================
  describe('1. Speaker Invariance: Male (110 Hz) vs Female (260 Hz)', () => {
    const maleMedian = 110;
    const femaleMedian = 260;
    const tones: MandarinTone[] = [1, 2, 3, 4];

    for (const tone of tones) {
      it(`verifies identical Chao levels and high match score (>85%) for Tone ${tone} across male and female`, () => {
        const malePoints = generateSyntheticPitchPoints(tone, maleMedian, 50);
        const femalePoints = generateSyntheticPitchPoints(tone, femaleMedian, 50);

        expect(malePoints.length).toBe(femalePoints.length);

        // 1.1 Verify point-by-point Chao normalization identity
        for (let i = 0; i < malePoints.length; i++) {
          const maleChao = semitoneNormalize(malePoints[i].f0, maleMedian);
          const femaleChao = semitoneNormalize(femalePoints[i].f0, femaleMedian);

          // Male and Female must produce exactly identical normalized Chao levels
          expect(maleChao).toBeCloseTo(femaleChao, 2);
          // And must match the theoretical target Chao
          const expectedChao = getChaoTargetValue(tone, i / (malePoints.length - 1));
          expect(maleChao).toBeCloseTo(expectedChao, 1);
        }

        // 1.2 Evaluate Tone Scorer with personal median baseline
        const maleResult = scorePitchContour(malePoints, tone, maleMedian);
        const femaleResult = scorePitchContour(femalePoints, tone, femaleMedian);

        // Both must achieve score > 85%
        expect(maleResult.matchScore).toBeGreaterThanOrEqual(85);
        expect(femaleResult.matchScore).toBeGreaterThanOrEqual(85);

        // Invariance: scores must match within 1 point
        expect(Math.abs(maleResult.matchScore - femaleResult.matchScore)).toBeLessThanOrEqual(1);

        // Both must correctly identify the target tone
        expect(maleResult.detectedTone).toBe(tone);
        expect(femaleResult.detectedTone).toBe(tone);

        // Both must receive positive Vietnamese pedagogical feedback
        expect(maleResult.feedbackVi).toContain('Rất chuẩn');
        expect(femaleResult.feedbackVi).toContain('Rất chuẩn');

        // Mean Chao Error must be negligible (< 0.15)
        expect(maleResult.meanChaoError).toBeLessThan(0.15);
        expect(femaleResult.meanChaoError).toBeLessThan(0.15);
      });
    }

    it('measures cross-gender dynamic median calculation without pre-set baseline', () => {
      // Test dynamic median calculation when providedMedian is not passed
      for (const tone of [2, 3, 4] as MandarinTone[]) {
        const malePoints = generateSyntheticPitchPoints(tone, maleMedian, 50);
        const femalePoints = generateSyntheticPitchPoints(tone, femaleMedian, 50);

        const calculatedMaleMedian = calculateMedianF0(malePoints.map((p) => p.f0));
        const calculatedFemaleMedian = calculateMedianF0(femalePoints.map((p) => p.f0));

        // Ratios of pitch to median should be preserved
        expect(calculatedMaleMedian).toBeGreaterThan(80);
        expect(calculatedMaleMedian).toBeLessThan(200);
        expect(calculatedFemaleMedian).toBeGreaterThan(180);
        expect(calculatedFemaleMedian).toBeLessThan(450);

        const maleResult = scorePitchContour(malePoints, tone);
        const femaleResult = scorePitchContour(femalePoints, tone);

        // Dynamic median scoring should be consistent between genders
        expect(Math.abs(maleResult.matchScore - femaleResult.matchScore)).toBeLessThanOrEqual(2);
        expect(maleResult.detectedTone).toBe(tone);
        expect(femaleResult.detectedTone).toBe(tone);
      }
    });

    it('proves Tone 1 single-word score degradation when providedMedian is omitted (self-median normalization distortion)', () => {
      // Tone 1 is at Chao 5.0 (6 semitones above personal baseline Fmedian)
      const malePoints = generateSyntheticPitchPoints(1, maleMedian, 50);
      
      // If providedMedian is omitted, scorePitchContour calculates median from the points themselves
      // Because all points are at ~155.6 Hz, the calculated median becomes ~155.6 Hz
      // Then 155.6 Hz normalized against 155.6 Hz yields Chao 3.0 instead of Chao 5.0!
      const uncalibratedResult = scorePitchContour(malePoints, 1);
      
      // Distance score drops to 50% because Chao 3.0 vs target 5.0 has MAE = 2.0
      // Total score drops to 78% (below the 85% requirement)
      console.log('TONE 1 WITHOUT BASELINE MEDIAN: matchScore =', uncalibratedResult.matchScore, 'MAE =', uncalibratedResult.meanChaoError);
      expect(uncalibratedResult.matchScore).toBeLessThan(85);
      expect(uncalibratedResult.meanChaoError).toBeCloseTo(2.0, 1);

      // Whereas when user baseline median is provided (or calibrated), score is >= 85%
      const calibratedResult = scorePitchContour(malePoints, 1, maleMedian);
      expect(calibratedResult.matchScore).toBeGreaterThanOrEqual(85);
    });
  });

  // =========================================================================
  // Dimension 2: Degenerate Contours (Flat Tone 4 & Reverse Tone 2)
  // =========================================================================
  describe('2. Degenerate Contours & Adversarial Inputs', () => {
    it('adversarially evaluates flat pitch against Tone 4 (falling curve)', () => {
      const median = 180;

      // User speaks flat at median (180 Hz, Chao 3.0) for Tone 4 (which requires 5.0 -> 1.0)
      const flatPoints = generateFlatPitchPoints(180, 3.0, 50);
      const result = scorePitchContour(flatPoints, 4, median);

      console.log('FLAT TONE 4 SCORE CHECK: matchScore =', result.matchScore, 'feedback =', result.feedbackVi);

      // User prompt requirement: "feed flat pitch to Tone 4 (should yield low score < 40% and advice to drop pitch)"
      expect(
        result.matchScore,
        `CRITICAL VULNERABILITY: Flat pitch on Tone 4 received passing score ${result.matchScore}% (must be < 40%). Flat pitch was granted 50% slope score due to unhandled zero variance in Pearson correlation.`
      ).toBeLessThan(40);

      // Verify that feedback guides user to drop pitch
      expect(
        result.feedbackVi.includes('rơi') ||
        result.feedbackVi.includes('dội') ||
        result.feedbackVi.includes('đáy') ||
        result.feedbackVi.includes('hạ giọng'),
        `CRITICAL VULNERABILITY: Feedback failed to advise user to drop/dội pitch on Tone 4, instead got: "${result.feedbackVi}"`
      ).toBe(true);

      // Verify detectedTone is NOT Tone 4
      expect(result.detectedTone).not.toBe(4);
    });

    it('tests flat high pitch (Chao 5.0 flat) against Tone 4', () => {
      const median = 180;
      // High flat voice (around 254.5 Hz, Chao 5.0)
      const flatHighPoints = generateFlatPitchPoints(median * Math.SQRT2, 5.0, 50);
      const result = scorePitchContour(flatHighPoints, 4, median);

      // User starts high but never falls
      expect(result.detectedTone).not.toBe(4);
      expect(result.matchScore).toBeLessThan(65);
    });

    it('penalizes reverse contour against Tone 2 (falling instead of rising)', () => {
      const median = 180;

      // Generate a falling contour (Tone 4 like: 5.0 -> 1.0) when target is Tone 2 (3.0 -> 5.0)
      const fallingPoints = generateSyntheticPitchPoints(4, median, 50);
      const result = scorePitchContour(fallingPoints, 2, median);

      // Falling contour has negative correlation with rising contour
      expect(result.slopeCorrelation).toBeLessThan(-0.5);

      // Match score must be severely low (< 40%)
      expect(result.matchScore).toBeLessThan(40);

      // Detected tone should be Tone 4, not Tone 2
      expect(result.detectedTone).not.toBe(2);

      // Feedback should indicate wrong direction or advise rising
      expect(
        result.feedbackVi.includes('nâng') ||
        result.feedbackVi.includes('vuốt') ||
        result.feedbackVi.includes('bổng') ||
        result.feedbackVi.includes('Thanh 4') ||
        result.feedbackVi.includes('điều chỉnh hướng giọng')
      ).toBe(true);
    });

    it('penalizes inverted Tone 3 (peaking instead of dipping)', () => {
      const median = 180;
      const points: PitchRecordPoint[] = [];

      // Inverted Tone 3: rises in middle, then falls at end
      for (let i = 0; i < 50; i++) {
        const t = i / 49;
        // Target is dipping: 2.14 -> 1.0 -> 4.0
        // Inverted: rises from 3.0 up to 5.0, then drops to 2.0
        const invertedChao = t < 0.5 ? 3.0 + 4.0 * t : 5.0 - 6.0 * (t - 0.5);
        const clampedChao = Math.max(1.0, Math.min(5.0, invertedChao));
        const semitones = (clampedChao - 3.0) * 3.0;
        const f0 = median * Math.pow(2, semitones / 12.0);

        points.push({
          timeMs: i * 20,
          f0,
          chaoLevel: clampedChao,
          rms: 0.3,
          clarity: 0.95,
          isVoiced: true,
        });
      }

      const result = scorePitchContour(points, 3, median);

      // Match score must be low (< 55)
      expect(result.matchScore).toBeLessThan(55);
      expect(result.detectedTone).not.toBe(3);
    });
  });

  // =========================================================================
  // Dimension 3: Rapid Recording Toggles & Async Concurrency
  // =========================================================================
  describe('3. Rapid Recording Toggles & Concurrency in usePitchDetector', () => {
    let mockTracks: Array<{ stop: ReturnType<typeof vi.fn> }>;
    let mockStream: any;
    let mockAudioCtx: any;
    let getUserMediaDelayMs = 0;
    let getUserMediaShouldFail = false;

    beforeEach(() => {
      mockTracks = [{ stop: vi.fn() }];
      mockStream = {
        getTracks: vi.fn().mockReturnValue(mockTracks),
      };

      getUserMediaDelayMs = 0;
      getUserMediaShouldFail = false;

      // Mock navigator.mediaDevices.getUserMedia
      if (!navigator.mediaDevices) {
        (navigator as any).mediaDevices = {};
      }
      navigator.mediaDevices.getUserMedia = vi.fn().mockImplementation(() => {
        if (getUserMediaShouldFail) {
          return Promise.reject(new Error('Microphone permission denied'));
        }
        if (getUserMediaDelayMs > 0) {
          return new Promise((resolve) => setTimeout(() => resolve(mockStream), getUserMediaDelayMs));
        }
        return Promise.resolve(mockStream);
      });

      // Mock AudioContext
      mockAudioCtx = {
        sampleRate: 44100,
        state: 'running',
        createMediaStreamSource: vi.fn().mockReturnValue({
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
        createAnalyser: vi.fn().mockReturnValue({
          fftSize: 2048,
          smoothingTimeConstant: 0,
          getFloatTimeDomainData: vi.fn((buf: Float32Array) => buf.fill(0.05)),
        }),
        resume: vi.fn().mockResolvedValue(undefined),
      };

      vi.spyOn(AudioContextManager.getInstance(), 'getOrCreateContext').mockResolvedValue(mockAudioCtx);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('simulates rapid start/stop toggling without unhandled rejections', async () => {
      let hookResult: ReturnType<typeof usePitchDetector> | null = null;

      function TestHarness() {
        hookResult = usePitchDetector({ initialTargetTone: 1 });
        return null;
      }

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      act(() => {
        root.render(React.createElement(TestHarness));
      });

      expect(hookResult).not.null;

      // Perform 5 rapid start/stop cycles synchronously
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          const startPromise = hookResult!.startRecording();
          hookResult!.stopRecording();
          await startPromise;
        }
      });

      // Verify no unhandled errors and state returned to idle
      expect(hookResult!.error).toBeNull();

      act(() => {
        root.unmount();
      });
      container.remove();
    });

    it('proves whether stopRecording during in-flight getUserMedia stops tracks or leaks microphone', async () => {
      getUserMediaDelayMs = 50; // In-flight delay

      let hookResult: ReturnType<typeof usePitchDetector> | null = null;
      function TestHarness() {
        hookResult = usePitchDetector({ initialTargetTone: 2 });
        return null;
      }

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      act(() => {
        root.render(React.createElement(TestHarness));
      });

      // Start recording (which takes 50ms to resolve getUserMedia)
      let startPromise: Promise<void>;
      act(() => {
        startPromise = hookResult!.startRecording();
      });

      // User immediately clicks Stop before getUserMedia resolves
      act(() => {
        hookResult!.stopRecording();
      });

      // Wait for in-flight getUserMedia to resolve
      await act(async () => {
        await startPromise;
      });

      // Inspect if hook became active or stayed inactive
      // If the hook turned active after stop was requested, that confirms a race condition!
      const statusAfterDelayedResolve = hookResult!.isRecording;

      // Check if tracks were stopped
      const wasTrackStopped = mockTracks[0].stop.mock.calls.length > 0;

      act(() => {
        root.unmount();
      });
      container.remove();

      // Log or assert the exact behavior
      console.log('RACE CHECK: statusAfterDelayedResolve =', statusAfterDelayedResolve, 'wasTrackStopped =', wasTrackStopped);
      expect(
        statusAfterDelayedResolve,
        'CRITICAL VULNERABILITY: Hook became isRecording=true after user called stopRecording during in-flight getUserMedia! Microphone recording activated against user command.'
      ).toBe(false);
      expect(
        wasTrackStopped,
        'CRITICAL VULNERABILITY: MediaStreamTrack was NOT stopped when stopRecording was called while getUserMedia was pending! Hardware microphone stream leaked.'
      ).toBe(true);
    });

    it('handles microphone failure gracefully without crash', async () => {
      getUserMediaShouldFail = true;

      let hookResult: ReturnType<typeof usePitchDetector> | null = null;
      function TestHarness() {
        hookResult = usePitchDetector();
        return null;
      }

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      act(() => {
        root.render(React.createElement(TestHarness));
      });

      await act(async () => {
        await hookResult!.startRecording();
      });

      expect(hookResult!.isRecording).toBe(false);
      expect(hookResult!.error).toContain('Microphone');

      act(() => {
        root.unmount();
      });
      container.remove();
    });
  });

  // =========================================================================
  // Dimension 4: Canvas Boundary Stress in PitchVisualizer
  // =========================================================================
  describe('4. Canvas Boundary Stress in PitchVisualizer', () => {
    let container: HTMLDivElement | null = null;
    let root: any = null;
    let mockCtx: any;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);

      mockCtx = {
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
      };

      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx);
      HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        width: 600,
        height: 300,
        top: 0,
        left: 0,
        right: 600,
        bottom: 300,
      });
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

    it('renders cleanly with empty pitch history (0 samples)', () => {
      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 1,
            pitchPoints: [],
            isRecording: false,
          })
        );
      });

      const canvas = container?.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(container?.textContent).toContain('Sẵn sàng ghi âm');
    });

    it('renders safely with single-sample history (1 sample)', () => {
      const singlePoint: PitchRecordPoint = {
        timeMs: 10,
        f0: 220,
        chaoLevel: 3.5,
        rms: 0.2,
        clarity: 0.95,
        isVoiced: true,
      };

      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 2,
            pitchPoints: [singlePoint],
            isRecording: true,
            currentPitch: 220,
            currentRms: 0.2,
          })
        );
      });

      // Should not throw or crash
      expect(container?.querySelector('canvas')).toBeTruthy();
      expect(container?.textContent).toContain('220.0 Hz');
    });

    it('renders cleanly under overflowing history (>500 samples: 1000 samples)', () => {
      const largeHistory: PitchRecordPoint[] = [];
      for (let i = 0; i < 1000; i++) {
        largeHistory.push({
          timeMs: i * 16,
          f0: 150 + Math.sin(i / 10) * 30,
          chaoLevel: 2.5 + Math.sin(i / 10) * 1.5,
          rms: 0.25,
          clarity: 0.92,
          isVoiced: true,
        });
      }

      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 3,
            pitchPoints: largeHistory,
            isRecording: false,
          })
        );
      });

      expect(mockCtx.lineTo).toHaveBeenCalled();
      // Verify lineTo was called for all 1000 points
      expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThanOrEqual(999);

      // Verify that coordinates passed to lineTo are valid finite numbers
      for (const call of mockCtx.lineTo.mock.calls) {
        const [x, y] = call;
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
      }
    });

    it('handles zero-dimension canvas (width=0, height=0) without throwing unhandled error', () => {
      HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      });

      expect(() => {
        act(() => {
          root.render(
            React.createElement(PitchVisualizer, {
              targetTone: 4,
              pitchPoints: [],
              isRecording: false,
            })
          );
        });
      }).not.toThrow();
    });

    it('filters out invalid or unvoiced points cleanly without rendering glitches', () => {
      const dirtyPoints: PitchRecordPoint[] = [
        { timeMs: 0, f0: 0, chaoLevel: 0, rms: 0, clarity: 0, isVoiced: false },
        { timeMs: 16, f0: 200, chaoLevel: 3.5, rms: 0.2, clarity: 0.9, isVoiced: true },
        { timeMs: 32, f0: -50, chaoLevel: -1, rms: 0, clarity: 0, isVoiced: false },
        { timeMs: 48, f0: 9999, chaoLevel: 10, rms: 0, clarity: 0, isVoiced: true }, // Chao out of range (>5.0)
        { timeMs: 64, f0: 220, chaoLevel: 4.0, rms: 0.25, clarity: 0.95, isVoiced: true },
      ];

      act(() => {
        root.render(
          React.createElement(PitchVisualizer, {
            targetTone: 1,
            pitchPoints: dirtyPoints,
            isRecording: false,
          })
        );
      });

      // Only the 2 valid voiced points within Chao [1, 5] should be connected
      // 5 horizontal grid lines + 99 target tone steps + 1 user trail lineTo = 105
      expect(mockCtx.lineTo.mock.calls.length).toBe(105);
    });
  });
});
