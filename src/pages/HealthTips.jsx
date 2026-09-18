import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HealthTips.css";

/* ─── DATA ──────────────────────────────────────────── */
const TIPS = [
  {
    title: "Reduce Back Pain",
    icon: "🧍",
    xp: 120,
    number: "01",
    desc: "Maintaining good posture reduces strain on your spine.",
    detail:
      "When you sit upright, your spinal discs distribute weight evenly. Slouching increases disc pressure by up to 40%, leading to herniation and chronic pain over time. Keep your lumbar curve neutral and your back against your chair.",
  },
  {
    title: "Improve Focus",
    icon: "🧠",
    xp: 95,
    number: "02",
    desc: "Better posture increases oxygen flow to your brain.",
    detail:
      "Slumping compresses your diaphragm and reduces lung capacity by up to 30%. Less oxygen means reduced concentration, slower reaction times, and brain fog. Sitting tall literally lets you breathe and think better.",
  },
  {
    title: "Boost Energy",
    icon: "⚡",
    xp: 80,
    number: "03",
    desc: "Sitting upright prevents fatigue and improves stamina.",
    detail:
      "Poor posture forces your muscles to work harder to keep you upright. This constant strain drains energy throughout the day. A neutral spine means less muscular effort, leaving you with more energy for work.",
  },
  {
    title: "Prevent Injuries",
    icon: "🛡️",
    xp: 110,
    number: "04",
    desc: "Avoid long-term damage to neck and shoulders.",
    detail:
      "Every inch your head juts forward adds ~10 lbs of effective load to your cervical spine. Over years, this leads to forward head posture, shoulder impingement, and nerve compression. Correct it now — not after it hurts.",
  },
  {
    title: "Boost Confidence",
    icon: "💪",
    xp: 75,
    number: "05",
    desc: "Good posture signals confidence and improves mood.",
    detail:
      "Harvard research shows 'power posing' — standing or sitting tall — increases testosterone by ~20% and decreases cortisol (stress hormone). Your body language doesn't just affect others; it rewires your own mindset.",
  },
  {
    title: "Better Digestion",
    icon: "🌿",
    xp: 65,
    number: "06",
    desc: "Upright posture allows organs to function properly.",
    detail:
      "Hunching over after meals compresses your stomach and intestines, slowing digestion and increasing acid reflux. Sitting or standing tall keeps your GI tract aligned and functioning as designed.",
  },
];

const QUIZ = [
  {
    q: "How far forward should your monitor be?",
    options: ["6–8 inches", "Arm's length (~20\")", "As close as possible", "Doesn't matter"],
    answer: 1,
    explanation: "Your monitor should be about an arm's length away (20–40 inches) with the top at or just below eye level.",
  },
  {
    q: "What angle should your knees be at when seated?",
    options: ["45°", "120°", "90° or slightly open", "As crossed as comfortable"],
    answer: 2,
    explanation: "Knees at ~90° or slightly open keeps your hips and spine in a neutral, stress-free position.",
  },
  {
    q: "How often should you take a break from sitting?",
    options: ["Once a day", "Every 4 hours", "Every 30–60 minutes", "Only when in pain"],
    answer: 2,
    explanation: "Standing up and moving every 30–60 minutes reduces muscle fatigue and improves circulation.",
  },
  {
    q: "Where should your feet be when sitting at a desk?",
    options: ["Crossed under the chair", "Flat on the floor", "Propped on the desk", "Dangling freely"],
    answer: 1,
    explanation: "Feet flat on the floor (or a footrest) stabilizes your pelvis and keeps your spine naturally curved.",
  },
];

const CHECKLIST_ITEMS = [
  "Feet flat on the floor",
  "Knees at 90° angle",
  "Monitor at eye level",
  "Shoulders relaxed, not hunched",
  "Back supported by chair",
  "Took a break in the last hour",
];

/* ─── COMPONENT ─────────────────────────────────────── */
export default function HealthTips() {
  const navigate = useNavigate();

  // Score / XP
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  // Cards
  const [expandedTip, setExpandedTip] = useState(null);
  const [unlockedTips, setUnlockedTips] = useState(new Set());

  // Checklist
  const [checked, setChecked] = useState(new Set());

  // Quiz
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(0);

  /* Animated score fill on mount */
  useEffect(() => {
    let val = 0;
    const iv = setInterval(() => {
      val += 2;
      if (val >= 72) { setPoints(72); clearInterval(iv); }
      else setPoints(val);
    }, 18);
    return () => clearInterval(iv);
  }, []);

  /* XP from checked items */
  useEffect(() => {
    const baseXp = checked.size * 40;
    const quizXp = quizCorrect * 120;
    const tipXp = [...unlockedTips].length * 60;
    const total = baseXp + quizXp + tipXp;
    setXp(total);
    setLevel(Math.floor(total / 300) + 1);
    setStreak(checked.size);
  }, [checked, quizCorrect, unlockedTips]);

  const toggleChecked = useCallback((i) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }, []);

  const toggleTip = useCallback((i) => {
    setExpandedTip((prev) => (prev === i ? null : i));
    setUnlockedTips((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  const handleQuizAnswer = (optIdx) => {
    if (quizSelected !== null) return;
    setQuizSelected(optIdx);
    const isCorrect = optIdx === QUIZ[quizIndex].answer;
    setQuizFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setQuizCorrect((p) => p + 1);
  };

  const nextQuestion = () => {
    if (quizIndex + 1 < QUIZ.length) {
      setQuizIndex((p) => p + 1);
      setQuizSelected(null);
      setQuizFeedback(null);
    }
  };

  /* Score ring math */
  const radius = 65;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ - (points / 100) * circ;

  const grade =
    points >= 85 ? "S RANK 🔥" :
    points >= 70 ? "A RANK ✨" :
    points >= 50 ? "B RANK ⚡" : "C RANK 💪";

  const gradeColor =
    points >= 85 ? "var(--green)" :
    points >= 70 ? "var(--cyan)" :
    points >= 50 ? "var(--amber)" : "var(--muted)";

  return (
    <div className="ht-page">
      <div className="ht-inner">

        {/* ── NAV ── */}
        <nav className="ht-nav">
          <button className="ht-back-btn" onClick={() => navigate("/")}>
            ← DASHBOARD
          </button>
          <span className="ht-nav-badge">POSTURE WELLNESS · HEALTH MODULE · SHAIKH MOHAMMAD WARSI</span>
        </nav>

        {/* ── HERO ── */}
        <section className="ht-hero">
          <div className="ht-hero-eyebrow">// HEALTH INTELLIGENCE & BIOMECHANICS</div>
          <h1 className="ht-hero-title">SIT TALL.<br />LIVE WELL.</h1>
          <p className="ht-hero-sub">
            Science-backed benefits of good posture — track your habits,
            test your knowledge, and level up your health. Developed by <strong>Shaikh Mohammad Warsi</strong> as part of the Computer Vision Evaluated Project.
          </p>
        </section>

        {/* ── GAMIFIED SCORE PANEL ── */}
        <section className="ht-score-panel">

          {/* LEFT: stats */}
          <div className="ht-score-left">
            <div className="ht-stat">
              <span className="ht-stat-label">Level</span>
              <span className="ht-stat-value purple">LV. {level}</span>
            </div>
            <div className="ht-stat">
              <span className="ht-stat-label">Total XP</span>
              <span className="ht-stat-value cyan">{xp} XP</span>
            </div>
            <div className="ht-stat">
              <span className="ht-stat-label">Habit Streak</span>
              <span className="ht-stat-value amber">{streak} / {CHECKLIST_ITEMS.length}</span>
            </div>
            <div className="ht-stat">
              <span className="ht-stat-label">Quiz Score</span>
              <span className="ht-stat-value green">{quizCorrect} / {QUIZ.length}</span>
            </div>
          </div>

          {/* CENTER: score circle */}
          <div className="ht-score-center">
            <div className="ht-score-ring">
              <svg className="ht-score-svg" width="160" height="160" viewBox="0 0 160 160">
                <circle className="score-ring-track" cx="80" cy="80" r={radius} />
                <circle
                  className="score-ring-fill"
                  cx="80" cy="80" r={radius}
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="ht-score-text">
                <span className="ht-score-number">{points}</span>
                <span className="ht-score-pct">HEALTH SCORE</span>
              </div>
            </div>
            <div className="ht-score-grade" style={{ color: gradeColor }}>{grade}</div>
            <div className="ht-score-label">Complete habits to raise score</div>
          </div>

          {/* RIGHT: checklist + xp bar */}
          <div className="ht-score-right">
            <div className="ht-xp-bar-wrap">
              <div className="ht-xp-bar-header">
                <span>Level Progress</span>
                <span>{xp % 300} / 300 XP</span>
              </div>
              <div className="ht-xp-bar-bg">
                <div className="ht-xp-bar-fill" style={{ width: `${(xp % 300) / 3}%` }} />
              </div>
            </div>
            <div className="ht-checklist">
              {CHECKLIST_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={`ht-check-item ${checked.has(i) ? "checked" : ""}`}
                  onClick={() => toggleChecked(i)}
                >
                  <div className="ht-check-box">{checked.has(i) ? "✓" : ""}</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ── IMAGE SECTION ── */}
        <section className="ht-image-section">
          <div className="ht-image-section-label">// Visual Guide</div>
          <div className="ht-image-grid">

            {/* Image 1 — real URL from search */}
            <div className="ht-image-card">
              <img
                src="https://thumbs.dreamstime.com/b/correct-sitting-posture-desk-ergonomics-office-worker-using-computer-improving-his-90415760.jpg?w=768"
                alt="Correct sitting posture at desk"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="ht-image-placeholder" style={{ display: "none" }}>
                <div className="ht-image-placeholder-icon">🖼️</div>
                <div className="ht-image-placeholder-text">Add posture diagram here</div>
              </div>
              <div className="ht-image-caption">Correct Seated Posture</div>
            </div>

            {/* Image 2 — placeholder for user to fill */}
            <div className="ht-image-card">
              <div className="ht-image-placeholder">
                <img
                src="https://thumbs.dreamstime.com/z/correct-sitting-computer-posture-office-ergonomics-work-desk-proper-position-neck-back-pain-healthy-correct-218451118.jpg"
                alt="Correct sitting posture at desk"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
                <div className="ht-image-placeholder-icon">📐</div>
                <div className="ht-image-placeholder-text">Add ergonomic<br />desk setup image</div>
              </div>
              <div className="ht-image-caption">Ergonomic Desk Setup</div>
            </div>

          </div>
        </section>

        {/* ── BENEFIT CARDS ── */}
        <section>
          <h2 className="ht-section-title">6 Science-Backed Benefits</h2>
          <p className="ht-section-sub">Click each card to unlock its insight and earn XP</p>
          <div className="ht-tips-grid">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className={`ht-tip-card ${unlockedTips.has(i) ? "unlocked" : ""}`}
                onClick={() => toggleTip(i)}
              >
                <span className="ht-tip-lock">
                  {unlockedTips.has(i) ? "🔓" : "🔒"}
                </span>
                <span className="ht-tip-icon" style={{ animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>
                  {tip.icon}
                </span>
                <div className="ht-tip-number">// {tip.number}</div>
                <h3 className="ht-tip-title">{tip.title}</h3>
                <p className="ht-tip-desc">{tip.desc}</p>
                <div className="ht-tip-xp">⚡ +{tip.xp} XP on unlock</div>

                {expandedTip === i && (
                  <div className="ht-tip-expanded">{tip.detail}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── POSTURE QUIZ ── */}
        <section className="ht-quiz-section">
          <div className="ht-stat-label" style={{ marginBottom: 12 }}>
            // POSTURE KNOWLEDGE QUIZ — Q{quizIndex + 1} of {QUIZ.length}
          </div>
          <div className="ht-quiz-question">{QUIZ[quizIndex].q}</div>

          <div className="ht-quiz-options">
            {QUIZ[quizIndex].options.map((opt, i) => (
              <button
                key={i}
                className={`ht-quiz-option ${
                  quizSelected !== null
                    ? i === QUIZ[quizIndex].answer
                      ? "correct"
                      : quizSelected === i
                      ? "wrong"
                      : ""
                    : ""
                }`}
                onClick={() => handleQuizAnswer(i)}
                disabled={quizSelected !== null}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>

          {quizFeedback && (
            <div className={`ht-quiz-feedback ${quizFeedback}`}>
              {quizFeedback === "correct" ? "✅ Correct! " : "❌ Not quite — "}
              {QUIZ[quizIndex].explanation}
            </div>
          )}

          {quizFeedback && quizIndex + 1 < QUIZ.length && (
            <button className="ht-quiz-next" onClick={nextQuestion}>
              Next Question →
            </button>
          )}

          {quizFeedback && quizIndex + 1 === QUIZ.length && (
            <div className="ht-quiz-feedback correct" style={{ marginTop: 16 }}>
              🏆 Quiz complete! You scored {quizCorrect}/{QUIZ.length} — {quizCorrect * 120} XP earned!
            </div>
          )}
        </section>

        {/* ── YOUTUBE VIDEO ── */}
        <section className="ht-video-section">
          <div className="ht-video-label">
            <div className="ht-video-dot" />
            <h2 className="ht-section-title" style={{ marginBottom: 0, fontSize: 28 }}>
              Watch: Desk Posture Tips
            </h2>
          </div>
          <p className="ht-section-sub" style={{ marginBottom: 16 }}>
            A practical guide to perfect posture while working at your desk
          </p>
          <div className="ht-video-embed">
            <iframe
              src="https://www.youtube.com/embed/F8_ME4VwTiw"
              title="Proper Sitting Posture at Desk"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ht-cta">
          <div className="ht-author-pill">Project by Shaikh Mohammad Warsi</div>
          <h2 className="ht-cta-title">Ready to Fix Your Posture?</h2>
          <p className="ht-cta-sub">Head back to the dashboard and start your live AI computer vision posture analysis.</p>
          <button className="ht-cta-btn" onClick={() => navigate("/")}>
            ← Back to Dashboard
          </button>
        </section>

      </div>
    </div>
  );
}
