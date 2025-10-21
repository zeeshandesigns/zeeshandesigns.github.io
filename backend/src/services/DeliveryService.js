const { Pool } = require('pg');

/**
 * DeliveryService - Handles both automatic and manual delivery workflows
 */
class DeliveryService {
  constructor(dbPool, voucherService, emailService) {
    this.db = dbPool;
    this.voucherService = voucherService;
    this.emailService = emailService;
  }

  /**
   * Process automatic delivery for an order
   */
  async processAutomaticDelivery(orderId) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get order items with automatic delivery
      const orderItemsResult = await client.query(
        `SELECT oi.order_item_id, oi.product_id, oi.quantity, oi.voucher_code_id,
                p.name as product_name, p.delivery_type,
                o.user_id, u.email
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         JOIN orders o ON oi.order_id = o.order_id
         JOIN users u ON o.user_id = u.user_id
         WHERE oi.order_id = $1 AND p.delivery_type = 'automatic'
         AND oi.delivery_status = 'pending'`,
        [orderId]
      );

      if (orderItemsResult.rows.length === 0) {
        await client.query('COMMIT');
        return { success: true, message: 'No automatic delivery items found' };
      }

      const deliveryResults = [];

      for (const item of orderItemsResult.rows) {
        try {
          // Get voucher codes for this order item
          const codes = await this.voucherService.getOrderCodes(orderId);
          const itemCodes = codes.filter(c => c.productId === item.product_id);

          if (itemCodes.length < item.quantity) {
            throw new Error(`Insufficient codes for product ${item.product_name}`);
          }

          // Mark codes as sold
          const codeIds = itemCodes.slice(0, item.quantity).map(c => c.codeId);
          await this.voucherService.markCodesAsSold(codeIds);

          // Update order item status
          await client.query(
            `UPDATE order_items 
             SET delivery_status = 'completed', delivered_at = CURRENT_TIMESTAMP
             WHERE order_item_id = $1`,
            [item.order_item_id]
          );

          // Send codes via email
          const voucherCodes = itemCodes.slice(0, item.quantity).map(c => c.code);
          await this.emailService.sendVoucherCodes(
            item.email,
            item.product_name,
            voucherCodes
          );

          deliveryResults.push({
            orderItemId: item.order_item_id,
            productName: item.product_name,
            status: 'delivered',
            codesDelivered: item.quantity
          });
        } catch (error) {
          // Mark as failed
          await client.query(
            `UPDATE order_items 
             SET delivery_status = 'failed'
             WHERE order_item_id = $1`,
            [item.order_item_id]
          );

          deliveryResults.push({
            orderItemId: item.order_item_id,
            productName: item.product_name,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Update overall order status
      const allDelivered = deliveryResults.every(r => r.status === 'delivered');
      await client.query(
        `UPDATE orders 
         SET delivery_status = $1
         WHERE order_id = $2`,
        [allDelivered ? 'completed' : 'processing', orderId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        deliveryResults
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Queue manual delivery items
   */
  async queueManualDelivery(orderId) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get order items with manual delivery
      const orderItemsResult = await client.query(
        `SELECT oi.order_item_id, oi.product_id, oi.quantity,
                o.user_id, p.name as product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         JOIN orders o ON oi.order_id = o.order_id
         WHERE oi.order_id = $1 AND p.delivery_type = 'manual'
         AND oi.delivery_status = 'pending'`,
        [orderId]
      );

      if (orderItemsResult.rows.length === 0) {
        await client.query('COMMIT');
        return { success: true, message: 'No manual delivery items found' };
      }

      const queueResults = [];

      for (const item of orderItemsResult.rows) {
        // Add to manual delivery queue
        const queueResult = await client.query(
          `INSERT INTO manual_delivery_queue 
           (order_item_id, order_id, product_id, user_id, quantity, priority)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING queue_id`,
          [
            item.order_item_id,
            orderId,
            item.product_id,
            item.user_id,
            item.quantity,
            'normal'
          ]
        );

        // Update order item status
        await client.query(
          `UPDATE order_items 
           SET delivery_status = 'processing'
           WHERE order_item_id = $1`,
          [item.order_item_id]
        );

        queueResults.push({
          orderItemId: item.order_item_id,
          productName: item.product_name,
          queueId: queueResult.rows[0].queue_id
        });
      }

      // Update order status
      await client.query(
        `UPDATE orders 
         SET delivery_status = 'processing'
         WHERE order_id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        queuedItems: queueResults.length,
        queueResults
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get manual delivery queue items
   */
  async getManualDeliveryQueue(status = 'pending', limit = 50) {
    const result = await this.db.query(
      `SELECT mdq.queue_id, mdq.order_id, mdq.order_item_id, 
              mdq.product_id, mdq.quantity, mdq.priority, mdq.status,
              mdq.assigned_to, mdq.created_at, mdq.notes,
              p.name as product_name, p.price,
              u.email as customer_email, u.full_name as customer_name,
              o.order_number, o.payment_status
       FROM manual_delivery_queue mdq
       JOIN products p ON mdq.product_id = p.product_id
       JOIN users u ON mdq.user_id = u.user_id
       JOIN orders o ON mdq.order_id = o.order_id
       WHERE mdq.status = $1
       ORDER BY 
         CASE mdq.priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'normal' THEN 3
           WHEN 'low' THEN 4
         END,
         mdq.created_at ASC
       LIMIT $2`,
      [status, limit]
    );

    return result.rows;
  }

  /**
   * Process manual delivery (admin completes delivery)
   */
  async processManualDeliveryItem(queueId, adminId, voucherCodes) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get queue item details
      const queueResult = await client.query(
        `SELECT mdq.*, u.email, p.name as product_name
         FROM manual_delivery_queue mdq
         JOIN users u ON mdq.user_id = u.user_id
         JOIN products p ON mdq.product_id = p.product_id
         WHERE mdq.queue_id = $1`,
        [queueId]
      );

      if (queueResult.rows.length === 0) {
        throw new Error('Queue item not found');
      }

      const queueItem = queueResult.rows[0];

      if (voucherCodes.length !== queueItem.quantity) {
        throw new Error(`Expected ${queueItem.quantity} codes but received ${voucherCodes.length}`);
      }

      // Store the voucher codes
      await this.voucherService.importCodes(
        queueItem.product_id,
        voucherCodes,
        `Manual-${queueItem.order_number}`,
        adminId
      );

      // Reserve and mark as sold
      const reserveResult = await this.voucherService.reserveCodes(
        queueItem.product_id,
        queueItem.quantity,
        queueItem.order_id
      );

      if (!reserveResult.success) {
        throw new Error('Failed to reserve codes');
      }

      await this.voucherService.markCodesAsSold(reserveResult.reservedCodes);

      // Update queue item
      await client.query(
        `UPDATE manual_delivery_queue 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE queue_id = $1`,
        [queueId]
      );

      // Update order item
      await client.query(
        `UPDATE order_items 
         SET delivery_status = 'completed', delivered_at = CURRENT_TIMESTAMP
         WHERE order_item_id = $1`,
        [queueItem.order_item_id]
      );

      // Send codes to customer
      await this.emailService.sendVoucherCodes(
        queueItem.email,
        queueItem.product_name,
        voucherCodes
      );

      // Check if all items in order are delivered
      const pendingItems = await client.query(
        `SELECT COUNT(*) as pending_count
         FROM order_items
         WHERE order_id = $1 AND delivery_status != 'completed'`,
        [queueItem.order_id]
      );

      if (parseInt(pendingItems.rows[0].pending_count, 10) === 0) {
        await client.query(
          `UPDATE orders 
           SET delivery_status = 'completed'
           WHERE order_id = $1`,
          [queueItem.order_id]
        );
      }

      await client.query('COMMIT');

      return {
        success: true,
        queueId,
        orderItemId: queueItem.order_item_id,
        codesDelivered: voucherCodes.length
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Assign manual delivery item to admin
   */
  async assignManualDeliveryItem(queueId, adminId) {
    const result = await this.db.query(
      `UPDATE manual_delivery_queue 
       SET assigned_to = $1, assigned_at = CURRENT_TIMESTAMP, status = 'processing'
       WHERE queue_id = $2
       RETURNING queue_id`,
      [adminId, queueId]
    );

    return result.rows[0];
  }

  /**
   * Get delivery status for an order
   */
  async getOrderDeliveryStatus(orderId) {
    const result = await this.db.query(
      `SELECT oi.order_item_id, oi.delivery_status, oi.delivered_at,
              p.name as product_name, p.delivery_type, oi.quantity,
              mdq.status as queue_status, mdq.priority
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       LEFT JOIN manual_delivery_queue mdq ON oi.order_item_id = mdq.order_item_id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    return result.rows;
  }
}

module.exports = DeliveryService;
