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
import { Tilt3DCard, ParallaxCalligraphyCanvas } from '@/components/ui';
import { RoadmapJourney } from '@/components/roadmap';
import { VisualVocabStudio } from '@/components/vocab';
import { roadmapService } from '@/services/roadmapService';
import { RoadmapLesson } from '@/types/hsk';
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
  Compass,
  ArrowRight,
} from 'lucide-react';

type StudioTab = 'roadmap' | 'vocab' | 'canvas' | 'reader' | 'pitch' | 'battle';

export default function HomePage() {
  const [selectedWord, setSelectedWord] = useState<HskWord>(HSK_CURRICULUM[0]);
  const [activeTab, setActiveTab] = useState<StudioTab>('roadmap');
  const [currentLesson, setCurrentLesson] = useState<RoadmapLesson | null>(null);
  const [canvasSubMode, setCanvasSubMode] = useState<'single' | 'sentence'>('single');
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [srsDueCount, setSrsDueCount] = useState<number>(0);

  // Initialize active lesson from roadmap
  React.useEffect(() => {
    const active = roadmapService.getCurrentActiveLesson();
    setCurrentLesson(active);
    const words = HSK_CURRICULUM.filter((w) => active.wordIds.includes(w.id));
    if (words.length > 0) {
      setSelectedWord(words[0]);
    }
  }, []);

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

  const handleSelectLesson = (lesson: RoadmapLesson) => {
    setCurrentLesson(lesson);
    const words = HSK_CURRICULUM.filter((w) => lesson.wordIds.includes(w.id));
    if (words.length > 0) {
      setSelectedWord(words[0]);
      setSelectedCharIndex(0);
    }
    setActiveTab('vocab');
  };

  const handleCompleteLesson = () => {
    if (currentLesson) {
      roadmapService.completeLesson(currentLesson.id, 3, 100);
      progressService.recordSession({
        timeSpentSeconds: 180,
        wordsReviewed: currentLesson.wordIds.length,
        tonesPracticed: 2,
        charactersWritten: 1,
        accuracyRate: 100,
        xpEarned: 50,
      });
    }
    setActiveTab('roadmap');
  };

  const activeLessonWords = currentLesson
    ? HSK_CURRICULUM.filter((w) => currentLesson.wordIds.includes(w.id))
    : HSK_CURRICULUM;

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
    <div className="min-h-screen bg-paper-50 dark:bg-obsidian-950 text-stone-900 dark:text-slate-100 flex flex-col font-sans pb-safe relative overflow-x-hidden transition-colors duration-200">
      {/* 3D Parallax Floating Calligraphy & Dust Canvas */}
      <ParallaxCalligraphyCanvas className="fixed inset-0 pointer-events-none z-0" />

      {/* Top Fixed Header with Brand, Streak & Modals Trigger */}
      <Header
        audioUnlocked={audioUnlocked}
        onUnlockAudio={handleUnlockAudio}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Main Studio Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col gap-6">
        {/* Focused Single-Task Navigation Bar */}
        <section className="w-full">
          <div className="flex items-center gap-2 p-1.5 bg-white/90 dark:bg-obsidian-900/90 rounded-2xl border border-stone-200/90 dark:border-slate-800 shadow-md overflow-x-auto scrollbar-none backdrop-blur-md">
            {/* Tab 1: Roadmap */}
            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'roadmap'
                  ? 'btn-tactile-amber text-white shadow-lg'
                  : 'bg-transparent border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 mr-1.5 text-amber-500" />
              <span>🗺️ Lộ Trình HSK 1</span>
            </button>

            {/* Tab 2: Visual Vocab */}
            <button
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'vocab'
                  ? 'btn-tactile-coral text-white shadow-lg'
                  : 'bg-transparent border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base mr-1.5">📚</span>
              <span>Học Từ Vựng</span>
              {srsDueCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">
                  {srsDueCount}
                </span>
              )}
            </button>

            {/* Tab 3: Canvas */}
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'canvas'
                  ? 'btn-tactile-emerald text-white shadow-lg'
                  : 'bg-transparent border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base mr-1.5">✍️</span>
              <span>Luyện Viết Nét</span>
            </button>

            {/* Tab 4: Reader & AI */}
            <button
              type="button"
              onClick={() => setActiveTab('reader')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'reader'
                  ? 'btn-tactile-cyan text-white shadow-lg'
                  : 'bg-transparent border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base mr-1.5">📖</span>
              <span>Đọc &amp; Hỏi AI</span>
            </button>

            {/* Tab 5: Pitch Studio */}
            <button
              type="button"
              onClick={() => setActiveTab('pitch')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'pitch'
                  ? 'btn-tactile-indigo text-white shadow-lg'
                  : 'bg-transparent border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base mr-1.5">🎙️</span>
              <span>Phòng Luyện Âm</span>
            </button>

            {/* Tab 6: Battle 60s */}
            <button
              type="button"
              onClick={() => setActiveTab('battle')}
              className={`flex-1 min-w-[140px] btn-tactile py-2.5 px-3.5 text-xs font-black transition-all ${
                activeTab === 'battle'
                  ? 'btn-tactile-coral text-white shadow-lg'
                  : 'bg-transparent border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base mr-1.5">⚡</span>
              <span>Đấu Trường 60s</span>
            </button>
          </div>
        </section>

        {/* Focused Learning Workspace Display */}
        <section className="flex-1 w-full">
          {/* TAB 1: Roadmap Journey (Default Focus View) */}
          {activeTab === 'roadmap' && (
            <RoadmapJourney
              onSelectLesson={handleSelectLesson}
              streakDays={progressService.getProfile().streakDays}
            />
          )}

          {/* TAB 2: Visual Vocab Studio (Single-Word Focus + Mnemonic) */}
          {activeTab === 'vocab' && (
            <VisualVocabStudio
              word={selectedWord}
              allWords={activeLessonWords.length > 0 ? activeLessonWords : HSK_CURRICULUM}
              onSelectWord={(w) => {
                setSelectedWord(w);
                setSelectedCharIndex(0);
              }}
              onNavigateToWrite={(char) => {
                setSelectedCharIndex(0);
                setActiveTab('canvas');
              }}
              onBackToRoadmap={() => setActiveTab('roadmap')}
              lessonTitle={
                currentLesson
                  ? `Bài ${currentLesson.order}: ${currentLesson.title}`
                  : undefined
              }
            />
          )}

          {/* TAB 3: HanziWriter Interactive Stroke Canvas & Guided Writing Studio */}
          {activeTab === 'canvas' && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              {/* Studio Header: Breadcrumb & Complete Lesson Action */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-3xl bg-white/90 dark:bg-obsidian-900/90 border border-stone-200/90 dark:border-slate-800 shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('roadmap')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lộ Trình HSK 1</span>
                  </button>

                  <span className="text-xs font-bold text-stone-600 dark:text-slate-300">
                    {currentLesson ? `Bài ${currentLesson.order}: ${currentLesson.title}` : 'Luyện Viết Tự Do'}
                  </span>
                </div>

                {/* Complete Lesson Button */}
                {currentLesson && (
                  <button
                    type="button"
                    onClick={handleCompleteLesson}
                    className="btn-tactile btn-tactile-amber py-2.5 px-4 text-xs font-black text-white gap-2 shadow-sm"
                  >
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>Hoàn Thành Bài &amp; Nhận 3 ⭐</span>
                  </button>
                )}
              </div>

              {/* Sub-mode Switcher: Chữ đơn vs Mẫu câu HSK 1 */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-2.5 bg-white/80 dark:bg-obsidian-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center bg-stone-100 dark:bg-obsidian-950 p-1 rounded-xl border border-stone-200 dark:border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setCanvasSubMode('single')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canvasSubMode === 'single'
                        ? 'btn-tactile btn-tactile-emerald text-white shadow-md'
                        : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Luyện chữ đơn có hướng dẫn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCanvasSubMode('sentence')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canvasSubMode === 'sentence'
                        ? 'btn-tactile btn-tactile-cyan text-white shadow-md'
                        : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Luyện viết mẫu câu</span>
                  </button>
                </div>

                <div className="text-xs text-stone-500 dark:text-slate-400 pr-2">
                  {canvasSubMode === 'single'
                    ? 'Chế độ có nét mờ (Ghost guide) & hướng dẫn bút thuận'
                    : 'Luyện viết từng chữ trong mẫu câu giao tiếp'}
                </div>
              </div>

              {canvasSubMode === 'sentence' ? (
                <SentenceWritingStudio />
              ) : (
                <div className="bg-white/90 dark:bg-obsidian-900/90 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl backdrop-blur-md">
                  <div className="w-full flex items-center justify-between flex-wrap gap-3 pb-4 mb-4 border-b border-stone-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
                        Chữ đang luyện: {selectedWord.hanzi} ({selectedWord.pinyin})
                      </span>
                      <span className="text-xs text-stone-500 dark:text-slate-400">
                        Hán Việt: <strong className="text-stone-900 dark:text-white">{selectedWord.sinoVietnamese}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(selectedWord.hanzi)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Nghe âm mẫu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAiOpen(true)}
                        className="btn-tactile btn-tactile-cyan px-3 py-1.5 text-xs font-bold text-white gap-1.5 shadow-sm"
                      >
                        <Bot className="w-3.5 h-3.5 text-white" />
                        <span>Hỏi AI về nét này</span>
                      </button>
                    </div>
                  </div>

                  {/* Character Selector for multi-character words */}
                  {wordChars.length > 1 && (
                    <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-obsidian-950 rounded-2xl border border-stone-200 dark:border-slate-800 text-xs mb-4">
                      <span className="text-stone-500 dark:text-slate-400 font-medium px-2">Chọn chữ luyện viết:</span>
                      {wordChars.map((char, idx) => (
                        <button
                          key={char + idx}
                          type="button"
                          onClick={() => setSelectedCharIndex(idx)}
                          className={`px-3.5 py-1.5 rounded-xl font-serif text-base font-bold transition-all ${
                            selectedCharIndex === idx
                              ? 'bg-amber-500 text-white shadow-md scale-105'
                              : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
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
