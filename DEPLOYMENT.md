# StudentTasker - Deployment Guide

This project consists of a React frontend and Express.js backend that can be deployed separately.

## Architecture
- **Frontend**: React + Vite + TypeScript (deployed on Vercel)
- **Backend**: Express.js + Node.js (deployed on Render)
- **Database**: PostgreSQL (Neon/Supabase)

## Backend Deployment on Render

### Prerequisites
1. Create a [Render account](https://render.com/)
2. Push your code to GitHub
3. Have your database URL ready

### Steps:
1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Choose the branch (usually `main`)

2. **Configure the service:**
   ```
   Name: studenttasker-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgresql_url_here
   ```

4. **Deploy**
   - Render will automatically build and deploy
   - Note down your backend URL (e.g., `https://studenttasker-backend.onrender.com`)

## Frontend Deployment on Vercel

### Prerequisites
1. Create a [Vercel account](https://vercel.com/)
2. Install Vercel CLI: `npm i -g vercel`

### Steps:

#### Method 1: Using Vercel Dashboard
1. **Import Project**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import from GitHub

2. **Configure:**
   - Framework Preset: Vite
   - Root Directory: `./` (keep as root)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`

3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```

4. **Deploy**

#### Method 2: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_URL production
# Enter your backend URL when prompted
```

## Local Development

### Backend
```bash
npm run dev
```

### Frontend (in development)
The frontend will automatically connect to `http://localhost:3000` for API calls.

## Environment Variables Setup

### Backend (.env)
```env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
```

### Frontend
- Development: Uses `http://localhost:3000`
- Production: Uses `VITE_API_URL` environment variable

## Database Setup

Your database is already configured with Neon/Supabase. Make sure to:

1. **Run migrations** (if needed):
   ```bash
   npm run db:push
   ```

2. **Update DATABASE_URL** in Render environment variables

## Post-Deployment Steps

1. **Update Frontend Config:**
   - Replace `your-render-backend-url.onrender.com` with your actual Render backend URL
   - Update the environment variable in Vercel

2. **Test the Application:**
   - Verify API endpoints are working
   - Test authentication flow
   - Check database connectivity

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Make sure your backend allows requests from your Vercel domain
   - Check CORS configuration in your Express app

2. **Environment Variables:**
   - Ensure all required environment variables are set in both Render and Vercel
   - Check that VITE_API_URL matches your Render backend URL

3. **Build Failures:**
   - Check build logs in both platforms
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

4. **Database Connection:**
   - Verify DATABASE_URL is correctly set
   - Check database is accessible from Render's servers

## URLs After Deployment

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.onrender.com`
- **API Endpoints**: `https://your-app-name.onrender.com/api/*`

## Cost Considerations

- **Render**: Free tier with limitations (sleeps after 15 minutes of inactivity)
- **Vercel**: Free tier for personal projects
- **Database**: Neon/Supabase free tier

For production applications, consider upgrading to paid plans for better performance and reliability.