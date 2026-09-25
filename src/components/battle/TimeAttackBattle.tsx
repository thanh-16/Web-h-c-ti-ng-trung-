'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HskWord } from '@/types/hsk';
import { BattleQuestion, BattleStatus, BattleHighScore } from '@/types/battle';
import { srsService } from '@/services/srsService';
import { hanziAudio } from '@/services/hanziAudioFeedback';
import { isLocalStorageAccessible } from '@/utils/security';
import {
  Zap,
  Timer,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  BookPlus,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface TimeAttackBattleProps {
  curriculum: HskWord[];
  onWordSelect?: (word: HskWord) => void;
  onComplete?: (score: number) => void;
}

const HIGH_SCORE_STORAGE_KEY = 'hanzivibe_battle_highscore';

export const TimeAttackBattle: React.FC<TimeAttackBattleProps> = ({
  curriculum,
  onWordSelect,
  onComplete,
}) => {
  const [status, setStatus] = useState<BattleStatus>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [wrongWords, setWrongWords] = useState<HskWord[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<BattleQuestion | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<BattleHighScore | null>(null);
  const [hasAddedToSrs, setHasAddedToSrs] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load High Score from LocalStorage
  useEffect(() => {
    if (isLocalStorageAccessible()) {
      try {
        const raw = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
        if (raw) {
          setHighScore(JSON.parse(raw) as BattleHighScore);
        }
      } catch {
        // Fallback gracefully
      }
    }
  }, []);

  // Helper to generate a question from vocabulary list
  const generateQuestion = useCallback((): BattleQuestion | null => {
    if (!curriculum || curriculum.length < 4) return null;

    const randomIndex = Math.floor(Math.random() * curriculum.length);
    const targetWord = curriculum[randomIndex];

    // 50% Hanzi -> Meaning, 50% Meaning -> Hanzi
    const isHanziToMeaning = Math.random() >= 0.5;

    // Pick 3 distractors
    const otherWords = curriculum.filter((w) => w.id !== targetWord.id);
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3);

    const rawOptions = isHanziToMeaning
      ? [targetWord.vietnameseMeaning, ...distractors.map((d) => d.vietnameseMeaning)]
      : [targetWord.hanzi, ...distractors.map((d) => d.hanzi)];

    // Shuffle options
    const shuffledOptions = [...rawOptions].sort(() => 0.5 - Math.random());
    const correctIndex = shuffledOptions.indexOf(
      isHanziToMeaning ? targetWord.vietnameseMeaning : targetWord.hanzi
    );

    return {
      word: targetWord,
      prompt: isHanziToMeaning
        ? `${targetWord.hanzi} (${targetWord.pinyin})`
        : targetWord.vietnameseMeaning,
      options: shuffledOptions,
      correctIndex,
      type: isHanziToMeaning ? 'hanziToMeaning' : 'meaningToHanzi',
    };
  }, [curriculum]);

  // Start game countdown
  const handleStartBattle = useCallback(() => {
    setStatus('playing');
    setTimeLeft(60);
    setScore(0);
    setComboStreak(0);
    setHighestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongWords([]);
    setSelectedOptionIndex(null);
    setIsAnswerRevealed(false);
    setHasAddedToSrs(false);

    const firstQ = generateQuestion();
    setCurrentQuestion(firstQ);
    if (firstQ && onWordSelect) {
      onWordSelect(firstQ.word);
    }
  }, [generateQuestion, onWordSelect]);

  // Timer loop
  useEffect(() => {
    if (status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('ended');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // When battle ends, save high score if beaten
  useEffect(() => {
    if (status === 'ended') {
      const totalAnswers = correctCount + wrongCount;
      const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

      onComplete?.(score);

      if (!highScore || score > highScore.score) {
        const newRecord: BattleHighScore = {
          score,
          accuracy,
          date: new Date().toISOString().slice(0, 10),
          maxStreak: highestStreak,
        };
        setHighScore(newRecord);
        if (isLocalStorageAccessible()) {
          try {
            localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(newRecord));
          } catch {
            // Ignore storage quota
          }
        }
      }
    }
  }, [status, score, correctCount, wrongCount, highestStreak, highScore, onComplete]);

  // Handle option selection
  const handleSelectOption = async (optionIndex: number) => {
    if (isAnswerRevealed || !currentQuestion || status !== 'playing') return;

    setSelectedOptionIndex(optionIndex);
    setIsAnswerRevealed(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      await hanziAudio.playChime();
      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);
      if (newStreak > highestStreak) {
        setHighestStreak(newStreak);
      }
      setCorrectCount((prev) => prev + 1);

      // Score multiplier: 1x -> 2x -> 3x -> 4x
      const multiplier = newStreak >= 10 ? 4 : newStreak >= 6 ? 3 : newStreak >= 3 ? 2 : 1;
      setScore((prev) => prev + 100 * multiplier);
    } else {
      await hanziAudio.playMistakeBuzz();
      setComboStreak(0);
      setWrongCount((prev) => prev + 1);
      setWrongWords((prev) => [...prev, currentQuestion.word]);
    }

    // Advance to next question after small pause
    setTimeout(() => {
      setSelectedOptionIndex(null);
      setIsAnswerRevealed(false);
      const nextQ = generateQuestion();
      setCurrentQuestion(nextQ);
      if (nextQ && onWordSelect) {
        onWordSelect(nextQ.word);
      }
    }, 450);
  };

  // Save all wrong words to SRS
  const handleSaveWrongWordsToSrs = () => {
    if (wrongWords.length === 0 || hasAddedToSrs) return;

    for (const w of wrongWords) {
      srsService.reviewCard(w.id, 1); // Set to rating 1 (Forgot - reset interval)
    }
    setHasAddedToSrs(true);
  };

  // Rank title based on score
  const getRankTitle = (pts: number) => {
    if (pts >= 3500) return { title: 'Bậc Thầy Tiếng Hán 👑', color: 'text-amber-400' };
    if (pts >= 2500) return { title: 'Cao Thủ Phản Xạ ⚡', color: 'text-cyber-cyan' };
    if (pts >= 1500) return { title: 'Học Viên Xuất Sắc 🌟', color: 'text-emerald-400' };
    if (pts >= 800) return { title: 'Tân Binh Tiềm Năng 🎯', color: 'text-cyan-300' };
    return { title: 'Khởi Đầu Tốt Đẹp 🌱', color: 'text-slate-300' };
  };

  // Multiplier calculation for current streak
  const currentMultiplier =
    comboStreak >= 10 ? 4 : comboStreak >= 6 ? 3 : comboStreak >= 3 ? 2 : 1;

  // View: READY (Lobby)
  if (status === 'ready') {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-obsidian-900 border border-slate-800 rounded-3xl shadow-2xl select-none">
        <div className="w-20 h-20 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan mb-5 shadow-lg shadow-cyan-950/50 animate-pulse">
          <Zap className="w-10 h-10" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Đấu Trường Phản Xạ 60 Giây
        </h3>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Đua tốc độ chọn nhanh chữ Hán & nghĩa tiếng Việt trong vòng 60 giây. Chuỗi combo đúng liên tục sẽ kích hoạt hệ số nhân điểm lên đến <strong className="text-amber-400">×4 Combo</strong>!
        </p>

        {highScore && (
          <div className="mb-6 px-4 py-2 rounded-2xl bg-obsidian-950 border border-slate-800 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Trophy className="w-4 h-4" /> Kỷ lục cá nhân:
            </span>
            <span className="font-mono font-bold text-white text-sm">{highScore.score} điểm</span>
            <span className="text-slate-500">| Độ chuẩn: {highScore.accuracy}%</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleStartBattle}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyber-cyan text-obsidian-950 font-extrabold text-base hover:bg-cyan-300 active:scale-95 transition-all shadow-xl shadow-cyan-950/60"
        >
          <Play className="w-5 h-5 fill-obsidian-950" />
          <span>BẮT ĐẦU CHIẾN ĐẤU (60S)</span>
        </button>
      </div>
    );
  }

  // View: ENDED (Results)
  if (status === 'ended') {
    const totalAnswers = correctCount + wrongCount;
    const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
    const rank = getRankTitle(score);

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-obsidian-900 border border-slate-800 rounded-3xl shadow-2xl select-none animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <div className={`text-lg sm:text-xl font-bold ${rank.color} mb-1`}>{rank.title}</div>
        <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 font-mono tracking-tight">
          {score} <span className="text-sm font-sans font-normal text-slate-400">điểm</span>
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mb-6">
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-500 font-medium">Số câu đúng</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {correctCount} / {totalAnswers}
            </div>
          </div>
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-500 font-medium">Độ chuẩn xác</div>
            <div className="text-lg font-bold text-cyber-cyan mt-0.5">{accuracy}%</div>
          </div>
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-500 font-medium">Max Combo</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">×{highestStreak}</div>
          </div>
          <div className="bg-obsidian-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] text-slate-500 font-medium">Từ cần ôn</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">{wrongWords.length}</div>
          </div>
        </div>

        {/* Action: Save Wrong Words to SRS */}
        {wrongWords.length > 0 && (
          <div className="w-full max-w-lg mb-6 p-4 rounded-2xl bg-obsidian-950 border border-slate-800 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Các từ đã chọn sai ({wrongWords.length} từ)
              </span>
              <button
                type="button"
                onClick={handleSaveWrongWordsToSrs}
                disabled={hasAddedToSrs}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  hasAddedToSrs
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 active:scale-95'
                }`}
              >
                {hasAddedToSrs ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã lưu vào SRS!</span>
                  </>
                ) : (
                  <>
                    <BookPlus className="w-3.5 h-3.5" />
                    <span>Nạp vào SRS ôn lại</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {wrongWords.map((w, idx) => (
                <span
                  key={`${w.id}-${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
                >
                  {w.hanzi} ({w.vietnameseMeaning})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Replay Button */}
        <button
          type="button"
          onClick={handleStartBattle}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-cyber-cyan text-obsidian-950 font-extrabold text-sm hover:bg-cyan-300 active:scale-95 transition-all shadow-lg shadow-cyan-950/50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>CHIẾN LẠI VÒNG TIẾP THEO</span>
        </button>
      </div>
    );
  }

  // View: PLAYING
  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top HUD: Timer, Score & Combo Multiplier */}
      <div className="w-full flex items-center justify-between px-3 py-2 mb-4 bg-obsidian-950 border border-slate-800 rounded-2xl shadow-md">
        {/* Timer SVG Countdown */}
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                className={`transition-all duration-1000 ${
                  timeLeft <= 10
                    ? 'stroke-rose-500 animate-pulse'
                    : timeLeft <= 20
                    ? 'stroke-amber-400'
                    : 'stroke-cyber-cyan'
                }`}
                strokeWidth="3.5"
                strokeDasharray={100}
                strokeDashoffset={100 - (timeLeft / 60) * 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span
              className={`absolute font-mono text-xs font-extrabold ${
                timeLeft <= 10 ? 'text-rose-400 animate-ping-slow' : 'text-white'
              }`}
            >
              {timeLeft}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Giây</span>
        </div>

        {/* Combo Multiplier Flame Badge */}
        {comboStreak >= 3 && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold animate-bounce ${
              comboStreak >= 10
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                : comboStreak >= 6
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>
              COMBO ×{comboStreak} ({currentMultiplier}x ĐIỂM)
            </span>
          </div>
        )}

        {/* Current Score */}
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Điểm Số</div>
          <div className="text-xl font-extrabold font-mono text-white mt-0.5">{score}</div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="w-full bg-gradient-to-b from-obsidian-900 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[200px] shadow-2xl mb-5">
        <span className="text-[11px] font-bold text-cyber-cyan uppercase tracking-wider mb-2">
          {currentQuestion.type === 'hanziToMeaning'
            ? 'Chọn nghĩa tiếng Việt chính xác'
            : 'Chọn chữ Hán tương ứng'}
        </span>
        <div className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-wider my-3 text-center">
          {currentQuestion.prompt}
        </div>
      </div>

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {currentQuestion.options.map((opt, idx) => {
          let btnStyle = 'bg-obsidian-900/90 border-slate-800 text-slate-200 hover:border-cyber-cyan/50 hover:bg-slate-800/60';

          if (isAnswerRevealed) {
            if (idx === currentQuestion.correctIndex) {
              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/50';
            } else if (idx === selectedOptionIndex) {
              btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow-lg shadow-rose-950/50 animate-shake';
            }
          }

          return (
            <button
              key={`${opt}-${idx}`}
              type="button"
              disabled={isAnswerRevealed}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 rounded-2xl border-2 text-sm sm:text-base font-semibold transition-all active:scale-95 flex items-center justify-between min-h-[58px] ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswerRevealed && idx === currentQuestion.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
              )}
              {isAnswerRevealed && idx === selectedOptionIndex && idx !== currentQuestion.correctIndex && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeAttackBattle;
