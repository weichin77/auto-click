const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const status = document.getElementById('status');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStatus') {
    status.textContent = `Status: ${message.status}`;
  }
});

startButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'startMomo' });
  status.textContent = 'Status: Running';
});

stopButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopMomo' });
  status.textContent = 'Status: Stopped';
});
