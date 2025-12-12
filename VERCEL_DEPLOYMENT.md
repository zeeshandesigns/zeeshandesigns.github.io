# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Set Up Production Database

Choose one of these options:

#### Option A: Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **Pooled Connection String** (ends with `-pooler.region.aws.neon.tech`)
4. Save it - you'll add it to Vercel environment variables

#### Option B: Vercel Postgres

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Copy the connection string provided

---

### 2. Deploy to Vercel

#### Via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings

#### Via Vercel CLI

```powershell
npm i -g vercel
vercel login
vercel
```

---

### 3. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

```env
# Required - Add these first
DATABASE_URL=postgresql://username:password@hostname-pooler.region.aws.neon.tech/dbname?sslmode=require

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZW5nYWdlZC1jYXJkaW5hbC01OS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_nNiuIuKBP0bgfbJUjot94vJ8jIHChhLffDsVIaIBPI

IMAGEKIT_PUBLIC_KEY=public_FTdzjh83WoPuqEt4M5e+39PvtFs=
IMAGEKIT_PRIVATE_KEY=private_Y8LbKishQBhPimEopGkSOtxjUTo=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/zynk

INGEST_EVENT_KEY=47dY4PB_l261GFaS1mgVccOnqDpyUcJ1CTTDdlZPkxStE_flmEo2j8jzBK7rrWhVF3o1TRZHg7SkcF7vBrn6xA
INGEST_SIGNIN_KEY=signkey-prod-24f648edc0e8cbc457910deaf5fb1fba5beb85fdc9e550876a55f28bc6e02a51

PRISMA_CLIENT_ENGINE_TYPE=library

# Optional
NEXT_PUBLIC_CURRENCY_SYMBOL=Rs
OPTIMIZE_API_KEY=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ3aWQiOiJjbWhoaDBmZWwwMzIyeXNmbGtrNzlzOGxrIiwidWlkIjoiY21oaGgwZmhyMDVqeHl4Zmw0amUxdWt6bCIsInRzIjoxNzYyMDc1ODYzNDk4fQ.W2D1rrcktmGw7o0IMhvNFNO5ON5s93Bbj90tjYik_C6a6aXNVU8zh0FH1tLFu5UtXyynvClR7zXiAG1nLL0IAA
```

**Important:** Make sure to select **Production**, **Preview**, and **Development** for all variables.

---

### 4. Run Database Migrations

After first deployment, you need to set up the database schema:

#### Option 1: Via Vercel CLI (Easiest)

```powershell
# Pull production environment variables
npx vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed database (optional - adds sample data)
npm run seed
```

#### Option 2: Direct Connection

```powershell
# Set production database URL temporarily
$env:DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

---

### 5. Set Admin User

After deployment, make yourself admin:

```powershell
# Pull production env
npx vercel env pull .env.production

# Create admin script
$script = @'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const user = await prisma.user.update({
      where: { id: 'user_357N8AecPsLiS0wVIMzdWcxBsAZ' },
      data: { isAdmin: true }
    });
    console.log('✓ Admin user set:', user.email || user.id);
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
'@

Set-Content -Path 'set-admin-prod.js' -Value $script
node set-admin-prod.js
Remove-Item set-admin-prod.js -Force
```

---

### 6. Update Clerk Webhook URLs

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. Go to **Webhooks** section
4. Add endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`

---

## Access Your Deployed Site

- **Homepage**: `https://your-domain.vercel.app`
- **Admin Panel**: `https://your-domain.vercel.app/admin`
- **Store Dashboard**: `https://your-domain.vercel.app/store`

---

## Troubleshooting

### Build Fails

- Check Vercel build logs for errors
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct

### Database Connection Issues

- Use **pooled connection string** (ends with `-pooler`)
- Add `?sslmode=require` to connection string
- Check database is accessible from external IPs

### Admin Panel Not Working

- Ensure you've run the admin user script on production database
- Check Clerk authentication is working
- Verify user ID matches in both Clerk and database

### Images Not Loading

- Verify ImageKit credentials are correct
- Check ImageKit URL endpoint matches your account
- Ensure images domain is allowed in `next.config.mjs`

---

## Performance Optimization

Once deployed:

1. **Enable Caching**: Vercel automatically handles this
2. **Set Up Analytics**: Go to Vercel Dashboard → Analytics tab
3. **Monitor Performance**: Check Vercel Speed Insights
4. **Database Monitoring**: Use Neon's dashboard to monitor queries

---

## Next Steps

- [ ] Set up custom domain in Vercel settings
- [ ] Configure production Clerk instance (move from test to prod keys)
- [ ] Set up Inngest production environment
- [ ] Add error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure automatic database backups
- [ ] Set up CI/CD for automated testing

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review database connection strings
3. Verify all environment variables are set correctly
4. Check Clerk dashboard for authentication errors
