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
});