/**
 * battle.ts
 * Type definitions for 60-Second Time-Attack Vocab Battle
 */

import { HskWord } from './hsk';

export type BattleQuestionType = 'hanziToMeaning' | 'meaningToHanzi';

export interface BattleQuestion {
  word: HskWord;
  prompt: string;
  options: string[];
  correctIndex: number;
  type: BattleQuestionType;
}

export type BattleStatus = 'ready' | 'playing' | 'ended';

export interface BattleState {
  status: BattleStatus;
  timeLeft: number;
  score: number;
  comboStreak: number;
  highestStreak: number;
  correctCount: number;
  wrongCount: number;
  wrongWords: HskWord[];
  currentQuestion: BattleQuestion | null;
}

export interface BattleHighScore {
  score: number;
  accuracy: number;
  date: string;
  maxStreak: number;
}
