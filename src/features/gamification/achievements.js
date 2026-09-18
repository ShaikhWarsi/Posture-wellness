/**
 * Achievements System
 * ───────────────────
 * Defines achievement conditions and checks them
 * against session data.
 */

const STORAGE_KEY = "postureai_achievements";

export const ACHIEVEMENTS = [
  {
    id: "first_session",
    title: "First Steps",
    desc: "Complete your first posture session",
    emoji: "🎯",
    check: (ctx) => ctx.totalSessions >= 1,
  },
  {
    id: "iron_spine_5",
    title: "Iron Spine",
    desc: "Maintain 90%+ accuracy for 5 minutes",
    emoji: "🦴",
    check: (ctx) => ctx.goodStreak >= 300, // ~300 frames ≈ 5 mins at 1fps
  },
  {
    id: "streak_100",
    title: "Streak King",
    desc: "Hit a 100-frame good posture streak",
    emoji: "👑",
    check: (ctx) => ctx.maxStreak >= 100,
  },
  {
    id: "sessions_5",
    title: "Dedicated",
    desc: "Complete 5 posture sessions",
    emoji: "📅",
    check: (ctx) => ctx.totalSessions >= 5,
  },
  {
    id: "sessions_10",
    title: "Habit Formed",
    desc: "Complete 10 posture sessions",
    emoji: "🧱",
    check: (ctx) => ctx.totalSessions >= 10,
  },
  {
    id: "perfect_score",
    title: "Perfection",
    desc: "Achieve a session average score of 95+",
    emoji: "💎",
    check: (ctx) => ctx.avgScore >= 95,
  },
  {
    id: "long_session",
    title: "Marathon",
    desc: "Run a session for 30+ minutes",
    emoji: "⏱️",
    check: (ctx) => ctx.sessionDuration >= 30 * 60 * 1000,
  },
  {
    id: "no_bad",
    title: "Clean Sheet",
    desc: "Complete a session with 0% bad posture",
    emoji: "✨",
    check: (ctx) => ctx.badPercent === 0 && ctx.totalFrames > 100,
  },
];

/** Get unlocked achievement IDs from storage */
export function getUnlockedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save unlocked achievement IDs */
function saveUnlockedIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Failed to save achievements:", e);
  }
}

/**
 * Check for newly unlocked achievements.
 * Returns an array of newly unlocked achievement objects.
 */
export function checkAchievements(context) {
  const unlocked = getUnlockedIds();
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach((ach) => {
    if (!unlocked.includes(ach.id) && ach.check(context)) {
      unlocked.push(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveUnlockedIds(unlocked);
  }

  return newlyUnlocked;
}

/** Get all achievements with their unlock status */
export function getAllAchievements() {
  const unlocked = getUnlockedIds();
  return ACHIEVEMENTS.map((ach) => ({
    ...ach,
    isUnlocked: unlocked.includes(ach.id),
  }));
}
