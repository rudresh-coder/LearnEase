function computeStats(text) {
    const wordsArr = text.trim().match(/\b[\w'-]+\b/g) || [];
    const words = wordsArr.length;
    const uniqueWords = new Set(wordsArr.map(w => w.toLowerCase())).size;
    const sentences = text.split(/[.!?]+(?=\s|$)/g).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/g).filter(p => p.trim().length > 0) || (text.trim() ? 1 : 0);
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, "").length;
    const totalWordChars = wordsArr.reduce((acc, w) => acc + w.length, 0);
    const avgWordLength = words ? totalWordChars / words : 0;
    const avgWordsPerSentence = sentences ? words / sentences : 0;
    const readingTimeMin = words ? +(words / 200).toFixed(2) : 0;
    return { words, uniqueWords, sentences, paragraphs, chars, charsNoSpaces, avgWordLength, avgWordsPerSentence, readingTimeMin };
  }
  
  function removeTooltip() {
    const tip = document.getElementById("learnease-tooltip");
    if (tip) tip.remove();
  }

  function positionTooltip(tip, sel) {
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    let x = rect.left + window.scrollX;
    let y = rect.bottom + window.scrollY + 8;
    tip.style.left = `${Math.min(x, window.innerWidth - tip.offsetWidth - 16)}px`;
    tip.style.top = `${Math.min(y, window.innerHeight - tip.offsetHeight - 16)}px`;
  }

  let pinned = false;
  
  document.addEventListener("mouseup", () => {
    removeTooltip();
    const sel = window.getSelection();
    const text = sel && sel.toString().trim();
    if (!text || text.length < 2) return;
  
    const stats = computeStats(text);
  
    const tip = document.createElement("div");
    tip.id = "learnease-tooltip";
    tip.style.position = "fixed";
    tip.style.zIndex = "999999";
    tip.style.background = "#fff";
    tip.style.color = "#222";
    tip.style.border = "1.5px solid #2563eb";
    tip.style.borderRadius = "12px";
    tip.style.boxShadow = "0 4px 24px rgba(37,99,235,0.13)";
    tip.style.padding = "18px 22px";
    tip.style.fontSize = "15px";
    tip.style.fontFamily = "system-ui, sans-serif";
    tip.style.maxWidth = "340px";
    tip.style.pointerEvents = "auto";
    tip.style.lineHeight = "1.7";
  
    tip.innerHTML = `
      <div style="font-weight:700;font-size:17px;margin-bottom:10px;display:flex;align-items:center;gap:8px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/><path d="M4 4.5C4 5.88071 5.11929 7 6.5 7H20" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/><rect x="4" y="4" width="16" height="15" rx="2.5" stroke="#2563eb" stroke-width="2"/></svg>
        LearnEase Selection Stats
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;margin-bottom:10px;">
        <div>Words:</div><div><b>${stats.words}</b></div>
        <div>Unique:</div><div><b>${stats.uniqueWords}</b></div>
        <div>Chars:</div><div><b>${stats.chars}</b></div>
        <div>No-spaces:</div><div><b>${stats.charsNoSpaces}</b></div>
        <div>Sentences:</div><div><b>${stats.sentences}</b></div>
        <div>Paragraphs:</div><div><b>${stats.paragraphs}</b></div>
        <div>Avg word len:</div><div><b>${stats.avgWordLength.toFixed(2)}</b></div>
        <div>Avg words/sent:</div><div><b>${stats.avgWordsPerSentence.toFixed(2)}</b></div>
        <div>Reading time:</div><div><b>${stats.readingTimeMin} min</b></div>
      </div>
    `;
  
    document.body.appendChild(tip);
  
    // Position near selection
    positionTooltip(tip, sel);

  });
  
  document.addEventListener("scroll", () => {
    const tip = document.getElementById("learnease-tooltip");
    const sel = window.getSelection();
    if (tip && sel && sel.rangeCount) {
      positionTooltip(tip, sel);
    }
  }, true);
  document.addEventListener("mousedown", (e) => {
    const tip = document.getElementById("learnease-tooltip");
    if (tip && !tip.contains(e.target) && !pinned) removeTooltip();
  });

  let readingActive = false;
  let readingPaused = false;
  let readingSeconds = 0;
  let readingTimer = null;

  function saveReadingSession() {
    chrome.storage.sync.get("readingSessions", (data) => {
      const url = window.location.href;
      const session = {
        url,
        timeSpent: readingSeconds,
        lastAccessed: new Date().toLocaleDateString(),
      };
      let sessions = data.readingSessions || [];
      const idx = sessions.findIndex(s => s.url === url);
      if (idx >= 0) {
        sessions[idx] = session;
      } else {
        sessions.push(session);
      }
      chrome.storage.sync.set({ readingSessions: sessions });
    });
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "START_READING") {
      if (!readingActive) {
        readingActive = true;
        readingPaused = false;
        readingTimer = setInterval(() => {
          if (!readingPaused) {
            readingSeconds++;
            saveReadingSession();
          }
        }, 1000);
      }
      sendResponse({ started: true });
    }
    if (msg.type === "STOP_READING") {
      readingActive = false;
      readingPaused = false;
      clearInterval(readingTimer);
      readingTimer = null;
      saveReadingSession();
      readingSeconds = 0;
      sendResponse({ stopped: true });
    }
    if (msg.type === "PAUSE_READING") {
      readingPaused = true;
      sendResponse({ paused: true });
    }
    if (msg.type === "RESUME_READING") {
      readingPaused = false;
      sendResponse({ resumed: true });
    }
  });

  // Stop timer if tab is closed or navigated away
  window.addEventListener("beforeunload", () => {
    if (readingActive) {
      clearInterval(readingTimer);
      saveReadingSession();
      readingActive = false;
      readingTimer = null;
      readingSeconds = 0;
    }
  });
