import { useState } from "react";
import WordCounter from "./utils/WordCounter";
import ReadingTimer from "./utils/ReadingTimer";
import FocusBlocker from "./utils/FocusBlocker";
import StudyTimer from "./utils/StudyTimer";
import StudyStats from "./utils/StudyStats";
import "./AppMenu.css";

const FEATURES = [
  { key: "word", label: "Word Counter" },
  { key: "reading", label: "Reading Timer" },
  { key: "focus", label: "Website Blocker" },
  { key: "pomodoro", label: "Pomodoro Timer" },
  { key: "stats", label: "Study Stats" },
];

export default function App() {
  const [page, setPage] = useState<string | null>(null);

  return (
    <div className="app-menu-container" style={{ position: "relative", zIndex: 1 }}>
      <div className="app-animated-bg"></div>
      
      {!page && (
        <>
          <div className="app-ripple-bg">
            <svg width="100vw" height="100vh" viewBox="0 0 400 400" style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>
              {[...Array(12)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 400}
                  cy={Math.random() * 400}
                  r="0"
                  className={`ripple ripple-${i}`}
                />
              ))}
            </svg>
          </div>
          <div style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8
          }}>
            <span
              style={{
                fontSize: "2.8em",
                fontWeight: 900,
                letterSpacing: "1px",
                background: "linear-gradient(90deg, #10b981 40%, #2563eb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 12px #e0f7fa",
                display: "flex",
                alignItems: "center",
                gap: 10
              }}
            >
              <span role="img" aria-label="book">📚</span> LearnEase
            </span>
            <span style={{
              color: "#444",
              fontSize: "1.08em",
              fontWeight: 500,
              letterSpacing: "0.5px",
              textAlign: "center",
              marginTop: 2
            }}>
              Your smart student toolkit for productivity & focus
            </span>
          </div>
          <div className="app-menu-grid">
            {FEATURES.map(f => (
              <button
                key={f.key}
                className="app-menu-btn"
                onClick={() => setPage(f.key)}
              >
                <span className="gradient"></span>
                <span className="label">{f.label}</span>
                <span className="transition"></span>
              </button>
            ))}
          </div>
        </>
      )}
      {page === "word" && <WordCounter />}
      {page === "reading" && <ReadingTimer />}
      {page === "focus" && <FocusBlocker />}
      {page === "pomodoro" && <StudyTimer />}
      {page === "stats" && <StudyStats />}
      {page && (
        <button className="app-menu-btn app-menu-back" onClick={() => setPage(null)}>
          <span className="gradient"></span>
          <span className="label">← Back to Home</span>
          <span className="transition"></span>
        </button>
      )}
    </div>
  );
}