# Complete Vercel Deployment Steps

## Step 1: Fix Backend Connection Issues

The backend is not connecting because the API routes need adjustment. I've already fixed this in the code.

## Step 2: Commit and Push Changes

```powershell
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo
git add .
git commit -m "Fix Vercel serverless function routing"
git push origin main
```

## Step 3: Verify Vercel Environment Variables

Go to your Vercel dashboard → Project Settings → Environment Variables:

**Required Variables:**
1. **DATABASE_URL** 
   - Should be automatically provided by Prisma integration
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Make sure it's set for **Production**, **Preview**, and **Development**

2. **VITE_API_BASE** (Optional)
   - Leave empty (will use `/api` automatically)

3. **VITE_API_ORIGIN** (Optional)
   - Leave empty (will use relative paths)

## Step 4: Run Prisma Migrations

### Option A: Via Vercel CLI (Recommended)

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Link project (if not linked)
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
cd server
npx prisma migrate deploy
```

### Option B: Via Vercel Dashboard

1. Go to your project dashboard
2. Click **"Storage"** tab
3. Find your Prisma/PostgreSQL integration
4. Look for **"Migrations"** section
5. Click **"Run Migrations"** or **"Deploy Migrations"**

### Option C: Automatic (Already Configured)

Migrations will run automatically during the next deployment (configured in `vercel.json`).

## Step 5: Redeploy

After pushing changes, Vercel will automatically redeploy. Or manually trigger:

1. Go to Vercel dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Or push a new commit to trigger deployment

## Step 6: Test the API

### Test Health Endpoint:
Open in browser: `https://your-domain.vercel.app/api/health`
Should return: `{"status":"ok"}`

### Test Registration:
1. Open your deployed site
2. Try to register a new user
3. Check browser console (F12) for errors
4. Check Vercel function logs

## Troubleshooting Backend Connection

### Check Function Logs:
1. Go to Vercel dashboard → Your project
2. Click **"Logs"** tab
3. Look for errors when you try to register

### Common Issues:

**1. "Cannot find module '@prisma/client'"**
- **Fix**: Prisma Client not generated
- **Solution**: Check that `installCommand` in `vercel.json` includes `npx prisma generate`

**2. "Database connection failed"**
- **Fix**: `DATABASE_URL` not set or incorrect
- **Solution**: 
  - Go to Settings → Environment Variables
  - Verify `DATABASE_URL` is set
  - Check it matches your Prisma integration

**3. "Table does not exist"**
- **Fix**: Migrations not run
- **Solution**: Run `npx prisma migrate deploy` (see Step 4)

**4. "404 Not Found" on API routes**
- **Fix**: Routing issue
- **Solution**: 
  - Verify `vercel.json` has correct rewrites
  - Check that `api/index.js` exists
  - Verify function is deployed (check Functions tab in Vercel)

**5. CORS Errors**
- **Fix**: CORS not configured
- **Solution**: Already configured in `api/index.js` with `app.use(cors())`

### Debug Steps:

1. **Check Build Logs:**
   - Vercel Dashboard → Deployment → "Build Logs"
   - Look for Prisma generation errors

2. **Check Runtime Logs:**
   - Vercel Dashboard → Deployment → "Runtime Logs"
   - Look for API errors when registering

3. **Test API Directly:**
   ```bash
   # Test health endpoint
   curl https://your-domain.vercel.app/api/health
   
   # Test registration (replace with your domain)
   curl -X POST https://your-domain.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"test123"}'
   ```

4. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to register
   - Check the `/api/auth/register` request
   - Look at Response and Status code

## Quick Fix Checklist

- [ ] Committed and pushed latest changes
- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] Prisma migrations have been run
- [ ] Redeployed the project
- [ ] Tested `/api/health` endpoint
- [ ] Checked function logs for errors
- [ ] Verified Prisma Client is generated (check build logs)

## After Fixing

Once the backend is connected:
1. Test user registration
2. Test user login
3. Test admin login (hubadmin@recyclehub.com / admin123)
4. Verify database tables are created
5. Test other API endpoints

## Need More Help?

If issues persist:
1. Share the error from browser console
2. Share the error from Vercel function logs
3. Share the build logs if there are Prisma errors
