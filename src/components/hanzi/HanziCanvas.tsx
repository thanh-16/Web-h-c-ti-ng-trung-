'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { StrokeData } from 'hanzi-writer';
import { CalligraphyGrid } from './CalligraphyGrid';
import { StrokeControls } from './StrokeControls';
import { useHanziWriter, UseHanziWriterOptions } from '@/hooks/useHanziWriter';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Grid,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export interface HanziCanvasProps {
  /** Target Chinese character (single character) */
  character: string;
  /** Pinyin pronunciation (optional header) */
  pinyin?: string;
  /** Sino-Vietnamese reading (Âm Hán Việt) */
  sinoVietnamese?: string;
  /** Vietnamese meaning */
  meaning?: string;
  /** Explicit square dimensions in px. If omitted, adapts responsively (340-380px mobile, 520px tablet) */
  size?: number;
  /** Calligraphy grid style ('mi' = 米字格, 'tian' = 田字格) */
  initialGridType?: 'tian' | 'mi';
  /** Stroke animation speed multiplier (0.5 to 2.0) */
  animationSpeed?: number;
  /** Whether to start in blind memory mode (hide outline) */
  initialMemoryMode?: boolean;
  /** Whether to show external control toolbar */
  showControls?: boolean;
  /** Callback fired on correct stroke */
  onCorrectStroke?: (data: StrokeData) => void;
  /** Callback fired on mistake with pedagogical message */
  onMistake?: (data: StrokeData, message: string) => void;
  /** Callback fired on quiz completion */
  onQuizComplete?: (summary: { character: string; totalMistakes: number }) => void;
  /** Additional custom class names */
  className?: string;
}

/**
 * HanziCanvas
 * Interactive Chinese Calligraphy Canvas powered by HanziWriter SVG vector engine.
 * Features:
 * - Locked touch surface (touch-action: none, overscroll-behavior: none) for iOS Safari & Apple Pencil
 * - Adaptive responsive dimensions (iPhone 12 Pro Max 340-380px, iPad Pro 12.9" 520px)
 * - Scalable Tian Zi Ge (田字格) / Mi Zi Ge (米字格) guidelines
 * - Directional stroke mistake discrimination ("Sai hướng bút thuận (vẽ ngược nét)!")
 * - Integrated control toolbar with speed, hint, and quiz triggers
 */
export const HanziCanvas: React.FC<HanziCanvasProps> = ({
  character,
  pinyin,
  sinoVietnamese,
  meaning,
  size,
  initialGridType = 'mi',
  animationSpeed = 1.2,
  initialMemoryMode = false,
  showControls = true,
  onCorrectStroke,
  onMistake,
  onQuizComplete,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gridType, setGridType] = useState<'tian' | 'mi'>(initialGridType);

  // Responsive sizing: calculate appropriate square size based on screen viewport
  const [computedSize, setComputedSize] = useState<number>(size ?? 360);

  useEffect(() => {
    if (size) {
      setComputedSize(size);
      return;
    }

    const calculateResponsiveSize = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w >= 1024) {
        // iPad Pro 12.9" & Desktop studio layout
        setComputedSize(520);
      } else if (w >= 768) {
        // Tablet / iPad mini
        setComputedSize(440);
      } else {
        // iPhone 12 Pro Max (viewport 428pt) and mobile screens
        // Clamped nicely between 320px and 380px with safe margins
        const mobileTarget = Math.min(380, Math.max(320, w - 48));
        setComputedSize(mobileTarget);
      }
    };

    calculateResponsiveSize();
    window.addEventListener('resize', calculateResponsiveSize);
    return () => window.removeEventListener('resize', calculateResponsiveSize);
  }, [size]);

  // Hook initialization
  const {
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
    isMemoryMode,
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
    toggleMemoryMode,
  } = useHanziWriter(containerRef, {
    character,
    size: computedSize,
    strokeAnimationSpeed: animationSpeed,
    isMemoryMode: initialMemoryMode,
    onCorrectStroke,
    onMistake,
    onComplete: onQuizComplete,
  });

  return (
    <div
      className={`flex flex-col items-center gap-4 w-full max-w-2xl select-none ${className}`}
      data-testid="hanzi-canvas-root"
    >
      {/* Header Info Banner: Character, Pinyin, Sino-Vietnamese */}
      {(pinyin || sinoVietnamese || meaning) && (
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-obsidian-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-serif text-white">{character}</span>
            <div>
              {pinyin && <span className="font-mono font-semibold text-cyber-cyan mr-2">{pinyin}</span>}
              {sinoVietnamese && <span className="font-medium text-amber-400">{sinoVietnamese}</span>}
              {meaning && <div className="text-[11px] text-slate-400 truncate max-w-xs">{meaning}</div>}
            </div>
          </div>

          {/* Controls: Memory Mode & Grid Type */}
          <div className="flex items-center gap-2">
            {/* Memory Mode Toggle Button */}
            <button
              type="button"
              onClick={() => toggleMemoryMode()}
              data-testid="btn-toggle-memory-mode"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                isMemoryMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-obsidian-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
              title={isMemoryMode ? 'Chuyển sang chế độ nét mờ hỗ trợ' : 'Bật chế độ Thử thách trí nhớ (Ẩn nét mờ)'}
            >
              <Sparkles className={`w-3 h-3 ${isMemoryMode ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{isMemoryMode ? '🧠 Viết nhớ' : '👁️ Nét mờ'}</span>
            </button>

            {/* Grid Type Selector Toggle */}
            <div className="flex items-center gap-1 bg-obsidian-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setGridType('mi')}
                data-testid="btn-grid-mi"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  gridType === 'mi'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mễ tự cách (米字格) — 8 hướng cân đối"
              >
                米 Mễ
              </button>
              <button
                type="button"
                onClick={() => setGridType('tian')}
                data-testid="btn-grid-tian"
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  gridType === 'tian'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Điền tự cách (田字格) — 4 ô chuẩn"
              >
                田 Điền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Mode Notice Banner */}
      {isMemoryMode && (
        <div
          data-testid="memory-mode-banner"
          className="w-full px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-fadeIn shadow-sm"
        >
          <span className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>Đang bật <strong>Thử thách trí nhớ</strong>: Nét mờ đã ẩn, hãy tự nhớ và vẽ chuẩn bút thuận!</span>
          </span>
          <button
            type="button"
            onClick={() => toggleMemoryMode(false)}
            className="underline text-amber-400 hover:text-amber-200 text-xs font-semibold cursor-pointer shrink-0 ml-2"
          >
            Hiện lại nét mờ
          </button>
        </div>
      )}

      {/* Main Square Writing Canvas */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl border-2 border-slate-200/80 overflow-hidden flex items-center justify-center hanzi-canvas-container"
        data-testid="hanzi-canvas-container"
        style={{
          width: `${computedSize}px`,
          height: `${computedSize}px`,
          touchAction: 'none',
          overscrollBehavior: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Tier 1: Calligraphy Grid Layer (Vermilion Tian/Mi Zi Ge) */}
        <CalligraphyGrid size={computedSize} type={gridType} />

        {/* Tier 2: HanziWriter SVG Engine Target Mount */}
        <div
          ref={containerRef}
          data-testid="hanzi-writer-mount"
          className="relative z-10 w-full h-full flex items-center justify-center cursor-crosshair"
          style={{
            width: `${computedSize}px`,
            height: `${computedSize}px`,
            touchAction: 'none',
            overscrollBehavior: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        />

        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div
            data-testid="canvas-loading-spinner"
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 z-20 backdrop-blur-[2px]"
          >
            <div className="w-10 h-10 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            <span className="mt-2 text-xs font-semibold text-slate-700">Đang tải nét chữ '{character}'...</span>
          </div>
        )}

        {/* Error State Overlay */}
        {error && (
          <div
            data-testid="canvas-error-overlay"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rose-50/95 text-rose-700 text-center z-20"
          >
            <XCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="font-semibold text-sm">Lỗi tải dữ liệu nét chữ Hán</p>
            <p className="text-xs mt-1 text-slate-600 max-w-xs">{error}</p>
            <button
              type="button"
              onClick={resetBoard}
              className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Subtle Watermark Branding */}
        <div className="absolute bottom-2 right-3 pointer-events-none select-none z-10 opacity-30 text-[10px] font-mono tracking-widest text-slate-500">
          HanziVibe 汉字韵
        </div>
      </div>

      {/* Visual Stroke Order Indicators & Status Bar */}
      <div
        className="w-full flex flex-wrap items-center justify-between px-4 py-2 rounded-xl bg-obsidian-900/90 border border-slate-800 text-xs font-medium text-slate-300"
        data-testid="canvas-status-bar"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                mode === 'quiz'
                  ? 'bg-cyber-cyan animate-ping'
                  : mode === 'animating'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-semibold text-white">
              {mode === 'quiz'
                ? 'Đang luyện viết'
                : mode === 'animating'
                ? 'Đang thị phạm'
                : 'Sẵn sàng'}
            </span>
          </span>

          {totalStrokes > 0 && (
            <span className="text-slate-400 border-l border-slate-700 pl-3">
              Nét: <strong className="text-cyber-cyan font-mono">{currentStroke}</strong> / {totalStrokes}
            </span>
          )}
        </div>

        {/* Mistakes Counter in Quiz Mode */}
        {mode === 'quiz' && (
          <div className="flex items-center gap-4 text-xs font-mono">
            {mistakesOnStroke > 0 && (
              <span className="text-amber-400">
                Lỗi nét này: <strong>{mistakesOnStroke}</strong>
              </span>
            )}
            <span className={totalMistakes > 0 ? 'text-rose-400' : 'text-slate-400'}>
              Tổng lỗi: <strong>{totalMistakes}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Pedagogical Feedback Banner (Shows Directional Warning vs Stroke Error vs Success) */}
      <div
        data-testid="canvas-feedback-banner"
        className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-center shadow-sm ${
          feedbackType === 'success'
            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
            : feedbackType === 'warning'
            ? 'bg-amber-950/50 text-amber-200 border-2 border-amber-500/60 shadow-amber-900/20 animate-pulse'
            : feedbackType === 'error'
            ? 'bg-rose-950/50 text-rose-200 border border-rose-500/40'
            : 'bg-slate-900/80 text-slate-300 border border-slate-800'
        }`}
      >
        {feedbackType === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
        {feedbackType === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
        {feedbackType === 'error' && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
        {feedbackType === 'info' && <Info className="w-4 h-4 text-cyber-cyan flex-shrink-0" />}
        <span>{feedbackMessage}</span>
      </div>

      {/* Control Actions Toolbar */}
      {showControls && (
        <StrokeControls
          mode={mode}
          isLoading={isLoading}
          speed={speed}
          isMuted={isMuted}
          onAnimate={animate}
          onPause={pauseAnimation}
          onResume={resumeAnimation}
          onStartQuiz={startQuiz}
          onCancelQuiz={cancelQuiz}
          onShowHint={showHint}
          onReset={resetBoard}
          onSpeedChange={setSpeed}
          onToggleMute={toggleMute}
        />
      )}
    </div>
  );
};

export default HanziCanvas;
