import logger from './logger.js';

// Standard error codes for consistent frontend handling
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MISSING_CHAT_ID: 'MISSING_CHAT_ID',
  MISSING_TITLE: 'MISSING_TITLE',
  TITLE_TOO_LONG: 'TITLE_TOO_LONG',
  MISSING_USER_ID: 'MISSING_USER_ID',
  
  // Resource errors
  CHAT_NOT_FOUND: 'CHAT_NOT_FOUND',
  USER_CHATS_NOT_FOUND: 'USER_CHATS_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CHAT_RATE_LIMIT_EXCEEDED: 'CHAT_RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // API errors
  INVALID_REQUEST: 'INVALID_REQUEST',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED'
};

// Standard error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication required for this operation',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid or expired token',
  [ERROR_CODES.ACCESS_DENIED]: 'Access denied - insufficient permissions',
  [ERROR_CODES.VALIDATION_FAILED]: 'Validation failed - check your input',
  [ERROR_CODES.MISSING_CHAT_ID]: 'Chat ID is required',
  [ERROR_CODES.MISSING_TITLE]: 'Title is required and cannot be empty',
  [ERROR_CODES.TITLE_TOO_LONG]: 'Title must be less than 100 characters',
  [ERROR_CODES.MISSING_USER_ID]: 'User ID is required',
  [ERROR_CODES.CHAT_NOT_FOUND]: 'Chat not found',
  [ERROR_CODES.USER_CHATS_NOT_FOUND]: 'No chats found for user',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.ROUTE_NOT_FOUND]: 'Route not found',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests, please try again later',
  [ERROR_CODES.CHAT_RATE_LIMIT_EXCEEDED]: 'Too many chat requests, please slow down',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.INVALID_REQUEST]: 'Invalid request',
  [ERROR_CODES.METHOD_NOT_ALLOWED]: 'Method not allowed'
};

// Create standardized error response
export const createErrorResponse = (code, message = null, details = null) => {
  const errorMessage = message || ERROR_MESSAGES[code] || 'An error occurred';
  
  const response = {
    error: errorMessage,
    code: code,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
};

// Standardized error handler for API endpoints
export const handleApiError = (error, req, res, operation = 'API operation') => {
  // Log the error with context
  logger.error(`${operation} failed:`, {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || 'unauthenticated',
    ip: req.ip
  });

  // Determine error type and response
  let statusCode = 500;
  let errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
  let errorMessage = null;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_FAILED;
    errorMessage = 'Validation failed';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.INVALID_REQUEST;
    errorMessage = 'Invalid data format';
  } else if (error.code === 11000) {
    statusCode = 409;
    errorCode = ERROR_CODES.INVALID_REQUEST;
    errorMessage = 'Duplicate entry';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    errorCode = ERROR_CODES.CHAT_NOT_FOUND;
  } else if (error.message.includes('access denied')) {
    statusCode = 403;
    errorCode = ERROR_CODES.ACCESS_DENIED;
  } else if (error.message.includes('authentication')) {
    statusCode = 401;
    errorCode = ERROR_CODES.AUTH_REQUIRED;
  }

  const errorResponse = createErrorResponse(errorCode, errorMessage);
  res.status(statusCode).json(errorResponse);
};

// Middleware for handling async route errors
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleApiError(error, req, res);
    });
  };
};

// Centralized error handling middleware
export const errorHandler = (error, req, res, next) => {
  handleApiError(error, req, res, 'Unhandled error');
};

// Success response helper
export const createSuccessResponse = (data, message = null) => {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}; 