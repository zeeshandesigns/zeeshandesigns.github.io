# PakGifts Platform Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   React Frontend                          │   │
│  │  ┌──────────┬──────────┬──────────┬──────────────────┐   │   │
│  │  │  Home    │ Product  │ Checkout │  Admin Panel     │   │   │
│  │  │  Page    │  Page    │  Flow    │  (Delivery Queue)│   │   │
│  │  └──────────┴──────────┴──────────┴──────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │        Common Components                           │   │   │
│  │  │  - ProductCard                                     │   │   │
│  │  │  - DeliveryTypeIndicator                          │   │   │
│  │  │  - Header, Footer                                  │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX REVERSE PROXY                         │
│                      (Port 80/443)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express.js Backend API                       │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │  Routes & Controllers                              │   │   │
│  │  │  - /api/products                                   │   │   │
│  │  │  - /api/orders                                     │   │   │
│  │  │  - /api/admin                                      │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │  Core Services                                     │   │   │
│  │  │  ┌──────────────┬────────────────┬──────────────┐  │   │   │
│  │  │  │ VoucherSvc   │ DeliverySvc    │ PaymentSvc   │  │   │   │
│  │  │  │ - Encrypt    │ - Automatic    │ - JazzCash   │  │   │   │
│  │  │  │ - Reserve    │ - Manual Queue │ - EasyPaisa  │  │   │   │
│  │  │  │ - Track      │ - Assignment   │ - Wallet     │  │   │   │
│  │  │  └──────────────┴────────────────┴──────────────┘  │   │   │
│  │  │  ┌──────────────┐                                  │   │   │
│  │  │  │  EmailSvc    │                                  │   │   │
│  │  │  │ - Send Codes │                                  │   │   │
│  │  │  └──────────────┘                                  │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │  Middleware                                        │   │   │
│  │  │  - JWT Auth                                        │   │   │
│  │  │  - Validation                                      │   │   │
│  │  │  - Rate Limiting                                   │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────────────────────┬───────────────────────────┐   │
│  │     PostgreSQL Database      │      Redis Cache          │   │
│  │  ┌────────────────────────┐  │  ┌────────────────────┐   │   │
│  │  │  Tables:               │  │  │  - Sessions        │   │   │
│  │  │  - users               │  │  │  - Cache           │   │   │
│  │  │  - products            │  │  │  - Rate Limits     │   │   │
│  │  │  - voucher_codes       │  │  └────────────────────┘   │   │
│  │  │  - orders              │  │                           │   │
│  │  │  - manual_queue        │  │                           │   │
│  │  │  - inventory_alerts    │  │                           │   │
│  │  └────────────────────────┘  │                           │   │
│  └──────────────────────────────┴───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
│  ┌──────────────┬──────────────┬───────────────┬────────────┐   │
│  │  JazzCash    │  EasyPaisa   │  SMTP Server  │  Backup    │   │
│  │  Payment     │  Payment     │  Email        │  Storage   │   │
│  └──────────────┴──────────────┴───────────────┴────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Dual Delivery System Flow

### Automatic Delivery Flow
```
Customer Places Order
         │
         ▼
Payment Verified
         │
         ▼
VoucherService.reserveCodes()
         │
         ▼
DeliveryService.processAutomaticDelivery()
         │
         ▼
VoucherService.markCodesAsSold()
         │
         ▼
EmailService.sendVoucherCodes()
         │
         ▼
Order Status: Completed
```

### Manual Delivery Flow
```
Customer Places Order
         │
         ▼
Payment Verified
         │
         ▼
DeliveryService.queueManualDelivery()
         │
         ▼
Manual Delivery Queue (Status: Pending)
         │
         ▼
Admin Assigns to Self
         │
         ▼
Queue Status: Processing
         │
         ▼
Admin Enters Voucher Codes
         │
         ▼
DeliveryService.processManualDeliveryItem()
         │
         ├─> VoucherService.importCodes()
         │
         ├─> VoucherService.markCodesAsSold()
         │
         ├─> EmailService.sendVoucherCodes()
         │
         ▼
Order Status: Completed
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
│                                                              │
│  Layer 1: Network Security                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - Nginx Reverse Proxy                             │     │
│  │  - SSL/TLS Encryption                              │     │
│  │  - Firewall Rules                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Layer 2: Application Security                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - Helmet.js Security Headers                      │     │
│  │  - CORS Protection                                 │     │
│  │  - Rate Limiting                                   │     │
│  │  - Input Validation (Joi)                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Layer 3: Authentication & Authorization                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - JWT Token Authentication                        │     │
│  │  - Role-Based Access Control                       │     │
│  │  - Password Hashing (bcrypt)                       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Layer 4: Data Security                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  - AES-256 Encryption for Voucher Codes           │     │
│  │  - SHA-256 Hashing for Code Verification          │     │
│  │  - Parameterized SQL Queries                       │     │
│  │  - Environment Variables for Secrets               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Overview

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│    users     │        │  categories  │        │   products   │
├──────────────┤        ├──────────────┤        ├──────────────┤
│ user_id (PK) │        │category_id(PK)│       │ product_id   │
│ email        │        │ name         │        │ name         │
│ password_hash│        │ slug         │        │ delivery_type│
│ role         │        │ icon_url     │        │ price        │
│ wallet_bal   │        └──────────────┘        │ stock_count  │
└──────────────┘               │                 └──────────────┘
                               │                        │
                               ▼                        │
                     ┌──────────────┐                  │
                     │subcategories │                  │
                     ├──────────────┤                  │
                     │subcategory_id│                  │
                     │ category_id  │                  │
                     │ name         │                  │
                     └──────────────┘                  │
                                                        │
┌──────────────┐        ┌──────────────┐              │
│    orders    │───────▶│ order_items  │◀─────────────┘
├──────────────┤        ├──────────────┤
│ order_id (PK)│        │order_item_id │
│ user_id (FK) │        │ order_id (FK)│
│ payment_meth │        │ product_id   │
│ payment_stat │        │ voucher_code │
│ delivery_stat│        │ delivery_stat│
└──────────────┘        └──────────────┘
      │                        │
      │                        ▼
      │              ┌──────────────────┐
      │              │ manual_queue     │
      │              ├──────────────────┤
      │              │ queue_id (PK)    │
      │              │ order_item_id(FK)│
      │              │ status           │
      │              │ priority         │
      │              │ assigned_to      │
      │              └──────────────────┘
      │
      ▼
┌──────────────┐        ┌──────────────────┐
│transactions  │        │ voucher_codes    │
├──────────────┤        ├──────────────────┤
│transaction_id│        │ code_id (PK)     │
│ order_id (FK)│        │ product_id (FK)  │
│ amount       │        │ code_encrypted   │
│ method       │        │ code_hash        │
│ status       │        │ status           │
└──────────────┘        │ order_id (FK)    │
                        └──────────────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │voucher_batches   │
                     ├──────────────────┤
                     │ batch_id (PK)    │
                     │ product_id (FK)  │
                     │ total_codes      │
                     │ uploaded_by      │
                     └──────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SERVER                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Docker Containers                     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │     │
│  │  │  Nginx   │  │ Frontend │  │ Backend  │         │     │
│  │  │  :80/443 │  │  :3000   │  │  :5000   │         │     │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘         │     │
│  │       │             │             │                │     │
│  │       └─────────────┴─────────────┘                │     │
│  │                     │                              │     │
│  │       ┌─────────────┴─────────────┐                │     │
│  │       ▼                           ▼                │     │
│  │  ┌──────────┐              ┌──────────┐           │     │
│  │  │PostgreSQL│              │  Redis   │           │     │
│  │  │  :5432   │              │  :6379   │           │     │
│  │  └──────────┘              └──────────┘           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Docker Volumes                        │     │
│  │  - postgres_data (Persistent DB)                   │     │
│  │  - redis_data (Cache)                              │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  - Payment Gateways (JazzCash, EasyPaisa)                   │
│  - SMTP Email Service                                        │
│  - Backup Storage                                            │
│  - Monitoring Services                                       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI Components |
| | React Router 6 | Navigation |
| | Redux Toolkit | State Management |
| | Bootstrap 5 | Styling |
| | Material UI | Icons & Components |
| **Backend** | Node.js 18 | Runtime |
| | Express.js 4 | Web Framework |
| | JWT | Authentication |
| | bcrypt | Password Hashing |
| **Database** | PostgreSQL 15 | Primary Database |
| | Redis 7 | Caching & Sessions |
| **Infrastructure** | Docker | Containerization |
| | Docker Compose | Orchestration |
| | Nginx | Reverse Proxy |
| **Security** | Helmet.js | Security Headers |
| | AES-256 | Code Encryption |
| | SHA-256 | Code Hashing |

## Key Features Implementation

| Feature | Status | Components |
|---------|--------|-----------|
| **Dual Delivery** | ✅ Complete | DeliveryService, ManualDeliveryQueue |
| **Automatic Delivery** | ✅ Complete | VoucherService, EmailService |
| **Manual Delivery** | ✅ Complete | Manual Queue, Admin Panel |
| **Code Encryption** | ✅ Complete | VoucherService (AES-256) |
| **Payment Integration** | ✅ Complete | PaymentService (4 methods) |
| **Inventory Management** | ✅ Complete | VoucherService, Alerts |
| **Admin Dashboard** | ✅ Complete | AdminPanel, Queue Management |
| **User Interface** | ✅ Complete | React Components |
| **Docker Deployment** | ✅ Complete | docker-compose.yml |
| **Documentation** | ✅ Complete | README, API docs, Deployment |
