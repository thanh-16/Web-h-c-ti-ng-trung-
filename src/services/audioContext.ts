/**
 * AudioContextManager.ts
 * Quản lý Singleton Web Audio API & Giải pháp mở khóa (Unlocker) tương thích tuyệt đối iOS Safari
 * Tuân thủ chuẩn WebKit Autoplay Policy & Audio Lifecycle
 */

export interface AudioStreamResult {
  stream: MediaStream;
  sourceNode: MediaStreamAudioSourceNode;
  analyserNode: AnalyserNode;
}

export class AudioContextManager {
  private static instance: AudioContextManager | null = null;
  private ctx: AudioContext | null = null;
  private isContextUnlocked: boolean = false;
  private unlockListenersAttached: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.attachLifecycleListeners();
    }
  }

  /**
   * Truy xuất thể hiện duy nhất (Singleton)
   */
  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  /**
   * Đăng ký các bộ lắng nghe sự kiện vòng đời trình duyệt (iOS Safari app switch & visibility)
   */
  private attachLifecycleListeners(): void {
    if (typeof document === 'undefined') return;

    // Lắng nghe khi người dùng chuyển tab hoặc quay lại app PWA trên iOS Safari
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.ctx) {
        if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
          console.warn('[AudioContextManager] App resumed from background. Audio state:', this.ctx.state);
          // Thử resume lại context
          this.ctx.resume().catch((err) => {
            console.warn('[AudioContextManager] Auto-resume failed, waiting for user gesture:', err);
          });
        }
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', (event) => {
        if (event.persisted && this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  /**
   * Đăng ký tự động lắng nghe cử chỉ chạm/click đầu tiên để mở khóa ngầm
   */
  public setupAutoUnlock(): void {
    if (typeof window === 'undefined' || this.unlockListenersAttached || this.isContextUnlocked) {
      return;
    }

    const unlockHandler = async () => {
      try {
        await this.getOrCreateContext();
        this.removeUnlockListeners(unlockHandler);
      } catch (err) {
        console.warn('[AudioContextManager] Touch auto-unlock attempt:', err);
      }
    };

    const options = { once: true, capture: true, passive: true };
    window.addEventListener('touchend', unlockHandler, options);
    window.addEventListener('click', unlockHandler, options);
    window.addEventListener('keydown', unlockHandler, options);
    this.unlockListenersAttached = true;
  }

  private removeUnlockListeners(handler: EventListener): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('touchend', handler, true);
    window.removeEventListener('click', handler, true);
    window.removeEventListener('keydown', handler, true);
  }

  /**
   * Tạo mới hoặc lấy AudioContext hiện có và mở khóa thông qua 1-sample silent buffer
   * BẮT BUỘC gọi trực tiếp trong call-stack của một sự kiện click hoặc touchend
   */
  public async getOrCreateContext(): Promise<AudioContext> {
    if (typeof window === 'undefined') {
      throw new Error('AudioContext is only available in browser environments.');
    }

    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtxClass) {
      throw new Error('BROWSER_AUDIO_NOT_SUPPORTED: Web Audio API is not supported on this browser.');
    }

    if (!this.ctx) {
      this.ctx = new AudioCtxClass({
        latencyHint: 'interactive',
      });
    }

    // Nếu AudioContext đang bị suspended hoặc interrupted do chính sách iOS WebKit
    if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
      await this.ctx.resume();
    }

    // Phát silent buffer 1 mẫu để kích hoạt Audio Hardware trên chip Apple A-series / M-series
    if (!this.isContextUnlocked) {
      this.playSilentBuffer(this.ctx);
      this.isContextUnlocked = true;
    }

    return this.ctx;
  }

  /**
   * Kỹ thuật iOS Safari Silent Buffer Unlock:
   * Tạo 1 audio buffer rỗng 1-sample rồi phát ngay lập tức để ép phần cứng DAC thức giấc
   */
  private playSilentBuffer(ctx: AudioContext): void {
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.warn('[AudioContextManager] Silent buffer unlock failed:', e);
    }
  }

  /**
   * Kiểm tra AudioContext đã được mở khóa và đang chạy chưa
   */
  public isUnlocked(): boolean {
    return this.isContextUnlocked && this.ctx !== null && this.ctx.state === 'running';
  }

  /**
   * Lấy AudioContext hiện tại (nếu có)
   */
  public getContext(): AudioContext | null {
    return this.ctx;
  }

  /**
   * Lấy Sample Rate chuẩn của phần cứng âm thanh
   */
  public getSampleRate(): number {
    return this.ctx ? this.ctx.sampleRate : 44100;
  }

  /**
   * Đóng AudioContext khi dọn dẹp bộ nhớ hoặc thoát ứng dụng
   */
  public async closeContext(): Promise<void> {
    if (this.ctx && this.ctx.state !== 'closed') {
      await this.ctx.close();
      this.ctx = null;
      this.isContextUnlocked = false;
    }
  }

  /**
   * Yêu cầu quyền truy cập Microphone và trả về Audio Stream Node
   * Cấu hình tối ưu cho việc dò tìm tần số F0 (YIN)
   */
  public async requestMicrophoneStream(): Promise<AudioStreamResult> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('BROWSER_NOT_SUPPORTED: Trình duyệt không hỗ trợ WebRTC/getUserMedia');
    }

    const audioCtx = await this.getOrCreateContext();

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Giữ nguyên phụ âm và âm thanh chi tiết cho thuật toán YIN
          autoGainControl: true,   // Ổn định biên độ cho micro
        },
        video: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const sourceNode = audioCtx.createMediaStreamSource(stream);

      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048; // Đủ để bắt bước sóng 80Hz
      analyserNode.smoothingTimeConstant = 0.0; // Raw real-time frame

      // Quan trọng: KHÔNG nối analyserNode vào audioCtx.destination để tránh rú mic
      sourceNode.connect(analyserNode);

      return { stream, sourceNode, analyserNode };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('PERMISSION_DENIED: Người dùng từ chối quyền microphone. Vui lòng cho phép truy cập mic trong Cài đặt Safari.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('NO_MIC_FOUND: Không tìm thấy thiết bị microphone hợp lệ trên máy.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('MIC_BUSY: Microphone đang bị ứng dụng khác chiếm quyền sử dụng.');
      } else {
        throw new Error(`AUDIO_STREAM_ERROR: ${err.message || 'Lỗi không xác định khi mở microphone.'}`);
      }
    }
  }
}
