/**
 * geminiAiService.ts
 * Google Gemini 1.5 Flash AI Assistant service for HanziVibe (汉字韵)
 * Provides deep character etymology (Chiết tự), Sino-Vietnamese mnemonics (Mẹo nhớ Hán - Việt),
 * and communicative example sentence generation.
 * Features 10-second timeout, in-memory caching, and 100% genuine pedagogical offline fallback.
 */

import { HskWord } from '@/types/hsk';
import {
  GeminiPromptType,
  GeminiRequest,
  GeminiResponse,
  CircleSearchRequest,
  CircleSearchResult,
} from '@/types/gemini';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { HSK1_SENTENCES } from '@/data/hskSentences';

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

  /**
   * Helper to look up character metadata from our curriculum or sentence dataset
   */
  public findLocalWordOrChar(queryText: string): {
    matchedWord?: HskWord;
    charInfo?: { char: string; pinyin: string; sinoVietnamese: string; meaning: string };
  } {
    const trimmed = queryText.trim();
    if (!trimmed) return {};

    // 1. Exact match in HSK Curriculum
    const exactWord = HSK_CURRICULUM.find((w) => w.hanzi === trimmed);
    if (exactWord) {
      return { matchedWord: exactWord };
    }

    // 2. Substring match (e.g. single character inside multi-char word)
    if (trimmed.length === 1) {
      const subWord = HSK_CURRICULUM.find((w) => w.hanzi.includes(trimmed));
      if (subWord) {
        return { matchedWord: subWord };
      }
    }

    // 3. Match in HSK 1 Sentences character breakdown
    for (const sent of HSK1_SENTENCES) {
      const foundChar = sent.characters.find((c) => c.char === trimmed);
      if (foundChar) {
        return { charInfo: foundChar };
      }
    }

    return {};
  }

  /**
   * Builds pedagogical prompt specifically for Circle-to-Search queries
   */
  public buildCircleSearchPrompt(request: CircleSearchRequest): string {
    const { queryText, contextSentence, promptMode = 'explain', customQuestion } = request;
    const { matchedWord, charInfo } = this.findLocalWordOrChar(queryText);

    const baseInfo = matchedWord
      ? `Từ vựng HSK: '${matchedWord.hanzi}' (Pinyin: ${matchedWord.pinyin}, Hán Việt: ${matchedWord.sinoVietnamese}, Nghĩa: ${matchedWord.vietnameseMeaning}, Bộ thủ: ${matchedWord.radical})`
      : charInfo
      ? `Chữ Hán: '${charInfo.char}' (Pinyin: ${charInfo.pinyin}, Hán Việt: ${charInfo.sinoVietnamese}, Nghĩa: ${charInfo.meaning})`
      : `Chữ/Từ Hán được khoanh: '${queryText}'`;

    const contextPart = contextSentence
      ? `\nNgữ cảnh trong câu người học đang đọc: "${contextSentence}".`
      : '';

    if (promptMode === 'custom' && customQuestion) {
      return `Bạn là giảng viên Hán ngữ chuyên sâu tại HanziVibe.
Người học vừa khoanh tròn chữ/từ: "${queryText}".${contextPart}
Thông tin nền tảng: ${baseInfo}.
Câu hỏi cụ thể của người học: "${customQuestion}".
Hãy giải đáp chi tiết, súc tích, mang tính sư phạm và dễ hiểu bằng tiếng Việt có định dạng Markdown chuẩn.`;
    }

    const isSentence = queryText.trim().length > 3 || /[。！？!?,，]/.test(queryText);

    if (isSentence && (promptMode === 'explain' || promptMode === 'sentences')) {
      return `Bạn là trợ lý giảng viên Hán ngữ cao cấp tại HanziVibe.
Người học vừa KHOANH TRÒN toàn bộ CÂU / CỤM TỪ sau trong tài liệu:
"${queryText}"${contextPart}

Hãy cung cấp bản dịch và phân tích sư phạm toàn diện bằng tiếng Việt Markdown chuẩn mực theo bố cục sau:
### 1. Dịch Nghĩa Toàn Câu & Ngữ Cảnh
- **Dịch chuẩn tiếng Việt:** [Bản dịch thoát ý, tự nhiên và chính xác]
- **Âm Hán Việt toàn câu:** [Phiên âm Hán Việt từng từ in hoa]
- **Pinyin toàn câu:** [Pinyin chuẩn kèm thanh điệu]

### 2. Phân Tích Cấu Trúc Ngữ Pháp Then Chốt
- Điểm ngữ pháp cốt lõi trong câu (trật tự từ, hư từ, phó từ, biến điệu thanh điệu nếu có).
- Bóc tách các từ vựng chính trong câu.

### 3. Câu Ví Dụ Minh Họa Tương Đồng
Hãy cung cấp 2-3 câu ví dụ tương đồng minh họa cách áp dụng cấu trúc ngữ pháp này trong giao tiếp hàng ngày. Mỗi ví dụ gồm:
- **Chữ Hán:** ...
- **Pinyin:** ...
- **Dịch nghĩa:** ...`;
    }

    if (promptMode === 'etymology') {
      return `Bạn là chuyên gia chiết tự và cổ văn học Hán ngữ tại HanziVibe.
Người học vừa khoanh tròn chữ/từ: "${queryText}".${contextPart}
Thông tin: ${baseInfo}.
Hãy phân tích sâu về:
1. Bộ thủ và cấu tạo các nét (hội ý, tượng hình, hình thanh).
2. Nguồn gốc hình thành từ tự hình cổ (Giáp cốt văn/Kim văn).
3. Triết lý văn hóa ẩn chứa trong chữ.
Trình bày bằng tiếng Việt Markdown chuẩn mực và cuốn hút.`;
    }

    if (promptMode === 'mnemonic') {
      return `Bạn là bậc thầy ghi nhớ chữ Hán qua đòn bẩy ngữ âm Hán - Việt tại HanziVibe.
Người học vừa khoanh tròn chữ/từ: "${queryText}".${contextPart}
Thông tin: ${baseInfo}.
Hãy cung cấp:
1. Đòn bẩy âm Hán Việt tương đồng trong tiếng Việt hiện đại.
2. Câu chuyện liên tưởng hài hước, hình ảnh hóa để nhìn mặt chữ là nhớ ngay.
3. 2-3 từ ghép thông dụng nhất có chứa chữ này.
Trình bày bằng tiếng Việt Markdown súc tích.`;
    }

    if (promptMode === 'sentences') {
      return `Bạn là giáo viên bản xứ tiếng Trung tại HanziVibe.
Người học vừa khoanh tròn chữ/từ: "${queryText}".${contextPart}
Thông tin: ${baseInfo}.
Hãy tạo 3 câu ví dụ giao tiếp thực tế đời thường có chứa từ "${queryText}".
Định dạng mỗi câu chuẩn xác gồm 3 dòng:
1. Chữ Hán
2. Pinyin có dấu thanh điệu chuẩn
3. Dịch nghĩa tiếng Việt tự nhiên và phong phú.`;
    }

    // Default 'explain' mode for words:
    return `Bạn là trợ lý AI thông minh về ngôn ngữ tiếng Trung của HanziVibe.
Người học vừa KHOANH TRÒN chữ/từ: "${queryText}".${contextPart}
Thông tin gợi ý: ${baseInfo}.

Hãy giải thích toàn diện bằng tiếng Việt Markdown theo bố cục sau:
### 1. Thông Tin Ngữ Âm & Ý Nghĩa
- **Pinyin:** [Pinyin kèm thanh điệu]
- **Âm Hán Việt:** [Âm Hán Việt in hoa]
- **Ý nghĩa cốt lõi:** [Nghĩa tiếng Việt]
- **Ý nghĩa trong ngữ cảnh vừa khoanh:** [Giải thích sắc thái trong câu nếu có câu ngữ cảnh]

### 2. Cấu Tạo & Bộ Thủ
- Bộ thủ chính, số nét và cách nhận diện.

### 3. Mẹo Nhớ Đòn Bẩy Hán - Việt
- Một mẹo liên tưởng ngắn gọn giúp nhớ ngay mặt chữ.

### 4. Ví Dụ Ứng Dụng Nhanh
- 1-2 cụm từ hoặc câu ví dụ ngắn gọn, gần gũi.`;
  }

  /**
   * Generates genuine pedagogical fallback for Circle-to-Search queries
   */
  public generateCircleSearchFallback(request: CircleSearchRequest): CircleSearchResult {
    const { queryText, contextSentence, promptMode = 'explain' } = request;
    const trimmed = queryText.trim();
    const isSentence = trimmed.length > 3 || /[。！？!?,，]/.test(trimmed);
    const targetType: 'word' | 'sentence' = isSentence ? 'sentence' : 'word';

    const { matchedWord, charInfo } = this.findLocalWordOrChar(trimmed);

    // Check if queryText matches an HSK 1 sentence
    const matchedSentence = HSK1_SENTENCES.find(
      (s) => s.chinese === trimmed || trimmed.includes(s.chinese) || s.chinese.includes(trimmed)
    );

    let pinyin = matchedWord?.pinyin || charInfo?.pinyin;
    let sinoVietnamese = matchedWord?.sinoVietnamese || charInfo?.sinoVietnamese;
    let vietnameseMeaning = matchedWord?.vietnameseMeaning || charInfo?.meaning;
    let explanation = '';
    const examples: Array<{ chinese: string; pinyin: string; vietnamese: string }> = [];

    if (matchedSentence && isSentence) {
      pinyin = matchedSentence.pinyin;
      sinoVietnamese = matchedSentence.sinoVietnamese;
      vietnameseMeaning = matchedSentence.vietnamese;

      explanation = `### 🔍 Dịch & Phân Tích Câu Được Khoanh: **${matchedSentence.chinese}**

- **Dịch nghĩa tiếng Việt:** **"${matchedSentence.vietnamese}"**
- **Âm Hán Việt:** **${matchedSentence.sinoVietnamese}**
- **Pinyin:** *${matchedSentence.pinyin}*
- **Chủ đề giao tiếp:** \`${matchedSentence.category}\`

#### 💡 Điểm Ngữ Pháp Cốt Lõi:
> ${matchedSentence.grammarTip || 'Cấu trúc khẩu ngữ thông dụng trong giao tiếp hàng ngày.'}

#### 📚 Bóc Tách Từ Vựng Trong Câu:
${matchedSentence.characters.map((c) => `- **${c.char}** (${c.pinyin} - *${c.sinoVietnamese}*): ${c.meaning}`).join('\n')}

#### 📖 Câu Ví Dụ Minh Họa Mở Rộng:
1. **${matchedSentence.chinese}** (*${matchedSentence.pinyin}*): ${matchedSentence.vietnamese}
2. **今天很高兴见到你。** (*Jīntiān hěn gāoxìng jiàn dào nǐ.*): Hôm nay rất vui được gặp bạn.`;

      examples.push({
        chinese: matchedSentence.chinese,
        pinyin: matchedSentence.pinyin,
        vietnamese: matchedSentence.vietnamese,
      });
      examples.push({
        chinese: '今天很高兴见到你。',
        pinyin: 'Jīntiān hěn gāoxìng jiàn dào nǐ.',
        vietnamese: 'Hôm nay rất vui được gặp bạn.',
      });
    } else if (matchedWord) {
      pinyin = matchedWord.pinyin;
      sinoVietnamese = matchedWord.sinoVietnamese;
      vietnameseMeaning = matchedWord.vietnameseMeaning;

      if (promptMode === 'etymology') {
        explanation = this.generatePedagogicalFallback(matchedWord, 'etymology');
      } else if (promptMode === 'mnemonic') {
        explanation = this.generatePedagogicalFallback(matchedWord, 'mnemonic');
      } else if (promptMode === 'sentences') {
        explanation = this.generatePedagogicalFallback(matchedWord, 'sentences');
      } else {
        explanation = `### 🔍 Phân Tích Chữ Được Khoanh: **${matchedWord.hanzi}** (${matchedWord.sinoVietnamese})

- **Pinyin:** \`${matchedWord.pinyin}\` (Thanh ${matchedWord.tone})
- **Âm Hán Việt:** **${matchedWord.sinoVietnamese}**
- **Nghĩa tiếng Việt:** ${matchedWord.vietnameseMeaning}
- **Bộ thủ:** \`${matchedWord.radical}\` (${matchedWord.radicalMeaning}) — Gồm ${matchedWord.strokeCount} nét.
${contextSentence ? `- **Ngữ cảnh câu:** *"${contextSentence}"*` : ''}

#### 💡 Mẹo Nhớ Đòn Bẩy Hán - Việt:
${matchedWord.mnemonic ? `> **"${matchedWord.mnemonic}"**` : `> Nhìn bộ thủ \`${matchedWord.radical}\` liên hệ với âm Hán Việt **${matchedWord.sinoVietnamese}** để nhớ lâu.`}

#### 🏛️ Chiết Tự Cổ Văn:
${matchedWord.decomposition || `Chữ ${matchedWord.hanzi} có kết cấu hài hòa giữa yếu tố hình thái và ngữ nghĩa.`}

#### 💬 Câu Ví Dụ Minh Họa:
- **Chữ Hán:** ${matchedWord.exampleSentence.chinese}
- **Pinyin:** *${matchedWord.exampleSentence.pinyin}*
- **Tiếng Việt:** ${matchedWord.exampleSentence.vietnamese}`;
      }

      examples.push({
        chinese: matchedWord.exampleSentence.chinese,
        pinyin: matchedWord.exampleSentence.pinyin,
        vietnamese: matchedWord.exampleSentence.vietnamese,
      });
      if (matchedWord.relatedWords && matchedWord.relatedWords.length > 0) {
        examples.push({
          chinese: `我很喜欢${matchedWord.relatedWords[0].hanzi}。`,
          pinyin: `Wǒ hěn xǐhuan ${matchedWord.relatedWords[0].pinyin}.`,
          vietnamese: `Tôi rất thích ${matchedWord.relatedWords[0].vietnamese}.`,
        });
      }
    } else if (charInfo) {
      pinyin = charInfo.pinyin;
      sinoVietnamese = charInfo.sinoVietnamese;
      vietnameseMeaning = charInfo.meaning;

      explanation = `### 🔍 Phân Tích Chữ Được Khoanh: **${charInfo.char}** (${charInfo.sinoVietnamese})

- **Pinyin:** \`${charInfo.pinyin}\`
- **Âm Hán Việt:** **${charInfo.sinoVietnamese}**
- **Nghĩa tiếng Việt:** ${charInfo.meaning}
${contextSentence ? `- **Ngữ cảnh trong câu:** *"${contextSentence}"*` : ''}

#### 💡 Mẹo Nhớ Hán - Việt:
- Chữ **${charInfo.char}** có âm Hán Việt là **${charInfo.sinoVietnamese}**. Người Việt dùng từ này rất quen thuộc trong đời sống hàng ngày!
- Nắm vững âm Hán Việt giúp bạn dễ dàng đọc hiểu và liên hệ với các từ ghép mở rộng trong tiếng Trung mà không cần học vẹt.`;

      examples.push({
        chinese: `这个${charInfo.char}很有意思。`,
        pinyin: `Zhè ge ${charInfo.pinyin} hěn yǒu yìsi.`,
        vietnamese: `Chữ này rất thú vị.`,
      });
    } else {
      explanation = `### 🔍 Tra Cứu ${isSentence ? 'Câu' : 'Chữ'} Được Khoanh: **${trimmed}**

- **Nội dung:** ${trimmed}
- **Dạng thức:** ${isSentence ? 'Câu / Mẫu ngữ cảnh' : 'Từ vựng'}
${contextSentence ? `- **Ngữ cảnh xuất hiện:** *"${contextSentence}"*` : ''}

#### 📚 Hướng Dẫn Sư Phạm:
- Đã ghi nhận đoạn văn bản vào phiên học đọc hiểu của bạn.
- Bạn có thể chuyển sang chế độ **"Hỏi AI tùy chỉnh"** để hỏi sâu hơn về cấu trúc ngữ pháp này!`;

      examples.push({
        chinese: trimmed,
        pinyin: pinyin || '...',
        vietnamese: vietnameseMeaning || 'Nội dung đang học',
      });
    }

    return {
      queryText: trimmed,
      targetType,
      matchedWord,
      pinyin: pinyin || (isSentence ? 'Xem toàn câu bên dưới' : 'Tra cứu'),
      sinoVietnamese: sinoVietnamese || (isSentence ? 'DỊCH CÂU' : 'HÁN VIỆT'),
      vietnameseMeaning: vietnameseMeaning || (isSentence ? 'Câu tiếng Trung hoàn chỉnh' : 'Từ vựng được khoanh'),
      aiExplanation: explanation,
      examples,
      isFallback: true,
    };
  }

  /**
   * Queries Gemini AI or local pedagogical engine for an arbitrary circled word/character
   */
  public async queryUnknownWord(request: CircleSearchRequest): Promise<CircleSearchResult> {
    const { queryText, contextSentence, promptMode = 'explain', customQuestion } = request;
    const cacheKey = `circle_${queryText}_${promptMode}_${customQuestion || ''}_${contextSentence || ''}`;

    const { matchedWord, charInfo } = this.findLocalWordOrChar(queryText);
    const pinyin = matchedWord?.pinyin || charInfo?.pinyin;
    const sinoVietnamese = matchedWord?.sinoVietnamese || charInfo?.sinoVietnamese;
    const vietnameseMeaning = matchedWord?.vietnameseMeaning || charInfo?.meaning;

    if (this.cache.has(cacheKey)) {
      return {
        queryText,
        matchedWord,
        pinyin,
        sinoVietnamese,
        vietnameseMeaning,
        aiExplanation: this.cache.get(cacheKey)!,
        isFallback: false,
        cached: true,
      };
    }

    const key = this.apiKey.trim();
    if (!key) {
      return this.generateCircleSearchFallback(request);
    }

    const prompt = this.buildCircleSearchPrompt(request);
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

      const fallbackDefaults = this.generateCircleSearchFallback(request);

      return {
        queryText,
        targetType: fallbackDefaults.targetType,
        matchedWord,
        pinyin: pinyin || fallbackDefaults.pinyin,
        sinoVietnamese: sinoVietnamese || fallbackDefaults.sinoVietnamese,
        vietnameseMeaning: vietnameseMeaning || fallbackDefaults.vietnameseMeaning,
        aiExplanation: generatedText,
        examples: fallbackDefaults.examples,
        isFallback: false,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('[GeminiAiService] Circle query failed, switching to pedagogical fallback:', errorMessage);

      const fallback = this.generateCircleSearchFallback(request);
      fallback.error = errorMessage;
      return fallback;
    }
  }
}

export const geminiAiService = GeminiAiService.getInstance();
export default geminiAiService;
