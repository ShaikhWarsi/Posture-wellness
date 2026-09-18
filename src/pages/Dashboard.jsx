import { useState, useMemo } from "react";
import PostureCamera from "../component/PostureCamera";
import ScrollToTop from "../component/ScrollToTop";
import BreakOverlay from "../features/breakReminder/BreakOverlay";
import SettingsPanel from "../features/settings/SettingsPanel";
import { useSettings } from "../features/settings/SettingsContext";
import { useBreakTimer } from "../hooks/useBreakTimer";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export default function Dashboard() {
  const { settings } = useSettings();

  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calmMode, setCalmMode] = useState(false);

  const {
    timeFormatted,
    isBreakTime,
    snooze,
    reset: resetBreak,
  } = useBreakTimer(settings.breakEnabled ? settings.breakInterval * 60 * 1000 : Infinity);

  const shortcutHandlers = useMemo(
    () => ({
      onToggleMute: () => {
        setIsMuted((m) => {
          const next = !m;
          if (next) window.speechSynthesis.cancel();
          return next;
        });
      },
      onTogglePause: () => setIsPaused((p) => !p),
      onToggleFullscreen: () => setIsFullscreen((f) => !f),
      onEscape: () => {
        setIsFullscreen(false);
        setSettingsOpen(false);
      },
    }),
    [],
  );
  useKeyboardShortcuts(shortcutHandlers);

  // Apply calm mode class to the app-shell
  useMemo(() => {
    const shell = document.querySelector('.app-shell');
    if (shell) {
      if (calmMode) shell.classList.add('calm-mode');
      else shell.classList.remove('calm-mode');
    }
  }, [calmMode]);

  return (
    <div className="app-content">
      <ScrollToTop />

      {isBreakTime && settings.breakEnabled && (
        <BreakOverlay onSnooze={snooze} onDismiss={resetBreak} />
      )}

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Header */}
      <header className="status-bar">
        <div className="brand">
          <div className="brand-icon">🧘</div>
          <div>
            <div className="brand-name">PostureAI</div>
            <div className="brand-tag">Engineered by <strong>Shaikh Mohammad Warsi</strong> · Computer Vision</div>
          </div>
        </div>

        <div className="status-indicators">
          <div className="author-badge-header" title="Developer & Student">
            <span className="author-badge-icon">👨‍💻</span>
            <span>Shaikh Mohammad Warsi</span>
          </div>

          <div className="indicator">
            <div className="indicator-dot" />
            {isPaused ? "Paused" : "Live Analyzing"}
          </div>
          {settings.breakEnabled && (
            <div className="indicator">🍃 {timeFormatted}</div>
          )}
          <button
            className={`calm-mode-btn ${calmMode ? "active" : ""}`}
            onClick={() => setCalmMode((c) => !c)}
            title="Toggle aesthetic theme mode"
          >
            {calmMode ? "🌙 Focus" : "☀️ Clear"}
          </button>
          <button
            className="settings-btn"
            onClick={() => setSettingsOpen(true)}
            title="Configuration & Sensitivity"
          >
            ⚙️
          </button>
          <div className="version-badge">CV v2.4</div>
        </div>
      </header>

      {/* Keyboard hint */}
      <div className="keyboard-hints">
        <span>⌨ <b>Space</b> Pause</span>
        <span><b>F</b> Fullscreen</span>
        <span><b>M</b> Mute</span>
        <span><b>Esc</b> Exit</span>
      </div>

      {/* Main */}
      <div className="dashboard-grid">
        <PostureCamera
          isPaused={isPaused}
          isFullscreen={isFullscreen}
          isMuted={isMuted}
          onToggleMute={() => {
            setIsMuted((m) => {
              const next = !m;
              if (next) window.speechSynthesis.cancel();
              return next;
            });
          }}
          onToggleFullscreen={() => setIsFullscreen((f) => !f)}
        />
      </div>
    </div>
  );
}