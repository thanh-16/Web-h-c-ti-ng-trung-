'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HskWord } from '@/types/hsk';
import { SrsCard, SrsRating } from '@/types/srs';
import { srsService } from '@/services/srsService';
import { SpeechService } from '@/services/speechService';
import {
  Volume2,
  RotateCw,
  Sparkles,
  Brain,
  Calendar,
  Award,
  CheckCircle2,
  RotateCcw,
  Clock,
  Flame,
  Layers,
} from 'lucide-react';

interface SrsReviewDeckProps {
  curriculum: HskWord[];
  onWordSelect?: (word: HskWord) => void;
}

export const SrsReviewDeck: React.FC<SrsReviewDeckProps> = ({
  curriculum,
  onWordSelect,
}) => {
  const [srsCards, setSrsCards] = useState<SrsCard[]>(srsService.getCards());
  const [onlyDue, setOnlyDue] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Subscribe to SRS state updates
  useEffect(() => {
    const unsubscribe = srsService.subscribe((updated) => {
      setSrsCards(updated);
    });
    return unsubscribe;
  }, []);

  // Map HskWord lookup
  const wordMap = useMemo(() => {
    const map = new Map<string, HskWord>();
    for (const w of curriculum) {
      map.set(w.id, w);
    }
    return map;
  }, [curriculum]);

  // Filter cards to review
  const reviewDeck = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const filtered = onlyDue
      ? srsCards.filter((c) => c.nextDueDate <= today)
      : srsCards;

    // Attach word data
    return filtered
      .map((c) => ({
        srs: c,
        word: wordMap.get(c.wordId),
      }))
      .filter((item): item is { srs: SrsCard; word: HskWord } => Boolean(item.word));
  }, [srsCards, onlyDue, wordMap]);

  // Bounds check on index
  const safeIndex = Math.min(currentIndex, Math.max(0, reviewDeck.length - 1));
  const currentItem = reviewDeck[safeIndex];

  useEffect(() => {
    if (currentItem?.word && onWordSelect) {
      onWordSelect(currentItem.word);
    }
  }, [currentItem, onWordSelect]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handlePlayAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    try {
      setIsPlayingAudio(true);
      await SpeechService.getInstance().speak(text);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleRate = async (rating: SrsRating) => {
    if (!currentItem) return;

    const updated = srsService.reviewCard(currentItem.srs.wordId, rating);
    if (!updated) return;

    // Human-readable interval notification
    const feedbackText =
      rating === 1
        ? 'Ôn lại vào ngày mai (Chu kỳ 1 ngày)'
        : `Chu kỳ tiếp theo: ${updated.intervalDays} ngày (Hạn: ${updated.nextDueDate})`;
    setLastFeedback(feedbackText);

    setTimeout(() => {
      setLastFeedback(null);
    }, 3000);

    // Reset flipped state and advance
    setIsFlipped(false);
    if (safeIndex >= reviewDeck.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const stats = srsService.getStats();

  // Completion screen when due cards are done
  if (reviewDeck.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-obsidian-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 animate-pulse">
          <Award className="w-10 h-10" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {onlyDue ? 'Tuyệt vời! Không còn thẻ nào đến hạn hôm nay' : 'Chưa có thẻ từ vựng trong SRS'}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          {onlyDue
            ? 'Bộ não của bạn đang củng cố trí nhớ dài hạn theo thuật toán SuperMemo SM-2. Hãy nghỉ ngơi hoặc ôn luyện thêm các từ khác.'
            : 'Hãy nạp thêm từ vựng để bắt đầu chu trình lặp lại ngắt quãng thông minh.'}
        </p>

        {/* Mini stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mb-8">
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Tổng thẻ</div>
            <div className="text-lg font-bold text-white mt-0.5">{stats.totalCards}</div>
          </div>
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Cần ôn</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{stats.dueTodayCount}</div>
          </div>
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Thành thạo</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{stats.masteredCount}</div>
          </div>
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-medium">Chu kỳ TB</div>
            <div className="text-lg font-bold text-cyber-cyan mt-0.5">{stats.averageIntervalDays}d</div>
          </div>
        </div>

        {onlyDue && (
          <button
            type="button"
            onClick={() => setOnlyDue(false)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 font-semibold text-sm transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Ôn tập toàn bộ thẻ ({stats.totalCards})</span>
          </button>
        )}
      </div>
    );
  }

  const currentWord = currentItem.word;
  const currentSrs = currentItem.srs;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top Bar: Progress, Due count & Mode Toggle */}
      <div className="w-full flex items-center justify-between px-2 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 font-mono text-slate-200 font-semibold">
            {safeIndex + 1} / {reviewDeck.length}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-medium">
            <Brain className="w-3.5 h-3.5" />
            <span>Chu kỳ: {currentSrs.intervalDays} ngày</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (EF: {currentSrs.easeFactor.toFixed(2)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOnlyDue((prev) => !prev);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              onlyDue
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {onlyDue ? 'Đang lọc: Đến hạn' : 'Đang xem: Tất cả'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-cyber-cyan to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${((safeIndex + 1) / reviewDeck.length) * 100}%` }}
        />
      </div>

      {/* Toast feedback */}
      {lastFeedback && (
        <div className="w-full mb-3 px-4 py-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs text-center font-medium animate-fadeIn">
          {lastFeedback}
        </div>
      )}

      {/* 3D Flashcard Container */}
      <div
        className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[420px] min-h-[300px] perspective-1000 cursor-pointer"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Lật thẻ ôn tập SRS"
      >
        <div
          className={`relative w-full h-full duration-500 preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-obsidian-900 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-cyber-cyan/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Âm Hán Việt: {currentWord.sinoVietnamese}</span>
              </div>

              <button
                type="button"
                onClick={(e) => handlePlayAudio(e, currentWord.hanzi)}
                className="w-11 h-11 rounded-2xl bg-cyber-cyan/15 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Nghe phát âm"
                aria-label="Phát âm"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            {/* Center Hanzi */}
            <div className="my-auto text-center">
              <div className="text-6xl sm:text-7xl md:text-8xl font-serif font-extrabold text-white tracking-widest drop-shadow-md">
                {currentWord.hanzi}
              </div>
              <div className="text-xl sm:text-2xl font-mono text-cyber-cyan mt-3 font-semibold tracking-wide">
                {currentWord.pinyin}
              </div>
            </div>

            {/* Bottom Front Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Bộ thủ:</span>
                <span className="text-slate-300 font-medium">
                  {currentWord.radical} ({currentWord.strokeCount} nét)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-cyber-cyan/80">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="text-[11px] font-medium">Lật thẻ để chấm điểm trí nhớ</span>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-slate-900 via-obsidian-900 to-slate-900 border-2 border-cyber-cyan/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-md border font-semibold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                Nghĩa & Ngữ Cảnh
              </span>
              <button
                type="button"
                onClick={(e) => handlePlayAudio(e, currentWord.hanzi)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all"
                title="Nghe lại"
              >
                <Volume2 className="w-4 h-4 text-cyber-cyan" />
              </button>
            </div>

            <div className="my-auto py-2">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Nghĩa Tiếng Việt</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                {currentWord.vietnameseMeaning}
              </div>

              {/* Example */}
              <div className="mt-4 p-3.5 rounded-2xl bg-obsidian-950/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-cyber-cyan uppercase tracking-wide">
                    Ví dụ mẫu
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handlePlayAudio(e, currentWord.exampleSentence.chinese)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 text-[11px]"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Nghe</span>
                  </button>
                </div>
                <div className="text-sm font-semibold font-serif text-slate-100">
                  {currentWord.exampleSentence.chinese}
                </div>
                <div className="text-xs font-mono text-cyber-cyan/90 mt-0.5">
                  {currentWord.exampleSentence.pinyin}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {currentWord.exampleSentence.vietnamese}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">{currentWord.radicalMeaning}</span>
              <div className="flex items-center gap-1.5 text-cyber-cyan/80">
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Chọn 1 trong 4 mức độ bên dưới</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SuperMemo SM-2 4-Level Rating Buttons */}
      <div className="w-full mt-6 flex flex-col gap-3">
        {!isFlipped ? (
          <button
            type="button"
            onClick={handleFlip}
            className="w-full py-4 rounded-2xl bg-cyber-cyan text-obsidian-950 font-bold text-sm transition-all hover:bg-cyan-300 active:scale-95 shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <RotateCw className="w-4 h-4" />
            <span>Lật thẻ để tự đánh giá mức độ nhớ</span>
          </button>
        ) : (
          <div>
            <div className="text-center text-xs text-slate-400 font-medium mb-2.5">
              Bạn nhớ từ này ở mức độ nào?
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Level 1: Forgot */}
              <button
                type="button"
                onClick={() => handleRate(1)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 transition-all active:scale-95 min-h-[64px]"
              >
                <div className="text-sm font-bold flex items-center gap-1">
                  <span>1. Quên</span>
                </div>
                <div className="text-[11px] text-red-400/80 mt-0.5">Ôn lại: 1 ngày</div>
              </button>

              {/* Level 2: Hard */}
              <button
                type="button"
                onClick={() => handleRate(2)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 transition-all active:scale-95 min-h-[64px]"
              >
                <div className="text-sm font-bold flex items-center gap-1">
                  <span>2. Khó</span>
                </div>
                <div className="text-[11px] text-amber-400/80 mt-0.5">Ôn lại: 2 ngày</div>
              </button>

              {/* Level 3: Good */}
              <button
                type="button"
                onClick={() => handleRate(3)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 transition-all active:scale-95 min-h-[64px]"
              >
                <div className="text-sm font-bold flex items-center gap-1">
                  <span>3. Nhớ tốt</span>
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">
                  Ôn lại: ~{Math.round(currentSrs.intervalDays * currentSrs.easeFactor) || 4} ngày
                </div>
              </button>

              {/* Level 4: Easy */}
              <button
                type="button"
                onClick={() => handleRate(4)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan transition-all active:scale-95 min-h-[64px]"
              >
                <div className="text-sm font-bold flex items-center gap-1">
                  <span>4. Rất dễ</span>
                </div>
                <div className="text-[11px] text-cyber-cyan/80 mt-0.5">
                  Ôn lại: ~{Math.round(currentSrs.intervalDays * currentSrs.easeFactor * 1.3) || 7} ngày
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SrsReviewDeck;
