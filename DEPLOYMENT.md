# 🚀 Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

- ✅ Production database (Neon recommended)
- ✅ Clerk production instance
- ✅ ImageKit account configured
- ✅ Inngest production account
- ✅ All environment variables ready

## Deployment Platforms

### Vercel (Recommended)

1. **Connect Repository**

   ```bash
   # Push your code to GitHub/GitLab/Bitbucket
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   Add these in Vercel Dashboard → Settings → Environment Variables:

   ```env
   NEXT_PUBLIC_CURRENCY_SYMBOL=Rs
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   DATABASE_URL=postgresql://...
   INGEST_EVENT_KEY=...
   INGEST_SIGNIN_KEY=...
   IMAGEKIT_PUBLIC_KEY=public_...
   IMAGEKIT_PRIVATE_KEY=private_...
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   PRISMA_CLIENT_ENGINE_TYPE=library
   OPTIMIZE_API_KEY=... (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-app.vercel.app`

### Other Platforms

#### Railway

1. Create new project on [railway.app](https://railway.app)
2. Connect your repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy automatically

#### Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect repository
3. Build Command: `npm install && prisma generate && prisma migrate deploy && npm run build`
4. Start Command: `npm start`
5. Add environment variables
6. Deploy

## Pre-Deployment Checklist

### 1. Database Setup

```bash
# Run migrations on production database
npx prisma migrate deploy

# Seed initial data (optional)
npm run seed
```

### 2. Environment Variables

Ensure all variables are set:

- ✅ Authentication (Clerk)
- ✅ Database connection
- ✅ File storage (ImageKit)
- ✅ Background jobs (Inngest)

### 3. Security

- ✅ Use production Clerk instance
- ✅ Enable SSL for database
- ✅ Set strong admin credentials
- ✅ Configure CORS if needed
- ✅ Enable rate limiting (optional)

### 4. Performance

- ✅ Database connection pooling enabled
- ✅ Image optimization configured
- ✅ CDN enabled (ImageKit)
- ✅ Compression enabled

### 5. Monitoring

- ✅ Set up error tracking (Sentry/LogRocket)
- ✅ Configure uptime monitoring
- ✅ Set up database backups
- ✅ Enable Prisma Optimize (optional)

## Post-Deployment

### 1. Verify Deployment

- Test user registration/login
- Test product browsing
- Test order creation
- Test admin dashboard
- Test image uploads
- Test notifications

### 2. Create Admin User

```bash
# Connect to production database and run:
UPDATE "User" SET "isAdmin" = true WHERE "email" = 'your-admin-email@example.com';
```

### 3. Configure Custom Domain (Optional)

In Vercel:

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Wait for SSL certificate

### 4. Set Up Monitoring

- Configure error tracking
- Set up analytics
- Enable uptime monitoring
- Configure backup schedules

## Troubleshooting

### Build Fails

```bash
# Check Prisma generation
npx prisma generate

# Check build locally
npm run build
```

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check SSL mode is enabled
- Ensure IP whitelist includes Vercel IPs
- Test connection pooling

### Image Upload Issues

- Verify ImageKit credentials
- Check CORS settings
- Test upload endpoint directly

### Authentication Issues

- Use production Clerk instance
- Verify publishable key matches
- Check webhook endpoints
- Test OAuth providers

## Rollback Procedure

If deployment fails:

1. **Vercel**: Go to Deployments → Previous deployment → Promote to Production
2. **Railway**: Redeploy previous commit
3. **Manual**: Revert git commit and redeploy

## Performance Optimization

### Database

```javascript
// Enable connection pooling in DATABASE_URL
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=60
```

### Caching

- Use Next.js ISR for static pages
- Cache API responses where appropriate
- Enable Edge caching for static assets

### CDN

- ImageKit handles image CDN
- Use Vercel Edge Network for assets
- Enable gzip/brotli compression

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Update Prisma
npm install @prisma/client@latest prisma@latest

# Test thoroughly before deploying
npm run build && npm start
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

### Backups

- Enable automated database backups
- Export critical data regularly
- Test restore procedures
- Store backups securely

## Support

For deployment issues:

- Check [docs/COMPLETE_DOCUMENTATION.md](../docs/COMPLETE_DOCUMENTATION.md)
- Review Vercel deployment logs
- Check database connection
- Verify all environment variables

---

**🎉 Your PakCards application is now production-ready!**
