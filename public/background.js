// public/background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("LearnEase background installed");
  });
  
  // Example listener to test messaging from popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "PING") sendResponse({ pong: true });
  });
  