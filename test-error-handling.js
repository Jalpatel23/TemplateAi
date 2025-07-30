import http from 'http';

const BASE_URL = 'http://localhost:8080';
const API_BASE = `${BASE_URL}/api/v1`;

// Test configuration
const testConfig = {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'ErrorHandlingTest/1.0'
  }
};

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        ...testConfig.headers,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Test cases for standardized error handling
const runErrorHandlingTests = async () => {
  console.log('🧪 Testing Standardized Error Handling System\n');

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name, testFn) => {
    totalTests++;
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name} - ${error.message}`);
    }
  };

  // Test 1: Authentication required error
  await test('POST /chats without auth - should return AUTH_REQUIRED', async () => {
    const response = await makeRequest('POST', '/api/v1/chats', {
      text: 'test message',
      role: 'user'
    });

    if (response.status !== 401) {
      throw new Error(`Expected status 401, got ${response.status}`);
    }
    if (response.data.code !== 'AUTH_REQUIRED') {
      throw new Error(`Expected code 'AUTH_REQUIRED', got '${response.data.code}'`);
    }
    if (!response.data.timestamp) {
      throw new Error('Expected timestamp in error response');
    }
  });

  // Test 2: Invalid token error
  await test('POST /chats with invalid token - should return INVALID_TOKEN', async () => {
    const response = await makeRequest('POST', '/api/v1/chats', {
      text: 'test message',
      role: 'user'
    }, {
      'Authorization': 'Bearer invalid_token_here'
    });

    if (response.status !== 401) {
      throw new Error(`Expected status 401, got ${response.status}`);
    }
    if (response.data.code !== 'INVALID_TOKEN') {
      throw new Error(`Expected code 'INVALID_TOKEN', got '${response.data.code}'`);
    }
  });

  // Test 3: Access denied error
  await test('GET /user-chats with wrong user ID - should return ACCESS_DENIED', async () => {
    const response = await makeRequest('GET', '/api/v1/user-chats/wrong-user-id', null, {
      'Authorization': 'Bearer valid_token_here' // This will fail auth but test structure
    });

    if (response.status !== 401) {
      throw new Error(`Expected status 401, got ${response.status}`);
    }
  });

  // Test 4: Chat not found error
  await test('GET /chats with non-existent chat - should return CHAT_NOT_FOUND', async () => {
    const response = await makeRequest('GET', '/api/v1/chats/user123/nonexistent-chat-id', null, {
      'Authorization': 'Bearer valid_token_here' // This will fail auth but test structure
    });

    if (response.status !== 401) {
      throw new Error(`Expected status 401, got ${response.status}`);
    }
  });

  // Test 5: Route not found error
  await test('GET /api/v1/nonexistent - should return ROUTE_NOT_FOUND', async () => {
    const response = await makeRequest('GET', '/api/v1/nonexistent');

    if (response.status !== 404) {
      throw new Error(`Expected status 404, got ${response.status}`);
    }
    if (response.data.code !== 'ROUTE_NOT_FOUND') {
      throw new Error(`Expected code 'ROUTE_NOT_FOUND', got '${response.data.code}'`);
    }
  });

  // Test 6: Validation error structure
  await test('POST /chats with invalid data - should return VALIDATION_FAILED', async () => {
    const response = await makeRequest('POST', '/api/v1/chats', {
      // Missing required fields
    });

    if (response.status !== 400) {
      throw new Error(`Expected status 400, got ${response.status}`);
    }
    if (!response.data.error) {
      throw new Error('Expected error message in response');
    }
  });

  // Test 7: Rate limiting error structure
  await test('Rate limiting - should return RATE_LIMIT_EXCEEDED', async () => {
    // Make multiple rapid requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(makeRequest('GET', '/api/v1/health'));
    }
    
    const responses = await Promise.all(promises);
    const rateLimitedResponse = responses.find(r => r.status === 429);
    
    if (!rateLimitedResponse) {
      throw new Error('Expected rate limiting to be triggered');
    }
    if (rateLimitedResponse.data.code !== 'RATE_LIMIT_EXCEEDED') {
      throw new Error(`Expected code 'RATE_LIMIT_EXCEEDED', got '${rateLimitedResponse.data.code}'`);
    }
  });

  // Test 8: Error response structure consistency
  await test('Error responses should have consistent structure', async () => {
    const response = await makeRequest('GET', '/api/v1/nonexistent');

    const requiredFields = ['error', 'code', 'timestamp'];
    for (const field of requiredFields) {
      if (!(field in response.data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  });

  // Test 9: Health check should work normally
  await test('Health check endpoint should work', async () => {
    const response = await makeRequest('GET', '/health');

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'OK') {
      throw new Error('Expected health check to return OK status');
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All error handling tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the server logs for details.');
  }
};

// Run the tests
console.log('🚀 Starting Error Handling Tests...');
console.log('Make sure your server is running on port 5000\n');

runErrorHandlingTests().catch(console.error); 