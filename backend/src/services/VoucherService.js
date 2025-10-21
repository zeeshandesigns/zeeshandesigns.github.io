const crypto = require('crypto');
const { Pool } = require('pg');

/**
 * VoucherService - Manages voucher codes with encryption and secure storage
 */
class VoucherService {
  constructor(dbPool, encryptionKey) {
    this.db = dbPool;
    this.encryptionKey = encryptionKey;
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Encrypt a voucher code
   */
  encryptCode(code) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    let encrypted = cipher.update(code, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt a voucher code
   */
  decryptCode(encryptedCode) {
    const parts = encryptedCode.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Generate a hash for code verification
   */
  hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Import voucher codes in bulk
   */
  async importCodes(productId, codes, batchName = null, uploadedBy = null, expiryDate = null) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Create batch
      const batchResult = await client.query(
        `INSERT INTO voucher_code_batches 
         (product_id, batch_name, total_codes, uploaded_by, expiry_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING batch_id`,
        [productId, batchName, codes.length, uploadedBy, expiryDate]
      );
      const batchId = batchResult.rows[0].batch_id;

      // Insert codes
      const insertPromises = codes.map(code => {
        const encrypted = this.encryptCode(code);
        const hash = this.hashCode(code);
        return client.query(
          `INSERT INTO voucher_codes 
           (batch_id, product_id, code_encrypted, code_hash, expiry_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [batchId, productId, encrypted, hash, expiryDate]
        );
      });

      await Promise.all(insertPromises);

      // Update product stock count
      await client.query(
        `UPDATE products 
         SET stock_count = stock_count + $1
         WHERE product_id = $2`,
        [codes.length, productId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        batchId,
        codesImported: codes.length
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reserve voucher codes for an order
   */
  async reserveCodes(productId, quantity, orderId) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE voucher_codes 
         SET status = 'reserved', reserved_at = CURRENT_TIMESTAMP, order_id = $3
         WHERE code_id IN (
           SELECT code_id FROM voucher_codes
           WHERE product_id = $1 AND status = 'available'
           AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP)
           ORDER BY created_at
           LIMIT $2
           FOR UPDATE SKIP LOCKED
         )
         RETURNING code_id`,
        [productId, quantity, orderId]
      );

      if (result.rows.length < quantity) {
        await client.query('ROLLBACK');
        return {
          success: false,
          message: 'Insufficient voucher codes available',
          requested: quantity,
          available: result.rows.length
        };
      }

      await client.query('COMMIT');

      return {
        success: true,
        reservedCodes: result.rows.map(row => row.code_id)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Mark codes as sold
   */
  async markCodesAsSold(codeIds) {
    const result = await this.db.query(
      `UPDATE voucher_codes 
       SET status = 'sold', sold_at = CURRENT_TIMESTAMP
       WHERE code_id = ANY($1)
       RETURNING code_id`,
      [codeIds]
    );

    return result.rows;
  }

  /**
   * Release reserved codes (in case of payment failure)
   */
  async releaseReservedCodes(orderId) {
    const result = await this.db.query(
      `UPDATE voucher_codes 
       SET status = 'available', reserved_at = NULL, order_id = NULL
       WHERE order_id = $1 AND status = 'reserved'
       RETURNING code_id`,
      [orderId]
    );

    return result.rows;
  }

  /**
   * Get voucher codes for an order (decrypted)
   */
  async getOrderCodes(orderId) {
    const result = await this.db.query(
      `SELECT code_id, code_encrypted, product_id
       FROM voucher_codes
       WHERE order_id = $1 AND status = 'sold'`,
      [orderId]
    );

    return result.rows.map(row => ({
      codeId: row.code_id,
      productId: row.product_id,
      code: this.decryptCode(row.code_encrypted)
    }));
  }

  /**
   * Check inventory levels and create alerts
   */
  async checkInventoryLevels() {
    const result = await this.db.query(
      `SELECT p.product_id, p.name, p.stock_count, p.min_stock_threshold,
              COUNT(vc.code_id) as available_codes
       FROM products p
       LEFT JOIN voucher_codes vc ON p.product_id = vc.product_id 
         AND vc.status = 'available'
       WHERE p.is_active = true
       GROUP BY p.product_id, p.name, p.stock_count, p.min_stock_threshold
       HAVING COUNT(vc.code_id) <= p.min_stock_threshold`
    );

    // Create alerts for low stock products
    for (const product of result.rows) {
      await this.db.query(
        `INSERT INTO inventory_alerts 
         (product_id, alert_type, current_stock, threshold)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [
          product.product_id,
          product.available_codes === 0 ? 'out_of_stock' : 'low_stock',
          product.available_codes,
          product.min_stock_threshold
        ]
      );
    }

    return result.rows;
  }

  /**
   * Get available stock for a product
   */
  async getAvailableStock(productId) {
    const result = await this.db.query(
      `SELECT COUNT(*) as available_count
       FROM voucher_codes
       WHERE product_id = $1 AND status = 'available'
       AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP)`,
      [productId]
    );

    return parseInt(result.rows[0].available_count, 10);
  }

  /**
   * Mark expired codes
   */
  async markExpiredCodes() {
    const result = await this.db.query(
      `UPDATE voucher_codes 
       SET status = 'expired'
       WHERE status IN ('available', 'reserved') 
       AND expiry_date IS NOT NULL 
       AND expiry_date < CURRENT_TIMESTAMP
       RETURNING code_id`
    );

    return result.rows.length;
  }

  /**
   * Export codes for a product (for admin backup)
   */
  async exportCodes(productId, status = 'available') {
    const result = await this.db.query(
      `SELECT code_encrypted, status, created_at, expiry_date
       FROM voucher_codes
       WHERE product_id = $1 AND status = $2
       ORDER BY created_at DESC`,
      [productId, status]
    );

    return result.rows.map(row => ({
      code: this.decryptCode(row.code_encrypted),
      status: row.status,
      createdAt: row.created_at,
      expiryDate: row.expiry_date
    }));
  }
}

module.exports = VoucherService;
