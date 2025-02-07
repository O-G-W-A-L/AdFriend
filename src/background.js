console.log('AdFrined background script loaded');
// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.local.set({
        settings: {
          enabled: true,
          contentType: 'random',
          stylePreset: 'default'
        }
      });
    }
  });
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings }, () => {
      // Refresh active tabs
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs.forEach(tab => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['contentScript.js']
          });
        });
      });
    });
    return true; // Keep channel open
  }
});