# Environment Variables Setup Guide

## Backend Environment Variables (.env in root directory)

Create a `.env` file in the root directory with the following variables:

```bash
# Database
MONGO_URL=mongodb://localhost:27017/hsd_chat_app

# Server Configuration
PORT=8080
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Clerk Authentication
CLERK_JWT_KEY=your_clerk_jwt_key_here
CLERK_ISSUER_URL=https://your-clerk-issuer-url.clerk.accounts.dev

# JWT Secret (for additional security)
JWT_SECRET=your_jwt_secret_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,application/pdf,.doc,.docx,.txt

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CHAT_RATE_LIMIT_MAX_REQUESTS=10
```

## Frontend Environment Variables (.env in front directory)

Create a `.env` file in the `front` directory with the following variables:

```bash
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# API Configuration
REACT_APP_API_URL=http://localhost:8080

# Gemini AI API
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=your_gemini_api_key_here
```

## Setup Instructions

1. **MongoDB Setup:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGO_URL` with your connection string

2. **Clerk Authentication Setup:**
   - Create an account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the publishable key to `REACT_APP_CLERK_PUBLISHABLE_KEY`
   - Copy the JWT key to `CLERK_JWT_KEY`
   - Copy the issuer URL to `CLERK_ISSUER_URL`

3. **Gemini AI Setup:**
   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Update `REACT_APP_GEMINI_API_URL` with your API key

4. **JWT Secret:**
   - Generate a random string for `JWT_SECRET`
   - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Production Deployment

For production, update the URLs to your actual domain:

```bash
# Backend
FRONTEND_URL=https://your-domain.com
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
```

## Troubleshooting

- **MongoDB Connection Error:** Check your `MONGO_URL` and ensure MongoDB is running
- **Clerk Authentication Issues:** Verify your Clerk keys and domain settings
- **API Errors:** Check that all environment variables are properly set
- **CORS Errors:** Ensure `FRONTEND_URL` matches your frontend domain 