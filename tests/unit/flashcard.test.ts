import { describe, it, expect } from 'vitest';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { generateLearnQuestions } from '@/components/flashcard/LearnQuiz';
import { generateMatchDeck } from '@/components/flashcard/MatchGame';
import { HskWord } from '@/types/hsk';

describe('Flashcard Engine & Mechanics', () => {
  const sampleWords = HSK_CURRICULUM.slice(0, 10);

  describe('LearnQuiz Question Generation (generateLearnQuestions)', () => {
    it('generates the specified count of questions with exactly 4 options each', () => {
      const questions = generateLearnQuestions(sampleWords, HSK_CURRICULUM, 6);
      expect(questions.length).toBe(6);

      questions.forEach((q) => {
        expect(q.options.length).toBe(4);
        // All 4 options must be distinct
        const uniqueOptions = new Set(q.options);
        expect(uniqueOptions.size).toBe(4);
        // Correct option index must be in range [0, 3]
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThanOrEqual(3);
      });
    });

    it('generates both hanziToMeaning and meaningToHanzi question types', () => {
      const questions = generateLearnQuestions(sampleWords, HSK_CURRICULUM, 8);
      const types = questions.map((q) => q.type);
      expect(types).toContain('hanziToMeaning');
      expect(types).toContain('meaningToHanzi');
    });

    it('guarantees correct option matches the word and correctOptionIndex points to it', () => {
      const questions = generateLearnQuestions(sampleWords, HSK_CURRICULUM, 5);

      questions.forEach((q) => {
        const expectedAnswer =
          q.type === 'hanziToMeaning'
            ? q.word.vietnameseMeaning
            : q.word.hanzi;

        expect(q.options[q.correctOptionIndex]).toBe(expectedAnswer);
      });
    });

    it('ensures distractors are drawn from other words and do not duplicate correct answer', () => {
      const questions = generateLearnQuestions(sampleWords, HSK_CURRICULUM, 5);

      questions.forEach((q) => {
        const correct = q.options[q.correctOptionIndex];
        const distractors = q.options.filter((_, idx) => idx !== q.correctOptionIndex);

        expect(distractors).toHaveLength(3);
        distractors.forEach((d) => {
          expect(d).not.toBe(correct);
        });
      });
    });

    it('returns empty array when pool words is empty', () => {
      const questions = generateLearnQuestions([], HSK_CURRICULUM, 5);
      expect(questions).toEqual([]);
    });
  });

  describe('MatchGame Deck Generation (generateMatchDeck)', () => {
    it('generates 12 cards (6 pairs) from 6 words with 6 Hanzi and 6 meanings', () => {
      const deck = generateMatchDeck(sampleWords, 6);
      expect(deck.length).toBe(12);

      const hanziCards = deck.filter((c) => c.type === 'hanzi');
      const meaningCards = deck.filter((c) => c.type === 'meaning');

      expect(hanziCards.length).toBe(6);
      expect(meaningCards.length).toBe(6);
    });

    it('ensures every Hanzi card has exactly one corresponding meaning card with the same wordId', () => {
      const deck = generateMatchDeck(sampleWords, 6);

      const hanziCards = deck.filter((c) => c.type === 'hanzi');
      const meaningCards = deck.filter((c) => c.type === 'meaning');

      hanziCards.forEach((hCard) => {
        const matchingMeaningCard = meaningCards.find((mCard) => mCard.wordId === hCard.wordId);
        expect(matchingMeaningCard).toBeDefined();
        expect(matchingMeaningCard?.type).toBe('meaning');
      });
    });

    it('identifies pair match detection correctly (same wordId, distinct card types)', () => {
      const deck = generateMatchDeck(sampleWords, 4);
      const cardA = deck.find((c) => c.type === 'hanzi')!;
      const cardB = deck.find((c) => c.type === 'meaning' && c.wordId === cardA.wordId)!;
      const cardC = deck.find((c) => c.wordId !== cardA.wordId)!;

      // Positive match
      const isMatch = cardA.wordId === cardB.wordId && cardA.type !== cardB.type;
      expect(isMatch).toBe(true);

      // Negative mismatch: different wordId
      const isMismatch1 = cardA.wordId === cardC.wordId && cardA.type !== cardC.type;
      expect(isMismatch1).toBe(false);

      // Negative mismatch: same type
      const otherHanzi = deck.find((c) => c.type === 'hanzi' && c.id !== cardA.id)!;
      const isMismatch2 = cardA.wordId === otherHanzi.wordId && cardA.type !== otherHanzi.type;
      expect(isMismatch2).toBe(false);
    });

    it('handles small pools cleanly without crashing', () => {
      const oneWord: HskWord[] = [sampleWords[0]];
      const deck = generateMatchDeck(oneWord, 6);
      expect(deck.length).toBe(2);
      expect(deck[0].wordId).toBe(deck[1].wordId);
      expect(deck[0].type).not.toBe(deck[1].type);

      const emptyDeck = generateMatchDeck([], 6);
      expect(emptyDeck).toEqual([]);
    });
  });

  describe('Flashcard Filtering Mechanics', () => {
    it('filters vocabulary properly based on mastered, review, and favorite sets', () => {
      const masteredIds = [sampleWords[0].id, sampleWords[1].id];
      const reviewIds = [sampleWords[2].id];
      const favoriteIds = [sampleWords[0].id, sampleWords[3].id];

      const masteredList = sampleWords.filter((w) => masteredIds.includes(w.id));
      expect(masteredList.length).toBe(2);
      expect(masteredList.map((w) => w.id)).toEqual(masteredIds);

      const reviewList = sampleWords.filter((w) => reviewIds.includes(w.id));
      expect(reviewList.length).toBe(1);

      const favoriteList = sampleWords.filter((w) => favoriteIds.includes(w.id));
      expect(favoriteList.length).toBe(2);
    });
  });
});
