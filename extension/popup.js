// popup.js
const selectedTextDiv = document.getElementById('selected-text');
const saveBtn = document.getElementById('save-btn');
const signinBtn = document.getElementById('signin-btn');
const authStatusDiv = document.getElementById('auth-status');
let currentSelection = '';
let isSignedIn = false;
let accessToken = null;

// Google OAuth2 config
// (Handled in background.js)

// Get the active tab and request the selected text
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'GET_SELECTED_TEXT' },
      (response) => {
        currentSelection = response?.text || '';
        selectedTextDiv.textContent = currentSelection || '[No text selected]';
      }
    );
  }
});

function updateAuthUI() {
  if (isSignedIn) {
    authStatusDiv.textContent = 'Signed in to Google';
    signinBtn.style.display = 'none';
    saveBtn.disabled = false;
  } else {
    authStatusDiv.textContent = 'Not signed in';
    signinBtn.style.display = 'block';
    saveBtn.disabled = true;
  }
}

function checkAuth() {
  // Check if we have a token in localStorage
  accessToken = localStorage.getItem('google_access_token');
  isSignedIn = !!accessToken;
  updateAuthUI();
}

function launchWebAuthFlow() {
  chrome.runtime.sendMessage({ type: 'START_OAUTH' }, (response) => {
    if (response && response.success && response.token) {
      accessToken = response.token;
      localStorage.setItem('google_access_token', accessToken);
      isSignedIn = true;
      updateAuthUI();
    } else {
      alert('Sign-in failed.');
    }
  });
}

signinBtn.addEventListener('click', () => {
  launchWebAuthFlow();
});

saveBtn.addEventListener('click', () => {
  if (!isSignedIn) {
    alert('Please sign in to Google first.');
    return;
  }
  if (currentSelection) {
    // For now, just log the selection. Later, this will trigger Google Drive logic.
    alert('Selected text to save: ' + currentSelection);
  } else {
    alert('No text selected on the page.');
  }
});

// On popup load, check authentication
checkAuth();
