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
  illustrationIcon?: string;        // Icon/Emoji đại diện trực quan, e.g. "👋"
  illustrationUrl?: string;         // URL hình ảnh minh họa thị giác
  illustrationPrompt?: string;      // Mô tả hình ảnh thị giác liên tưởng
  strokeOrderNames?: string[];      // Tên gọi từng nét bút thuận, e.g. ['Phẩy', 'Sổ', 'Mác']
  exampleSentence: ContextSentence; // Mẫu câu ngữ cảnh thực tế
  relatedWords?: Array<{
    hanzi: string;
    pinyin: string;
    sinoVietnamese: string;
    vietnamese: string;
  }>;
}

export interface RoadmapLesson {
  id: string;                     // e.g. "hsk1-u1-l1"
  unitId: string;                 // e.g. "unit-1"
  order: number;                  // Thứ tự bài học trong lộ trình (1, 2, 3...)
  title: string;                  // e.g. "Lời Chào Đầu Tiên"
  subtitle: string;               // e.g. "Làm quen với 你 (Bạn) & 好 (Tốt)"
  icon: string;                   // Emoji/Icon đại diện, e.g. "🤝"
  wordIds: string[];              // Danh sách ID từ vựng thuộc bài này
  goal: string;                   // Mục tiêu bài học: "Chào hỏi người mới gặp & phát âm chuẩn thanh 3"
  isCheckpoint?: boolean;         // Có phải bài thi kiểm tra trạm không
}

export interface RoadmapUnit {
  id: string;                     // e.g. "unit-1"
  number: number;                 // Số chương: 1, 2, 3...
  title: string;                  // e.g. "Khởi Đầu & Chào Hỏi"
  chineseTitle: string;           // e.g. "问候"
  description: string;            // e.g. "Làm quen các đại từ nhân xưng và lời chào thường ngày"
  icon: string;                   // e.g. "👋"
  accentColor: string;            // e.g. "from-amber-500 to-orange-500"
  lessons: RoadmapLesson[];       // Danh sách các bài học trong Unit
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  stars: number;                  // 0 - 3 sao
  completedAt?: string;
  score?: number;
}
