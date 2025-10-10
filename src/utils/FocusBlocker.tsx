import { useState } from "react";

const BLOCKED_SITES = [
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "reddit.com",
    "youtube.com",
    "tiktok.com",
    "netflix.com",
    "hulu.com",
    "pinterest.com",
    "tumblr.com"
]

export default function FocusBlocker() {
    const [active, setActive] = useState(false);

    const handleStart = () => {
        chrome.storage.sync.set({ focusBlockerActive: true });
        setActive(true);
    };

    const handleStop = () => {
        chrome.storage.sync.set({ focusBlockerActive: false });
        setActive(false);
    };

    return (
        <div style={{ width: 340,
            margin: "0 auto",
            padding: 18,
            fontFamily: "sans-serif",
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 12px rgba(16, 185, 129, 0.07)",
            textAlign: "center"
         }}>
            <h2 style={{ color: "#10b981", marginBottom: 18 }}>🚫 Focus Blocker</h2>
            <div style={{ marginBottom: 16 }}>
                {active ? "Blocking distracting sites during study time."
                : "Click Start to block distracting sites while you study."}
            </div>
            <ul style={{ textAlign: "left", marginBottom: 18 }}>
                {BLOCKED_SITES.map(site => (
                    <li key={site} style={{ color: "#11916c" }}>{site}</li>
                ))}
            </ul>
            <button
            className="word-counter-btn wordcounter-btn-main"
            onClick={active ? handleStop : handleStart}>
                <span className="gradient"></span>
                <span className="label">{active ? "⏹ Stop Blocking" : "▶ Start Blocking"}</span>
                <span className="transition"></span>
            </button> 
         </div>
    )
}