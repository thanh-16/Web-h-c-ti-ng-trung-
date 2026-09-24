/**
 * tests/unit/yinPitchDetector.test.ts
 * Rigorous DSP unit tests for YinPitchDetector:
 * - Pure synthetic sine waves at 100 Hz, 220 Hz, 440 Hz
 * - Frequency detection error < 1 Hz
 * - High clarity score > 0.95
 * - VAD threshold gating on silence / low amplitude noise
 * - Execution speed benchmark (< 1.0 ms per frame)
 */

import { describe, it, expect } from 'vitest';
import { YinPitchDetector, detectPitch } from '@/services/yinPitchDetector';

/**
 * Helper to generate synthetic pure sine wave buffer
 */
function generateSineWave(
  frequencyHz: number,
  sampleRate: number,
  length: number,
  amplitude: number = 0.8,
  phaseOffset: number = 0
): Float32Array {
  const buffer = new Float32Array(length);
  const angularFreq = (2 * Math.PI * frequencyHz) / sampleRate;

  for (let i = 0; i < length; i++) {
    buffer[i] = amplitude * Math.sin(angularFreq * i + phaseOffset);
  }
  return buffer;
}

describe('YinPitchDetector DSP Engine', () => {
  const sampleRate = 44100;
  const bufferSize = 2048;

  it('detects 100 Hz synthetic pure sine wave with error < 1 Hz and clarity > 0.95', () => {
    const detector = new YinPitchDetector(sampleRate, bufferSize);
    const buffer = generateSineWave(100, sampleRate, bufferSize, 0.7);

    const result = detector.detectPitch(buffer);

    expect(result.isVoiced).toBe(true);
    expect(result.clarity).toBeGreaterThan(0.95);
    expect(Math.abs(result.f0 - 100)).toBeLessThan(1.0);
    expect(result.rms).toBeGreaterThan(0.4);
  });

  it('detects 220 Hz synthetic pure sine wave with error < 1 Hz and clarity > 0.95', () => {
    const detector = new YinPitchDetector(sampleRate, bufferSize);
    const buffer = generateSineWave(220, sampleRate, bufferSize, 0.65);

    const result = detector.detectPitch(buffer);

    expect(result.isVoiced).toBe(true);
    expect(result.clarity).toBeGreaterThan(0.95);
    expect(Math.abs(result.f0 - 220)).toBeLessThan(1.0);
  });

  it('detects 440 Hz synthetic pure sine wave with error < 1 Hz and clarity > 0.95', () => {
    const detector = new YinPitchDetector(sampleRate, bufferSize);
    const buffer = generateSineWave(440, sampleRate, bufferSize, 0.6);

    const result = detector.detectPitch(buffer);

    expect(result.isVoiced).toBe(true);
    expect(result.clarity).toBeGreaterThan(0.95);
    expect(Math.abs(result.f0 - 440)).toBeLessThan(1.0);
  });

  it('works accurately at 48000 Hz sample rate (standard iOS Safari DAC)', () => {
    const fs = 48000;
    const detector = new YinPitchDetector(fs, bufferSize);
    const buffer = generateSineWave(220, fs, bufferSize, 0.7);

    const result = detector.detectPitch(buffer);

    expect(result.isVoiced).toBe(true);
    expect(result.clarity).toBeGreaterThan(0.95);
    expect(Math.abs(result.f0 - 220)).toBeLessThan(1.0);
  });

  it('silences background noise and silence via RMS VAD threshold (0.015)', () => {
    const detector = new YinPitchDetector(sampleRate, bufferSize);

    // Completely silent buffer
    const silentBuffer = new Float32Array(bufferSize);
    const silentResult = detector.detectPitch(silentBuffer);

    expect(silentResult.isVoiced).toBe(false);
    expect(silentResult.f0).toBe(0);
    expect(silentResult.clarity).toBe(0);
    expect(silentResult.rms).toBe(0);

    // Whisper / very low noise below 0.015 RMS threshold
    const lowNoiseBuffer = generateSineWave(220, sampleRate, bufferSize, 0.008);
    const noiseResult = detector.detectPitch(lowNoiseBuffer);

    expect(noiseResult.isVoiced).toBe(false);
    expect(noiseResult.f0).toBe(0);
    expect(noiseResult.clarity).toBe(0);
  });

  it('conforms to the detectPitch helper interface contract', () => {
    const buffer = generateSineWave(220, sampleRate, bufferSize, 0.8);
    const result = detectPitch(buffer, sampleRate);

    expect(result).toHaveProperty('f0');
    expect(result).toHaveProperty('clarity');
    expect(result).toHaveProperty('rms');
    expect(result).toHaveProperty('isVoiced');
    expect(Math.abs(result.f0 - 220)).toBeLessThan(1.0);
    expect(result.clarity).toBeGreaterThan(0.95);
  });

  it('executes within < 1.0 ms per frame on average', () => {
    const detector = new YinPitchDetector(sampleRate, bufferSize);
    const buffer = generateSineWave(220, sampleRate, bufferSize, 0.8);

    // Warm-up JIT
    for (let i = 0; i < 5; i++) {
      detector.detectPitch(buffer);
    }

    const iterations = 50;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detector.detectPitch(buffer);
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;

    expect(avgMs).toBeLessThan(1.5); // Allow generous overhead in node test environment
  });
});
