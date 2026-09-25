'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HskWord } from '@/types/hsk';
import { FlashcardMode, FlashcardFilter } from '@/types/flashcard';
import { UserProfile } from '@/types/auth';
import { progressService } from '@/services/progressService';
import { srsService } from '@/services/srsService';
import { FlipCard } from './FlipCard';
import { LearnQuiz } from './LearnQuiz';
import { MatchGame } from './MatchGame';
import { SrsReviewDeck } from './SrsReviewDeck';
import {
  Layers,
  HelpCircle,
  Zap,
  CheckCircle2,
  AlertCircle,
  Star,
  BookOpen,
  Filter,
  Brain,
} from 'lucide-react';

interface FlashcardHubProps {
  curriculum: HskWord[];
  selectedWord?: HskWord;
  onWordSelect?: (word: HskWord) => void;
}

export const FlashcardHub: React.FC<FlashcardHubProps> = ({
  curriculum,
  selectedWord,
  onWordSelect,
}) => {
  const [activeMode, setActiveMode] = useState<FlashcardMode>('flip');
  const [activeFilter, setActiveFilter] = useState<FlashcardFilter>('all');
  const [userProfile, setUserProfile] = useState<UserProfile>(progressService.getProfile());
  const [dueCount, setDueCount] = useState<number>(srsService.getDueCount());

  // Subscribe to progress and SRS changes
  useEffect(() => {
    const unsubProgress = progressService.subscribe((updated) => {
      setUserProfile(updated);
    });
    const unsubSrs = srsService.subscribe(() => {
      setDueCount(srsService.getDueCount());
    });
    return () => {
      unsubProgress();
      unsubSrs();
    };
  }, []);

  // Filtered vocabulary list
  const filteredWords = useMemo(() => {
    switch (activeFilter) {
      case 'mastered':
        return curriculum.filter((w) => userProfile.masteredWordIds.includes(w.id));
      case 'review':
        return curriculum.filter((w) => userProfile.reviewWordIds.includes(w.id));
      case 'favorite':
        return curriculum.filter((w) => userProfile.favoriteWordIds.includes(w.id));
      case 'all':
      default:
        return curriculum;
    }
  }, [curriculum, activeFilter, userProfile]);

  // Counts for filter badges
  const masteredCount = curriculum.filter((w) =>
    userProfile.masteredWordIds.includes(w.id)
  ).length;
  const reviewCount = curriculum.filter((w) =>
    userProfile.reviewWordIds.includes(w.id)
  ).length;
  const favoriteCount = curriculum.filter((w) =>
    userProfile.favoriteWordIds.includes(w.id)
  ).length;

  const initialCardIndex = useMemo(() => {
    if (!selectedWord) return 0;
    const foundIdx = filteredWords.findIndex((w) => w.id === selectedWord.id);
    return foundIdx >= 0 ? foundIdx : 0;
  }, [filteredWords, selectedWord]);

  return (
    <div className="w-full flex flex-col">
      {/* Mode Switcher & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        {/* 3 Sub-Modes Switcher */}
        <div className="flex items-center bg-obsidian-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMode('flip')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              activeMode === 'flip'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Lật thẻ 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('learn')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              activeMode === 'learn'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Luyện tập Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('match')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              activeMode === 'match'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Ghép từ tốc độ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('srs')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] relative ${
              activeMode === 'srs'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Ôn tập SRS</span>
            {dueCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeMode === 'srs'
                    ? 'bg-obsidian-950 text-amber-300'
                    : 'bg-amber-500 text-obsidian-950 animate-pulse'
                }`}
              >
                {dueCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-obsidian-950/70 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tất cả ({curriculum.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('mastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'mastered'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-obsidian-950/70 border-slate-800 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã thuộc ({masteredCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'review'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-obsidian-950/70 border-slate-800 text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cần ôn lại ({reviewCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('favorite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'favorite'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-obsidian-950/70 border-slate-800 text-slate-400 hover:text-rose-400'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Đã đánh dấu ({favoriteCount})</span>
          </button>
        </div>
      </div>

      {/* Mode Content Views */}
      <div className="w-full">
        {activeMode === 'flip' && (
          <FlipCard
            words={filteredWords}
            initialIndex={initialCardIndex}
            onWordChange={onWordSelect}
          />
        )}

        {activeMode === 'learn' && (
          <LearnQuiz
            words={filteredWords}
            allWords={curriculum}
            onWordSelect={onWordSelect}
          />
        )}

        {activeMode === 'match' && (
          <MatchGame words={filteredWords} />
        )}

        {activeMode === 'srs' && (
          <SrsReviewDeck
            curriculum={curriculum}
            onWordSelect={onWordSelect}
          />
        )}
      </div>
    </div>
  );
};

export default FlashcardHub;
