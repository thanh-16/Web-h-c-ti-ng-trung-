/**
 * security.ts
 * Enterprise Security & Sanitization Utilities for HanziVibe.
 * Provides XSS prevention, safe HTML escaping, markdown sanitization,
 * and resilient localStorage capability probing (Safari Incognito & Quota protection).
 */

/**
 * Escapes raw strings into safe HTML text entities to neutralize XSS injection.
 */
export function escapeHtml(unsafeText: string): string {
  if (!unsafeText) return '';
  return unsafeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Safely renders basic inline Markdown styling (**bold**, *italic*, `code`)
 * while strictly escaping any raw HTML tags to guarantee zero XSS execution.
 */
export function renderSafeMarkdownInline(text: string): string {
  if (!text) return '';

  // Step 1: Pre-sanitize to eliminate any injected HTML tags (e.g. <script>, <img onerror>, etc.)
  const safeText = escapeHtml(text);

  // Step 2: Apply strictly controlled typography formatting on safe tokens
  return safeText
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-cyber-cyan font-mono">$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code class="px-1 py-0.5 rounded bg-obsidian-950 font-mono text-amber-400 border border-slate-700 text-xs">$1</code>'
    );
}

/**
 * Probes localStorage accessibility safely without throwing SecurityError (e.g. in Safari Private Browsing)
 * or QuotaExceededError.
 */
export function isLocalStorageAccessible(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const storage = window.localStorage;
    if (!storage) return false;

    const probeKey = '__hanzivibe_sec_probe__';
    storage.setItem(probeKey, probeKey);
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}
