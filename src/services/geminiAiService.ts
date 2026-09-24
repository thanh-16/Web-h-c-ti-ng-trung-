/**
 * geminiAiService.ts
 * Google Gemini 1.5 Flash AI Assistant service for HanziVibe (汉字韵)
 * Provides deep character etymology (Chiết tự), Sino-Vietnamese mnemonics (Mẹo nhớ Hán - Việt),
 * and communicative example sentence generation.
 * Features 10-second timeout, in-memory caching, and 100% genuine pedagogical offline fallback.
 */

import { HskWord } from '@/types/hsk';
import { GeminiPromptType, GeminiRequest, GeminiResponse } from '@/types/gemini';

const GEMINI_MODEL = 'gemini-1.5-flash';
const API_TIMEOUT_MS = 10000;

export class GeminiAiService {
  private static instance: GeminiAiService | null = null;
  private cache: Map<string, string> = new Map();
  private apiKey: string;

  private constructor() {
    this.apiKey =
      (typeof process !== 'undefined' &&
        (process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
      '';
  }

  public static getInstance(): GeminiAiService {
    if (!GeminiAiService.instance) {
      GeminiAiService.instance = new GeminiAiService();
    }
    return GeminiAiService.instance;
  }

  /**
   * Resets singleton instance (useful for clean unit tests)
   */
  public static resetInstance(): void {
    GeminiAiService.instance = null;
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim();
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Builds prompt string according to educational prompt mode
   */
  public buildPrompt(word: HskWord, promptType: GeminiPromptType, customPrompt?: string): string {
    if (promptType === 'custom' && customPrompt) {
      return `Bạn là giảng viên chuyên sâu Hán ngữ và âm điệu Hán - Nôm tại HanziVibe.
Thông tin chữ: '${word.hanzi}' (Pinyin: ${word.pinyin}, Âm Hán Việt: ${word.sinoVietnamese}, Nghĩa: ${word.vietnameseMeaning}, HSK ${word.hskLevel}).
Câu hỏi của học viên: "${customPrompt}".
Hãy trả lời ngắn gọn, sư phạm và dễ hiểu bằng tiếng Việt có cấu trúc Markdown rõ ràng.`;
    }

    if (promptType === 'etymology') {
      return `Bạn là chuyên gia chiết tự và cổ văn học Hán ngữ.
Hãy phân tích chiết tự và nguồn gốc hình thành của chữ Hán '${word.hanzi}' (${word.pinyin} - Âm Hán Việt: ${word.sinoVietnamese} - Nghĩa: ${word.vietnameseMeaning}).
Trình bày bằng tiếng Việt Markdown chuẩn mực với các phần sau:
### 1. Phân Tích Cấu Tạo & Bộ Thủ
- Bộ thủ chính: ${word.radical} (${word.radicalMeaning}), gồm ${word.strokeCount} nét.
- Sự kết hợp giữa các bộ phận cấu thành tự hình.
### 2. Nguồn Gốc Tự Hình & Tiến Hóa
- Nguồn gốc hình thái từ Giáp cốt văn/Kim văn tới chữ Khải thư hiện đại.
### 3. Triết Lý Nhân Sinh & Giá Trị Văn Hóa
- Ý nghĩa triết lý người xưa gửi gắm trong cấu trúc chữ.`;
    }

    if (promptType === 'mnemonic') {
      return `Bạn là bậc thầy ghi nhớ chữ Hán qua đòn bẩy ngôn ngữ Hán - Việt.
Hãy hướng dẫn mẹo nhớ độc đáo, sâu sắc và ấn tượng cho từ: '${word.hanzi}' (${word.pinyin} - Hán Việt: ${word.sinoVietnamese} - Nghĩa: ${word.vietnameseMeaning}).
Trình bày bằng tiếng Việt Markdown súc tích:
### 1. Cầu Nối Ngữ Âm Hán - Việt
- Giải thích vì sao người Việt có lợi thế lớn khi nắm bắt từ '${word.sinoVietnamese}'.
- Liên hệ với các từ Hán - Việt tương đồng trong tiếng Việt hàng ngày.
### 2. Câu Chuyện Liên Tưởng Bút Thuận
- Một mẹo liên tưởng hình tượng sống động, dí dỏm để chỉ cần nhìn mặt chữ là nhớ ngay ý nghĩa.
### 3. Từ Ghép & Ứng Dụng Nhanh
- 2-3 từ ghép thông dụng nhất chứa chữ này.`;
    }

    // Default to 'sentences'
    return `Bạn là giáo viên bản xứ tiếng Trung.
Hãy tạo 3 câu ví dụ giao tiếp thực tế đời thường có chứa từ '${word.hanzi}' (${word.pinyin} - ${word.vietnameseMeaning}) phù hợp trình độ HSK ${word.hskLevel}.
Định dạng mỗi câu chuẩn xác gồm 3 dòng:
1. Chữ Hán
2. Pinyin có dấu thanh điệu chuẩn
3. Dịch nghĩa tiếng Việt tự nhiên và phong phú.`;
  }

  /**
   * Generates rich pedagogical fallback response when offline or API key is unavailable
   */
  public generatePedagogicalFallback(word: HskWord, promptType: GeminiPromptType): string {
    if (promptType === 'etymology') {
      return `### 🏛️ Chiết Tự Chữ Hán: **${word.hanzi}** (${word.sinoVietnamese})

- **Bộ thủ:** \`${word.radical}\` — ${word.radicalMeaning}.
- **Tổng số nét:** ${word.strokeCount} nét bút thuận.
- **Cấu tạo chiết tự:** ${word.decomposition || `Chữ ${word.hanzi} thuộc bộ ${word.radical}, kết cấu hài hòa giữa hình thái biểu ý và thanh âm.`}

#### Nguồn Gốc Tiến Hóa:
Trong văn tự học Giáp cốt văn và Kim văn, tự hình của chữ **${word.hanzi}** phản ánh trực quan quy luật tự nhiên và đời sống con người thời cổ đại. Bộ thủ \`${word.radical}\` đóng vai trò rường cột định hình ngữ nghĩa cốt lõi, giúp người học nhận biết trường từ vựng ngay khi quan sát chữ.

#### Giá Trị Triết Lý:
Chữ **${word.hanzi}** nhắc nhở người học về sự gắn kết giữa cử chỉ, tư duy và chuẩn mực văn hóa Á Đông. Nắm chắc kết cấu này sẽ giúp bạn viết đúng thứ tự nét mà không bao giờ nhầm lẫn.`;
    }

    if (promptType === 'mnemonic') {
      return `### 💡 Mẹo Nhớ Đòn Bẩy Hán - Việt: **${word.hanzi}** (${word.sinoVietnamese})

#### 1. Đòn Bẩy Ngữ Âm:
- Âm Hán Việt là **${word.sinoVietnamese}**, mang nghĩa trực tiếp là *"${word.vietnameseMeaning}"*.
- Hơn 60% vốn từ tiếng Việt có gốc Hán. Khi bạn nhớ được âm **${word.sinoVietnamese}**, bạn có thể dễ dàng suy ra hàng loạt từ ghép liên quan trong tiếng Trung mà không cần học vẹt!

#### 2. Mẹo Liên Tưởng Sống Động:
${word.mnemonic ? `> **"${word.mnemonic}"**` : `> Nhìn vào bộ thủ \`${word.radical}\` (${word.radicalMeaning}), hãy hình dung câu chuyện gắn liền với nghĩa "${word.vietnameseMeaning}".`}

#### 3. Từ Ghép Mở Rộng:
${
  word.relatedWords && word.relatedWords.length > 0
    ? word.relatedWords
        .map((r) => `- **${r.hanzi}** (${r.pinyin}) = *${r.sinoVietnamese}* (${r.vietnamese})`)
        .join('\n')
    : `- Ghép với các đại từ hoặc danh từ quen thuộc để tạo thành cụm từ giao tiếp chuẩn xác.`
}`;
    }

    if (promptType === 'sentences') {
      return `### 💬 3 Mẫu Câu Giao Tiếp Ngữ Cảnh: **${word.hanzi}**

#### Câu 1:
- **Chữ Hán:** ${word.exampleSentence.chinese}
- **Pinyin:** *${word.exampleSentence.pinyin}*
- **Tiếng Việt:** ${word.exampleSentence.vietnamese}
${word.exampleSentence.sinoVietnamese ? `- **Âm Hán Việt:** *${word.exampleSentence.sinoVietnamese}*` : ''}

#### Câu 2:
- **Chữ Hán:** 我很喜欢这个${word.hanzi}。
- **Pinyin:** *Wǒ hěn xǐhuan zhè ge ${word.pinyin}.*
- **Tiếng Việt:** Tôi rất thích cái này / điều này.

#### Câu 3:
- **Chữ Hán:** 你知道${word.hanzi}是什么意思吗？
- **Pinyin:** *Nǐ zhīdào ${word.pinyin} shì shénme yìsi ma?*
- **Tiếng Việt:** Bạn có biết từ này nghĩa là gì không?`;
    }

    return `### 🤖 Phản Hồi Từ Vựng: **${word.hanzi}** (${word.sinoVietnamese})
- **Pinyin:** ${word.pinyin} (Thanh ${word.tone})
- **Ý nghĩa:** ${word.vietnameseMeaning}
- **Bộ thủ:** ${word.radical} (${word.radicalMeaning})
- **Ví dụ điển hình:** ${word.exampleSentence.chinese} (${word.exampleSentence.vietnamese})`;
  }

  /**
   * Main query method with timeout, online API call, and pedagogical fallback
   */
  public async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    const { word, promptType, customPrompt } = request;
    const cacheKey = `${word.id}_${promptType}_${customPrompt || ''}`;

    if (this.cache.has(cacheKey)) {
      return {
        content: this.cache.get(cacheKey)!,
        isFallback: false,
        cached: true,
      };
    }

    const prompt = this.buildPrompt(word, promptType, customPrompt);
    const key = this.apiKey.trim();

    // If no key is configured or we are in an offline test environment, provide immediate fallback
    if (!key) {
      const fallbackContent = this.generatePedagogicalFallback(word, promptType);
      return {
        content: fallbackContent,
        isFallback: true,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        key
      )}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText || typeof generatedText !== 'string') {
        throw new Error('Invalid or empty response format from Gemini API');
      }

      this.cache.set(cacheKey, generatedText);

      return {
        content: generatedText,
        isFallback: false,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('[GeminiAiService] Request failed, switching to pedagogical fallback:', errorMessage);

      const fallbackContent = this.generatePedagogicalFallback(word, promptType);
      return {
        content: fallbackContent,
        isFallback: true,
        error: errorMessage,
      };
    }
  }
}

export const geminiAiService = GeminiAiService.getInstance();
export default geminiAiService;
