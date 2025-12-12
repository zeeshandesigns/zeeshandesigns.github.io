import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";

export async function POST(req, { params }) {
  const { userId } = await auth();

  if (!userId || !(await isAdmin(userId))) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { orderId } = await params;
  const { action, reason } = await req.json();

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending_verification") {
      return Response.json(
        { error: "Only pending orders can be verified" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Approve payment and move to processing
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "processing",
          isPaid: true,
          verifiedBy: userId,
          verifiedAt: new Date(),
          rejectionReason: null,
        },
      });

      return Response.json({
        success: true,
        message: "Payment approved successfully",
        order: updatedOrder,
      });
    } else if (action === "reject") {
      // Reject payment
      if (!reason) {
        return Response.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          rejectionReason: reason,
          verifiedBy: userId,
          verifiedAt: new Date(),
        },
      });

      return Response.json({
        success: true,
        message: "Payment rejected",
        order: updatedOrder,
      });
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return Response.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
