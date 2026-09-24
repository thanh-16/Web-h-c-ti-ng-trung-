/**
 * SpeechService.ts
 * Dịch vụ phát âm tiếng Trung bản xứ qua Web Speech API (zh-CN)
 * Tích hợp bộ tổng hợp âm cao độ thanh điệu dự phòng (Oscillator Pitch Fallback) qua Web Audio API
 */

import { AudioContextManager } from './audioContext';

export interface SpeechOptions {
  rate?: number;   // Tốc độ đọc: 0.5 (chậm cho người mới) -> 1.0 (chuẩn)
  pitch?: number;  // Cao độ: 0.8 -> 1.2
  volume?: number; // Âm lượng: 0.0 -> 1.0
  lang?: string;   // 'zh-CN' (mặc định)
}

export class SpeechService {
  private static instance: SpeechService | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isVoicesLoaded: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.voices = window.speechSynthesis.getVoices();
    if (this.voices.length > 0) {
      this.isVoicesLoaded = true;
      // Ưu tiên các giọng đọc zh-CN chất lượng cao trên Apple iOS/macOS hoặc Google/Microsoft
      const chineseVoice =
        this.voices.find(
          (v) =>
            (v.lang === 'zh-CN' || v.lang === 'zh_CN' || v.lang.startsWith('zh')) &&
            (v.name.includes('Ting-Ting') ||
              v.name.includes('Mei-Jia') ||
              v.name.includes('Sin-ji') ||
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Premium'))
        ) ||
        this.voices.find((v) => v.lang.startsWith('zh'));

      this.selectedVoice = chineseVoice || null;
    }
  }

  /**
   * Kiểm tra trình duyệt có hỗ trợ Web Speech Synthesis không
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Lấy danh sách giọng đọc tiếng Trung có sẵn
   */
  public getChineseVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith('zh'));
  }

  /**
   * Phát âm văn bản chữ Hán (Từ vựng hoặc Mẫu câu)
   */
  public async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (!text || text.trim() === '') return;

    if (!this.isSupported()) {
      console.warn('[SpeechService] Web Speech API not supported. Falling back to notification.');
      return;
    }

    // Đảm bảo voices đã được nạp
    if (!this.isVoicesLoaded) {
      this.initVoices();
    }

    return new Promise<void>((resolve, reject) => {
      try {
        // Hủy bất kỳ phát âm nào đang dở dang trước đó để tránh nghẽn hàng đợi trên iOS
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'zh-CN';
        utterance.rate = options.rate ?? 0.85; // Tốc độ vừa phải cho người học
        utterance.pitch = options.pitch ?? 1.0;
        utterance.volume = options.volume ?? 1.0;

        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        utterance.onend = () => {
          resolve();
        };

        utterance.onerror = (event) => {
          // 'canceled' và 'interrupted' thường do gọi cancel() chủ động
          if (event.error === 'canceled' || event.error === 'interrupted') {
            resolve();
          } else {
            console.warn('[SpeechService] Utterance error:', event.error);
            resolve();
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[SpeechService] Speak execution error:', err);
        resolve();
      }
    });
  }

  /**
   * Dừng phát âm ngay lập tức
   */
  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Bộ tổng hợp âm thanh thanh điệu mô phỏng cao độ (Oscillator Fallback)
   * Sử dụng Web Audio API để phát âm cao độ chính xác của 4 thanh điệu
   * - Thanh 1: Ngang bằng 55 (400 Hz)
   * - Thanh 2: Lên dốc 35 (300 Hz -> 420 Hz)
   * - Thanh 3: Uốn trầm 214 (280 Hz -> 200 Hz -> 360 Hz)
   * - Thanh 4: Rơi dốc 51 (440 Hz -> 200 Hz)
   */
  public async playToneAcousticModel(tone: 1 | 2 | 3 | 4 | 5, durationMs: number = 700): Promise<void> {
    try {
      const audioCtx = await AudioContextManager.getInstance().getOrCreateContext();
      const now = audioCtx.currentTime;
      const durationSec = durationMs / 1000;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Sử dụng dạng sóng triangle/sine dịu nhẹ, mô phỏng âm thanh thanh quản
      osc.type = 'sine';

      // Tạo đường uốn tần số F0 theo ngũ độ Chao
      switch (tone) {
        case 1: // 55: Cao bằng
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.setValueAtTime(400, now + durationSec);
          break;
        case 2: // 35: Lên dốc
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(430, now + durationSec);
          break;
        case 3: // 214: Xuống đáy rồi uốn lên
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + durationSec * 0.45);
          osc.frequency.exponentialRampToValueAtTime(360, now + durationSec);
          break;
        case 4: // 51: Rơi dốc dứt khoát
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(210, now + durationSec * 0.85);
          break;
        case 5: // Khinh thanh (neutral tone): ngắn, nhẹ
        default:
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.setValueAtTime(300, now + durationSec * 0.5);
          break;
      }

      // Đường bao âm lượng (Envelope ADSR) chống nổ loa
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
      gain.gain.setValueAtTime(0.3, now + durationSec - 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + durationSec);
    } catch (e) {
      console.warn('[SpeechService] playToneAcousticModel error:', e);
    }
  }
}
