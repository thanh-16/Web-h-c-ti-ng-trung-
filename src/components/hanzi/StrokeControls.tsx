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
      className={`w-full flex flex-col gap-3 p-3.5 rounded-2xl bg-obsidian-900/90 border border-slate-800 backdrop-blur-sm select-none ${className}`}
      data-testid="stroke-controls"
    >
      {/* Primary Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Practice/Quiz Mode Toggle Button */}
        <button
          type="button"
          onClick={handleQuizClick}
          disabled={isLoading}
          data-testid="btn-quiz-toggle"
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            isQuiz
              ? 'bg-cyber-cyan text-obsidian-950 shadow-cyber-cyan/30 ring-2 ring-cyber-cyan/50 font-bold'
              : 'bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isQuiz ? (
            <>
              <XCircle className="w-4 h-4 text-obsidian-950" />
              <span>Dừng luyện viết</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
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
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            isAnimating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : isPaused
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title={isAnimating ? 'Tạm dừng hoạt họa' : isPaused ? 'Tiếp tục' : 'Thị phạm thứ tự nét bút thuận'}
        >
          {isAnimating ? (
            <>
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Tạm dừng</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Tiếp tục</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-cyber-cyan" />
              <span>Thị phạm nét</span>
            </>
          )}
        </button>

        {/* Hint Button (active during quiz or learning) */}
        <button
          type="button"
          onClick={onShowHint}
          disabled={isLoading}
          data-testid="btn-hint"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-medium text-sm transition-all disabled:opacity-40"
          title="Nhấp nháy gợi ý nét tiếp theo"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Gợi ý nét</span>
        </button>

        {/* Reset / Show Full Character */}
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          data-testid="btn-reset"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-sm transition-all disabled:opacity-40"
          title="Xem lại chữ mẫu hoàn chỉnh"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Chữ mẫu</span>
        </button>

        {/* Audio Mute Toggle */}
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            data-testid="btn-mute-toggle"
            className={`p-2.5 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-950/30 border-rose-800/40 text-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isMuted ? 'Bật âm thanh phản hồi' : 'Tắt âm thanh phản hồi'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        )}
      </div>

      {/* Secondary Controls: Speed Selector */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
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
