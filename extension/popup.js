document.getElementById('capture').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    const totalHeight = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.scrollHeight,
    }).then(results => results[0].result);
  
    const viewportHeight = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.innerHeight,
    }).then(results => results[0].result);
  
    let screenshots = [];
    let scrollPos = 0;
  
    while (scrollPos < totalHeight) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          window.scrollBy(0, window.innerHeight);
        },
      });
  
      let screenshot = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'captureFullPage' }, (response) => {
          resolve(response.screenshotUrl);
        });
      });
  
      screenshots.push(screenshot);
      
      scrollPos += viewportHeight;
  
      await new Promise((resolve) => setTimeout(resolve, 300)); // Adding delay to ensure scrolling is complete
    }

    console.log(typeof(screenshots[0]))
    console.log(`Screenshots: ${screenshots}`);
  
    // Combine screenshots into a single image (if needed)
    // This example saves each screenshot as a separate file
  
    // screenshots.forEach((screenshot, index) => {
    //   let link = document.createElement('a');
    //   link.href = screenshot;
    //   link.download = `screenshot_part_${index + 1}.png`;
    //   link.click();
    // });
  });
  