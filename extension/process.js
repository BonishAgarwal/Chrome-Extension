async function getWebPageTitle(tabId) {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => document.title,
    });
    return result.result;
}

const getDocument = async (url, title) => {
    debugger;
    const webupload = document.querySelector("#webupload");
    const loader = document.querySelector("#loader");
    const searchInput = document.querySelector("#search");
    const workspaceDropdown = document.querySelector("#workspaceDropdown");
    const uploadButton = document.querySelector("#uploadButton");
    const captureButton = document.querySelector('#capture');

        
    const screenshots = [];

    try {
        const requestOptions = {
            method: "GET",
        };


        // Handle capture button click event
        captureButton.addEventListener('click', async () => {
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
            const totalHeight = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => document.body.scrollHeight,
            }).then(results => results[0].result);
          
            const viewportHeight = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => window.innerHeight,
            }).then(results => results[0].result);
          
            let scrollPos = 0;
          
            while (scrollPos < totalHeight) {
              // Scroll the page by the remaining height or viewport height
              const remainingHeight = Math.min(viewportHeight, totalHeight - scrollPos);
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (scrollBy) => {
                  window.scrollBy(0, scrollBy);
                },
                args: [remainingHeight],
              });
          
              // Wait for the page to render after scrolling
              await new Promise(resolve => setTimeout(resolve, 500));
          
              // Capture the screenshot
              const screenshot = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'captureFullPage' }, (response) => {
                  resolve(response.screenshotUrl);
                });
              });
          
              screenshots.push(screenshot);
              scrollPos += remainingHeight;
          
              // Delay to ensure the operation completes smoothly
              await new Promise(resolve => setTimeout(resolve, 300));
            }
        });
        console.log(`Screenshots: ${screenshots}`);
        // Handle upload button click
        uploadButton.addEventListener('click', async() => {
            // var selectedWorkspace = document.querySelector('input[name="workspace"]:checked');
            if (true) {
              console.log("true");
              console.log(screenshots)
                const resDoc = await fetch(
                    `http://127.0.0.1:8080/uploadDocs`
                , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "web_url": url,
                        "screenshots": screenshots,
                        "title": title
                    })
                });
                const response = await resDoc.json();
                console.log(response)
            } else {
                alert('Please select a workspace.');
            }
        });


          
    } catch (error) {
        // loader.style.display = 'none'; // Hide the loader
        console.error(`Error fetching or processing data: ${error}`);
        webupload.innerHTML = error.message;
    }
}

window.addEventListener('load', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const title = await getWebPageTitle(tab.id);
        console.log(title);
        if (tab && tab.url) {
            getDocument(tab.url, title);
        } else {
            document.querySelector("#webupload").innerHTML = 'Could not retrieve active tab URL';
        }
    } catch (error) {
        console.error('Error retrieving tab URL:', error);
        document.querySelector("#webupload").innerHTML = error.message;
    }
});
