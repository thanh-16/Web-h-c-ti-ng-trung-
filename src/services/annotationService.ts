/**
 * annotationService.ts
 * Offline-first persistent storage & subscription service for Document Annotations & AI Translations.
 */

import { DocumentAnnotation } from '@/types/annotation';

const STORAGE_KEY = 'hanzivibe_document_annotations_v1';

export class AnnotationService {
  private static instance: AnnotationService | null = null;
  private inMemoryCache: DocumentAnnotation[] = [];
  private listeners: Set<(annotations: DocumentAnnotation[]) => void> = new Set();
  private isStorageAvailable: boolean = true;

  private constructor() {
    this.inMemoryCache = this.loadFromStorage();
  }

  public static getInstance(): AnnotationService {
    if (!AnnotationService.instance) {
      AnnotationService.instance = new AnnotationService();
    }
    return AnnotationService.instance;
  }

  public static resetInstance(): void {
    AnnotationService.instance = null;
  }

  private loadFromStorage(): DocumentAnnotation[] {
    try {
      if (typeof window === 'undefined') {
        return [];
      }
      const storage = window.localStorage;
      if (!storage) return [];
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[AnnotationService] Failed to read from localStorage (SecurityError or disabled storage):', e);
      this.isStorageAvailable = false;
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      const storage = window.localStorage;
      if (!storage) return;

      // Keep cache bounded to prevent extreme memory growth (max 500 items)
      if (this.inMemoryCache.length > 500) {
        this.inMemoryCache = this.inMemoryCache.slice(0, 500);
      }

      storage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryCache));
      this.isStorageAvailable = true;
    } catch (e) {
      console.warn('[AnnotationService] Storage write failed (QuotaExceededError or SecurityError), keeping in-memory state:', e);
      this.isStorageAvailable = false;
    }
  }

  private notify(): void {
    const data = [...this.inMemoryCache];
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('[AnnotationService] Listener callback error:', err);
      }
    });
  }

  public getAnnotations(): DocumentAnnotation[] {
    return [...this.inMemoryCache];
  }

  public getAnnotationById(id: string): DocumentAnnotation | undefined {
    return this.inMemoryCache.find((a) => a.id === id);
  }

  public saveAnnotation(
    data: Omit<DocumentAnnotation, 'id' | 'createdAt'> & { id?: string }
  ): DocumentAnnotation {
    const existingIndex = data.id
      ? this.inMemoryCache.findIndex((a) => a.id === data.id)
      : this.inMemoryCache.findIndex((a) => a.queryText === data.queryText);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing
      const updated: DocumentAnnotation = {
        ...this.inMemoryCache[existingIndex],
        ...data,
        id: this.inMemoryCache[existingIndex].id,
      };
      this.inMemoryCache[existingIndex] = updated;
      this.saveToStorage();
      this.notify();
      return updated;
    } else {
      // Create new
      const newAnnotation: DocumentAnnotation = {
        id: data.id || `anno-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        ...data,
      };
      this.inMemoryCache.unshift(newAnnotation);
      this.saveToStorage();
      this.notify();
      return newAnnotation;
    }
  }

  public deleteAnnotation(id: string): boolean {
    const initialLen = this.inMemoryCache.length;
    this.inMemoryCache = this.inMemoryCache.filter((a) => a.id !== id);
    if (this.inMemoryCache.length !== initialLen) {
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this.inMemoryCache = [];
    this.saveToStorage();
    this.notify();
  }

  public subscribe(listener: (annotations: DocumentAnnotation[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.inMemoryCache]);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const annotationService = AnnotationService.getInstance();
export default annotationService;
