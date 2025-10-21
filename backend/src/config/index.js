require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pakgifts_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '00000000000000000000000000000000'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  },
  email: {
    fromEmail: process.env.EMAIL_FROM || 'noreply@pakgifts.com'
  },
  jazzcash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID,
    password: process.env.JAZZCASH_PASSWORD,
    salt: process.env.JAZZCASH_SALT
  },
  easypaisa: {
    storeId: process.env.EASYPAISA_STORE_ID,
    apiKey: process.env.EASYPAISA_API_KEY
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880,
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  }
};
