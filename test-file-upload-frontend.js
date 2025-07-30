import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Test scenarios
const testScenarios = [
  {
    name: 'Large File Upload (>10MB)',
    description: 'Should return FILE_TOO_LARGE error',
    test: async () => {
      // Create a large file (11MB)
      const largeFilePath = path.join(process.cwd(), 'test-large-file.bin');
      const buffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      fs.writeFileSync(largeFilePath, buffer);
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(largeFilePath));
      formData.append('text', 'Test large file');
      formData.append('role', 'user');
      
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        // Clean up
        fs.unlinkSync(largeFilePath);
        
        if (response.status === 400 && data.code === 'FILE_TOO_LARGE') {
          return { success: true, message: 'Large file correctly blocked' };
        } else {
          return { success: false, message: `Expected FILE_TOO_LARGE, got ${data.code || response.status}` };
        }
      } catch (error) {
        // Clean up
        if (fs.existsSync(largeFilePath)) {
          fs.unlinkSync(largeFilePath);
        }
        return { success: false, message: `Error: ${error.message}` };
      }
    }
  },
  {
    name: 'Dangerous File Upload (.exe)',
    description: 'Should return DANGEROUS_FILE error',
    test: async () => {
      // Create a fake .exe file
      const exeFilePath = path.join(process.cwd(), 'test-malicious.exe');
      fs.writeFileSync(exeFilePath, 'fake executable content');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(exeFilePath), 'test-malicious.exe');
      formData.append('text', 'Test dangerous file');
      formData.append('role', 'user');
      
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        // Clean up
        fs.unlinkSync(exeFilePath);
        
        if (response.status === 400 && data.code === 'DANGEROUS_FILE') {
          return { success: true, message: 'Dangerous file correctly blocked' };
        } else {
          return { success: false, message: `Expected DANGEROUS_FILE, got ${data.code || response.status}` };
        }
      } catch (error) {
        // Clean up
        if (fs.existsSync(exeFilePath)) {
          fs.unlinkSync(exeFilePath);
        }
        return { success: false, message: `Error: ${error.message}` };
      }
    }
  },
  {
    name: 'Unauthenticated File Upload',
    description: 'Should return AUTH_REQUIRED error (in production)',
    test: async () => {
      // Create a valid test file
      const testFilePath = path.join(process.cwd(), 'test-valid.txt');
      fs.writeFileSync(testFilePath, 'This is a valid test file');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath), 'test-valid.txt');
      formData.append('text', 'Test unauthenticated upload');
      formData.append('role', 'user');
      
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        // Clean up
        fs.unlinkSync(testFilePath);
        
        if (response.status === 401 && data.code === 'AUTH_REQUIRED') {
          return { success: true, message: 'Unauthenticated upload correctly blocked' };
        } else {
          return { success: false, message: `Expected AUTH_REQUIRED, got ${data.code || response.status}` };
        }
      } catch (error) {
        // Clean up
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
        return { success: false, message: `Error: ${error.message}` };
      }
    }
  },
  {
    name: 'Invalid File Type Upload',
    description: 'Should return INVALID_FILE_TYPE error',
    test: async () => {
      // Create a file with invalid extension
      const invalidFilePath = path.join(process.cwd(), 'test-invalid.xyz');
      fs.writeFileSync(invalidFilePath, 'This is an invalid file type');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(invalidFilePath), 'test-invalid.xyz');
      formData.append('text', 'Test invalid file type');
      formData.append('role', 'user');
      
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        // Clean up
        fs.unlinkSync(invalidFilePath);
        
        if (response.status === 400 && (data.code === 'INVALID_FILE_TYPE' || data.code === 'VALIDATION_FAILED')) {
          return { success: true, message: 'Invalid file type correctly blocked' };
        } else {
          return { success: false, message: `Expected INVALID_FILE_TYPE, got ${data.code || response.status}` };
        }
      } catch (error) {
        // Clean up
        if (fs.existsSync(invalidFilePath)) {
          fs.unlinkSync(invalidFilePath);
        }
        return { success: false, message: `Error: ${error.message}` };
      }
    }
  }
];

// Run all tests
async function runTests() {
  console.log('🧪 Testing File Upload Error Handling\n');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Test: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    
    try {
      const result = await scenario.test();
      
      if (result.success) {
        console.log(`✅ PASS: ${result.message}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('-'.repeat(40));
  }
  
  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! File upload error handling is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runTests();
}

export { runTests, testScenarios };

// Direct execution
runTests(); 