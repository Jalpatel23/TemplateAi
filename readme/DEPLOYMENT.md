# Vercel Deployment Guide for HSD Project

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Database**: Set up a MongoDB Atlas cluster
4. **Clerk Account**: Set up authentication at [clerk.com](https://clerk.com)
5. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Prepare Your Repository

Make sure your repository has the following structure:
```
hsd/
├── server.vercel.js
├── vercel.json
├── package.json
├── config/
├── middleware/
├── models/
├── routes/
├── utils/
└── front/
    ├── package.json
    ├── src/
    └── public/
```

## Step 2: Set Up Environment Variables

In your Vercel dashboard, add these environment variables:

### Database
- `MONGO_URL`: Your MongoDB Atlas connection string

### Authentication (Clerk)
- `REACT_APP_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_JWT_KEY`: Your Clerk JWT key
- `CLERK_ISSUER_URL`: Your Clerk issuer URL

### Security
- `JWT_SECRET`: A secure random string for JWT signing

### File Upload
- `MAX_FILE_SIZE`: 10485760 (10MB)
- `ALLOWED_FILE_TYPES`: image/*,application/pdf,.doc,.docx,.txt

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: 900000 (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: 100
- `CHAT_RATE_LIMIT_WINDOW_MS`: 60000 (1 minute)
- `CHAT_RATE_LIMIT_MAX_REQUESTS_AUTH`: 20
- `CHAT_RATE_LIMIT_MAX_REQUESTS_UNAUTH`: 5
- `USER_RATE_LIMIT_WINDOW_MS`: 900000 (15 minutes)
- `USER_RATE_LIMIT_MAX_REQUESTS`: 200

### AI Integration
- `REACT_APP_GEMINI_API_URL`: Your Gemini API endpoint with key

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Node.js
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: Leave empty (handled by vercel.json)
   - **Output Directory**: Leave empty (handled by vercel.json)
   - **Install Command**: `npm install && cd front && npm install`

5. Add all environment variables listed above
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

## Step 4: Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update your Clerk application settings with the new domain
5. Update the CORS settings in `server.vercel.js` with your domain

## Step 5: Update CORS Settings

After deployment, update the CORS settings in `server.vercel.js`:

```javascript
const corsOptions = {
  origin: config.nodeEnv === 'production' 
    ? ['https://your-actual-domain.vercel.app'] // Replace with your actual domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  // ... rest of the config
};
```

## Step 6: Test Your Deployment

1. Visit your deployed URL
2. Test the authentication flow
3. Test sending messages
4. Test file uploads
5. Check the health endpoint: `https://your-domain.vercel.app/health`

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in package.json
   - Ensure Node.js version is compatible (16+)

2. **Environment Variables**:
   - Double-check all environment variables are set in Vercel
   - Ensure no typos in variable names

3. **CORS Errors**:
   - Update CORS settings with your actual domain
   - Check Clerk domain settings

4. **Database Connection**:
   - Verify MongoDB Atlas network access allows Vercel IPs
   - Check connection string format

5. **File Upload Issues**:
   - Ensure uploads directory exists
   - Check file size and type restrictions

### Debugging:

1. Check Vercel function logs in the dashboard
2. Use the health endpoint to test API connectivity
3. Check browser console for frontend errors
4. Verify all environment variables are loaded correctly

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Authentication flow working
- [ ] File uploads working
- [ ] Chat functionality working
- [ ] Error handling working
- [ ] Rate limiting configured
- [ ] CORS settings updated
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Performance monitoring set up

## Performance Optimization

1. **Enable Vercel Analytics** in your dashboard
2. **Set up monitoring** for your API endpoints
3. **Configure caching** for static assets
4. **Optimize images** and other media files
5. **Enable compression** for better performance

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Only allow necessary origins
3. **Rate Limiting**: Configure appropriate limits for your use case
4. **File Uploads**: Validate all uploaded files
5. **Authentication**: Use secure JWT tokens and proper session management

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Test locally with production environment variables
4. Contact Vercel support if needed 