# Drive Collected Info Extension

## Overview
Drive Collected Info is a browser extension for Chrome and Edge that lets you easily select text on any web page and save it to a special file in your Google Drive. Each entry is saved with the selected content, the page URL, and a timestamp.

## Features
- Select text on any web page and save it to Google Drive with one click
- Stores entries in a plain text file ("Collected Info") in your Drive
- Each entry includes the content, source URL, and date/time
- One-time Google authentication, then seamless saving

## Installation
1. Clone or download this repository.
2. Open your browser's Extensions page (e.g., `chrome://extensions` or `edge://extensions`).
3. Enable Developer Mode.
4. Click "Load unpacked" and select the `extension` folder.
5. The extension icon will appear in your browser toolbar.

## Usage
1. Select any text on a web page.
2. Click the Drive Collected Info extension icon.
3. Sign in with your Google account (first time only).
4. Click "Save to Google Drive". The selected text, page URL, and timestamp will be appended to your "Collected Info" file in Google Drive.

## Google Drive Integration
- The extension uses the Google Drive API and stores data in a file named "Collected Info" (plain text, JSONL format).
- If the file does not exist, it will be created automatically.
- Requires the `https://www.googleapis.com/auth/drive.file` scope.

## Development Notes
- If you update the extension code or manifest, reload the extension in your browser.
- If the selected text does not appear, refresh the web page to ensure the content script is injected.

## License
MIT
# Drive-Browser