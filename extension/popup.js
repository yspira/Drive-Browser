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


async function saveToDrive(entry) {
  // 1. Search for the 'Collected Info' file
  const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name=%27Collected%20Info%27%20and%20trashed=false&spaces=drive&fields=files(id,name)', {
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const searchData = await searchRes.json();
  let fileId = searchData.files && searchData.files.length > 0 ? searchData.files[0].id : null;

  // 2. Prepare new entry (JSONL)
  const newLine = JSON.stringify(entry) + '\n';

  if (!fileId) {
    // 3. Create the file if it doesn't exist
    const metadata = {
      name: 'Collected Info',
      mimeType: 'text/plain',
    };
    const boundary = '-------314159265358979323846';
    const body =
      '--' + boundary + '\r\n' +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) + '\r\n' +
      '--' + boundary + '\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      newLine + '\r\n' +
      '--' + boundary + '--';
    const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'multipart/related; boundary=' + boundary
      },
      body
    });
    if (createRes.ok) {
      alert('Saved to Google Drive (file created)!');
    } else {
      alert('Failed to create file: ' + (await createRes.text()));
    }
    return;
  }

  // 4. If file exists, get its content
  const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  let content = '';
  if (getRes.ok) {
    content = await getRes.text();
  }
  // 5. Append new entry
  const updatedContent = content + newLine;

  // 6. Update the file
  const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'text/plain'
    },
    body: updatedContent
  });
  if (updateRes.ok) {
    alert('Saved to Google Drive!');
  } else {
    alert('Failed to update file: ' + (await updateRes.text()));
  }
}

saveBtn.addEventListener('click', async () => {
  if (!isSignedIn) {
    alert('Please sign in to Google first.');
    return;
  }
  if (currentSelection) {
    // Prepare entry with text, URL, and timestamp
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0]?.url || '';
      const entry = {
        text: currentSelection,
        url,
        timestamp: new Date().toISOString()
      };
      try {
        await saveToDrive(entry);
      } catch (e) {
        alert('Error saving to Drive: ' + e);
      }
    });
  } else {
    alert('No text selected on the page.');
  }
});

// On popup load, check authentication
checkAuth();
