# API Connection Fix for Vercel Deployment

## Problem
Your website was deployed successfully on Vercel and authentication was working, but data fetching failed on all pages. The issue was that many API calls were using relative URLs (like `/api/tasks/today`) instead of the full backend URL.

## Root Cause
When deployed on Vercel, relative API calls like `/api/tasks/today` were trying to fetch from your Vercel frontend domain instead of your Render backend server (`https://studenttasker-backend.onrender.com`).

## Solution
Fixed all API calls to use the proper `apiRequest` helper function or the `getQueryFn` that automatically constructs the full URL with your backend server.

## Files Modified

### 1. Dashboard Page (`client/src/pages/dashboard.tsx`)
- Fixed `/api/tasks/today` API call to use `apiRequest`
- Fixed `/api/tasks/upcoming` API call to use `apiRequest` 
- Fixed `/api/tasks/stats` API call to use `apiRequest`

### 2. Timetable Page (`client/src/pages/timetable.tsx`)
- Added `apiRequest` import
- Fixed timetable fetch, create, update, and delete operations to use `apiRequest`

### 3. Progress Page (`client/src/pages/progress.tsx`)
- Added `apiRequest` import
- Fixed `/api/tasks/stats` and `/api/tasks` API calls

### 4. Calendar Page (`client/src/pages/calendar.tsx`)
- Added `apiRequest` import
- Fixed `/api/tasks` API call

### 5. Password Manager Page (`client/src/pages/password-manager.tsx`)
- Fixed `/api/passwords` API call to use `apiRequest`

### 6. Notes Manager Page (`client/src/pages/notes-manager.tsx`)
- Fixed `/api/notes` API call to use `apiRequest`

### 7. Sidebar Component (`client/src/components/sidebar.tsx`)
- Added `apiRequest` import
- Fixed `/api/auth/me` API call

### 8. Query Client (`client/src/lib/queryClient.ts`)
- Fixed `getQueryFn` to include authentication headers for queries using the default query function

## Configuration Verification
- Backend URL is correctly configured in `vercel.json`: `https://studenttasker-backend.onrender.com`
- Environment variable `VITE_API_URL` is properly set
- Backend server is accessible and responding (tested with 401 response, which is expected without auth)

## Impact
- All data fetching operations now use the correct backend URL
- Authentication headers are properly included in all requests
- The app should now be able to fetch data from all pages when deployed on Vercel

## Next Steps
1. Commit and deploy these changes to Vercel
2. Test all pages to ensure data loading works correctly
3. Verify that authentication and data operations work as expected in production