import { useState, useEffect } from "react";

export default function StudyTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15); // Added state for long break minutes
  const [mode, setMode] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);

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
          setLongBreakMinutes(data.longBreakMinutes); 
          setCycleCount(data.cycleCount);
          setCyclesBeforeLongBreak(data.cyclesBeforeLongBreak);
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

  const progress = secondsLeft / (
    mode === "work"
      ? workMinutes * 60
      : breakMinutes * 60
  );

  const updatePomodoroSettings = (longBreakMinutes: number, cyclesBeforeLongBreak: number) => {
    chrome.runtime.sendMessage({
      type: "SET_POMODORO_SETTINGS",
      workMinutes,
      breakMinutes,
      longBreakMinutes,
      cyclesBeforeLongBreak
    });
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
      <div
        style={{
          marginBottom: 18,
          padding: "12px 0",
          background: "#f6f6f6",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(16,185,129,0.07)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px 12px",
          alignItems: "center",
          justifyItems: "center"
        }}
      >
        <div style={{ textAlign: "left", width: "100%" }}>
          <label style={{ fontWeight: 600, color: "#11916c", display: "flex", alignItems: "center", gap: 6 }}>
            <span role="img" aria-label="Work">💼</span> Work Duration
          </label>
          <input
            type="number"
            min={1}
            value={workMinutes}
            onChange={handleWorkChange}
            style={{
              width: 70,
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "1em",
              marginTop: 6,
              background: "#fff",
              color: "#222"
            }}
          />{" "}
          <span style={{ color: "#888", fontSize: "0.95em" }}>minutes</span>
        </div>
        <div style={{ textAlign: "left", width: "100%" }}>
          <label style={{ fontWeight: 600, color: "#2563eb", display: "flex", alignItems: "center", gap: 6 }}>
            <span role="img" aria-label="Break">☕</span> Break Duration
          </label>
          <input
            type="number"
            min={1}
            value={breakMinutes}
            onChange={handleBreakChange}
            style={{
              width: 70,
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "1em",
              marginTop: 6,
              background: "#fff",
              color: "#222"
            }}
          />{" "}
          <span style={{ color: "#888", fontSize: "0.95em" }}>minutes</span>
        </div>
        <div style={{ textAlign: "left", width: "100%" }}>
          <label style={{ fontWeight: 600, color: "#b91c1c", display: "flex", alignItems: "center", gap: 6 }}>
            <span role="img" aria-label="Long Break">🛌</span> Long Break Duration
          </label>
          <input
            type="number"
            min={1}
            value={longBreakMinutes}
            onChange={e => {
              const val = Math.max(1, Math.floor(Number(e.target.value)));
              setLongBreakMinutes(val);
              updatePomodoroSettings(val, cyclesBeforeLongBreak);
            }}
            style={{
              width: 70,
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "1em",
              marginTop: 6,
              background: "#fff",
              color: "#222"
            }}
          />{" "}
          <span style={{ color: "#888", fontSize: "0.95em" }}>minutes</span>
        </div>
        <div style={{ textAlign: "left", width: "100%" }}>
          <label style={{ fontWeight: 600, color: "#f59e42", display: "flex", alignItems: "center", gap: 6 }}>
            <span role="img" aria-label="Cycles">🔁</span> Cycles Before Long Break
          </label>
          <input
            type="number"
            min={1}
            value={cyclesBeforeLongBreak}
            onChange={e => {
              const val = Math.max(1, Math.floor(Number(e.target.value)));
              setCyclesBeforeLongBreak(val);
              updatePomodoroSettings(longBreakMinutes, val);
            }}
            style={{
              width: 70,
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "1em",
              marginTop: 6,
              background: "#fff",
              color: "#222"
            }}
          />
          <span style={{ color: "#888", fontSize: "0.95em" }}>cycles</span>
        </div>
      </div>
      
      <div style={{
        width: "100%",
        height: "10px",
        background: "#eee",
        borderRadius: "6px",
        marginBottom: "12px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: "#10b981",
          transition: "width 0.3s"
        }} />
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
      <div style={{ marginBottom: 8, color: "#2563eb" }}>
        Cycle {cycleCount} / {cyclesBeforeLongBreak}
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

      <div
        style={{
          background: "linear-gradient(90deg, #f9fafb 80%, #e0f7fa 100%)",
          borderRadius: "14px",
          boxShadow: "0 2px 12px rgba(16,185,129,0.07)",
          padding: "20px 20px 18px 20px",
          margin: "28px 0 0 0",
          textAlign: "left",
          fontSize: "1.05em",
          color: "#222",
          border: "1.5px solid #e0e7ff"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: "1.6em" }}>📘</span>
          <h3 style={{
            margin: 0,
            color: "#11916c",
            fontSize: "1.18em",
            fontWeight: 700,
            letterSpacing: "0.5px"
          }}>
            How to Use the Pomodoro Timer
          </h3>
        </div>
        <ul style={{ paddingLeft: 22, margin: 0, lineHeight: "1.8" }}>
          <li>
            <span style={{ fontWeight: 600, color: "#11916c" }}>💼 Work Duration:</span>
            <span style={{ color: "#222" }}> Set how long each focused work session lasts <span style={{ color: "#888" }}>(default: 25 min)</span>.</span>
          </li>
          <li>
            <span style={{ fontWeight: 600, color: "#2563eb" }}>☕ Break Duration:</span>
            <span style={{ color: "#222" }}> Set the length of your short break after each work session <span style={{ color: "#888" }}>(default: 5 min)</span>.</span>
          </li>
          <li>
            <span style={{ fontWeight: 600, color: "#b91c1c" }}>🛌 Long Break Duration:</span>
            <span style={{ color: "#222" }}> After several cycles, take a longer break to recharge <span style={{ color: "#888" }}>(default: 15 min)</span>.</span>
          </li>
          <li>
            <span style={{ fontWeight: 600, color: "#f59e42" }}>🔁 Cycles Before Long Break:</span>
            <span style={{ color: "#222" }}> Number of work/break cycles before a long break <span style={{ color: "#888" }}>(default: 4)</span>.</span>
          </li>
          <li style={{ marginTop: 10 }}>
            <span style={{ fontWeight: 600, color: "#10b981" }}>How it works:</span>
            <span style={{ color: "#222" }}> Start the timer. Work until the timer ends, then take a break. After several cycles, enjoy a long break. The timer auto-advances and notifies you.</span>
          </li>
          <li>
            <span style={{ fontWeight: 600, color: "#2563eb" }}>Tip:</span>
            <span style={{ color: "#222" }}> Stay focused during work sessions, avoid distractions, and use breaks to relax. Adjust durations to fit your study style!</span>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: 18, color: "#888", fontSize: "0.95em" }}>
        {mode === "work"
          ? `Work for ${workMinutes} minutes, then take a ${breakMinutes} minute break.`
          : `Take a short break, then get back to work!`}
      </div>
    </div>
  );
}