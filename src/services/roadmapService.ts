/**
 * roadmapService.ts
 * Quản lý tiến độ Lộ trình Học HSK 1 (Roadmap Journey)
 * - Lưu trữ LocalStorage an toàn (chống QuotaExceededError / Incognito mode)
 * - Đánh dấu hoàn thành bài học kèm điểm số và số sao (1-3 ⭐)
 * - Tự động mở khóa bài học kế tiếp
 * - Pub/Sub reactive subscription cho UI
 */

import { HSK_ROADMAP_UNITS } from '@/data/hskRoadmap';
import { LessonProgress, RoadmapLesson } from '@/types/hsk';

const STORAGE_KEY = 'hanzivibe_roadmap_progress';

export class RoadmapService {
  private static instance: RoadmapService | null = null;
  private progressMap: Map<string, LessonProgress> = new Map();
  private listeners: Set<(progress: LessonProgress[]) => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): RoadmapService {
    if (!RoadmapService.instance) {
      RoadmapService.instance = new RoadmapService();
    }
    return RoadmapService.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: LessonProgress[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && item.lessonId) {
              this.progressMap.set(item.lessonId, item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[RoadmapService] Could not load progress from storage:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const array = Array.from(this.progressMap.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch (e) {
      console.warn('[RoadmapService] Could not save progress to storage:', e);
    }
  }

  private notify(): void {
    const list = Array.from(this.progressMap.values());
    this.listeners.forEach((cb) => {
      try {
        cb(list);
      } catch (err) {
        console.error('[RoadmapService] Listener error:', err);
      }
    });
  }

  public subscribe(callback: (progress: LessonProgress[]) => void): () => void {
    this.listeners.add(callback);
    callback(Array.from(this.progressMap.values()));
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Lấy toàn bộ bài học phẳng theo thứ tự
   */
  public getAllLessons(): RoadmapLesson[] {
    const lessons: RoadmapLesson[] = [];
    HSK_ROADMAP_UNITS.forEach((u) => {
      lessons.push(...u.lessons);
    });
    return lessons.sort((a, b) => a.order - b.order);
  }

  /**
   * Lấy tiến độ của một bài học cụ thể
   */
  public getLessonProgress(lessonId: string): LessonProgress | null {
    return this.progressMap.get(lessonId) || null;
  }

  /**
   * Kiểm tra bài học có được mở khóa chưa
   * - Bài học đầu tiên luôn mở khóa
   * - Các bài sau được mở khi bài trước đó đã hoàn thành
   */
  public isLessonUnlocked(lessonId: string): boolean {
    const all = this.getAllLessons();
    const index = all.findIndex((l) => l.id === lessonId);
    if (index <= 0) return true; // First lesson is always unlocked

    const prevLesson = all[index - 1];
    const prevProgress = this.progressMap.get(prevLesson.id);
    return !!(prevProgress && prevProgress.isCompleted);
  }

  /**
   * Đánh dấu hoàn thành bài học
   */
  public completeLesson(lessonId: string, stars: number = 3, score: number = 100): LessonProgress {
    const safeStars = Math.max(1, Math.min(3, stars));
    const existing = this.progressMap.get(lessonId);

    const progress: LessonProgress = {
      lessonId,
      isCompleted: true,
      stars: Math.max(existing?.stars || 0, safeStars),
      completedAt: new Date().toISOString(),
      score: Math.max(existing?.score || 0, score),
    };

    this.progressMap.set(lessonId, progress);
    this.saveToStorage();
    this.notify();
    return progress;
  }

  /**
   * Lấy bài học hiện tại người dùng cần học tiếp theo
   */
  public getCurrentActiveLesson(): RoadmapLesson {
    const all = this.getAllLessons();
    for (const lesson of all) {
      const p = this.progressMap.get(lesson.id);
      if (!p || !p.isCompleted) {
        return lesson;
      }
    }
    return all[0];
  }

  /**
   * Tính phần trăm hoàn thành lộ trình HSK 1 (0 - 100%)
   */
  public getCompletionPercentage(): number {
    const all = this.getAllLessons();
    if (all.length === 0) return 0;

    let completed = 0;
    all.forEach((l) => {
      const p = this.progressMap.get(l.id);
      if (p && p.isCompleted) completed++;
    });

    return Math.round((completed / all.length) * 100);
  }

  /**
   * Tổng số sao đã đạt được
   */
  public getTotalStars(): number {
    let sum = 0;
    this.progressMap.forEach((p) => {
      if (p.isCompleted) sum += p.stars;
    });
    return sum;
  }

  /**
   * Reset tiến độ (dành cho kiểm thử hoặc học lại từ đầu)
   */
  public resetProgress(): void {
    this.progressMap.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.notify();
  }
}

export const roadmapService = RoadmapService.getInstance();
