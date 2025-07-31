# 🔧 Standardized Error Handling System

This document describes the standardized error handling system implemented across the application.

## 📋 Overview

The error handling system provides consistent error responses across all API endpoints, making it easier for frontend applications to handle errors and provide better user experiences.

## 🏗️ Architecture

### Core Components

1. **`utils/errorHandler.js`** - Centralized error handling utilities
2. **Standardized Error Codes** - Consistent error codes across all endpoints
3. **Enhanced Error Responses** - Structured error responses with metadata
4. **Frontend Integration** - Error code handling in the API client

## 📝 Error Response Format

All error responses follow this standardized format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "details": "Optional additional information"
}
```

## 🏷️ Error Codes

### Authentication Errors
- `AUTH_REQUIRED` - Authentication is required for this operation
- `INVALID_TOKEN` - Invalid or expired authentication token
- `ACCESS_DENIED` - User doesn't have permission for this action

### Validation Errors
- `VALIDATION_FAILED` - Input validation failed
- `MISSING_CHAT_ID` - Chat ID is required
- `MISSING_TITLE` - Title is required and cannot be empty
- `TITLE_TOO_LONG` - Title must be less than 100 characters
- `MISSING_USER_ID` - User ID is required

### Resource Errors
- `CHAT_NOT_FOUND` - Requested chat not found
- `USER_CHATS_NOT_FOUND` - No chats found for user
- `USER_NOT_FOUND` - User not found
- `ROUTE_NOT_FOUND` - API route not found

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED` - Too many requests from this IP
- `CHAT_RATE_LIMIT_EXCEEDED` - Too many chat requests

### Server Errors
- `INTERNAL_SERVER_ERROR` - Internal server error
- `DATABASE_ERROR` - Database operation failed

### API Errors
- `INVALID_REQUEST` - Invalid request format
- `METHOD_NOT_ALLOWED` - HTTP method not allowed

## 🔧 Implementation

### Backend Usage

#### 1. Import Error Handler Utilities
```javascript
import { 
  createErrorResponse, 
  ERROR_CODES, 
  asyncErrorHandler, 
  errorHandler 
} from './utils/errorHandler.js';
```

#### 2. Use in Route Handlers
```javascript
// Simple error response
return res.status(401).json(createErrorResponse(ERROR_CODES.AUTH_REQUIRED));

// Error response with custom message
return res.status(403).json(createErrorResponse(ERROR_CODES.ACCESS_DENIED, "Custom message"));

// Wrap async handlers
apiV1Router.post('/chats', asyncErrorHandler(async (req, res) => {
  // Your route logic here
  // Errors are automatically caught and formatted
}));
```

#### 3. Global Error Handler
```javascript
// Centralized error handling middleware
app.use(errorHandler);
```

### Frontend Usage

#### 1. Enhanced Error Objects
The API client now returns enhanced error objects with additional properties:

```javascript
try {
  await apiRequest('/api/v1/chats', { method: 'POST', body: data });
} catch (error) {
  console.log(error.message);    // Human-readable message
  console.log(error.code);       // Error code (e.g., 'AUTH_REQUIRED')
  console.log(error.status);     // HTTP status code
  console.log(error.timestamp);  // Error timestamp
}
```

#### 2. Error Code Handling
```javascript
switch (error.code) {
  case 'AUTH_REQUIRED':
    // Redirect to login
    break;
  case 'CHAT_NOT_FOUND':
    // Show "chat not found" message
    break;
  case 'RATE_LIMIT_EXCEEDED':
    // Show "please wait" message
    break;
  default:
    // Handle unknown errors
}
```

## 🧪 Testing

### Running Error Handling Tests
```bash
# Start your server
npm run jp

# In another terminal, run error handling tests
node test-error-handling.js
```

### Test Coverage
The test suite covers:
- ✅ Authentication error responses
- ✅ Validation error responses
- ✅ Resource not found errors
- ✅ Rate limiting errors
- ✅ Error response structure consistency
- ✅ Health check functionality

## 📊 Benefits

### For Developers
1. **Consistency** - All errors follow the same format
2. **Maintainability** - Centralized error handling logic
3. **Debugging** - Enhanced error logging with context
4. **Type Safety** - Standardized error codes prevent typos

### For Users
1. **Better UX** - Clear, actionable error messages
2. **Consistency** - Same error format across all features
3. **Accessibility** - Error codes for screen readers
4. **Internationalization** - Easy to translate error messages

### For Frontend
1. **Predictable** - Know exactly what error format to expect
2. **Code Reuse** - Single error handling logic
3. **User Feedback** - Show appropriate messages based on error codes
4. **Error Recovery** - Implement retry logic based on error types

## 🔄 Migration Guide

### From Old Error Format
**Before:**
```javascript
return res.status(404).json({ error: "Chat not found" });
```

**After:**
```javascript
return res.status(404).json(createErrorResponse(ERROR_CODES.CHAT_NOT_FOUND));
```

### Frontend Error Handling
**Before:**
```javascript
if (response.status === 401) {
  // Handle auth error
}
```

**After:**
```javascript
if (error.code === 'AUTH_REQUIRED') {
  // Handle auth error with specific context
}
```

## 🚀 Best Practices

### Backend
1. **Always use error codes** - Don't return plain error messages
2. **Use asyncErrorHandler** - Wrap async route handlers
3. **Log errors with context** - Include user ID, IP, etc.
4. **Be specific** - Use the most appropriate error code

### Frontend
1. **Handle error codes** - Don't rely on HTTP status codes alone
2. **Show user-friendly messages** - Translate error codes to user messages
3. **Implement retry logic** - For transient errors like rate limiting
4. **Log errors for debugging** - Include error codes in logs

## 📈 Monitoring

### Error Tracking
The system logs detailed error information including:
- Error message and stack trace
- Request URL and method
- User ID (if authenticated)
- IP address
- Timestamp

### Metrics to Track
- Error code frequency
- Response time for error cases
- User impact of different error types
- Rate limiting effectiveness

## 🔮 Future Enhancements

1. **Error Categories** - Group errors by severity/type
2. **Retry Logic** - Automatic retry for transient errors
3. **Error Analytics** - Dashboard for error patterns
4. **Custom Error Pages** - User-friendly error pages
5. **Error Reporting** - Integration with error reporting services

---

**Note**: This error handling system is designed to be extensible and maintainable. When adding new endpoints, always use the standardized error handling utilities. 