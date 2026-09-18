import { useSettings } from "./SettingsContext";
import "./SettingsPanel.css";

export default function SettingsPanel({ isOpen, onClose }) {
  const { settings, updateSetting, resetSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="sp-header">
          <h2 className="sp-title">⚙️ Settings</h2>
          <button className="sp-close" onClick={onClose}>×</button>
        </div>

        <div className="sp-body">
          {/* ── Detection ── */}
          <div className="sp-section">
            <div className="sp-section-title">Detection Sensitivity</div>

            <div className="sp-field">
              <label>Neck Angle Range</label>
              <div className="sp-range-row">
                <input
                  type="range" min="-120" max="-70"
                  value={settings.neckAngleMin}
                  onChange={(e) => updateSetting("neckAngleMin", +e.target.value)}
                />
                <span>{settings.neckAngleMin}°</span>
              </div>
              <div className="sp-range-row">
                <input
                  type="range" min="-90" max="-40"
                  value={settings.neckAngleMax}
                  onChange={(e) => updateSetting("neckAngleMax", +e.target.value)}
                />
                <span>{settings.neckAngleMax}°</span>
              </div>
              <div className="sp-hint">Good posture: {settings.neckAngleMin}° to {settings.neckAngleMax}°</div>
            </div>

            <div className="sp-field">
              <label>Head Tilt Sensitivity</label>
              <div className="sp-range-row">
                <input
                  type="range" min="5" max="25" step="1"
                  value={settings.headTiltThreshold * 100}
                  onChange={(e) => updateSetting("headTiltThreshold", +e.target.value / 100)}
                />
                <span>{(settings.headTiltThreshold * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="sp-field">
              <label>Lean Detection (degrees)</label>
              <div className="sp-range-row">
                <input
                  type="range" min="5" max="25" step="1"
                  value={settings.leanThreshold}
                  onChange={(e) => updateSetting("leanThreshold", +e.target.value)}
                />
                <span>{settings.leanThreshold}°</span>
              </div>
            </div>
          </div>

          {/* ── Voice ── */}
          <div className="sp-section">
            <div className="sp-section-title">Voice Alerts</div>

            <div className="sp-field sp-toggle-row">
              <label>Voice Enabled</label>
              <button
                className={`sp-toggle ${settings.voiceEnabled ? "on" : ""}`}
                onClick={() => updateSetting("voiceEnabled", !settings.voiceEnabled)}
              >
                <div className="sp-toggle-knob" />
              </button>
            </div>

            <div className="sp-field">
              <label>Voice Speed</label>
              <div className="sp-range-row">
                <input
                  type="range" min="0.5" max="2" step="0.1"
                  value={settings.voiceRate}
                  onChange={(e) => updateSetting("voiceRate", +e.target.value)}
                />
                <span>{settings.voiceRate}x</span>
              </div>
            </div>

            <div className="sp-field">
              <label>Alert Cooldown</label>
              <div className="sp-range-row">
                <input
                  type="range" min="5" max="30" step="1"
                  value={settings.voiceCooldown}
                  onChange={(e) => updateSetting("voiceCooldown", +e.target.value)}
                />
                <span>{settings.voiceCooldown}s</span>
              </div>
            </div>
          </div>

          {/* ── Break Timer ── */}
          <div className="sp-section">
            <div className="sp-section-title">Break Reminders</div>

            <div className="sp-field sp-toggle-row">
              <label>Break Timer Enabled</label>
              <button
                className={`sp-toggle ${settings.breakEnabled ? "on" : ""}`}
                onClick={() => updateSetting("breakEnabled", !settings.breakEnabled)}
              >
                <div className="sp-toggle-knob" />
              </button>
            </div>

            <div className="sp-field">
              <label>Break Interval</label>
              <div className="sp-range-row">
                <input
                  type="range" min="10" max="60" step="5"
                  value={settings.breakInterval}
                  onChange={(e) => updateSetting("breakInterval", +e.target.value)}
                />
                <span>{settings.breakInterval}m</span>
              </div>
            </div>
          </div>

          {/* ── Display ── */}
          <div className="sp-section">
            <div className="sp-section-title">Display</div>

            <div className="sp-field sp-toggle-row">
              <label>Show Skeleton Lines</label>
              <button
                className={`sp-toggle ${settings.showSkeleton ? "on" : ""}`}
                onClick={() => updateSetting("showSkeleton", !settings.showSkeleton)}
              >
                <div className="sp-toggle-knob" />
              </button>
            </div>

            <div className="sp-field sp-toggle-row">
              <label>Show Neck Guide</label>
              <button
                className={`sp-toggle ${settings.showNeckGuide ? "on" : ""}`}
                onClick={() => updateSetting("showNeckGuide", !settings.showNeckGuide)}
              >
                <div className="sp-toggle-knob" />
              </button>
            </div>
          </div>

          {/* ── Developer & Academic Attribution ── */}
          <div className="sp-section sp-attribution-card">
            <div className="sp-section-title">Project & Author</div>
            <div className="sp-author-box">
              <div className="sp-author-heading">Shaikh Mohammad Warsi</div>
              <div className="sp-author-sub">Computer Vision Evaluated Project</div>
              <div className="sp-author-desc">
                Developed for the VITyarthi Flipped Course Evaluation. Real-time MoveNet SinglePose Lightning pose estimation with algorithmic biomechanical assessment.
              </div>
            </div>
          </div>

          <button className="sp-btn-reset" onClick={resetSettings}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
