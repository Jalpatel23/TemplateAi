// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: true });
});

// Listen for tab updates to scan new pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['isActive'], function(result) {
      if (result.isActive) {
        chrome.tabs.sendMessage(tabId, {action: "scanPage"});
      }
    });
  }
}); 