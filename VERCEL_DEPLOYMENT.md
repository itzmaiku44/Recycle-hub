# Vercel Deployment Guide

This guide will help you deploy your Recycle Hub project to Vercel.

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. GitHub repository connected to Vercel
3. Prisma integration storage already set up in Vercel

## Step 1: Environment Variables

In your Vercel project settings, add the following environment variables:

1. **DATABASE_URL** - Your PostgreSQL connection string from Prisma integration
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - This should be automatically provided by Vercel's Prisma integration

2. **VITE_API_BASE** (Optional) - API base URL for frontend
   - For production: Leave empty (will use relative paths `/api`)
   - Or set to: `https://your-domain.vercel.app/api`

3. **VITE_API_ORIGIN** (Optional) - API origin for file URLs
   - For production: Leave empty (will use relative paths)
   - Or set to: `https://your-domain.vercel.app`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository: `itzmaiku44/Recycle-hub`
4. Vercel will auto-detect the settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install && cd server && npm install && npx prisma generate && cd ..`
5. Add environment variables (from Step 1)
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project root
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (if updating)
# - Project name: recycle-hub (or your preferred name)
# - Directory: ./
# - Override settings? No
```

## Step 3: Run Prisma Migrations

After deployment, you need to run Prisma migrations on your production database:

```bash
# Using Vercel CLI
vercel env pull .env.local
cd server
npx prisma migrate deploy
npx prisma generate
```

Or use Vercel's Prisma integration dashboard to run migrations.

## Step 4: Verify Deployment

1. Check your deployment URL (e.g., `https://recycle-hub.vercel.app`)
2. Test API endpoints: `https://your-domain.vercel.app/api/health`
3. Test frontend: Navigate to your domain

## Important Notes

### File Uploads (Avatars)

⚠️ **Current Limitation**: Vercel serverless functions have a read-only filesystem (except `/tmp`). Avatar uploads are currently saved to `/tmp/avatars`, which is **ephemeral** (files are deleted after function execution).

**Recommended Solution**: Use Vercel Blob Storage for persistent file storage:
1. Install: `npm install @vercel/blob`
2. Update `api/index.js` to use Vercel Blob Storage instead of local filesystem
3. Or use a service like Cloudinary, AWS S3, etc.

### Prisma Client Generation

The `postinstall` script in `package.json` automatically generates Prisma Client during deployment. Make sure your Prisma schema is accessible at `server/prisma/schema.prisma`.

### API Routes

All API routes are accessible at `/api/*` and are handled by the serverless function in `api/index.js`.

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json` (not just `server/package.json`)
- Verify Prisma schema path is correct
- Check build logs in Vercel dashboard

### API Routes Not Working
- Verify `vercel.json` configuration
- Check that `api/index.js` exports the Express app correctly
- Verify environment variables are set

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check Prisma integration is connected
- Run migrations: `npx prisma migrate deploy`

### Frontend Can't Connect to API
- Check `VITE_API_BASE` environment variable
- Verify API routes are accessible at `/api/*`
- Check browser console for CORS errors

## Next Steps

1. Set up custom domain (optional)
2. Configure Vercel Blob Storage for avatar uploads
3. Set up CI/CD for automatic deployments
4. Configure preview deployments for pull requests
