# 📚 PakCards - Complete Documentation

**Last Updated:** November 14, 2025  
**Project:** PakCards Gift Card Marketplace  
**Version:** 1.0.0

---

## 📖 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [API Reference](#api-reference)
5. [Deployment Guide](#deployment-guide)
6. [Testing Checklist](#testing-checklist)
7. [Common Commands](#common-commands)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (Neon recommended)
- Clerk account (authentication)
- ImageKit account (file storage)
- Inngest account (background jobs)

### Installation

```bash
# Clone repository and install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Setup

### Required Environment Variables

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@hostname-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@hostname.region.aws.neon.tech/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# ImageKit Storage
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx

# Inngest Background Jobs
INGEST_EVENT_KEY=xxx
INGEST_SIGNIN_KEY=signkey-prod-xxx

# Prisma Configuration
PRISMA_CLIENT_ENGINE_TYPE="library"
OPTIMIZE_API_KEY=xxx

# Application Settings
NEXT_PUBLIC_CURRENCY_SYMBOL_PKR=₨
```

### Development vs Production

**Development (.env.local):**

- Use test Clerk keys (pk_test_xxx)
- Can use local PostgreSQL
- Test ImageKit folder
- Inngest test environment

**Production (.env.production):**

- Must use live Clerk keys (pk_live_xxx)
- Production Neon database
- Production ImageKit bucket
- Inngest production environment

---

## 💾 Database Configuration

### Schema Overview

Main models:

- **User** - Customer accounts (synced with Clerk)
- **Product** - Gift card products
- **Order** - Customer orders with items
- **DeliveredCode** - Digital codes delivered to customers
- **Wallet** - Customer wallet balances
- **WalletTransaction** - Wallet history
- **Dispute** - Customer dispute management
- **Review** - Product reviews and ratings
- **Coupon** - Discount codes
- **Store** - Seller stores

### Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations to database
npx prisma migrate deploy

# Create new migration (development)
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with sample data
npm run seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Creating Admin User

After first deployment:

```sql
-- Replace with your Clerk user ID
UPDATE "User"
SET "isAdmin" = true
WHERE "clerkId" = 'user_xxxxx';
```

Or use Prisma Studio at http://localhost:5555

---

## 🔌 API Reference

### Products

#### GET /api/products

Fetch all products with optional filters

**Query Parameters:**

- `category` - Filter by category (Gaming, Entertainment, Shopping)
- `deliveryType` - Filter by delivery type (instant, manual)
- `search` - Search by name or description
- `minPrice`, `maxPrice` - Price range
- `inStock` - Boolean, only show available products

**Response:**

```json
{
  "success": true,
  "count": 10,
  "products": [
    {
      "id": "xxx",
      "name": "Steam Wallet",
      "price": 1000,
      "category": "Gaming",
      "deliveryType": "instant",
      "inStock": true,
      "images": ["url"],
      "store": { "name": "Store Name" }
    }
  ]
}
```

#### GET /api/products/[productId]

Get single product details

**Response:** Product with ratings, available codes count

#### GET /api/products/featured

Get featured/best-selling products

**Query:** `limit` (default: 4)

---

### Orders

#### POST /api/orders/create

Create new order

**Body:**

```json
{
  "items": [{ "productId": "xxx", "quantity": 1 }],
  "paymentMethod": "WALLET"
}
```

**Response:**

```json
{
  "success": true,
  "orderId": "xxx",
  "status": "ORDER_PLACED",
  "total": 1000
}
```

#### GET /api/orders/user

Get user's order history

**Auth:** Required (Clerk)

**Response:** Array of orders with items and codes

#### GET /api/orders/[orderId]

Get single order details

**Auth:** User must own order or be admin

---

### Wallet

#### GET /api/wallet

Get user's wallet balance and transactions

**Auth:** Required

**Response:**

```json
{
  "wallet": {
    "balance": 5000,
    "transactions": []
  }
}
```

#### POST /api/wallet/topup/request

Create wallet top-up request

**Body:**

```json
{
  "amount": 1000
}
```

#### POST /api/wallet/topup/submit-payment

Submit payment proof for top-up

**Body:** FormData with `topUpId`, `paymentProof` (file)

---

### Disputes

#### POST /api/disputes/create

Create new dispute for an order

**Body:**

```json
{
  "orderId": "xxx",
  "reason": "CODE_NOT_WORKING",
  "description": "The code doesn't work",
  "images": ["base64"] // optional
}
```

#### GET /api/disputes/user

Get user's disputes

**Auth:** Required

#### POST /api/disputes/[id]/refund

Issue refund (Admin only)

**Body:**

```json
{
  "refundType": "HALF" | "FULL",
  "resolution": "Description"
}
```

#### POST /api/disputes/[id]/close

Close dispute (Admin or User based on permissions)

---

### Admin

#### GET /api/admin/dashboard

Get dashboard statistics

**Auth:** Admin only

**Response:**

```json
{
  "totalOrders": 100,
  "pendingPayments": 5,
  "totalRevenue": 50000,
  "ordersByStatus": {}
}
```

#### GET /api/admin/orders

Get all orders with filters

**Query:** `status`, `page`, `limit`

#### PUT /api/admin/orders/[orderId]/verify

Verify payment and update status

**Body:**

```json
{
  "status": "PAYMENT_VERIFIED"
}
```

#### POST /api/admin/orders/[orderId]/upload-codes

Upload codes for manual delivery

**Body:**

```json
{
  "codes": ["CODE1", "CODE2"]
}
```

---

## 🚀 Deployment Guide

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Production build successful: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Payment methods configured
- [ ] ImageKit folders set up

### Vercel Deployment

1. **Connect Repository**

   - Import project in Vercel
   - Select main branch

2. **Configure Build Settings**

   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables**

   - Go to Settings → Environment Variables
   - Add all production values
   - Select "Production" environment

4. **Deploy**
   - Automatic deployment on push to main
   - Manual deploy: `vercel --prod`

### Database Setup for Production

```bash
# Connect to production database
# Update DATABASE_URL in .env

# Apply migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npm run seed
```

### Post-Deployment

1. Create admin account via Clerk
2. Update User table to set isAdmin = true
3. Test critical flows:
   - User registration/login
   - Product browsing
   - Order creation
   - Wallet top-up
   - Admin panel access
4. Configure monitoring (optional)

---

## 🧪 Testing Checklist

### Homepage Tests

- [ ] Products display correctly
- [ ] Search functionality works
- [ ] Navigation links functional
- [ ] Cart icon updates
- [ ] Responsive on mobile

### Product Tests

- [ ] Product listing shows all products
- [ ] Filter by category works
- [ ] Product detail page loads
- [ ] Add to cart functional
- [ ] Stock availability accurate

### Checkout Tests

- [ ] Cart displays items
- [ ] Quantity update works
- [ ] Coupon codes apply correctly
- [ ] Checkout process completes
- [ ] Order confirmation received

### Wallet Tests

- [ ] Wallet balance displays
- [ ] Top-up request creation works
- [ ] Payment proof upload successful
- [ ] Admin can verify payments
- [ ] Wallet transactions log correctly

### Order Tests

- [ ] Order history displays
- [ ] Order details accessible
- [ ] Instant delivery codes show immediately
- [ ] Manual delivery awaits admin codes
- [ ] Order statuses update correctly

### Dispute Tests

- [ ] Can create dispute for order
- [ ] Dispute chat functional
- [ ] Admin can issue refunds
- [ ] Refund credits wallet
- [ ] Dispute closure permissions work

### Admin Tests

- [ ] Dashboard statistics accurate
- [ ] Can view all orders
- [ ] Payment verification works
- [ ] Code upload for manual orders
- [ ] Dispute management functional
- [ ] Store approval process works

---

## 💻 Common Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name description

# Open Prisma Studio
npx prisma studio

# Seed database
npm run seed

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

### Deployment

```bash
# Deploy to Vercel
vercel --prod

# Check build locally
npm run build && npm start
```

---

## 🔧 Troubleshooting

### Build Fails

**Issue:** `npm run build` fails

**Solutions:**

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build

# Check for TypeScript errors
npm run lint

# Verify environment variables
node -e "console.log(process.env.DATABASE_URL)"
```

### Database Connection Issues

**Issue:** Can't connect to database

**Solutions:**

```bash
# Test connection
npx prisma db pull

# Regenerate client
npx prisma generate

# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:5432/dbname
```

### Prisma Client Errors

**Issue:** `@prisma/client` not found

**Solutions:**

```bash
# Generate Prisma client
npx prisma generate

# Reinstall dependencies
npm install @prisma/client
npx prisma generate
```

### ImageKit Upload Fails

**Issue:** File upload errors

**Solutions:**

- Verify ImageKit credentials in .env
- Check file size limits (max 25MB)
- Ensure folder exists in ImageKit
- Check network connection

### Clerk Authentication Issues

**Issue:** Sign-in not working

**Solutions:**

- Verify Clerk keys in .env
- Check Clerk dashboard for instance status
- Ensure redirect URLs configured
- Clear browser cookies/cache

### Wallet Balance Not Updating

**Issue:** Wallet transactions not reflecting

**Solutions:**

- Check WalletTransaction records in database
- Verify transaction amount calculation
- Check for database transaction rollbacks
- Review wallet update logic in APIs

### Order Codes Not Delivered

**Issue:** Instant delivery codes not showing

**Solutions:**

- Check product has available codes in database
- Verify DeliveredCode records created
- Check order status is CODE_DELIVERED
- Review Inngest job logs

### Dispute Refund Issues

**Issue:** Refund not crediting wallet

**Solutions:**

- Check refund API response
- Verify WalletTransaction created with type "REFUND"
- Check wallet balance updated
- Review database transaction logs

---

## 📞 Additional Resources

### Documentation Files

- `README.md` - Project overview
- `.env.example` - Environment variables template
- `DEPLOYMENT_CHECKLIST.md` - Full deployment guide

### Important Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [ImageKit Documentation](https://docs.imagekit.io)
- [Inngest Documentation](https://www.inngest.com/docs)

---

## 🔒 Security Best Practices

1. **Environment Variables**

   - Never commit .env to git
   - Use different keys for dev/production
   - Rotate secrets regularly

2. **Database**

   - Use SSL connections in production
   - Enable connection pooling
   - Regular backups

3. **Authentication**

   - Use Clerk production instance
   - Implement proper role checks
   - Protect admin routes

4. **API Security**

   - Validate all inputs
   - Use Prisma to prevent SQL injection
   - Implement rate limiting (optional)

5. **File Uploads**
   - Validate file types and sizes
   - Use secure upload endpoints
   - Scan for malware (optional)

---

## 📝 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** JavaScript (ESM modules)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk
- **Styling:** Tailwind CSS v4
- **UI Components:** Lucide React icons
- **State Management:** Redux Toolkit
- **Background Jobs:** Inngest
- **File Storage:** ImageKit
- **Charts:** Recharts

---

## 🎯 Key Features

- ✅ Instant digital gift card delivery
- ✅ Multi-category support (Gaming, Entertainment, Shopping)
- ✅ Regional pricing and availability
- ✅ Secure payment verification system
- ✅ Admin dashboard with analytics
- ✅ Customer reviews and ratings
- ✅ Discount coupon system
- ✅ Order dispute management
- ✅ Real-time notifications
- ✅ Responsive design (mobile-first)

---

**Built with ❤️ for Pakistan's digital marketplace**
