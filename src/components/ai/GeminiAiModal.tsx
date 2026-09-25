'use client';

import React, { useState, useEffect } from 'react';
import { HskWord } from '@/types/hsk';
import { GeminiPromptType, GeminiResponse } from '@/types/gemini';
import { geminiAiService } from '@/services/geminiAiService';
import { SpeechService } from '@/services/speechService';
import {
  X,
  Sparkles,
  Search,
  Lightbulb,
  MessageSquare,
  Send,
  Copy,
  Check,
  Volume2,
  Bot,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { renderSafeMarkdownInline } from '@/utils/security';

interface GeminiAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWord: HskWord;
  allWords?: HskWord[];
  onSelectWord?: (word: HskWord) => void;
}

/**
 * Lightweight formatting helper for markdown text
 */
function renderMarkdownContent(content: string) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm text-slate-200 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-bold text-cyber-cyan mt-4 mb-2 flex items-center gap-1.5">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="text-sm font-bold text-amber-400 mt-3 mb-1">
              {trimmed.replace('#### ', '')}
            </h5>
          );
        }

        if (trimmed.startsWith('- ')) {
          const itemText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cyber-cyan mt-1">•</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: renderSafeMarkdownInline(itemText),
                }}
              />
            </div>
          );
        }

        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.substring(2);
          return (
            <blockquote
              key={idx}
              className="p-3 my-2 rounded-xl bg-obsidian-950/80 border-l-4 border-amber-400 text-slate-300 italic"
              dangerouslySetInnerHTML={{
                __html: renderSafeMarkdownInline(quoteText),
              }}
            />
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{
              __html: renderSafeMarkdownInline(trimmed),
            }}
          />
        );
      })}
    </div>
  );
}

export const GeminiAiModal: React.FC<GeminiAiModalProps> = ({
  isOpen,
  onClose,
  activeWord,
  allWords = [],
  onSelectWord,
}) => {
  const [selectedWord, setSelectedWord] = useState<HskWord>(activeWord);
  const [activePromptType, setActivePromptType] = useState<GeminiPromptType>('etymology');
  const [customQuestion, setCustomQuestion] = useState('');
  const [response, setResponse] = useState<GeminiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setSelectedWord(activeWord);
  }, [activeWord]);

  // Load AI content when modal opens or word / prompt type changes
  const fetchAiContent = async (
    targetWord: HskWord,
    promptType: GeminiPromptType,
    customPromptText?: string
  ) => {
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await geminiAiService.generateContent({
        word: targetWord,
        promptType,
        customPrompt: customPromptText,
      });
      setResponse(res);
    } catch {
      // Fallback is handled inside service, but protect UI
      setResponse({
        content: geminiAiService.generatePedagogicalFallback(targetWord, promptType),
        isFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedWord) {
      fetchAiContent(selectedWord, activePromptType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedWord, activePromptType]);

  if (!isOpen) return null;

  const handleChipClick = (type: GeminiPromptType) => {
    setActivePromptType(type);
    setCustomQuestion('');
    fetchAiContent(selectedWord, type);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoading) return;
    setActivePromptType('custom');
    fetchAiContent(selectedWord, 'custom', customQuestion.trim());
  };

  const handleCopy = () => {
    if (!response?.content) return;
    navigator.clipboard.writeText(response.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePlayWordTTS = () => {
    SpeechService.getInstance().speak(selectedWord.hanzi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-obsidian-900 border-2 border-cyber-cyan/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden glow-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-obsidian-950 via-slate-900 to-obsidian-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan glow-cyan">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Trợ Lý Gemini AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-mono font-medium">
                    1.5 Flash
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Sư phạm Hán - Việt, chiết tự chữ Hán & văn cảnh đời thường
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng trợ lý"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Info Bar & Selector */}
        <div className="px-6 py-3 bg-obsidian-950/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-serif font-bold text-white tracking-wider">
              {selectedWord.hanzi}
            </span>
            <div>
              <div className="font-mono text-cyber-cyan font-semibold">{selectedWord.pinyin}</div>
              <div className="text-slate-400">Hán Việt: {selectedWord.sinoVietnamese}</div>
            </div>
            <button
              type="button"
              onClick={handlePlayWordTTS}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyber-cyan"
              title="Nghe phát âm"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">HSK {selectedWord.hskLevel}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Bộ {selectedWord.radical}</span>
          </div>
        </div>

        {/* Prompt Chips Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-obsidian-900 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleChipClick('etymology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePromptType === 'etymology'
                ? 'bg-cyber-cyan text-obsidian-950 border-cyber-cyan shadow-sm font-bold'
                : 'bg-obsidian-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Chiết tự chữ Hán</span>
          </button>

          <button
            type="button"
            onClick={() => handleChipClick('mnemonic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePromptType === 'mnemonic'
                ? 'bg-amber-400 text-obsidian-950 border-amber-400 shadow-sm font-bold'
                : 'bg-obsidian-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Mẹo nhớ Hán - Việt</span>
          </button>

          <button
            type="button"
            onClick={() => handleChipClick('sentences')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePromptType === 'sentences'
                ? 'bg-emerald-400 text-obsidian-950 border-emerald-400 shadow-sm font-bold'
                : 'bg-obsidian-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>3 Mẫu câu ví dụ</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[calc(92vh-280px)] space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan animate-pulse glow-cyan">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                Gemini AI đang suy luận chiết tự & ngữ cảnh...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Model: gemini-1.5-flash • Phân tích sư phạm
              </p>
            </div>
          ) : response ? (
            <div className="space-y-4">
              {/* Status Header of Content */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  {response.isFallback ? (
                    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Bản ghi sư phạm tích hợp</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                      <Sparkles className="w-3 h-3" />
                      <span>Trực tiếp từ Gemini 1.5 Flash</span>
                    </span>
                  )}
                  {response.cached && (
                    <span className="text-[10px] text-slate-500 font-mono">Cache instant</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rendered Markdown Body */}
              <div className="p-4 rounded-2xl bg-obsidian-950/60 border border-slate-800">
                {renderMarkdownContent(response.content)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chọn một prompt chip ở trên để phân tích từ vựng.
            </div>
          )}
        </div>

        {/* Custom Question Footer Form */}
        <form
          onSubmit={handleCustomSubmit}
          className="p-4 border-t border-slate-800 bg-obsidian-950/80 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Hỏi thêm AI về chữ "${selectedWord.hanzi}"...`}
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-obsidian-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim() || isLoading}
            className="p-3 rounded-2xl bg-cyber-cyan text-obsidian-950 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
            title="Gửi câu hỏi"
            aria-label="Gửi câu hỏi cho AI"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeminiAiModal;
