export default function Contact() {
    return (
      <div style={{
        width: 340,
        margin: "0 auto",
        padding: 18,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
        fontFamily: "sans-serif",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#f59e42", marginBottom: 18 }}>Contact</h2>
        <p>
          For feedback, support, or suggestions:<br />
          <b>Email:</b> <a href="mailto:tcs.summarizer@gmail.com">tcs.summarizer@gmail.com</a><br />
          <b>GitHub:</b> <a href="https://github.com/rudresh-coder/LearnEase" target="_blank" rel="noopener noreferrer">github.com/rudresh-coder/LearnEase</a>
        </p>
      </div>
    );
  }