/**
 * tests/unit/toneScorer.test.ts
 * Unit tests for Chinese 4 Tones Chao Model, Semitone Normalizer & Pedagogical Scorer
 */

import { describe, it, expect } from 'vitest';
import {
  generateChaoCurve,
  getChaoTargetValue,
  semitoneNormalize,
  calculateMedianF0,
  scorePitchContour,
  PitchRecordPoint,
  TONE_METADATA,
} from '@/services/toneScorer';

describe('Chinese 4 Tones Chao Model & Pitch Normalizer', () => {
  describe('Chao 5-level Tone Curves', () => {
    it('generates Tone 1 (55) as a constant high curve at 5.0', () => {
      const curve = generateChaoCurve(1, 100);
      expect(curve.length).toBe(100);

      // Verify start, middle, and end are all 5.0
      expect(curve[0].chao).toBe(5.0);
      expect(curve[50].chao).toBe(5.0);
      expect(curve[99].chao).toBe(5.0);

      for (const pt of curve) {
        expect(pt.chao).toBe(5.0);
      }
    });

    it('generates Tone 2 (35) as a rising curve from 3.0 to 5.0', () => {
      const curve = generateChaoCurve(2, 100);
      expect(curve.length).toBe(100);

      expect(curve[0].chao).toBe(3.0);
      expect(curve[99].chao).toBe(5.0);

      // Strictly non-decreasing
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i].chao).toBeGreaterThanOrEqual(curve[i - 1].chao);
      }
    });

    it('generates Tone 3 (214) as a dipping curve starting at ~2.14, bottoming at 1.0 around t=0.45, and rising to 4.0', () => {
      const curve = generateChaoCurve(3, 100);
      expect(curve.length).toBe(100);

      // Start near 2.14
      expect(curve[0].chao).toBeCloseTo(2.14, 1);

      // Find the minimum point
      let minChao = 999;
      let minIndex = -1;
      for (let i = 0; i < curve.length; i++) {
        if (curve[i].chao < minChao) {
          minChao = curve[i].chao;
          minIndex = i;
        }
      }

      // Minimum should drop to 1.0 around t ≈ 0.45 (indices 40-50)
      expect(minChao).toBeCloseTo(1.0, 1);
      expect(minIndex).toBeGreaterThanOrEqual(40);
      expect(minIndex).toBeLessThanOrEqual(50);

      // Final point rises to 4.0
      expect(curve[99].chao).toBeCloseTo(4.0, 1);
    });

    it('generates Tone 4 (51) as a falling curve from 5.0 down to 1.0', () => {
      const curve = generateChaoCurve(4, 100);
      expect(curve.length).toBe(100);

      expect(curve[0].chao).toBe(5.0);
      expect(curve[99].chao).toBe(1.0);

      // Strictly non-increasing
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i].chao).toBeLessThanOrEqual(curve[i - 1].chao);
      }
    });

    it('provides metadata for all 4 tones with Vietnamese explanations', () => {
      for (const t of [1, 2, 3, 4] as const) {
        const meta = TONE_METADATA[t];
        expect(meta.tone).toBe(t);
        expect(meta.nameVi).toBeTruthy();
        expect(meta.chaoCode).toBeTruthy();
        expect(meta.descriptionVi).toBeTruthy();
      }
    });
  });

  describe('Gender-Neutral Semitone Normalizer', () => {
    it('normalizes low male voice (median 120 Hz) correctly across Chao 1 to 5', () => {
      const maleMedian = 120;

      // At median -> Chao 3.0
      const midChao = semitoneNormalize(120, maleMedian);
      expect(midChao).toBe(3.0);

      // +6 semitones (120 * sqrt(2) ≈ 169.7 Hz) -> Chao 5.0
      const highChao = semitoneNormalize(120 * Math.SQRT2, maleMedian);
      expect(highChao).toBe(5.0);

      // -6 semitones (120 / sqrt(2) ≈ 84.85 Hz) -> Chao 1.0
      const lowChao = semitoneNormalize(120 / Math.SQRT2, maleMedian);
      expect(lowChao).toBe(1.0);
    });

    it('normalizes high female voice (median 240 Hz) correctly across Chao 1 to 5', () => {
      const femaleMedian = 240;

      // At median -> Chao 3.0
      const midChao = semitoneNormalize(240, femaleMedian);
      expect(midChao).toBe(3.0);

      // +6 semitones (240 * sqrt(2) ≈ 339.4 Hz) -> Chao 5.0
      const highChao = semitoneNormalize(240 * Math.SQRT2, femaleMedian);
      expect(highChao).toBe(5.0);

      // -6 semitones (240 / sqrt(2) ≈ 169.7 Hz) -> Chao 1.0
      const lowChao = semitoneNormalize(240 / Math.SQRT2, femaleMedian);
      expect(lowChao).toBe(1.0);
    });

    it('eliminates pitch difference between male and female speakers for the same musical tone level', () => {
      const maleMedian = 120;
      const femaleMedian = 240;

      // Both speakers singing Tone 1 (+6 semitones relative to their personal baseline)
      const maleChao = semitoneNormalize(120 * Math.SQRT2, maleMedian);
      const femaleChao = semitoneNormalize(240 * Math.SQRT2, femaleMedian);

      expect(maleChao).toBe(5.0);
      expect(femaleChao).toBe(5.0);
      expect(maleChao).toBe(femaleChao);
    });

    it('clamps Chao level within [1.0, 5.0] for extreme frequencies', () => {
      expect(semitoneNormalize(50, 180)).toBe(1.0);
      expect(semitoneNormalize(600, 180)).toBe(5.0);
      expect(semitoneNormalize(0, 180)).toBe(1.0);
    });

    it('calculates median F0 from pitch arrays accurately', () => {
      const pitches = [100, 120, 140, 160, 180];
      expect(calculateMedianF0(pitches)).toBe(140);

      const evenPitches = [100, 120, 140, 160];
      expect(calculateMedianF0(evenPitches)).toBe(130);

      // Filters out out-of-range noise
      const noisyPitches = [30, 120, 150, 800];
      expect(calculateMedianF0(noisyPitches)).toBe(135);
    });
  });

  describe('Tone Scoring & Pedagogical Feedback', () => {
    it('awards high score (>85%) and positive Vietnamese feedback for matching Tone 1 contour', () => {
      const median = 150;
      // Male speaker producing Tone 1 at +6 semitones (approx 212 Hz)
      const targetF0 = median * Math.SQRT2;
      const points: PitchRecordPoint[] = [];

      for (let i = 0; i < 30; i++) {
        // Small natural vibration around targetF0
        const jitter = (Math.sin(i) * 0.5);
        points.push({
          timeMs: i * 40,
          f0: targetF0 + jitter,
          chaoLevel: 5.0,
          rms: 0.25,
          clarity: 0.98,
          isVoiced: true,
        });
      }

      const result = scorePitchContour(points, 1, median);

      expect(result.matchScore).toBeGreaterThanOrEqual(85);
      expect(result.detectedTone).toBe(1);
      expect(result.feedbackVi).toContain('Rất chuẩn');
    });

    it('awards high score (>85%) for matching Tone 4 contour', () => {
      const median = 180;
      const points: PitchRecordPoint[] = [];

      // Tone 4 drops from level 5 to level 1
      for (let i = 0; i < 30; i++) {
        const t = i / 29;
        const targetChao = getChaoTargetValue(4, t);
        // Inverse semitone calculation to produce corresponding F0
        const semitones = ((targetChao - 3.0) / 2.0) * 6.0;
        const f0 = median * Math.pow(2, semitones / 12.0);

        points.push({
          timeMs: i * 40,
          f0,
          chaoLevel: targetChao,
          rms: 0.3,
          clarity: 0.97,
          isVoiced: true,
        });
      }

      const result = scorePitchContour(points, 4, median);

      expect(result.matchScore).toBeGreaterThanOrEqual(85);
      expect(result.detectedTone).toBe(4);
      expect(result.feedbackVi).toContain('Rất chuẩn');
    });

    it('penalizes mismatched contours (e.g. rising contour when target is Tone 4)', () => {
      const median = 180;
      const points: PitchRecordPoint[] = [];

      // Rising contour (Tone 2 like)
      for (let i = 0; i < 30; i++) {
        const t = i / 29;
        const targetChao = getChaoTargetValue(2, t);
        const semitones = ((targetChao - 3.0) / 2.0) * 6.0;
        const f0 = median * Math.pow(2, semitones / 12.0);

        points.push({
          timeMs: i * 40,
          f0,
          chaoLevel: targetChao,
          rms: 0.3,
          clarity: 0.95,
          isVoiced: true,
        });
      }

      const result = scorePitchContour(points, 4, median);

      expect(result.matchScore).toBeLessThan(65);
      expect(result.feedbackVi).toBeTruthy();
    });

    it('handles silence or insufficient audio cleanly', () => {
      const emptyPoints: PitchRecordPoint[] = [];
      const result = scorePitchContour(emptyPoints, 2);

      expect(result.matchScore).toBe(0);
      expect(result.detectedTone).toBeNull();
      expect(result.feedbackVi).toContain('Chưa phát hiện đủ âm thanh');
    });
  });
});
