document.getElementById("toggle-bookmark-reminder").addEventListener("click", () => {
    const toggleButton = document.getElementById("toggle-bookmark-reminder");
    const viewJournalButton = document.getElementById("view-journal");
    const container = document.getElementById("bookmark-reminder-container");
  
    toggleButton.style.display = "none";
    container.style.display = "block";
    viewJournalButton.style.display = "none";
  });
  
  
  document.getElementById("back-button").addEventListener("click", () => {
    const toggleButton = document.getElementById("toggle-bookmark-reminder");
    const viewJournalButton = document.getElementById("view-journal");
    const container = document.getElementById("bookmark-reminder-container");
  
    toggleButton.style.display = "inline-block";
    viewJournalButton.style.display = "inline-block";
    container.style.display = "none";
  });

  
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("collectedTabs", (data) => {
      collectedTabs = data.collectedTabs || [];
      collectedTabs.forEach((tab) => addTabToUI(tab.title, tab.url, tab.reminderDate, tab.reminderTime, tab.reminderOption));
    });
  });
  
  let collectedTabs = [];
  
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
  
  document.getElementById("save-tab").addEventListener("click", () => {
    const title = document.getElementById("tab-title").value;
    const url = document.getElementById("get-tab-info").dataset.url;
    const reminderDate = document.getElementById("reminder-date").value;
    const reminderTime = document.getElementById("reminder-time").value;
    const reminderOption = document.getElementById("reminder-option").value;

    if (title && url && reminderDate && reminderOption) {
        const email = "jchdnjc@gmail.com"; 
        const newTab = { title, url, reminderDate, reminderTime, reminderOption };

        fetch("https://ginko-backend.vercel.app/schedule-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                url,
                reminderDate,
                reminderTime,
                email, 
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === "Email scheduled") {
                console.log("Email successfully scheduled.");
                alert("Reminder has been scheduled!");
            } else {
                console.error("Failed to schedule email:", data.error);
                alert("Failed to schedule the reminder.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while scheduling the reminder.");
        });

        collectedTabs.push(newTab);
        addTabToUI(title, url, reminderDate, reminderTime, reminderOption);
        chrome.storage.local.set({ collectedTabs });
    } else {
        alert("Please fill in all required fields.");
    }
});

  
  function addTabToUI(title, url, reminderDate, reminderTime, reminderOption) {
    const tabList = document.getElementById("tab-list");
    const tabItem = document.createElement("li");
    tabItem.textContent = `${title} - ${url} - ${reminderDate} ${reminderTime ? reminderTime : ''} - ${reminderOption}`;
  
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      removeTabFromUI(tabItem, title, url);
    });
  
    tabItem.appendChild(deleteButton);
    tabList.appendChild(tabItem);
  }
  
  function removeTabFromUI(tabItem, title, url) {
    const tabList = document.getElementById("tab-list");
    tabList.removeChild(tabItem);
  
    collectedTabs = collectedTabs.filter(tab => tab.title !== title || tab.url !== url);
    chrome.storage.local.set({ collectedTabs });
  }