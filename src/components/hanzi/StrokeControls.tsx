'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Edit3,
  XCircle,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
} from 'lucide-react';
import type { HanziWriterMode } from '@/hooks/useHanziWriter';

export interface StrokeControlsProps {
  mode: HanziWriterMode;
  isLoading?: boolean;
  speed: number;
  isMuted?: boolean;
  onAnimate: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onLoopAnimate?: () => void;
  onStartQuiz: () => void;
  onCancelQuiz: () => void;
  onShowHint: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleMute?: () => void;
  className?: string;
}

export const SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0] as const;

/**
 * StrokeControls
 * Interactive toolbar for HanziWriter canvas.
 * Controls stroke order animation, speed selection, quiz mode, and hint highlights.
 */
export const StrokeControls: React.FC<StrokeControlsProps> = ({
  mode,
  isLoading = false,
  speed,
  isMuted = false,
  onAnimate,
  onPause,
  onResume,
  onStartQuiz,
  onCancelQuiz,
  onShowHint,
  onReset,
  onSpeedChange,
  onToggleMute,
  className = '',
}) => {
  const isQuiz = mode === 'quiz';
  const isAnimating = mode === 'animating' || mode === 'looping';
  const isPaused = mode === 'paused';

  const handleAnimationClick = () => {
    if (isAnimating && onPause) {
      onPause();
    } else if (isPaused && onResume) {
      onResume();
    } else {
      onAnimate();
    }
  };

  const handleQuizClick = () => {
    if (isQuiz) {
      onCancelQuiz();
    } else {
      onStartQuiz();
    }
  };

  return (
    <div
      className={`w-full flex flex-col gap-3 p-4 rounded-3xl bg-white/90 dark:bg-obsidian-900/90 border border-stone-200/90 dark:border-slate-800 shadow-md backdrop-blur-md select-none ${className}`}
      data-testid="stroke-controls"
    >
      {/* Primary Actions Row (Chunky Tactile 3D Buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Practice/Quiz Mode Toggle Button */}
        <button
          type="button"
          onClick={handleQuizClick}
          disabled={isLoading}
          data-testid="btn-quiz-toggle"
          className={`flex-1 min-w-[150px] btn-tactile py-2.5 px-4 text-xs font-black shadow-sm gap-2 ${
            isQuiz
              ? 'btn-tactile-coral text-white'
              : 'btn-tactile-emerald text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isQuiz ? (
            <>
              <XCircle className="w-4 h-4 text-white" />
              <span>Dừng luyện viết</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 text-white" />
              <span>Luyện viết cảm ứng</span>
            </>
          )}
        </button>

        {/* Animation Play/Pause Button */}
        <button
          type="button"
          onClick={handleAnimationClick}
          disabled={isLoading || isQuiz}
          data-testid="btn-animate"
          className={`flex-1 min-w-[140px] btn-tactile btn-tactile-amber py-2.5 px-3.5 text-xs font-black text-white gap-2 shadow-sm ${
            isAnimating ? 'animate-pulse' : ''
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title={isAnimating ? 'Tạm dừng hoạt họa' : isPaused ? 'Tiếp tục' : 'Xem hoạt họa thứ tự nét chuẩn'}
        >
          {isAnimating ? (
            <>
              <Pause className="w-4 h-4 text-white" />
              <span>Tạm Dừng</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-4 h-4 text-white" />
              <span>Tiếp Tục</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-white" />
              <span>▶️ Xem Thứ Tự Nét</span>
            </>
          )}
        </button>

        {/* Hint Button (active during quiz or learning) */}
        <button
          type="button"
          onClick={onShowHint}
          disabled={isLoading}
          data-testid="btn-hint"
          className="btn-tactile btn-tactile-cyan py-2.5 px-3.5 text-xs font-black text-white gap-1.5 shadow-sm disabled:opacity-40"
          title="Nhấp nháy gợi ý nét tiếp theo cần viết"
        >
          <Lightbulb className="w-4 h-4 text-white" />
          <span>💡 Gợi Ý Nét</span>
        </button>

        {/* Reset / Show Full Character */}
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          data-testid="btn-reset"
          className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 font-bold text-xs transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
          title="Xóa viết lại từ đầu"
        >
          <RotateCcw className="w-4 h-4 text-stone-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Viết Lại</span>
        </button>

        {/* Audio Mute Toggle */}
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            data-testid="btn-mute-toggle"
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 shadow-sm ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300'
            }`}
            title={isMuted ? 'Bật âm thanh bút viết' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Pedagogical Stroke Rule Tip */}
      <div className="pt-2 border-t border-stone-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 font-medium">
        <span>📜 <strong>Quy tắc bút thuận:</strong> Trên trước dưới sau • Trái trước phải sau • Ngoài trước trong sau</span>
        <span className="hidden md:inline font-mono text-amber-600 dark:text-amber-400">Chuẩn Khải Thư</span>
      </div>

      {/* Secondary Controls: Speed Selector */}
      <div className="flex items-center justify-between pt-2.5 border-t border-stone-200/80 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Gauge className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Tốc độ thị phạm:</span>
        </div>

        <div className="flex items-center gap-1 bg-obsidian-950/80 p-1 rounded-lg border border-slate-800">
          {SPEED_OPTIONS.map((s) => {
            const isSelected = speed === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                data-testid={`btn-speed-${s}`}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyber-cyan text-obsidian-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {s}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StrokeControls;
