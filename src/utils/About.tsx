export default function About() {
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
        <h2 style={{ color: "#2563eb", marginBottom: 18 }}>About LearnEase</h2>
        <p>
          LearnEase is a smart student toolkit for productivity and focus.<br />
          Built with React, TypeScript, and Vite.<br />
          Version 1.0.0
        </p>
      </div>
    );
  }