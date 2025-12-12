import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return Response.json(
        { error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (order.status === "completed") {
      return Response.json(
        { error: "Cannot cancel completed orders" },
        { status: 400 }
      );
    }

    if (order.status === "cancelled") {
      return Response.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    // Only allow cancellation for pending_verification and processing status
    if (
      order.status !== "pending_verification" &&
      order.status !== "processing"
    ) {
      return Response.json(
        { error: "This order cannot be cancelled" },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "cancelled",
        cancellationReason: "Cancelled by user",
        updatedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return Response.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
