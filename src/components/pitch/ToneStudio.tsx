'use client';

import React, { useState, useEffect } from 'react';
import { HskWord } from '@/types/hsk';
import { MandarinTone, TONE_METADATA } from '@/services/toneScorer';
import { usePitchDetector } from '@/hooks/usePitchDetector';
import { PitchVisualizer } from './PitchVisualizer';
import { ToneGuideCard } from './ToneGuideCard';
import { RecordButton } from './RecordButton';
import { SpeechService } from '@/services/speechService';
import { AudioContextManager } from '@/services/audioContext';
import { Volume2, Award, Sparkles, AlertCircle, Info } from 'lucide-react';

export interface ToneStudioProps {
  selectedWord: HskWord;
  className?: string;
}

export const ToneStudio: React.FC<ToneStudioProps> = ({
  selectedWord,
  className = '',
}) => {
  // Determine primary tone from word (1 to 4; if 5 fallback to 1)
  const defaultTone: MandarinTone = (
    selectedWord.tone >= 1 && selectedWord.tone <= 4
      ? selectedWord.tone
      : 1
  ) as MandarinTone;

  const [activeTone, setActiveTone] = useState<MandarinTone>(defaultTone);

  // Sync activeTone when word changes
  useEffect(() => {
    const wordTone = (
      selectedWord.tone >= 1 && selectedWord.tone <= 4
        ? selectedWord.tone
        : 1
    ) as MandarinTone;
    setActiveTone(wordTone);
  }, [selectedWord]);

  const {
    startRecording,
    stopRecording,
    isRecording,
    currentPitch,
    currentClarity,
    currentRms,
    pitchHistory,
    toneResult,
    error,
    targetTone,
    setTargetTone,
    clearHistory,
  } = usePitchDetector({
    initialTargetTone: activeTone,
    maxDurationMs: 1800,
  });

  // Keep hook targetTone in sync with activeTone
  const handleSelectTone = (tone: MandarinTone) => {
    setActiveTone(tone);
    setTargetTone(tone);
    clearHistory();
  };

  const handlePlayWordAudio = async () => {
    try {
      const manager = AudioContextManager.getInstance();
      await manager.getOrCreateContext();
      const speech = SpeechService.getInstance();
      await speech.speak(selectedWord.hanzi);
    } catch (e) {
      console.warn('Word audio playback failed:', e);
    }
  };

  const toneMeta = TONE_METADATA[activeTone];

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      {/* Word Context & Pronunciation Banner */}
      <div className="p-4 rounded-2xl bg-obsidian-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-obsidian-900 border border-slate-700 flex items-center justify-center font-serif text-3xl font-bold text-white shadow-inner">
            {selectedWord.hanzi}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold text-cyber-cyan">
                {selectedWord.pinyin}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {selectedWord.sinoVietnamese}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nghĩa: <span className="text-slate-200">{selectedWord.vietnameseMeaning}</span>
              {selectedWord.toneAnalysis && ` • ${selectedWord.toneAnalysis}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlayWordAudio}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs transition-colors"
        >
          <Volume2 className="w-4 h-4 text-cyber-cyan" />
          <span>Nghe từ '{selectedWord.hanzi}'</span>
        </button>
      </div>

      {/* Tone Guide Selector Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Chọn thanh điệu mục tiêu</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Mục tiêu: {toneMeta.nameVi} (Chao {toneMeta.chaoCode})
          </span>
        </div>
        <ToneGuideCard
          selectedTone={activeTone}
          onSelectTone={handleSelectTone}
        />
      </div>

      {/* 60 FPS HTML5 Retina Canvas Visualizer */}
      <div>
        <PitchVisualizer
          targetTone={activeTone}
          pitchPoints={pitchHistory}
          currentPitch={currentPitch}
          currentClarity={currentClarity}
          currentRms={currentRms}
          isRecording={isRecording}
          scoreResult={toneResult}
        />
      </div>

      {/* Recording Control Button */}
      <div className="py-2 flex justify-center">
        <RecordButton
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
          rms={currentRms}
          error={error}
          hasRecorded={pitchHistory.length > 0}
          onReset={clearHistory}
        />
      </div>

      {/* Score & Pedagogical Coaching Feedback Card */}
      {toneResult && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            toneResult.matchScore >= 80
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : toneResult.matchScore >= 60
              ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
              : 'bg-red-950/20 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 flex-shrink-0" />
              <h4 className="text-base font-bold text-white">
                Đánh giá phát âm: {toneResult.matchScore}%
              </h4>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-300">
                Cao độ trung vị cá nhân: <strong className="text-white">{toneResult.userMedianHz} Hz</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                Sai lệch: {toneResult.meanChaoError} bậc Chao
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
            <p className="text-sm font-medium leading-relaxed">
              {toneResult.feedbackVi}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
