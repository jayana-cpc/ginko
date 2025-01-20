// Toggle the "Create Bookmark Reminder" feature
document.getElementById("toggle-bookmark-reminder").addEventListener("click", () => {
    const toggleButton = document.getElementById("toggle-bookmark-reminder");
    const container = document.getElementById("bookmark-reminder-container");
  
    // Hide the main button and show the feature container
    toggleButton.style.display = "none";
    container.style.display = "block";
  });
  
  // Handle the "Back" button
  document.getElementById("back-button").addEventListener("click", () => {
    const toggleButton = document.getElementById("toggle-bookmark-reminder");
    const container = document.getElementById("bookmark-reminder-container");
  
    // Show the main button and hide the feature container
    toggleButton.style.display = "inline-block";
    container.style.display = "none";
  });
  
  // Load collected tabs on popup open
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("collectedTabs", (data) => {
      const tabList = data.collectedTabs || [];
      tabList.forEach((tab) => addTabToUI(tab.title, tab.url));
    });
  });
  
  // Array to keep tabs in memory during session
  let collectedTabs = [];
  
  // Event listener to get current tab info
  document.getElementById("get-tab-info").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        document.getElementById("tab-title").value = tab.title;
        document.getElementById("get-tab-info").dataset.url = tab.url;
      } else {
        alert("No active tab found.");
      }
    });
  });
  
  // Event listener to save tab info
  document.getElementById("save-tab").addEventListener("click", () => {
    const title = document.getElementById("tab-title").value;
    const url = document.getElementById("get-tab-info").dataset.url;
  
    if (title && url) {
      // Add tab to the local array and UI
      const newTab = { title, url };
      collectedTabs.push(newTab);
      addTabToUI(title, url);
  
      // Save to chrome.storage.local
      chrome.storage.local.set({ collectedTabs }, () => {
        console.log("Tab saved:", newTab);
      });
  
      // Clear the input for the next tab
      document.getElementById("tab-title").value = "";
    } else {
      alert("No tab info to save.");
    }
  });
  
  // Add a tab to the UI list
  function addTabToUI(title, url) {
    const tabList = document.getElementById("tab-list");
    const listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${title}</strong> - <a href="${url}" target="_blank">${url}</a>`;
    tabList.appendChild(listItem);
  }
  
  // Sync in-memory tabs with chrome.storage.local
  chrome.storage.local.get("collectedTabs", (data) => {
    collectedTabs = data.collectedTabs || [];
  });
  