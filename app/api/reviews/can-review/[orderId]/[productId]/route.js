import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/reviews/can-review/[orderId]/[productId]
 * Check if user can review a specific product from an order
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, productId } = await params;

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          where: { productId },
        },
      },
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json({ canReview: false, reason: "Invalid order" });
    }

    if (order.orderItems.length === 0) {
      return NextResponse.json({
        canReview: false,
        reason: "Product not in order",
      });
    }

    // Check if delivered
    const validStatuses = ["CODE_DELIVERED", "DELIVERED"];
    if (!validStatuses.includes(order.status)) {
      return NextResponse.json({
        canReview: false,
        reason: "Order not delivered yet",
      });
    }

    // Check if already reviewed
    const existingReview = await prisma.orderReview.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({
        canReview: false,
        reason: "Already reviewed",
        existingReview,
      });
    }

    return NextResponse.json({
      canReview: true,
      order: {
        id: order.id,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}
