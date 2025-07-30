import http from 'http';

/**
 * Security Test Suite for Development Server
 * 
 * This file tests the security features of the development server (server.js).
 * The development server uses optionalAuthMiddleware, so some tests may pass
 * even without authentication (which is expected for development).
 * 
 * Usage: node test-security-simple.js
 */

const BASE_URL = 'http://localhost:8080/api/v1';

// Test cases for development security validation
const tests = [
  {
    name: 'POST /chats without auth - development behavior',
    method: 'POST',
    path: '/api/v1/chats',
    headers: { 
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ text: 'test message', userId: 'test-user' }),
    expectedStatus: 401, // Should fail in production, may pass in development
    expectedError: 'AUTH_REQUIRED'
  },
  {
    name: 'POST /chats with invalid token - should fail',
    method: 'POST',
    path: '/api/v1/chats',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid-token',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ text: 'test message', userId: 'test-user' }),
    expectedStatus: 401,
    expectedError: 'AUTH_REQUIRED'
  },
  {
    name: 'GET /chats/:userId/:chatId without auth - should fail',
    method: 'GET',
    path: '/api/v1/chats/user123/chat456',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: null,
    expectedStatus: 401,
    expectedError: 'AUTH_REQUIRED'
  },
  {
    name: 'GET /user-chats/:userId without auth - should fail',
    method: 'GET',
    path: '/api/v1/user-chats/user123',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: null,
    expectedStatus: 401,
    expectedError: 'AUTH_REQUIRED'
  }
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: test.path,
      method: test.method,
      headers: test.headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: { error: 'Invalid JSON response' }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log('🔒 Running Development Security Tests...\n');
  console.log('📝 Note: Development server may allow some unauthenticated access\n');
  
  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const result = await makeRequest(test);
      
      if (result.status === test.expectedStatus) {
        if (result.data.code === test.expectedError) {
          console.log(`✅ PASS: ${test.name}`);
          passedTests++;
        } else {
          console.log(`⚠️  PARTIAL: ${test.name} - Expected error code '${test.expectedError}', got '${result.data.code}'`);
          console.log(`   Response:`, result.data);
          // In development, this might be expected behavior
        }
      } else {
        console.log(`❌ FAIL: ${test.name} - Expected status ${test.expectedStatus}, got ${result.status}`);
        console.log(`   Response:`, result.data);
      }
      
    } catch (error) {
      console.log(`❌ FAIL: ${test.name} - Error: ${error.message}`);
    }
    
    console.log('---');
  }

  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All security tests passed!');
  } else {
    console.log('⚠️  Some tests failed - this may be expected in development mode.');
  }
  
  console.log('\n💡 To test production security, run: node test-production-security.js');
}

// Run the tests
runSecurityTests().catch(console.error); 