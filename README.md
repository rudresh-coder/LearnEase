# LearnEase Chrome Extension

**LearnEase** is a smart student toolkit for productivity and focus, built with React, TypeScript, and Vite.

## Features

- **Word Counter & Daily Journal**
  - Count words, characters, sentences, paragraphs, and reading time.
  - Save journal entries locally (not synced across devices).
  - Set writing goals and track progress.
  - Storage quota warnings and management.

- **Reading Timer**
  - Track time spent reading on any webpage.
  - Pause, resume, and stop reading sessions.

- **Website Blocker**
  - Block distracting sites during study sessions.
  - Add/remove custom sites to block.

- **Pomodoro Timer**
  - Customizable work, break, and long break durations.
  - Cycle management and auto-start.
  - Notifications for session transitions.
  - Visual progress bar and session guidelines.

- **Study Stats**
  - Weekly summary chart (hours studied, words written per day).
  - Study streak tracker (e.g., 🔥 5-Day Study Streak).
  - Achievements & badges for milestones.
  - Compare to last week and smart insights.

## Data & Storage

- **All data is stored locally using `chrome.storage.local`.**
- **Your journal, stats, and settings are private and only available on your current device and browser profile.**
- **If storage is nearly full, you will receive a warning and may need to delete old journal entries or stats.**

## Usage

1. **Install the extension in Chrome (load as unpacked extension in developer mode).**
2. **Open the popup from the extension icon.**
3. **Select a tool from the main menu:**
   - Word Counter
   - Reading Timer
   - Website Blocker
   - Pomodoro Timer
   - Study Stats
4. **Follow on-screen instructions and guidelines for each tool.**
5. **For journal and stats, manage your entries to avoid hitting the storage quota.**

## License

This project is licensed under the MIT License.