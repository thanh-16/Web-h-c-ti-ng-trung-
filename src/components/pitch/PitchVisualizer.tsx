'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import {
  MandarinTone,
  PitchRecordPoint,
  ToneScoreResult,
  generateChaoCurve,
  TONE_METADATA,
} from '@/services/toneScorer';

export interface PitchVisualizerProps {
  targetTone: MandarinTone;
  pitchPoints: PitchRecordPoint[];
  currentPitch?: number;
  currentClarity?: number;
  currentRms?: number;
  isRecording?: boolean;
  scoreResult?: ToneScoreResult | null;
  className?: string;
}

export const PitchVisualizer: React.FC<PitchVisualizerProps> = ({
  targetTone,
  pitchPoints,
  currentPitch = 0,
  currentClarity = 0,
  currentRms = 0,
  isRecording = false,
  scoreResult = null,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Ánh xạ giá trị Chao (1.0 -> 5.0) thành tọa độ Y trên Canvas (Y=0 ở đỉnh trên)
   */
  const chaoToY = useCallback((chao: number, height: number, paddingTop: number, paddingBottom: number): number => {
    const usableHeight = height - paddingTop - paddingBottom;
    // Chao 5.0 ở đỉnh (paddingTop), Chao 1.0 ở đáy (height - paddingBottom)
    const normalized = (chao - 1.0) / 4.0;
    return height - paddingBottom - normalized * usableHeight;
  }, []);

  /**
   * Render toàn bộ khung hình trực quan 60 FPS
   */
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI Scaling
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    // 1. Nền tối Cyberpunk Zen (Slate-950 / Obsidian)
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid glow
    const radialGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      10,
      width * 0.5,
      height * 0.5,
      width * 0.6
    );
    radialGrad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, width, height);

    const paddingTop = 28;
    const paddingBottom = 28;
    const paddingLeft = 70; // Chỗ cho nhãn Ngũ độ Chao
    const paddingRight = 24;
    const usableWidth = width - paddingLeft - paddingRight;

    // 2. Vẽ 5 tầng cao độ Chao Grid (1 -> 5) với nhãn tiếng Việt & Hán
    const chaoLabels: Record<number, string> = {
      5: '5 (Cao)',
      4: '4 (Nửa cao)',
      3: '3 (Trung bình)',
      2: '2 (Nửa thấp)',
      1: '1 (Thấp)',
    };

    for (let level = 1; level <= 5; level++) {
      const y = chaoToY(level, height, paddingTop, paddingBottom);

      // Đường ngang tham chiếu
      ctx.beginPath();
      if (level === 3) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)'; // Đường mốc trung tâm Cyan
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
      }
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Nhãn tầng
      ctx.setLineDash([]);
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      if (level === 3) {
        ctx.fillStyle = '#06B6D4';
      } else if (level === 5) {
        ctx.fillStyle = '#F59E0B';
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
      }
      ctx.fillText(chaoLabels[level], paddingLeft - 8, y);
    }

    // 3. Vẽ Target Tone Ghost Curve (Đường cong mẫu chuẩn màu hổ phách #F59E0B)
    const targetCurve = generateChaoCurve(targetTone, 100);

    ctx.save();
    // Đường mờ rộng tạo hiệu ứng phát sáng neon (glow aura)
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < targetCurve.length; i++) {
      const pt = targetCurve[i];
      const x = paddingLeft + pt.t * usableWidth;
      const y = chaoToY(pt.chao, height, paddingTop, paddingBottom);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Đường nét chính
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#F59E0B';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // 4. Vẽ giọng nói học viên (Live Pitch Trail: Cyan #06B6D4 -> Emerald #10B981)
    const voicedPoints = pitchPoints.filter((p) => p.isVoiced && p.chaoLevel >= 1.0 && p.chaoLevel <= 5.0);

    if (voicedPoints.length >= 2) {
      ctx.save();

      // Gradient chuyển màu thời gian thực
      const trailGrad = ctx.createLinearGradient(paddingLeft, 0, width - paddingRight, 0);
      trailGrad.addColorStop(0, '#06B6D4'); // Cyan
      trailGrad.addColorStop(1, '#10B981'); // Emerald

      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = trailGrad;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      const totalPoints = voicedPoints.length;

      for (let i = 0; i < totalPoints; i++) {
        const pt = voicedPoints[i];
        // Ánh xạ tỉ lệ vị trí x dựa trên tiến độ thời gian (0 -> 1)
        const t = i / (totalPoints - 1);
        const x = paddingLeft + t * usableWidth;
        const y = chaoToY(pt.chaoLevel, height, paddingTop, paddingBottom);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Vẽ đầu sóng con trỏ (Live Head Cursor) phát sáng nhịp theo RMS
      const lastPoint = voicedPoints[voicedPoints.length - 1];
      if (lastPoint && isRecording) {
        const headX = paddingLeft + usableWidth;
        const headY = chaoToY(lastPoint.chaoLevel, height, paddingTop, paddingBottom);

        // Vòng ngoài phát sáng
        ctx.beginPath();
        const pulseRadius = Math.min(14, Math.max(6, 6 + currentRms * 40));
        ctx.arc(headX, headY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fill();

        // Điểm tâm màu trắng
        ctx.beginPath();
        ctx.arc(headX, headY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 14;
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }, [targetTone, pitchPoints, currentRms, isRecording, chaoToY]);

  // Hook cập nhật canvas khi dữ liệu hoặc kích thước thay đổi
  useEffect(() => {
    let animId: number;

    const tick = () => {
      renderCanvas();
      if (isRecording) {
        animId = requestAnimationFrame(tick);
      }
    };

    tick();

    const handleResize = () => {
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [renderCanvas, isRecording]);

  const toneMeta = TONE_METADATA[targetTone];

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-obsidian-950 shadow-xl ${className}`}>
      {/* Top HUD Header */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-xs">
        {/* Target Tone Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-slate-800 backdrop-blur-md shadow-sm">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: toneMeta.colorHex }}
          />
          <span className="font-bold text-white tracking-wide">{toneMeta.nameVi}</span>
          <span className="font-mono text-amber-400 font-semibold">Chao {toneMeta.chaoCode}</span>
        </div>

        {/* Real-time Pitch & Clarity HUD */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-cyan-500/40 text-cyan-400 backdrop-blur-md shadow-sm font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {currentPitch > 0 ? `${currentPitch.toFixed(1)} Hz` : 'Đang nghe...'}
              </span>
              {currentClarity > 0 && (
                <span className="text-slate-400 text-[10px]">
                  ({Math.round(currentClarity * 100)}%)
                </span>
              )}
            </div>
          ) : scoreResult ? (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm font-bold ${
                scoreResult.matchScore >= 80
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : scoreResult.matchScore >= 60
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
              }`}
            >
              <span>Điểm khớp: {scoreResult.matchScore}%</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-obsidian-900/80 border border-slate-800 text-slate-400 font-medium">
              Sẵn sàng ghi âm
            </div>
          )}
        </div>
      </div>

      {/* HTML5 Canvas Rendering Surface */}
      <canvas
        ref={canvasRef}
        className="w-full h-64 sm:h-72 md:h-80 block"
        style={{ touchAction: 'none' }}
      />

      {/* Bottom Legend */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-obsidian-900/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-amber-400 inline-block" />
            <span>Mẫu chuẩn ({toneMeta.chaoCode})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 inline-block" />
            <span>Giọng của bạn</span>
          </div>
        </div>
        <div className="hidden sm:block text-slate-500 font-mono text-[10px]">
          YIN DSP • Retina 60 FPS • Bán cung Fmedian
        </div>
      </div>
    </div>
  );
};
