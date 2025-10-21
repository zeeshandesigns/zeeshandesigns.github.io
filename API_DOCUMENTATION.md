# PakGifts API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health & Info

#### GET /health
Health check endpoint
- **Auth required**: No
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "environment": "development"
}
```

#### GET /
API information
- **Auth required**: No

---

### Categories

#### GET /categories
Get all active categories
- **Auth required**: No
- **Query Parameters**: None
- **Response**:
```json
{
  "success": true,
  "categories": [
    {
      "category_id": "uuid",
      "name": "Gaming",
      "slug": "gaming",
      "description": "Game gift cards and credits",
      "icon_url": "https://...",
      "display_order": 1,
      "is_active": true
    }
  ]
}
```

#### GET /categories/:slug/subcategories
Get subcategories for a category
- **Auth required**: No
- **Response**: List of subcategories

---

### Products

#### GET /products
Get products list
- **Auth required**: No
- **Query Parameters**:
  - `category` (string): Filter by category ID
  - `delivery_type` (string): Filter by 'automatic' or 'manual'
  - `search` (string): Search by product name
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 50)

- **Response**:
```json
{
  "success": true,
  "products": [
    {
      "product_id": "uuid",
      "name": "Steam Gift Card - PKR 1000",
      "slug": "steam-1000",
      "price": 1100.00,
      "discount_percentage": 0,
      "delivery_type": "automatic",
      "stock_count": 50,
      "is_active": true,
      "image_url": "https://..."
    }
  ]
}
```

#### GET /products/:slug
Get product details
- **Auth required**: No
- **Response**: Product object with full details

---

### Orders

#### POST /orders
Create a new order
- **Auth required**: Yes
- **Request Body**:
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "payment_method": "jazzcash"
}
```
- **Response**:
```json
{
  "success": true,
  "order_id": "uuid",
  "order_number": "ORD-2025-001",
  "total_amount": 1100.00,
  "payment_status": "pending"
}
```

#### GET /orders/:id
Get order details
- **Auth required**: Yes (must be order owner or admin)
- **Response**: Complete order details with items and delivery status

#### GET /orders/:id/codes
Get voucher codes for delivered order
- **Auth required**: Yes (must be order owner)
- **Response**:
```json
{
  "success": true,
  "codes": [
    {
      "product_name": "Steam Gift Card",
      "code": "XXXX-XXXX-XXXX-XXXX"
    }
  ]
}
```

---

### Payment

#### POST /payment/jazzcash/verify
Verify JazzCash payment
- **Auth required**: No
- **Request Body**: JazzCash callback data
- **Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

#### POST /payment/easypaisa/verify
Verify EasyPaisa payment
- **Auth required**: No
- **Request Body**: EasyPaisa callback data

#### POST /payment/bank-transfer/verify
Admin verifies bank transfer
- **Auth required**: Yes (Admin only)
- **Request Body**:
```json
{
  "order_id": "uuid",
  "transfer_details": {
    "reference_number": "REF123",
    "amount": 1100.00,
    "bank_name": "HBL",
    "date": "2025-10-21"
  }
}
```

---

### User Dashboard

#### GET /dashboard/orders
Get user's orders
- **Auth required**: Yes
- **Query Parameters**:
  - `status` (string): Filter by status
  - `page` (number): Page number

#### GET /dashboard/profile
Get user profile
- **Auth required**: Yes

#### PUT /dashboard/profile
Update user profile
- **Auth required**: Yes

---

### Admin Endpoints

#### GET /admin/delivery-queue
Get manual delivery queue
- **Auth required**: Yes (Admin only)
- **Query Parameters**:
  - `status` (string): Filter by status (pending, processing, completed)
  - `limit` (number): Max items to return

- **Response**:
```json
{
  "success": true,
  "items": [
    {
      "queue_id": "uuid",
      "order_number": "ORD-2025-001",
      "product_name": "Netflix Premium",
      "customer_email": "user@example.com",
      "quantity": 1,
      "priority": "high",
      "status": "pending",
      "created_at": "2025-10-21T10:30:00Z"
    }
  ]
}
```

#### POST /admin/delivery-queue/:id/assign
Assign delivery item to admin
- **Auth required**: Yes (Admin only)
- **Response**: Updated queue item

#### POST /admin/delivery-queue/:id/process
Process manual delivery
- **Auth required**: Yes (Admin only)
- **Request Body**:
```json
{
  "voucher_codes": [
    "CODE-1234-5678",
    "CODE-8765-4321"
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Codes delivered successfully"
}
```

#### POST /admin/vouchers/import
Bulk import voucher codes
- **Auth required**: Yes (Admin only)
- **Request Body**:
```json
{
  "product_id": "uuid",
  "batch_name": "Batch-001",
  "codes": [
    "CODE1",
    "CODE2",
    "CODE3"
  ],
  "expiry_date": "2026-12-31"
}
```
- **Response**:
```json
{
  "success": true,
  "batch_id": "uuid",
  "codes_imported": 3
}
```

#### GET /admin/inventory-alerts
Get inventory alerts
- **Auth required**: Yes (Admin only)
- **Response**: List of low stock products

#### POST /admin/products
Create new product
- **Auth required**: Yes (Admin only)

#### PUT /admin/products/:id
Update product
- **Auth required**: Yes (Admin only)

---

### Disputes

#### POST /disputes
Create a dispute
- **Auth required**: Yes
- **Request Body**:
```json
{
  "order_id": "uuid",
  "dispute_type": "invalid_code",
  "description": "The code doesn't work"
}
```

#### GET /disputes/:id
Get dispute details
- **Auth required**: Yes

#### POST /disputes/:id/evidence
Add evidence to dispute
- **Auth required**: Yes

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute
- Admin endpoints: 200 requests per minute

## Pagination
Endpoints supporting pagination use these query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```
