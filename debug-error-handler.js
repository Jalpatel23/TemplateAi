// Debug Error Handler Script
// Run this in browser console to debug the error handler

console.log('🔍 Debugging Error Handler...');

// Test if the global error handler exists
console.log('1. Checking if globalErrorHandler exists...');
console.log('globalErrorHandler:', typeof globalErrorHandler !== 'undefined' ? '✅ Found' : '❌ Not Found');

// Test if the error handler is initialized
console.log('2. Checking if error handler is initialized...');
const hasUnhandledRejection = window.addEventListener.toString().includes('unhandledrejection');
const hasErrorListener = window.addEventListener.toString().includes('error');
console.log('Has unhandledrejection listener:', hasUnhandledRejection);
console.log('Has error listener:', hasErrorListener);

// Test direct error overlay creation
console.log('3. Testing direct error overlay creation...');
try {
  // Create a test error overlay manually
  const overlay = document.createElement('div');
  overlay.id = 'test-error-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  overlay.innerHTML = `
    <div style="
      background: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
      text-align: center;
      color: #333;
    ">
      <div style="font-size: 48px; margin-bottom: 1rem; color: #dc3545;">⚠️</div>
      <h2 style="margin-bottom: 1rem; color: #dc3545; font-size: 1.5rem; font-weight: 600;">
        Test Error Overlay
      </h2>
      <p style="margin-bottom: 2rem; color: #666; line-height: 1.5;">
        This is a test error overlay to verify the overlay creation works.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="document.getElementById('test-error-overlay').remove()" style="
          padding: 0.75rem 1.5rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        ">Close Test</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  console.log('✅ Test error overlay created successfully');
} catch (error) {
  console.error('❌ Failed to create test error overlay:', error);
}

// Test if console.error is being intercepted
console.log('4. Testing console.error interception...');
const originalConsoleError = console.error;
console.error = function(...args) {
  console.log('🔍 console.error intercepted:', args);
  originalConsoleError.apply(console, args);
};

// Test a simple error
console.log('5. Testing simple error...');
console.error(new Error('Test error for debugging'));

// Check if any error overlays exist
console.log('6. Checking for existing error overlays...');
const existingOverlays = document.querySelectorAll('#global-error-overlay, #test-error-overlay');
console.log('Existing overlays:', existingOverlays.length);

// Test the global error handler directly if it exists
if (typeof globalErrorHandler !== 'undefined') {
  console.log('7. Testing global error handler directly...');
  try {
    globalErrorHandler.showUserFriendlyError(new Error('Direct test error'));
    console.log('✅ Direct error handler call successful');
  } catch (error) {
    console.error('❌ Direct error handler call failed:', error);
  }
} else {
  console.log('7. Global error handler not available');
}

// Check for any JavaScript errors
console.log('8. Checking for JavaScript errors...');
window.addEventListener('error', (event) => {
  console.log('🔍 JavaScript error caught:', event.error);
});

// Test unhandled promise rejection
console.log('9. Testing unhandled promise rejection...');
Promise.reject(new Error('Test promise rejection')).catch(e => {
  console.log('🔍 Promise rejection caught:', e);
});

console.log('🔍 Debug complete! Check the console for results.'); 