import { useState } from "react";
import WordCounter from "./utils/WordCounter";
import ReadingTimer from "./utils/ReadingTimer";
import FocusBlocker from "./utils/FocusBlocker";
import StudyTimer from "./utils/StudyTimer";
import StudyStats from "./utils/StudyStats";
import About from "./utils/About";
import PrivacyPolicy from "./utils/PrivacyPolicy";
import Contact from "./utils/Contact";
import "./AppMenu.css";

const FEATURES = [
  { key: "word", label: "Word Counter" },
  { key: "reading", label: "Reading Timer" },
  { key: "focus", label: "Website Blocker" },
  { key: "pomodoro", label: "Pomodoro Timer" },
  { key: "stats", label: "Study Stats" },
];

const SIDEBAR = [
  { key: "about", label: "About" },
  { key: "privacy", label: "Privacy" },
  { key: "contact", label: "Contact" },
];

export default function App() {
  const [page, setPage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-menu-container" style={{ position: "relative", zIndex: 1 }}>
      <div className="app-animated-bg"></div>
      
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <span style={{ fontSize: "1.5em", color: "#10b981" }}>✖</span>
        ) : (
          <span style={{ fontSize: "1.5em", color: "#10b981" }}>☰</span>
        )}
      </button>

      <div
        className={`app-sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          left: sidebarOpen ? 0 : '-100%'
        }}
      >
        {/* Ripple effect for sidebar */}
        <div className="app-ripple-bg" style={{ borderRadius: 18, overflow: "hidden", width: "100%", height: "100%", position: "absolute", left: 0, top: 0, zIndex: 0 }}>
          <svg width="110" height="100vh" viewBox="0 0 110 400" style={{ position: "absolute", top: 0, left: 0 }}>
            {[...Array(6)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 110}
                cy={Math.random() * 400}
                r="0"
                className={`ripple ripple-${i}`}
              />
            ))}
          </svg>
        </div>
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          {SIDEBAR.map(item => (
            <button
              key={item.key}
              className="app-sidebar-btn"
              onClick={() => { setPage(item.key); setSidebarOpen(false); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

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
            <span
              style={{
                fontSize: "1.18em",
                fontWeight: 400,
                letterSpacing: "0.7px",
                textAlign: "center",
                marginTop: 6,
                padding: "6px 18px",
                borderRadius: "12px",
                color: "#2563eb",
                opacity: 0,
                animation: "fadeInSubtitle 1.2s ease-in-out forwards"
              }}
            >
              Your smart student toolkit for <span style={{ color: "#10b981", fontWeight: 500 }}>productivity</span> & <span style={{ color: "#2563eb", fontWeight: 500 }}>focus</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              className="app-menu-btn"
              onClick={() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_STICKY_NOTES" }, () => {
                      if (chrome.runtime.lastError) {
                        alert("Sticky Notes are only available on regular web pages.");
                      }
                    });
                  }
                });
              }}
            >
              🗒️ Show Sticky Notes
            </button>
            <button
              className="app-menu-btn"
              onClick={() => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_STICKY_NOTES" }, () => {
                      if (chrome.runtime.lastError) {
                        alert("Sticky Notes are only available on regular web pages.");
                      }
                    });                  }
                });
              }}
            >
              ➕ New Sticky Note
            </button>
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
      {page === "about" && <About />}
      {page === "privacy" && <PrivacyPolicy />}
      {page === "contact" && <Contact />}
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