'use client';

import React, { useState } from 'react';
import { HskWord } from '@/types/hsk';
import { SpeechService } from '@/services/speechService';
import { srsService } from '@/services/srsService';
import { progressService } from '@/services/progressService';
import { Tilt3DCard } from '@/components/ui';
import {
  Volume2,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  PenTool,
  CheckCircle2,
  Info,
  Lightbulb,
  Compass,
  Repeat,
  Layers,
} from 'lucide-react';

export interface VisualVocabStudioProps {
  word: HskWord;
  allWords: HskWord[];
  onSelectWord: (word: HskWord) => void;
  onNavigateToWrite?: (char: string) => void;
  onBackToRoadmap?: () => void;
  lessonTitle?: string;
}

export const VisualVocabStudio: React.FC<VisualVocabStudioProps> = ({
  word,
  allWords,
  onSelectWord,
  onNavigateToWrite,
  onBackToRoadmap,
  lessonTitle,
}) => {
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [isMastered, setIsMastered] = useState<boolean>(
    progressService.getProfile().masteredWordIds.includes(word.id)
  );

  const currentIndex = allWords.findIndex((w) => w.id === word.id);
  const totalWords = allWords.length;

  const handleNext = () => {
    if (currentIndex < totalWords - 1) {
      onSelectWord(allWords[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectWord(allWords[currentIndex - 1]);
    }
  };

  const handleSpeak = async (text: string, rate: number = 1.0) => {
    const speech = SpeechService.getInstance();
    if (rate < 1.0) {
      setIsPlayingSlow(true);
      await speech.speak(text);
      setTimeout(() => setIsPlayingSlow(false), 1200);
    } else {
      await speech.speak(text);
    }
  };

  const handleToggleMastered = () => {
    progressService.markWordMastered(word.id);
    setIsMastered(true);
  };

  // Tone color styling helper
  const getToneBadgeStyle = (tone: number) => {
    switch (tone) {
      case 1:
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400';
      case 2:
        return 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400';
      case 3:
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
      case 4:
        return 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400';
      default:
        return 'bg-slate-500/15 border-slate-500/40 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* 1. Studio Top Breadcrumb & Step Navigation */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-obsidian-900/80 border border-stone-200/90 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          {onBackToRoadmap && (
            <button
              type="button"
              onClick={onBackToRoadmap}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>Lộ Trình HSK 1</span>
            </button>
          )}
          <span className="text-xs font-bold text-stone-500 dark:text-slate-400">
            {lessonTitle ? lessonTitle : `Từ Vựng HSK ${word.hskLevel}`}
          </span>
        </div>

        {/* Word Stepper Progress */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-slate-700 transition-all"
            title="Từ trước đó"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            {currentIndex + 1} / {totalWords}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= totalWords - 1}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-stone-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-slate-700 transition-all"
            title="Từ tiếp theo"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Focus Card: Visual Character & Mnemonic Artwork */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Giant 3D Hanzi Card + Audio */}
        <div className="lg:col-span-5 flex flex-col">
          <Tilt3DCard
            depth={22}
            maxTiltAngle={14}
            glareOpacity={0.25}
            className="h-full rounded-3xl bg-white/90 dark:bg-obsidian-900/90 border border-stone-200/90 dark:border-slate-800 shadow-xl p-6 sm:p-8 flex flex-col items-center justify-between text-center relative overflow-hidden backdrop-blur-md"
          >
            {/* Top Info Badges */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>HSK {word.hskLevel}</span>
                <span>•</span>
                <span>{word.strokeCount} Nét Bút</span>
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getToneBadgeStyle(word.tone)}`}>
                Thanh {word.tone}
              </span>
            </div>

            {/* Center Giant Hanzi Character */}
            <div className="my-6 relative cursor-pointer group" onClick={() => handleSpeak(word.hanzi)}>
              <div className="text-8xl sm:text-9xl font-serif font-black text-stone-900 dark:text-white drop-shadow-md group-hover:scale-105 transition-transform duration-200">
                {word.hanzi}
              </div>
              <div className="text-sm font-semibold text-stone-400 mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Chạm để nghe âm</span>
              </div>
            </div>

            {/* Pronunciation & Sino-Vietnamese Pillar */}
            <div className="w-full pt-4 border-t border-stone-200/80 dark:border-slate-800 flex flex-col items-center gap-1.5">
              <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 tracking-wide">
                {word.pinyin}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Hán Việt:
                </span>
                <span className="text-sm font-black text-stone-900 dark:text-white">
                  {word.sinoVietnamese}
                </span>
              </div>

              <div className="text-sm font-bold text-stone-700 dark:text-slate-200 mt-1">
                {word.vietnameseMeaning}
              </div>
            </div>

            {/* Audio Actions (Normal & Slow Speed) */}
            <div className="mt-5 w-full grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSpeak(word.hanzi, 1.0)}
                className="btn-tactile btn-tactile-amber py-2 px-3 text-xs font-black text-white gap-1.5 shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-white" />
                <span>Nghe Chuẩn 1.0x</span>
              </button>

              <button
                type="button"
                onClick={() => handleSpeak(word.hanzi, 0.75)}
                className="btn-tactile btn-tactile-cyan py-2 px-3 text-xs font-black text-white gap-1.5 shadow-sm"
              >
                <Repeat className={`w-3.5 h-3.5 text-white ${isPlayingSlow ? 'animate-spin' : ''}`} />
                <span>Nghe Chậm 0.75x</span>
              </button>
            </div>
          </Tilt3DCard>
        </div>

        {/* Right Col: Visual Mnemonic Artwork + Radical Decomposition + Context Sentence */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* A. Visual Mnemonic Illustration Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-obsidian-900/90 border border-stone-200/90 dark:border-slate-800 shadow-md backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-lg">
                  {word.illustrationIcon || '💡'}
                </div>
                <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Mẹo Nhớ Trực Quan &amp; Đòn Bẩy Hán - Việt
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Nhìn Tranh Nhớ Chữ
              </span>
            </div>

            {/* Visual Mnemonic Description Box */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-stone-700 dark:text-slate-200 leading-relaxed font-medium">
              <p className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                🎨 Liên Tưởng Thị Giác:
              </p>
              <p>{word.illustrationPrompt || word.mnemonic}</p>
            </div>

            {/* Radical & Decomposition Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-obsidian-950/70 border border-stone-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase">
                  Bộ Thủ Cốt Lõi:
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-serif font-black text-emerald-600 dark:text-emerald-400">
                    {word.radical}
                  </span>
                  <span className="text-xs font-semibold text-stone-800 dark:text-slate-200">
                    {word.radicalMeaning}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-obsidian-950/70 border border-stone-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase">
                  Cấu Tạo Chiết Tự:
                </span>
                <div className="text-xs font-medium text-stone-800 dark:text-slate-300 mt-1 line-clamp-2">
                  {word.decomposition || word.mnemonic}
                </div>
              </div>
            </div>
          </div>

          {/* B. Real-Life Context Sentence Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-obsidian-900/90 border border-stone-200/90 dark:border-slate-800 shadow-md backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                <span>Mẫu Câu Ngữ Cảnh Đời Thường</span>
              </h3>
              <button
                type="button"
                onClick={() => handleSpeak(word.exampleSentence.chinese)}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>Nghe Mẫu Câu</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-obsidian-950/80 border border-cyan-500/20 flex flex-col gap-1.5">
              <div className="text-base sm:text-lg font-serif font-black text-stone-900 dark:text-white">
                {word.exampleSentence.chinese}
              </div>
              <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {word.exampleSentence.pinyin}
              </div>
              <div className="text-xs font-semibold text-stone-700 dark:text-slate-300 mt-0.5">
                👉 {word.exampleSentence.vietnamese}
              </div>
              {word.exampleSentence.sinoVietnamese && (
                <div className="text-[11px] text-stone-500 dark:text-slate-400 italic">
                  (Hán Việt: {word.exampleSentence.sinoVietnamese})
                </div>
              )}
            </div>
          </div>

          {/* C. Action Bar: Practice Writing or Mark Mastered */}
          <div className="flex items-center gap-3 pt-1">
            {onNavigateToWrite && (
              <button
                type="button"
                onClick={() => onNavigateToWrite(word.hanzi[0])}
                className="flex-1 btn-tactile btn-tactile-emerald py-3 px-4 text-xs font-black text-white gap-2 shadow-md"
              >
                <PenTool className="w-4 h-4 text-white" />
                <span>Luyện Viết Chữ Này Ngay</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleMastered}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                isMastered
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-amber-500' : 'text-stone-400'}`} />
              <span>{isMastered ? 'Đã Thuộc Vững Vàng ⭐' : 'Đánh Dấu Đã Thuộc'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
