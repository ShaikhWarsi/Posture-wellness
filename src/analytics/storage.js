/**
 * Storage — localStorage persistence for session history
 */

const STORAGE_KEY = "postureai_sessions";
const MAX_SESSIONS = 30;

/** Save a session summary to history */
export function saveSession(stats) {
  const sessions = getSessions();
  sessions.push({
    ...stats,
    date: new Date().toISOString(),
    id: Date.now(),
  });

  // Keep only last N sessions
  while (sessions.length > MAX_SESSIONS) {
    sessions.shift();
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("Failed to save session:", e);
  }
}

/** Get all saved sessions */
export function getSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Clear all session history */
export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Get stats for the last N days */
export function getRecentStats(days = 7) {
  const sessions = getSessions();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessions.filter((s) => new Date(s.date).getTime() > cutoff);
}
