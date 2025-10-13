export default function About() {
  return (
    <div style={{ position: "relative" }}>
      <div className="app-ripple-bg" style={{
        borderRadius: 16,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 0
      }}>
        <svg width="100vw" height="100vh" viewBox="0 0 400 400" style={{ position: "absolute", top: 0, left: 0 }}>
          {[...Array(6)].map((_, i) => (
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
      <div className="info-card" style={{ position: "relative", zIndex: 1 }}>
        <h2>About LearnEase</h2>
        <p>
          <span className="highlight">LearnEase</span> is your all-in-one productivity toolkit for students.
        </p>
        <div className="section-title">Features</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>• Word Counter & Daily Journal</li>
          <li>• Reading Timer</li>
          <li>• Website Blocker</li>
          <li>• Pomodoro Timer</li>
          <li>• Study Stats & Achievements</li>
        </ul>
        <div className="section-title">Why LearnEase?</div>
        <p>
          Designed to help you stay focused, track your progress, and build better study habits.<br />
          <span className="highlight">All your data is stored locally and never shared.</span>
        </p>
        <div className="section-title">Tech Stack</div>
        <p>
          Built with React, TypeScript, and Vite.
        </p>
        <div style={{ color: "#888", marginTop: 12 }}>Version 1.0.0</div>
      </div>
    </div>
  );
}