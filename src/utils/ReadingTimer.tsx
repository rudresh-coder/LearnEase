import { useEffect, useState } from "react";

export default function ReadingTimer() {
    const [active, setActive] = useState(false);
    const [paused, setPaused] = useState(false);
    const [readingTime, setReadingTime] = useState(0);

    // On mount, check if timer is running for the current tab
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab && tab.url) {
                chrome.storage.sync.get("readingSessions", (data: { readingSessions?: { url: string; timeSpent: number; lastAccessed: string; }[] }) => {
                    const session = (data.readingSessions || []).find((s: { url: string; timeSpent: number; lastAccessed: string }) => s.url === tab.url);
                    if (session && session.timeSpent > 0) {
                        setActive(true);
                        setReadingTime(session.timeSpent);
                        // Optionally, check paused state from storage if you want to persist it
                    } else {
                        setActive(false);
                        setReadingTime(0);
                    }
                });
            }
        });
    }, []);

    // Poll readingSessions from storage every second while active and not paused
    useEffect(() => {
        let interval: number | null = null;
        function fetchReadingTime() {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (tab && tab.url) {
                    chrome.storage.sync.get("readingSessions", (data: { readingSessions?: { url: string; timeSpent: number; lastAccessed: string; }[] }) => {
                        const session = (data.readingSessions || []).find((s: { url: string; timeSpent: number; lastAccessed: string }) => s.url === tab.url);
                        setReadingTime(session ? session.timeSpent : 0);
                    });
                }
            });
        }
        if (active && !paused) {
            interval = window.setInterval(fetchReadingTime, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [active, paused]);

    const handleStart = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (
                tab.id &&
                tab.url &&
                /^https?:/.test(tab.url) &&
                !tab.url.startsWith("chrome://") &&
                !tab.url.startsWith("chrome-extension://")
            ) {
                chrome.tabs.sendMessage(tab.id, { type: "START_READING" }, () => {
                    if (chrome.runtime.lastError) {
                        alert("Reading Timer is only available on regular web pages. Please open a supported page.");
                    }
                });
                setActive(true);
                setPaused(false);
            } else {
                alert("Please open a regular webpage (not a Chrome page, new tab, or extension page) to use the Reading Timer.");
            }
        });
    };

    const handleStop = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (
                tab.id &&
                tab.url &&
                /^https?:/.test(tab.url) &&
                !tab.url.startsWith("chrome://") &&
                !tab.url.startsWith("chrome-extension://")
            ) {
                chrome.tabs.sendMessage(tab.id, { type: "STOP_READING" }, () => {
                    if (chrome.runtime.lastError) {
                        alert("Reading Timer is only available on regular web pages. Please open a supported page.");
                    }
                });
                setActive(false);
                setPaused(false);
            } else {
                alert("Please open a regular webpage (not a Chrome page, new tab, or extension page) to use the Reading Timer.");
            }
        });
    };

    const handlePause = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: "PAUSE_READING" });
                setPaused(true);
            }
        });
    };

    const handleResume = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: "RESUME_READING" });
                setPaused(false);
            }
        });
    };

    // Format time as mm:ss or hh:mm:ss
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
                {formatTime(readingTime)}
            </div>
            <div style={{ color: "#444", fontSize: "1.1em", marginBottom: 18 }}>
                {active ? (paused ? "Paused" : "Tracking...") : "Stopped"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                {!active && (
                    <button
                        className="wordcounter-btn wordcounter-btn-main"
                        onClick={handleStart}
                    >
                        <span className="gradient"></span>
                        <span className="label">▶ Start Reading</span>
                        <span className="transition"></span>
                    </button>
                )}
                {active && !paused && (
                    <button
                        className="wordcounter-btn wordcounter-btn-main"
                        onClick={handlePause}
                    >
                        <span className="gradient"></span>
                        <span className="label">⏸ Pause</span>
                        <span className="transition"></span>
                    </button>
                )}
                {active && paused && (
                    <button
                        className="wordcounter-btn wordcounter-btn-main"
                        onClick={handleResume}
                    >
                        <span className="gradient"></span>
                        <span className="label">▶ Resume</span>
                        <span className="transition"></span>
                    </button>
                )}
                {active && (
                    <button
                        className="wordcounter-btn wordcounter-btn-main"
                        onClick={handleStop}
                    >
                        <span className="gradient"></span>
                        <span className="label">⏹ Stop Reading</span>
                        <span className="transition"></span>
                    </button>
                )}
            </div>
        </div>
    );
}