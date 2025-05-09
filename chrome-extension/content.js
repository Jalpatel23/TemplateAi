// List of hate speech keywords and patterns
const hateSpeechPatterns = [
  // Racial slurs and offensive terms
  /n[i1]gg[a@]|n[i1]gg[e3]r/i,
  /k[i1]k[e3]|k[i1]k[e3]s/i,
  /w[e3]tback/i,
  /sp[i1]c/i,
  /ch[i1]nk/i,
  /g[o0]ok/i,
  
  // Religious hate
  /m[o0]sl[e3]m/i,
  /j[e3]w/i,
  /h[i1]ndu/i,
  /buddh[i1]st/i,
  
  // Gender-based hate
  /f[a@]g/i,
  /tr[a@]nn[i1][e3]|tr[a@]nn[i1][e3]s/i,
  /wh[o0]r[e3]|sl[u0]t/i,
  
  // Disability hate
  /r[e3]t[a@]rd/i,
  /m[o0]r[o0]n/i,
  /id[i1][o0]t/i
];

// Function to check if text contains hate speech
function containsHateSpeech(text) {
  return hateSpeechPatterns.some(pattern => pattern.test(text));
}

// Function to scan the page for hate speech
function scanPage() {
  const results = [];
  
  // Scan text content
  const textNodes = document.evaluate(
    '//text()[not(ancestor::script) and not(ancestor::style)]',
    document.body,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0; i < textNodes.snapshotLength; i++) {
    const node = textNodes.snapshotItem(i);
    const text = node.textContent.trim();
    
    if (text && containsHateSpeech(text)) {
      results.push({
        text: text,
        element: node.parentElement
      });
    }
  }

  return results;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanPage") {
    // Check if extension is active
    chrome.storage.local.get(['isActive'], function(result) {
      const isActive = result.isActive !== undefined ? result.isActive : true;
      
      if (isActive) {
        const results = scanPage();
        sendResponse({ results: results });
      } else {
        sendResponse({ results: [] });
      }
    });
    return true; // Required for async response
  }
}); 