'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HSK1_SENTENCES, HSK1_SENTENCE_CATEGORIES } from '@/data/hskSentences';
import { HskSentence, HskSentenceChar } from '@/types/sentence';
import { HanziCanvas } from './HanziCanvas';
import { SpeechService } from '@/services/speechService';
import { progressService } from '@/services/progressService';
import {
  BookOpen,
  Volume2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Trophy,
  RotateCcw,
  Lightbulb,
  Filter,
  Play,
  ArrowRight,
  Award,
} from 'lucide-react';

interface SentenceWritingStudioProps {
  initialSentenceId?: string;
  onSentenceComplete?: (sentence: HskSentence) => void;
  className?: string;
}

export const SentenceWritingStudio: React.FC<SentenceWritingStudioProps> = ({
  initialSentenceId,
  onSentenceComplete,
  className = '',
}) => {
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Filtered sentences
  const filteredSentences = useMemo(() => {
    if (selectedCategory === 'Tất cả') return HSK1_SENTENCES;
    return HSK1_SENTENCES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  // Selected sentence state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(() => {
    if (initialSentenceId) {
      const idx = HSK1_SENTENCES.findIndex((s) => s.id === initialSentenceId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const currentSentence: HskSentence =
    filteredSentences[currentSentenceIndex] || filteredSentences[0] || HSK1_SENTENCES[0];

  // Active character index inside the sentence's characters array
  const [activeCharIndex, setActiveCharIndex] = useState<number>(0);

  // Track completed character indices for each sentence (persisted in local state)
  const [completedCharsMap, setCompletedCharsMap] = useState<Record<string, number[]>>({});

  // Audio playing state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Show sentence victory banner
  const [isSentenceFinished, setIsSentenceFinished] = useState<boolean>(false);

  // Current active character
  const activeCharData: HskSentenceChar =
    currentSentence.characters[activeCharIndex] || currentSentence.characters[0];

  // Completed characters for the current sentence
  const currentCompletedIndices = useMemo(() => {
    return completedCharsMap[currentSentence.id] || [];
  }, [completedCharsMap, currentSentence.id]);

  const totalCharsCount = currentSentence.characters.length;
  const isAllCurrentCharsCompleted =
    totalCharsCount > 0 && currentCompletedIndices.length >= totalCharsCount;

  // Reset activeCharIndex when sentence changes
  useEffect(() => {
    setActiveCharIndex(0);
    setIsSentenceFinished(false);
  }, [currentSentence.id]);

  // Play audio of full sentence
  const handlePlaySentenceAudio = async () => {
    if (isPlayingAudio) return;
    try {
      setIsPlayingAudio(true);
      const speech = SpeechService.getInstance();
      await speech.speak(currentSentence.chinese);
    } catch (e) {
      console.warn('Speech error:', e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Play audio of single active character
  const handlePlayCharAudio = async (charText: string) => {
    try {
      const speech = SpeechService.getInstance();
      await speech.speak(charText);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  };

  // Handler when user successfully finishes writing a character in quiz mode
  const handleCharQuizComplete = (summary: { character: string; totalMistakes: number }) => {
    setCompletedCharsMap((prev) => {
      const existing = prev[currentSentence.id] || [];
      if (!existing.includes(activeCharIndex)) {
        const updated = [...existing, activeCharIndex];

        // Award progress stroke count
        progressService.recordActivity({
          strokeIncrement: 1,
        });

        // Check if all characters in the sentence are now completed
        if (updated.length >= totalCharsCount) {
          setIsSentenceFinished(true);
          onSentenceComplete?.(currentSentence);
        }

        return { ...prev, [currentSentence.id]: updated };
      }
      return prev;
    });
  };

  // Move to next character
  const handleNextCharacter = () => {
    if (activeCharIndex < totalCharsCount - 1) {
      setActiveCharIndex((prev) => prev + 1);
    }
  };

  // Move to previous character
  const handlePrevCharacter = () => {
    if (activeCharIndex > 0) {
      setActiveCharIndex((prev) => prev - 1);
    }
  };

  // Move to next sentence
  const handleNextSentence = () => {
    if (currentSentenceIndex < filteredSentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setCurrentSentenceIndex(0);
    }
  };

  return (
    <div
      className={`w-full flex flex-col gap-6 ${className}`}
      data-testid="sentence-writing-studio"
    >
      {/* 1. Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Chủ đề:</span>
        </span>
        {HSK1_SENTENCE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentSentenceIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-bold'
                  : 'bg-obsidian-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 2. Sentence Selector Carousel / Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: List of Sentences */}
        <div className="md:col-span-1 bg-obsidian-900 border border-slate-800 rounded-3xl p-4 flex flex-col max-h-[560px] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyber-cyan" />
              <span>Mẫu Câu HSK 1 ({filteredSentences.length})</span>
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
              Khẩu ngữ thực chiến
            </span>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {filteredSentences.map((sent, idx) => {
              const isSelected = sent.id === currentSentence.id;
              const completed = completedCharsMap[sent.id]?.length || 0;
              const isDone = completed >= sent.characters.length && sent.characters.length > 0;

              return (
                <button
                  key={sent.id}
                  type="button"
                  onClick={() => setCurrentSentenceIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/50 text-white shadow-sm ring-1 ring-cyber-cyan/30'
                      : 'bg-obsidian-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-serif font-bold text-white tracking-wide">
                      {sent.chinese}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã thuộc</span>
                      </span>
                    ) : completed > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        {completed}/{sent.characters.length} chữ
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-cyber-cyan font-mono truncate">{sent.pinyin}</div>
                  <div className="text-[11px] text-slate-400 truncate">{sent.vietnamese}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sentence Master Studio */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Sentence Hero Banner */}
          <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                  <span>{currentSentence.category}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide flex items-center gap-3">
                  <span>{currentSentence.chinese}</span>
                  <button
                    type="button"
                    onClick={handlePlaySentenceAudio}
                    disabled={isPlayingAudio}
                    className="p-2 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 transition-all hover:scale-105"
                    title="Phát âm thanh toàn bộ câu mẫu"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-emerald-400' : ''}`} />
                  </button>
                </h3>
                <div className="text-sm font-semibold text-cyber-cyan font-mono">
                  {currentSentence.pinyin}
                </div>
                <div className="text-xs text-amber-300 font-medium">
                  Hán Việt: <strong>{currentSentence.sinoVietnamese}</strong>
                </div>
                <div className="text-sm text-slate-200 mt-1 font-medium">
                  Nghĩa tiếng Việt: <em>"{currentSentence.vietnamese}"</em>
                </div>
              </div>

              {/* Progress Pill */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="text-right">
                  <span className="text-xs text-slate-400">Tiến độ câu: </span>
                  <span className="font-bold text-cyber-cyan font-mono">
                    {currentCompletedIndices.length} / {totalCharsCount} chữ
                  </span>
                </div>
                <div className="w-28 h-2 bg-obsidian-950 rounded-full border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-cyan to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${(currentCompletedIndices.length / Math.max(1, totalCharsCount)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Grammar Note */}
            {currentSentence.grammarTip && (
              <div className="mt-3.5 p-3 rounded-2xl bg-obsidian-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-300 font-semibold">Điểm ngữ pháp bỏ túi: </strong>
                  <span>{currentSentence.grammarTip}</span>
                </div>
              </div>
            )}
          </div>

          {/* Character Track / Stepper */}
          <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyber-cyan" />
                <span>Chọn chữ Hán để luyện viết:</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                Chữ thứ {activeCharIndex + 1} / {totalCharsCount}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {currentSentence.characters.map((item, idx) => {
                const isActive = activeCharIndex === idx;
                const isDone = currentCompletedIndices.includes(idx);

                return (
                  <button
                    key={item.char + idx}
                    type="button"
                    onClick={() => setActiveCharIndex(idx)}
                    className={`flex flex-col items-center justify-center min-w-[54px] p-2 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-cyber-cyan text-obsidian-950 border-cyber-cyan font-bold scale-105 shadow-md shadow-cyber-cyan/20 ring-2 ring-cyber-cyan/50'
                        : isDone
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
                        : 'bg-obsidian-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xl font-serif font-bold">{item.char}</span>
                    <span className={`text-[10px] font-mono ${isActive ? 'text-obsidian-900' : 'text-slate-400'}`}>
                      {item.pinyin}
                    </span>
                    {isDone && (
                      <CheckCircle2
                        className={`w-3 h-3 mt-0.5 ${isActive ? 'text-obsidian-900' : 'text-emerald-400'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Character Writing Area */}
          <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col items-center">
            {/* Active Character Mini Card Header */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePlayCharAudio(activeCharData.char)}
                  className="p-2 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30"
                  title="Nghe phát âm chữ này"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-serif font-bold text-white">{activeCharData.char}</span>
                    <span className="text-xs font-mono font-bold text-cyber-cyan">{activeCharData.pinyin}</span>
                    <span className="text-xs text-amber-400 font-semibold">{activeCharData.sinoVietnamese}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Nghĩa trong câu: <strong className="text-slate-200">{activeCharData.meaning}</strong>
                  </div>
                </div>
              </div>

              {/* Character Stepper Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevCharacter}
                  disabled={activeCharIndex === 0}
                  className="p-2 rounded-xl bg-obsidian-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Chữ trước đó"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextCharacter}
                  disabled={activeCharIndex === totalCharsCount - 1}
                  className="p-2 rounded-xl bg-obsidian-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Chữ tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* HanziCanvas for the Active Character */}
            <HanziCanvas
              key={`${currentSentence.id}-${activeCharData.char}-${activeCharIndex}`}
              character={activeCharData.char}
              pinyin={activeCharData.pinyin}
              sinoVietnamese={activeCharData.sinoVietnamese}
              meaning={activeCharData.meaning}
              onQuizComplete={handleCharQuizComplete}
            />

            {/* Navigation to Next Character / Next Sentence Button */}
            <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">
                {currentCompletedIndices.includes(activeCharIndex) ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã hoàn thành nét chữ này!</span>
                  </span>
                ) : (
                  <span>Hãy bấm "Luyện viết cảm ứng" để vẽ chữ này</span>
                )}
              </span>

              {activeCharIndex < totalCharsCount - 1 ? (
                <button
                  type="button"
                  onClick={handleNextCharacter}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 text-xs font-bold transition-all"
                >
                  <span>Chữ tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextSentence}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                >
                  <span>Sang câu tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sentence Victory Toast / Celebration */}
            {isSentenceFinished && (
              <div
                data-testid="sentence-victory-card"
                className="w-full max-w-2xl mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-obsidian-950 to-emerald-950/80 border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Chúc mừng! Bạn đã chinh phục toàn bộ câu này!</span>
                      <Award className="w-4 h-4 text-emerald-400" />
                    </h4>
                    <p className="text-xs text-emerald-300 font-serif mt-0.5">
                      "{currentSentence.chinese}" — {currentSentence.vietnamese}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextSentence}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 flex items-center gap-2"
                >
                  <span>Luyện câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentenceWritingStudio;
