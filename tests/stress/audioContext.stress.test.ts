import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioContextManager } from '@/services/audioContext';

// Advanced Mock simulating WebKit / iOS Safari AudioContext behaviors
class MockAudioBufferSourceNode {
  buffer: any = null;
  connect = vi.fn();
  start = vi.fn();
}

class ControllableMockAudioContext {
  public static instances: ControllableMockAudioContext[] = [];
  public static constructorCallCount = 0;

  id: number;
  state: 'suspended' | 'running' | 'closed' | 'interrupted' = 'suspended';
  sampleRate: number = 44100;
  destination: any = {};
  resumeDelayMs: number = 0;
  resumeShouldFail: boolean = false;
  createBufferShouldFail: boolean = false;
  resumeCallCount: number = 0;
  createBufferCallCount: number = 0;
  createBufferSourceCallCount: number = 0;
  closeCallCount: number = 0;

  constructor(public options?: AudioContextOptions) {
    ControllableMockAudioContext.constructorCallCount++;
    this.id = ControllableMockAudioContext.constructorCallCount;
    ControllableMockAudioContext.instances.push(this);
  }

  resume = vi.fn().mockImplementation(async () => {
    this.resumeCallCount++;
    if (this.resumeDelayMs > 0) {
      await new Promise((r) => setTimeout(r, this.resumeDelayMs));
    }
    if (this.resumeShouldFail) {
      throw new Error('NotAllowedError: The request is not allowed by the user agent or the platform in the current context.');
    }
    this.state = 'running';
  });

  createBuffer = vi.fn().mockImplementation((channels: number, length: number, sampleRate: number) => {
    this.createBufferCallCount++;
    if (this.createBufferShouldFail) {
      throw new Error(`NotSupportedError: The sample rate ${sampleRate} is not supported on this audio device.`);
    }
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
    };
  });

  createBufferSource = vi.fn().mockImplementation(() => {
    this.createBufferSourceCallCount++;
    return new MockAudioBufferSourceNode();
  });

  close = vi.fn().mockImplementation(async () => {
    this.closeCallCount++;
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

describe('AudioContextManager Empirical Adversarial Stress Suite', () => {
  let originalAudioContext: any;
  let originalWebkitAudioContext: any;

  beforeEach(() => {
    ControllableMockAudioContext.instances = [];
    ControllableMockAudioContext.constructorCallCount = 0;

    originalAudioContext = (window as any).AudioContext;
    originalWebkitAudioContext = (window as any).webkitAudioContext;

    (window as any).AudioContext = ControllableMockAudioContext;
    delete (window as any).webkitAudioContext;
  });

  afterEach(async () => {
    (window as any).AudioContext = originalAudioContext;
    (window as any).webkitAudioContext = originalWebkitAudioContext;
    const manager = AudioContextManager.getInstance();
    try {
      await manager.closeContext();
    } catch {
      // Ignore
    }
    // Hard reset private fields to avoid cross-test pollution
    (manager as any).ctx = null;
    (manager as any).isContextUnlocked = false;
    (manager as any).unlockListenersAttached = false;
  });

  // =========================================================================
  // VULNERABILITY 1: API Surface Contract Mismatch
  // =========================================================================
  describe('Vulnerability 1: Missing unlockAudioContext() Method', () => {
    it('verifies unlockAudioContext() presence as specified in mission directives', () => {
      const manager = AudioContextManager.getInstance();
      const hasUnlock = typeof (manager as any).unlockAudioContext === 'function';
      // Mission explicitly specifies testing unlockAudioContext()
      expect(hasUnlock, 'CRITICAL: unlockAudioContext() is missing on AudioContextManager!').toBe(true);
    });
  });

  // =========================================================================
  // VULNERABILITY 2: In-Flight closeContext() Null Dereference Race Condition
  // =========================================================================
  describe('Vulnerability 2: Concurrency Race Condition during closeContext()', () => {
    it('proves in-flight getOrCreateContext() resolves to null and crashes playSilentBuffer', async () => {
      const manager = AudioContextManager.getInstance();

      (window as any).AudioContext = class extends ControllableMockAudioContext {
        constructor(opts?: AudioContextOptions) {
          super(opts);
          this.resumeDelayMs = 40; // Simulate 40ms audio DAC wake-up latency
        }
      };

      // Call 1 initiates context creation
      const inflightPromise = manager.getOrCreateContext();

      // Call 2 initiates closeContext() while resume() is pending
      await new Promise((r) => setTimeout(r, 10));
      await manager.closeContext();

      // Call 1 completes
      const result = await inflightPromise;

      // In a resilient implementation, getOrCreateContext() must never resolve to null!
      expect(result, 'CRITICAL: getOrCreateContext resolved to null during concurrent closeContext!').not.toBeNull();
      if (result) {
        expect(result.state).not.toBe('closed');
      }
    });
  });

  // =========================================================================
  // VULNERABILITY 3: Poisoned Singleton when Context is Closed by System
  // =========================================================================
  describe('Vulnerability 3: closeContext() Fails to Reset When ctx.state is "closed"', () => {
    it('proves closeContext() skips cleanup if state is already "closed", permanently poisoning singleton', async () => {
      const manager = AudioContextManager.getInstance();
      const ctx = await manager.getOrCreateContext();
      expect(ctx.state).toBe('running');

      // Simulate system closing context (device disconnection, memory reclaim)
      (ctx as any).state = 'closed';

      // Call closeContext() to clean up
      await manager.closeContext();

      // If flawed, line 172 skips cleanup because ctx.state !== 'closed' is false!
      expect(manager.getContext(), 'CRITICAL: closeContext() skipped setting ctx = null because state was "closed"!').toBeNull();
    });
  });

  // =========================================================================
  // VULNERABILITY 4: Dead Context Recovery Failure
  // =========================================================================
  describe('Vulnerability 4: getOrCreateContext() Returns Dead Closed Context', () => {
    it('proves getOrCreateContext() returns dead closed context instead of recreating active one', async () => {
      const manager = AudioContextManager.getInstance();
      const ctx1 = await manager.getOrCreateContext();
      expect(ctx1.state).toBe('running');

      // OS or browser closes context
      (ctx1 as any).state = 'closed';

      // Next user interaction attempts to get or create context
      const ctx2 = await manager.getOrCreateContext();

      // In a resilient implementation, a closed context must NOT be returned!
      expect(ctx2, 'CRITICAL: getOrCreateContext() returned the dead closed context instead of re-instantiating!').not.toBe(ctx1);
      expect(ctx2.state).toBe('running');
    });
  });

  // =========================================================================
  // VULNERABILITY 5: pageshow BFCache Interrupted State Ignored
  // =========================================================================
  describe('Vulnerability 5: pageshow Ignores iOS WebKit "interrupted" State', () => {
    it('proves pageshow event fails to resume audio when state is "interrupted"', async () => {
      const manager = AudioContextManager.getInstance();
      const ctx = await manager.getOrCreateContext();
      const mockCtx = ctx as unknown as ControllableMockAudioContext;

      // User returns from BFCache; on iOS Safari state is 'interrupted'
      mockCtx.state = 'interrupted';
      const initialResumeCount = mockCtx.resumeCallCount;

      // Dispatch pageshow with persisted: true
      const pageShowEvent = new PageTransitionEvent('pageshow', { persisted: true });
      window.dispatchEvent(pageShowEvent);
      await new Promise((r) => setTimeout(r, 10));

      // AudioContextManager line 56 only checks 'suspended', missing 'interrupted'
      expect(
        mockCtx.resumeCallCount,
        'CRITICAL: pageshow event failed to attempt resume on interrupted AudioContext!'
      ).toBeGreaterThan(initialResumeCount);
    });
  });

  // =========================================================================
  // VULNERABILITY 6: setupAutoUnlock Permanent Lockout on Failed First Gesture
  // =========================================================================
  describe('Vulnerability 6: setupAutoUnlock Drops Listener Permanently on Failed Touch', () => {
    it('proves that a failed first touchend permanently loses touchend listener while keeping flag true', async () => {
      let failResume = true;
      let resumeCalls = 0;

      (window as any).AudioContext = class extends ControllableMockAudioContext {
        resume = vi.fn().mockImplementation(async () => {
          resumeCalls++;
          if (failResume) {
            throw new Error('NotAllowedError: Touch cancelled or invalid gesture');
          }
          this.state = 'running';
        });
      };

      const manager = AudioContextManager.getInstance();
      manager.setupAutoUnlock();

      // 1st touch fails
      window.dispatchEvent(new Event('touchend'));
      await new Promise((r) => setTimeout(r, 10));

      expect(resumeCalls).toBe(1);
      expect(manager.isUnlocked()).toBe(false);

      // 2nd touch occurs (valid gesture)
      failResume = false;
      window.dispatchEvent(new Event('touchend'));
      await new Promise((r) => setTimeout(r, 10));

      // If { once: true } consumed the listener, resumeCalls will still be 1!
      expect(
        resumeCalls,
        'CRITICAL: 2nd touchend was ignored! setupAutoUnlock permanently lost touchend listener!'
      ).toBeGreaterThan(1);
    });
  });

  // =========================================================================
  // PASSING BENCHMARKS & ROBUSTNESS TESTS
  // =========================================================================
  describe('Robustness Benchmarks (Positive Behaviors)', () => {
    it('survives 100 simultaneous concurrent getOrCreateContext calls with singleton idempotency', async () => {
      const manager = AudioContextManager.getInstance();
      const promises = Array.from({ length: 100 }, () => manager.getOrCreateContext());
      const contexts = await Promise.all(promises);

      const firstCtx = contexts[0];
      expect(firstCtx).toBeDefined();
      expect(firstCtx.state).toBe('running');

      for (let i = 1; i < contexts.length; i++) {
        expect(contexts[i]).toBe(firstCtx);
      }

      expect(ControllableMockAudioContext.constructorCallCount).toBe(1);
      const mockCtx = firstCtx as unknown as ControllableMockAudioContext;
      expect(mockCtx.createBufferCallCount).toBe(1);
    });

    it('survives simulated 50ms hardware delay with 30 staggered concurrent calls', async () => {
      const manager = AudioContextManager.getInstance();

      (window as any).AudioContext = class extends ControllableMockAudioContext {
        constructor(opts?: AudioContextOptions) {
          super(opts);
          this.resumeDelayMs = 50;
        }
      };

      const results = await Promise.all(
        Array.from({ length: 30 }, async (_, idx) => {
          if (idx % 3 === 0) await new Promise((r) => setTimeout(r, 5));
          return manager.getOrCreateContext();
        })
      );

      expect(results.length).toBe(30);
      expect(ControllableMockAudioContext.constructorCallCount).toBe(1);
    });

    it('recovers from visibilitychange when document becomes visible and state was suspended', async () => {
      const manager = AudioContextManager.getInstance();
      const ctx = await manager.getOrCreateContext();
      const mockCtx = ctx as unknown as ControllableMockAudioContext;

      mockCtx.state = 'suspended';

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      });

      document.dispatchEvent(new Event('visibilitychange'));
      await new Promise((r) => setTimeout(r, 10));

      expect(mockCtx.state).toBe('running');
    });

    it('gracefully handles silent buffer creation failure (createBuffer throws)', async () => {
      const manager = AudioContextManager.getInstance();

      (window as any).AudioContext = class extends ControllableMockAudioContext {
        constructor(opts?: AudioContextOptions) {
          super(opts);
          this.createBufferShouldFail = true;
        }
      };

      const ctx = await manager.getOrCreateContext();
      expect(ctx).toBeDefined();
      expect(ctx.state).toBe('running');
    });

    it('throws clean typed error when Web Audio API is completely unsupported', async () => {
      const manager = AudioContextManager.getInstance();
      delete (window as any).AudioContext;
      delete (window as any).webkitAudioContext;

      await expect(manager.getOrCreateContext()).rejects.toThrow('BROWSER_AUDIO_NOT_SUPPORTED');
      expect(manager.getSampleRate()).toBe(44100);
      expect(manager.isUnlocked()).toBe(false);
      expect(manager.getContext()).toBeNull();
    });

    it('falls back to window.webkitAudioContext if window.AudioContext is absent', async () => {
      const manager = AudioContextManager.getInstance();
      delete (window as any).AudioContext;
      (window as any).webkitAudioContext = ControllableMockAudioContext;

      const ctx = await manager.getOrCreateContext();
      expect(ctx).toBeDefined();
      expect(ctx.state).toBe('running');
      expect(manager.isUnlocked()).toBe(true);
    });

    it('maps getUserMedia errors to descriptive Vietnamese error messages', async () => {
      const manager = AudioContextManager.getInstance();

      (navigator as any).mediaDevices = {
        getUserMedia: vi.fn().mockRejectedValue({ name: 'NotAllowedError' }),
      };
      await expect(manager.requestMicrophoneStream()).rejects.toThrow('PERMISSION_DENIED');

      (navigator as any).mediaDevices.getUserMedia = vi.fn().mockRejectedValue({ name: 'NotFoundError' });
      await expect(manager.requestMicrophoneStream()).rejects.toThrow('NO_MIC_FOUND');

      (navigator as any).mediaDevices.getUserMedia = vi.fn().mockRejectedValue({ name: 'NotReadableError' });
      await expect(manager.requestMicrophoneStream()).rejects.toThrow('MIC_BUSY');
    });
  });
});
