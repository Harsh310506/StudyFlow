# Deployment Checklist

## Pre-Deployment ✅

- [ ] Code is pushed to GitHub repository
- [ ] Environment variables are configured
- [ ] Build process works locally (`npm run build`)
- [ ] Database URL is configured
- [ ] No sensitive data in code (API keys, passwords)

## Backend Deployment (Render) 🚀

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install && npm run build`  
- [ ] Set start command: `npm start`
- [ ] Configure environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=your_database_url`
- [ ] Deploy and get backend URL
- [ ] Test backend health endpoint

## Frontend Deployment (Vercel) 🎨

- [ ] Create new project on Vercel
- [ ] Set root directory to `client`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Configure environment variables:
  - [ ] `VITE_API_URL=your_backend_url`
- [ ] Deploy and get frontend URL

## Post-Deployment Configuration 🔧

- [ ] Update CORS in `server/index.ts` with frontend URL
- [ ] Update API URL in `client/src/lib/config.ts` with backend URL  
- [ ] Update `vercel.json` with correct backend URL
- [ ] Redeploy both services after URL updates
- [ ] Test full application flow

## Testing 🧪

- [ ] Frontend loads correctly
- [ ] API calls work from frontend to backend
- [ ] Authentication flows work
- [ ] Database operations work
- [ ] No CORS errors in browser console
- [ ] Mobile responsive design works

## URLs to Replace 📝

Replace these placeholders with actual URLs:

1. **Backend URL**: `https://studenttasker-backend.onrender.com`
2. **Frontend URL**: `https://studenttasker-frontend.vercel.app`

Update in these files:
- `server/index.ts` (CORS configuration)
- `client/src/lib/config.ts` (API base URL)
- `vercel.json` (environment variables)
- Environment variables in both platforms

## Troubleshooting 🔍

Common issues and solutions:

1. **Build fails**: Check package.json scripts and dependencies
2. **CORS errors**: Verify frontend URL is in CORS origins
3. **API calls fail**: Check VITE_API_URL environment variable
4. **Database connection**: Verify DATABASE_URL is correct
5. **404 on routes**: Ensure Vercel rewrites are configured

## Success Criteria ✨

Your deployment is successful when:
- [ ] Both frontend and backend are accessible via HTTPS
- [ ] Users can register/login
- [ ] Tasks can be created/updated/deleted  
- [ ] All pages load without errors
- [ ] API responses are working correctly