# Environment Variables Setup for Vercel

## Required Environment Variables

Copy and paste these into your Vercel dashboard under Settings → Environment Variables:

### Database
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Authentication (Clerk)
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_JWT_KEY=your_clerk_jwt_key
CLERK_ISSUER_URL=https://your-clerk-issuer.clerk.accounts.dev
```

### Security
```
JWT_SECRET=your_secure_random_string_here
```

### File Upload Settings
```
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,application/pdf,.doc,.docx,.txt
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CHAT_RATE_LIMIT_WINDOW_MS=60000
CHAT_RATE_LIMIT_MAX_REQUESTS_AUTH=20
CHAT_RATE_LIMIT_MAX_REQUESTS_UNAUTH=5
USER_RATE_LIMIT_WINDOW_MS=900000
USER_RATE_LIMIT_MAX_REQUESTS=200
```

### AI Integration
```
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=your_gemini_api_key
```

## How to Get These Values

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Go to "API Keys" in the sidebar
4. Copy the Publishable Key
5. Go to "JWT Templates" and create a template
6. Copy the JWT key and issuer URL

### JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Use the endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY`

## Important Notes

- **Never commit these values to your repository**
- **Use different keys for development and production**
- **Rotate keys regularly for security**
- **Test all functionality after setting up environment variables** 