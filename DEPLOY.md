# Quick Vercel Deployment Steps

## 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## 2. Deploy on Vercel

### Via Dashboard:
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import repository: `itzmaiku44/Recycle-hub`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install && cd server && npm install && npx prisma generate && cd ..`

### Environment Variables:
Add these in Vercel project settings:
- `DATABASE_URL` - Automatically provided by Prisma integration
- `VITE_API_BASE` - Leave empty (uses `/api` in production)
- `VITE_API_ORIGIN` - Leave empty (uses relative paths)

## 3. Run Prisma Migrations

After first deployment, run migrations:
```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
cd server
npx prisma migrate deploy

# Option 2: Via Vercel Dashboard
# Go to your project → Settings → Prisma → Run Migrations
```

## 4. Verify

- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`

## Important Notes

⚠️ **Avatar Uploads**: Currently saved to `/tmp/avatars` (ephemeral). Consider using Vercel Blob Storage for persistent storage.

See `VERCEL_DEPLOYMENT.md` for detailed instructions.
