import prisma from "@/lib/prisma";

/**
 * Create a notification for a user
 * @param {string} userId - User ID to notify
 * @param {string} type - Notification type (from NotificationType enum)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} actionUrl - Optional URL to navigate to
 */
export async function createNotification(
  userId,
  type,
  title,
  message,
  actionUrl = null
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create notification for all admins
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} actionUrl - Optional URL to navigate to
 */
export async function notifyAdmins(type, title, message, actionUrl = null) {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    });

    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type,
            title,
            message,
            actionUrl,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Error notifying admins:", error);
    return null;
  }
}

/**
 * Notification types and helper functions
 */
export const NotificationTypes = {
  // User notifications
  ORDER_PLACED: "ORDER_PLACED",
  ORDER_VERIFIED: "ORDER_VERIFIED",
  CODE_DELIVERED: "CODE_DELIVERED",
  WALLET_TOPUP: "WALLET_TOPUP",
  DISPUTE_UPDATE: "DISPUTE_UPDATE",
  REFUND_ISSUED: "REFUND_ISSUED",

  // Admin notifications
  ADMIN_ORDER: "ADMIN_ORDER",
  ADMIN_PAYMENT: "ADMIN_PAYMENT",
  ADMIN_DISPUTE: "ADMIN_DISPUTE",
  SYSTEM_UPDATE: "SYSTEM_UPDATE",
};

/**
 * Pre-defined notification templates
 */
export const notificationTemplates = {
  orderPlaced: (orderId, total) => ({
    type: NotificationTypes.ORDER_PLACED,
    title: "Order Placed Successfully",
    message: `Your order #${orderId.substring(
      0,
      8
    )} for ₨${total} has been placed successfully.`,
    actionUrl: `/orders`,
  }),

  orderVerified: (orderId) => ({
    type: NotificationTypes.ORDER_VERIFIED,
    title: "Payment Verified",
    message: `Your payment for order #${orderId.substring(
      0,
      8
    )} has been verified. Your codes will be delivered soon.`,
    actionUrl: `/orders`,
  }),

  codeDelivered: (orderId) => ({
    type: NotificationTypes.CODE_DELIVERED,
    title: "Codes Delivered",
    message: `Your gift card codes for order #${orderId.substring(
      0,
      8
    )} are now available!`,
    actionUrl: `/orders`,
  }),

  walletTopupApproved: (amount) => ({
    type: NotificationTypes.WALLET_TOPUP,
    title: "Wallet Credited",
    message: `₨${amount} has been added to your wallet. You can now make purchases!`,
    actionUrl: `/wallet`,
  }),

  disputeUpdate: (disputeId, status) => ({
    type: NotificationTypes.DISPUTE_UPDATE,
    title: "Dispute Update",
    message: `Your dispute #${disputeId.substring(
      0,
      8
    )} status has been updated to ${status}.`,
    actionUrl: `/disputes/${disputeId}`,
  }),

  refundIssued: (amount, disputeId) => ({
    type: NotificationTypes.REFUND_ISSUED,
    title: "Refund Processed",
    message: `₨${amount} has been refunded to your wallet for dispute #${disputeId.substring(
      0,
      8
    )}.`,
    actionUrl: `/wallet`,
  }),

  // Admin templates
  adminNewOrder: (orderId, customerName, total) => ({
    type: NotificationTypes.ADMIN_ORDER,
    title: "New Order Received",
    message: `${customerName} placed an order #${orderId.substring(
      0,
      8
    )} for ₨${total}.`,
    actionUrl: `/admin/orders`,
  }),

  adminPaymentSubmitted: (orderId, amount) => ({
    type: NotificationTypes.ADMIN_PAYMENT,
    title: "Payment Proof Submitted",
    message: `Payment proof for order #${orderId.substring(
      0,
      8
    )} (₨${amount}) needs verification.`,
    actionUrl: `/admin/approve`,
  }),

  adminNewDispute: (disputeId, orderId, reason) => ({
    type: NotificationTypes.ADMIN_DISPUTE,
    title: "New Dispute Created",
    message: `New dispute #${disputeId.substring(
      0,
      8
    )} for order #${orderId.substring(0, 8)}: ${reason}`,
    actionUrl: `/admin/disputes`,
  }),
};
