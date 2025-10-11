import { useState, useEffect } from "react";
import type { JSX, ChangeEvent } from "react";
import "./WordCounter.css";

interface JournalEntry {
  text: string;
  date: string;
}

export default function WordCounter(): JSX.Element {
  const [text, setText] = useState<string>("");
  const [goal, setGoal] = useState<number>(500);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [showJournal, setShowJournal] = useState(false);

  // Derived stats
  const words: number = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characters: number = text.length;
  const sentences: number = text.split(/[.!?]+/).filter(s => s.trim() !== "").length;
  const paragraphs: number = text.split(/\r?\n\s*\r?\n/).filter(p => p.trim() !== "").length;  
  const readingTime: number = Math.ceil(words / 200); // avg 200 wpm
  const progress: number = Math.min((words / goal) * 100, 100);

  // Load saved goal
  useEffect(() => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.get("wordGoal", (data: { wordGoal?: number }) => {
        if (data.wordGoal) setGoal(data.wordGoal);
      });
    }
  }, []);

  // Save goal when updated
  useEffect(() => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ wordGoal: goal });
    }
  }, [goal]);

  useEffect(() => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.get("journal", (data: { journal?: JournalEntry[] }) => {
        setJournal(data.journal || []);
      });
    }
  }, []);

  const handleSaveToJournal = (): void => {
    const entry: JournalEntry = {
      text,
      date: new Date().toLocaleDateString(),
    };

    if (chrome?.storage?.sync) {
      chrome.storage.sync.get("journal", (data: { journal?: JournalEntry[] }) => {
        const journal: JournalEntry[] = data.journal || [];
        journal.push(entry);
        chrome.storage.sync.set({ journal }, () => {
          setJournal([...journal]); // Update state so UI refreshes
          alert("Saved to Journal!");
        });
      });
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditText(journal[idx].text);
  };
  
  const handleEditSave = (idx: number) => {
    const updated = [...journal];
    updated[idx] = { ...updated[idx], text: editText };
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ journal: updated }, () => {
        setJournal(updated);
        setEditingIdx(null);
        setEditText("");
      });
    }
  };

  const handleDelete = (idx: number) => {
    if (!window.confirm("Delete this journal entry?")) return;
    const updated = journal.filter((_, i) => i !== idx);
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ journal: updated }, () => {
        setJournal(updated);
      });
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);
  };

  const handleGoalChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGoal(Number(e.target.value));
  };

  const handleCopy = (): void => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="wordcounter-container">
      <h2 className="wordcounter-title">📖 Word Counter</h2>

      <textarea
        className="wordcounter-textarea"
        value={text}
        onChange={handleTextChange}
        placeholder="Start typing here..."
      />

      <div className="wordcounter-stats">
        <span>Words: {words}</span>
        <span>Characters: {characters}</span>
        <span>Sentences: {sentences}</span>
        <span>Paragraphs: {paragraphs}</span>
        <span>Reading Time: ~{readingTime} min</span>
      </div>

      <div className="wordcounter-goal">
        <label>🎯 Goal: {goal} words</label>
        <input
          type="number"
          value={goal}
          onChange={handleGoalChange}
          className="wordcounter-input"
        />
        <div className="wordcounter-progressbar">
          <div
            className="wordcounter-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="wordcounter-progress-text">{Math.floor(progress)}% completed</p>
      </div>

      <div className="wordcounter-buttons">
        <button onClick={handleSaveToJournal} className="wordcounter-btn wordcounter-btn-main">
          <span className="gradient"></span>
          <span className="label">Save Journal</span>
          <span className="transition"></span>
        </button>
        <button onClick={handleCopy} className="wordcounter-btn wordcounter-btn-secondary">
          Copy Text
        </button>
        <button
          onClick={() => setShowJournal(true)}
          className="wordcounter-btn wordcounter-btn-secondary"
        >
          View Journal
        </button>
      </div>

      {showJournal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(37,99,235,0.13)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s"
          }}
        >
          <div
            style={{
              position: "relative",
              background: "#fff",
              color: "#222",
              borderRadius: 18,
              boxShadow: "0 8px 32px rgba(37,99,235,0.18)",
              padding: "32px 28px 24px 28px",
              minWidth: 340,
              maxWidth: 440,
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1.5px solid #2563eb"
            }}
          >
            <button
              onClick={() => setShowJournal(false)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.09)"
              }}
              aria-label="Close"
              title="Close"
            >
              &times;
            </button>
            <h2 style={{ marginTop: 0, marginBottom: 18, color: "#2563eb", fontWeight: 700, fontSize: "1.35em", letterSpacing: "0.5px" }}>
              Journal Entries
            </h2>
            <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
              {journal.length === 0 && <div style={{ color: "#888", fontStyle: "italic" }}>No entries yet.</div>}
              {journal.map((entry, idx) => (
                <li
                  key={idx}
                  style={{
                    marginBottom: 18,
                    background: editingIdx === idx ? "#e0e7ff" : "#f6f6f6",
                    padding: 14,
                    borderRadius: 10,
                    color: "#222",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    border: editingIdx === idx ? "1.5px solid #2563eb" : "none",
                    position: "relative"
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: "1em", color: "#2563eb" }}>{entry.date}</div>
                  {editingIdx === idx ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: 60,
                          marginBottom: 10,
                          borderRadius: 6,
                          border: "1px solid #2563eb",
                          padding: 8,
                          fontSize: "1em",
                          background: "#fff",
                          color: "#222"
                        }}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => handleEditSave(idx)}
                          className="wordcounter-btn wordcounter-btn-primary"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingIdx(null); setEditText(""); }}
                          className="wordcounter-btn wordcounter-btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ whiteSpace: "pre-wrap", marginBottom: 10, fontSize: "1em" }}>{entry.text}</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => handleEdit(idx)}
                          className="wordcounter-btn wordcounter-btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="wordcounter-btn wordcounter-btn-secondary"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
