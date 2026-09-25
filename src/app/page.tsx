'use client';

import React, { useState } from 'react';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import { HskWord } from '@/types/hsk';
import { AudioContextManager } from '@/services/audioContext';
import { SpeechService } from '@/services/speechService';
import { HanziCanvas, SentenceWritingStudio } from '@/components/hanzi';
import { ToneStudio } from '@/components/pitch';
import { FlashcardHub } from '@/components/flashcard';
import { Header } from '@/components/layout';
import { UserProfileModal } from '@/components/auth';
import { GeminiAiModal } from '@/components/ai';
import { InteractiveReaderStudio } from '@/components/reading';
import { TimeAttackBattle } from '@/components/battle';
import { srsService } from '@/services/srsService';
import { progressService } from '@/services/progressService';
import {
  Layers,
  Edit3,
  Activity,
  BookOpen,
  Volume2,
  Sparkles,
  Bot,
  Search,
  BookMarked,
  Mic,
  Zap,
  Brain,
  Flame,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

type StudioTab = 'flashcard' | 'canvas' | 'reader' | 'pitch' | 'dictionary' | 'battle';

export default function HomePage() {
  const [selectedWord, setSelectedWord] = useState<HskWord>(HSK_CURRICULUM[0]);
  const [activeTab, setActiveTab] = useState<StudioTab>('flashcard');
  const [canvasSubMode, setCanvasSubMode] = useState<'single' | 'sentence'>('single');
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [srsDueCount, setSrsDueCount] = useState<number>(0);

  // Subscribe to SRS due cards
  React.useEffect(() => {
    setSrsDueCount(srsService.getDueCount());
    const unsub = srsService.subscribe(() => {
      setSrsDueCount(srsService.getDueCount());
    });
    return unsub;
  }, []);
  const [playingTone, setPlayingTone] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState('');

  const wordChars = Array.from(selectedWord.hanzi).filter((c) => /[\u4E00-\u9FFF]/.test(c));
  const activeChar = wordChars[selectedCharIndex] || wordChars[0] || selectedWord.hanzi[0];

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

  const filteredCurriculum = HSK_CURRICULUM.filter((w) => {
    const q = dictionarySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      w.hanzi.includes(q) ||
      w.pinyin.toLowerCase().includes(q) ||
      w.sinoVietnamese.toLowerCase().includes(q) ||
      w.vietnameseMeaning.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans pb-safe">
      {/* Top Fixed Header with Brand, Streak & Modals Trigger */}
      <Header
        audioUnlocked={audioUnlocked}
        onUnlockAudio={handleUnlockAudio}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Main Studio Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col">
        {/* 1. Gamified Quest & Motivation Hero Dashboard */}
        <section className="mb-6">
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 border border-amber-500/30 relative overflow-hidden shadow-xl transition-all">
            {/* Subtle Calligraphic Seal Background Motif */}
            <div className="absolute right-4 -bottom-6 text-9xl font-serif font-black text-amber-500/5 pointer-events-none select-none">
              学
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black mb-3 shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-orange-500 animate-flame-glow" />
                  <span>Cùng Chinh Phục Tiếng Trung Mỗi Ngày!</span>
                </div>

                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Chào bạn! 👋 Hôm nay cùng giữ chuỗi lửa <span className="text-amber-400">Streak {progressService.getProfile().streakDays} Ngày</span> nhé!
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Luyện phát âm 4 thanh điệu chuẩn như người bản xứ, viết nét thư pháp bằng cảm ứng và nhớ từ vựng thần tốc qua đòn bẩy Hán - Việt.
                </p>

                {/* Daily Quest Mini Tracker */}
                <div className="mt-4 flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-950/70 border border-slate-700/80 text-xs font-bold text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Thẻ Flashcard: {srsDueCount > 0 ? `${srsDueCount} từ cần ôn` : 'Đã hoàn thành! ✨'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-950/70 border border-slate-700/80 text-xs font-bold text-slate-200">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Vốn từ: {progressService.getProfile().masteredWordIds.length} chữ vững vàng</span>
                  </div>
                </div>
              </div>

              {/* Quick Adventure Launchers (Tactile 3D Buttons) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0 lg:max-w-sm w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('flashcard')}
                  className="btn-tactile btn-tactile-amber p-3.5 flex flex-col items-start gap-1 text-left rounded-2xl shadow-md group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎴</span>
                  <span className="text-xs font-black text-white">Ôn Flashcard</span>
                  <span className="text-[10px] text-amber-100 font-medium">Lật thẻ nhớ lâu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('battle')}
                  className="btn-tactile btn-tactile-coral p-3.5 flex flex-col items-start gap-1 text-left rounded-2xl shadow-md group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                  <span className="text-xs font-black text-white">Đấu Trường 60s</span>
                  <span className="text-[10px] text-rose-100 font-medium">Đua phản xạ nhanh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('canvas')}
                  className="btn-tactile btn-tactile-emerald p-3.5 flex flex-col items-start gap-1 text-left rounded-2xl shadow-md group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">✍️</span>
                  <span className="text-xs font-black text-white">Luyện Viết Chữ</span>
                  <span className="text-[10px] text-emerald-100 font-medium">Bút thuận cảm ứng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('reader')}
                  className="btn-tactile btn-tactile-cyan p-3.5 flex flex-col items-start gap-1 text-left rounded-2xl shadow-md group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                  <span className="text-xs font-black text-white">Khoanh Hỏi AI</span>
                  <span className="text-[10px] text-cyan-100 font-medium">8 bài học HSK</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 4 Cung Bậc Thanh Điệu 🎵 (Melodic Tone Soundboard) */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>4 Cung Bậc Thanh Điệu 🎵 — Chạm để nghe nhạc điệu tiếng Trung</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
              Mô hình chuẩn Ngữ Điệu Bản Xứ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([1, 2, 3, 4] as const).map((toneNum) => {
              const toneMeta = {
                1: {
                  name: 'Thanh 1: Ngang Bằng',
                  symbol: '―',
                  desc: 'Bay bổng 🕊️',
                  tip: 'Âm cao đều, ngân vang',
                  bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
                },
                2: {
                  name: 'Thanh 2: Lên Dốc',
                  symbol: '↗',
                  desc: 'Vút cao 🚀',
                  tip: 'Trầm vút lên như câu hỏi',
                  bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-400',
                },
                3: {
                  name: 'Thanh 3: Uốn Lượn',
                  symbol: '⤹↗',
                  desc: 'Sóng nước 🌊',
                  tip: 'Hạ trầm sâu rồi vút lên',
                  bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
                },
                4: {
                  name: 'Thanh 4: Dứt Khoát',
                  symbol: '↘',
                  desc: 'Rơi dốc ⚡',
                  tip: 'Rơi mạnh và dứt khoát',
                  bg: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/40 text-red-400',
                },
              }[toneNum];

              return (
                <button
                  key={toneNum}
                  onClick={() => handlePlayTone(toneNum)}
                  className={`card-tactile p-4 text-left transition-all border ${toneMeta.bg} ${
                    playingTone === toneNum ? 'scale-95 shadow-xl ring-2 ring-white/50' : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl font-black font-mono">{toneMeta.symbol}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-obsidian-950/80 border border-slate-700 font-bold">
                      {toneMeta.desc}
                    </span>
                  </div>
                  <div className="text-xs font-black text-white">{toneMeta.name}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{toneMeta.tip}</div>
                  <div className="mt-2 text-[10px] font-bold text-cyber-cyan flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>Chạm nghe âm mẫu</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Chunky Tactile 3D Navigation Tabs (Duolingo Style) */}
        <section className="mb-6">
          <div className="flex items-center gap-2 p-1.5 bg-obsidian-900/90 rounded-2xl border border-slate-800 shadow-md overflow-x-auto scrollbar-none">
            {/* Tab 1: Flashcard */}
            <button
              type="button"
              onClick={() => setActiveTab('flashcard')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'flashcard'
                  ? 'btn-tactile-amber text-white shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base mr-1.5">🎴</span>
              <span>Flashcards</span>
              {srsDueCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                  {srsDueCount}
                </span>
              )}
            </button>

            {/* Tab 2: Battle 60s */}
            <button
              type="button"
              onClick={() => setActiveTab('battle')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'battle'
                  ? 'btn-tactile-coral text-white shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base mr-1.5">⚡</span>
              <span>Đấu Trường</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-obsidian-950 text-[9px] font-black uppercase">
                Hot
              </span>
            </button>

            {/* Tab 3: Canvas */}
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'canvas'
                  ? 'btn-tactile-emerald text-white shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base mr-1.5">✍️</span>
              <span>Luyện Viết Chữ</span>
            </button>

            {/* Tab 4: Reader */}
            <button
              type="button"
              onClick={() => setActiveTab('reader')}
              className={`flex-1 min-w-[150px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'reader'
                  ? 'btn-tactile-cyan text-white shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base mr-1.5">📖</span>
              <span>Đọc &amp; Hỏi AI</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-bold">
                8 Bài
              </span>
            </button>

            {/* Tab 5: Pitch Studio */}
            <button
              type="button"
              onClick={() => setActiveTab('pitch')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'pitch'
                  ? 'btn-tactile-indigo text-white shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base mr-1.5">🎙️</span>
              <span>Phòng Luyện Âm</span>
            </button>

            {/* Tab 6: Dictionary */}
            <button
              type="button"
              onClick={() => setActiveTab('dictionary')}
              className={`flex-1 min-w-[130px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'dictionary'
                  ? 'btn-tactile-cyan text-white shadow-lg'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-base mr-1.5">📚</span>
              <span>Từ Điển HSK</span>
            </button>
          </div>
        </section>

        {/* Tab Content Display */}
        <section className="flex-1 w-full">
          {/* TAB 1: Quizlet Flashcard Hub (Flip, Quiz, Match Game) */}
          {activeTab === 'flashcard' && (
            <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
              <FlashcardHub
                curriculum={HSK_CURRICULUM}
                selectedWord={selectedWord}
                onWordSelect={(word) => {
                  setSelectedWord(word);
                  setSelectedCharIndex(0);
                }}
              />
            </div>
          )}

          {/* TAB 2: HanziWriter Interactive Stroke Canvas & Sentence Writing Studio */}
          {activeTab === 'canvas' && (
            <div className="flex flex-col gap-6 w-full">
              {/* Sub-mode Switcher: Chữ đơn vs Mẫu câu HSK 1 */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-2.5 bg-obsidian-900 border border-slate-800 rounded-2xl shadow-md">
                <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setCanvasSubMode('single')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canvasSubMode === 'single'
                        ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Luyện chữ đơn HSK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCanvasSubMode('sentence')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canvasSubMode === 'sentence'
                        ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Luyện viết mẫu câu HSK 1</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-obsidian-950 font-black uppercase">
                      Mới
                    </span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 pr-2">
                  {canvasSubMode === 'single'
                    ? 'Luyện từng nét bút thuận, hỗ trợ viết nhớ ẩn nét mờ'
                    : 'Luyện viết toàn bộ chữ trong câu để nhớ sâu từ Hán'}
                </div>
              </div>

              {canvasSubMode === 'sentence' ? (
                <SentenceWritingStudio />
              ) : (
                <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl">
                  <div className="w-full flex items-center justify-between flex-wrap gap-3 pb-4 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                        Từ đang chọn: {selectedWord.hanzi} ({selectedWord.pinyin})
                      </span>
                      <span className="text-xs text-slate-400">
                        Âm Hán Việt: <strong className="text-amber-400">{selectedWord.sinoVietnamese}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(selectedWord.hanzi)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyber-cyan" />
                        <span>Nghe từ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAiOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 text-xs font-bold transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Hỏi Gemini AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Character Selector for multi-character words */}
                  {wordChars.length > 1 && (
                    <div className="flex items-center gap-2 p-1.5 bg-obsidian-950 rounded-2xl border border-slate-800 text-xs mb-4">
                      <span className="text-slate-400 font-medium px-2">Chọn chữ luyện viết:</span>
                      {wordChars.map((char, idx) => (
                        <button
                          key={char + idx}
                          type="button"
                          onClick={() => setSelectedCharIndex(idx)}
                          className={`px-3.5 py-1.5 rounded-xl font-serif text-base font-bold transition-all ${
                            selectedCharIndex === idx
                              ? 'bg-cyber-cyan text-obsidian-950 shadow-md scale-105'
                              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* HanziWriter Canvas Engine Component */}
                  <HanziCanvas
                    character={activeChar}
                    pinyin={selectedWord.pinyin}
                    sinoVietnamese={selectedWord.sinoVietnamese}
                    meaning={selectedWord.vietnameseMeaning}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB: Interactive Reader Studio & Circle-to-Search AI */}
          {activeTab === 'reader' && (
            <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
              <InteractiveReaderStudio
                onPracticeCharacter={(char, matched) => {
                  if (matched) {
                    setSelectedWord(matched);
                  }
                  setActiveTab('canvas');
                  setCanvasSubMode('single');
                }}
              />
            </div>
          )}

          {/* TAB 3: ToneStudio (Pitch Contour F0) */}
          {activeTab === 'pitch' && (
            <div className="bg-obsidian-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                    Từ đang luyện âm: {selectedWord.hanzi} ({selectedWord.pinyin})
                  </span>
                  <span className="text-xs text-slate-400">
                    Thanh {selectedWord.tone} • Hán Việt: <strong className="text-slate-200">{selectedWord.sinoVietnamese}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAiOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 text-xs font-bold transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Phân tích thanh điệu với AI</span>
                </button>
              </div>

              <ToneStudio selectedWord={selectedWord} />
            </div>
          )}

          {/* TAB 4: 4-Tier HSK Dictionary with Search */}
          {activeTab === 'dictionary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Word List with search bar */}
              <div className="lg:col-span-1 bg-obsidian-900 border border-slate-800 rounded-3xl p-4 flex flex-col max-h-[600px] shadow-xl">
                <div className="pb-3 border-b border-slate-800 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-cyber-cyan" />
                      <span>Kho Từ Vựng HSK 1-3 ({filteredCurriculum.length})</span>
                    </span>
                    <span className="text-xs text-cyber-cyan font-mono bg-cyber-cyan/10 px-2 py-0.5 rounded">
                      HSK 1-3
                    </span>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Tìm chữ Hán, Pinyin, Hán Việt..."
                      value={dictionarySearch}
                      onChange={(e) => setDictionarySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-obsidian-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan/50"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                  {filteredCurriculum.map((w) => {
                    const isSelected = selectedWord.id === w.id;
                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          setSelectedWord(w);
                          setSelectedCharIndex(0);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
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

              {/* Right Column: Detailed 4-Tier Interactive Card */}
              <div className="lg:col-span-2 bg-obsidian-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                        Cấp độ HSK {selectedWord.hskLevel}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        Bộ thủ: {selectedWord.radical} ({selectedWord.strokeCount} nét)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(selectedWord.hanzi)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyber-cyan" />
                        <span>Phát âm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAiOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/40 text-xs font-bold transition-colors"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Hỏi Gemini AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Display: Hanzi + Pinyin */}
                  <div className="my-6 text-center">
                    <div className="text-6xl sm:text-7xl font-bold text-white tracking-wider font-serif">
                      {selectedWord.hanzi}
                    </div>
                    <div className="mt-2 text-xl font-medium text-cyber-cyan tracking-wide font-mono">
                      {selectedWord.pinyin}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('canvas')}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 text-xs font-bold transition-all shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Luyện viết chữ này</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pitch')}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Luyện phát âm F0</span>
                      </button>
                    </div>
                  </div>

                  {/* 4-Tier Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Tầng 3: Âm Hán Việt
                      </span>
                      <div className="text-lg font-bold text-white mt-1">{selectedWord.sinoVietnamese}</div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Cầu nối ghi nhớ nhanh: 60%+ từ ngữ tương ứng trong tiếng Việt.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-slate-800">
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
                  <div className="mt-4 p-4 rounded-2xl bg-obsidian-950/50 border border-slate-800/80 space-y-2 text-xs">
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
                  <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-cyber-cyan/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyber-cyan uppercase tracking-wider">
                        Mẫu câu ngữ cảnh thực tế
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(selectedWord.exampleSentence.chinese)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyber-cyan" />
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
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>HanziVibe (汉字韵) • Milestone M4 Studio</span>
                  <span className="font-mono text-emerald-400">Vercel Edge Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 60-Second Time-Attack Vocab Battle */}
          {activeTab === 'battle' && (
            <div className="w-full">
              <TimeAttackBattle
                curriculum={HSK_CURRICULUM}
                onWordSelect={(word) => {
                  setSelectedWord(word);
                  setSelectedCharIndex(0);
                }}
              />
            </div>
          )}
        </section>
      </main>

      {/* Global Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <GeminiAiModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        activeWord={selectedWord}
        allWords={HSK_CURRICULUM}
        onSelectWord={(word) => {
          setSelectedWord(word);
          setSelectedCharIndex(0);
        }}
      />
    </div>
  );
}
