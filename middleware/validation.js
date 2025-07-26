import { body, param, validationResult } from 'express-validator';
import config from '../config/config.js';

// Sanitize and validate text input
export const sanitizeText = (field) => {
  return body(field)
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage(`${field} must be between 1 and 10,000 characters`)
    .escape()
    .customSanitizer(value => {
      // Remove potentially dangerous HTML/script tags
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    });
};

// Validate file upload
export const validateFile = (field) => {
  return body(field)
    .optional()
    .custom((value, { req }) => {
      if (!req.file) return true;
      
      // Check file size
      if (req.file.size > config.maxFileSize) {
        throw new Error(`File size must be less than ${config.maxFileSize / (1024 * 1024)}MB`);
      }
      
      // Check file type
      const allowedTypes = config.allowedFileTypes;
      const fileType = req.file.mimetype;
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
      
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          return fileType.startsWith(type.replace('*', ''));
        }
        return fileType === type || `.${fileExtension}` === type;
      });
      
      if (!isAllowed) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      // Additional security checks
      if (req.file.originalname.includes('..') || req.file.originalname.includes('/')) {
        throw new Error('Invalid filename');
      }
      
      // Check for malicious file extensions
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
      if (dangerousExtensions.includes(fileExtension.toLowerCase())) {
        throw new Error('File type not allowed for security reasons');
      }
      
      return true;
    });
};

// Validate user ID
export const validateUserId = () => {
  return param('userId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be a valid string between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('User ID contains invalid characters');
};

// Validate chat ID
export const validateChatId = () => {
  return param('chatId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat ID must be a valid string between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Chat ID contains invalid characters');
};

// Validate chat message
export const validateChatMessage = () => {
  return [
    sanitizeText('text'),
    validateFile('file'),
    body('role')
      .optional()
      .isIn(['user', 'model'])
      .withMessage('Role must be either "user" or "model"'),
    body('chatId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Chat ID must be a valid string between 1 and 100 characters'),
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters')
      .escape()
  ];
};

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Rate limiting validation
export const validateRateLimit = (req, res, next) => {
  const userIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  // Basic bot detection
  if (!userAgent || userAgent.length < 10) {
    return res.status(429).json({
      error: 'Suspicious request pattern detected',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
  
  next();
}; 