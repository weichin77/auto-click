// This allows the side panel to open when the extension icon is clicked.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMomo') {
    startMomoSequence();
  } else if (message.action === 'stopMomo') {
    stopMomoSequence();
  } else if (message.action === 'loopFinished') {
    // Forward the message to the side panel
    chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Idle' });
  }
});

let momoLoopInterval;

async function startMomoSequence() {
  const targetUrl = "https://scm.momoshop.com.tw/F1104Servlet.do?method=query&checkStatus=00&pageFrom=index";
  const queryUrl = "https://scm.momoshop.com.tw/*";

  // Stop any existing loop before starting a new one
  if (momoLoopInterval) {
    clearInterval(momoLoopInterval);
  }

  const performClick = async () => {
    let tabs = await chrome.tabs.query({ url: queryUrl });
    let tab;

    if (tabs.length > 0) {
      tab = await chrome.tabs.update(tabs[0].id, { url: targetUrl, active: true });
    } else {
      tab = await chrome.tabs.create({ url: targetUrl });
    }

    // Listener for when the tab is updated
    const listener = (tabId, info) => {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener); // Clean up listener

        // Inject the script to perform a single click
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: clickOnce
        });
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  };

  // Perform the first click immediately, then set an interval
  performClick();
  momoLoopInterval = setInterval(performClick, 1500);
}

async function stopMomoSequence() {
    if (momoLoopInterval) {
        clearInterval(momoLoopInterval);
        momoLoopInterval = null;
        chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Idle' });
        console.log('Momo sequence stopped.');
    }
}

// This function is injected into the target page to perform a single click
function clickOnce() {
  const button = document.querySelector('input[name="btnNotDow"]');
  if (button) {
    console.log('Button found, clicking...');
    chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Button Clicked' });
    button.click();
  } else {
    console.log('Button not found.');
    // Notify the side panel that the button is not found
    chrome.runtime.sendMessage({ action: 'updateStatus', status: 'Button not found' });
  }
}