/**
 * gemini.ts
 * Type definitions for Gemini AI Learning Assistant
 */

import { HskWord } from './hsk';

export type GeminiPromptType = 'etymology' | 'mnemonic' | 'sentences' | 'custom';

export interface GeminiRequest {
  word: HskWord;
  promptType: GeminiPromptType;
  customPrompt?: string;
}

export interface GeminiResponse {
  content: string;
  isFallback: boolean;
  cached?: boolean;
  error?: string;
}

export interface GeminiModelConfig {
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export type CircleSearchPromptMode = 'explain' | 'etymology' | 'mnemonic' | 'sentences' | 'custom';

export interface CircleSearchRequest {
  queryText: string;
  contextSentence?: string;
  promptMode?: CircleSearchPromptMode;
  customQuestion?: string;
}

export interface CircleSearchResult {
  queryText: string;
  targetType?: 'word' | 'sentence';
  matchedWord?: HskWord;
  pinyin?: string;
  sinoVietnamese?: string;
  vietnameseMeaning?: string;
  aiExplanation: string;
  examples?: Array<{ chinese: string; pinyin: string; vietnamese: string }>;
  isFallback: boolean;
  cached?: boolean;
  error?: string;
}

