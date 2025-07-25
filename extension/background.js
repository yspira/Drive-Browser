// background.js
// Handles OAuth2 flow for Chrome/Edge using chrome.identity.launchWebAuthFlow

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_OAUTH') {
    const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/`;
    const CLIENT_ID = '138877544558-eu7v44i1263h4e00mdc5kk2638dpi3gc.apps.googleusercontent.com';
    const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const SCOPE = 'https://www.googleapis.com/auth/drive.file';
    const url = `${AUTH_URL}?client_id=${encodeURIComponent(CLIENT_ID)}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&prompt=consent`;
    if (chrome.identity && chrome.identity.launchWebAuthFlow) {
      chrome.identity.launchWebAuthFlow({
        url,
        interactive: true
      }, (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          sendResponse({ success: false, error: chrome.runtime.lastError });
          return;
        }
        // Extract access_token from redirectUrl
        const m = redirectUrl.match(/[#&]access_token=([^&]*)/);
        if (m && m[1]) {
          sendResponse({ success: true, token: m[1] });
        } else {
          sendResponse({ success: false, error: 'No token in redirect' });
        }
      });
      return true;
    } else {
      sendResponse({ success: false, error: 'chrome.identity.launchWebAuthFlow not available in this browser.' });
    }
  }
});
