# Complete Vercel Deployment Guide

## ✅ What's Already Fixed

1. ✅ API routing configured for Vercel serverless functions
2. ✅ Prisma Client generation configured for root access
3. ✅ Error handling improved to show actual error messages
4. ✅ Environment variable configuration
5. ✅ Automatic migration in build command

## Step-by-Step Deployment

### Step 1: Commit and Push Changes

```powershell
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo
git add .
git commit -m "Fix Vercel deployment: API routing and Prisma configuration"
git push origin main
```

### Step 2: Verify Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project (`recycle-hub`)
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Verify these variables exist:

   **Required:**
   - `DATABASE_URL` 
     - Should be automatically provided by Prisma integration
     - Format: `postgresql://user:password@host:port/database?schema=public`
     - Must be available for **Production**, **Preview**, and **Development**

   **Optional (Leave Empty):**
   - `VITE_API_BASE` - Leave empty (uses `/api` automatically)
   - `VITE_API_ORIGIN` - Leave empty (uses relative paths)

5. If `DATABASE_URL` is missing:
   - Click **"Add New"**
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string from Prisma integration
   - Environments: Select **Production**, **Preview**, **Development**

### Step 3: Run Prisma Migrations

**Option A: Via Vercel CLI (Recommended)**

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo
vercel link
# Select: recycle-hub project

# Pull environment variables
vercel env pull .env.local

# Run migrations
cd server
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**

1. Go to **"Storage"** tab in your project
2. Find your **Prisma** or **PostgreSQL** integration
3. Look for **"Migrations"** section
4. Click **"Run Migrations"** or **"Deploy Migrations"**

**Option C: Automatic (Already Configured)**

Migrations will run automatically during the next deployment (configured in `vercel.json` build command).

### Step 4: Redeploy

After pushing changes, Vercel will automatically redeploy. Or manually:

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger deployment

### Step 5: Verify Deployment

#### Test 1: Health Endpoint
Open in browser: `https://your-domain.vercel.app/api/health`

**Expected:** `{"status":"ok"}`
**If 404:** Function not deployed - check Functions tab
**If 500:** Check function logs

#### Test 2: Registration
1. Open your deployed site
2. Try to register a new user
3. Check browser console (F12) for errors
4. The error message should now be specific (not generic)

#### Test 3: Check Logs
1. Vercel Dashboard → **"Logs"** tab
2. Filter by **"Functions"**
3. Try registering again
4. Check for any errors

## Troubleshooting Registration Error

### If you still get "An error occurred while registering":

**1. Check Browser Console (F12)**
- Open Console tab
- Try to register
- Look for the actual error message
- Check Network tab → `/api/auth/register` → Response

**2. Check Vercel Function Logs**
- Dashboard → **"Logs"** → Filter by **"Functions"**
- Look for errors when registering
- Common errors:
  - `Cannot find module '@prisma/client'` → Prisma Client not generated
  - `Can't reach database server` → DATABASE_URL incorrect
  - `Table does not exist` → Migrations not run

**3. Common Fixes:**

**Error: "Cannot find module '@prisma/client'"**
```powershell
# Fix: Regenerate Prisma Client
cd server
npx prisma generate --schema=./prisma/schema.prisma
cd ..
npx prisma generate --schema=./server/prisma/schema.prisma
```

**Error: "Database connection failed"**
- Check `DATABASE_URL` in Vercel environment variables
- Verify it's set for Production environment
- Test connection locally with production URL

**Error: "Table does not exist"**
```powershell
# Fix: Run migrations
vercel env pull .env.local
cd server
npx prisma migrate deploy
```

**Error: "404 Not Found" on `/api/auth/register`**
- Check that `api/index.js` exists
- Verify `vercel.json` has correct rewrites
- Check Functions tab to see if function is deployed

## Verification Checklist

After deployment, verify:

- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API calls with 200/201 status
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works (hubadmin@recyclehub.com / admin123)
- [ ] Database tables exist (check via Prisma Studio)

## Quick Test Commands

```powershell
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Test registration (replace with your domain)
curl -X POST https://your-domain.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

## Next Steps After Successful Deployment

1. ✅ Test all features (registration, login, admin, rewards, etc.)
2. ✅ Set up custom domain (optional)
3. ✅ Configure Vercel Blob Storage for avatar uploads (recommended)
4. ✅ Set up monitoring and alerts

## Need Help?

If issues persist, share:
1. The exact error message from browser console
2. The error from Vercel function logs
3. The response from `/api/health` endpoint
4. Build logs if there are Prisma errors
