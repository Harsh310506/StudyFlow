@echo off
echo 🚀 Preparing StudentTasker for deployment...

REM Check if required files exist
echo 📋 Checking configuration files...

if not exist "vercel.json" (
    echo ❌ vercel.json not found
    exit /b 1
)

if not exist "render.yaml" (
    echo ❌ render.yaml not found  
    exit /b 1
)

if not exist ".env" (
    echo ⚠️  .env file not found - make sure to set environment variables in deployment platforms
)

echo ✅ Configuration files look good

REM Check if build works
echo 🔨 Testing build process...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed - check your code
    exit /b 1
)

echo ✅ Build successful
echo.
echo 📝 Next steps:
echo 1. Push your code to GitHub
echo 2. Deploy backend to Render (connect GitHub repo)
echo 3. Deploy frontend to Vercel (use 'client' as root directory)
echo 4. Update CORS and API URLs with actual deployed URLs
echo.
echo 🔗 Helpful links:
echo - Render: https://dashboard.render.com
echo - Vercel: https://vercel.com/dashboard
echo.
echo 📖 Full guide: Check DEPLOYMENT_GUIDE.md

pause