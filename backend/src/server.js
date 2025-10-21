const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const config = require('./config');

// Import services
const VoucherService = require('./services/VoucherService');
const DeliveryService = require('./services/DeliveryService');
const PaymentService = require('./services/PaymentService');
const EmailService = require('./services/EmailService');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const dbPool = new Pool(config.database);

// Initialize services
const emailService = new EmailService({
  smtp: config.smtp,
  fromEmail: config.email.fromEmail
});

const voucherService = new VoucherService(dbPool, config.encryption.key);
const deliveryService = new DeliveryService(dbPool, voucherService, emailService);
const paymentService = new PaymentService(dbPool, {
  jazzcash: config.jazzcash,
  easypaisa: config.easypaisa
});

// Make services available to routes
app.locals.services = {
  voucherService,
  deliveryService,
  paymentService,
  emailService,
  dbPool
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    name: 'PakGifts API',
    version: '1.0.0',
    description: 'E-commerce platform for digital gift cards',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      products: '/api/products/*',
      orders: '/api/orders/*',
      admin: '/api/admin/*'
    }
  });
});

// Example product listing endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { category, delivery_type, search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category_id = $${params.length}`;
    }

    if (delivery_type) {
      params.push(delivery_type);
      query += ` AND delivery_type = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    query += ' ORDER BY display_order, created_at DESC LIMIT 50';

    const result = await dbPool.query(query, params);
    res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Example categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const result = await dbPool.query(
      `SELECT * FROM categories 
       WHERE is_active = true 
       ORDER BY display_order, name`
    );

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.server.env === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`PakGifts API server running on port ${PORT}`);
  console.log(`Environment: ${config.server.env}`);
  console.log(`Frontend URL: ${config.frontend.url}`);
});

module.exports = app;
