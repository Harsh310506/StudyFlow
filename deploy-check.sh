#!/bin/bash

# Deployment preparation script
echo "🚀 Preparing StudentTasker for deployment..."

# Check if required files exist
echo "📋 Checking configuration files..."

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found"
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found"  
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found - make sure to set environment variables in deployment platforms"
fi

echo "✅ Configuration files look good"

# Check if build works
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - check your code"
    exit 1
fi

echo "📝 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy backend to Render (connect GitHub repo)"
echo "3. Deploy frontend to Vercel (use 'client' as root directory)"
echo "4. Update CORS and API URLs with actual deployed URLs"
echo ""
echo "🔗 Helpful links:"
echo "- Render: https://dashboard.render.com"
echo "- Vercel: https://vercel.com/dashboard"
echo ""
echo "📖 Full guide: Check DEPLOYMENT_GUIDE.md"