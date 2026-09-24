'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type HanziWriterType from 'hanzi-writer';
import type { StrokeData } from 'hanzi-writer';
import { resilientCharDataLoader } from '@/services/charDataLoader';
import { hanziAudio } from '@/services/hanziAudioFeedback';

export type HanziWriterMode = 'idle' | 'animating' | 'looping' | 'paused' | 'quiz';

export interface UseHanziWriterOptions {
  character: string;
  size?: number;
  padding?: number;
  strokeColor?: string;
  radicalColor?: string;
  outlineColor?: string;
  highlightColor?: string;
  drawingColor?: string;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
  leniency?: number;
  showHintAfterMisses?: number | false;
  acceptBackwardsStrokes?: boolean;
  soundEnabled?: boolean;
  onCorrectStroke?: (data: StrokeData) => void;
  onMistake?: (data: StrokeData, message: string) => void;
  onComplete?: (summary: { character: string; totalMistakes: number }) => void;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export interface UseHanziWriterReturn {
  writer: HanziWriterType | null;
  isLoading: boolean;
  error: string | null;
  mode: HanziWriterMode;
  currentStroke: number;
  totalStrokes: number;
  strokesRemaining: number;
  mistakesOnStroke: number;
  totalMistakes: number;
  feedbackMessage: string;
  feedbackType: 'info' | 'success' | 'warning' | 'error';
  speed: number;
  isMuted: boolean;
  animate: () => Promise<void>;
  loopAnimate: () => Promise<void>;
  pauseAnimation: () => Promise<void>;
  resumeAnimation: () => Promise<void>;
  setSpeed: (speedMultiplier: number) => void;
  startQuiz: () => void;
  cancelQuiz: () => void;
  showHint: () => void;
  resetBoard: () => Promise<void>;
  toggleMute: () => void;
}

/**
 * useHanziWriter
 * Production-ready React 19 hook for HanziWriter SVG stroke animation & interactive quiz.
 * Features:
 * - SVG vector rendering for sub-pixel Retina sharpness
 * - Single writer instance reuse to prevent document event listener memory leaks
 * - Web Audio synthesized sound feedback (chime, mistake buzz, victory fanfare)
 * - Directional mistake detection (isBackwards) with Vietnamese pedagogical feedback
 */
export function useHanziWriter(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseHanziWriterOptions
): UseHanziWriterReturn {
  const writerRef = useRef<HanziWriterType | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const optionsRef = useRef<UseHanziWriterOptions>(options);

  // Keep optionsRef up to date for event handlers
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<HanziWriterMode>('idle');
  const [currentStroke, setCurrentStroke] = useState<number>(0);
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [strokesRemaining, setStrokesRemaining] = useState<number>(0);
  const [mistakesOnStroke, setMistakesOnStroke] = useState<number>(0);
  const [totalMistakes, setTotalMistakes] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Sẵn sàng luyện viết');
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [speed, setSpeedState] = useState<number>(options.strokeAnimationSpeed ?? 1.0);
  const [isMuted, setIsMuted] = useState<boolean>(!(options.soundEnabled ?? true));

  // Initialize or update character on writer
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    async function setupWriter() {
      if (!containerRef.current || typeof window === 'undefined') return;

      const targetChar = options.character.trim();
      if (!targetChar) return;

      setIsLoading(true);
      setError(null);

      try {
        const HanziWriterModule = (await import('hanzi-writer')).default;

        if (isCancelled || !isMountedRef.current) return;

        // If writer already exists, reuse it via setCharacter() to prevent DOM listener leaks
        if (writerRef.current) {
          writerRef.current.cancelQuiz();
          await writerRef.current.setCharacter(targetChar);

          const charData = await writerRef.current.getCharacterData();
          if (isMountedRef.current && !isCancelled) {
            setTotalStrokes(charData?.strokes?.length ?? 0);
            setStrokesRemaining(charData?.strokes?.length ?? 0);
            setCurrentStroke(0);
            setTotalMistakes(0);
            setMistakesOnStroke(0);
            setMode('idle');
            setFeedbackMessage(`Sẵn sàng luyện viết chữ '${targetChar}'`);
            setFeedbackType('info');
            setIsLoading(false);
            optionsRef.current.onLoadSuccess?.();
          }
          return;
        }

        // Clean container before first mount
        containerRef.current.innerHTML = '';

        const writerSize = options.size || 340;
        const writer = HanziWriterModule.create(containerRef.current, targetChar, {
          width: writerSize,
          height: writerSize,
          padding: options.padding ?? 24,
          renderer: 'svg', // Crisp sub-pixel clarity on Retina displays
          strokeColor: options.strokeColor ?? '#1E293B',
          radicalColor: options.radicalColor ?? '#D97706',
          outlineColor: options.outlineColor ?? '#CBD5E1',
          highlightColor: options.highlightColor ?? '#06B6D4',
          drawingColor: options.drawingColor ?? '#2563EB',
          strokeAnimationSpeed: options.strokeAnimationSpeed ?? 1.2,
          delayBetweenStrokes: options.delayBetweenStrokes ?? 250,
          showOutline: true,
          showCharacter: true,
          charDataLoader: resilientCharDataLoader,
          onLoadCharDataError: (err) => {
            if (!isCancelled && isMountedRef.current) {
              const errMsg = err instanceof Error ? err.message : String(err);
              setError(errMsg);
              setFeedbackMessage(`Lỗi tải dữ liệu nét: ${errMsg}`);
              setFeedbackType('error');
              setIsLoading(false);
              optionsRef.current.onLoadError?.(err instanceof Error ? err : new Error(String(err)));
            }
          },
        });

        writerRef.current = writer;

        const charData = await writer.getCharacterData();
        if (isMountedRef.current && !isCancelled) {
          setTotalStrokes(charData?.strokes?.length ?? 0);
          setStrokesRemaining(charData?.strokes?.length ?? 0);
          setCurrentStroke(0);
          setTotalMistakes(0);
          setMistakesOnStroke(0);
          setMode('idle');
          setFeedbackMessage(`Sẵn sàng luyện viết chữ '${targetChar}'`);
          setFeedbackType('info');
          setIsLoading(false);
          optionsRef.current.onLoadSuccess?.();
        }
      } catch (err) {
        if (!isCancelled && isMountedRef.current) {
          const errMsg = err instanceof Error ? err.message : 'Lỗi khởi tạo bảng HanziWriter.';
          setError(errMsg);
          setFeedbackMessage(errMsg);
          setFeedbackType('error');
          setIsLoading(false);
          optionsRef.current.onLoadError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    setupWriter();

    return () => {
      isCancelled = true;
    };
  }, [options.character]);

  // Handle dimension updates dynamically (e.g. tablet rotation or resize)
  useEffect(() => {
    if (writerRef.current && options.size) {
      writerRef.current.updateDimensions({
        width: options.size,
        height: options.size,
        padding: options.padding ?? 24,
      });
    }
  }, [options.size, options.padding]);

  // Animation controller: full sequence
  const animate = useCallback(async () => {
    if (!writerRef.current) return;
    try {
      writerRef.current.cancelQuiz();
      setMode('animating');
      setFeedbackMessage('Đang phát hoạt họa thứ tự nét bút thuận...');
      setFeedbackType('info');

      await writerRef.current.animateCharacter({
        onComplete: (res) => {
          if (isMountedRef.current && !res.canceled) {
            setMode('idle');
            setFeedbackMessage('Hoàn thành thị phạm nét!');
            setFeedbackType('success');
          }
        },
      });
    } catch {
      if (isMountedRef.current) setMode('idle');
    }
  }, []);

  // Animation controller: loop
  const loopAnimate = useCallback(async () => {
    if (!writerRef.current) return;
    try {
      writerRef.current.cancelQuiz();
      setMode('looping');
      setFeedbackMessage('Đang phát lặp lại thứ tự nét...');
      setFeedbackType('info');
      await writerRef.current.loopCharacterAnimation();
    } catch {
      if (isMountedRef.current) setMode('idle');
    }
  }, []);

  // Animation controller: pause
  const pauseAnimation = useCallback(async () => {
    if (!writerRef.current) return;
    try {
      await writerRef.current.pauseAnimation();
      setMode('paused');
      setFeedbackMessage('Đã tạm dừng hoạt họa.');
      setFeedbackType('info');
    } catch {
      // Safe no-op
    }
  }, []);

  // Animation controller: resume
  const resumeAnimation = useCallback(async () => {
    if (!writerRef.current) return;
    try {
      await writerRef.current.resumeAnimation();
      setMode('animating');
      setFeedbackMessage('Tiếp tục hoạt họa...');
      setFeedbackType('info');
    } catch {
      // Safe no-op
    }
  }, []);

  // Set animation speed multiplier
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    if (writerRef.current) {
      // HanziWriter internal options speed update
      (writerRef.current as any)._options.strokeAnimationSpeed = newSpeed;
    }
  }, []);

  // Show Hint: flashes current stroke
  const showHint = useCallback(() => {
    if (!writerRef.current) return;
    const targetStrokeIndex = Math.max(0, currentStroke);
    writerRef.current.highlightStroke(targetStrokeIndex);
    setFeedbackMessage(`Gợi ý: Hãy quan sát nét thứ ${targetStrokeIndex + 1} đang nhấp nháy.`);
    setFeedbackType('info');
  }, [currentStroke]);

  // Reset Canvas to complete model view
  const resetBoard = useCallback(async () => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz();
    await writerRef.current.showCharacter();
    setMode('idle');
    setCurrentStroke(0);
    setMistakesOnStroke(0);
    setFeedbackMessage('Đã đặt lại bảng về chữ mẫu.');
    setFeedbackType('info');
  }, []);

  // Toggle audio sound
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      hanziAudio.setMuted(next);
      return next;
    });
  }, []);

  // Quiz controller
  const startQuiz = useCallback(() => {
    if (!writerRef.current) return;

    setMode('quiz');
    setCurrentStroke(0);
    setMistakesOnStroke(0);
    setTotalMistakes(0);
    setFeedbackMessage('Bắt đầu luyện viết! Hãy vẽ nét đầu tiên.');
    setFeedbackType('info');

    writerRef.current.quiz({
      leniency: optionsRef.current.leniency ?? 1.0,
      showHintAfterMisses: optionsRef.current.showHintAfterMisses ?? 3,
      acceptBackwardsStrokes: optionsRef.current.acceptBackwardsStrokes ?? false,

      // Callback: Correct stroke drawn
      onCorrectStroke: (strokeData: StrokeData) => {
        if (!isMountedRef.current) return;

        const nextStrokeNum = strokeData.strokeNum + 1;
        setCurrentStroke(nextStrokeNum);
        setStrokesRemaining(strokeData.strokesRemaining);
        setMistakesOnStroke(0);

        setFeedbackMessage(
          `Chính xác! Hoàn thành nét ${nextStrokeNum}${
            strokeData.strokesRemaining > 0 ? ` (Còn ${strokeData.strokesRemaining} nét)` : ''
          }`
        );
        setFeedbackType('success');

        // Audio feedback: pleasant chime
        if (!isMuted) {
          hanziAudio.playChime().catch(() => {});
        }

        optionsRef.current.onCorrectStroke?.(strokeData);
      },

      // Callback: Mistake on stroke (direction or wrong stroke)
      onMistake: (strokeData: StrokeData) => {
        if (!isMountedRef.current) return;

        setTotalMistakes(strokeData.totalMistakes);
        setMistakesOnStroke(strokeData.mistakesOnStroke);

        let msg = '';
        let type: 'warning' | 'error' = 'error';

        if (strokeData.isBackwards) {
          msg = 'Sai hướng bút thuận (vẽ ngược nét)!';
          type = 'warning';
        } else {
          msg = 'Sai nét hoặc sai thứ tự nét!';
          type = 'error';
        }

        setFeedbackMessage(msg);
        setFeedbackType(type);

        // Audio feedback: gentle buzz
        if (!isMuted) {
          hanziAudio.playMistakeBuzz(strokeData.isBackwards).catch(() => {});
        }

        optionsRef.current.onMistake?.(strokeData, msg);
      },

      // Callback: Character completed
      onComplete: (summary: { character: string; totalMistakes: number }) => {
        if (!isMountedRef.current) return;

        setMode('idle');
        const congratsMsg =
          summary.totalMistakes === 0
            ? `Xuất sắc! Bạn đã viết hoàn hảo chữ '${summary.character}' không mắc lỗi nào!`
            : `Hoàn thành chữ '${summary.character}' với ${summary.totalMistakes} lần sửa. Rất tốt!`;

        setFeedbackMessage(congratsMsg);
        setFeedbackType('success');

        // Audio feedback: victory fanfare
        if (!isMuted) {
          hanziAudio.playVictoryFanfare().catch(() => {});
        }

        optionsRef.current.onComplete?.(summary);
      },
    });
  }, [isMuted]);

  // Cancel Quiz
  const cancelQuiz = useCallback(() => {
    if (!writerRef.current) return;
    writerRef.current.cancelQuiz();
    setMode('idle');
    setFeedbackMessage('Đã hủy chế độ luyện viết.');
    setFeedbackType('info');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {
          // Ignore cancel error on unmount
        }
      }
    };
  }, []);

  return {
    writer: writerRef.current,
    isLoading,
    error,
    mode,
    currentStroke,
    totalStrokes,
    strokesRemaining,
    mistakesOnStroke,
    totalMistakes,
    feedbackMessage,
    feedbackType,
    speed,
    isMuted,
    animate,
    loopAnimate,
    pauseAnimation,
    resumeAnimation,
    setSpeed,
    startQuiz,
    cancelQuiz,
    showHint,
    resetBoard,
    toggleMute,
  };
}

export default useHanziWriter;
