'use client';

import React, { useState } from 'react';
import {
  MandarinTone,
  TONE_METADATA,
  generateChaoCurve,
} from '@/services/toneScorer';
import { SpeechService } from '@/services/speechService';
import { AudioContextManager } from '@/services/audioContext';
import { Volume2, Check } from 'lucide-react';

export interface ToneGuideCardProps {
  selectedTone: MandarinTone;
  onSelectTone: (tone: MandarinTone) => void;
  className?: string;
}

export const ToneGuideCard: React.FC<ToneGuideCardProps> = ({
  selectedTone,
  onSelectTone,
  className = '',
}) => {
  const [playingTone, setPlayingTone] = useState<MandarinTone | null>(null);

  const handlePlayAudio = async (e: React.MouseEvent, tone: MandarinTone) => {
    e.stopPropagation();
    try {
      const manager = AudioContextManager.getInstance();
      await manager.getOrCreateContext();

      setPlayingTone(tone);
      const speech = SpeechService.getInstance();
      await speech.playToneAcousticModel(tone);
      setTimeout(() => setPlayingTone(null), 700);
    } catch (err) {
      console.warn('Audio play failed:', err);
      setPlayingTone(null);
    }
  };

  const tones: MandarinTone[] = [1, 2, 3, 4];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {tones.map((tone) => {
        const meta = TONE_METADATA[tone];
        const isSelected = selectedTone === tone;
        const isPlaying = playingTone === tone;
        const curvePoints = generateChaoCurve(tone, 20);

        // Generate SVG path for mini Chao thumbnail
        const svgW = 100;
        const svgH = 40;
        const paddingY = 6;
        const pathData = curvePoints.reduce((acc, pt, idx) => {
          const x = (pt.t * (svgW - 12) + 6).toFixed(1);
          // Chao 5 -> top (paddingY), Chao 1 -> bottom (svgH - paddingY)
          const normY = (pt.chao - 1.0) / 4.0;
          const y = (svgH - paddingY - normY * (svgH - paddingY * 2)).toFixed(1);
          return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
        }, '');

        return (
          <div
            key={tone}
            onClick={() => onSelectTone(tone)}
            className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'bg-obsidian-900 border-cyber-cyan shadow-lg shadow-cyber-cyan/10 ring-1 ring-cyber-cyan/40 scale-[1.02]'
                : 'bg-obsidian-950/70 border-slate-800/90 text-slate-300 hover:bg-obsidian-900/60 hover:border-slate-700'
            }`}
          >
            {/* Top Row: Tone Title & Chao Badge */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.colorHex }}
                  />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {meta.nameVi}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-obsidian-950 border border-slate-700 text-amber-400">
                  {meta.chaoCode}
                </span>
              </div>

              {/* Subtitle in Chinese & Pinyin */}
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="font-serif font-semibold text-slate-200">{meta.nameZh}</span>
                <span className="font-mono text-cyber-cyan">{meta.pinyinName}</span>
              </div>

              {/* Mini SVG Curve Preview */}
              <div className="my-2.5 bg-obsidian-950/90 rounded-xl p-1.5 border border-slate-800/80 flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full h-9 stroke-current overflow-visible"
                  style={{ color: meta.colorHex }}
                >
                  {/* Subtle reference grid lines */}
                  <line
                    x1="6"
                    y1={paddingY}
                    x2={svgW - 6}
                    y2={paddingY}
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1="6"
                    y1={svgH - paddingY}
                    x2={svgW - 6}
                    y2={svgH - paddingY}
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* Curve Path */}
                  <path
                    d={pathData}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Pedagogical Description */}
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {meta.descriptionVi}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handlePlayAudio(e, tone)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  isPlaying
                    ? 'bg-cyber-cyan text-obsidian-950 border-cyber-cyan scale-95'
                    : 'bg-slate-800/70 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
                }`}
                title="Nghe cao độ chuẩn"
              >
                <Volume2 className="w-3 h-3 text-cyber-cyan" />
                <span>Nghe mẫu</span>
              </button>

              {isSelected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyber-cyan">
                  <Check className="w-3 h-3" />
                  <span>Đang chọn</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">Bấm để chọn</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
