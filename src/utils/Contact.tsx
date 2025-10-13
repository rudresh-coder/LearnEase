export default function Contact() {
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
        <h2 style={{ background: "linear-gradient(90deg, #f59e42 40%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Contact</h2>
        <p>
          For feedback, support, or suggestions:
        </p>
        <p>
          <b>Email:</b> <a className="contact-link" href="mailto:tcs.summarizer@gmail.com">tcs.summarizer@gmail.com</a><br />
          <b>GitHub:</b> <a className="contact-link" href="https://github.com/rudresh-coder/LearnEase" target="_blank" rel="noopener noreferrer">github.com/rudresh-coder/LearnEase</a>
        </p>
        <p style={{ color: "#888", marginTop: 12, fontSize: "0.98em" }}>
          We aim to respond within 2 business days.<br />
          For common questions, check our <a className="contact-link" href="https://github.com/rudresh-coder/LearnEase#readme" target="_blank" rel="noopener noreferrer">FAQ</a>.
        </p>
      </div>
    </div>
  );
}