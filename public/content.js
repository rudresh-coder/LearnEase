function computeStats(text) {
    const wordsArr = text.trim().match(/\b[\w'-]+\b/g) || [];
    const words = wordsArr.length;
    const uniqueWords = new Set(wordsArr.map(w => w.toLowerCase())).size;
    const sentences = text.split(/[.!?]+(?=\s|$)/g).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\r?\n\s*\r?\n/).filter(p => p.trim() !== "").length;
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
    chrome.storage.local.get("readingSessions", (data) => {
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
      chrome.storage.local.set({ readingSessions: sessions });
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
//Focus Blocker
function getBlockedSites(callback) {
  chrome.storage.local.get(["focusBlockerCustomSites"], (data) => {
    const customSites = data.focusBlockerCustomSites || [];
    const BLOCKED_SITES = [
      "facebook.com",
      "instagram.com",
      "x.com",
      "reddit.com",
      "tiktok.com",
      "netflix.com",
      "hulu.com",
      "in.pinterest.com",
      "tumblr.com",
      ...customSites
    ];
    callback(BLOCKED_SITES);
  });
}

chrome.storage.local.get("focusBlockerActive", (data) => {
  if (data.focusBlockerActive) {
    getBlockedSites((BLOCKED_SITES) => {
      if (BLOCKED_SITES.some(site => window.location.hostname.includes(site))) {
        document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
            <h1 style="color:#10b981;font-size:2em;">🚫 Focus Blocker</h1>
            <p style="font-size:1.2em;">This site is blocked during study time.</p>
          </div>
        `;
      }
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.focusBlockerActive) {
    const isActive = changes.focusBlockerActive.newValue;
    getBlockedSites((BLOCKED_SITES) => {
      if (isActive && BLOCKED_SITES.some(site => window.location.hostname.includes(site))) {
        document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
            <h1 style="color:#10b981;font-size:2em;">🚫 Focus Blocker</h1>
            <p style="font-size:1.2em;">This site is blocked during study time.</p>
          </div>
        `;
      } else if (!isActive) {
        window.location.reload();
      }
    });
  }
});

// --- Sticky Notes Feature ---

const STICKY_NOTES_KEY = "stickyNotes";

// Helper to get notes for this page
function getStickyNotes(callback) {
  chrome.storage.local.get([STICKY_NOTES_KEY], data => {
    const notes = data[STICKY_NOTES_KEY] || {};
    const url = window.location.hostname;
    callback(notes[url] || []);
  });
}

// Helper to save notes for this page
function saveStickyNotes(notes) {
  chrome.storage.local.get([STICKY_NOTES_KEY], data => {
    const allNotes = data[STICKY_NOTES_KEY] || {};
    const url = window.location.hostname;
    allNotes[url] = notes;
    chrome.storage.local.set({ [STICKY_NOTES_KEY]: allNotes });
  });
}

// Create sticky note DOM
function createStickyNote(note, idx, notes, updateNotes) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "learnease-sticky-note";
  noteDiv.style.position = "fixed";
  noteDiv.style.left = note.x + "px";
  noteDiv.style.top = note.y + "px";
  noteDiv.style.width = note.width + "px";
  noteDiv.style.height = note.height + "px";
  noteDiv.style.background = "#fffbe7";
  noteDiv.style.border = "1.5px solid #f59e42";
  noteDiv.style.borderRadius = "10px";
  noteDiv.style.boxShadow = "0 2px 12px rgba(245,158,66,0.13)";
  noteDiv.style.padding = "10px 10px 28px 10px";
  noteDiv.style.zIndex = 999999;
  noteDiv.style.resize = "both";
  noteDiv.style.overflow = "auto";
  noteDiv.style.fontFamily = "sans-serif";
  noteDiv.style.fontSize = "1em";
  noteDiv.style.minWidth = "120px";
  noteDiv.style.minHeight = "60px";
  noteDiv.style.maxWidth = "320px";
  noteDiv.style.maxHeight = "300px";
  noteDiv.style.display = note.minimized ? "none" : "block";

  // Drag logic
  let offsetX, offsetY, dragging = false;
  const header = document.createElement("div");
  header.style.cursor = "move";
  header.style.background = "#f59e42";
  header.style.color = "#fff";
  header.style.fontWeight = "bold";
  header.style.padding = "2px 6px";
  header.style.borderRadius = "8px 8px 0 0";
  header.style.margin = "-10px -10px 8px -10px";
  header.innerText = "Sticky Note";
  noteDiv.appendChild(header);

  header.onmousedown = function(e) {
    dragging = true;
    offsetX = e.clientX - noteDiv.offsetLeft;
    offsetY = e.clientY - noteDiv.offsetTop;
    document.onmousemove = function(e2) {
      if (!dragging) return;
      noteDiv.style.left = (e2.clientX - offsetX) + "px";
      noteDiv.style.top = (e2.clientY - offsetY) + "px";
    };
    document.onmouseup = function() {
      dragging = false;
      document.onmousemove = null;
      document.onmouseup = null;
      // Save new position
      notes[idx].x = parseInt(noteDiv.style.left);
      notes[idx].y = parseInt(noteDiv.style.top);
      updateNotes([...notes]);
    };
  };

  // Textarea
  const textarea = document.createElement("textarea");
  textarea.value = note.text;
  textarea.style.width = "100%";
  textarea.style.height = "calc(100% - 32px)";
  textarea.style.border = "none";
  textarea.style.background = "transparent";
  textarea.style.resize = "none";
  textarea.style.fontFamily = "inherit";
  textarea.style.fontSize = "1em";
  textarea.style.outline = "none";
  textarea.oninput = function() {
    notes[idx].text = textarea.value;
    updateNotes([...notes]);
  };
  noteDiv.appendChild(textarea);

  // Controls
  const controls = document.createElement("div");
  controls.style.position = "absolute";
  controls.style.right = "6px";
  controls.style.bottom = "4px";
  controls.style.display = "flex";
  controls.style.gap = "6px";

  // Minimize
  const minBtn = document.createElement("button");
  minBtn.innerText = note.minimized ? "🔼" : "🔽";
  minBtn.title = note.minimized ? "Restore" : "Minimize";
  minBtn.style.border = "none";
  minBtn.style.background = "none";
  minBtn.style.cursor = "pointer";
  minBtn.onclick = function() {
    notes[idx].minimized = !notes[idx].minimized;
    updateNotes([...notes]);
    renderStickyNotes();
  };
  controls.appendChild(minBtn);

  // Delete
  const delBtn = document.createElement("button");
  delBtn.innerText = "🗑️";
  delBtn.title = "Delete";
  delBtn.style.border = "none";
  delBtn.style.background = "none";
  delBtn.style.cursor = "pointer";
  delBtn.onclick = function() {
    notes.splice(idx, 1);
    updateNotes([...notes]);
    renderStickyNotes();
  };
  controls.appendChild(delBtn);

  noteDiv.appendChild(controls);

  // Resize logic
  noteDiv.onmouseup = function() {
    notes[idx].width = noteDiv.offsetWidth;
    notes[idx].height = noteDiv.offsetHeight;
    updateNotes([...notes]);
  };

  return noteDiv;
}

// Render all sticky notes
function renderStickyNotes() {
  // Remove old notes
  document.querySelectorAll(".learnease-sticky-note").forEach(e => e.remove());
  getStickyNotes(notes => {
    notes.forEach((note, idx) => {
      if (!note.minimized) {
        const noteDiv = createStickyNote(note, idx, notes, updated => {
          saveStickyNotes(updated);
        });
        document.body.appendChild(noteDiv);
      }
    });
  });
}

// Listen for popup command to show/hide notes
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TOGGLE_STICKY_NOTES") {
    getStickyNotes(notes => {
      if (notes.length === 0) {
        // If no notes exist, create one
        notes.push({
          text: "",
          x: 100,
          y: 100,
          width: 200,
          height: 120,
          minimized: false
        });
        saveStickyNotes(notes);
      }
      renderStickyNotes();
      sendResponse({ shown: true });
    });
  }
  if (msg.type === "ADD_STICKY_NOTE") {
    getStickyNotes(notes => {
      notes.push({
        text: "",
        x: 100 + 30 * notes.length,
        y: 100 + 30 * notes.length,
        width: 200,
        height: 120,
        minimized: false
      });
      saveStickyNotes(notes);
      renderStickyNotes();
      sendResponse({ added: true });
    });
  }
});

// Initial render if notes exist
getStickyNotes(notes => {
  if (notes.length > 0) renderStickyNotes();
});
