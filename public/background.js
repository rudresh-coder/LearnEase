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
  timerId: null,
};

function savePomodoroState() {
  chrome.storage.local.set({
    pomodoroMode: pomodoro.mode,
    pomodoroSecondsLeft: pomodoro.secondsLeft,
    pomodoroRunning: pomodoro.running,
    pomodoroWorkMinutes: pomodoro.workMinutes,
    pomodoroBreakMinutes: pomodoro.breakMinutes,
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_POMODORO") {
    if (!pomodoro.running) {
      pomodoro.running = true;
      pomodoro.timerId = setInterval(() => {
        // Notify when 1 minute left
        if (pomodoro.secondsLeft === 60) {
          if (pomodoro.mode === "work") {
            showNotification("Pomodoro", "1 minute left in your focus session!");
          } else {
            showNotification("Pomodoro", "1 minute left in your break!");
          }
        }
        // Notify when session ends
        if (pomodoro.secondsLeft === 1) {
          if (pomodoro.mode === "work") {
            showNotification("Pomodoro", "Focus session is over! Break time starts now.");
          } else {
            showNotification("Pomodoro", "Break is over! Time to get back to work.");
          }
        }

        if (pomodoro.secondsLeft <= 1) {
          if (pomodoro.mode === "work") {
            pomodoro.mode = "break";
            pomodoro.secondsLeft = pomodoro.breakMinutes * 60;
          } else {
            pomodoro.mode = "work";
            pomodoro.secondsLeft = pomodoro.workMinutes * 60;
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
    savePomodoroState();
    sendResponse({ reset: true });
  }
  if (msg.type === "SET_POMODORO_DURATIONS") {
    pomodoro.workMinutes = msg.workMinutes;
    pomodoro.breakMinutes = msg.breakMinutes;
    if (pomodoro.mode === "work") {
      pomodoro.secondsLeft = pomodoro.workMinutes * 60;
    } else {
      pomodoro.secondsLeft = pomodoro.breakMinutes * 60;
    }
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
    });
  }
});