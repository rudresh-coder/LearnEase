import { useState, useEffect } from "react";

export default function StudyTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);

  // Poll background for timer state every second
  useEffect(() => {
    let interval: number | null = null;
    function fetchState() {
      chrome.runtime.sendMessage({ type: "GET_POMODORO_STATE" }, (data) => {
        if (data) {
          setMode(data.mode);
          setSecondsLeft(data.secondsLeft);
          setRunning(data.running);
          setWorkMinutes(data.workMinutes);
          setBreakMinutes(data.breakMinutes);
        }
      });
    }
    fetchState();
    interval = window.setInterval(fetchState, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleStart = () => {
    chrome.runtime.sendMessage({ type: "START_POMODORO" });
  };
  const handlePause = () => {
    chrome.runtime.sendMessage({ type: "PAUSE_POMODORO" });
  };
  const handleReset = () => {
    chrome.runtime.sendMessage({ type: "RESET_POMODORO" });
  };
  const handleWorkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.floor(Number(e.target.value)));
    chrome.runtime.sendMessage({ type: "SET_POMODORO_DURATIONS", workMinutes: val, breakMinutes });
  };
  const handleBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.floor(Number(e.target.value)));
    chrome.runtime.sendMessage({ type: "SET_POMODORO_DURATIONS", workMinutes, breakMinutes: val });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div style={{
      width: 340,
      margin: "0 auto",
      padding: 18,
      fontFamily: "sans-serif",
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
      textAlign: "center"
    }}>
      <h2 style={{ color: "#10b981", marginBottom: 18 }}>🍅 Pomodoro Timer</h2>
      <div style={{ marginBottom: 14 }}>
        <label style={{ marginRight: 8 }}>
          Work:{" "}
          <input
            type="number"
            min={1}
            value={workMinutes}
            onChange={handleWorkChange}
            style={{
              width: 48,
              padding: "4px 7px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "1em",
              marginRight: 4
            }}
          /> min
        </label>
        <label>
          Break:{" "}
          <input
            type="number"
            min={1}
            value={breakMinutes}
            onChange={handleBreakChange}
            style={{
              width: 48,
              padding: "4px 7px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "1em"
            }}
          /> min
        </label>
      </div>
      <div style={{
        fontSize: "2.5em",
        fontWeight: 700,
        color: mode === "work" ? "#11916c" : "#2563eb",
        marginBottom: 16
      }}>
        {formatTime(secondsLeft)}
      </div>
      <div style={{ color: "#444", fontSize: "1.1em", marginBottom: 18 }}>
        {mode === "work" ? "Focus Session" : "Break Time"}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {!running && (
          <button className="wordcounter-btn wordcounter-btn-main" onClick={handleStart}>
            <span className="gradient"></span>
            <span className="label">▶ Start</span>
            <span className="transition"></span>
          </button>
        )}
        {running && (
          <button className="wordcounter-btn wordcounter-btn-main" onClick={handlePause}>
            <span className="gradient"></span>
            <span className="label">⏸ Pause</span>
            <span className="transition"></span>
          </button>
        )}
        <button className="wordcounter-btn wordcounter-btn-main" onClick={handleReset}>
          <span className="gradient"></span>
          <span className="label">⏹ Reset</span>
          <span className="transition"></span>
        </button>
      </div>
      <div style={{ marginTop: 18, color: "#888", fontSize: "0.95em" }}>
        {mode === "work"
          ? `Work for ${workMinutes} minutes, then take a ${breakMinutes} minute break.`
          : `Take a short break, then get back to work!`}
      </div>
    </div>
  );
}