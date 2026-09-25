'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Sparkles, Edit3, HelpCircle, Bot, X } from 'lucide-react';
import { hanziAudio } from '@/services/hanziAudioFeedback';

interface CircleToSearchOverlayProps {
  sentenceText: string;
  pinyinText?: string;
  sinoVietnameseText?: string;
  vietnameseMeaning?: string;
  onCircleWord: (circledWord: string) => void;
  className?: string;
  enableLassoMode?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const CircleToSearchOverlay: React.FC<CircleToSearchOverlayProps> = ({
  sentenceText,
  pinyinText,
  sinoVietnameseText,
  vietnameseMeaning,
  onCircleWord,
  className = '',
  enableLassoMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLassoActive, setIsLassoActive] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<Point[]>([]);
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(null);
  const [circledWord, setCircledWord] = useState<string | null>(null);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);

  // Resize canvas according to container dimensions
  const updateCanvasSize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Redraw canvas path
  const redrawCanvas = useCallback((points: Point[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = '#06B6D4'; // cyber-cyan
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  // Handle pointer down (mouse, touch, Apple Pencil)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isLassoActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    setIsDrawing(true);
    const newPoints = [{ x, y }];
    setDrawnPoints(newPoints);
    redrawCanvas(newPoints);
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isLassoActive || !isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    setDrawnPoints((prev) => {
      const updated = [...prev, { x, y }];
      redrawCanvas(updated);
      return updated;
    });
  };

  // Detect which characters fall inside the drawn bounding box
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isLassoActive || !isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }

    setIsDrawing(false);

    if (drawnPoints.length < 5) {
      // Too short to be a circle, clear
      redrawCanvas([]);
      return;
    }

    // Compute bounding box of drawn loop
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    drawnPoints.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;

    // Must have a minimum size to count as circling
    if (boxWidth < 15 || boxHeight < 15) {
      redrawCanvas([]);
      return;
    }

    // Find intersecting character elements
    if (!containerRef.current) return;
    const charElements = containerRef.current.querySelectorAll<HTMLSpanElement>('[data-char-index]');
    const containerRect = containerRef.current.getBoundingClientRect();

    const selectedChars: { char: string; index: number; x: number; y: number }[] = [];

    charElements.forEach((el) => {
      const elRect = el.getBoundingClientRect();
      const elRelativeX = elRect.left - containerRect.left + elRect.width / 2;
      const elRelativeY = elRect.top - containerRect.top + elRect.height / 2;

      // Check if character center is inside the drawn bounding box
      if (
        elRelativeX >= minX &&
        elRelativeX <= maxX &&
        elRelativeY >= minY &&
        elRelativeY <= maxY
      ) {
        const idx = parseInt(el.getAttribute('data-char-index') || '0', 10);
        const char = el.getAttribute('data-char') || '';
        selectedChars.push({ char, index: idx, x: elRelativeX, y: elRelativeY });
      }
    });

    if (selectedChars.length > 0) {
      const detectedText = selectedChars.map((c) => c.char).join('');
      setCircledWord(detectedText);
      setSelectedCharIndex(selectedChars[0].index);

      // Play subtle chime feedback
      hanziAudio.playChime().catch(() => {});

      // Position floating badge
      setFloatingPos({
        x: Math.min(containerRect.width - 120, Math.max(10, (minX + maxX) / 2 - 50)),
        y: Math.max(0, minY - 45),
      });

      // Automatically trigger callback if single clear word
      onCircleWord(detectedText);
    }

    // Keep drawn circle on canvas briefly for visual feedback, then fade
    setTimeout(() => {
      redrawCanvas([]);
    }, 1200);
  };

  // Tap-to-circle direct character selection
  const handleCharClick = (char: string, index: number, e: React.MouseEvent<HTMLSpanElement>) => {
    setSelectedCharIndex(index);
    setCircledWord(char);

    // Play chime sound
    hanziAudio.playChime().catch(() => {});

    // Position floating popup above the tapped character
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = e.currentTarget.getBoundingClientRect();
      setFloatingPos({
        x: Math.min(containerRect.width - 120, Math.max(10, elRect.left - containerRect.left - 20)),
        y: Math.max(0, elRect.top - containerRect.top - 45),
      });
    }

    onCircleWord(char);
  };

  // Split sentence into characters
  const characters = Array.from(sentenceText);

  return (
    <div
      ref={containerRef}
      className={`relative p-4 sm:p-6 rounded-3xl bg-obsidian-950/80 border border-slate-800 shadow-xl overflow-visible select-none ${className}`}
    >
      {/* Top Banner & Mode Toggle */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Khoanh chữ không biết để hỏi AI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-cyan/20 text-cyber-cyan">
                Lasso &amp; Tap
              </span>
            </span>
            <p className="text-[11px] text-slate-400">
              Dùng ngón tay/bút khoanh tròn hoặc chạm vào bất kỳ chữ Hán nào để tra cứu ngay!
            </p>
          </div>
        </div>

        {/* Toggle Freehand Lasso Drawing Mode */}
        {enableLassoMode && (
          <button
            type="button"
            onClick={() => {
              setIsLassoActive((prev) => !prev);
              setSelectedCharIndex(null);
              setCircledWord(null);
              setFloatingPos(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
              isLassoActive
                ? 'bg-cyber-cyan text-obsidian-950 shadow-lg shadow-cyber-cyan/20 scale-105'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isLassoActive ? 'Đang bật bút vẽ khoanh' : 'Bật bút khoanh'}</span>
          </button>
        )}
      </div>

      {/* Floating Action Pill if a word was selected/circled */}
      {circledWord && floatingPos && (
        <div
          style={{ left: `${floatingPos.x}px`, top: `${floatingPos.y}px` }}
          className="absolute z-30 animate-bounce flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyber-cyan text-obsidian-950 text-xs font-extrabold shadow-xl cursor-pointer hover:bg-cyan-300 transition-transform active:scale-95"
          onClick={() => onCircleWord(circledWord)}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Hỏi AI về chữ &apos;{circledWord}&apos;</span>
        </div>
      )}

      {/* Interactive Sentence Text Display */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4 sm:py-6">
        {characters.map((char, index) => {
          const isChinese = /[\u4E00-\u9FFF]/.test(char);
          const isSelected = selectedCharIndex === index;

          if (!isChinese) {
            return (
              <span key={index} className="text-2xl sm:text-3xl font-serif text-slate-500 font-bold">
                {char}
              </span>
            );
          }

          return (
            <div key={index} className="relative group">
              {/* Hand-drawn style animated circle overlay for selected character */}
              {isSelected && (
                <svg
                  className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none z-20 text-cyber-cyan animate-spin-slow"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="14 8 20 6"
                    className="opacity-90 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </svg>
              )}

              <span
                data-char={char}
                data-char-index={index}
                onClick={(e) => handleCharClick(char, index, e)}
                className={`relative z-10 block px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl text-3xl sm:text-5xl font-serif font-extrabold cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'text-cyber-cyan scale-110 bg-cyber-cyan/15 ring-2 ring-cyber-cyan/50 shadow-lg'
                    : 'text-white hover:text-cyber-cyan hover:bg-slate-800/60 active:scale-95'
                }`}
                title={`Chạm để hỏi AI về chữ '${char}'`}
              >
                {char}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtitles: Pinyin, Hán Việt, Meaning */}
      <div className="text-center space-y-1.5 mt-2 pt-3 border-t border-slate-800/80">
        {pinyinText && (
          <div className="text-sm sm:text-base font-mono font-bold text-cyber-cyan">
            {pinyinText}
          </div>
        )}
        {sinoVietnameseText && (
          <div className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-wider">
            {sinoVietnameseText}
          </div>
        )}
        {vietnameseMeaning && (
          <div className="text-xs sm:text-sm text-slate-300 font-medium">
            {vietnameseMeaning}
          </div>
        )}
      </div>

      {/* Freehand Lasso Canvas Layer */}
      {isLassoActive && (
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 z-20 w-full h-full cursor-crosshair touch-none rounded-3xl"
        />
      )}
    </div>
  );
};
export default CircleToSearchOverlay;
