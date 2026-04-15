chrome.action.onClicked.addListener((tab) => {
  if (tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://") || tab.url.startsWith("file://"))) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["inject.js"]
    }).catch(err => console.error("Script injection failed:", err));
  } else {
    console.warn("SpeedRead cannot be injected into chrome:// or edge:// pages.");
  }
});