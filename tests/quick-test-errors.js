// Quick Error Handling Test Script
// Run this in your browser console to test error handling

console.log('🧪 Quick Error Handling Test Script');
console.log('Run these commands in your browser console to test error handling...\n');

// Test functions
const testErrorHandling = {
  
  // Network Error Tests
  testNetworkErrors: () => {
    console.log('🌐 Testing Network Errors...');
    
    console.log('1. Testing Failed to fetch...');
    fetch('/non-existent-endpoint').catch(e => console.error(e));
    
    setTimeout(() => {
      console.log('2. Testing Network Error...');
      console.error(new Error('Network Error'));
    }, 2000);
    
    setTimeout(() => {
      console.log('3. Testing ERR_NETWORK...');
      console.error(new Error('ERR_NETWORK'));
    }, 4000);
    
    setTimeout(() => {
      console.log('4. Testing Internet Disconnected...');
      console.error(new Error('ERR_INTERNET_DISCONNECTED'));
    }, 6000);
  },

  // Authentication Error Tests
  testAuthErrors: () => {
    console.log('🔐 Testing Authentication Errors...');
    
    console.log('1. Testing Clerk Failed to Load...');
    console.error(new Error('Clerk: Failed to load Clerk'));
    
    setTimeout(() => {
      console.log('2. Testing Authentication Failed...');
      console.error(new Error('Authentication failed'));
    }, 2000);
    
    setTimeout(() => {
      console.log('3. Testing Unauthorized...');
      console.error(new Error('Unauthorized access'));
    }, 4000);
  },

  // Resource Error Tests
  testResourceErrors: () => {
    console.log('📦 Testing Resource Loading Errors...');
    
    console.log('1. Testing Image Loading Error...');
    const img = new Image();
    img.src = 'non-existent-image.jpg';
    img.onerror = () => console.error(new Error('Image failed to load'));
    
    setTimeout(() => {
      console.log('2. Testing Stylesheet Loading Error...');
      console.error(new Error('Stylesheet failed to load'));
    }, 2000);
    
    setTimeout(() => {
      console.log('3. Testing Script Loading Error...');
      console.error(new Error('Script failed to load'));
    }, 4000);
  },

  // Browser Error Tests
  testBrowserErrors: () => {
    console.log('🛡️ Testing Browser Security Errors...');
    
    console.log('1. Testing CORS Error...');
    console.error(new Error('CORS policy blocked request'));
    
    setTimeout(() => {
      console.log('2. Testing Permission Denied...');
      console.error(new Error('Permission denied'));
    }, 2000);
    
    setTimeout(() => {
      console.log('3. Testing Storage Quota...');
      console.error(new Error('Storage quota exceeded'));
    }, 4000);
  },

  // Memory Error Tests
  testMemoryErrors: () => {
    console.log('💾 Testing Memory Errors...');
    
    console.log('1. Testing Out of Memory...');
    console.error(new Error('Out of memory'));
    
    setTimeout(() => {
      console.log('2. Testing Memory Quota...');
      console.error(new Error('Memory quota exceeded'));
    }, 2000);
  },

  // Script Error Tests
  testScriptErrors: () => {
    console.log('🔧 Testing Script Errors...');
    
    console.log('1. Testing Syntax Error...');
    console.error(new Error('Syntax error in script'));
    
    setTimeout(() => {
      console.log('2. Testing Reference Error...');
      console.error(new Error('Reference error in script'));
    }, 2000);
    
    setTimeout(() => {
      console.log('3. Testing Type Error...');
      console.error(new Error('Type error in script'));
    }, 4000);
  },

  // Generic Error Tests
  testGenericErrors: () => {
    console.log('⚠️ Testing Generic Errors...');
    
    console.log('1. Testing Unknown Error...');
    console.error(new Error('Something unexpected happened'));
    
    setTimeout(() => {
      console.log('2. Testing Custom Error...');
      console.error(new Error('Custom application error'));
    }, 2000);
  },

  // Run All Tests
  runAllTests: () => {
    console.log('🚀 Running All Error Handling Tests...\n');
    
    testErrorHandling.testNetworkErrors();
    
    setTimeout(() => {
      testErrorHandling.testAuthErrors();
    }, 8000);
    
    setTimeout(() => {
      testErrorHandling.testResourceErrors();
    }, 16000);
    
    setTimeout(() => {
      testErrorHandling.testBrowserErrors();
    }, 24000);
    
    setTimeout(() => {
      testErrorHandling.testMemoryErrors();
    }, 32000);
    
    setTimeout(() => {
      testErrorHandling.testScriptErrors();
    }, 40000);
    
    setTimeout(() => {
      testErrorHandling.testGenericErrors();
    }, 48000);
    
    setTimeout(() => {
      console.log('\n✅ All tests completed! Check for error overlays.');
    }, 56000);
  },

  // Clear all error overlays
  clearOverlays: () => {
    const overlays = document.querySelectorAll('#global-error-overlay');
    overlays.forEach(overlay => overlay.remove());
    console.log('🧹 Cleared all error overlays');
  },

  // Check if error handler is working
  checkErrorHandler: () => {
    const hasErrorHandler = typeof window !== 'undefined' && 
                           window.addEventListener && 
                           window.addEventListener.toString().includes('unhandledrejection');
    
    console.log('🔍 Error Handler Status:', hasErrorHandler ? '✅ Active' : '❌ Not Found');
    return hasErrorHandler;
  }
};

// Make functions available globally
window.testErrors = testErrorHandling;

console.log('📋 Available Test Commands:');
console.log('testErrors.runAllTests()     - Run all error tests');
console.log('testErrors.testNetworkErrors() - Test network errors only');
console.log('testErrors.testAuthErrors()    - Test authentication errors only');
console.log('testErrors.testResourceErrors() - Test resource loading errors only');
console.log('testErrors.testBrowserErrors()  - Test browser security errors only');
console.log('testErrors.testMemoryErrors()   - Test memory errors only');
console.log('testErrors.testScriptErrors()   - Test script errors only');
console.log('testErrors.testGenericErrors()  - Test generic errors only');
console.log('testErrors.clearOverlays()      - Clear all error overlays');
console.log('testErrors.checkErrorHandler()  - Check if error handler is active');

console.log('\n💡 Tip: Run testErrors.runAllTests() to test all error scenarios!');
console.log('💡 Tip: Run testErrors.clearOverlays() to remove error overlays between tests!');

// Auto-check error handler status
testErrorHandling.checkErrorHandler(); 