# Fix: API Connecting to localhost:4000 Instead of Vercel

## Problem
The frontend is trying to connect to `localhost:4000` instead of the Vercel API endpoints, causing `ERR_CONNECTION_REFUSED` errors.

## Solution Applied

I've updated `src/config/api.js` to detect the environment at **runtime** instead of build-time. This ensures:
- On `localhost` → Uses `http://localhost:4000/api`
- On Vercel (any other domain) → Uses `/api` (relative path)

## What Changed

1. **API Configuration** (`src/config/api.js`):
   - Now checks `window.location.hostname` at runtime
   - If localhost → uses `http://localhost:4000/api`
   - Otherwise → uses `/api` (relative, works on Vercel)

2. **Build Command** (`vercel.json`):
   - Added `--mode production` flag to ensure production build

## Next Steps

1. **Commit and Push:**
   ```powershell
   git add .
   git commit -m "Fix API config to use Vercel endpoints in production"
   git push origin main
   ```

2. **Wait for Vercel to Redeploy:**
   - Vercel will automatically redeploy after push
   - Or manually trigger: Dashboard → Deployments → Redeploy

3. **Test:**
   - Open your deployed site
   - Try to register/login
   - Check browser console - should now use `/api` instead of `localhost:4000`

## Verification

After redeploy, check:
- Browser console should show requests to `/api/auth/register` (not `localhost:4000`)
- Network tab should show requests to your Vercel domain
- Registration/login should work

## If Still Not Working

If it still tries to use `localhost:4000`:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that the new build is deployed (check deployment timestamp)
4. Verify the built JavaScript uses `/api` (check Network tab → JS files)
