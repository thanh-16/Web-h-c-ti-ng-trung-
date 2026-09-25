/**
 * srs.ts
 * Type definitions for Spaced Repetition System (SRS) using SuperMemo SM-2 Algorithm
 */

export type SrsRating = 1 | 2 | 3 | 4; // 1: Quên (Again), 2: Khó (Hard), 3: Nhớ tốt (Good), 4: Rất dễ (Easy)

export interface SrsReviewLog {
  date: string;
  rating: SrsRating;
  intervalDays: number;
  easeFactor: number;
}

export interface SrsCard {
  id: string;
  wordId: string;
  hanzi: string;
  pinyin: string;
  sinoVietnamese: string;
  vietnameseMeaning: string;
  hskLevel?: number;
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  nextDueDate: string; // Format: YYYY-MM-DD
  lastReviewedDate?: string;
  history: SrsReviewLog[];
}

export interface SrsStats {
  totalCards: number;
  dueToday: number;
  dueTodayCount?: number;
  learning: number; // repetition < 3
  mastered: number; // repetition >= 3
  masteredCount?: number;
  averageIntervalDays?: number;
}
