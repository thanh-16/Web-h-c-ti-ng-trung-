'use client';

import React, { useState } from 'react';
import { CircleToSearchOverlay, CircleToSearchModal } from '@/components/ai';
import { SpeechService } from '@/services/speechService';
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
  RotateCcw,
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

interface InteractiveReaderStudioProps {
  onPracticeCharacter?: (char: string, matchedWord?: HskWord) => void;
  className?: string;
}

export const InteractiveReaderStudio: React.FC<InteractiveReaderStudioProps> = ({
  onPracticeCharacter,
  className = '',
}) => {
  const [selectedPassageId, setSelectedPassageId] = useState<string>(SAMPLE_PASSAGES[0].id);
  const [customText, setCustomText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Circle to Search Modal state
  const [isCircleModalOpen, setIsCircleModalOpen] = useState<boolean>(false);
  const [selectedWordToQuery, setSelectedWordToQuery] = useState<string>('');

  const currentPassage =
    SAMPLE_PASSAGES.find((p) => p.id === selectedPassageId) || SAMPLE_PASSAGES[0];

  const activeText = isCustomMode && customText.trim() ? customText.trim() : currentPassage.chinese;
  const activePinyin = isCustomMode ? undefined : currentPassage.pinyin;
  const activeSinoViet = isCustomMode ? undefined : currentPassage.sinoVietnamese;
  const activeVietnamese = isCustomMode ? undefined : currentPassage.vietnamese;

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

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {/* Header Selector & Custom Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-obsidian-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Đọc Đoạn Văn &amp; Khoanh Chữ Hỏi AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                Circle to Search
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Chạm hoặc dùng ngón tay/Apple Pencil khoanh tròn vào bất kỳ từ nào bạn chưa biết để AI phân tích tức thì!
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePlayFullAudio}
            disabled={isPlayingAudio}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Nghe toàn bộ đoạn văn bằng giọng đọc bản xứ"
          >
            <Volume2 className={`w-4 h-4 text-cyber-cyan ${isPlayingAudio ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>{isPlayingAudio ? 'Đang đọc...' : 'Nghe cả bài'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCustomMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isCustomMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-obsidian-950 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isCustomMode ? 'Bài mẫu tuyển chọn' : 'Dán văn bản tự chọn'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Pre-loaded Curated Passages Selector */}
      {!isCustomMode && (
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

      {/* Mode 2: Custom Text Input */}
      {isCustomMode && (
        <div className="p-4 sm:p-5 rounded-3xl bg-obsidian-900 border border-slate-800 shadow-xl space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Nhập hoặc dán đoạn văn tiếng Trung của bạn:</span>
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

      {/* Main Interactive Circle-to-Search Canvas Display */}
      <CircleToSearchOverlay
        sentenceText={activeText}
        pinyinText={activePinyin}
        sinoVietnameseText={activeSinoViet}
        vietnameseMeaning={activeVietnamese}
        onCircleWord={handleWordCircled}
        className="w-full"
      />

      {/* Floating Circle-to-Search Modal Dialog */}
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
