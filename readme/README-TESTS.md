# 🔒 Security Test Suite

This directory contains security test files to validate your application's authentication and authorization.

## 📁 Test Files

### `test-security-simple.js`
- **Purpose**: Tests development server (`server.js`) security
- **Usage**: `node test-security-simple.js`
- **Note**: Development server may allow some unauthenticated access (expected behavior)

### `test-production-security.js`
- **Purpose**: Tests production server (`server.prod.js`) security
- **Usage**: `node test-production-security.js`
- **Note**: Production server enforces strict authentication

## 🚀 How to Run Tests

### 1. Test Development Server
```bash
# Start development server
npm run jp

# In another terminal, run tests
node test-security-simple.js
```

### 2. Test Production Server
```bash
# Start production server
node server.prod.js

# In another terminal, run tests
node test-production-security.js
```

## 📊 Expected Results

### Development Server Tests
- May show some "PARTIAL" results (expected for development)
- Tests basic security middleware

### Production Server Tests
- Should show all "PASS" results
- Validates strict authentication enforcement

## 🛡️ What These Tests Verify

1. **Authentication Required**: All chat endpoints require valid authentication
2. **Invalid Token Handling**: Invalid tokens are properly rejected
3. **Unauthorized Access**: Unauthenticated requests are blocked
4. **Rate Limiting**: API rate limiting is working correctly

## 💡 When to Use

- **Before Deployment**: Run production tests before going live
- **After Changes**: Test after making security-related changes
- **CI/CD**: Can be integrated into automated testing pipelines
- **Documentation**: Serves as examples of API security testing

## 🔧 Customization

You can modify the test files to:
- Add more test cases
- Test different endpoints
- Validate specific security scenarios
- Integrate with your testing framework

---

**Note**: These files are safe to keep in your project and provide valuable security validation. 