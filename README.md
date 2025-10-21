# PakGifts - Digital Gift Card E-commerce Platform

A comprehensive e-commerce platform for selling digital gift cards with dual delivery system (automatic and manual) for the Pakistani market.

## 🌟 Features

### Core Features
- **Dual Delivery System**
  - Automatic delivery with immediate code provisioning
  - Manual delivery with admin approval workflow
  - Clear delivery type indicators on all products

- **Payment Integration**
  - JazzCash payment gateway
  - EasyPaisa integration
  - Bank transfer verification
  - Secondary wallet system

- **Inventory Management**
  - Secure encrypted voucher code storage
  - Bulk import/export functionality
  - Inventory level warnings and alerts
  - Code expiration tracking

- **User Experience**
  - Category and region-based browsing
  - Product details with delivery indicators
  - Order status tracking
  - Customer dispute system

### Technical Features
- RESTful API architecture
- JWT-based authentication
- Role-based access control
- Redis caching for sessions
- PostgreSQL database with optimized indexing
- AES-256 encryption for voucher codes
- Rate limiting for security
- Docker containerization

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Redux Toolkit, Bootstrap 5, Material UI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Deployment**: Docker, Docker Compose, Nginx

### Project Structure
```
pakgifts/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # Database schema and migrations
│   │   ├── middleware/      # Authentication, validation, etc.
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── VoucherService.js      # Voucher code management
│   │   │   ├── DeliveryService.js     # Delivery workflows
│   │   │   ├── PaymentService.js      # Payment processing
│   │   │   └── EmailService.js        # Email notifications
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Application entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Reusable components
│   │   │   │   ├── ProductCard.js
│   │   │   │   └── DeliveryTypeIndicator.js
│   │   │   ├── layout/      # Layout components
│   │   │   │   ├── Header.js
│   │   │   │   └── Footer.js
│   │   │   └── pages/       # Page components
│   │   │       ├── Home.js
│   │   │       ├── ProductPage.js
│   │   │       ├── AdminPanel.js
│   │   │       └── ManualDeliveryQueue.js
│   │   ├── redux/           # State management
│   │   ├── services/        # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── nginx.conf           # Reverse proxy configuration
│
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/zeeshandesigns/zeeshandesigns.github.io.git
cd zeeshandesigns.github.io
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Update database credentials, JWT secret, encryption key, etc.

# Create database
createdb pakgifts_db

# Run database migrations
psql -d pakgifts_db -f src/database/schema.sql

# Start development server
npm run dev
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Docker Deployment

#### 1. Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 2. Production Deployment
```bash
# Set environment variables
export JWT_SECRET=your-production-secret
export ENCRYPTION_KEY=your-32-character-key

# Build and start in production mode
docker-compose -f docker-compose.yml up -d

# Initialize database
docker-compose exec postgres psql -U postgres -d pakgifts_db -f /docker-entrypoint-initdb.d/schema.sql
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts and authentication
- **categories & subcategories**: Product organization
- **products**: Gift card products with delivery type
- **voucher_codes**: Encrypted voucher storage
- **voucher_code_batches**: Bulk import tracking
- **orders & order_items**: Order management
- **transactions**: Payment tracking
- **manual_delivery_queue**: Manual delivery workflow
- **disputes**: Customer dispute handling
- **inventory_alerts**: Stock level monitoring

See `backend/src/database/schema.sql` for complete schema.

## 🔐 Security Features

1. **Code Encryption**: AES-256 encryption for all voucher codes
2. **JWT Authentication**: Secure token-based authentication
3. **Password Hashing**: bcrypt for password security
4. **Rate Limiting**: Protection against brute force attacks
5. **SQL Injection Prevention**: Parameterized queries
6. **CORS Protection**: Configured CORS policies
7. **Helmet.js**: Security headers
8. **Input Validation**: Joi schema validation

## 🎯 Key Services

### VoucherService
Manages voucher codes with encryption:
- Import codes in bulk
- Reserve codes for orders
- Mark codes as sold
- Check inventory levels
- Export codes for backup

### DeliveryService
Handles dual delivery system:
- Process automatic delivery
- Queue manual delivery items
- Assign items to admins
- Complete manual delivery
- Track delivery status

### PaymentService
Manages payment verification:
- JazzCash verification
- EasyPaisa verification
- Bank transfer approval
- Wallet payments
- Refund processing

## 📱 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/categories` - List categories
- `GET /api/products` - List products
- `GET /api/products/:slug` - Product details

### Authentication Required
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Order details
- `GET /api/dashboard` - User dashboard

### Admin Only
- `GET /api/admin/delivery-queue` - Manual delivery queue
- `POST /api/admin/delivery/:id/process` - Process delivery
- `POST /api/admin/vouchers/import` - Import voucher codes
- `GET /api/admin/inventory-alerts` - Inventory alerts

## 🎨 UI Components

### Product Display
- **ProductCard**: Shows product with delivery type badge
- **DeliveryTypeIndicator**: Visual indicator for delivery method
- **ProductPage**: Detailed product view with purchase options

### Admin Interface
- **ManualDeliveryQueue**: Queue management for manual deliveries
- **InventoryManager**: Bulk import and inventory monitoring
- **PaymentVerification**: Verify bank transfers

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=pakgifts_db
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_key
JAZZCASH_MERCHANT_ID=your_merchant_id
EASYPAISA_STORE_ID=your_store_id
```

## 🤝 Contributing

This is a proprietary project. For collaboration inquiries, contact the maintainer.

## 📄 License

Copyright © 2025 PakGifts. All rights reserved.

## 👨‍💻 Author

**Zeeshan Haider**
- Website: https://zeeshandesigns.github.io
- GitHub: @zeeshandesigns

## 📞 Support

For support and queries:
- Email: support@pakgifts.com
- Documentation: See inline code documentation

## 🔄 Version History

### v1.0.0 (2025-10-21)
- Initial implementation
- Dual delivery system
- Payment gateway integration
- Inventory management
- Admin panel
- User dashboard

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Affiliate program
- [ ] Loyalty points system
- [ ] SMS notifications
- [ ] Advanced fraud detection