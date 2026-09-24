'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HskWord } from '@/types/hsk';
import { SpeechService } from '@/services/speechService';
import { progressService } from '@/services/progressService';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  Star,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface FlipCardProps {
  words: HskWord[];
  initialIndex?: number;
  onWordChange?: (word: HskWord) => void;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  words,
  initialIndex = 0,
  onWordChange,
}) => {
  const [deck, setDeck] = useState<HskWord[]>(words);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sync deck when words prop changes
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = deck[currentIndex] || deck[0];

  useEffect(() => {
    if (currentWord && onWordChange) {
      onWordChange(currentWord);
    }
  }, [currentWord, onWordChange]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  const handleShuffle = useCallback(() => {
    if (deck.length <= 1) return;
    setIsFlipped(false);
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck(shuffled);
    setCurrentIndex(0);
  }, [deck]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  if (!currentWord || deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-obsidian-900 border border-slate-800 rounded-3xl min-h-[380px]">
        <HelpCircle className="w-12 h-12 text-slate-500 mb-3" />
        <h4 className="text-base font-semibold text-slate-300">Không có thẻ từ vựng nào</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Vui lòng chọn danh mục khác hoặc kiểm tra lại bộ lọc thẻ của bạn.
        </p>
      </div>
    );
  }

  const isMastered = progressService.isMastered(currentWord.id);
  const isReview = progressService.isReview(currentWord.id);
  const isFavorite = progressService.isFavorite(currentWord.id);

  const handleToggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    progressService.toggleMastered(currentWord.id);
  };

  const handleToggleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    progressService.toggleReview(currentWord.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    progressService.toggleFavorite(currentWord.id);
  };

  const handlePlayWordAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsPlayingAudio(true);
      await SpeechService.getInstance().speak(currentWord.hanzi);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handlePlaySentenceAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsPlayingAudio(true);
      await SpeechService.getInstance().speak(currentWord.exampleSentence.chinese);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const toneLabels: Record<number, { name: string; chao: string; color: string }> = {
    1: { name: 'Thanh 1 (Âm Bình)', chao: 'Chao 55', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' },
    2: { name: 'Thanh 2 (Dương Bình)', chao: 'Chao 35', color: 'text-amber-400 border-amber-500/30 bg-amber-950/40' },
    3: { name: 'Thanh 3 (Thượng Thanh)', chao: 'Chao 214', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' },
    4: { name: 'Thanh 4 (Khứ Thanh)', chao: 'Chao 51', color: 'text-red-400 border-red-500/30 bg-red-950/40' },
    5: { name: 'Khinh thanh', chao: 'Nhẹ', color: 'text-slate-400 border-slate-600 bg-slate-800' },
  };

  const currentToneMeta = toneLabels[currentWord.tone] || toneLabels[1];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top Header: Progress indicator & Card Badges */}
      <div className="w-full flex items-center justify-between px-2 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 font-mono text-slate-300 font-semibold">
            {currentIndex + 1} / {deck.length}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-medium">
            HSK {currentWord.hskLevel}
          </span>
        </div>

        {/* Quick status badges */}
        <div className="flex items-center gap-1.5">
          {isMastered && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Đã thuộc
            </span>
          )}
          {isReview && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
              <AlertCircle className="w-3 h-3" /> Cần ôn
            </span>
          )}
          {isFavorite && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium">
              <Star className="w-3 h-3 fill-rose-400" />
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyber-cyan to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div
        className="w-full aspect-[4/3] sm:aspect-[16/10] max-h-[420px] min-h-[300px] perspective-1000 cursor-pointer"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Lật thẻ từ vựng"
      >
        <div
          className={`relative w-full h-full duration-500 preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT FACE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-obsidian-900 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-cyber-cyan/40 transition-colors">
            {/* Top row of Front: Tag and Audio */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Âm Hán Việt: {currentWord.sinoVietnamese}</span>
              </div>

              <button
                type="button"
                onClick={handlePlayWordAudio}
                className="w-11 h-11 rounded-2xl bg-cyber-cyan/15 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Nghe phát âm bản xứ"
                aria-label="Phát âm tiếng Trung"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            {/* Center: Large Hanzi & Pinyin */}
            <div className="my-auto text-center">
              <div className="text-6xl sm:text-7xl md:text-8xl font-serif font-extrabold text-white tracking-widest drop-shadow-md">
                {currentWord.hanzi}
              </div>
              <div className="text-xl sm:text-2xl font-mono text-cyber-cyan mt-3 font-semibold tracking-wide">
                {currentWord.pinyin}
              </div>
            </div>

            {/* Bottom row of Front: Flip hint & metadata */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Bộ thủ:</span>
                <span className="text-slate-300 font-medium">
                  {currentWord.radical} ({currentWord.strokeCount} nét)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-cyber-cyan/80">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="text-[11px] font-medium hidden sm:inline">Chạm thẻ hoặc bấm Space để lật</span>
                <span className="text-[11px] font-medium sm:hidden">Chạm để lật</span>
              </div>
            </div>
          </div>

          {/* ================= BACK FACE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-slate-900 via-obsidian-900 to-slate-900 border-2 border-cyber-cyan/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Top row of Back */}
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${currentToneMeta.color}`}>
                {currentToneMeta.name} • {currentToneMeta.chao}
              </span>
              <button
                type="button"
                onClick={handlePlayWordAudio}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all"
                title="Nghe lại"
              >
                <Volume2 className="w-4 h-4 text-cyber-cyan" />
              </button>
            </div>

            {/* Center of Back: Meaning & Radical */}
            <div className="my-auto py-2">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Nghĩa Tiếng Việt</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                {currentWord.vietnameseMeaning}
              </div>

              {/* Context Example Sentence */}
              <div className="mt-4 p-3.5 rounded-2xl bg-obsidian-950/80 border border-slate-800 relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-cyber-cyan uppercase tracking-wide">
                    Ví dụ giao tiếp thực tế
                  </span>
                  <button
                    type="button"
                    onClick={handlePlaySentenceAudio}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Nghe câu</span>
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

            {/* Bottom of Back */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                {currentWord.radicalMeaning}
              </span>
              <div className="flex items-center gap-1.5 text-cyber-cyan/80">
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Lật lại mặt trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions & Mastery Buttons */}
      <div className="w-full mt-6 flex flex-col gap-4">
        {/* Navigation & Flip Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Xáo trộn ngẫu nhiên thẻ"
            aria-label="Xáo trộn thẻ"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="p-3 sm:px-4 rounded-2xl bg-obsidian-900 border border-slate-800 hover:border-cyber-cyan/40 text-slate-200 hover:text-white transition-all active:scale-95 flex items-center gap-1 min-w-[48px] justify-center"
              aria-label="Thẻ trước"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-xs font-semibold hidden sm:inline">Trước</span>
            </button>

            <button
              type="button"
              onClick={handleFlip}
              className="px-6 py-3 rounded-2xl bg-cyber-cyan text-obsidian-950 font-bold text-sm transition-all hover:bg-cyan-300 active:scale-95 shadow-lg shadow-cyan-950/40 flex items-center gap-2 min-h-[48px]"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isFlipped ? 'Xem chữ Hán' : 'Xem nghĩa'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-3 sm:px-4 rounded-2xl bg-obsidian-900 border border-slate-800 hover:border-cyber-cyan/40 text-slate-200 hover:text-white transition-all active:scale-95 flex items-center gap-1 min-w-[48px] justify-center"
              aria-label="Thẻ tiếp theo"
            >
              <span className="text-xs font-semibold hidden sm:inline">Tiếp</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-3 rounded-2xl border transition-all active:scale-95 ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Đánh dấu yêu thích"
            aria-label="Đánh dấu thẻ"
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Mastered / Review Toggle Bar */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleToggleReview}
            className={`py-3 px-4 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              isReview
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                : 'bg-obsidian-900 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>{isReview ? 'Đã thêm vào Cần Ôn Lại' : 'Đánh dấu Cần Ôn Lại'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMastered}
            className={`py-3 px-4 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              isMastered
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                : 'bg-obsidian-900 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isMastered ? 'Đã thành thạo từ này ✓' : 'Đánh dấu Đã Thuộc'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
