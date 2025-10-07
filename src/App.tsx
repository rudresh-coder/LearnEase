import { useEffect, useState } from "react";
import { countWords } from "./utils/wordCounter";

export default function App() {
  const [text, setText] = useState("");

  //Load saved notes
  useEffect(() => {
    chrome.storage.local.get(["le_notes"], (res) => {
      if (typeof res.le_notes === "string") setText(res.le_notes);
    });
  }, []);

  //Save notes (debounced)

  useEffect(() => {
    const t = setTimeout(() => {
      chrome.storage.local.set({ le_notes: text });
    }, 300);
    return () => clearTimeout(t);
  }, [text]);

  const words = countWords(text);
  const chars = text.length;

  return (
    <div style={{ width: 480, height: 560, overflowY: "auto", padding: 16, fontFamily: "sans-serif" }}>
      <h2>LearnEase</h2>

      <label style={{ display: "block", fontWeight:600, marginBottom: 8 }}>
        Notes / Essay
      </label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
      style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
      placeholder="Type your notes here..."/>

      <div style={{ marginTop:8, display: "flex", gap: 12 }}>
        <span>words: {words}</span>
        <span>Chars: {chars}</span>
        <button
          onClick={() => setText("")}
          style={{ marginLeft: "auto", padding: "0.3em 0.6em" }}>Clear</button>
      </div>

      <hr style={{ margin: "12px 0" }} />

      <button onClick={() => {
        chrome.runtime.sendMessage({ type: "PING" }, (resp) => {
          console.log("bg response:", resp);
        });
      }}>Ping background</button>
    </div>
  );
}