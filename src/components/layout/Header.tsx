'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { progressService } from '@/services/progressService';
import { AudioContextManager } from '@/services/audioContext';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Bot,
  User,
  Volume2,
} from 'lucide-react';

interface HeaderProps {
  onOpenProfile: () => void;
  onOpenAi: () => void;
  audioUnlocked: boolean;
  onUnlockAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  onOpenAi,
  audioUnlocked,
  onUnlockAudio,
}) => {
  const [profile, setProfile] = useState<UserProfile>(progressService.getProfile());

  useEffect(() => {
    const unsubscribe = progressService.subscribe((updated) => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="py-3 px-4 sm:px-6 md:px-8 border-b border-slate-800/80 bg-obsidian-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-3">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-obsidian-900 to-slate-900 border border-cyber-cyan/40 flex items-center justify-center glow-cyan shadow-sm">
          <span className="text-xl font-serif font-bold text-cyber-cyan">韵</span>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-wide flex items-center gap-2">
            <span className="text-white">HanziVibe</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 font-medium">
              汉字韵
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Nền tảng học tiếng Trung công nghệ cao
          </p>
        </div>
      </div>

      {/* Action Badges & Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Badge (Clickable to open profile) */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
          title="Chuỗi ngày học liên tục"
        >
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>{profile.streakDays}</span>
          <span className="hidden md:inline font-normal">ngày</span>
        </button>

        {/* Mastered Words Badge */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
          title="Từ vựng đã thuộc"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{profile.masteredWordIds.length}</span>
          <span className="hidden md:inline font-normal">thuộc</span>
        </button>

        {/* Audio Engine Status */}
        <button
          type="button"
          onClick={onUnlockAudio}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            audioUnlocked
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 animate-pulse'
          }`}
          title={audioUnlocked ? 'Web Audio đã sẵn sàng' : 'Nhấn để mở khóa Web Audio (Safari iOS)'}
        >
          {audioUnlocked ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span className="hidden lg:inline">Audio OK</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span className="hidden lg:inline">Kích hoạt Audio</span>
            </>
          )}
        </button>

        {/* Gemini AI Assistant Button */}
        <button
          type="button"
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-blue-500/20 hover:from-cyber-cyan/30 hover:to-blue-500/30 text-cyber-cyan border border-cyber-cyan/40 text-xs font-bold transition-all shadow-sm glow-cyan"
          title="Mở Trợ lý Gemini AI"
        >
          <Bot className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="hidden sm:inline">Trợ lý AI</span>
        </button>

        {/* User Profile Avatar Trigger */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-cyan to-emerald-400 p-[1.5px] transition-transform active:scale-95 shadow-sm"
          title="Hồ sơ người dùng & Thành tích"
          aria-label="Xem hồ sơ người dùng"
        >
          <div className="w-full h-full rounded-[10px] bg-obsidian-950 flex items-center justify-center text-xs font-bold text-cyber-cyan">
            {profile.displayName.charAt(0).toUpperCase() || 'H'}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
