'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HskWord } from '@/types/hsk';
import { MatchCard } from '@/types/flashcard';
import { hanziAudio } from '@/services/hanziAudioFeedback';
import { SpeechService } from '@/services/speechService';
import { progressService } from '@/services/progressService';
import {
  Timer,
  RotateCcw,
  Trophy,
  Zap,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface MatchGameProps {
  words: HskWord[];
  onGameComplete?: (timeSec: number, moves: number) => void;
}

/**
 * Pure generator creating a 12-card deck (6 Hanzi + 6 Vietnamese meanings) from words pool
 */
export function generateMatchDeck(poolWords: HskWord[], pairCount: number = 6): MatchCard[] {
  if (poolWords.length === 0) return [];

  const count = Math.min(poolWords.length, pairCount);
  const selectedWords = [...poolWords].sort(() => Math.random() - 0.5).slice(0, count);

  const cards: MatchCard[] = [];

  selectedWords.forEach((word) => {
    // Hanzi card
    cards.push({
      id: `hanzi_${word.id}`,
      wordId: word.id,
      type: 'hanzi',
      content: word.hanzi,
      subContent: word.pinyin,
      isMatched: false,
      isSelected: false,
      isError: false,
    });

    // Meaning card
    cards.push({
      id: `meaning_${word.id}`,
      wordId: word.id,
      type: 'meaning',
      content: word.vietnameseMeaning,
      subContent: word.sinoVietnamese,
      isMatched: false,
      isSelected: false,
      isError: false,
    });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export const MatchGame: React.FC<MatchGameProps> = ({
  words,
  onGameComplete,
}) => {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalPairs = Math.min(words.length, 6);

  // Initialize or restart game
  const initGame = useCallback(() => {
    if (words.length < 2) return;
    const newCards = generateMatchDeck(words, 6);
    setCards(newCards);
    setSelectedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsProcessing(false);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setIsTimerRunning(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [words]);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  // Live timer interval
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isCompleted]);

  const handleCardClick = async (card: MatchCard) => {
    if (isProcessing || card.isMatched || card.isSelected || isCompleted) {
      return;
    }

    // Start timer on first card click
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    // If card is Hanzi, pronounce it
    if (card.type === 'hanzi') {
      SpeechService.getInstance().speak(card.content);
    }

    const newSelectedIds = [...selectedIds, card.id];
    setSelectedIds(newSelectedIds);

    // Update card selection state
    setCards((prevCards) =>
      prevCards.map((c) => (c.id === card.id ? { ...c, isSelected: true } : c))
    );

    // If 2 cards selected, check match
    if (newSelectedIds.length === 2) {
      setIsProcessing(true);
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newSelectedIds;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.wordId === secondCard.wordId && firstCard.type !== secondCard.type) {
        // MATCH SUCCESS!
        await hanziAudio.playChime();

        setCards((prevCards) =>
          prevCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true, isSelected: false, isError: false }
              : c
          )
        );

        setSelectedIds([]);
        setIsProcessing(false);

        const nextMatchedCount = matchedPairs + 1;
        setMatchedPairs(nextMatchedCount);

        // Check victory condition
        if (nextMatchedCount === totalPairs) {
          setIsTimerRunning(false);
          setIsCompleted(true);
          await hanziAudio.playVictoryFanfare();
          progressService.recordActivity({
            practiceTimeSec: elapsedSeconds,
          });
          if (onGameComplete) {
            onGameComplete(elapsedSeconds, moves + 1);
          }
        }
      } else {
        // MISMATCH!
        await hanziAudio.playMistakeBuzz();

        // Mark error shake on both cards
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isError: true }
              : c
          )
        );

        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isSelected: false, isError: false }
                : c
            )
          );
          setSelectedIds([]);
          setIsProcessing(false);
        }, 600);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (words.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-obsidian-900 border border-slate-800 rounded-3xl min-h-[380px]">
        <HelpCircle className="w-12 h-12 text-slate-500 mb-3" />
        <h4 className="text-base font-semibold text-slate-300">Cần tối thiểu 2 từ vựng để chơi ghép từ</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Vui lòng chọn danh mục khác hoặc kiểm tra lại bộ lọc thẻ.
        </p>
      </div>
    );
  }

  // Completion State
  if (isCompleted) {
    const stars = moves <= totalPairs + 2 ? 3 : moves <= totalPairs + 5 ? 2 : 1;

    return (
      <div className="w-full max-w-lg mx-auto bg-obsidian-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan mb-4 glow-cyan">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight">Chiến Thắng Tuyệt Vời!</h3>
        <p className="text-xs text-slate-400 mt-1">Bạn đã ghép chính xác toàn bộ {totalPairs} cặp từ vựng</p>

        {/* Stars */}
        <div className="flex justify-center gap-2 my-5">
          {[1, 2, 3].map((starIndex) => (
            <span
              key={starIndex}
              className={`text-3xl transition-all ${
                starIndex <= stars ? 'text-amber-400 scale-110 drop-shadow' : 'text-slate-700'
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-slate-800">
            <div className="text-2xl font-bold text-cyber-cyan font-mono">{formatTime(elapsedSeconds)}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Thời gian hoàn thành</div>
          </div>
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-slate-800">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{moves} lượt</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Tổng lượt ghép</div>
          </div>
        </div>

        <button
          type="button"
          onClick={initGame}
          className="w-full py-3.5 px-6 rounded-2xl bg-cyber-cyan text-obsidian-950 font-bold text-sm hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Chơi ván mới (Xáo trộn 6 từ mới)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col select-none">
      {/* Game Dashboard: Timer & Moves */}
      <div className="flex items-center justify-between px-2 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-slate-800 font-mono text-slate-300 font-semibold">
            <Timer className="w-4 h-4 text-cyber-cyan" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-slate-800 text-slate-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>
              Lượt ghép: <strong className="text-white font-mono">{moves}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono">
            Ghép: <strong className="text-emerald-400">{matchedPairs}</strong> / {totalPairs}
          </span>

          <button
            type="button"
            onClick={initGame}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title="Làm mới bàn chơi"
            aria-label="Khởi động lại ván chơi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 12-Card Grid (3 cols on mobile, 4 cols on tablet/desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          let cardStyle =
            'bg-obsidian-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850';

          if (card.isMatched) {
            cardStyle =
              'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/50 opacity-40 pointer-events-none scale-95';
          } else if (card.isSelected) {
            cardStyle =
              'bg-cyber-cyan/20 border-cyber-cyan text-white glow-cyan scale-102';
          } else if (card.isError) {
            cardStyle =
              'bg-red-500/20 border-red-500 text-red-300 animate-card-shake glow-crimson';
          }

          return (
            <button
              key={card.id}
              type="button"
              disabled={card.isMatched || isProcessing}
              onClick={() => handleCardClick(card)}
              className={`min-h-[105px] sm:min-h-[115px] p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden active:scale-95 ${cardStyle}`}
            >
              {card.type === 'hanzi' ? (
                <>
                  <span className="text-3xl sm:text-4xl font-serif font-extrabold tracking-wide">
                    {card.content}
                  </span>
                  {card.subContent && (
                    <span className="text-[11px] font-mono text-cyber-cyan mt-1">
                      {card.subContent}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-semibold line-clamp-2 leading-tight">
                    {card.content}
                  </span>
                  {card.subContent && (
                    <span className="text-[10px] text-amber-400/90 font-mono mt-1 uppercase tracking-wider">
                      {card.subContent}
                    </span>
                  )}
                </>
              )}

              {card.isMatched && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MatchGame;
