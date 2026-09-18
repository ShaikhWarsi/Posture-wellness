import { useEffect } from "react";
import "./SessionSummary.css";

const getSubtitle = (avgScore) => {
  if (avgScore >= 80) return "You did beautifully today 🌿 Keep it up.";
  if (avgScore >= 60) return "A solid session — you're building good habits.";
  if (avgScore >= 40) return "Every session counts. You showed up — that's what matters.";
  return "It's okay. Tomorrow is a fresh start 🌱";
};

export default function SessionSummary({ stats, onClose, onExport }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!stats) return null;

  const formatDuration = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="ss-overlay" onClick={onClose}>
      <div className="ss-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ss-close" onClick={onClose}>×</button>

        <div className="ss-header">
          <div className="ss-author-tag">PostureAI Assessment • Shaikh Mohammad Warsi</div>
          <div className="ss-title">Session Assessment Complete</div>
          <div className="ss-subtitle">{getSubtitle(stats.avgScore)}</div>
        </div>

        {/* Stats Grid */}
        <div className="ss-stats-grid">
          <div className="ss-stat">
            <span className="ss-stat-value">{formatDuration(stats.duration)}</span>
            <span className="ss-stat-label">Duration</span>
          </div>
          <div className="ss-stat">
            <span className="ss-stat-value green">{stats.avgScore}</span>
            <span className="ss-stat-label">Avg Score</span>
          </div>
          <div className="ss-stat">
            <span className="ss-stat-value">{stats.totalFrames}</span>
            <span className="ss-stat-label">Frames</span>
          </div>
        </div>

        {/* Posture Breakdown */}
        <div className="ss-breakdown">
          <div className="ss-breakdown-label">Posture breakdown</div>
          <div className="ss-bar">
            <div className="ss-bar-good" style={{ width: `${stats.goodPercent}%` }} />
            <div className="ss-bar-warning" style={{ width: `${stats.warningPercent}%` }} />
            <div className="ss-bar-bad" style={{ width: `${stats.badPercent}%` }} />
          </div>
          <div className="ss-bar-legend">
            <span><span className="ss-dot good" /> Good {stats.goodPercent}%</span>
            <span><span className="ss-dot warning" /> Fair {stats.warningPercent}%</span>
            <span><span className="ss-dot bad" /> Needs work {stats.badPercent}%</span>
          </div>
        </div>

        {/* Timeline */}
        {stats.timeline.length > 0 && (
          <div className="ss-timeline-section">
            <div className="ss-breakdown-label">Your session journey</div>
            <div className="ss-timeline">
              {stats.timeline.map((level, i) => (
                <div key={i} className={`ss-timeline-block ${level}`} />
              ))}
            </div>
            <div className="ss-timeline-labels">
              <span>Start</span>
              <span>End</span>
            </div>
          </div>
        )}

        {/* Top Issues */}
        {stats.topIssues.length > 0 && (
          <div className="ss-issues">
            <div className="ss-breakdown-label">Areas to focus on</div>
            {stats.topIssues.map((issue, i) => (
              <div key={i} className="ss-issue-row">
                <span className="ss-issue-name">{issue.label}</span>
                <div className="ss-issue-bar-bg">
                  <div
                    className="ss-issue-bar-fill"
                    style={{ width: `${issue.percent}%` }}
                  />
                </div>
                <span className="ss-issue-percent">{issue.percent}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="ss-actions">
          <button className="ss-btn-export" onClick={onExport}>
            Save your report
          </button>
          <button className="ss-btn-close" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
