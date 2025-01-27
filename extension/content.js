async function scrollPage() {
    return new Promise((resolve) => {
      let totalHeight = 0;
      const scrollStep = 100;
      const scrollInterval = 200;
  
      function scrollDown() {
        totalHeight += scrollStep;
        window.scrollBy(0, scrollStep);
  
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          resolve();
        } else {
          setTimeout(scrollDown, scrollInterval);
        }
      }
  
      scrollDown();
    });
  }
  
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "scrollPage") {
      await scrollPage();
      sendResponse({ success: true });
    }
  });
  