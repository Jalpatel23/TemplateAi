# Tiered Rate Limiting System

## Overview

The tiered rate limiting system provides differentiated rate limiting based on user authentication status and endpoint type. This ensures better security, user experience, and resource management by applying appropriate limits to different user types.

## Architecture

### 1. General API Rate Limiting (IP-based)
- **Purpose**: Protects all API endpoints from abuse
- **Scope**: All `/api/` routes
- **Key**: IP address
- **Limit**: 100 requests per 15 minutes (configurable)
- **Applied**: `app.use('/api/', generalLimiter)`

### 2. Tiered Chat Rate Limiting (Authentication-based)
- **Purpose**: Different limits for authenticated vs unauthenticated users
- **Scope**: `/api/chats` endpoints
- **Key**: User ID (authenticated) or IP address (unauthenticated)
- **Limits**: 
  - Authenticated: 20 requests per minute
  - Unauthenticated: 5 requests per minute
- **Applied**: `app.use('/api/chats', tieredChatLimiter)`

### 3. User-Specific Rate Limiting (Authenticated users only)
- **Purpose**: Higher limits for authenticated users on user-specific endpoints
- **Scope**: `/api/user-chats` endpoints
- **Key**: User ID
- **Limit**: 200 requests per 15 minutes
- **Applied**: `app.use('/api/user-chats', userSpecificLimiter)`

## Configuration

### Environment Variables

```env
# General API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # 100 requests per window

# Chat Rate Limiting (Tiered)
CHAT_RATE_LIMIT_WINDOW_MS=60000    # 1 minute
CHAT_RATE_LIMIT_MAX_REQUESTS_AUTH=20    # 20 requests for authenticated users
CHAT_RATE_LIMIT_MAX_REQUESTS_UNAUTH=5   # 5 requests for unauthenticated users

# User-Specific Rate Limiting
USER_RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
USER_RATE_LIMIT_MAX_REQUESTS=200   # 200 requests per window
```

### Default Values (if not set)

```javascript
// From config/config.js
rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
rateLimitMaxRequests: 100,
chatRateLimitWindowMs: 1 * 60 * 1000, // 1 minute
chatRateLimitMaxRequestsAuthenticated: 20,
chatRateLimitMaxRequestsUnauthenticated: 5,
userRateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
userRateLimitMaxRequests: 200
```

## Implementation Details

### 1. General Limiter

```javascript
const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  handler: (req, res) => {
    logger.warn(`General rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
    });
  }
});
```

### 2. Tiered Chat Limiter

```javascript
const tieredChatLimiter = rateLimit({
  windowMs: config.chatRateLimitWindowMs,
  max: (req) => {
    // Dynamic limit based on authentication status
    return req.user ? config.chatRateLimitMaxRequestsAuthenticated 
                   : config.chatRateLimitMaxRequestsUnauthenticated;
  },
  keyGenerator: (req) => {
    // Different keys for authenticated vs unauthenticated users
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
  handler: (req, res) => {
    const userType = req.user ? 'authenticated user' : 'unauthenticated user';
    const identifier = req.user ? req.user.id : req.ip;
    logger.warn(`Chat rate limit exceeded for ${userType}: ${identifier}`);
    res.status(429).json({
      error: 'Too many chat requests, please slow down.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.chatRateLimitWindowMs / 1000)
    });
  }
});
```

### 3. User-Specific Limiter

```javascript
const userSpecificLimiter = rateLimit({
  windowMs: config.userRateLimitWindowMs,
  max: config.userRateLimitMaxRequests,
  keyGenerator: (req) => req.user ? `user:${req.user.id}` : req.ip,
  skip: (req) => !req.user, // Skip for unauthenticated users
  handler: (req, res) => {
    const identifier = req.user ? req.user.id : req.ip;
    logger.warn(`User-specific rate limit exceeded for: ${identifier}`);
    res.status(429).json({
      error: 'Too many requests for this user, please try again later.',
      code: 'USER_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.userRateLimitWindowMs / 1000)
    });
  }
});
```

## Error Handling

### Error Codes

The system uses standardized error codes for consistent frontend handling:

```javascript
// From utils/errorHandler.js
RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
CHAT_RATE_LIMIT_EXCEEDED: 'CHAT_RATE_LIMIT_EXCEEDED',
USER_RATE_LIMIT_EXCEEDED: 'USER_RATE_LIMIT_EXCEEDED'
```

### Response Format

All rate limit responses follow a consistent format:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "retryAfter": 60,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Integration

### API Client Handling

The frontend API client (`front/src/config/api.js`) handles rate limiting errors:

```javascript
case 'USER_RATE_LIMIT_EXCEEDED':
  return 'Too many requests for this user. Please wait a moment and try again.';
```

### User Experience

- **Immediate Feedback**: Users receive clear error messages
- **Retry Information**: `retryAfter` field indicates when to retry
- **Progressive Limits**: Authenticated users get higher limits
- **Graceful Degradation**: Unauthenticated users can still use basic features

## Testing

### Test Script

Run the comprehensive test suite:

```bash
node test-tiered-rate-limiting.js
```

### Test Coverage

The test script verifies:

1. **Unauthenticated Chat Limits**: 5 requests/minute
2. **Authenticated Chat Limits**: 20 requests/minute  
3. **User-Specific Limits**: 200 requests/15 minutes
4. **General API Limits**: 100 requests/15 minutes
5. **Rate Limit Headers**: Proper header inclusion
6. **Key Generation**: Different keys for different user types

### Manual Testing

```bash
# Test unauthenticated limits
curl -X POST http://localhost:8080/api/v1/chats \
  -H "Content-Type: application/json" \
  -d '{"text":"test","role":"user"}'

# Test authenticated limits (with valid token)
curl -X POST http://localhost:8080/api/v1/chats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"test","role":"user","userId":"user123"}'
```

## Benefits

### Security
- **DDoS Protection**: IP-based limits prevent abuse
- **Authentication Incentive**: Higher limits encourage user registration
- **Resource Protection**: Prevents server overload

### User Experience
- **Fair Usage**: Different limits for different user types
- **Clear Feedback**: Specific error messages and retry information
- **Progressive Enhancement**: Better experience for authenticated users

### Scalability
- **Efficient Resource Use**: Prevents resource exhaustion
- **Predictable Load**: Controlled request patterns
- **Monitoring**: Detailed logging for analysis

## Monitoring and Logging

### Log Messages

```javascript
// General rate limit exceeded
logger.warn(`General rate limit exceeded for IP: ${req.ip}`);

// Chat rate limit exceeded
logger.warn(`Chat rate limit exceeded for ${userType}: ${identifier}`);

// User-specific rate limit exceeded
logger.warn(`User-specific rate limit exceeded for: ${identifier}`);
```

### Metrics to Monitor

- Rate limit trigger frequency by user type
- IP addresses hitting general limits
- User IDs hitting user-specific limits
- Response times during rate limiting

## Best Practices

### Configuration
- **Start Conservative**: Begin with lower limits and increase based on usage
- **Monitor Usage**: Track rate limit triggers to optimize limits
- **Environment-Specific**: Different limits for development vs production

### Implementation
- **Consistent Headers**: Always include rate limit headers
- **Clear Messages**: Provide actionable error messages
- **Proper Logging**: Log rate limit events for monitoring

### User Communication
- **Progressive Disclosure**: Show limits to users before they hit them
- **Clear Instructions**: Explain how to get higher limits
- **Graceful Handling**: Provide alternatives when limits are reached

## Migration Guide

### From Basic Rate Limiting

If migrating from a basic rate limiting system:

1. **Update Configuration**: Add new environment variables
2. **Deploy Gradually**: Start with conservative limits
3. **Monitor Impact**: Watch for unexpected rate limiting
4. **Adjust Limits**: Fine-tune based on actual usage

### Environment Variables

Add these to your `.env` file:

```env
# Tiered Rate Limiting
CHAT_RATE_LIMIT_MAX_REQUESTS_AUTH=20
CHAT_RATE_LIMIT_MAX_REQUESTS_UNAUTH=5
USER_RATE_LIMIT_MAX_REQUESTS=200
```

## Troubleshooting

### Common Issues

1. **Rate Limits Too Strict**
   - Increase limits in configuration
   - Monitor actual usage patterns

2. **Rate Limits Not Working**
   - Check middleware order in `server.js`
   - Verify authentication middleware is working

3. **Inconsistent Behavior**
   - Ensure proper key generation
   - Check authentication status detection

### Debug Mode

Enable detailed logging:

```javascript
// In config/config.js
const debugMode = process.env.NODE_ENV === 'development';

if (debugMode) {
  console.log('Rate limit configuration:', {
    general: config.rateLimitMaxRequests,
    chatAuth: config.chatRateLimitMaxRequestsAuthenticated,
    chatUnauth: config.chatRateLimitMaxRequestsUnauthenticated,
    user: config.userRateLimitMaxRequests
  });
}
```

## Future Enhancements

### Planned Features

1. **Dynamic Limits**: Adjust limits based on user behavior
2. **Premium Tiers**: Higher limits for premium users
3. **Geographic Limits**: Different limits by region
4. **Time-Based Limits**: Different limits during peak hours

### Advanced Features

1. **Rate Limit Analytics**: Dashboard for monitoring
2. **Automatic Adjustment**: ML-based limit optimization
3. **User Notifications**: Proactive rate limit warnings
4. **Grace Periods**: Temporary limit increases for good users

## Conclusion

The tiered rate limiting system provides a robust, scalable solution for managing API usage while maintaining good user experience. The implementation is production-ready and includes comprehensive testing and monitoring capabilities. 