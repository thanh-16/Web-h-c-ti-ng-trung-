'use client';

import React, { useState } from 'react';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { AudioContextManager } from '@/services/audioContext';
import { SpeechService } from '@/services/speechService';
import { Volume2, Sparkles, CheckCircle2, BookOpen, Mic } from 'lucide-react';

export default function HomePage() {
  const [selectedWord, setSelectedWord] = useState(HSK_CURRICULUM[0]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [playingTone, setPlayingTone] = useState<number | null>(null);

  const handleUnlockAudio = async () => {
    try {
      const manager = AudioContextManager.getInstance();
      await manager.getOrCreateContext();
      setAudioUnlocked(true);
    } catch (e) {
      console.warn('Audio unlock error:', e);
    }
  };

  const handlePlayTTS = async (text: string) => {
    await handleUnlockAudio();
    const speech = SpeechService.getInstance();
    await speech.speak(text);
  };

  const handlePlayTone = async (tone: 1 | 2 | 3 | 4) => {
    await handleUnlockAudio();
    setPlayingTone(tone);
    const speech = SpeechService.getInstance();
    await speech.playToneAcousticModel(tone);
    setTimeout(() => setPlayingTone(null), 700);
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col pt-safe pb-safe px-4 sm:px-6 md:px-8">
      {/* Top Header Bar */}
      <header className="py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-cyber-cyan/40 flex items-center justify-center glow-cyan shadow-sm">
            <span className="text-xl font-bold text-cyber-cyan">韵</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide flex items-center gap-2">
              <span className="text-white">HanziVibe</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 font-medium">
                汉字韵
              </span>
            </h1>
            <p className="text-xs text-slate-400">Nền tảng học tiếng Trung công nghệ cao</p>
          </div>
        </div>

        {/* Audio Engine Status Badge */}
        <button
          onClick={handleUnlockAudio}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            audioUnlocked
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          {audioUnlocked ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Audio Đã Sẵn Sàng</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Kích hoạt Web Audio</span>
            </>
          )}
        </button>
      </header>

      {/* Hero Section */}
      <section className="my-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-obsidian-900 via-slate-900 to-obsidian-900 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-semibold mb-3">
              <span>Đòn bẩy Hán - Việt & Pitch F0 YIN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Luyện Âm Chuẩn Xác — Viết Nét Tinh Thông
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Khai mở sức mạnh hơn 60% từ vựng Hán - Việt. Tận hưởng đồ thị cao độ 4 thanh điệu F0 thời gian thực và bảng luyện chữ Hán chuẩn bút thuận.
            </p>
          </div>
        </div>
      </section>

      {/* Tone Acoustic Studio Demonstration */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Mic className="w-4 h-4 text-cyber-cyan" />
          <span>4 Thanh Điệu Tiếng Trung (Mô hình Ngũ độ Chao)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([1, 2, 3, 4] as const).map((toneNum) => {
            const toneMeta = {
              1: { name: 'Thanh 1 (Âm Bình)', chao: '55', desc: 'Cao bằng', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40' },
              2: { name: 'Thanh 2 (Dương Bình)', chao: '35', desc: 'Lên dốc', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40' },
              3: { name: 'Thanh 3 (Thượng Thanh)', chao: '214', desc: 'Uốn trầm', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40' },
              4: { name: 'Thanh 4 (Khứ Thanh)', chao: '51', desc: 'Rơi dốc', color: 'border-red-500/40 text-red-400 bg-red-950/20 hover:bg-red-950/40' },
            }[toneNum];

            return (
              <button
                key={toneNum}
                onClick={() => handlePlayTone(toneNum)}
                className={`p-4 rounded-xl border text-left transition-all ${toneMeta.color} ${
                  playingTone === toneNum ? 'scale-95 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase">{toneMeta.name}</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-obsidian-950/80 border border-slate-700">
                    Chao {toneMeta.chao}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold">{toneMeta.desc}</div>
                <div className="mt-1 text-xs opacity-75 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  <span>Bấm nghe âm mẫu</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Study Deck - 4-Tier Sino-Vietnamese Card */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 flex-1">
        {/* Left: Vocabulary Deck Selector */}
        <div className="lg:col-span-1 bg-obsidian-900 border border-slate-800 rounded-2xl p-4 flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyber-cyan" />
              <span>Kho Từ Vựng HSK 1-3 ({HSK_CURRICULUM.length} từ)</span>
            </span>
            <span className="text-xs text-cyber-cyan font-mono bg-cyber-cyan/10 px-2 py-0.5 rounded">
              HSK 1-3
            </span>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {HSK_CURRICULUM.map((w) => {
              const isSelected = selectedWord.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWord(w)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/50 text-white shadow-sm'
                      : 'bg-obsidian-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-serif">{w.hanzi}</span>
                    <div>
                      <div className="text-xs font-semibold text-cyber-cyan">{w.pinyin}</div>
                      <div className="text-xs text-slate-400 font-medium">{w.sinoVietnamese}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      HSK {w.hskLevel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed 4-Tier Interactive Card */}
        <div className="lg:col-span-2 bg-obsidian-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Header of Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-semibold">
                  Cấp độ HSK {selectedWord.hskLevel}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Bộ thủ: {selectedWord.radical} ({selectedWord.strokeCount} nét)
                </span>
              </div>
              <button
                onClick={() => handlePlayTTS(selectedWord.hanzi)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-cyan text-obsidian-950 font-semibold text-xs hover:bg-cyan-300 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Phát âm bản xứ</span>
              </button>
            </div>

            {/* Main Word Display: Tier 1 & 2 */}
            <div className="my-6 text-center">
              <div className="text-6xl sm:text-7xl font-bold text-white tracking-wider font-serif">
                {selectedWord.hanzi}
              </div>
              <div className="mt-2 text-xl font-medium text-cyber-cyan tracking-wide font-mono">
                {selectedWord.pinyin}
              </div>
            </div>

            {/* 4-Tier Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-obsidian-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Tầng 3: Âm Hán Việt
                </span>
                <div className="text-lg font-bold text-white mt-1">{selectedWord.sinoVietnamese}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cầu nối ghi nhớ nhanh: 60%+ từ ngữ tương ứng trong tiếng Việt.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Tầng 4: Nghĩa Tiếng Việt
                </span>
                <div className="text-lg font-bold text-white mt-1">{selectedWord.vietnameseMeaning}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ý nghĩa ứng dụng thực tế trong giao tiếp hàng ngày.
                </p>
              </div>
            </div>

            {/* Radical & Decomposition Info */}
            <div className="mt-4 p-4 rounded-xl bg-obsidian-950/50 border border-slate-800/80 space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-300">Ý nghĩa bộ thủ: </span>
                <span className="text-slate-400">{selectedWord.radicalMeaning}</span>
              </div>
              {selectedWord.decomposition && (
                <div>
                  <span className="font-semibold text-slate-300">Chiết tự cấu trúc: </span>
                  <span className="text-slate-400">{selectedWord.decomposition}</span>
                </div>
              )}
              {selectedWord.mnemonic && (
                <div>
                  <span className="font-semibold text-amber-400">Mẹo nhớ Hán - Việt: </span>
                  <span className="text-slate-300 font-medium">{selectedWord.mnemonic}</span>
                </div>
              )}
              {selectedWord.toneAnalysis && (
                <div>
                  <span className="font-semibold text-cyber-cyan">Phân tích thanh điệu: </span>
                  <span className="text-slate-300">{selectedWord.toneAnalysis}</span>
                </div>
              )}
            </div>

            {/* Example Context Sentence */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-cyber-cyan/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyber-cyan uppercase tracking-wider">
                  Mẫu câu ngữ cảnh thực tế
                </span>
                <button
                  onClick={() => handlePlayTTS(selectedWord.exampleSentence.chinese)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe câu</span>
                </button>
              </div>
              <div className="text-sm font-semibold text-white font-serif">
                {selectedWord.exampleSentence.chinese}
              </div>
              <div className="text-xs text-cyber-cyan font-mono mt-0.5">
                {selectedWord.exampleSentence.pinyin}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {selectedWord.exampleSentence.vietnamese}
              </div>
              {selectedWord.exampleSentence.sinoVietnamese && (
                <div className="text-[11px] text-slate-400 italic mt-0.5">
                  Hán Việt: {selectedWord.exampleSentence.sinoVietnamese}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Dự án HanziVibe (汉字韵) • Milestone M1</span>
            <span className="font-mono text-emerald-400">Next.js 15 • React 19 • PWA</span>
          </div>
        </div>
      </section>
    </main>
  );
}
