import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "./PostureCamera.css";

// ── Modular imports ──
import { DEFAULT_RESULT } from "../posture/types";
import { analyzePosture } from "../posture/analyzer";
import { drawPose } from "../posture/drawing";
import { getInsight } from "../utils/insights";
import { useToast } from "../hooks/useToast";
import { useSettings } from "../features/settings/SettingsContext";
import { sessionTracker } from "../analytics/sessionTracker";
import { saveSession } from "../analytics/storage";
import { exportSessionCSV } from "../utils/exportReport";
import { checkAchievements, getAllAchievements } from "../features/gamification/achievements";
import { getSessions } from "../analytics/storage";

import SessionSummary from "../features/sessionSummary/SessionSummary";
import AchievementToast from "../features/gamification/AchievementToast";

// Friendly status emoji map
const STATUS_EMOJI = {
  good: "🌿",
  warning: "🌤",
  bad: "🌧",
};

// Warm encouraging toast messages
const getEncouragingMessage = (issueNames) =>
  `Hey, let's check your ${issueNames} 🙂`;

export default function PostureCamera({ isPaused, isFullscreen }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ── Settings ──
  const { settings } = useSettings();

  // ── Sound ──
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  const lastSpokenRef = useRef(0);

  // ── Posture state ──
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [postureResult, setPostureResult] = useState(DEFAULT_RESULT);
  const [score, setScore] = useState(100);
  const [streak, setStreak] = useState(0);
  const [goodFrames, setGoodFrames] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [insight, setInsight] = useState("Getting ready for you…");

  const streakRef = useRef(0);
  const goodRef = useRef(0);
  const totalRef = useRef(0);
  const maxStreakRef = useRef(0);

  const [badPostureTime, setBadPostureTime] = useState(0);
  const [showTelemetry, setShowTelemetry] = useState(false);

  // ── Toast notifications ──
  const { toasts, showToast, dismissToast } = useToast();

  // ── Session summary ──
  const [showSummary, setShowSummary] = useState(false);

  // ── Achievements ──
  const [newAchievements, setNewAchievements] = useState([]);

  // ── Pause ref ──
  const isPausedRef = useRef(isPaused);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // ── Speech helper ──
  const speakAlert = useCallback((message) => {
    if (isMutedRef.current || !settings.voiceEnabled) return;
    const now = Date.now();
    if (now - lastSpokenRef.current < settings.voiceCooldown * 1000) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(message);
    speech.rate = settings.voiceRate;
    speech.pitch = settings.voicePitch;
    window.speechSynthesis.speak(speech);
    lastSpokenRef.current = now;
  }, [settings.voiceEnabled, settings.voiceRate, settings.voicePitch, settings.voiceCooldown]);

  // ── Main detection loop ──
  useEffect(() => {
    let detector;
    let animFrameId;

    const init = async () => {
      const tf = window.tf;
      const posedetection = window.poseDetection;

      await tf.setBackend("webgl");
      await tf.ready();

      detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
      );

      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      setTimeout(() => setIsCalibrating(false), 2500);

      sessionTracker.reset();
      detect(detector);
    };

    const detect = async (det) => {
      const video = videoRef.current;

      const loop = async () => {
        if (video.readyState === 4 && !isPausedRef.current) {
          const poses = await det.estimatePoses(video);

          if (poses.length > 0) {
            const result = analyzePosture(poses[0]);
            setPostureResult(result);

            const { primary, issues } = result;
            const isGoodFrame = primary.level === "good";

            const ctx = canvasRef.current.getContext("2d");
            drawPose(ctx, poses[0], primary.level);

            totalRef.current += 1;
            setTotalFrames(totalRef.current);

            if (isGoodFrame) {
              setScore((prev) => Math.min(prev + 0.5, 100));
              streakRef.current += 1;
              goodRef.current += 1;
              if (streakRef.current > maxStreakRef.current) {
                maxStreakRef.current = streakRef.current;
              }
            } else if (primary.level === "warning") {
              setScore((prev) => Math.max(prev - 0.3, 0));
            } else {
              setScore((prev) => Math.max(prev - 1, 0));
              streakRef.current = 0;
            }

            if (primary.voice) {
              speakAlert(primary.voice);
            }

            let newBadTime = badPostureTime;
            if (primary.level === "bad") {
              newBadTime += 1;
            } else {
              newBadTime = 0;
            }
            setBadPostureTime(newBadTime);

            // Warm encouraging persistent-issue toast
            if (newBadTime > 150 && newBadTime % 150 === 1) {
              const issueNames = issues.map((i) => i.label.toLowerCase()).join(" & ");
              showToast(getEncouragingMessage(issueNames));
            }

            setStreak(streakRef.current);
            setGoodFrames(goodRef.current);
            setInsight(getInsight(Math.round(score), streakRef.current, issues));

            sessionTracker.recordFrame(result, score);
          }
        }

        animFrameId = requestAnimationFrame(loop);
      };

      loop();
    };

    init();
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── End session handler ──
  const handleEndSession = useCallback(() => {
    const stats = sessionTracker.getStats();
    saveSession(stats);

    const allSessions = getSessions();
    const achContext = {
      totalSessions: allSessions.length,
      goodStreak: maxStreakRef.current,
      maxStreak: maxStreakRef.current,
      avgScore: stats.avgScore,
      sessionDuration: stats.duration,
      badPercent: stats.badPercent,
      totalFrames: stats.totalFrames,
    };
    const unlocked = checkAchievements(achContext);
    if (unlocked.length > 0) {
      setNewAchievements(unlocked);
    }

    setShowSummary(true);
  }, []);

  const handleExport = useCallback(() => {
    exportSessionCSV(sessionTracker.getRawData());
  }, []);

  // ── Computed values ──
  const { primary, issues, neckAngle, shoulderTilt, headTilt } = postureResult;
  const level = primary.level;
  const scoreRounded = Math.round(score);
  const accuracy =
    totalFrames > 0 ? Math.round((goodFrames / totalFrames) * 100) : 0;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scoreRounded / 100) * circumference;

  // Warm color for score (sage / amber / blush)
  const scoreColor =
    scoreRounded >= 75
      ? "var(--accent-sage)"
      : scoreRounded >= 45
        ? "var(--accent-warm)"
        : "var(--accent-blush)";

  const badgeClass = level === "good" ? "good" : level === "warning" ? "warning" : "bad";

  // Status display with organic emoji
  const statusEmoji = STATUS_EMOJI[level] ?? "…";
  const statusDisplay =
    primary.label === "Detecting…"
      ? "Getting ready…"
      : `${statusEmoji} ${primary.label}`;

  // Streak messaging — warm & encouraging
  const streakMessage =
    streak >= 60
      ? "You're glowing ✨"
      : streak >= 30
        ? "Keep it up, you're doing great 🌿"
        : streak >= 10
          ? "Nice — building momentum"
          : "Hold steady to build your streak";

  return (
    <>
      {/* ── Achievement Toast ── */}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievements={newAchievements}
          onDone={() => setNewAchievements([])}
        />
      )}

      {/* ── Session Summary Modal ── */}
      {showSummary && (
        <SessionSummary
          stats={sessionTracker.getStats()}
          onClose={() => setShowSummary(false)}
          onExport={handleExport}
        />
      )}

      {/* ── Toast Notifications ── */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">🌿</span>
            <span>{toast.message}</span>
            <button className="toast-dismiss" onClick={() => dismissToast(toast.id)}>×</button>
          </div>
        ))}
      </div>

      {/* ── Main Layout Container ── */}
      <div className="camera-layout">
        {/* ── Camera Panel ── */}
        <div className={`camera-panel ${isFullscreen ? "camera-fullscreen" : ""}`}>
          <div className="camera-label">
            <div className="camera-label-dot" />
            <span className="camera-label-title">Live Vision Stream</span>
            <span className="camera-model-badge">MoveNet • Shaikh Mohammad Warsi</span>
            {isPaused && <span className="camera-paused-badge">⏸ Paused</span>}
            <button
              className={`telemetry-toggle-btn ${showTelemetry ? "active" : ""}`}
              onClick={() => setShowTelemetry((v) => !v)}
              title="Toggle Real-Time Computer Vision Angles & Vectors"
            >
              {showTelemetry ? "Hide CV Metrics" : "CV Telemetry"}
            </button>
          </div>
          <div className="camera-wrap">
            <video ref={videoRef} />
            <canvas ref={canvasRef} width="640" height="480" />
            <div className="corner corner-tl" />
            <div className="corner corner-tr" />
            <div className="corner corner-bl" />
            <div className="corner corner-br" />

            {/* Real-time Computer Vision Telemetry HUD */}
            {showTelemetry && (
              <div className="telemetry-hud-overlay">
                <div className="telemetry-hud-header">
                  <span className="hud-title">CV Landmark Telemetry</span>
                  <span className="hud-author">Shaikh Mohammad Warsi</span>
                </div>
                <div className="telemetry-hud-grid">
                  <div className="telemetry-metric">
                    <span className="telemetry-k">Neck Angle:</span>
                    <span className="telemetry-v">{neckAngle ? `${neckAngle.toFixed(1)}°` : "0.0°"}</span>
                  </div>
                  <div className="telemetry-metric">
                    <span className="telemetry-k">Shoulder Δy:</span>
                    <span className="telemetry-v">{shoulderTilt ? `${shoulderTilt.toFixed(1)}px` : "0.0px"}</span>
                  </div>
                  <div className="telemetry-metric">
                    <span className="telemetry-k">Cranial Δy:</span>
                    <span className="telemetry-v">{headTilt ? `${headTilt.toFixed(1)}px` : "0.0px"}</span>
                  </div>
                  <div className="telemetry-metric">
                    <span className="telemetry-k">Classification:</span>
                    <span className={`telemetry-v ${level}`}>{primary.label}</span>
                  </div>
                </div>
              </div>
            )}

            <div className={`posture-badge ${badgeClass}`}>
              {statusDisplay}
            </div>

            {isCalibrating && (
              <div className="calibrating-overlay">
                <div className="calibrating-spinner" />
                <div className="calibrating-text">Calibrating Vision Model…</div>
                <div className="calibrating-sub">
                  Sit upright and center yourself in view. MoveNet pose detector initializing.
                </div>
                <div className="calibrating-author">Engineered by Shaikh Mohammad Warsi</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel (Dashboard) ── */}
        {!isFullscreen && (
          <div className="right-panel">
            {/* Score Circle */}
            <div className="metric-card">
              <div className="card-label">Posture Score</div>
              <div className="score-circle-wrap">
                <div className="score-outer">
                  <svg className="score-svg" width="140" height="140" viewBox="0 0 140 140">
                    <circle className="score-track" cx="70" cy="70" r={radius} />
                    <circle
                      className="score-fill"
                      cx="70" cy="70" r={radius}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      stroke={scoreColor}
                    />
                  </svg>
                  <div className="score-center">
                    <span className="score-number" style={{ color: scoreColor }}>{scoreRounded}</span>
                    <span className="score-label">today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls row */}
            <div className="controls-row">
              <button
                onClick={() => {
                  const nextState = !isMuted;
                  setIsMuted(nextState);
                  if (nextState) window.speechSynthesis.cancel();
                }}
                className={`sound-toggle-btn ${isMuted ? "muted" : ""}`}
              >
                {isMuted ? "🔇 Muted" : "🔊 Voice on"}
              </button>
              <button className="end-session-btn" onClick={handleEndSession}>
                🌱 End Session
              </button>
            </div>

            {/* Status */}
            <div className="metric-card">
              <div className="card-label">How you're sitting</div>
              <div className="status-row">
                <div className={`status-indicator ${badgeClass}`}>
                  {statusEmoji}
                </div>
                <span className={`status-text ${badgeClass}`}>{statusDisplay}</span>
              </div>

              {issues.length > 0 && (
                <div className="issues-list">
                  {issues.map((issue, i) => (
                    <span key={i} className={`issue-tag ${issue.level}`}>
                      {issue.emoji} {issue.label}
                    </span>
                  ))}
                </div>
              )}

              <div className="angle-display">
                {primary.label !== "Detecting…" ? (
                  <>
                    Neck: {neckAngle.toFixed(1)}°
                    {shoulderTilt > 0 && <> · Shoulders: {shoulderTilt.toFixed(0)}px</>}
                    {headTilt > 0 && <> · Head: {headTilt.toFixed(0)}px</>}
                  </>
                ) : (
                  "Calibrating…"
                )}
              </div>

              <div className="accuracy-bar-bg">
                <div className="accuracy-bar-fill" style={{ width: `${accuracy}%` }} />
              </div>
              <div className="accuracy-label">
                <span>Session accuracy</span>
                <span>{accuracy}%</span>
              </div>
            </div>

            {/* Streak */}
            <div className="metric-card">
              <div className="card-label">Good posture streak</div>
              <div className="streak-row">
                <span className="streak-number">{streak}</span>
                <span className="streak-unit">good frames in a row</span>
              </div>
              <div className="streak-sub">{streakMessage}</div>
            </div>

            {/* Insight */}
            <div className="metric-card">
              <div className="card-label">A little nudge</div>
              <span className="insight-icon">
                {scoreRounded >= 80 ? "🌿" : scoreRounded >= 50 ? "🌤" : "🌧"}
              </span>
              <div className="insight-text">{insight}</div>
            </div>

            {/* Developer Attribution Card */}
            <div className="metric-card author-credit-card">
              <div className="card-label">Developer Attribution</div>
              <div className="author-card-content">
                <div className="author-avatar-chip">SMW</div>
                <div className="author-text-group">
                  <div className="author-main-name">Shaikh Mohammad Warsi</div>
                  <div className="author-project-tag">Computer Vision Evaluated Project</div>
                  <div className="author-course-tag">Flipped Coursework • VITyarthi</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
