/**
 * HanziVibe (汉字韵) - HSK Data Type Contracts
 * Full 4-Tier Sino-Vietnamese (Hán - Việt) Knowledge Architecture
 */

export type ToneNumber = 1 | 2 | 3 | 4 | 5;

export interface RadicalInfo {
  character: string;        // Ký tự bộ thủ, e.g. "氵", "亻", "女"
  pinyin: string;           // Phiên âm pinyin, e.g. "shuǐ", "rén"
  sinoVietnamese: string;   // Tên Âm Hán Việt, e.g. "Thủy (Nước)", "Nhân (Người)"
  meaning: string;          // Ý nghĩa biểu trưng của bộ thủ
  strokeCount: number;      // Số nét bút của bộ thủ
}

export interface ContextSentence {
  chinese: string;          // Câu chữ Hán thực tế: "我想在大学学习汉语。"
  pinyin: string;           // Phiên âm có dấu: "Wǒ xiǎng zài dàxué xuéxí hànyǔ."
  vietnamese: string;       // Dịch nghĩa tiếng Việt: "Tôi muốn học tiếng Trung ở trường đại học."
  sinoVietnamese?: string;  // Âm Hán Việt từng chữ tương ứng
}

export interface SingleCharacterInfo {
  char: string;
  pinyin: string;
  tone: ToneNumber;
  sinoVietnamese: string;
  strokeCount: number;
  radical: RadicalInfo;
}

export interface HskWord {
  id: string;                       // e.g. "hsk1-01-nihao"
  hanzi: string;                    // e.g. "你好"
  pinyin: string;                   // e.g. "nǐ hǎo"
  pinyinNumbered: string;           // e.g. "ni3 hao3"
  tone: ToneNumber;                 // Primary tone of character (1-5)
  tones: ToneNumber[];              // Tone of each syllable, e.g. [3, 3]
  sinoVietnamese: string;           // Âm Hán Việt in hoa hoặc thường, e.g. "NHĨ HẢO"
  vietnameseMeaning: string;        // Nghĩa tiếng Việt, e.g. "Xin chào, chào bạn"
  hskLevel: 1 | 2 | 3;              // Cấp độ HSK (1, 2 hoặc 3)
  radical: string;                  // Bộ thủ chính, e.g. "亻"
  radicalMeaning: string;           // Ý nghĩa bộ thủ, e.g. "Bộ Nhân đứng - liên quan đến con người"
  strokeCount: number;              // Tổng số nét viết của chữ chính
  decomposition?: string;           // Cấu tạo chiết tự: "Chữ 你 gồm bộ Nhân đứng (亻) và chữ Nhĩ (尔)"
  mnemonic?: string;                // Mẹo nhớ liên hệ Hán - Việt
  toneAnalysis?: string;            // Phân tích thanh điệu học thuật: "Thanh 3 (214) biến điệu..."
  exampleSentence: ContextSentence; // Mẫu câu ngữ cảnh thực tế
  relatedWords?: Array<{
    hanzi: string;
    pinyin: string;
    sinoVietnamese: string;
    vietnamese: string;
  }>;
}
