import { useEffect, useRef, useState } from "react";

export default function ReadingTimer() {
    const [active, setActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);

    //Start/stop timer logic
    useEffect(() => {
        if (active) {
            timerRef.current = window.setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [active]);

    //Format time as mm:ss or hh:MM:ss
    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return [
            h > 0 ? String(h).padStart(2, "0") : null,
            String(m).padStart(2, "0"),
            String(s).padStart(2, "0"),
        ].filter(Boolean).join(":");
    };

    //Save session to chrome.storage.sync (expand for per-URL tracking)
    const handleStop = () => {
        setActive(false);
        const url = window.location.href;
        const session = {
            url,
            timeSpent: Math.round(seconds / 60),
            lastAccessed: new Date().toLocaleDateString(),
        };
        if (chrome?.storage?.sync) {
            chrome.storage.sync.get("readingSessions", (data: { readingSessions?: { url: string; timeSpent: number; lastAccessed: string; }[] }) => {
                const sessions = data.readingSessions || [];
                sessions.push(session);
                chrome.storage.sync.set({ readingSessions: sessions });
            });
        }
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
          <h2 style={{ color: "#10b981", marginBottom: 18 }}>⏱️ Reading Timer</h2>
          <div style={{
            fontSize: "2.5em",
            fontWeight: 700,
            color: "#11916c",
            marginBottom: 16
          }}>
            {formatTime(seconds)}
          </div>
          <div style={{ color: "#444", fontSize: "1.1em", marginBottom: 18 }}>
            {active ? "Tracking..." : "Paused"}
          </div>
          <button
            className="wordcounter-btn wordcounter-btn-main"
            onClick={() => active ? handleStop() : setActive(true)}
          >
            <span className="gradient"></span>
            <span className="label">{active ? "⏹ Stop Reading" : "▶ Start Reading"}</span>
            <span className="transition"></span>
          </button>
        </div>
      );
}