# StudentTasker Deployment Guide

This guide will help you deploy the StudentTasker application with the backend on Render and the frontend on Vercel.

## Project Structure

- **Backend**: Express.js server in `/server` folder
- **Frontend**: React + Vite application in `/client` folder
- **Database**: PostgreSQL (already configured with Supabase/Neon)
- **Build**: Vite for frontend, esbuild for backend

## Prerequisites

1. GitHub account with your code pushed to a repository
2. [Render](https://render.com) account (for backend)
3. [Vercel](https://vercel.com) account (for frontend)
4. Database URL (you already have this configured)

## Step 1: Deploy Backend to Render

### 1.1 Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your repository: `Harsh310506/StudyFlow`

### 1.2 Configure Web Service

**Basic Settings:**
- **Name**: `studenttasker-backend`
- **Region**: Choose closest to your users (e.g., Singapore, Oregon)
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)
- **Runtime**: `Node`

**Build & Deploy Settings:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Add these environment variables in Render:
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your database URL from `.env`
- `PORT`: Leave empty (Render will auto-assign)

### 1.3 Deploy

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Note your backend URL (e.g., `https://studenttasker-backend.onrender.com`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Update Configuration

Before deploying, update the following files with your actual backend URL:

1. **Update `vercel.json`**:
   ```json
   {
     "env": {
       "VITE_API_URL": "https://your-actual-backend-url.onrender.com"
     }
   }
   ```

2. **Update `client/src/lib/config.ts`**:
   ```typescript
   const config = {
     API_BASE_URL: import.meta.env.VITE_API_URL || (
       import.meta.env.MODE === 'development' 
         ? 'http://localhost:5000'
         : 'https://your-actual-backend-url.onrender.com'  // Update this
     )
   };
   ```

3. **Update CORS in `server/index.ts`**:
   ```typescript
   const corsOptions = {
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-vercel-domain.vercel.app']  // Update this
       : ['http://localhost:5173', 'http://127.0.0.1:5173'],
     credentials: true
   };
   ```

### 2.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (important!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
   Add in Vercel dashboard:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com`

6. Click "Deploy"

## Step 3: Update CORS Configuration

After getting your Vercel URL, update the CORS configuration:

1. Get your Vercel URL (e.g., `https://studenttasker-frontend.vercel.app`)
2. Update `server/index.ts` CORS configuration
3. Push changes to GitHub
4. Render will automatically redeploy

## Step 4: Database Migration

Run database migrations in production:

1. In Render dashboard, go to your service
2. Go to "Shell" tab
3. Run: `npm run db:push`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Vercel domain is added to CORS origins
2. **Build Failures**: Check build logs in Render/Vercel dashboards
3. **Database Connection**: Verify DATABASE_URL is correctly set
4. **API Calls Failing**: Check that VITE_API_URL is properly configured

### Health Check Endpoints:

- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: Check browser console for API calls

## Environment Variables Summary

### Render (Backend):
- `NODE_ENV=production`
- `DATABASE_URL=your_database_url`

### Vercel (Frontend):
- `VITE_API_URL=https://your-backend.onrender.com`

## Post-Deployment Checklist

- [ ] Backend deploys successfully
- [ ] Frontend deploys successfully
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] API calls from frontend to backend work
- [ ] CORS is properly configured

## URLs to Update

Replace placeholders with actual URLs:

1. **In `vercel.json`**: Replace `your-render-backend-url.onrender.com`
2. **In `client/src/lib/config.ts`**: Replace backend URL
3. **In `server/index.ts`**: Replace frontend URL in CORS
4. **Environment variables**: Set correct URLs

## Support

If you encounter issues:
1. Check build logs in respective dashboards
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check browser network tab for failed requests