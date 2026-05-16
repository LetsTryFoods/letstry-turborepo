'use client';

// ─── Toggle this to re-enable all search debug logs ───────────────────────────
const SEARCH_DEBUG = false;
// ──────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'SEARCH_DEBUG_LOGS';
const MAX_LOGS = 200;

function plog(tag: string, ...args: any[]) {
  if (!SEARCH_DEBUG) return; // Logs hidden — set SEARCH_DEBUG = true to re-enable

  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  const message = `[${ts}] ${tag} ${args.map(a => {
    try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch { return String(a); }
  }).join(' ')}`;

  // Print to console immediately
  console.log(message);

  // Also persist to sessionStorage so we can read it after a hard refresh
  try {
    const existing: string[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    existing.push(message);
    // Keep only last MAX_LOGS entries to avoid OOM
    if (existing.length > MAX_LOGS) existing.splice(0, existing.length - MAX_LOGS);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(existing));
  } catch {
    // sessionStorage not available (SSR or quota exceeded), silently ignore
  }
}

/** Call this once on mount to dump previous session's logs to console. */
export function dumpPreviousSessionLogs() {
  if (!SEARCH_DEBUG) return; // Logs hidden — set SEARCH_DEBUG = true to re-enable

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    const logs: string[] = JSON.parse(stored);
    if (logs.length === 0) return;
    console.groupCollapsed(`%c🔁 PREVIOUS SESSION LOGS (${logs.length} entries) — These happened BEFORE the last refresh`, 'color: orange; font-weight: bold; font-size: 13px;');
    logs.forEach(l => console.log('%c' + l, 'color: #f0a500'));
    console.groupEnd();
    // Clear after dumping so next time we only see fresh logs
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export { plog };
