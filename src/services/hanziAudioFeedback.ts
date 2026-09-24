/**
 * hanziAudioFeedback.ts
 * Real-time Web Audio Synthesizer for Stroke Calligraphy Feedback
 * Generates pleasant chimes, gentle mistake buzzes, and celebratory fanfares
 * using Web Audio Oscillators without external audio asset dependencies.
 */

import { AudioContextManager } from '@/services/audioContext';

export interface AudioFeedbackService {
  playChime: () => Promise<void>;
  playMistakeBuzz: (isBackwards?: boolean) => Promise<void>;
  playVictoryFanfare: () => Promise<void>;
}

class HanziAudioFeedback implements AudioFeedbackService {
  private static instance: HanziAudioFeedback | null = null;
  private isMuted: boolean = false;

  private constructor() {}

  public static getInstance(): HanziAudioFeedback {
    if (!HanziAudioFeedback.instance) {
      HanziAudioFeedback.instance = new HanziAudioFeedback();
    }
    return HanziAudioFeedback.instance;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Pleasant chime sound when a stroke is drawn correctly
   * Harmonious dual-frequency chime (C6: 1046.5 Hz & G6: 1567.98 Hz)
   */
  public async playChime(): Promise<void> {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const manager = AudioContextManager.getInstance();
      const ctx = await manager.getOrCreateContext();
      if (!ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;

      // Note 1: High crisp chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15); // Ramp to E6

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Note 2: Harmonic overtone for shimmering bell quality
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2093.0, now); // C7 harmonic
      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.2);
    } catch {
      // Audio playback fails silently if browser blocks or in mock environment
    }
  }

  /**
   * Gentle buzz sound for mistakes
   * If isBackwards is true: slightly higher caution frequency
   * Filtered through a lowpass filter so it is gentle and pedagogical, not harsh
   */
  public async playMistakeBuzz(isBackwards: boolean = false): Promise<void> {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const manager = AudioContextManager.getInstance();
      const ctx = await manager.getOrCreateContext();
      if (!ctx || ctx.state === 'closed') return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      osc.type = isBackwards ? 'sawtooth' : 'triangle';
      const baseFreq = isBackwards ? 175 : 130;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Fails gracefully
    }
  }

  /**
   * Victory fanfare on character quiz completion
   * Triumphant 4-note ascending chord arpeggio: C5 -> E5 -> G5 -> C6
   */
  public async playVictoryFanfare(): Promise<void> {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const manager = AudioContextManager.getInstance();
      const ctx = await manager.getOrCreateContext();
      if (!ctx || ctx.state === 'closed') return;

      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.16 },  // C5
        { freq: 659.25, time: 0.13, dur: 0.16 }, // E5
        { freq: 783.99, time: 0.26, dur: 0.18 }, // G5
        { freq: 1046.5, time: 0.42, dur: 0.55 }, // C6 (sustained celebration)
      ];

      const startTime = ctx.currentTime;

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime + time);

        gain.gain.setValueAtTime(0.22, startTime + time);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + time);
        osc.stop(startTime + time + dur);
      });
    } catch {
      // Fails gracefully
    }
  }
}

export const hanziAudio = HanziAudioFeedback.getInstance();
export default hanziAudio;
