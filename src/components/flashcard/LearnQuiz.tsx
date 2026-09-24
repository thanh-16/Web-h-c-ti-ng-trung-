'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HskWord } from '@/types/hsk';
import { LearnQuestion, QuizSummary } from '@/types/flashcard';
import { hanziAudio } from '@/services/hanziAudioFeedback';
import { SpeechService } from '@/services/speechService';
import { progressService } from '@/services/progressService';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  ArrowRight,
  Trophy,
  BookOpen,
} from 'lucide-react';

interface LearnQuizProps {
  words: HskWord[];
  allWords: HskWord[];
  onWordSelect?: (word: HskWord) => void;
}

/**
 * Pure generator for 4-choice questions with authentic distractors
 */
export function generateLearnQuestions(
  poolWords: HskWord[],
  allCurriculumWords: HskWord[],
  count: number = 10
): LearnQuestion[] {
  if (poolWords.length === 0) return [];

  // Limit question count to pool size or requested count
  const questionCount = Math.min(poolWords.length, count);
  // Pick random subset
  const shuffledPool = [...poolWords].sort(() => Math.random() - 0.5);
  const targetWords = shuffledPool.slice(0, questionCount);

  return targetWords.map((word, index) => {
    // Alternate between Hanzi -> Meaning and Meaning -> Hanzi
    const type: 'hanziToMeaning' | 'meaningToHanzi' =
      index % 2 === 0 ? 'hanziToMeaning' : 'meaningToHanzi';

    const correctAnswer =
      type === 'hanziToMeaning' ? word.vietnameseMeaning : word.hanzi;

    // Distractors must come from other words in the curriculum
    const eligibleDistractorWords = allCurriculumWords.filter((w) => w.id !== word.id);
    const shuffledDistractors = [...eligibleDistractorWords].sort(() => Math.random() - 0.5);

    const distractorAnswers: string[] = [];
    for (const distractorWord of shuffledDistractors) {
      const candidate =
        type === 'hanziToMeaning'
          ? distractorWord.vietnameseMeaning
          : distractorWord.hanzi;
      if (candidate !== correctAnswer && !distractorAnswers.includes(candidate)) {
        distractorAnswers.push(candidate);
      }
      if (distractorAnswers.length === 3) break;
    }

    // Combine correct + 3 distractors and shuffle
    const options = [correctAnswer, ...distractorAnswers].sort(() => Math.random() - 0.5);
    const correctOptionIndex = options.indexOf(correctAnswer);

    return {
      word,
      options,
      correctOptionIndex,
      type,
    };
  });
}

export const LearnQuiz: React.FC<LearnQuizProps> = ({
  words,
  allWords,
  onWordSelect,
}) => {
  const [questions, setQuestions] = useState<LearnQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<HskWord[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize questions
  const initQuiz = useCallback(
    (customWords?: HskWord[]) => {
      const targetPool = customWords || words;
      const generated = generateLearnQuestions(targetPool, allWords, 10);
      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setWrongWords([]);
      setIsCompleted(false);
    },
    [words, allWords]
  );

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = async (optionIndex: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQ.correctOptionIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      await hanziAudio.playChime();
    } else {
      setWrongWords((prev) => [...prev, currentQ.word]);
      await hanziAudio.playMistakeBuzz();
      // Mark as review word automatically
      progressService.toggleReview(currentQ.word.id);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      // Record practice stats
      progressService.recordActivity({
        practiceTimeSec: 60,
      });
      if (score >= Math.ceil(questions.length * 0.8)) {
        hanziAudio.playVictoryFanfare();
      }
    }
  };

  const handlePlayAudio = async (text: string) => {
    await SpeechService.getInstance().speak(text);
  };

  if (words.length < 4 && allWords.length < 4) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-obsidian-900 border border-slate-800 rounded-3xl min-h-[380px]">
        <HelpCircle className="w-12 h-12 text-slate-500 mb-3" />
        <h4 className="text-base font-semibold text-slate-300">Cần tối thiểu 4 từ vựng để tạo bài kiểm tra</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Vui lòng chuyển sang bộ lọc "Tất cả từ" hoặc chọn thêm từ vựng để bắt đầu bài trắc nghiệm.
        </p>
      </div>
    );
  }

  // Completion Summary Screen
  if (isCompleted) {
    const percentage = Math.round((score / Math.max(1, questions.length)) * 100);
    const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;

    return (
      <div className="w-full max-w-xl mx-auto bg-obsidian-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan mb-4 glow-cyan">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight">Hoàn Thành Bài Luyện Tập!</h3>
        <p className="text-xs text-slate-400 mt-1">Kết quả kiểm tra từ vựng HSK của bạn</p>

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

        {/* Score & Percentage */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3 rounded-2xl bg-obsidian-950 border border-slate-800">
            <div className="text-2xl font-bold text-white font-mono">{score}</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Số câu đúng</div>
          </div>
          <div className="p-3 rounded-2xl bg-obsidian-950 border border-slate-800">
            <div className="text-2xl font-bold text-white font-mono">{questions.length - score}</div>
            <div className="text-[11px] text-red-400 font-medium mt-0.5">Số câu sai</div>
          </div>
          <div className="p-3 rounded-2xl bg-obsidian-950 border border-slate-800">
            <div className="text-2xl font-bold text-cyber-cyan font-mono">{percentage}%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Độ chính xác</div>
          </div>
        </div>

        {/* Wrong Words List */}
        {wrongWords.length > 0 && (
          <div className="text-left mt-6 mb-6 p-4 rounded-2xl bg-obsidian-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Từ vựng cần ôn lại ({wrongWords.length} từ)</span>
              </span>
              <span className="text-[10px] text-slate-500">Đã tự động thêm vào mục Cần Ôn</span>
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {wrongWords.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-serif font-bold text-white">{w.hanzi}</span>
                    <span className="text-cyber-cyan font-mono">{w.pinyin}</span>
                    <span className="text-slate-400">({w.sinoVietnamese})</span>
                  </div>
                  <div className="text-slate-300 font-medium text-right max-w-[180px] truncate">
                    {w.vietnameseMeaning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => initQuiz()}
            className="px-6 py-3 rounded-2xl bg-cyber-cyan text-obsidian-950 font-bold text-sm hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện tập lượt mới</span>
          </button>

          {wrongWords.length > 0 && (
            <button
              type="button"
              onClick={() => initQuiz(wrongWords)}
              className="px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-sm hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chỉ ôn các từ đã sai ({wrongWords.length})</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col select-none">
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-slate-300 font-semibold">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-slate-400">
            {currentQ.type === 'hanziToMeaning' ? 'Nhìn chữ Hán chọn nghĩa' : 'Nhìn nghĩa chọn chữ Hán'}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-emerald-400 font-bold">{score} đúng</span>
          <span className="text-slate-600">•</span>
          <span className="text-red-400">{wrongWords.length} sai</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyber-cyan to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-b from-obsidian-900 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-cyber-cyan uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30">
            HSK {currentQ.word.hskLevel} • Thanh {currentQ.word.tone}
          </span>

          <button
            type="button"
            onClick={() => handlePlayAudio(currentQ.word.hanzi)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4 text-cyber-cyan" />
          </button>
        </div>

        {/* Prompt Presentation */}
        <div className="text-center py-4">
          {currentQ.type === 'hanziToMeaning' ? (
            <>
              <div className="text-6xl sm:text-7xl font-serif font-extrabold text-white tracking-wider">
                {currentQ.word.hanzi}
              </div>
              <div className="mt-2 text-lg font-mono text-cyber-cyan font-semibold">
                {currentQ.word.pinyin}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Âm Hán Việt: <span className="text-amber-400 font-semibold">{currentQ.word.sinoVietnamese}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Nghĩa & Âm Hán Việt
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {currentQ.word.vietnameseMeaning}
              </div>
              <div className="mt-2 text-sm text-slate-400 font-mono">
                Âm Hán Việt: <span className="text-amber-400 font-semibold">{currentQ.word.sinoVietnamese}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4 Multiple-Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctOptionIndex;

          let optionStyle =
            'bg-obsidian-900 border-slate-800 text-slate-200 hover:border-cyber-cyan/50 hover:bg-slate-800/60';

          if (isAnswered) {
            if (isCorrect) {
              optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'bg-red-500/20 border-red-500 text-red-300';
            } else {
              optionStyle = 'bg-obsidian-950/60 border-slate-800/60 text-slate-600 opacity-60';
            }
          }

          return (
            <button
              key={option + idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[58px] ${optionStyle} ${
                currentQ.type === 'meaningToHanzi' ? 'justify-center text-center font-serif text-3xl font-bold' : ''
              }`}
            >
              <span className="text-sm font-semibold">{option}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Advance Button (Visible once answered) */}
      {isAnswered && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-cyber-cyan text-obsidian-950 font-bold text-sm hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LearnQuiz;
