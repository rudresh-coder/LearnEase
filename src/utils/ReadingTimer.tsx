import { useEffect, useState } from "react";

export default function ReadingTimer() {
    const [active, setActive] = useState(false);
    // const [paused, setPaused] = useState(false);
    const [readingTime, setReadingTime] = useState(0);

    // Listen for background messages
    // useEffect(() => {
    //     interface Message {
    //         type: "TAB_SWITCHED" | "WINDOW_FOCUS";
    //         state?: "idle" | "locked";
    //         focused?: boolean;
    //     }

    //     // function handleMessage(msg: Message) {
    //     //     if (msg.type === "TAB_SWITCHED" || (msg.type === "WINDOW_FOCUS" && !msg.focused)) {
    //     //         setPaused(true);
    //     //     }
    //     //     if (msg.type === "WINDOW_FOCUS" && msg.focused) {
    //     //         setPaused(false);
    //     //     }
    //     // }
    //     chrome.runtime.onMessage.addListener(handleMessage);
    //     return () => {
    //         chrome.runtime.onMessage.removeListener(handleMessage);
    //     };
    // }, []);

    // Check idle state
    // useEffect(() => {
    //     let idleInterval: number | null = null;
    //     if (active) {
    //         idleInterval = window.setInterval(() => {
    //             if (chrome?.idle?.queryState) {
    //                 chrome.idle.queryState(60, (state) => { // 60 seconds threshold
    //                     if (state === "idle" || state === "locked") setPaused(true);
    //                     else setPaused(false);
    //                 });
    //             }
    //         }, 5000); // check every 5 seconds
    //     }
    //     return () => {
    //         if (idleInterval) clearInterval(idleInterval);
    //     };
    // }, [active]);

    // Poll readingSessions from storage every second while active
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
        if (active) {
            interval = window.setInterval(fetchReadingTime, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [active]);

    const handleStart = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            // Only send to http/https pages and not extension or chrome pages
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
            } else {
                alert("Please open a regular webpage (not a Chrome page, new tab, or extension page) to use the Reading Timer.");
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
                {active ? "Tracking..." : "Paused"}
            </div>
            <button
                className="wordcounter-btn wordcounter-btn-main"
                onClick={() => active ? handleStop() : handleStart()}
            >
                <span className="gradient"></span>
                <span className="label">{active ? "⏹ Stop Reading" : "▶ Start Reading"}</span>
                <span className="transition"></span>
            </button>
        </div>
    );
}