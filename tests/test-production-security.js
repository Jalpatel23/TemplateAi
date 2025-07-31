import http from 'http';

const BASE_URL = 'http://localhost:8080/api/v1';

// Test cases for production security validation
const tests = [
  {
    name: 'POST /chats without auth - should fail (PRODUCTION)',
    method: 'POST',
    path: '/api/v1/chats',
    headers: { 
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ text: 'test message', userId: 'test-user' }),
    expectedStatus: 401,
    expectedError: 'AUTH_REQUIRED'
  },
  {
    name: 'POST /chats with invalid token - should fail (PRODUCTION)',
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
    name: 'GET /chats/:userId/:chatId without auth - should fail (PRODUCTION)',
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
    name: 'GET /user-chats/:userId without auth - should fail (PRODUCTION)',
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

async function runProductionSecurityTests() {
  console.log('🔒 Running Production Security Tests...\n');
  console.log('⚠️  Make sure to run: node server.prod.js (not npm run jp)\n');
  
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
          console.log(`❌ FAIL: ${test.name} - Expected error code '${test.expectedError}', got '${result.data.code}'`);
          console.log(`   Response:`, result.data);
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
    console.log('🎉 All production security tests passed! Authentication is properly enforced in production.');
  } else {
    console.log('⚠️  Some production security tests failed. Please review the authentication implementation.');
  }
}

// Run the tests
runProductionSecurityTests().catch(console.error); 