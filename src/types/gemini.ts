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
