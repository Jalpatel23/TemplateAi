# Template AI - Intelligent Chat Assistant

A modern, AI-powered chat application built with React, Node.js, and MongoDB. Features real-time chat with AI models, file uploads, and user authentication.

## 🚀 Features

- **AI Chat Interface**: Powered by Google's Gemini AI models
- **User Authentication**: Secure authentication with Clerk
- **File Uploads**: Support for images, PDFs, and documents
- **Chat History**: Persistent chat storage and management
- **Dark/Light Theme**: Customizable theme system
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live chat experience
- **Code Highlighting**: Syntax highlighting for code blocks

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Bootstrap 5
- Lucide React (Icons)
- React Markdown
- React Syntax Highlighter

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Clerk Authentication
- Winston (Logging)
- Express Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Clerk account for authentication
- Google Gemini API key

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd hsd
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd front
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database Configuration
MONGO_URL=mongodb://localhost:27017/template_ai

# Authentication (Clerk)
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_JWT_KEY=your_clerk_jwt_key
CLERK_ISSUER_URL=https://your-clerk-instance.clerk.accounts.dev

# API Configuration
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# Environment
NODE_ENV=development
PORT=8080

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,application/pdf,.doc,.docx,.txt

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CHAT_RATE_LIMIT_MAX_REQUESTS=10
```

### 4. Database Setup

Ensure MongoDB is running and accessible at the URL specified in your `.env` file.

### 5. Start the application

```bash
# Development mode (runs both frontend and backend)
npm run jp

# Or run separately:
# Backend only
npm run server

# Frontend only
npm run front
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 🔒 Security Considerations

### Production Deployment Checklist

- [ ] **Environment Variables**: All sensitive data moved to environment variables
- [ ] **HTTPS**: SSL/TLS certificates configured
- [ ] **CORS**: Proper CORS configuration for production domains
- [ ] **Rate Limiting**: Implemented and configured for production load
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Authentication**: Proper authentication middleware implemented
- [ ] **File Upload Security**: File type and size restrictions enforced
- [ ] **Database Security**: MongoDB authentication and network security
- [ ] **Logging**: Structured logging for monitoring and debugging
- [ ] **Error Handling**: Generic error messages to prevent information leakage

### Security Features Implemented

- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **CORS Protection**: Cross-origin requests are properly configured
- **Authentication**: JWT-based authentication with Clerk
- **File Upload Security**: File type and size validation
- **Helmet.js**: Security headers for Express.js
- **Input Validation**: Comprehensive validation using express-validator

## 📊 API Endpoints

### Authentication Required
- `POST /api/v1/chats` - Save chat message
- `GET /api/v1/chats/:userId/:chatId` - Get chat history
- `GET /api/v1/user-chats/:userId` - Get user's chat list
- `DELETE /api/v1/user-chats/:userId/remove-chat` - Delete chat
- `PUT /api/v1/user-chats/:userId/update-chat-title` - Update chat title

### Public
- `GET /health` - Health check endpoint

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
MONGO_URL=your_production_mongodb_url
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://your-api-domain.com
```

### Build for Production

```bash
# Build frontend
cd front
npm run build
cd ..

# Start production server
npm start
```

### Recommended Hosting Platforms

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, Railway, or AWS EC2
- **Database**: MongoDB Atlas or AWS DocumentDB

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URL in .env file
   - Verify network connectivity

2. **Clerk Authentication Issues**
   - Verify Clerk publishable key
   - Check Clerk dashboard settings
   - Ensure proper domain configuration

3. **File Upload Failures**
   - Check file size limits
   - Verify allowed file types
   - Ensure proper file permissions

4. **Rate Limiting**
   - Check rate limit configuration
   - Monitor API usage
   - Adjust limits if needed

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies regularly
- [ ] Monitor security advisories
- [ ] Review and update rate limiting
- [ ] Backup database regularly
- [ ] Monitor application performance
- [ ] Update SSL certificates
- [ ] Review access logs for suspicious activity

### Performance Monitoring

- [ ] Set up application monitoring (e.g., New Relic, DataDog)
- [ ] Monitor database performance
- [ ] Track API response times
- [ ] Monitor error rates
- [ ] Set up alerts for critical issues 