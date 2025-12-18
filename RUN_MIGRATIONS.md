# How to Run Prisma Migrations in Vercel

## Method 1: Via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Login to Vercel
```powershell
vercel login
```

### Step 3: Link Your Project (if not already linked)
```powershell
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo
vercel link
```
- Select your project: `recycle-hub`
- Select scope: Your account

### Step 4: Pull Environment Variables
```powershell
vercel env pull .env.local
```
This downloads your production environment variables (including `DATABASE_URL`).

### Step 5: Run Migrations
```powershell
cd server
npx prisma migrate deploy
```

This will:
- Connect to your production database
- Run all pending migrations
- Update your database schema

### Step 6: Verify
```powershell
npx prisma studio
```
Or check your database to confirm tables are created.

---

## Method 2: Via Vercel Dashboard

### Option A: Storage Tab (If Prisma Integration is Visible)
1. Go to your Vercel dashboard
2. Click on **"Storage"** tab (in the top navigation)
3. Look for **"Prisma"** or **"PostgreSQL"** integration
4. If available, there should be a **"Run Migrations"** or **"Migrations"** section
5. Click to run migrations

### Option B: Settings → Environment Variables
1. Go to **Settings** tab
2. Click **"Environment Variables"**
3. Verify `DATABASE_URL` is set (should be auto-provided by Prisma integration)
4. Migrations should run automatically during build (if configured in `vercel.json`)

### Option C: Deployment Settings
1. Go to **Settings** tab
2. Click **"General"** → Scroll to **"Build & Development Settings"**
3. Check **"Build Command"** - it should include `prisma migrate deploy`
4. Next deployment will automatically run migrations

---

## Method 3: Automatic Migrations (Already Configured)

Your `vercel.json` is now configured to run migrations automatically during build:

```json
"buildCommand": "cd server && npx prisma migrate deploy && cd .. && npm run build"
```

**This means:**
- Every time you deploy, migrations will run automatically
- No manual steps needed
- Migrations run before the build starts

---

## Method 4: One-Time Migration via Vercel CLI (Remote)

You can also run migrations directly on Vercel's infrastructure:

```powershell
# Run migration command on Vercel
vercel --prod --cwd server -- npx prisma migrate deploy
```

Or use Vercel's remote execution:

```powershell
vercel exec --prod --cwd server -- npx prisma migrate deploy
```

---

## Troubleshooting

### If migrations fail:
1. **Check Build Logs:**
   - Go to your deployment → Click **"Build Logs"**
   - Look for Prisma migration errors

2. **Check Database Connection:**
   - Verify `DATABASE_URL` is set correctly in Vercel
   - Go to Settings → Environment Variables
   - Ensure it's available for Production environment

3. **Verify Prisma Schema Path:**
   - Your schema is at: `server/prisma/schema.prisma`
   - This is configured in `package.json` under `"prisma": { "schema": "server/prisma/schema.prisma" }`

4. **Manual Migration Check:**
   ```powershell
   vercel env pull .env.local
   cd server
   npx prisma migrate status
   ```

### Common Issues:

**Error: "Migration not found"**
- Solution: Ensure migrations exist in `server/prisma/migrations/`
- Run locally first: `cd server && npx prisma migrate dev`

**Error: "Database connection failed"**
- Solution: Check `DATABASE_URL` in Vercel environment variables
- Verify Prisma integration is connected

**Error: "Prisma Client not generated"**
- Solution: The `installCommand` in `vercel.json` should generate it
- Or run manually: `cd server && npx prisma generate`

---

## Quick Reference Commands

```powershell
# 1. Link project (first time)
vercel link

# 2. Pull environment variables
vercel env pull .env.local

# 3. Run migrations locally (with production DB)
cd server
npx prisma migrate deploy

# 4. Check migration status
npx prisma migrate status

# 5. Generate Prisma Client
npx prisma generate

# 6. View database (optional)
npx prisma studio
```

---

## Recommended Workflow

1. **First Time Setup:**
   - Run migrations manually via CLI (Method 1)
   - Verify database is set up correctly

2. **Future Deployments:**
   - Migrations run automatically during build (configured in `vercel.json`)
   - Just push to GitHub and deploy

3. **Manual Migration (if needed):**
   - Use Vercel CLI (Method 1) for one-off migrations
   - Or trigger a new deployment which will run migrations

---

## Current Configuration

Your project is configured to:
- ✅ Generate Prisma Client during install
- ✅ Run migrations during build (automatic)
- ✅ Use Prisma schema from `server/prisma/schema.prisma`

**Next deployment will automatically run migrations!**
