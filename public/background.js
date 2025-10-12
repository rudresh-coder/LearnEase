// public/background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("LearnEase background installed");
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id && tab.url && /^https?:/.test(tab.url)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      }
    }
  });
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  chrome.runtime.sendMessage({ type: "WINDOW_FOCUS", focused: windowId !== chrome.windows.WINDOW_ID_NONE }, () => {
    if (chrome.runtime.lastError) {
      // No receiver, ignore or handle gracefully
    }
  });
});

// Example listener to test messaging from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "PING") sendResponse({ pong: true });
});

let pomodoro = {
  mode: "work",
  secondsLeft: 25 * 60,
  running: false,
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  cycleCount: 0,
  timerId: null,
};

function savePomodoroState() {
  chrome.storage.local.set({
    pomodoroMode: pomodoro.mode,
    pomodoroSecondsLeft: pomodoro.secondsLeft,
    pomodoroRunning: pomodoro.running,
    pomodoroWorkMinutes: pomodoro.workMinutes,
    pomodoroBreakMinutes: pomodoro.breakMinutes,
    pomodoroLongBreakMinutes: pomodoro.longBreakMinutes,
    pomodoroCyclesBeforeLongBreak: pomodoro.cyclesBeforeLongBreak,
    pomodoroCycleCount: pomodoro.cycleCount,
  });
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/LearnEaseicon48.png",
    title,
    message
  });
}

function updateStudyStats(minutes, wordsWritten = 0) {
  chrome.storage.local.get(["weeklyStats", "studyStreak", "lastStudyDate"], (data) => {
    const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon, ...
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = DAYS[todayIdx];
    let stats = data.weeklyStats || DAYS.map(d => ({ day: d, hours: 0, words: 0 }));
    let streak = data.studyStreak || 0;
    let lastDate = data.lastStudyDate || "";

    // Update today's stats
    const idx = stats.findIndex(s => s.day === day);
    if (idx >= 0) {
      stats[idx].hours += minutes / 60;
      stats[idx].words += wordsWritten;
    }

    // Update streak
    const todayStr = new Date().toLocaleDateString();
    if (lastDate && lastDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toLocaleDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
    } else if (!lastDate) {
      streak = 1;
    }

    chrome.storage.local.set({
      weeklyStats: stats,
      studyStreak: streak,
      lastStudyDate: todayStr
    });

    updateBadges(stats, streak);
    rolloverWeeklyStatsIfNeeded(stats);
  });
}

function updateBadges(stats, streak) {
  chrome.storage.local.get(["studyBadges"], (data) => {
    let badges = data.studyBadges || [];
    const totalHours = stats.reduce((sum, s) => sum + s.hours, 0);
    const totalWords = stats.reduce((sum, s) => sum + s.words, 0);

    
    if (!badges.includes("🏅 First Focus Session Completed") && totalHours > 0) {
      badges.push("🏅 First Focus Session Completed");
    }
    if (!badges.includes("✍️ 1000 Words Written") && totalWords >= 1000) {
      badges.push("✍️ 1000 Words Written");
    }
    if (!badges.includes("⏳ 10-Hour Milestone") && totalHours >= 10) {
      badges.push("⏳ 10-Hour Milestone");
    }
    if (!badges.includes("🔥 7-Day Streak") && streak >= 7) {
      badges.push("🔥 7-Day Streak");
    }

   
    if (!badges.includes("💯 100 Words Written in a Day") && stats.some(s => s.words >= 100)) {
      badges.push("💯 100 Words Written in a Day");
    }
    if (!badges.includes("🕒 2-Hour Day") && stats.some(s => s.hours >= 2)) {
      badges.push("🕒 2-Hour Day");
    }
    if (!badges.includes("🏆 30-Day Streak") && streak >= 30) {
      badges.push("🏆 30-Day Streak");
    }
    if (!badges.includes("✍️ 5000 Words Written") && totalWords >= 5000) {
      badges.push("✍️ 5000 Words Written");
    }
    if (!badges.includes("⏳ 50-Hour Milestone") && totalHours >= 50) {
      badges.push("⏳ 50-Hour Milestone");
    }
    if (!badges.includes("🌟 Studied Every Day This Week") && stats.every(s => s.hours > 0)) {
      badges.push("🌟 Studied Every Day This Week");
    }

    chrome.storage.local.set({ studyBadges: badges }, () => {
      if (chrome.runtime.lastError && chrome.runtime.lastError.message?.includes("quota")) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/LearnEaseicon48.png",
          title: "Storage Full",
          message: "Your extension storage is full. Please delete old journal entries or stats."
        });
      }
    });
  });
}

function rolloverWeeklyStatsIfNeeded(stats) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  // Roll over on Monday (dayOfWeek === 1)
  chrome.storage.local.get(["lastRolloverWeek"], (data) => {
    const currentWeek = now.getFullYear() + "-" + getWeekNumber(now);
    if (data.lastRolloverWeek !== currentWeek && dayOfWeek === 1) {
      // Save last week's stats
      chrome.storage.local.set({
        lastWeekStats: stats,
        lastRolloverWeek: currentWeek,
        weeklyStats: [
          { day: "Sun", hours: 0, words: 0 },
          { day: "Mon", hours: 0, words: 0 },
          { day: "Tue", hours: 0, words: 0 },
          { day: "Wed", hours: 0, words: 0 },
          { day: "Thu", hours: 0, words: 0 },
          { day: "Fri", hours: 0, words: 0 },
          { day: "Sat", hours: 0, words: 0 },
        ]
      });
    }
  });
}

// Helper to get week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_POMODORO") {
    if (!pomodoro.running) {
      pomodoro.running = true;
      pomodoro.timerId = setInterval(() => {
        // Notify when 1 minute left
        if (pomodoro.secondsLeft === 60) {
          if (pomodoro.mode === "work") {
            showNotification("Pomodoro", "1 minute left in your focus session!");
          } else if (pomodoro.mode === "break") {
            showNotification("Pomodoro", "1 minute left in your break!");
          } else if (pomodoro.mode === "longBreak") {
            showNotification("Pomodoro", "1 minute left in your long break!");
          }
        }
        // Notify when session ends
        if (pomodoro.secondsLeft === 1) {
          if (pomodoro.mode === "work") {
            showNotification("Pomodoro", "Focus session is over! Break time starts now.");
          } else if (pomodoro.mode === "break") {
            showNotification("Pomodoro", "Break is over! Time to get back to work.");
          } else if (pomodoro.mode === "longBreak") {
            showNotification("Pomodoro", "Long break is over! Time to get back to work.");
          }
        }

        if (pomodoro.secondsLeft <= 1) {
          clearInterval(pomodoro.timerId);
          pomodoro.running = false;
          savePomodoroState();
          setTimeout(() => {
            pomodoro.running = true;
            pomodoro.timerId = setInterval(() => {
              // Timer logic here
            }, 1000);
            savePomodoroState();
          }, 5000); // 5 seconds delay

          if (pomodoro.mode === "work") {
            pomodoro.cycleCount++;
            if (pomodoro.cycleCount % pomodoro.cyclesBeforeLongBreak === 0) {
              pomodoro.mode = "longBreak";
              pomodoro.secondsLeft = pomodoro.longBreakMinutes * 60;
            } else {
              pomodoro.mode = "break";
              pomodoro.secondsLeft = pomodoro.breakMinutes * 60;
            }
          } else if (pomodoro.mode === "break") {
            pomodoro.mode = "work";
            pomodoro.secondsLeft = pomodoro.workMinutes * 60;
          } else if (pomodoro.mode === "longBreak") {
            pomodoro.mode = "work";
            pomodoro.secondsLeft = pomodoro.workMinutes * 60;
            pomodoro.cycleCount = 0;
          }
        } else {
          pomodoro.secondsLeft--;
        }
        savePomodoroState();
      }, 1000);
    }
    savePomodoroState();
    sendResponse({ started: true });
  }
  if (msg.type === "PAUSE_POMODORO") {
    pomodoro.running = false;
    clearInterval(pomodoro.timerId);
    pomodoro.timerId = null;
    savePomodoroState();
    sendResponse({ paused: true });
  }
  if (msg.type === "RESET_POMODORO") {
    pomodoro.running = false;
    clearInterval(pomodoro.timerId);
    pomodoro.timerId = null;
    pomodoro.mode = "work";
    pomodoro.secondsLeft = pomodoro.workMinutes * 60;
    pomodoro.cycleCount = 0;
    savePomodoroState();
    sendResponse({ reset: true });
  }
  if (msg.type === "SET_POMODORO_DURATIONS") {
    pomodoro.workMinutes = msg.workMinutes;
    pomodoro.breakMinutes = msg.breakMinutes;
    if (pomodoro.mode === "work") {
      pomodoro.secondsLeft = pomodoro.workMinutes * 60;
    } else if (pomodoro.mode === "break") {
      pomodoro.secondsLeft = pomodoro.breakMinutes * 60;
    } else if (pomodoro.mode === "longBreak") {
      pomodoro.secondsLeft = pomodoro.longBreakMinutes * 60;
    }
    savePomodoroState();
    sendResponse({ updated: true });
  }
  if (msg.type === "SET_POMODORO_SETTINGS") {
    pomodoro.workMinutes = msg.workMinutes;
    pomodoro.breakMinutes = msg.breakMinutes;
    pomodoro.longBreakMinutes = msg.longBreakMinutes;
    pomodoro.cyclesBeforeLongBreak = msg.cyclesBeforeLongBreak;
    savePomodoroState();
    sendResponse({ updated: true });
  }
  if (msg.type === "GET_POMODORO_STATE") {
    sendResponse({
      mode: pomodoro.mode,
      secondsLeft: pomodoro.secondsLeft,
      running: pomodoro.running,
      workMinutes: pomodoro.workMinutes,
      breakMinutes: pomodoro.breakMinutes,
      longBreakMinutes: pomodoro.longBreakMinutes,
      cyclesBeforeLongBreak: pomodoro.cyclesBeforeLongBreak,
      cycleCount: pomodoro.cycleCount,
    });
  }
  if (msg.type === "UPDATE_STUDY_STATS") {
    
    updateStudyStats(0, msg.wordsWritten || 0);
    sendResponse({ updated: true });
  }
});