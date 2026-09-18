import "./BreakOverlay.css";

const STRETCHES = [
  { emoji: "🙆", name: "Neck Rolls", desc: "Slowly roll your head in circles, 5 times each direction" },
  { emoji: "💪", name: "Shoulder Shrugs", desc: "Raise shoulders to ears, hold 3s, release. Repeat 5x" },
  { emoji: "🧘", name: "Seated Twist", desc: "Twist torso left, hold 10s, then right. Repeat 3x" },
  { emoji: "👐", name: "Wrist Circles", desc: "Extend arms, rotate wrists 10x each direction" },
  { emoji: "🦵", name: "Standing Stretch", desc: "Stand up, reach for the ceiling, hold 10 seconds" },
  { emoji: "👁️", name: "Eye Break", desc: "Look at something 20 feet away for 20 seconds" },
];

const MESSAGES = [
  "Take a breath. Roll your shoulders. You've got this.",
  "A moment of stillness is a gift to your body.",
  "Step away gently — you deserve this pause.",
  "Your body is asking for a little kindness right now.",
];

export default function BreakOverlay({ onSnooze, onDismiss }) {
  // Pick 2 random stretches
  const picks = [];
  const indices = new Set();
  while (indices.size < 2) {
    indices.add(Math.floor(Math.random() * STRETCHES.length));
  }
  [...indices].forEach((i) => picks.push(STRETCHES[i]));

  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  return (
    <div className="break-overlay">
      <div className="break-content">
        <div className="break-breathe-ring">🌿</div>

        <div>
          <div className="break-title">Time for a little break</div>
        </div>

        <div className="break-message">{message}</div>

        <div className="break-breath-hint">Breathe in… and out slowly</div>

        <div className="break-actions">
          <button className="break-dismiss-btn" onClick={onDismiss}>
            I'm ready to continue ✓
          </button>
          <button className="break-snooze-btn" onClick={() => onSnooze(5)}>
            Snooze 5 minutes
          </button>
        </div>
      </div>
    </div>
  );
}
