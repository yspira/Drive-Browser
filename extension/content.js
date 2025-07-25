// content.js
// Listen for messages from the popup to get the selected text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SELECTED_TEXT') {
    const selection = window.getSelection();
    sendResponse({
      text: selection ? selection.toString() : ''
    });
  }
  // Return true to indicate async response if needed
  return false;
});
