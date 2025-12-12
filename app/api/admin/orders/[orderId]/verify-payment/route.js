import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { createNotification, notificationTemplates } from "@/lib/notifications";

/**
 * POST /api/admin/orders/[orderId]/verify-payment
 * Verify or reject payment proof for bank transfer orders
 * Body: { action: "verify" | "reject", rejectionReason?: string }
 */
export async function POST(request, { params }) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin privileges
    const isAdminUser = await isAdmin(userId);
    if (!isAdminUser) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    // Validate action
    if (!action || !["verify", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Use 'verify' or 'reject'",
        },
        { status: 400 }
      );
    }

    // Check if order exists and is pending verification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                deliveryType: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "PAYMENT_SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error: `Order is already ${order.status}. Only PAYMENT_SUBMITTED orders can be reviewed.`,
        },
        { status: 400 }
      );
    }

    if (action === "verify") {
      // APPROVE: Update order status to payment verified
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAYMENT_VERIFIED",
          verifiedBy: userId,
          verifiedAt: new Date(),
          isPaid: true,
        },
      });

      // Trigger Inngest event for gift card delivery
      // Auto-delivery for instant codes, manual for physical cards
      const hasInstantDelivery = order.items.some(
        (item) => item.product.deliveryType === "instant"
      );
      const hasManualDelivery = order.items.some(
        (item) => item.product.deliveryType === "manual"
      );

      if (hasInstantDelivery) {
        await inngest.send({
          name: "gift-card/auto-delivery",
          data: {
            orderId: order.id,
            userId: order.userId,
          },
        });
      }

      if (hasManualDelivery) {
        await inngest.send({
          name: "gift-card/manual-delivery",
          data: {
            orderId: order.id,
            userId: order.userId,
          },
        });
      }

      // Send email notification
      await inngest.send({
        name: "email/payment-verified",
        data: {
          orderId: order.id,
          userEmail: order.user.email,
          userName: order.user.name,
        },
      });

      // Send in-app notification
      try {
        const template = notificationTemplates.orderVerified(
          order.id.substring(0, 8).toUpperCase()
        );
        await createNotification(
          order.userId,
          template.type,
          template.title,
          template.message,
          template.actionUrl
        );
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Payment verified and order is now processing",
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            totalAmount: updatedOrder.totalAmount,
          },
        },
        { status: 200 }
      );
    } else {
      // REJECT: Update order status to cancelled
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          rejectionReason: rejectionReason || "Payment verification failed",
        },
      });

      // Send rejection email
      await inngest.send({
        name: "email/payment-rejected",
        data: {
          orderId: order.id,
          userEmail: order.user.email,
          userName: order.user.name,
          reason: rejectionReason || "Payment verification failed",
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Payment rejected and order cancelled",
          order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            rejectionReason: updatedOrder.rejectionReason,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
