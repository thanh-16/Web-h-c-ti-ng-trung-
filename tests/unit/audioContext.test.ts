import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioContextManager } from '@/services/audioContext';

class MockAudioBufferSourceNode {
  buffer: any = null;
  connect = vi.fn();
  start = vi.fn();
}

class MockAudioContext {
  state: AudioContextState = 'suspended';
  sampleRate: number = 44100;
  destination: any = {};

  resume = vi.fn().mockImplementation(async () => {
    this.state = 'running';
  });

  createBuffer = vi.fn().mockImplementation((channels: number, length: number, sampleRate: number) => ({
    numberOfChannels: channels,
    length,
    sampleRate,
  }));

  createBufferSource = vi.fn().mockImplementation(() => new MockAudioBufferSourceNode());

  close = vi.fn().mockImplementation(async () => {
    this.state = 'closed';
  });

  createMediaStreamSource = vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
  }));

  createAnalyser = vi.fn().mockImplementation(() => ({
    fftSize: 2048,
    smoothingTimeConstant: 0.0,
    connect: vi.fn(),
  }));
}

describe('AudioContextManager (iOS Safari Resilient Audio Engine)', () => {
  let originalAudioContext: any;

  beforeEach(() => {
    originalAudioContext = (window as any).AudioContext;
    (window as any).AudioContext = MockAudioContext;
  });

  afterEach(async () => {
    (window as any).AudioContext = originalAudioContext;
    const manager = AudioContextManager.getInstance();
    await manager.closeContext();
  });

  it('guarantees singleton pattern instance', () => {
    const instanceA = AudioContextManager.getInstance();
    const instanceB = AudioContextManager.getInstance();
    expect(instanceA).toBe(instanceB);
  });

  it('initializes context lazily and unlocks on first request', async () => {
    const manager = AudioContextManager.getInstance();
    expect(manager.getContext()).toBeNull();

    const ctx = await manager.getOrCreateContext();
    expect(ctx).toBeDefined();
    expect(ctx.state).toBe('running');
    expect(manager.isUnlocked()).toBe(true);
    expect(manager.getSampleRate()).toBe(44100);
  });

  it('handles repeated getOrCreateContext without recreating context', async () => {
    const manager = AudioContextManager.getInstance();
    const ctx1 = await manager.getOrCreateContext();
    const ctx2 = await manager.getOrCreateContext();
    expect(ctx1).toBe(ctx2);
  });

  it('closes context and resets state when requested', async () => {
    const manager = AudioContextManager.getInstance();
    const ctx = await manager.getOrCreateContext();
    expect(ctx.state).toBe('running');

    await manager.closeContext();
    expect(manager.getContext()).toBeNull();
    expect(manager.isUnlocked()).toBe(false);
  });

  it('safely handles visibilitychange events when resumed', async () => {
    const manager = AudioContextManager.getInstance();
    const ctx = await manager.getOrCreateContext();

    // Giả lập trạng thái background suspended
    ctx.state = 'suspended';

    // Kích hoạt visibilitychange event
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);

    // Không ném exception và xử lý an toàn
    expect(manager.getContext()).not.toBeNull();
  });
});
