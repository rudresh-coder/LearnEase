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

// Listen for idle state changes
// chrome.idle.onStateChanged.addListener((newState) => {
//   chrome.runtime.sendMessage({ type: "IDLE_STATE", state: newState });
// });

// Listen for tab activation
// chrome.runtime.sendMessage({ type: "TAB_SWITCHED" }, () => {
//   if (chrome.runtime.lastError) {
//     // No receiver, ignore or handle gracefully
//     // console.warn("No receiver for TAB_SWITCHED:", chrome.runtime.lastError.message);
//   }
// });

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

// chrome.runtime.sendMessage({ type: "PING" }, (response) => {
//   if (chrome.runtime.lastError) {
//     // No receiver, ignore or handle gracefully
//     console.warn("No receiver for message:", chrome.runtime.lastError.message);
//   } else {
//     // Handle response if needed
//     console.log("Received response:", response);
//   }
// });