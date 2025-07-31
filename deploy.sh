#!/bin/bash

# HSD Project Vercel Deployment Script
echo "🚀 Starting HSD Project Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the frontend
echo "📦 Building frontend..."
cd front
npm install
npm run build
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Don't forget to:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Update CORS settings with your domain"
echo "   3. Test the deployment"
echo "   4. Configure custom domain (optional)" 