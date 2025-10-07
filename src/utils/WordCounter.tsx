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

  // Derived stats
  const words: number = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characters: number = text.length;
  const sentences: number = text.split(/[.!?]+/).filter(s => s.trim() !== "").length;
  const paragraphs: number = text.split(/\n+/).filter(p => p.trim() !== "").length;

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

  const handleSaveToJournal = (): void => {
    const entry: JournalEntry = {
      text,
      date: new Date().toLocaleDateString(),
    };

    if (chrome?.storage?.sync) {
      chrome.storage.sync.get("journal", (data: { journal?: JournalEntry[] }) => {
        const journal: JournalEntry[] = data.journal || [];
        journal.push(entry);
        chrome.storage.sync.set({ journal });
        alert("Saved to Journal!");
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
        <button onClick={handleSaveToJournal} className="wordcounter-btn wordcounter-btn-primary">
          Save to Journal
        </button>
        <button onClick={handleCopy} className="wordcounter-btn wordcounter-btn-secondary">
          Copy Text
        </button>
      </div>
    </div>
  );
}
