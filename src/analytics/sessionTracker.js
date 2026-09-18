/**
 * Session Tracker
 * ───────────────
 * Records per-frame posture data during a session.
 * Provides stats computation for session summaries.
 */

class SessionTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.frames = [];
    this.startTime = Date.now();
    this.issueCountMap = {};
  }

  /** Record a single frame of posture data */
  recordFrame(postureResult, score) {
    const timestamp = Date.now();
    this.frames.push({
      timestamp,
      level: postureResult.primary.level,
      label: postureResult.primary.label,
      issues: postureResult.issues.map((i) => i.label),
      score: Math.round(score),
    });

    // Track issue frequency
    postureResult.issues.forEach((issue) => {
      this.issueCountMap[issue.label] = (this.issueCountMap[issue.label] || 0) + 1;
    });
  }

  /** Get computed session statistics */
  getStats() {
    const total = this.frames.length;
    if (total === 0) {
      return {
        duration: 0,
        totalFrames: 0,
        goodPercent: 0,
        warningPercent: 0,
        badPercent: 0,
        avgScore: 0,
        topIssues: [],
        timeline: [],
      };
    }

    const good = this.frames.filter((f) => f.level === "good").length;
    const warning = this.frames.filter((f) => f.level === "warning").length;
    const bad = this.frames.filter((f) => f.level === "bad").length;
    const avgScore = Math.round(
      this.frames.reduce((sum, f) => sum + f.score, 0) / total
    );

    // Top issues sorted by frequency
    const topIssues = Object.entries(this.issueCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, count]) => ({ label, count, percent: Math.round((count / total) * 100) }));

    // Timeline: sample every ~2 seconds for heatmap
    const sampleInterval = Math.max(1, Math.floor(total / 60));
    const timeline = [];
    for (let i = 0; i < total; i += sampleInterval) {
      timeline.push(this.frames[i].level);
    }

    return {
      duration: Date.now() - this.startTime,
      totalFrames: total,
      goodPercent: Math.round((good / total) * 100),
      warningPercent: Math.round((warning / total) * 100),
      badPercent: Math.round((bad / total) * 100),
      avgScore,
      topIssues,
      timeline,
    };
  }

  /** Get raw frame data for export */
  getRawData() {
    return this.frames;
  }
}

// Singleton instance
export const sessionTracker = new SessionTracker();
