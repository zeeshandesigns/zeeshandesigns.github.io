const crypto = require('crypto');
const { Pool } = require('pg');

/**
 * PaymentService - Handles payment verification for multiple payment methods
 */
class PaymentService {
  constructor(dbPool, config) {
    this.db = dbPool;
    this.config = config;
  }

  /**
   * Create a payment transaction
   */
  async createTransaction(orderId, userId, amount, paymentMethod, metadata = {}) {
    const result = await this.db.query(
      `INSERT INTO transactions 
       (order_id, user_id, transaction_type, amount, payment_method, metadata, status)
       VALUES ($1, $2, 'payment', $3, $4, $5, 'pending')
       RETURNING transaction_id`,
      [orderId, userId, amount, paymentMethod, JSON.stringify(metadata)]
    );

    return result.rows[0].transaction_id;
  }

  /**
   * Verify JazzCash payment
   */
  async verifyJazzCashPayment(orderId, paymentData) {
    try {
      // JazzCash payment verification logic
      const { pp_TxnRefNo, pp_Amount, pp_ResponseCode, pp_SecureHash } = paymentData;

      // Calculate expected hash
      const sortedString = this.getSortedJazzCashString(paymentData);
      const expectedHash = crypto
        .createHmac('sha256', this.config.jazzcash.salt)
        .update(sortedString)
        .digest('hex');

      // Verify hash
      if (pp_SecureHash.toLowerCase() !== expectedHash.toLowerCase()) {
        await this.updateTransactionStatus(orderId, 'failed', {
          reason: 'Hash verification failed',
          paymentData
        });
        return {
          success: false,
          message: 'Payment verification failed - invalid signature'
        };
      }

      // Check response code
      if (pp_ResponseCode !== '000') {
        await this.updateTransactionStatus(orderId, 'failed', {
          reason: `Payment failed with code: ${pp_ResponseCode}`,
          paymentData
        });
        return {
          success: false,
          message: 'Payment was not successful'
        };
      }

      // Mark transaction as completed
      await this.updateTransactionStatus(orderId, 'completed', {
        paymentGatewayRef: pp_TxnRefNo,
        paymentData
      });

      // Update order payment status
      await this.db.query(
        `UPDATE orders 
         SET payment_status = 'verified'
         WHERE order_id = $1`,
        [orderId]
      );

      return {
        success: true,
        message: 'Payment verified successfully',
        transactionRef: pp_TxnRefNo
      };
    } catch (error) {
      await this.updateTransactionStatus(orderId, 'failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify EasyPaisa payment
   */
  async verifyEasyPaisaPayment(orderId, paymentData) {
    try {
      // EasyPaisa payment verification logic
      const { transactionId, orderId: epOrderId, amount, status } = paymentData;

      // In production, make API call to EasyPaisa to verify transaction
      // For now, checking status from callback
      if (status !== 'SUCCESS') {
        await this.updateTransactionStatus(orderId, 'failed', {
          reason: 'Payment not successful',
          paymentData
        });
        return {
          success: false,
          message: 'Payment was not successful'
        };
      }

      // Mark transaction as completed
      await this.updateTransactionStatus(orderId, 'completed', {
        paymentGatewayRef: transactionId,
        paymentData
      });

      // Update order payment status
      await this.db.query(
        `UPDATE orders 
         SET payment_status = 'verified'
         WHERE order_id = $1`,
        [orderId]
      );

      return {
        success: true,
        message: 'Payment verified successfully',
        transactionRef: transactionId
      };
    } catch (error) {
      await this.updateTransactionStatus(orderId, 'failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process bank transfer verification
   */
  async processBankTransferVerification(orderId, transferDetails, adminId) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Store transfer details
      await client.query(
        `UPDATE orders 
         SET payment_details = $1, payment_status = 'verified'
         WHERE order_id = $2`,
        [JSON.stringify(transferDetails), orderId]
      );

      // Update transaction status
      await this.updateTransactionStatus(orderId, 'completed', {
        verifiedBy: adminId,
        transferDetails
      });

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Bank transfer verified successfully'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process wallet payment
   */
  async processWalletPayment(orderId, userId, amount) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check wallet balance
      const userResult = await client.query(
        `SELECT wallet_balance FROM users WHERE user_id = $1 FOR UPDATE`,
        [userId]
      );

      const walletBalance = parseFloat(userResult.rows[0].wallet_balance);

      if (walletBalance < amount) {
        await client.query('ROLLBACK');
        return {
          success: false,
          message: 'Insufficient wallet balance',
          currentBalance: walletBalance,
          required: amount
        };
      }

      // Deduct from wallet
      await client.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance - $1
         WHERE user_id = $2`,
        [amount, userId]
      );

      // Create wallet debit transaction
      await client.query(
        `INSERT INTO transactions 
         (order_id, user_id, transaction_type, amount, payment_method, status)
         VALUES ($1, $2, 'wallet_debit', $3, 'wallet', 'completed')`,
        [orderId, userId, amount]
      );

      // Update order payment status
      await client.query(
        `UPDATE orders 
         SET payment_status = 'verified'
         WHERE order_id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Payment processed successfully',
        newBalance: walletBalance - amount
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process refund
   */
  async processRefund(orderId, amount, reason, adminId) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get order details
      const orderResult = await client.query(
        `SELECT user_id, payment_method FROM orders WHERE order_id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const { user_id, payment_method } = orderResult.rows[0];

      // Credit to wallet
      await client.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance + $1
         WHERE user_id = $2`,
        [amount, user_id]
      );

      // Create refund transaction
      await client.query(
        `INSERT INTO transactions 
         (order_id, user_id, transaction_type, amount, payment_method, status, metadata)
         VALUES ($1, $2, 'refund', $3, $4, 'completed', $5)`,
        [
          orderId,
          user_id,
          amount,
          payment_method,
          JSON.stringify({ reason, processedBy: adminId })
        ]
      );

      // Update order payment status
      await client.query(
        `UPDATE orders 
         SET payment_status = 'refunded'
         WHERE order_id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Refund processed successfully',
        amount
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(orderId, status, metadata = {}) {
    await this.db.query(
      `UPDATE transactions 
       SET status = $1, metadata = $2, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $3 AND transaction_type = 'payment'`,
      [status, JSON.stringify(metadata), orderId]
    );
  }

  /**
   * Get sorted string for JazzCash hash calculation
   */
  getSortedJazzCashString(data) {
    // Remove pp_SecureHash from data
    const { pp_SecureHash, ...dataWithoutHash } = data;
    
    // Sort keys and create string
    const sortedKeys = Object.keys(dataWithoutHash).sort();
    let str = this.config.jazzcash.salt + '&';
    
    sortedKeys.forEach(key => {
      if (dataWithoutHash[key] !== '') {
        str += dataWithoutHash[key] + '&';
      }
    });
    
    return str.slice(0, -1); // Remove trailing &
  }

  /**
   * Get payment pending orders
   */
  async getPendingPayments(limit = 50) {
    const result = await this.db.query(
      `SELECT o.order_id, o.order_number, o.final_amount, o.payment_method,
              o.created_at, o.payment_details,
              u.full_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       WHERE o.payment_status = 'pending'
       ORDER BY o.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

module.exports = PaymentService;
