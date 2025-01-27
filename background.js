let activeTabId = null;
let activeTabStartTime = null;
let siteUsage = {};
let isTracking = true; 

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!isTracking) return; 

  const previousTabId = activeTabId;
  activeTabId = activeInfo.tabId;

  if (previousTabId && activeTabStartTime) {
    const endTime = Date.now();
    const duration = Math.floor((endTime - activeTabStartTime) / 1000);

    const tab = await chrome.tabs.get(previousTabId);
    if (tab.url) {
      const hostname = new URL(tab.url).hostname;
      if (!siteUsage[hostname]) {
        siteUsage[hostname] = { totalSeconds: 0, sessions: 0 };
      }
      siteUsage[hostname].totalSeconds += duration;
      siteUsage[hostname].sessions += 1;
      chrome.storage.local.set({ siteUsage });
    }
  }

  activeTabStartTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isTracking) return; 

  if (tabId === activeTabId && changeInfo.url) {
    const endTime = Date.now();
    const duration = Math.floor((endTime - activeTabStartTime) / 1000);

    const hostname = new URL(changeInfo.url).hostname;
    if (!siteUsage[hostname]) {
      siteUsage[hostname] = { totalSeconds: 0, sessions: 0 };
    }
    siteUsage[hostname].totalSeconds += duration;
    siteUsage[hostname].sessions += 1;

    chrome.storage.local.set({ siteUsage });
    activeTabStartTime = Date.now(); 
  }
});

chrome.runtime.onSuspend.addListener(() => {
  if (activeTabStartTime && activeTabId) {
    const endTime = Date.now();
    const duration = Math.floor((endTime - activeTabStartTime) / 1000);
    chrome.storage.local.set({ siteUsage });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleTracking") {
    isTracking = message.isTracking;
    sendResponse({ status: "Tracking state updated", isTracking });
  }
});
