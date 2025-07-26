import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Database
  mongoUrl: process.env.MONGO_URL,
  
  // Server
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
    // Authentication
  clerkPublishableKey: process.env.REACT_APP_CLERK_PUBLISHABLE_KEY,
  clerkJwtKey: process.env.CLERK_JWT_KEY,
  clerkIssuerUrl: process.env.CLERK_ISSUER_URL,
  
  // Security
  jwtSecret: process.env.JWT_SECRET,
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/*',
    'application/pdf',
    '.doc',
    '.docx',
    '.txt'
  ],
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  chatRateLimitMaxRequests: parseInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS) || 10,
  
  // Validation
  validate() {
    const required = ['mongoUrl', 'clerkPublishableKey', 'clerkJwtKey', 'clerkIssuerUrl', 'jwtSecret',];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

// Validate configuration on import
config.validate();

export default config; 