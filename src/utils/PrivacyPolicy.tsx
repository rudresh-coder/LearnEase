export default function PrivacyPolicy() {
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
        <h2>Privacy Policy</h2>
        <p>
          <span className="highlight">LearnEase</span> values your privacy and is committed to protecting your personal information.
        </p>
        <div className="section-title">Data Collection</div>
        <p>
          This extension does <b>not</b> collect, transmit, or share any personal data. All information (such as journal entries, study stats, and settings) is stored locally in your browser using Chrome's <code>storage.local</code> API.
        </p>
        <div className="section-title">Data Usage</div>
        <p>
          Your data is used solely for providing extension features and is never sent to any external server or third party.
        </p>
        <div className="section-title">Permissions</div>
        <p>
          LearnEase requests only the minimum permissions required to function (such as storage and notifications).
        </p>
        <div className="section-title">Data Control</div>
        <p>
          You have full control over your data and can delete your journal entries and stats at any time from within the extension.
        </p>
        <div className="section-title">Third Parties</div>
        <p>
          LearnEase does not use third-party analytics, advertising, or tracking services.
        </p>
        <div style={{ color: "#888", marginTop: 12 }}>Last updated: October 2025</div>
      </div>
    </div>
  );
}