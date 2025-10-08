import { useState } from "react";
import WordCounter from "./utils/WordCounter";
import ReadingTimer from "./utils/ReadingTimer";
import "./AppMenu.css";

const FEATURES = [
  { key: "word", label: "Word Counter" },
  { key: "reading", label: "Reading Timer" },
  { key: "focus", label: "Focus Blocker" },
  { key: "pomodoro", label: "Pomodoro Timer" },
  { key: "journal", label: "Journal" },
  { key: "stats", label: "Study Stats" },
];

export default function App() {
  const [page, setPage] = useState<string | null>(null);

  return (
  <div className="app-menu-container">
      {!page && (
        <>
          <h2 className="app-menu-title">LearnEase</h2>
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
      {/* {page === "focus" && <FocusBlocker />} */}
      {/* {page === "pomodoro" && <StudyTimer />} */}
      {/* {page === "journal" && <Journal />} */}
      {/* {page === "stats" && <StudyStats />} */}
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