'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/auth';
import { progressService } from '@/services/progressService';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Bot,
  User,
  Volume2,
  Sun,
  Moon,
  Trophy,
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
  const [isDark, setIsDark] = useState<boolean>(true);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('hanzivibe_theme') : null;
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hanzivibe_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hanzivibe_theme', 'light');
    }
  };

  useEffect(() => {
    const unsubscribe = progressService.subscribe((updated) => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="py-2.5 px-4 sm:px-6 md:px-8 border-b border-stone-200/80 dark:border-slate-800/80 bg-paper-50/85 dark:bg-obsidian-950/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-3 shadow-sm transition-colors duration-200">
      {/* Brand Identity with Calligraphic Seal */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
          <div className="w-full h-full rounded-[14px] bg-stone-50 dark:bg-obsidian-950 flex items-center justify-center transition-colors">
            <span className="text-xl font-serif font-black text-amber-600 dark:text-amber-400">韵</span>
          </div>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
            <span className="text-stone-900 dark:text-white drop-shadow-sm">HanziVibe</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold tracking-wide">
              汉字韵
            </span>
          </h1>
          <p className="text-[11px] text-stone-500 dark:text-slate-400 hidden sm:block font-medium">
            Học Tiếng Trung Vui &amp; Nhớ Lâu ✨
          </p>
        </div>
      </div>

      {/* Gamified Status Pills & Action Badges */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Streak Flame Pill (Duolingo Gamified Flame) */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 text-amber-400 hover:from-amber-500/25 hover:to-orange-500/25 text-xs font-black transition-all shadow-sm active:scale-95 group"
          title="Chuỗi ngày học liên tục (Nhấn để xem bảng vàng)"
        >
          <Flame className="w-4 h-4 fill-amber-400 text-orange-500 animate-flame-glow group-hover:scale-125 transition-transform" />
          <span>{profile.streakDays}</span>
          <span className="hidden md:inline font-bold text-[11px]">ngày</span>
        </button>

        {/* Mastered Words Pill */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Từ vựng đã thuộc vững vàng"
        >
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <span>{profile.masteredWordIds.length}</span>
          <span className="hidden lg:inline text-[11px] font-semibold">từ thuộc</span>
        </button>

        {/* Theme Switcher: Giấy Tuyên Ấm Áp vs Đêm Mực Tàu */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95 text-slate-200"
          title={isDark ? 'Chuyển sang Chế độ Sáng Giấy Tuyên' : 'Chuyển sang Chế độ Tối Đêm Mực Tàu'}
          aria-label="Chuyển đổi giao diện sáng tối"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span className="hidden xl:inline text-[11px]">Giấy Tuyên</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline text-[11px]">Mực Tàu</span>
            </>
          )}
        </button>

        {/* Audio Engine Unlock */}
        <button
          type="button"
          onClick={onUnlockAudio}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 shadow-sm ${
            audioUnlocked
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 animate-pulse'
          }`}
          title={audioUnlocked ? 'Âm thanh đã sẵn sàng' : 'Nhấn để mở khóa âm thanh phát âm bản xứ'}
        >
          <Volume2 className={`w-4 h-4 ${audioUnlocked ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="hidden md:inline text-[11px]">
            {audioUnlocked ? 'Âm thanh' : 'Bật Audio'}
          </span>
        </button>

        {/* AI Pedagogical Tutor Trigger */}
        <button
          type="button"
          onClick={onOpenAi}
          className="btn-tactile btn-tactile-cyan px-3 sm:px-3.5 py-1.5 text-xs font-black text-white gap-1.5 shadow-md shadow-cyan-950/30"
          title="Trợ lý Sư phạm AI Gemini"
        >
          <Bot className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Hỏi AI</span>
        </button>

        {/* Learner Avatar */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-[2px] transition-transform active:scale-95 shadow-sm shrink-0"
          title="Hồ sơ & Huân chương thành tích"
          aria-label="Xem hồ sơ người dùng"
        >
          <div className="w-full h-full rounded-[14px] bg-stone-100 dark:bg-obsidian-950 flex items-center justify-center text-xs font-black text-amber-700 dark:text-amber-300 transition-colors">
            {profile.displayName.charAt(0).toUpperCase() || 'H'}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
