/**
 * srsService.ts
 * Spaced Repetition System (SRS) Service implementing the SuperMemo SM-2 algorithm.
 * Provides offline-first resilient storage, review scheduling, and reactive subscriptions.
 */

import { SrsCard, SrsRating, SrsReviewLog, SrsStats } from '@/types/srs';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { isLocalStorageAccessible } from '@/utils/security';

const STORAGE_KEY = 'hanzivibe_srs_cards_v1';
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + days);
  return formatDateToYMD(target);
}

export class SrsService {
  private static instance: SrsService | null = null;
  private inMemoryCache: SrsCard[] = [];
  private listeners: Set<(cards: SrsCard[]) => void> = new Set();

  private constructor() {
    this.inMemoryCache = this.loadFromStorage();
    if (this.inMemoryCache.length === 0) {
      this.seedInitialCards();
    }
  }

  public static getInstance(): SrsService {
    if (!SrsService.instance) {
      SrsService.instance = new SrsService();
    }
    return SrsService.instance;
  }

  public static resetInstance(): void {
    SrsService.instance = null;
  }

  private loadFromStorage(): SrsCard[] {
    if (!isLocalStorageAccessible()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[SrsService] Failed to load cards from storage, using memory:', e);
      return [];
    }
  }

  private saveToStorage(): void {
    if (!isLocalStorageAccessible()) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryCache));
    } catch (e) {
      console.warn('[SrsService] Storage write failed, keeping in-memory state:', e);
    }
  }

  private notify(): void {
    const data = [...this.inMemoryCache];
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('[SrsService] Listener callback error:', err);
      }
    });
  }

  private seedInitialCards(): void {
    const today = formatDateToYMD(new Date());
    this.inMemoryCache = HSK_CURRICULUM.map((word) => ({
      id: `srs-${word.id}`,
      wordId: word.id,
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      sinoVietnamese: word.sinoVietnamese,
      vietnameseMeaning: word.vietnameseMeaning,
      hskLevel: word.hskLevel,
      repetition: 0,
      intervalDays: 1,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextDueDate: today,
      history: [],
    }));
    this.saveToStorage();
  }

  /**
   * SuperMemo SM-2 Interval & Ease Factor Calculation
   */
  public calculateNextReview(
    currentCard: SrsCard,
    rating: SrsRating,
    todayStr?: string
  ): {
    intervalDays: number;
    repetition: number;
    easeFactor: number;
    nextDueDate: string;
  } {
    const baseDate = todayStr || formatDateToYMD(new Date());
    let intervalDays = 1;
    let repetition = currentCard.repetition;
    let easeFactor = currentCard.easeFactor;

    if (rating === 1) {
      // Quên (Again): Reset streak
      repetition = 0;
      intervalDays = 1;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
    } else if (rating === 2) {
      // Khó (Hard): Small interval increase
      repetition += 1;
      if (repetition === 1) {
        intervalDays = 1;
      } else if (repetition === 2) {
        intervalDays = 2;
      } else {
        intervalDays = Math.max(2, Math.round(currentCard.intervalDays * 1.2));
      }
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
    } else if (rating === 3) {
      // Nhớ tốt (Good): Standard SM-2 progression
      repetition += 1;
      if (repetition === 1) {
        intervalDays = 1;
      } else if (repetition === 2) {
        intervalDays = 3;
      } else {
        intervalDays = Math.max(3, Math.round(currentCard.intervalDays * easeFactor));
      }
      // EF remains relatively stable
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);
    } else {
      // Rất dễ (Easy): Accelerated interval bonus
      repetition += 1;
      if (repetition === 1) {
        intervalDays = 2;
      } else if (repetition === 2) {
        intervalDays = 4;
      } else {
        intervalDays = Math.max(4, Math.round(currentCard.intervalDays * easeFactor * 1.3));
      }
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }

    const nextDueDate = addDaysToDate(baseDate, intervalDays);

    return {
      intervalDays,
      repetition,
      easeFactor: Number(easeFactor.toFixed(2)),
      nextDueDate,
    };
  }

  public getAllCards(): SrsCard[] {
    return [...this.inMemoryCache];
  }

  public getCards(): SrsCard[] {
    return this.getAllCards();
  }

  public getDueCards(targetDate?: string): SrsCard[] {
    const checkDate = targetDate || formatDateToYMD(new Date());
    return this.inMemoryCache.filter((card) => card.nextDueDate <= checkDate);
  }

  public getDueCount(targetDate?: string): number {
    return this.getDueCards(targetDate).length;
  }

  public reviewCard(cardIdOrWordId: string, rating: SrsRating, todayStr?: string): SrsCard | null {
    let index = this.inMemoryCache.findIndex(
      (c) => c.id === cardIdOrWordId || c.wordId === cardIdOrWordId
    );

    // If card doesn't exist yet in SRS, try finding word from curriculum and add it
    if (index === -1) {
      const foundWord = HSK_CURRICULUM.find(
        (w) => w.id === cardIdOrWordId || w.hanzi === cardIdOrWordId
      );
      if (foundWord) {
        const added = this.addCard({
          wordId: foundWord.id,
          hanzi: foundWord.hanzi,
          pinyin: foundWord.pinyin,
          sinoVietnamese: foundWord.sinoVietnamese,
          vietnameseMeaning: foundWord.vietnameseMeaning,
          hskLevel: foundWord.hskLevel,
        });
        index = this.inMemoryCache.findIndex((c) => c.id === added.id);
      }
    }

    if (index === -1) {
      return null;
    }

    const card = this.inMemoryCache[index];
    const today = todayStr || formatDateToYMD(new Date());
    const next = this.calculateNextReview(card, rating, today);

    const log: SrsReviewLog = {
      date: today,
      rating,
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
    };

    const updatedCard: SrsCard = {
      ...card,
      repetition: next.repetition,
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      nextDueDate: next.nextDueDate,
      lastReviewedDate: today,
      history: [...card.history, log].slice(-50), // Bounded to prevent LocalStorage quota exhaustion
    };

    this.inMemoryCache[index] = updatedCard;
    this.saveToStorage();
    this.notify();
    return updatedCard;
  }

  public addCard(
    data: Omit<SrsCard, 'id' | 'repetition' | 'intervalDays' | 'easeFactor' | 'nextDueDate' | 'history'> & {
      id?: string;
    }
  ): SrsCard {
    const today = formatDateToYMD(new Date());
    const existingIndex = this.inMemoryCache.findIndex((c) => c.hanzi === data.hanzi);

    if (existingIndex >= 0) {
      return this.inMemoryCache[existingIndex];
    }

    const newCard: SrsCard = {
      id: data.id || `srs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      wordId: data.wordId,
      hanzi: data.hanzi,
      pinyin: data.pinyin,
      sinoVietnamese: data.sinoVietnamese,
      vietnameseMeaning: data.vietnameseMeaning,
      hskLevel: data.hskLevel,
      repetition: 0,
      intervalDays: 1,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextDueDate: today,
      history: [],
    };

    this.inMemoryCache.unshift(newCard);
    this.saveToStorage();
    this.notify();
    return newCard;
  }

  public getStats(targetDate?: string): SrsStats {
    const checkDate = targetDate || formatDateToYMD(new Date());
    const dueToday = this.inMemoryCache.filter((c) => c.nextDueDate <= checkDate).length;
    const mastered = this.inMemoryCache.filter((c) => c.repetition >= 3).length;
    const learning = this.inMemoryCache.length - mastered;
    const totalInterval = this.inMemoryCache.reduce((sum, c) => sum + c.intervalDays, 0);
    const averageIntervalDays =
      this.inMemoryCache.length > 0 ? Math.round(totalInterval / this.inMemoryCache.length) : 1;

    return {
      totalCards: this.inMemoryCache.length,
      dueToday,
      dueTodayCount: dueToday,
      learning,
      mastered,
      masteredCount: mastered,
      averageIntervalDays,
    };
  }

  public resetAll(): void {
    this.seedInitialCards();
    this.notify();
  }

  public subscribe(listener: (cards: SrsCard[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.inMemoryCache]);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const srsService = SrsService.getInstance();
export default srsService;
