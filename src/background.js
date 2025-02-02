chrome.runtime.onInstalled.addListener(() => {
  console.log('AdFriend installed successfully!')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings })
  }
})
