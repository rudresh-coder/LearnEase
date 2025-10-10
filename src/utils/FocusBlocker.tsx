import { useEffect, useState } from "react";

const DEFAULT_BLOCKED_SITES = [
    "facebook.com",
    "x.com",
    "instagram.com",
    "reddit.com",
    "tiktok.com",
    "netflix.com",
    "hulu.com",
    "in.pinterest.com",
    "tumblr.com"
];

export default function FocusBlocker() {
    const [active, setActive] = useState(false);
    const [customSites, setCustomSites] = useState<string[]>([]);
    const [newSite, setNewSite] = useState("");

    // Load state and custom sites on mount
    useEffect(() => {
        chrome.storage.sync.get(["focusBlockerActive", "focusBlockerCustomSites"], (data) => {
            setActive(!!data.focusBlockerActive);
            setCustomSites(data.focusBlockerCustomSites || []);
        });
    }, []);

    // Add a custom site
    const handleAddSite = () => {
        const site = newSite.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        if (!site || customSites.includes(site) || DEFAULT_BLOCKED_SITES.includes(site)) return;
        const updated = [...customSites, site];
        chrome.storage.sync.set({ focusBlockerCustomSites: updated }, () => {
            setCustomSites(updated);
            setNewSite("");
        });
    };

    // Remove a custom site
    const handleRemoveSite = (site: string) => {
        const updated = customSites.filter(s => s !== site);
        chrome.storage.sync.set({ focusBlockerCustomSites: updated }, () => {
            setCustomSites(updated);
        });
    };

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
            <h2 style={{ color: "#10b981", marginBottom: 18 }}>🚫 Website Blocker</h2>
            <div style={{ marginBottom: 16, fontWeight: 500, color: active ? "#11916c" : "#b91c1c" }}>
                {active
                    ? "Website Blocker is ON. Distracting sites are blocked."
                    : "Website Blocker is OFF. Distracting sites are accessible."}
            </div>
            <div style={{ marginBottom: 12, fontWeight: 500 }}>Blocked Sites:</div>
            <ul style={{ textAlign: "left", marginBottom: 18 }}>
                {DEFAULT_BLOCKED_SITES.map(site => (
                    <li key={site} style={{ color: "#11916c" }}>{site}</li>
                ))}
                {customSites.map(site => (
                    <li key={site} style={{ color: "#b91c1c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{site}</span>
                        <button
                            style={{
                                marginLeft: 8,
                                background: "#ef4444",
                                border: "none",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0
                            }}
                            title="Remove"
                            onClick={() => handleRemoveSite(site)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ display: "block" }}
                            >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{ marginBottom: 18 }}>
                <input
                    type="text"
                    value={newSite}
                    onChange={e => setNewSite(e.target.value)}
                    placeholder="Add site (e.g. example.com)"
                    style={{
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        fontSize: "1em",
                        marginRight: 8,
                        width: "65%"
                    }}
                />
                <button
                    style={{
                        background: "#11916c",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "7px 14px",
                        fontWeight: 500,
                        cursor: "pointer"
                    }}
                    onClick={handleAddSite}
                    disabled={!newSite.trim()}
                >
                    Add
                </button>
            </div>
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
                    {active ? "Turn OFF Blocker" : "Turn ON Blocker"}
                </span>
                <span className="transition"></span>
            </button>
        </div>
    );
}