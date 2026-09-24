/**
 * tests/stress/yinPitchDetector.stress.test.ts
 * Empirical Adversarial Stress Test Suite for YIN Pitch Detection DSP Engine
 * Target: src/services/yinPitchDetector.ts
 * Author: Challenger M3_1 (critic, specialist)
 *
 * Verification Dimensions:
 * 1. Frequency Bounds & Out-of-Range Rejection (70 Hz sub-vocal, 75 Hz, 500 Hz above-threshold)
 * 2. Human Vocal Range Accuracy (85 Hz deep bass, 130 Hz baritone, 220 Hz tenor, 330 Hz soprano, 440 Hz high soprano)
 * 3. Harmonics & Noise Stress (SNR = 10 dB with 2nd & 3rd harmonics, octave jumping resistance, formant dominance)
 * 4. Silence & Breathing Rejection (RMS < 0.015, digital silence, breathing hiss, high-energy aperiodic noise)
 * 5. Execution Performance Benchmark (100 consecutive frames, average latency < 1.0 ms at 44.1 kHz & 48.0 kHz)
 * 6. Robustness & Boundary Edge Cases (DC offset, zero-length buffer, short buffers, interpolation boundary safety)
 */

import { describe, it, expect } from 'vitest';
import { YinPitchDetector, detectPitch } from '@/services/yinPitchDetector';

/**
 * Generate synthetic sine wave with specified frequency, sample rate, length, and amplitude
 */
function generateSineWave(
  freqHz: number,
  sampleRate: number,
  length: number,
  amplitude: number = 0.8,
  phaseOffset: number = 0
): Float32Array {
  const buffer = new Float32Array(length);
  const angularFreq = (2 * Math.PI * freqHz) / sampleRate;
  for (let i = 0; i < length; i++) {
    buffer[i] = amplitude * Math.sin(angularFreq * i + phaseOffset);
  }
  return buffer;
}

/**
 * Generate complex tone with fundamental (H1), 2nd (H2), and 3rd (H3) harmonics
 * plus additive Gaussian white noise at specified target SNR in dB.
 * Uses a deterministic linear congruential generator for 100% reproducible test runs.
 */
function generateHarmonicSignalWithNoise(
  f0: number,
  sampleRate: number,
  length: number,
  h1Amp: number = 0.6,
  h2Amp: number = 0.35,
  h3Amp: number = 0.18,
  targetSnrDb: number = 10,
  seed: number = 12345
): { buffer: Float32Array; signalRms: number; noiseRms: number; snrDb: number } {
  const buffer = new Float32Array(length);
  const signal = new Float32Array(length);
  const noise = new Float32Array(length);

  const w1 = (2 * Math.PI * f0) / sampleRate;
  const w2 = (2 * Math.PI * 2 * f0) / sampleRate;
  const w3 = (2 * Math.PI * 3 * f0) / sampleRate;

  let signalSumSq = 0;
  for (let i = 0; i < length; i++) {
    const val =
      h1Amp * Math.sin(w1 * i) +
      h2Amp * Math.sin(w2 * i + 0.3) +
      h3Amp * Math.sin(w3 * i + 0.7);
    signal[i] = val;
    signalSumSq += val * val;
  }
  const signalRms = Math.sqrt(signalSumSq / length);

  // Target noise RMS for given SNR (dB)
  const targetNoiseRms = signalRms / Math.pow(10, targetSnrDb / 20);

  // Deterministic LCG random generator for reproducible Gaussian noise
  let currentSeed = seed;
  const lcgRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  // Box-Muller transform for Gaussian white noise
  let noiseSumSq = 0;
  for (let i = 0; i < length; i += 2) {
    const u1 = Math.max(1e-10, lcgRandom());
    const u2 = lcgRandom();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    noise[i] = z0;
    noiseSumSq += z0 * z0;
    if (i + 1 < length) {
      noise[i + 1] = z1;
      noiseSumSq += z1 * z1;
    }
  }
  const rawNoiseRms = Math.sqrt(noiseSumSq / length);
  const scale = targetNoiseRms / (rawNoiseRms || 1);

  let finalNoiseSumSq = 0;
  for (let i = 0; i < length; i++) {
    const scaledNoise = noise[i] * scale;
    finalNoiseSumSq += scaledNoise * scaledNoise;
    buffer[i] = signal[i] + scaledNoise;
  }
  const actualNoiseRms = Math.sqrt(finalNoiseSumSq / length);
  const actualSnrDb = 20 * Math.log10(signalRms / actualNoiseRms);

  return { buffer, signalRms, noiseRms: actualNoiseRms, snrDb: actualSnrDb };
}

describe('YinPitchDetector Empirical Adversarial Stress Suite', () => {
  const sampleRate = 44100;
  const bufferSize = 2048;

  // =========================================================================
  // 1. FREQUENCY BOUNDS TESTING & ADVERSARIAL FAILURE MODES
  // =========================================================================
  describe('1. Frequency Bounds Testing & Adversarial Failure Modes', () => {
    it('1.1 rejects 70 Hz sub-vocal tone (below human vocal minimum of 80 Hz)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = generateSineWave(70, sampleRate, bufferSize, 0.7);

      const result = detector.detectPitch(buffer);

      // Sub-vocal tone at 70 Hz has tau = 630 > maxLag (551).
      // It must be rejected as unvoiced (isVoiced === false, f0 === 0).
      expect(
        result.isVoiced,
        `CRITICAL VULNERABILITY: 70 Hz tone was falsely accepted as voiced (f0=${result.f0}, clarity=${result.clarity.toFixed(3)})!`
      ).toBe(false);
      expect(result.f0, `CRITICAL VULNERABILITY: 70 Hz tone falsely detected as ${result.f0} Hz!`).toBe(0);
    });

    it('1.2 rejects 75 Hz sub-vocal tone (boundary truncation false voiced detection)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = generateSineWave(75, sampleRate, bufferSize, 0.7);

      const result = detector.detectPitch(buffer);

      expect(
        result.isVoiced,
        `CRITICAL VULNERABILITY: 75 Hz tone was falsely accepted as voiced (f0=${result.f0}, clarity=${result.clarity.toFixed(3)})!`
      ).toBe(false);
      expect(result.f0, `CRITICAL VULNERABILITY: 75 Hz tone falsely detected as ${result.f0} Hz!`).toBe(0);
    });

    it('1.3 rejects or prevents octave halving for 500 Hz tone (above human vocal threshold of 450 Hz)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = generateSineWave(500, sampleRate, bufferSize, 0.7);

      const result = detector.detectPitch(buffer);

      // 500 Hz is above maxFrequency (450 Hz).
      // Naive minLag = 98 skips the true fundamental period (88 samples) and latches onto 2*tau = 176 samples (250 Hz).
      expect(
        result.f0,
        `CRITICAL VULNERABILITY: 500 Hz tone suffered octave halving to ${result.f0} Hz with clarity ${result.clarity.toFixed(3)}!`
      ).not.toBeCloseTo(250, 0);

      expect(
        result.isVoiced,
        `CRITICAL VULNERABILITY: 500 Hz tone above vocal range was falsely accepted as voiced with f0=${result.f0}!`
      ).toBe(false);
    });

    it('1.4 rejects 60 Hz low-frequency rumble via boundary truncation check', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = generateSineWave(60, sampleRate, bufferSize, 0.7);

      const result = detector.detectPitch(buffer);

      expect(result.isVoiced).toBe(false);
      expect(result.f0).toBe(0);
    });
  });

  // =========================================================================
  // 2. SYNTHETIC SINE WAVES ACROSS HUMAN VOCAL RANGE
  // =========================================================================
  describe('2. Synthetic Sine Waves Across Human Vocal Range (error < 1.5 Hz)', () => {
    const vocalPitches = [
      { name: 'deep bass male', freq: 85 },
      { name: 'baritone', freq: 130 },
      { name: 'tenor / alto', freq: 220 },
      { name: 'female soprano', freq: 330 },
      { name: 'high soprano', freq: 440 },
    ];

    vocalPitches.forEach(({ name, freq }) => {
      it(`detects ${freq} Hz (${name}) with frequency error < 1.5 Hz and isVoiced === true`, () => {
        const detector = new YinPitchDetector(sampleRate, bufferSize);
        const buffer = generateSineWave(freq, sampleRate, bufferSize, 0.7);

        const result = detector.detectPitch(buffer);
        const error = Math.abs(result.f0 - freq);

        expect(result.isVoiced).toBe(true);
        expect(error).toBeLessThan(1.5);
        expect(result.clarity).toBeGreaterThan(0.90);
      });
    });

    it('maintains high accuracy (< 1.5 Hz error) across intermediate speech frequencies', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const testFreqs = [100, 165, 260, 392];

      testFreqs.forEach((freq) => {
        const buffer = generateSineWave(freq, sampleRate, bufferSize, 0.65);
        const result = detector.detectPitch(buffer);
        expect(result.isVoiced).toBe(true);
        expect(Math.abs(result.f0 - freq)).toBeLessThan(1.5);
      });
    });
  });

  // =========================================================================
  // 3. HARMONICS & NOISE STRESS (OCTAVE JUMPING RESISTANCE)
  // =========================================================================
  describe('3. Harmonics & Noise Stress (SNR = 10 dB, Octave Jumping Resistance)', () => {
    const testCases = [
      { name: 'baritone 130 Hz', f0: 130 },
      { name: 'tenor 220 Hz', f0: 220 },
      { name: 'soprano 330 Hz', f0: 330 },
    ];

    testCases.forEach(({ name, f0 }) => {
      it(`correctly detects fundamental ${f0} Hz (${name}) without octave jumping under SNR = 10 dB`, () => {
        const detector = new YinPitchDetector(sampleRate, bufferSize);
        const { buffer, snrDb } = generateHarmonicSignalWithNoise(
          f0,
          sampleRate,
          bufferSize,
          0.6,  // fundamental H1
          0.35, // 2nd harmonic H2
          0.18, // 3rd harmonic H3
          10.0, // 10 dB SNR
          42 + f0
        );

        const result = detector.detectPitch(buffer);
        const error = Math.abs(result.f0 - f0);

        expect(result.isVoiced).toBe(true);
        // Octave jumping would result in ~2*f0 or ~f0/2. Error must remain within 5% of fundamental
        expect(error).toBeLessThan(f0 * 0.05);
        expect(result.clarity).toBeGreaterThan(0.70);
      });
    });

    it('resists octave doubling when 2nd harmonic is stronger than fundamental (formant peaking)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      // Formant scenario: 2nd harmonic is 1.6x stronger than fundamental
      const { buffer } = generateHarmonicSignalWithNoise(
        160,
        sampleRate,
        bufferSize,
        0.4,  // Fundamental H1 = 0.4
        0.65, // Formant peak H2 = 0.65
        0.2,  // H3 = 0.2
        15.0, // 15 dB SNR
        999
      );

      const result = detector.detectPitch(buffer);

      // Must detect 160 Hz (fundamental), NOT 320 Hz (2nd harmonic)
      expect(result.isVoiced).toBe(true);
      expect(Math.abs(result.f0 - 160)).toBeLessThan(5.0);
      expect(result.f0).toBeLessThan(250); // Hard check against jumping to 320 Hz
    });
  });

  // =========================================================================
  // 4. SILENCE & BREATHING REJECTION
  // =========================================================================
  describe('4. Silence & Breathing Rejection', () => {
    it('rejects pure digital silence (all zeros)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = new Float32Array(bufferSize);

      const result = detector.detectPitch(buffer);

      expect(result.isVoiced).toBe(false);
      expect(result.f0).toBe(0);
      expect(result.clarity).toBe(0);
      expect(result.rms).toBe(0);
    });

    it('rejects low-amplitude white noise (breathing / mic hiss) with RMS < 0.015', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = new Float32Array(bufferSize);

      for (let i = 0; i < bufferSize; i++) {
        buffer[i] = (Math.random() * 2 - 1) * 0.012; // RMS ~ 0.007
      }

      const result = detector.detectPitch(buffer);

      expect(result.rms).toBeLessThan(0.015);
      expect(result.isVoiced).toBe(false);
      expect(result.f0).toBe(0);
      expect(result.clarity).toBe(0);
    });

    it('rejects quiet whisper / breathing audio just below threshold (RMS = 0.014)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = generateSineWave(220, sampleRate, bufferSize, 0.014 * Math.sqrt(2) * 0.95);

      const result = detector.detectPitch(buffer);

      expect(result.rms).toBeLessThan(0.015);
      expect(result.isVoiced).toBe(false);
      expect(result.f0).toBe(0);
    });

    it('rejects high-energy unvoiced aperiodic noise (RMS = 0.08 > 0.015 threshold)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = new Float32Array(bufferSize);

      // Unvoiced fricative / white noise with high RMS
      for (let i = 0; i < bufferSize; i++) {
        buffer[i] = (Math.random() * 2 - 1) * 0.15; // RMS ~ 0.086
      }

      const result = detector.detectPitch(buffer);

      // RMS is high (above VAD), but aperiodic noise must not produce a pitch!
      expect(result.rms).toBeGreaterThan(0.015);
      expect(result.isVoiced).toBe(false);
      expect(result.f0).toBe(0);
    });
  });

  // =========================================================================
  // 5. EXECUTION PERFORMANCE BENCHMARK
  // =========================================================================
  describe('5. Execution Performance Benchmark (< 1.0 ms / frame)', () => {
    it('executes 100 consecutive frames at 44.1 kHz with average latency < 1.0 ms', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = generateSineWave(220, sampleRate, bufferSize, 0.7);

      // Warm-up JIT compiler
      for (let i = 0; i < 15; i++) {
        detector.detectPitch(buffer);
      }

      const frameCount = 100;
      const start = performance.now();
      for (let i = 0; i < frameCount; i++) {
        detector.detectPitch(buffer);
      }
      const totalElapsedMs = performance.now() - start;
      const avgLatencyMs = totalElapsedMs / frameCount;

      console.log(`[Stress 5.1] 44.1 kHz: 100 frames executed in ${totalElapsedMs.toFixed(2)} ms (${avgLatencyMs.toFixed(3)} ms/frame)`);
      expect(avgLatencyMs).toBeLessThan(1.0);
    });

    it('executes 100 consecutive frames at 48.0 kHz (iOS Safari standard) with average latency < 1.0 ms', () => {
      const fs48k = 48000;
      const detector = new YinPitchDetector(fs48k, bufferSize);
      const buffer = generateSineWave(220, fs48k, bufferSize, 0.7);

      for (let i = 0; i < 15; i++) {
        detector.detectPitch(buffer);
      }

      const frameCount = 100;
      const start = performance.now();
      for (let i = 0; i < frameCount; i++) {
        detector.detectPitch(buffer);
      }
      const totalElapsedMs = performance.now() - start;
      const avgLatencyMs = totalElapsedMs / frameCount;

      console.log(`[Stress 5.2] 48.0 kHz: 100 frames executed in ${totalElapsedMs.toFixed(2)} ms (${avgLatencyMs.toFixed(3)} ms/frame)`);
      expect(avgLatencyMs).toBeLessThan(1.0);
    });
  });

  // =========================================================================
  // 6. ROBUSTNESS & BOUNDARY EDGE CASES
  // =========================================================================
  describe('6. Robustness & Boundary Edge Cases', () => {
    it('safely rejects pure DC offset signal (no AC periodicity)', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const buffer = new Float32Array(bufferSize).fill(0.75);

      const result = detector.detectPitch(buffer);

      expect(result.isVoiced).toBe(false);
      expect(result.f0).toBe(0);
    });

    it('safely handles empty buffer (length = 0) without exceptions', () => {
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const emptyBuffer = new Float32Array(0);

      expect(() => {
        const result = detector.detectPitch(emptyBuffer);
        expect(result.isVoiced).toBe(false);
        expect(result.f0).toBe(0);
      }).not.toThrow();
    });

    it('safely handles short buffer sizes (512 and 1024 samples) without out-of-bounds crash', () => {
      const detector = new YinPitchDetector(sampleRate, 2048);

      [512, 1024].forEach((shortLen) => {
        const buffer = generateSineWave(220, sampleRate, shortLen, 0.7);
        expect(() => {
          detector.detectPitch(buffer);
        }).not.toThrow();
      });
    });

    it('proves potential uninitialized read when tauEstimate equals maxLag in parabolic interpolation', () => {
      // In Step 1 & 2, yinBuf is filled from tau = 1 to maxLag.
      // In Step 4, parabolic interpolation reads yinBuf[tauEstimate + 1].
      // When tauEstimate === maxLag, this reads yinBuf[maxLag + 1], which was never computed.
      const detector = new YinPitchDetector(sampleRate, bufferSize);
      const maxLag = Math.floor(sampleRate / 80); // 551

      // Frequency corresponding to maxLag
      const targetFreq = sampleRate / maxLag; // ~80.036 Hz
      const buffer = generateSineWave(targetFreq, sampleRate, bufferSize, 0.7);

      const result = detector.detectPitch(buffer);
      // We observe whether interpolation threw or produced NaN
      expect(Number.isNaN(result.f0)).toBe(false);
      expect(Number.isNaN(result.clarity)).toBe(false);
    });
  });
});
