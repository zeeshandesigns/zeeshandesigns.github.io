import { inngest } from "./client";
import prisma from "../lib/prisma";
import {
  createNotification,
  notificationTemplates,
} from "../lib/notifications";

// function to save user data to the database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const data = event.data;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });
  }
);

// inngest function to update user data to the database
export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const data = event.data;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });
  }
);

// inngest function to delete user data from the database
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const data = event.data;
    await prisma.user.delete({
      where: { id: data.id },
    });
  }
);

// ============================================
// GIFT CARD DELIVERY FUNCTIONS
// ============================================

/**
 * Auto-delivery function for instant gift card codes
 * Triggered after payment verification or for COD orders
 * Assigns available codes from product inventory to the order
 */
export const autoDeliverGiftCards = inngest.createFunction(
  { id: "gift-card-auto-delivery" },
  { event: "gift-card/auto-delivery" },
  async ({ event, step }) => {
    const { orderId, userId } = event.data;

    // Fetch order with items
    const order = await step.run("fetch-order", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: {
              product: {
                deliveryType: "instant", // Only instant delivery
              },
            },
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Collect all delivered codes
    const allDeliveredCodes = [];

    // Process each order item
    for (const item of order.items) {
      await step.run(`deliver-codes-${item.id}`, async () => {
        const { product, quantity } = item;

        // Get available codes from product (handle both string and array)
        let availableCodes = [];
        try {
          const codes =
            typeof product.digitalCodes === "string"
              ? JSON.parse(product.digitalCodes)
              : product.digitalCodes;
          availableCodes = Array.isArray(codes) ? codes : [];
        } catch (e) {
          console.error("Error parsing digitalCodes:", e);
          availableCodes = [];
        }

        if (availableCodes.length < quantity) {
          throw new Error(
            `Not enough codes available for product ${product.name}. Need ${quantity}, have ${availableCodes.length}`
          );
        }

        // Take the required number of codes
        const codesToDeliver = availableCodes.slice(0, quantity);
        const remainingCodes = availableCodes.slice(quantity);

        // Extract code strings (handle both string codes and object codes)
        const codeStrings = codesToDeliver.map((code) =>
          typeof code === "string" ? code : code.code || code
        );
        allDeliveredCodes.push(...codeStrings);

        // Create DeliveredCode records
        const deliveredCodes = await Promise.all(
          codeStrings.map((code) =>
            prisma.deliveredCode.create({
              data: {
                code,
                orderId: order.id,
                orderItemId: item.id,
                productId: product.id,
                userId,
              },
            })
          )
        );

        // Update product inventory
        await prisma.product.update({
          where: { id: product.id },
          data: {
            digitalCodes: remainingCodes,
            availableCodes: remainingCodes.length,
            inStock: remainingCodes.length > 0,
          },
        });

        return deliveredCodes;
      });
    }

    // Update order status to CODE_DELIVERED and store codes
    await step.run("complete-order", async () => {
      return await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CODE_DELIVERED",
          deliveredCodes: allDeliveredCodes,
          deliveredAt: new Date(),
        },
      });
    });

    // Send code delivery email
    await step.run("send-code-email", async () => {
      await inngest.send({
        name: "email/code-delivery",
        data: {
          orderId,
          userId,
          userEmail: order.user.email,
          userName: order.user.name,
        },
      });
    });

    // Send in-app notification
    await step.run("send-notification", async () => {
      try {
        const template = notificationTemplates.codeDelivered(
          orderId.substring(0, 8).toUpperCase()
        );
        await createNotification(
          userId,
          template.type,
          template.title,
          template.message,
          template.actionUrl
        );
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    });

    return { success: true, orderId, codesDelivered: order.items.length };
  }
);

/**
 * Manual delivery notification function
 * Notifies admin about orders that need manual fulfillment
 * For physical gift cards that need to be shipped
 */
export const notifyManualDelivery = inngest.createFunction(
  { id: "gift-card-manual-delivery" },
  { event: "gift-card/manual-delivery" },
  async ({ event, step }) => {
    const { orderId, userId } = event.data;

    // Fetch order with manual delivery items
    const order = await step.run("fetch-order", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: {
              product: {
                deliveryType: "manual", // Only manual delivery
              },
            },
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Notify admin about manual delivery order
    await step.run("notify-admin", async () => {
      // TODO: Send email to admin with order details
      // This would include customer shipping address, items ordered, etc.
      console.log(`Notifying admin about manual delivery order`, {
        orderId: order.id,
        items: order.items.length,
        customer: order.user.email,
      });

      // Update order items to "awaiting_shipment"
      await Promise.all(
        order.items.map((item) =>
          prisma.orderItem.update({
            where: { id: item.id },
            data: { status: "awaiting_shipment" },
          })
        )
      );
    });

    // Update order status to awaiting manual codes
    await step.run("update-order-status", async () => {
      return await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "AWAITING_CODES",
        },
      });
    });

    return {
      success: true,
      orderId,
      itemsCount: order.items.length,
    };
  }
);

// ============================================
// EMAIL NOTIFICATION FUNCTIONS
// ============================================

/**
 * Order confirmation email
 * Sent immediately after order is placed
 * Includes order summary and next steps
 */
export const sendOrderConfirmation = inngest.createFunction(
  { id: "email-order-confirmation" },
  { event: "email/order-confirmation" },
  async ({ event, step }) => {
    const { orderId, userEmail, userName } = event.data;

    // Fetch order details
    const order = await step.run("fetch-order", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                  deliveryType: true,
                },
              },
            },
          },
        },
      });
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Send email
    await step.run("send-email", async () => {
      // TODO: Integrate with email service (SendGrid, Resend, etc.)
      console.log("Sending order confirmation email:", {
        to: userEmail,
        subject: `Order Confirmation #${order.id.slice(0, 8)}`,
        orderTotal: order.totalAmount,
        paymentMethod: order.paymentMethod,
        itemCount: order.items.length,
      });

      // Email content would include:
      // - Order ID and date
      // - Payment method and amount
      // - List of items ordered
      // - Expected delivery timeline
      // - Payment proof status (if bank transfer)
      // - Next steps (e.g., "We're verifying your payment")

      return { success: true };
    });

    return { success: true, emailSent: userEmail };
  }
);

/**
 * Gift card code delivery email
 * Sent after codes are assigned to the order
 * Contains the actual gift card codes
 */
export const sendCodeDelivery = inngest.createFunction(
  { id: "email-code-delivery" },
  { event: "email/code-delivery" },
  async ({ event, step }) => {
    const { orderId, userId, userEmail, userName } = event.data;

    // Fetch delivered codes
    const deliveredCodes = await step.run("fetch-codes", async () => {
      return await prisma.deliveredCode.findMany({
        where: {
          orderId,
          userId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              category: true,
            },
          },
        },
      });
    });

    if (deliveredCodes.length === 0) {
      throw new Error(`No codes found for order ${orderId}`);
    }

    // Group codes by product
    const codesByProduct = deliveredCodes.reduce((acc, dc) => {
      const productId = dc.productId;
      if (!acc[productId]) {
        acc[productId] = {
          product: dc.product,
          codes: [],
        };
      }
      acc[productId].codes.push(dc.code);
      return acc;
    }, {});

    // Send email with codes
    await step.run("send-email", async () => {
      // TODO: Integrate with email service
      console.log("Sending gift card codes email:", {
        to: userEmail,
        subject: "Your Gift Card Codes Are Ready! 🎉",
        orderId: orderId.slice(0, 8),
        productCount: Object.keys(codesByProduct).length,
        totalCodes: deliveredCodes.length,
      });

      // Email content would include:
      // - Congratulations message
      // - Order ID
      // - List of products with their codes
      // - Instructions on how to redeem
      // - Terms and conditions
      // - Customer support contact

      // Example structure:
      Object.entries(codesByProduct).forEach(([productId, data]) => {
        console.log(`  ${data.product.name}:`, data.codes);
      });

      return { success: true };
    });

    return {
      success: true,
      emailSent: userEmail,
      codesDelivered: deliveredCodes.length,
    };
  }
);

/**
 * Payment verification email (approved)
 * Sent when admin verifies bank transfer payment
 */
export const sendPaymentVerified = inngest.createFunction(
  { id: "email-payment-verified" },
  { event: "email/payment-verified" },
  async ({ event, step }) => {
    const { orderId, userEmail, userName } = event.data;

    await step.run("send-email", async () => {
      console.log("Sending payment verified email:", {
        to: userEmail,
        subject: "Payment Verified - Your Order is Being Processed! ✅",
        orderId: orderId.slice(0, 8),
      });

      // Email content:
      // - Payment confirmed message
      // - Order now being processed
      // - Expected delivery timeline
      // - Thank you message

      return { success: true };
    });

    return { success: true, emailSent: userEmail };
  }
);

/**
 * Payment rejection email
 * Sent when admin rejects bank transfer payment
 */
export const sendPaymentRejected = inngest.createFunction(
  { id: "email-payment-rejected" },
  { event: "email/payment-rejected" },
  async ({ event, step }) => {
    const { orderId, userEmail, userName, reason } = event.data;

    await step.run("send-email", async () => {
      console.log("Sending payment rejected email:", {
        to: userEmail,
        subject: "Payment Verification Issue - Action Required",
        orderId: orderId.slice(0, 8),
        reason,
      });

      // Email content:
      // - Payment could not be verified
      // - Reason for rejection
      // - Instructions to contact support
      // - How to place a new order

      return { success: true };
    });

    return { success: true, emailSent: userEmail };
  }
);
