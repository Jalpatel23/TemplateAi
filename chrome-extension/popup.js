document.addEventListener('DOMContentLoaded', function() {
  const scanButton = document.getElementById('scanPage');
  const toggleButton = document.getElementById('toggleExtension');
  const statusElement = document.getElementById('status');
  const resultsElement = document.getElementById('results');

  // Check extension status
  chrome.storage.local.get(['isActive'], function(result) {
    const isActive = result.isActive !== undefined ? result.isActive : true;
    updateStatus(isActive);
  });

  // Toggle extension
  toggleButton.addEventListener('click', function() {
    chrome.storage.local.get(['isActive'], function(result) {
      const newStatus = !(result.isActive !== undefined ? result.isActive : true);
      chrome.storage.local.set({ isActive: newStatus }, function() {
        updateStatus(newStatus);
      });
    });
  });

  // Scan current page
  scanButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "scanPage"}, function(response) {
        if (response && response.results) {
          displayResults(response.results);
        }
      });
    });
  });

  function updateStatus(isActive) {
    statusElement.textContent = isActive ? 'Active' : 'Inactive';
    statusElement.style.color = isActive ? 'green' : 'red';
  }

  function displayResults(results) {
    resultsElement.innerHTML = '';
    if (results.length === 0) {
      resultsElement.innerHTML = '<p>No hate speech detected.</p>';
      return;
    }

    results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'hate-speech';
      div.textContent = result.text;
      resultsElement.appendChild(div);
    });
  }
}); 