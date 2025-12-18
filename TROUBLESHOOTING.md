# Troubleshooting: Backend Not Connected on Vercel

## Quick Diagnosis Steps

### 1. Test API Health Endpoint
Open in browser: `https://your-domain.vercel.app/api/health`

**Expected:** `{"status":"ok"}`
**If 404:** Function not deployed or routing issue
**If 500:** Function error (check logs)

### 2. Check Browser Console
1. Open your deployed site
2. Press F12 → Console tab
3. Try to register
4. Look for errors like:
   - `Failed to fetch`
   - `NetworkError`
   - `404 Not Found`
   - `500 Internal Server Error`

### 3. Check Network Tab
1. F12 → Network tab
2. Try to register
3. Find the `/api/auth/register` request
4. Check:
   - **Status Code** (should be 200 or 201)
   - **Response** (click to see error message)
   - **Request URL** (should be your Vercel domain)

### 4. Check Vercel Function Logs
1. Vercel Dashboard → Your Project
2. Click **"Logs"** tab
3. Filter by **"Functions"**
4. Try to register again
5. Look for errors in the logs

## Common Issues & Fixes

### Issue 1: "Cannot find module '@prisma/client'"

**Error in logs:**
```
Error: Cannot find module '@prisma/client'
```

**Fix:**
1. Verify `installCommand` in `vercel.json` includes `npx prisma generate`
2. Check build logs to see if Prisma Client was generated
3. If not, add to `package.json` scripts:
   ```json
   "postinstall": "cd server && npx prisma generate && cd .."
   ```

### Issue 2: "Database connection failed"

**Error in logs:**
```
PrismaClientInitializationError: Can't reach database server
```

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Verify `DATABASE_URL` is set
3. Check it's available for **Production** environment
4. Verify the connection string is correct
5. Test connection: `npx prisma db pull` (locally with production URL)

### Issue 3: "Table does not exist"

**Error in logs:**
```
P2021: The table `public.User` does not exist
```

**Fix:**
1. Run migrations:
   ```bash
   vercel env pull .env.local
   cd server
   npx prisma migrate deploy
   ```
2. Or via Vercel Dashboard → Storage → Prisma → Run Migrations

### Issue 4: "404 Not Found" on API routes

**Error:** Browser shows 404 when calling `/api/auth/register`

**Fix:**
1. Verify `vercel.json` has correct rewrites
2. Check that `api/index.js` exists in your repo
3. Verify the function is deployed (check Functions tab)
4. Check that routes don't have double `/api/api/` prefix

### Issue 5: CORS Errors

**Error in console:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix:**
- Already configured in `api/index.js` with `app.use(cors())`
- If still occurs, check that CORS middleware is before routes

### Issue 6: "An error occurred while registering"

**This is a generic error from the frontend catch block**

**To debug:**
1. Check browser console for the actual error
2. Check Network tab → `/api/auth/register` → Response
3. Check Vercel function logs for backend errors
4. The error might be:
   - Database connection issue
   - Prisma Client not generated
   - Missing environment variables
   - Table doesn't exist (migrations not run)

## Step-by-Step Fix

### Step 1: Verify Environment Variables
```powershell
# Pull and check
vercel env pull .env.local
cat .env.local
# Should see DATABASE_URL
```

### Step 2: Test Database Connection
```powershell
cd server
npx prisma db pull
# Should connect successfully
```

### Step 3: Run Migrations
```powershell
cd server
npx prisma migrate deploy
# Should create all tables
```

### Step 4: Generate Prisma Client
```powershell
cd server
npx prisma generate
# Should generate client
```

### Step 5: Test Locally with Production DB
```powershell
# Set DATABASE_URL to production URL
$env:DATABASE_URL="your-production-database-url"
cd server
npm run dev
# Test registration locally
```

### Step 6: Redeploy
```powershell
git add .
git commit -m "Fix backend connection"
git push origin main
# Vercel will auto-deploy
```

## Verification Checklist

After fixing, verify:

- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls (200/201 status)
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Database tables exist (check via Prisma Studio or database client)

## Get Detailed Error Information

To see the actual error (not just "An error occurred"):

1. **Browser Console:**
   - The `catch` block in `AuthModal.jsx` logs errors
   - Check console for the actual error message

2. **Network Tab:**
   - Click on the failed request
   - Check "Response" tab for error message from server

3. **Vercel Logs:**
   - Most detailed error information
   - Shows Prisma errors, database errors, etc.

## Quick Test Commands

```powershell
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Test registration
curl -X POST https://your-domain.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

Replace `your-domain.vercel.app` with your actual Vercel domain.
