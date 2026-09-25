'use client';

import React, { useState, useRef } from 'react';
import { CircleToSearchOverlay, CircleToSearchModal } from '@/components/ai';
import { SpeechService } from '@/services/speechService';
import {
  extractTextFromPdf,
  extractTextFromTxt,
  PdfDocumentResult,
  PdfPageResult,
} from '@/services/pdfTextExtractor';
import { HskWord } from '@/types/hsk';
import {
  BookOpen,
  Volume2,
  Sparkles,
  Edit3,
  Bot,
  Layers,
  ArrowRight,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileUp,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ReadingPassage {
  id: string;
  title: string;
  level: string;
  chinese: string;
  pinyin: string;
  sinoVietnamese: string;
  vietnamese: string;
}

const SAMPLE_PASSAGES: ReadingPassage[] = [
  {
    id: 'passage-01',
    title: 'Gặp gỡ người bạn mới (初次见面)',
    level: 'HSK 1',
    chinese: '你好！很高兴认识你。我是中国人，也是一名学生。你叫什么名字？',
    pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ. Wǒ shì zhōngguó rén, yě shì yī míng xuésheng. Nǐ jiào shénme míngzi?',
    sinoVietnamese: 'Nhĩ hảo! Hấn cao hứng nhận thức nhĩ. Ngã thị Trung Quốc nhân, dã thị nhất danh học sinh. Nhĩ khiếu thập ma danh tự?',
    vietnamese: 'Xin chào! Rất vui được làm quen với bạn. Tôi là người Trung Quốc, cũng là một học sinh. Bạn tên là gì thế?',
  },
  {
    id: 'passage-02',
    title: 'Một ngày tốt lành (美好的一天)',
    level: 'HSK 1-2',
    chinese: '今天天气非常好，阳光很温暖。我和朋友一起喝茶，聊天，心情特别开心。',
    pinyin: 'Jīntiān tiānqì fēicháng hǎo, yángguāng hěn wēnnuǎn. Wǒ hé péngyou yīqǐ hē chá, liáotiān, xīnqíng tèbié kāixīn.',
    sinoVietnamese: 'Kim thiên thiên khí phi thường hảo, dương quang hẩn ôn noãn. Ngã hòa bằng hữu nhất khởi hống trà, liêu thiên, tâm tình đặc biệt khai tâm.',
    vietnamese: 'Hôm nay thời tiết rất tốt, ánh nắng chan hòa ấm áp. Tôi cùng bạn bè uống trà, trò chuyện, trong lòng vô cùng vui vẻ.',
  },
  {
    id: 'passage-03',
    title: 'Đến quán ăn gọi món (在饭馆点菜)',
    level: 'HSK 1-2',
    chinese: '服务员，请问这里有什么好吃的中餐？我想吃米饭，再来一碗热汤，谢谢！',
    pinyin: 'Fúwùyuán, qǐngwèn zhèlǐ yǒu shénme hǎochī de zhōngcān? Wǒ xiǎng chī mǐfàn, zài lái yī wǎn rè tāng, xièxie!',
    sinoVietnamese: 'Phục vụ viên, thỉnh vấn giá lý hữu thập ma hảo khất đích trung xan? Ngã tưởng khất mễ phản, tái lai nhất oản nhiệt thang, tạ tạ!',
    vietnamese: 'Phục vụ ơi, cho hỏi ở đây có món Trung Hoa nào ngon không? Tôi muốn ăn cơm trắng, thêm một bát canh nóng, cảm ơn nhé!',
  },
];

type ReaderSourceMode = 'samples' | 'pdf' | 'custom';

interface InteractiveReaderStudioProps {
  onPracticeCharacter?: (char: string, matchedWord?: HskWord) => void;
  className?: string;
}

export const InteractiveReaderStudio: React.FC<InteractiveReaderStudioProps> = ({
  onPracticeCharacter,
  className = '',
}) => {
  const [sourceMode, setSourceMode] = useState<ReaderSourceMode>('samples');
  const [selectedPassageId, setSelectedPassageId] = useState<string>(SAMPLE_PASSAGES[0].id);

  // Custom text input
  const [customText, setCustomText] = useState<string>('');

  // PDF Document state
  const [pdfDoc, setPdfDoc] = useState<PdfDocumentResult | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const [pdfParseError, setPdfParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Circle to Search Modal state
  const [isCircleModalOpen, setIsCircleModalOpen] = useState<boolean>(false);
  const [selectedWordToQuery, setSelectedWordToQuery] = useState<string>('');

  // Determine active text, pinyin and annotations based on active mode
  const currentPassage =
    SAMPLE_PASSAGES.find((p) => p.id === selectedPassageId) || SAMPLE_PASSAGES[0];

  let activeText = '';
  let activePinyin: string | undefined;
  let activeSinoViet: string | undefined;
  let activeVietnamese: string | undefined;

  if (sourceMode === 'samples') {
    activeText = currentPassage.chinese;
    activePinyin = currentPassage.pinyin;
    activeSinoViet = currentPassage.sinoVietnamese;
    activeVietnamese = currentPassage.vietnamese;
  } else if (sourceMode === 'custom') {
    activeText = customText.trim() || 'Vui lòng nhập hoặc dán văn bản tiếng Trung cần đọc ở ô bên trên.';
  } else if (sourceMode === 'pdf') {
    if (pdfDoc && pdfDoc.pages.length > 0) {
      const activePage = pdfDoc.pages[currentPageIndex] || pdfDoc.pages[0];
      activeText = activePage.text;
    } else {
      activeText = 'Chưa có tệp PDF nào được tải lên. Hãy chọn một tệp PDF giáo trình tiếng Trung để bắt đầu học đọc!';
    }
  }

  // Handle word circled by user
  const handleWordCircled = (word: string) => {
    setSelectedWordToQuery(word);
    setIsCircleModalOpen(true);
  };

  // Play full text TTS audio
  const handlePlayFullAudio = async () => {
    if (isPlayingAudio || !activeText) return;
    try {
      setIsPlayingAudio(true);
      const speech = SpeechService.getInstance();
      await speech.speak(activeText);
    } catch (e) {
      console.warn('Speech playback error:', e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Handle PDF / Text File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsParsingPdf(true);
    setPdfParseError(null);

    try {
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith('.pdf')) {
        const buffer = await file.arrayBuffer();
        const docResult = await extractTextFromPdf(buffer, file.name);

        if (docResult.pages.length === 0 || docResult.totalChineseChars === 0) {
          setPdfParseError(
            'Tài liệu PDF này không chứa văn bản text tiếng Trung rõ ràng (có thể là file scan dạng ảnh).'
          );
        }

        setPdfDoc(docResult);
        setCurrentPageIndex(0);
        setSourceMode('pdf');
      } else if (fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.md')) {
        const textContent = await file.text();
        const docResult = extractTextFromTxt(textContent, file.name);

        setPdfDoc(docResult);
        setCurrentPageIndex(0);
        setSourceMode('pdf');
      } else {
        setPdfParseError('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .pdf, .txt hoặc .md.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to parse document:', err);
      setPdfParseError(`Lỗi giải mã tệp: ${msg}`);
    } finally {
      setIsParsingPdf(false);
      // Reset input value so same file can be re-uploaded if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {/* 1. Header Selector & Source Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-obsidian-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Đọc Tài Liệu &amp; Khoanh Chữ Hỏi AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                PDF &amp; Text Reader
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tải tệp PDF tài liệu lên hoặc chọn bài đọc để tra cứu và hỏi AI mọi chữ bạn chưa biết!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio TTS Button */}
          <button
            type="button"
            onClick={handlePlayFullAudio}
            disabled={isPlayingAudio || !activeText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Nghe toàn bộ văn bản bằng giọng đọc bản xứ"
          >
            <Volume2 className={`w-4 h-4 text-cyber-cyan ${isPlayingAudio ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>{isPlayingAudio ? 'Đang đọc...' : 'Nghe văn bản'}</span>
          </button>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSourceMode('samples')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sourceMode === 'samples'
                  ? 'bg-cyber-cyan text-obsidian-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bài mẫu HSK
            </button>

            <button
              type="button"
              onClick={() => setSourceMode('pdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sourceMode === 'pdf'
                  ? 'bg-cyber-cyan text-obsidian-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Tài liệu PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceMode('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sourceMode === 'custom'
                  ? 'bg-cyber-cyan text-obsidian-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Dán văn bản</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mode 1: Curated HSK Sample Passages Selector */}
      {sourceMode === 'samples' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PASSAGES.map((p) => {
            const isSelected = p.id === selectedPassageId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPassageId(p.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-cyber-cyan/15 border-cyber-cyan/60 text-white shadow-lg shadow-cyber-cyan/10 ring-1 ring-cyber-cyan/40'
                    : 'bg-obsidian-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white line-clamp-1">{p.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {p.level}
                    </span>
                  </div>
                  <div className="text-xs text-cyber-cyan font-serif line-clamp-1">{p.chinese}</div>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 italic">{p.vietnamese}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Mode 2: PDF Document Uploader & Page Navigator */}
      {sourceMode === 'pdf' && (
        <div className="flex flex-col gap-4">
          {/* Upload Dropzone Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-obsidian-900 border border-dashed border-slate-700/80 hover:border-cyber-cyan/60 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>Tải Lên Tệp PDF / TXT / Markdown</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                    100% Client-Side Private
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tài liệu được xử lý trực tiếp trên thiết bị của bạn, không tải lên server ngoài.
                </p>
              </div>
            </div>

            {/* Hidden Input & Trigger Button */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingPdf}
                className="px-4 py-2.5 rounded-2xl bg-cyber-cyan text-obsidian-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-950/40 active:scale-95 disabled:opacity-50"
              >
                {isParsingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang giải mã PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Chọn tệp từ máy / iPad</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message if Parsing Failed */}
          {pdfParseError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{pdfParseError}</span>
            </div>
          )}

          {/* Document Metadata & Pagination Bar */}
          {pdfDoc && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-950/70 border border-slate-800 shadow-md flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyber-cyan" />
                <span className="text-xs font-bold text-white max-w-[200px] sm:max-w-xs truncate">
                  {pdfDoc.fileName}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {pdfDoc.totalChineseChars} chữ Hán
                </span>
              </div>

              {/* Page Controls */}
              {pdfDoc.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentPageIndex === 0}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono font-bold text-cyber-cyan px-2">
                    Trang {currentPageIndex + 1} / {pdfDoc.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((prev) => Math.min(pdfDoc.totalPages - 1, prev + 1))}
                    disabled={currentPageIndex >= pdfDoc.totalPages - 1}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Mode 3: Custom Text Paste Input */}
      {sourceMode === 'custom' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-obsidian-900 border border-slate-800 shadow-xl space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Nhập hoặc dán đoạn văn tiếng Trung bạn muốn học:</span>
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Dán câu hoặc đoạn văn bản tiếng Trung cần đọc vào đây (ví dụ: 我很喜欢学中文，汉字非常有意思。)..."
            className="w-full p-3.5 rounded-2xl bg-obsidian-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyber-cyan font-serif transition-colors leading-relaxed"
          />
        </div>
      )}

      {/* 5. Main Interactive Circle-to-Search Canvas Display */}
      <CircleToSearchOverlay
        sentenceText={activeText}
        pinyinText={activePinyin}
        sinoVietnameseText={activeSinoViet}
        vietnameseMeaning={activeVietnamese}
        onCircleWord={handleWordCircled}
        className="w-full"
      />

      {/* 6. Floating Circle-to-Search Modal Dialog */}
      <CircleToSearchModal
        isOpen={isCircleModalOpen}
        onClose={() => setIsCircleModalOpen(false)}
        queryText={selectedWordToQuery}
        contextSentence={activeText}
        onPracticeCharacter={onPracticeCharacter}
      />
    </div>
  );
};
export default InteractiveReaderStudio;
