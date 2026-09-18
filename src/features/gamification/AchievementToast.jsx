import { useEffect, useState } from "react";
import "./AchievementToast.css";

export default function AchievementToast({ achievements, onDone }) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!achievements || achievements.length === 0) return;

    const timer = setTimeout(() => {
      if (current < achievements.length - 1) {
        setExiting(true);
        setTimeout(() => {
          setExiting(false);
          setCurrent((p) => p + 1);
        }, 350);
      } else {
        setExiting(true);
        setTimeout(() => onDone?.(), 350);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [current, achievements, onDone]);

  if (!achievements || achievements.length === 0) return null;

  const ach = achievements[current];

  return (
    <div className={`ach-toast ${exiting ? "ach-exit" : ""}`}>
      <div className="ach-toast-glow" />
      <span className="ach-toast-emoji">{ach.emoji}</span>
      <div className="ach-toast-content">
        <div className="ach-toast-label">✨ You earned something nice</div>
        <div className="ach-toast-title">{ach.title}</div>
        <div className="ach-toast-desc">{ach.desc}</div>
      </div>
    </div>
  );
}
