'use client';

import React from 'react';
import { Mic, Square, AlertCircle, RefreshCw } from 'lucide-react';

export interface RecordButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  rms?: number;
  error?: string | null;
  hasRecorded?: boolean;
  onReset?: () => void;
  className?: string;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onStart,
  onStop,
  disabled = false,
  rms = 0,
  error = null,
  hasRecorded = false,
  onReset,
  className = '',
}) => {
  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  // Waveform heights based on current audio RMS
  const waveHeights = [
    Math.min(28, Math.max(6, 6 + rms * 80)),
    Math.min(36, Math.max(10, 10 + rms * 120)),
    Math.min(42, Math.max(14, 14 + rms * 150)),
    Math.min(36, Math.max(10, 10 + rms * 110)),
    Math.min(26, Math.max(6, 6 + rms * 70)),
  ];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Primary Action Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`relative group flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl ${
            isRecording
              ? 'bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30 shadow-red-500/20 animate-pulse'
              : 'bg-gradient-to-r from-cyber-cyan to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-obsidian-950 shadow-cyber-cyan/20 hover:scale-105 active:scale-95'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <>
              {/* Animated Waveform Visualizer Inside Button */}
              <div className="flex items-center gap-1 h-6 px-1">
                {waveHeights.map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-red-400 rounded-full transition-all duration-75"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <Square className="w-4 h-4 fill-current" />
              <span>Dừng thu âm</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
              </div>
              <span>{hasRecorded ? 'Thu âm lại' : 'Bắt đầu phát âm'}</span>
            </>
          )}
        </button>

        {/* Reset Button if previously recorded */}
        {hasRecorded && !isRecording && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-3.5 rounded-2xl bg-obsidian-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
            title="Xóa kết quả và làm lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Helper text or Error badge */}
      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/30 max-w-md text-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center">
          {isRecording
            ? 'Đang lắng nghe... Hãy phát âm to, rõ ràng và ngân đủ trường độ.'
            : 'Nhấn nút, sau đó phát âm từ mẫu để hệ thống trích xuất đường cong F0.'}
        </p>
      )}
    </div>
  );
};
