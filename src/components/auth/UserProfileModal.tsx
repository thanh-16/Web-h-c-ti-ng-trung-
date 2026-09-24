'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserBadge, LearningStats } from '@/types/auth';
import { progressService } from '@/services/progressService';
import { HSK_CURRICULUM } from '@/data/hskCurriculum';
import {
  X,
  Flame,
  Award,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [profile, setProfile] = useState<UserProfile>(progressService.getProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = progressService.getProfile();
      setProfile(p);
      setEditedName(p.displayName);
      setShowResetConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = progressService.subscribe((updated) => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const stats: LearningStats = progressService.getLearningStats(HSK_CURRICULUM.length);
  const badges: UserBadge[] = progressService.getBadges();

  const handleSaveName = () => {
    if (editedName.trim()) {
      const updated = progressService.updateDisplayName(editedName);
      setProfile(updated);
      setIsEditingName(false);
    }
  };

  const handleResetProgress = () => {
    const fresh = progressService.resetProgress();
    setProfile(fresh);
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-obsidian-900 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-emerald-400 p-[2px] shadow-lg">
              <div className="w-full h-full rounded-2xl bg-obsidian-950 flex items-center justify-center text-lg font-bold text-cyber-cyan">
                {profile.displayName.charAt(0).toUpperCase() || 'H'}
              </div>
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-obsidian-950 border border-cyber-cyan/50 text-white text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-cyber-cyan"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-cyber-cyan text-obsidian-950 hover:bg-cyan-300 transition-colors"
                    title="Lưu tên"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {profile.displayName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Đổi tên hiển thị"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Học viên HanziVibe</span>
                <span>•</span>
                <span className="text-emerald-400">HSK 1-3 Chuẩn Quốc Tế</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Daily Streak Highlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 glow-amber">
                <Flame className="w-7 h-7 fill-amber-400" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Chuỗi {profile.streakDays} Ngày Liên Tiếp!</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Học tập mỗi ngày giúp kích hoạt vùng nhớ dài hạn trong não bộ
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-amber-400 hidden sm:block">
              🔥 Active
            </div>
          </div>

          {/* Curriculum Mastery Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyber-cyan" />
                <span>Tiến Độ Làm Chủ Giáo Trình HSK</span>
              </span>
              <span className="font-mono text-cyber-cyan font-bold">
                {stats.masteredCount} / {stats.totalWords} từ ({stats.masteryPercentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-obsidian-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyber-cyan via-emerald-400 to-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${stats.masteryPercentage}%` }}
              />
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {stats.masteredCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Đã thuộc</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-amber-400">
                {stats.reviewCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Cần ôn</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-rose-400">
                {stats.favoriteCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-rose-400" />
                <span>Đánh dấu</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-slate-800 text-center">
              <div className="text-2xl font-bold font-mono text-cyber-cyan">
                {stats.totalPracticeMinutes}m
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-cyber-cyan" />
                <span>Thời gian học</span>
              </div>
            </div>
          </div>

          {/* Badges & Achievements Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Huy Hiệu Đạt Được</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                    badge.unlocked
                      ? 'bg-obsidian-950/80 border-slate-800 text-white'
                      : 'bg-obsidian-950/40 border-slate-800/40 text-slate-600 opacity-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      badge.unlocked ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{badge.title}</span>
                      {badge.unlocked && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Reset Progress */}
          <div className="pt-4 border-t border-slate-800/80">
            {showResetConfirm ? (
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-center">
                <p className="text-xs text-red-300 font-medium">
                  Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ (từ đã thuộc, chuỗi streak)?
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                  >
                    Xác nhận đặt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại dữ liệu tiến độ học</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
