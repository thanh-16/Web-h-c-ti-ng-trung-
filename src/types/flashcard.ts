/**
 * flashcard.ts
 * Type definitions for Quizlet-style Flashcard Hub: 3D Flip, Learn Quiz, and Match Game
 */

import { HskWord } from './hsk';

export type FlashcardMode = 'flip' | 'learn' | 'match';

export type FlashcardFilter = 'all' | 'mastered' | 'review' | 'favorite';

export interface MatchCard {
  id: string;
  wordId: string;
  type: 'hanzi' | 'meaning';
  content: string;
  subContent?: string; // Pinyin or Sino-Vietnamese for auxiliary hint
  isMatched: boolean;
  isSelected: boolean;
  isError?: boolean;
}

export type LearnQuestionType = 'hanziToMeaning' | 'meaningToHanzi';

export interface LearnQuestion {
  word: HskWord;
  options: string[];
  correctOptionIndex: number;
  type: LearnQuestionType;
}

export interface QuizSummary {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  wrongWords: HskWord[];
}

export interface MatchGameState {
  cards: MatchCard[];
  selectedCardIds: string[];
  matchedPairCount: number;
  totalPairs: number;
  moves: number;
  elapsedSeconds: number;
  isCompleted: boolean;
  stars: number;
}
