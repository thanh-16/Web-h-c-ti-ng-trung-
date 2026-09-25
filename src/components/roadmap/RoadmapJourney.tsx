'use client';

import React, { useState, useEffect } from 'react';
import { HSK_ROADMAP_UNITS } from '@/data/hskRoadmap';
import { RoadmapLesson, RoadmapUnit, LessonProgress } from '@/types/hsk';
import { roadmapService } from '@/services/roadmapService';
import { Tilt3DCard } from '@/components/ui';
import {
  Star,
  Lock,
  CheckCircle2,
  Play,
  Trophy,
  Compass,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export interface RoadmapJourneyProps {
  onSelectLesson: (lesson: RoadmapLesson) => void;
  streakDays?: number;
}

export const RoadmapJourney: React.FC<RoadmapJourneyProps> = ({
  onSelectLesson,
  streakDays = 1,
}) => {
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [totalStars, setTotalStars] = useState<number>(0);

  useEffect(() => {
    const unsub = roadmapService.subscribe((list) => {
      setProgressList(list);
      setCompletionRate(roadmapService.getCompletionPercentage());
      setTotalStars(roadmapService.getTotalStars());
    });
    return unsub;
  }, []);

  const activeLesson = roadmapService.getCurrentActiveLesson();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      {/* 1. Milestone Banner: HSK 1 Learning Passport */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-emerald-500/15 border border-amber-500/30 shadow-xl backdrop-blur-md relative overflow-hidden">
        {/* Background Calligraphic Flourish */}
        <div className="absolute right-4 -bottom-6 text-9xl font-serif font-black text-amber-500/5 select-none pointer-events-none">
          道
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-black mb-3 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>Hành Trình Chinh Phục HSK 1 Chính Quy</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight leading-tight">
              Lộ Trình Học Từng Bước: Từ Con Số 0 Đến Thành Thạo HSK 1 🎯
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 mt-2 leading-relaxed">
              Mỗi bài học được thiết kế chuẩn khoa học 4 bước: Nghe ngữ điệu $\to$ Nhìn tranh nhớ chữ $\to$ Luyện viết nét bút thuận $\to$ Trắc nghiệm củng cố.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-obsidian-950/80 border border-stone-200 dark:border-slate-800 text-xs font-bold text-stone-800 dark:text-slate-200 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Tổng sao: {totalStars} ⭐</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-obsidian-950/80 border border-stone-200 dark:border-slate-800 text-xs font-bold text-stone-800 dark:text-slate-200 shadow-sm">
                <Flame className="w-4 h-4 fill-orange-500 text-amber-400 animate-flame-glow" />
                <span>Chuỗi lửa: {streakDays} ngày</span>
              </div>
            </div>
          </div>

          {/* Progress Circle / Status Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white/80 dark:bg-obsidian-900/80 border border-amber-500/20 shadow-md shrink-0 text-center">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-600 dark:text-amber-400">
              {completionRate}%
            </span>
            <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400 mt-0.5">
              Hoàn thành HSK 1
            </span>
            {activeLesson && (
              <button
                type="button"
                onClick={() => onSelectLesson(activeLesson)}
                className="mt-3 btn-tactile btn-tactile-amber py-2 px-3.5 text-xs font-black text-white gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-white" />
                <span>Học Tiếp Bài {activeLesson.order}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Units & Lessons Stepper Pathway */}
      <div className="flex flex-col gap-10">
        {HSK_ROADMAP_UNITS.map((unit) => {
          return (
            <div key={unit.id} className="flex flex-col gap-4">
              {/* Unit Header Card */}
              <div
                className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r ${unit.accentColor} text-white shadow-lg flex items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {unit.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                      Chương {unit.number} • {unit.chineseTitle}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-white/90 mt-0.5 hidden sm:block">
                      {unit.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    {unit.lessons.length} Bài học
                  </span>
                </div>
              </div>

              {/* Lessons Island Stepper Path */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                {unit.lessons.map((lesson) => {
                  const isUnlocked = roadmapService.isLessonUnlocked(lesson.id);
                  const progress = roadmapService.getLessonProgress(lesson.id);
                  const isCompleted = !!(progress && progress.isCompleted);
                  const stars = progress?.stars || 0;
                  const isCurrent = activeLesson?.id === lesson.id;

                  return (
                    <Tilt3DCard
                      key={lesson.id}
                      depth={isUnlocked ? 14 : 0}
                      maxTiltAngle={isUnlocked ? 10 : 0}
                      className="h-full"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isUnlocked) onSelectLesson(lesson);
                        }}
                        disabled={!isUnlocked}
                        className={`w-full h-full p-4 rounded-2xl text-left transition-all border flex flex-col justify-between gap-3 shadow-md ${
                          !isUnlocked
                            ? 'bg-stone-100/70 dark:bg-obsidian-950/50 border-stone-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed'
                            : isCurrent
                            ? 'bg-white dark:bg-obsidian-900 border-amber-500/60 ring-2 ring-amber-400/40 shadow-amber-500/10'
                            : isCompleted
                            ? 'bg-white/90 dark:bg-obsidian-900/90 border-emerald-500/40 hover:border-emerald-500/70'
                            : 'bg-white/90 dark:bg-obsidian-900/90 border-stone-200/90 dark:border-slate-800 hover:border-amber-400/60'
                        }`}
                      >
                        {/* Top Lesson Status & Badge */}
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{lesson.icon}</span>
                            <span className="text-[11px] font-mono font-bold text-stone-500 dark:text-slate-400">
                              Bài {lesson.order}
                            </span>
                          </div>

                          {/* Status Icon */}
                          <div>
                            {!isUnlocked ? (
                              <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-slate-800 flex items-center justify-center text-stone-400">
                                <Lock className="w-3 h-3" />
                              </div>
                            ) : isCompleted ? (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= stars
                                        ? 'fill-amber-400 text-amber-500'
                                        : 'text-stone-300 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : isCurrent ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] font-black animate-pulse">
                                Đang Học
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-500 text-[10px] font-bold">
                                Mở Khóa
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-black text-stone-900 dark:text-white leading-snug">
                            {lesson.title}
                          </h4>
                          <p className="text-[11px] text-stone-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {lesson.subtitle}
                          </p>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="pt-2 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                          <span className="text-stone-400 dark:text-slate-500">
                            {lesson.wordIds.length} từ vựng
                          </span>

                          {isUnlocked && (
                            <span
                              className={`flex items-center gap-1 ${
                                isCompleted
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isCurrent
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-stone-600 dark:text-slate-400'
                              }`}
                            >
                              <span>{isCompleted ? 'Ôn Lại' : 'Bắt Đầu'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </button>
                    </Tilt3DCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
