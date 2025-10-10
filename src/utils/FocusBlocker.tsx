import { useEffect, useState } from "react";

const BLOCKED_SITES = [
    "facebook.com",
    "x.com",
    "instagram.com",
    "reddit.com",
    "youtube.com",
    "tiktok.com",
    "netflix.com",
    "hulu.com",
    "in.pinterest.com",
    "tumblr.com"
];

export default function FocusBlocker() {
    const [active, setActive] = useState(false);

    // Sync UI with Chrome storage on mount and when popup is opened
    useEffect(() => {
        chrome.storage.sync.get("focusBlockerActive", (data) => {
            setActive(!!data.focusBlockerActive);
        });
    }, []);

    const handleToggle = () => {
        chrome.storage.sync.set({ focusBlockerActive: !active }, () => {
            setActive(!active);
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
            boxShadow: "0 2px 12px rgba(16, 185, 129, 0.07)",
            textAlign: "center"
        }}>
            <h2 style={{ color: "#10b981", marginBottom: 18 }}>🚫 Focus Blocker</h2>
            <div style={{ marginBottom: 16, fontWeight: 500, color: active ? "#11916c" : "#b91c1c" }}>
                {active
                    ? "Focus Blocker is ON. Distracting sites are blocked."
                    : "Focus Blocker is OFF. Distracting sites are accessible."}
            </div>
            <ul style={{ textAlign: "left", marginBottom: 18 }}>
                {BLOCKED_SITES.map(site => (
                    <li key={site} style={{ color: "#11916c" }}>{site}</li>
                ))}
            </ul>
            <button
                className="wordcounter-btn wordcounter-btn-main"
                style={{
                    background: active ? "#11916c" : "#b91c1c",
                    color: "#fff"
                }}
                onClick={handleToggle}
            >
                <span className="gradient"></span>
                <span className="label">
                    {active ? "Turn OFF Focus Blocker" : "Turn ON Focus Blocker"}
                </span>
                <span className="transition"></span>
            </button>
        </div>
    );
}