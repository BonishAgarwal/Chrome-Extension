chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureFullPage") {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
        sendResponse({ screenshotUrl: dataUrl });
      });
      return true; // Required to indicate async sendResponse
    }
  });
  