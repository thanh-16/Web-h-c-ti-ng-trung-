/**
 * tests/stress/flashcard.stress.test.ts
 * Challenger M4_1 Empirical Adversarial Stress Test Suite
 * 
 * Target Verification Dimensions:
 * 1. Empty deck / 1-word deck handling in FlipCard and FlashcardHub without crashing.
 * 2. Distractor generation with duplicate avoidance (20+ consecutive runs, 4 unique options, no undefined).
 * 3. Bidirectional questions: Hanzi -> Vietnamese & Vietnamese -> Hanzi quiz accuracy and score calculation.
 * 4. Match Game edge cases: card count invariance, shuffle randomness, duplicate card id prevention,
 *    matching pair detection, mismatch reset timeout, and rapid click spam resilience.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FlipCard } from '@/components/flashcard/FlipCard';
import { LearnQuiz, generateLearnQuestions } from '@/components/flashcard/LearnQuiz';
import { MatchGame, generateMatchDeck } from '@/components/flashcard/MatchGame';
import { FlashcardHub } from '@/components/flashcard/FlashcardHub';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { ProgressService, progressService } from '@/services/progressService';
import { SpeechService } from '@/services/speechService';
import { hanziAudio } from '@/services/hanziAudioFeedback';
import { HskWord } from '@/types/hsk';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Challenger M4_1: Flashcard Hub Empirical Adversarial Stress Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  const sampleWords: HskWord[] = HSK_CURRICULUM.slice(0, 10);
  const singleWord: HskWord = sampleWords[0];

  beforeEach(() => {
    localStorage.clear();
    ProgressService.resetInstance();

    // Mock audio and speech services
    vi.spyOn(SpeechService.getInstance(), 'speak').mockResolvedValue(undefined);
    vi.spyOn(hanziAudio, 'playChime').mockResolvedValue(undefined);
    vi.spyOn(hanziAudio, 'playMistakeBuzz').mockResolvedValue(undefined);
    vi.spyOn(hanziAudio, 'playVictoryFanfare').mockResolvedValue(undefined);

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root.unmount();
      });
      container.remove();
      container = null;
      root = null;
    }
    vi.useRealTimers();
  });

  // =========================================================================
  // SUITE 1: Empty Deck and 1-Word Deck Handling
  // =========================================================================
  describe('1. Empty Deck & 1-Word Deck Handling (FlipCard & FlashcardHub)', () => {
    it('1.1 FlipCard with empty deck [] renders fallback UI and does not crash on keyboard or clicks', () => {
      const onWordChangeSpy = vi.fn();

      act(() => {
        root.render(
          React.createElement(FlipCard, {
            words: [],
            onWordChange: onWordChangeSpy,
          })
        );
      });

      expect(container?.textContent).toContain('Không có thẻ từ vựng nào');
      expect(container?.textContent).toContain('Vui lòng chọn danh mục khác hoặc kiểm tra lại bộ lọc thẻ của bạn.');
      expect(onWordChangeSpy).not.toHaveBeenCalled();

      // Dispatch keyboard events (Space, Enter, ArrowRight, ArrowLeft)
      expect(() => {
        act(() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
        });
      }).not.toThrow();

      // Ensure no word was selected
      expect(onWordChangeSpy).not.toHaveBeenCalled();
    });

    it('1.2 FlipCard with 1-word deck remains strictly in bounds over 50 consecutive Next, Prev, and Shuffle actions', () => {
      const onWordChangeSpy = vi.fn();

      act(() => {
        root.render(
          React.createElement(FlipCard, {
            words: [singleWord],
            onWordChange: onWordChangeSpy,
          })
        );
      });

      expect(container?.textContent).toContain(singleWord.hanzi);
      expect(container?.textContent).toContain(singleWord.pinyin);
      expect(container?.textContent).toContain('1 / 1');
      expect(onWordChangeSpy).toHaveBeenCalledWith(singleWord);

      // Locate navigation buttons
      const nextBtn = container?.querySelector('button[aria-label="Thẻ tiếp theo"]') as HTMLButtonElement;
      const prevBtn = container?.querySelector('button[aria-label="Thẻ trước"]') as HTMLButtonElement;
      const shuffleBtn = container?.querySelector('button[aria-label="Xáo trộn thẻ"]') as HTMLButtonElement;
      const flipBtn = container?.querySelector('div[role="button"]') as HTMLDivElement;

      expect(nextBtn).toBeTruthy();
      expect(prevBtn).toBeTruthy();
      expect(shuffleBtn).toBeTruthy();
      expect(flipBtn).toBeTruthy();

      // Spam 50 Next clicks
      for (let i = 0; i < 50; i++) {
        act(() => {
          nextBtn.click();
        });
      }
      expect(container?.textContent).toContain('1 / 1');
      expect(container?.textContent).toContain(singleWord.hanzi);

      // Spam 50 Prev clicks
      for (let i = 0; i < 50; i++) {
        act(() => {
          prevBtn.click();
        });
      }
      expect(container?.textContent).toContain('1 / 1');
      expect(container?.textContent).toContain(singleWord.hanzi);

      // Spam 20 Shuffle clicks (should early exit when deck.length <= 1)
      for (let i = 0; i < 20; i++) {
        act(() => {
          shuffleBtn.click();
        });
      }
      expect(container?.textContent).toContain('1 / 1');

      // Test 3D Flip toggle
      act(() => {
        flipBtn.click();
      });
      // Back face is visible
      expect(container?.textContent).toContain(singleWord.vietnameseMeaning);

      // Flip back to front
      act(() => {
        flipBtn.click();
      });
      expect(container?.textContent).toContain(singleWord.hanzi);
    });

    it('1.3 FlashcardHub with empty curriculum [] renders gracefully across all 3 modes and filters', () => {
      act(() => {
        root.render(
          React.createElement(FlashcardHub, {
            curriculum: [],
          })
        );
      });

      // Filter chips show (0)
      expect(container?.textContent).toContain('Tất cả (0)');
      expect(container?.textContent).toContain('Đã thuộc (0)');
      expect(container?.textContent).toContain('Cần ôn lại (0)');
      expect(container?.textContent).toContain('Đã đánh dấu (0)');

      // Mode 1: Flip Card empty state
      expect(container?.textContent).toContain('Không có thẻ từ vựng nào');

      // Switch to Mode 2: Learn Quiz
      const modeButtons = container?.querySelectorAll('div.flex.items-center button');
      expect(modeButtons?.length).toBeGreaterThanOrEqual(3);

      const learnModeBtn = Array.from(modeButtons || []).find((b) =>
        b.textContent?.includes('Luyện tập Quiz')
      ) as HTMLButtonElement;
      expect(learnModeBtn).toBeTruthy();

      act(() => {
        learnModeBtn.click();
      });
      // When words < 4 and allWords < 4, LearnQuiz shows minimum words requirement
      expect(container?.textContent).toContain('Cần tối thiểu 4 từ vựng để tạo bài kiểm tra');

      // Switch to Mode 3: Match Game
      const matchModeBtn = Array.from(modeButtons || []).find((b) =>
        b.textContent?.includes('Ghép từ tốc độ')
      ) as HTMLButtonElement;
      expect(matchModeBtn).toBeTruthy();

      act(() => {
        matchModeBtn.click();
      });
      // When words < 2, MatchGame shows minimum pairs requirement
      expect(container?.textContent).toContain('Cần tối thiểu 2 từ vựng để chơi ghép từ');
    });

    it('1.4 FlashcardHub with 1-word curriculum functions properly and updates mastery counts dynamically', () => {
      act(() => {
        root.render(
          React.createElement(FlashcardHub, {
            curriculum: [singleWord],
          })
        );
      });

      expect(container?.textContent).toContain('Tất cả (1)');
      expect(container?.textContent).toContain('Đã thuộc (0)');

      // Mark single word as mastered
      const masteredToggleBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Đánh dấu Đã Thuộc')
      );
      expect(masteredToggleBtn).toBeTruthy();

      act(() => {
        masteredToggleBtn?.click();
      });

      // Pub/Sub should update the FlashcardHub filter count
      expect(progressService.isMastered(singleWord.id)).toBe(true);
      expect(container?.textContent).toContain('Đã thuộc (1)');
    });

    it('1.5 FlashcardHub filter switching when active filter has 0 matching words renders fallback without crash', () => {
      act(() => {
        root.render(
          React.createElement(FlashcardHub, {
            curriculum: sampleWords, // 10 words
          })
        );
      });

      // Initially no words are in review
      expect(container?.textContent).toContain('Cần ôn lại (0)');

      // Click "Cần ôn lại (0)" filter
      const reviewFilterBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Cần ôn lại (0)')
      );
      expect(reviewFilterBtn).toBeTruthy();

      act(() => {
        reviewFilterBtn?.click();
      });

      // Flip card displays empty fallback
      expect(container?.textContent).toContain('Không có thẻ từ vựng nào');

      // Switch back to "Tất cả"
      const allFilterBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Tất cả (10)')
      );
      expect(allFilterBtn).toBeTruthy();

      act(() => {
        allFilterBtn?.click();
      });

      // Restores cards
      expect(container?.textContent).toContain('1 / 10');
    });
  });

  // =========================================================================
  // SUITE 2: Distractor Generation & Duplicate Avoidance
  // =========================================================================
  describe('2. Distractor Generation with Duplicate Avoidance (20+ Runs)', () => {
    it('2.1 executes 20 consecutive runs ensuring 4 unique options, no undefined/null/empty, and accurate answers', () => {
      for (let run = 1; run <= 20; run++) {
        const questions = generateLearnQuestions(sampleWords, HSK_CURRICULUM, 10);
        expect(questions.length).toBe(10);

        questions.forEach((q, qIndex) => {
          // Invariant 1: Exactly 4 options
          expect(q.options.length, `Run ${run} Q${qIndex}: options length must be 4`).toBe(4);

          // Invariant 2: 4 strictly unique options (no duplicates)
          const uniqueSet = new Set(q.options);
          expect(uniqueSet.size, `Run ${run} Q${qIndex}: options must be distinct`).toBe(4);

          // Invariant 3: No undefined, null, or whitespace-only options
          q.options.forEach((opt, optIndex) => {
            expect(opt, `Run ${run} Q${qIndex} Opt${optIndex} must be defined`).toBeDefined();
            expect(typeof opt).toBe('string');
            expect(opt.trim().length, `Run ${run} Q${qIndex} Opt${optIndex} must not be empty`).toBeGreaterThan(0);
          });

          // Invariant 4: correctOptionIndex is within [0, 3]
          expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctOptionIndex).toBeLessThanOrEqual(3);

          // Invariant 5: options[correctOptionIndex] strictly matches the target answer
          const targetAnswer =
            q.type === 'hanziToMeaning' ? q.word.vietnameseMeaning : q.word.hanzi;
          expect(q.options[q.correctOptionIndex]).toBe(targetAnswer);

          // Invariant 6: Distractors do not contain target answer
          const distractors = q.options.filter((_, idx) => idx !== q.correctOptionIndex);
          expect(distractors).toHaveLength(3);
          distractors.forEach((d) => {
            expect(d).not.toBe(targetAnswer);
          });
        });
      }
    });

    it('2.2 executes 20 consecutive runs with minimum pool threshold (4 words)', () => {
      const minimumPool = sampleWords.slice(0, 4);

      for (let run = 1; run <= 20; run++) {
        const questions = generateLearnQuestions(minimumPool, HSK_CURRICULUM, 4);
        expect(questions.length).toBe(4);

        questions.forEach((q) => {
          expect(q.options.length).toBe(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.options[q.correctOptionIndex]).toBe(
            q.type === 'hanziToMeaning' ? q.word.vietnameseMeaning : q.word.hanzi
          );
        });
      }
    });

    it('2.3 adversarially handles duplicate meanings across different words without duplicating options', () => {
      // Create artificial curriculum where two words have identical meanings
      const customCurriculum: HskWord[] = [
        {
          ...sampleWords[0],
          id: 'dup-word-1',
          hanzi: '你好',
          vietnameseMeaning: 'Xin chào',
        },
        {
          ...sampleWords[1],
          id: 'dup-word-2',
          hanzi: '您好',
          vietnameseMeaning: 'Xin chào', // Identical meaning!
        },
        {
          ...sampleWords[2],
          id: 'dup-word-3',
          hanzi: '再见',
          vietnameseMeaning: 'Tạm biệt',
        },
        {
          ...sampleWords[3],
          id: 'dup-word-4',
          hanzi: '谢谢',
          vietnameseMeaning: 'Cảm ơn',
        },
        {
          ...sampleWords[4],
          id: 'dup-word-5',
          hanzi: '不客气',
          vietnameseMeaning: 'Không có chi',
        },
      ];

      const questions = generateLearnQuestions([customCurriculum[0]], customCurriculum, 1);
      expect(questions.length).toBe(1);

      const q = questions[0];
      // Even with duplicate meaning words in curriculum, options must have 4 UNIQUE strings
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      // "Xin chào" must only appear ONCE in options
      const occurrences = q.options.filter((opt) => opt === 'Xin chào').length;
      expect(occurrences).toBe(1);
    });

    it('2.4 gracefully handles empty or degenerate pool inputs', () => {
      expect(generateLearnQuestions([], HSK_CURRICULUM, 5)).toEqual([]);
      expect(generateLearnQuestions(sampleWords, HSK_CURRICULUM, 0)).toEqual([]);

      // Oversized count requested is capped to pool size
      const smallPool = sampleWords.slice(0, 3);
      const questions = generateLearnQuestions(smallPool, HSK_CURRICULUM, 50);
      expect(questions.length).toBe(3);
    });
  });

  // =========================================================================
  // SUITE 3: Bidirectional Questions & Quiz Scoring Accuracy
  // =========================================================================
  describe('3. Bidirectional Questions & Quiz Scoring Accuracy', () => {
    it('3.1 validates alternating question type parity across 30 questions', () => {
      const questions = generateLearnQuestions(HSK_CURRICULUM.slice(0, 30), HSK_CURRICULUM, 30);
      expect(questions.length).toBe(30);

      questions.forEach((q, idx) => {
        if (idx % 2 === 0) {
          expect(q.type).toBe('hanziToMeaning');
          expect(q.options[q.correctOptionIndex]).toBe(q.word.vietnameseMeaning);
        } else {
          expect(q.type).toBe('meaningToHanzi');
          expect(q.options[q.correctOptionIndex]).toBe(q.word.hanzi);
        }
      });

      const hanziToMeaningCount = questions.filter((q) => q.type === 'hanziToMeaning').length;
      const meaningToHanziCount = questions.filter((q) => q.type === 'meaningToHanzi').length;
      expect(hanziToMeaningCount).toBe(15);
      expect(meaningToHanziCount).toBe(15);
    });

    it('3.2 simulates interactive quiz with 100% correct answers, verifying score accumulation and victory fanfare', async () => {
      const testWords = sampleWords.slice(0, 4);

      act(() => {
        root.render(
          React.createElement(LearnQuiz, {
            words: testWords,
            allWords: HSK_CURRICULUM,
          })
        );
      });

      // Question 1: check initial state
      expect(container?.textContent).toContain('Câu 1 / 4');

      // Step through all 4 questions answering correctly
      for (let q = 1; q <= 4; q++) {
        const isHanziToMeaning = container?.textContent?.includes('Nhìn chữ Hán chọn nghĩa');
        let matchingTargetWord: HskWord | undefined;
        let expectedAnswer = '';

        if (isHanziToMeaning) {
          const promptHanzi = container?.querySelector('div.text-center.py-4 .font-serif')?.textContent?.trim();
          matchingTargetWord = testWords.find((w) => w.hanzi === promptHanzi);
          expectedAnswer = matchingTargetWord!.vietnameseMeaning;
        } else {
          const promptMeaning = container?.querySelector('div.text-center.py-4 .font-bold.text-white')?.textContent?.trim();
          matchingTargetWord = testWords.find((w) => w.vietnameseMeaning === promptMeaning);
          expectedAnswer = matchingTargetWord!.hanzi;
        }

        expect(matchingTargetWord).toBeDefined();

        // Find option buttons (4 options)
        const optionButtons = Array.from(
          container?.querySelectorAll('div.grid.grid-cols-1 button') || []
        ) as HTMLButtonElement[];
        expect(optionButtons.length).toBe(4);

        const correctBtn = optionButtons.find(
          (btn) => btn.querySelector('span.font-semibold')?.textContent?.trim() === expectedAnswer
        );
        expect(correctBtn).toBeTruthy();

        // Click correct option
        await act(async () => {
          correctBtn?.click();
        });

        // Verify score incremented
        expect(container?.textContent).toContain(`${q} đúng`);
        expect(hanziAudio.playChime).toHaveBeenCalledTimes(q);

        // Advance to next question (or finish)
        const advanceBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
          b.textContent?.includes('Câu tiếp theo') || b.textContent?.includes('Xem kết quả')
        );
        expect(advanceBtn).toBeTruthy();

        act(() => {
          advanceBtn?.click();
        });
      }

      // Quiz completed!
      expect(container?.textContent).toContain('Hoàn Thành Bài Luyện Tập!');
      expect(container?.textContent).toContain('Số câu đúng');
      expect(container?.textContent).toContain('100%');
      expect(container?.textContent).toContain('★');
      expect(hanziAudio.playVictoryFanfare).toHaveBeenCalledTimes(1);
    });

    it('3.3 simulates interactive quiz with wrong answers, verifying mistake tracking and remediation mode', async () => {
      const testWords = sampleWords.slice(0, 4);

      act(() => {
        root.render(
          React.createElement(LearnQuiz, {
            words: testWords,
            allWords: HSK_CURRICULUM,
          })
        );
      });

      // Question 1: deliberately pick a WRONG option
      const isHanziToMeaningQ1 = container?.textContent?.includes('Nhìn chữ Hán chọn nghĩa');
      let matchingTargetWordQ1: HskWord | undefined;
      let correctAnswerQ1 = '';

      if (isHanziToMeaningQ1) {
        const promptHanzi = container?.querySelector('div.text-center.py-4 .font-serif')?.textContent?.trim();
        matchingTargetWordQ1 = testWords.find((w) => w.hanzi === promptHanzi);
        correctAnswerQ1 = matchingTargetWordQ1!.vietnameseMeaning;
      } else {
        const promptMeaning = container?.querySelector('div.text-center.py-4 .font-bold.text-white')?.textContent?.trim();
        matchingTargetWordQ1 = testWords.find((w) => w.vietnameseMeaning === promptMeaning);
        correctAnswerQ1 = matchingTargetWordQ1!.hanzi;
      }

      expect(matchingTargetWordQ1).toBeDefined();

      const optionButtonsQ1 = Array.from(
        container?.querySelectorAll('div.grid.grid-cols-1 button') || []
      ) as HTMLButtonElement[];
      expect(optionButtonsQ1.length).toBe(4);

      // Find an incorrect option button
      const wrongBtn = optionButtonsQ1.find(
        (btn) => btn.querySelector('span.font-semibold')?.textContent?.trim() !== correctAnswerQ1
      );
      expect(wrongBtn).toBeTruthy();

      await act(async () => {
        wrongBtn?.click();
      });

      // Score stays 0, wrong count = 1
      expect(container?.textContent).toContain('0 đúng');
      expect(container?.textContent).toContain('1 sai');
      expect(hanziAudio.playMistakeBuzz).toHaveBeenCalledTimes(1);

      // Verify wrong word was added to progressService review set
      expect(progressService.isReview(matchingTargetWordQ1!.id)).toBe(true);

      // Advance through remaining 3 questions (answer correctly)
      for (let q = 2; q <= 4; q++) {
        const advanceBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
          b.textContent?.includes('Câu tiếp theo') || b.textContent?.includes('Xem kết quả')
        );
        act(() => {
          advanceBtn?.click();
        });

        const isH2M = container?.textContent?.includes('Nhìn chữ Hán chọn nghĩa');
        let curTarget: HskWord | undefined;
        let curAnswer = '';

        if (isH2M) {
          const pHanzi = container?.querySelector('div.text-center.py-4 .font-serif')?.textContent?.trim();
          curTarget = testWords.find((w) => w.hanzi === pHanzi);
          curAnswer = curTarget!.vietnameseMeaning;
        } else {
          const pMeaning = container?.querySelector('div.text-center.py-4 .font-bold.text-white')?.textContent?.trim();
          curTarget = testWords.find((w) => w.vietnameseMeaning === pMeaning);
          curAnswer = curTarget!.hanzi;
        }

        expect(curTarget).toBeDefined();

        const currentOptions = Array.from(
          container?.querySelectorAll('div.grid.grid-cols-1 button') || []
        ) as HTMLButtonElement[];

        const correctBtn = currentOptions.find(
          (btn) => btn.querySelector('span.font-semibold')?.textContent?.trim() === curAnswer
        );
        expect(correctBtn).toBeTruthy();

        await act(async () => {
          correctBtn?.click();
        });
      }

      // Finish quiz
      const finalAdvanceBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Xem kết quả')
      );
      act(() => {
        finalAdvanceBtn?.click();
      });

      // Summary: 3 correct, 1 wrong, 75%
      expect(container?.textContent).toContain('3');
      expect(container?.textContent).toContain('1');
      expect(container?.textContent).toContain('75%');
      expect(container?.textContent).toContain('Từ vựng cần ôn lại (1 từ)');

      // Remediation action button: "Chỉ ôn các từ đã sai (1)"
      const retryWrongBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Chỉ ôn các từ đã sai')
      );
      expect(retryWrongBtn).toBeTruthy();

      // Click to restart quiz with ONLY the wrong word
      act(() => {
        retryWrongBtn?.click();
      });

      expect(container?.textContent).toContain('Câu 1 / 1');
    });


    it('3.4 ensures answered options are locked against click spam or double scoring', async () => {
      act(() => {
        root.render(
          React.createElement(LearnQuiz, {
            words: sampleWords.slice(0, 4),
            allWords: HSK_CURRICULUM,
          })
        );
      });

      const optionButtons = Array.from(
        container?.querySelectorAll('div.grid.grid-cols-1 button') || []
      ) as HTMLButtonElement[];

      // Click first option
      await act(async () => {
        optionButtons[0].click();
      });

      const initialScoreText = container?.querySelector('span.text-emerald-400.font-bold')?.textContent;

      // Spam click all 4 buttons 20 times while answered
      for (let i = 0; i < 20; i++) {
        act(() => {
          optionButtons[0].click();
          optionButtons[1].click();
          optionButtons[2].click();
          optionButtons[3].click();
        });
      }

      const scoreAfterSpam = container?.querySelector('span.text-emerald-400.font-bold')?.textContent;
      expect(scoreAfterSpam).toBe(initialScoreText);
    });
  });

  // =========================================================================
  // SUITE 4: Match Game Invariants, Randomness & Rapid Click Spam Resilience
  // =========================================================================
  describe('4. Match Game Invariants, Randomness & Rapid Click Spam Resilience', () => {
    it('4.1 card count invariance holds across diverse pool sizes and pair counts', () => {
      // 6 words, count 6 -> 12 cards (6 Hanzi, 6 Meaning)
      const deck6 = generateMatchDeck(sampleWords, 6);
      expect(deck6.length).toBe(12);
      expect(deck6.filter((c) => c.type === 'hanzi').length).toBe(6);
      expect(deck6.filter((c) => c.type === 'meaning').length).toBe(6);

      // 10 words, count 6 -> capped at 12 cards
      const deck10 = generateMatchDeck(sampleWords, 6);
      expect(deck10.length).toBe(12);

      // 4 words, count 6 -> 8 cards (4 Hanzi, 4 Meaning)
      const deck4 = generateMatchDeck(sampleWords.slice(0, 4), 6);
      expect(deck4.length).toBe(8);
      expect(deck4.filter((c) => c.type === 'hanzi').length).toBe(4);
      expect(deck4.filter((c) => c.type === 'meaning').length).toBe(4);

      // 2 words, count 6 -> 4 cards
      const deck2 = generateMatchDeck(sampleWords.slice(0, 2), 6);
      expect(deck2.length).toBe(4);

      // 1 word -> 2 cards
      const deck1 = generateMatchDeck(sampleWords.slice(0, 1), 6);
      expect(deck1.length).toBe(2);

      // 0 words -> 0 cards
      const deck0 = generateMatchDeck([], 6);
      expect(deck0.length).toBe(0);

      // Invariance check over 20 runs: cards count is always exactly pairCount * 2
      for (let run = 0; run < 20; run++) {
        const deck = generateMatchDeck(sampleWords, 6);
        expect(deck.length).toBe(12);
        expect(deck.filter((c) => c.type === 'hanzi').length).toBe(6);
        expect(deck.filter((c) => c.type === 'meaning').length).toBe(6);
      }
    });

    it('4.2 Fisher-Yates shuffle generates high permutation entropy (non-deterministic ordering)', () => {
      const fixedWords = sampleWords.slice(0, 6);
      const generatedCardIdSequences: string[] = [];

      for (let run = 0; run < 30; run++) {
        const deck = generateMatchDeck(fixedWords, 6);
        const sequence = deck.map((c) => c.id).join('|');
        generatedCardIdSequences.push(sequence);
      }

      // Proves shuffle is genuinely randomizing positions: unique sequences must be high (> 20 out of 30)
      const uniqueSequences = new Set(generatedCardIdSequences);
      expect(uniqueSequences.size).toBeGreaterThan(20);
    });

    it('4.3 card ID collision prevention: guarantees 100% unique IDs across 50 deck runs', () => {
      for (let run = 0; run < 50; run++) {
        const deck = generateMatchDeck(sampleWords, 6);
        const ids = deck.map((c) => c.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(deck.length);

        // Check format: hanzi_<id> or meaning_<id>
        deck.forEach((card) => {
          if (card.type === 'hanzi') {
            expect(card.id).toBe(`hanzi_${card.wordId}`);
          } else {
            expect(card.id).toBe(`meaning_${card.wordId}`);
          }
        });
      }
    });

    it('4.4 simulates interactive matching pairs in both forward and reverse order, plus mismatch detection', async () => {
      const testWords = sampleWords.slice(0, 6);

      act(() => {
        root.render(
          React.createElement(MatchGame, {
            words: testWords,
          })
        );
      });

      const getCards = () =>
        Array.from(container?.querySelectorAll('div.grid button') || []) as HTMLButtonElement[];

      expect(getCards().length).toBe(12);

      // --- MATCH PAIR 1 (Hanzi first, then Meaning) ---
      const word1 = testWords[0];
      const hCard1 = getCards().find(
        (b) => b.querySelector('span.font-serif')?.textContent?.trim() === word1.hanzi
      );
      const mCard1 = getCards().find(
        (b) => b.querySelector('span.line-clamp-2')?.textContent?.trim() === word1.vietnameseMeaning
      );

      expect(hCard1).toBeTruthy();
      expect(mCard1).toBeTruthy();

      await act(async () => {
        hCard1?.click();
      });
      expect(SpeechService.getInstance().speak).toHaveBeenCalledWith(word1.hanzi);

      await act(async () => {
        mCard1?.click();
      });

      expect(hanziAudio.playChime).toHaveBeenCalledTimes(1);
      expect(container?.textContent).toContain('Ghép: 1 / 6');

      // --- MATCH PAIR 2 (Meaning first, then Hanzi - reverse order) ---
      const word2 = testWords[1];
      const hCard2 = getCards().find(
        (b) => b.querySelector('span.font-serif')?.textContent?.trim() === word2.hanzi
      );
      const mCard2 = getCards().find(
        (b) => b.querySelector('span.line-clamp-2')?.textContent?.trim() === word2.vietnameseMeaning
      );

      await act(async () => {
        mCard2?.click();
      });
      await act(async () => {
        hCard2?.click();
      });

      expect(hanziAudio.playChime).toHaveBeenCalledTimes(2);
      expect(container?.textContent).toContain('Ghép: 2 / 6');

      // --- MISMATCH: Different words (Hanzi Word 3 + Meaning Word 4) ---
      vi.useFakeTimers();

      const word3 = testWords[2];
      const word4 = testWords[3];
      const hCard3 = getCards().find(
        (b) => b.querySelector('span.font-serif')?.textContent?.trim() === word3.hanzi
      );
      const mCard4 = getCards().find(
        (b) => b.querySelector('span.line-clamp-2')?.textContent?.trim() === word4.vietnameseMeaning
      );

      await act(async () => {
        hCard3?.click();
      });
      await act(async () => {
        mCard4?.click();
      });

      expect(hanziAudio.playMistakeBuzz).toHaveBeenCalledTimes(1);

      // Fast-forward timeout 600ms to clear error state
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(container?.textContent).toContain('Ghép: 2 / 6');
      expect(container?.textContent).toContain('Lượt ghép: 3');
    });

    it('4.5 proves UI style precedence flaw where card.isError shake animation is shadowed by card.isSelected in MatchGame', async () => {
      vi.useFakeTimers();

      const testWords = sampleWords.slice(0, 6);

      act(() => {
        root.render(
          React.createElement(MatchGame, {
            words: testWords,
          })
        );
      });

      const getCards = () =>
        Array.from(container?.querySelectorAll('div.grid button') || []) as HTMLButtonElement[];

      const word1 = testWords[0];
      const hCard1 = getCards().find(
        (b) => b.querySelector('span.font-serif')?.textContent?.trim() === word1.hanzi
      )!;

      // Click card 1 once
      await act(async () => {
        hCard1.click();
      });

      // Self-click: clicking the same card again should NOT register as a move or mismatch
      await act(async () => {
        hCard1.click();
      });
      expect(container?.textContent).toContain('Lượt ghép: 0');

      // Now click another unrelated card to cause mismatch
      const word2 = testWords[1];
      const mCard2 = getCards().find(
        (b) => b.querySelector('span.line-clamp-2')?.textContent?.trim() === word2.vietnameseMeaning
      )!;

      await act(async () => {
        mCard2.click();
      });
      expect(container?.textContent).toContain('Lượt ghép: 1');
      expect(hanziAudio.playMistakeBuzz).toHaveBeenCalledTimes(1);

      // EMPIRICAL DEFECT CHECK: In MatchGame.tsx line 331, `else if (card.isSelected)` precedes `else if (card.isError)`.
      // Because cards in mismatch state retain `isSelected: true`, the error shake class `animate-card-shake` is shadowed!
      const hasShakeAnimation = mCard2.className.includes('animate-card-shake');
      const hasSelectedCyanStyle = mCard2.className.includes('bg-cyber-cyan/20');

      // The card displays cyan selection styling instead of crimson shake styling
      expect(hasShakeAnimation, 'Defect: animate-card-shake is shadowed by isSelected in MatchGame.tsx:331').toBe(false);
      expect(hasSelectedCyanStyle, 'Defect: card remains styled as selected cyan during error timeout').toBe(true);

      // At 600ms, timeout triggers and clears both isSelected and isError
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(mCard2.className).not.toContain('bg-cyber-cyan/20');
      expect(mCard2.className).toContain('bg-obsidian-900');
    });

    it('4.6 rapid click spam resilience: 100 simultaneous clicks during mismatch processing do not corrupt state', async () => {
      vi.useFakeTimers();

      const testWords = sampleWords.slice(0, 6);

      act(() => {
        root.render(
          React.createElement(MatchGame, {
            words: testWords,
          })
        );
      });

      const getCards = () =>
        Array.from(container?.querySelectorAll('div.grid button') || []) as HTMLButtonElement[];

      const word1 = testWords[0];
      const word2 = testWords[1];
      const hCard1 = getCards().find(
        (b) => b.querySelector('span.font-serif')?.textContent?.trim() === word1.hanzi
      )!;
      const mCard2 = getCards().find(
        (b) => b.querySelector('span.line-clamp-2')?.textContent?.trim() === word2.vietnameseMeaning
      )!;

      // Initiate mismatch
      await act(async () => {
        hCard1.click();
      });
      await act(async () => {
        mCard2.click();
      });

      expect(container?.textContent).toContain('Lượt ghép: 1');

      // Blast 100 click events across ALL cards while isProcessing is true
      const allCards = getCards();
      for (let i = 0; i < 100; i++) {
        const randomCard = allCards[i % allCards.length];
        act(() => {
          randomCard.click();
        });
      }

      // Advance timers by 600ms
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Moves count must remain exactly 1 (all 100 spam clicks during lock were ignored)
      expect(container?.textContent).toContain('Lượt ghép: 1');
      expect(container?.textContent).toContain('Ghép: 0 / 6');
    });

    it('4.7 completes entire match game (all 6 pairs), locks inputs, and triggers victory fanfare & stats', async () => {
      const testWords = sampleWords.slice(0, 6);
      const onGameCompleteSpy = vi.fn();

      act(() => {
        root.render(
          React.createElement(MatchGame, {
            words: testWords,
            onGameComplete: onGameCompleteSpy,
          })
        );
      });

      const getCards = () =>
        Array.from(container?.querySelectorAll('div.grid button') || []) as HTMLButtonElement[];

      // Match all 6 pairs sequentially using exact text targeting
      for (let i = 0; i < 6; i++) {
        const word = testWords[i];
        const hCard = getCards().find(
          (b) => b.querySelector('span.font-serif')?.textContent?.trim() === word.hanzi
        )!;
        const mCard = getCards().find(
          (b) => b.querySelector('span.line-clamp-2')?.textContent?.trim() === word.vietnameseMeaning
        )!;

        expect(hCard).toBeTruthy();
        expect(mCard).toBeTruthy();

        await act(async () => {
          hCard.click();
        });
        await act(async () => {
          mCard.click();
        });
      }

      // Victory screen displayed
      expect(container?.textContent).toContain('Chiến Thắng Tuyệt Vời!');
      expect(container?.textContent).toContain('Bạn đã ghép chính xác toàn bộ 6 cặp từ vựng');
      expect(container?.textContent).toContain('Thời gian hoàn thành');
      expect(container?.textContent).toContain('6 lượt');
      expect(container?.textContent).toContain('★');
      expect(hanziAudio.playVictoryFanfare).toHaveBeenCalledTimes(1);
      expect(onGameCompleteSpy).toHaveBeenCalledTimes(1);

      // Verify restart button restarts fresh game
      const restartBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
        b.textContent?.includes('Chơi ván mới')
      );
      expect(restartBtn).toBeTruthy();

      act(() => {
        restartBtn?.click();
      });

      expect(container?.textContent).toContain('Ghép: 0 / 6');
      expect(container?.textContent).toContain('Lượt ghép: 0');
    });
  });
});
