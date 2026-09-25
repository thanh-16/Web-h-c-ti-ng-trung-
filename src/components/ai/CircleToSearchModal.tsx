'use client';

import React, { useState, useEffect } from 'react';
import { CircleSearchResult, CircleSearchPromptMode } from '@/types/gemini';
import { geminiAiService } from '@/services/geminiAiService';
import { SpeechService } from '@/services/speechService';
import { HskWord } from '@/types/hsk';
import {
  X,
  Sparkles,
  Volume2,
  BookOpen,
  Edit3,
  Lightbulb,
  Search,
  MessageSquare,
  Send,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Bot,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { annotationService } from '@/services/annotationService';

interface CircleToSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryText: string;
  contextSentence?: string;
  onPracticeCharacter?: (char: string, matchedWord?: HskWord) => void;
}

export const CircleToSearchModal: React.FC<CircleToSearchModalProps> = ({
  isOpen,
  onClose,
  queryText,
  contextSentence,
  onPracticeCharacter,
}) => {
  const [activeMode, setActiveMode] = useState<CircleSearchPromptMode>('explain');
  const [customQuestion, setCustomQuestion] = useState('');
  const [result, setResult] = useState<CircleSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSavedNote, setIsSavedNote] = useState<boolean>(false);

  // Fetch AI content whenever queryText, contextSentence or activeMode changes
  useEffect(() => {
    if (!isOpen || !queryText.trim()) return;

    let isMounted = true;
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const res = await geminiAiService.queryUnknownWord({
          queryText: queryText.trim(),
          contextSentence,
          promptMode: activeMode,
          customQuestion: activeMode === 'custom' ? customQuestion : undefined,
        });

        if (isMounted) {
          setResult(res);
        }
      } catch (err) {
        console.error('Failed to query Circle-to-Search AI:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (activeMode !== 'custom' || customQuestion.trim()) {
      fetchContent();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, queryText, contextSentence, activeMode]);

  // Synchronize isSavedNote state with annotationService
  useEffect(() => {
    if (!isOpen || !queryText.trim()) return;
    const existing = annotationService
      .getAnnotations()
      .find((a) => a.queryText.trim() === queryText.trim());
    setIsSavedNote(!!existing);
  }, [isOpen, queryText]);

  // Audio Pronunciation for main query
  const handlePlayAudio = async () => {
    if (isPlayingAudio || !queryText) return;
    try {
      setIsPlayingAudio(true);
      const speech = SpeechService.getInstance();
      await speech.speak(queryText);
    } catch (e) {
      console.warn('TTS Error:', e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Audio Pronunciation for specific text (e.g. example sentences)
  const handlePlaySpecificAudio = async (text: string) => {
    try {
      const speech = SpeechService.getInstance();
      await speech.speak(text);
    } catch (e) {
      console.warn('TTS Error:', e);
    }
  };

  // Save / Toggle Document Annotation Note
  const handleSaveNote = () => {
    if (!result) return;
    const trimmed = queryText.trim();
    if (isSavedNote) {
      const existing = annotationService
        .getAnnotations()
        .find((a) => a.queryText.trim() === trimmed);
      if (existing) {
        annotationService.deleteAnnotation(existing.id);
        setIsSavedNote(false);
      }
    } else {
      const isSentence = result.targetType === 'sentence' || trimmed.length > 4;
      annotationService.saveAnnotation({
        queryText: trimmed,
        targetType: isSentence ? 'sentence' : 'word',
        contextSentence,
        pinyin: result.pinyin,
        sinoVietnamese: result.sinoVietnamese,
        vietnameseMeaning: result.vietnameseMeaning,
        explanation: result.aiExplanation,
        examples: result.examples || [],
        colorTag: isSentence ? 'purple' : 'cyan',
      });
      setIsSavedNote(true);
    }
  };

  // Copy content
  const handleCopy = () => {
    if (!result?.aiExplanation) return;
    navigator.clipboard.writeText(result.aiExplanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle custom question submit
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await geminiAiService.queryUnknownWord({
        queryText: queryText.trim(),
        contextSentence,
        promptMode: 'custom',
        customQuestion: customQuestion.trim(),
      });
      setResult(res);
    } catch (err) {
      console.error('Custom query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-obsidian-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="circle-search-title"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-obsidian-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-cyan/20 to-amber-500/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="circle-search-title" className="text-base sm:text-lg font-extrabold text-white">
                  Khoanh Chữ Hỏi AI (Circle to Search)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold">
                  Gemini 1.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Phân tích sâu ngữ nghĩa, chiết tự và mẹo nhớ Hán - Việt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Đóng bảng tra cứu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character / Sentence Card Hero Section */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-obsidian-950/80 to-obsidian-900 border-b border-slate-800/80 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full sm:w-auto">
            {/* Hand-drawn style circular character container or adaptive card */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyber-cyan to-amber-400 opacity-60 blur-sm group-hover:opacity-100 transition-opacity"></div>
              {queryText.length > 4 ? (
                <div className="relative max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-obsidian-950 border-2 border-cyber-cyan flex flex-col justify-center shadow-inner text-left">
                  <span className="text-[10px] font-mono text-cyber-cyan font-bold tracking-wider mb-1">
                    CÂU / MẪU NGỮ CẢNH
                  </span>
                  <span className="text-sm sm:text-base font-serif font-extrabold text-white line-clamp-3 leading-snug">
                    {queryText}
                  </span>
                </div>
              ) : (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-obsidian-950 border-2 border-cyber-cyan flex items-center justify-center shadow-inner">
                  <span className="text-3xl sm:text-4xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-cyber-cyan">
                    {queryText}
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {result?.pinyin && (
                  <span className="text-sm sm:text-base font-bold text-cyber-cyan font-mono">
                    {result.pinyin}
                  </span>
                )}
                {result?.sinoVietnamese && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold tracking-wider">
                    {result.sinoVietnamese}
                  </span>
                )}
                {result?.matchedWord && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    HSK {result.matchedWord.hskLevel}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                {result?.vietnameseMeaning || 'Đang tra cứu ngữ nghĩa...'}
              </div>

              {contextSentence && contextSentence !== queryText && (
                <div className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 italic max-w-md">
                  Ngữ cảnh: &quot;{contextSentence}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Audio, Save Note & Practice */}
          <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
            <button
              type="button"
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Nghe phát âm nội dung này"
            >
              <Volume2 className={`w-4 h-4 text-cyber-cyan ${isPlayingAudio ? 'animate-bounce text-emerald-400' : ''}`} />
              <span>Phát âm</span>
            </button>

            <button
              type="button"
              onClick={handleSaveNote}
              disabled={!result}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                isSavedNote
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isSavedNote ? 'Bấm để hủy lưu ghi chú này' : 'Lưu ghi chú dịch này vào Sổ tay'}
            >
              {isSavedNote ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span>Đã lưu ghi chú</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-cyber-cyan" />
                  <span>Lưu ghi chú</span>
                </>
              )}
            </button>

            {onPracticeCharacter && queryText.length <= 4 && (
              <button
                type="button"
                onClick={() => {
                  onPracticeCharacter(queryText, result?.matchedWord);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/40 hover:bg-cyber-cyan/30 text-cyber-cyan text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Luyện viết nét bút thuận"
              >
                <Edit3 className="w-4 h-4" />
                <span>Luyện viết nét</span>
              </button>
            )}
          </div>
        </div>

        {/* Query Mode Navigation Pills */}
        <div className="flex items-center gap-1.5 p-2.5 sm:px-5 bg-obsidian-950/50 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveMode('explain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeMode === 'explain'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Tổng quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('etymology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeMode === 'etymology'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Chiết tự & Bộ thủ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('mnemonic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeMode === 'mnemonic'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mẹo nhớ Hán - Việt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('sentences')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeMode === 'sentences'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3 Mẫu câu ví dụ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeMode === 'custom'
                ? 'bg-cyber-cyan text-obsidian-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Hỏi AI tùy chỉnh</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Custom Question Input (visible only in custom mode) */}
          {activeMode === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={`Hỏi bất kỳ điều gì về từ "${queryText}" (ví dụ: cách dùng, phân biệt với từ khác)...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-obsidian-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyber-cyan transition-colors"
              />
              <button
                type="submit"
                disabled={!customQuestion.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-cyber-cyan text-obsidian-950 font-bold text-sm flex items-center gap-1.5 hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </form>
          )}

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyber-cyan border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 animate-pulse">
                Trợ lý Gemini AI đang phân tích chiết tự và ngữ âm từ vừa khoanh...
              </p>
            </div>
          ) : result?.aiExplanation ? (
            <div className="space-y-3">
              {/* Fallback Notice Badge if offline */}
              {result.isFallback && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Dữ liệu sư phạm chuẩn HanziVibe (Hoạt động offline an toàn)</span>
                  </div>
                </div>
              )}

              {/* Rendered Markdown Explanation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-obsidian-950/70 border border-slate-800 text-sm leading-relaxed text-slate-200 space-y-2.5 font-sans">
                {result.aiExplanation.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-base font-bold text-cyber-cyan mt-3 mb-1.5 flex items-center gap-1.5">
                        {trimmed.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (trimmed.startsWith('#### ')) {
                    return (
                      <h5 key={idx} className="text-sm font-bold text-amber-400 mt-2 mb-1">
                        {trimmed.replace('#### ', '')}
                      </h5>
                    );
                  }
                  if (trimmed.startsWith('- ')) {
                    return (
                      <div key={idx} className="flex items-start gap-2 pl-2">
                        <span className="text-cyber-cyan mt-1">•</span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: trimmed
                              .substring(2)
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em class="text-cyber-cyan font-mono">$1</em>')
                              .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-obsidian-950 font-mono text-amber-400 border border-slate-700 text-xs">$1</code>'),
                          }}
                        />
                      </div>
                    );
                  }
                  if (trimmed.startsWith('> ')) {
                    return (
                      <blockquote
                        key={idx}
                        className="p-3 my-2 rounded-xl bg-obsidian-900 border-l-4 border-amber-400 text-slate-300 italic"
                        dangerouslySetInnerHTML={{
                          __html: trimmed
                            .substring(2)
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>'),
                        }}
                      />
                    );
                  }
                  if (!trimmed) return <div key={idx} className="h-1" />;
                  return (
                    <p
                      key={idx}
                      dangerouslySetInnerHTML={{
                        __html: trimmed
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="text-cyber-cyan font-mono">$1</em>')
                          .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-obsidian-950 font-mono text-amber-400 border border-slate-700 text-xs">$1</code>'),
                      }}
                    />
                  );
                })}
              </div>

              {/* Illustrative Examples Cards Section */}
              {result.examples && result.examples.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-obsidian-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyber-cyan" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <span>Câu Ví Dụ Minh Họa Ngữ Cảnh</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                          {result.examples.length} câu
                        </span>
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Bấm loa để nghe phát âm</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {result.examples.map((eg, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-3.5 rounded-xl bg-obsidian-900/90 border border-slate-800/80 hover:border-cyber-cyan/40 transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-serif font-bold text-white tracking-wide">
                            {eg.chinese}
                          </div>
                          <div className="text-xs font-mono text-cyber-cyan">
                            {eg.pinyin}
                          </div>
                          <div className="text-xs text-slate-300">
                            {eg.vietnamese}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlaySpecificAudio(eg.chinese)}
                          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyber-cyan transition-colors shrink-0 group-hover:scale-105 active:scale-95"
                          title={`Nghe câu ví dụ: ${eg.chinese}`}
                          aria-label={`Nghe câu ví dụ ${eg.chinese}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Chưa có dữ liệu phân tích. Hãy chọn một chế độ ở thanh trên.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-obsidian-950/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Bot className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>HanziVibe AI Tutor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result?.aiExplanation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép giải nghĩa'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CircleToSearchModal;
