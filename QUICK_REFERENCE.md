# PakGifts Quick Reference Card

## 🚀 Quick Start Commands

### Setup
```bash
# Automated setup
./setup.sh

# Manual setup - Development
cd backend && npm install
cd frontend && npm install

# Manual setup - Docker
docker-compose up -d
```

### Development
```bash
# Backend
cd backend
npm run dev          # Start with nodemon

# Frontend  
cd frontend
npm start            # Start development server

# Database
psql -d pakgifts_db -f backend/src/database/schema.sql
psql -d pakgifts_db -f backend/src/database/sample-data.sql
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Coverage
npm test -- --coverage
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
docker-compose logs -f backend    # View specific service
docker-compose ps                 # Check status
docker-compose restart backend    # Restart service
```

## 📁 Project Structure

```
pakgifts/
├── backend/src/
│   ├── services/        # Core business logic
│   │   ├── VoucherService.js      ⭐ Code management
│   │   ├── DeliveryService.js     ⭐ Dual delivery
│   │   ├── PaymentService.js      💳 Payments
│   │   └── EmailService.js        📧 Notifications
│   ├── config/          # Configuration
│   ├── database/        # Schema & migrations
│   └── server.js        # Main entry point
│
├── frontend/src/
│   ├── components/
│   │   ├── pages/       # Page components
│   │   │   ├── Home.js
│   │   │   ├── ProductPage.js     ⭐ Product details
│   │   │   ├── ManualDeliveryQueue.js  ⭐ Admin queue
│   │   │   └── AdminPanel.js
│   │   ├── common/      # Reusable components
│   │   │   ├── ProductCard.js
│   │   │   └── DeliveryTypeIndicator.js  ⭐ Delivery badge
│   │   └── layout/      # Layout components
│   └── App.js
│
└── Documentation/
    ├── README.md                  📖 Main docs
    ├── API_DOCUMENTATION.md       📡 API reference
    ├── DEPLOYMENT.md              🚀 Deploy guide
    ├── ARCHITECTURE.md            🏗️ Architecture
    └── PROJECT_SUMMARY.md         📊 Summary
```

## 🔑 Key Environment Variables

```bash
# Backend (.env)
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=pakgifts_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=<openssl rand -base64 32>
ENCRYPTION_KEY=<openssl rand -hex 32>

JAZZCASH_MERCHANT_ID=your_id
EASYPAISA_STORE_ID=your_id
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
```

## 📡 API Endpoints Quick Reference

### Public
```
GET  /api/health              Health check
GET  /api/categories          List categories
GET  /api/products            List products
GET  /api/products/:slug      Product details
```

### Authenticated
```
POST /api/orders              Create order
GET  /api/orders/:id          Order details
GET  /api/orders/:id/codes    Get voucher codes
```

### Admin
```
GET  /api/admin/delivery-queue           Get manual queue
POST /api/admin/delivery-queue/:id/assign  Assign item
POST /api/admin/delivery-queue/:id/process Process delivery
POST /api/admin/vouchers/import          Import codes
GET  /api/admin/inventory-alerts         Get alerts
```

## 🔐 Security Checklist

- [x] AES-256 encryption for voucher codes
- [x] SHA-256 hashing for code verification
- [x] JWT authentication structure
- [x] bcrypt password hashing
- [x] Helmet.js security headers
- [x] CORS protection
- [x] Parameterized SQL queries
- [ ] Configure rate limiting thresholds
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules

## 🎯 Core Services Usage

### VoucherService
```javascript
// Import codes
await voucherService.importCodes(
  productId, 
  ['CODE1', 'CODE2'], 
  'Batch-001'
);

// Reserve codes
await voucherService.reserveCodes(productId, quantity, orderId);

// Get available stock
const stock = await voucherService.getAvailableStock(productId);
```

### DeliveryService
```javascript
// Automatic delivery
await deliveryService.processAutomaticDelivery(orderId);

// Queue manual delivery
await deliveryService.queueManualDelivery(orderId);

// Process manual delivery
await deliveryService.processManualDeliveryItem(
  queueId, 
  adminId, 
  ['CODE1', 'CODE2']
);
```

### PaymentService
```javascript
// Verify JazzCash payment
await paymentService.verifyJazzCashPayment(orderId, paymentData);

// Process wallet payment
await paymentService.processWalletPayment(orderId, userId, amount);

// Process refund
await paymentService.processRefund(orderId, amount, reason, adminId);
```

## 🗄️ Database Quick Reference

### Key Tables
```sql
-- Users
SELECT * FROM users WHERE email = 'user@example.com';

-- Products
SELECT * FROM products WHERE delivery_type = 'automatic';

-- Voucher Codes
SELECT COUNT(*) FROM voucher_codes 
WHERE product_id = 'id' AND status = 'available';

-- Manual Queue
SELECT * FROM manual_delivery_queue 
WHERE status = 'pending' 
ORDER BY priority, created_at;

-- Orders
SELECT o.*, u.email FROM orders o 
JOIN users u ON o.user_id = u.user_id 
WHERE o.payment_status = 'verified';
```

## 🐛 Common Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres pakgifts_db
```

### Backend not starting
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Check .env file
cat backend/.env
```

### Frontend build fails
```bash
# Clear cache
rm -rf frontend/node_modules
cd frontend && npm install

# Check for errors
npm run build
```

## 📊 Testing Quick Reference

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test VoucherService

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products

# Get categories
curl http://localhost:5000/api/categories
```

## 🔄 Common Git Workflows

```bash
# Update from main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push changes
git push origin feature/your-feature
```

## 📝 Code Snippets

### Add New Product Category
```sql
INSERT INTO categories (name, slug, description, icon_url, display_order)
VALUES ('New Category', 'new-category', 'Description', '🎁', 10);
```

### Create Admin User
```javascript
const bcrypt = require('bcryptjs');
const passwordHash = await bcrypt.hash('admin123', 10);
// Insert into database
```

### Import Voucher Codes (CSV)
```javascript
const codes = csvData.map(row => row.code);
await voucherService.importCodes(productId, codes, 'CSV-Import');
```

## 🌐 URLs

| Service | Development | Production |
|---------|-------------|-----------|
| Frontend | http://localhost:3000 | https://pakgifts.com |
| Backend API | http://localhost:5000 | https://api.pakgifts.com |
| Health Check | http://localhost:5000/api/health | https://api.pakgifts.com/api/health |
| Database | localhost:5432 | (private) |
| Redis | localhost:6379 | (private) |

## 📞 Support

- 📖 Documentation: See README.md
- 🐛 Issues: GitHub Issues
- 💬 Questions: Create GitHub Discussion
- 📧 Contact: support@pakgifts.com

## ⚡ Performance Tips

1. Use Redis caching for frequently accessed data
2. Implement pagination for large lists
3. Use database indexes on frequently queried columns
4. Lazy load images and components
5. Minimize API calls with proper state management
6. Use compression for responses
7. Implement CDN for static assets

## 🔒 Security Best Practices

1. Never commit `.env` files
2. Rotate JWT secrets regularly
3. Use HTTPS in production
4. Sanitize all user inputs
5. Keep dependencies updated
6. Regular security audits
7. Monitor for suspicious activity
8. Implement rate limiting
9. Use strong passwords
10. Enable 2FA for admin accounts

---

**Last Updated:** 2025-10-21  
**Version:** 1.0.0  
**Platform:** PakGifts E-commerce
