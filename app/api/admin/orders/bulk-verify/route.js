import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";

export async function POST(req) {
  const { userId } = await auth();

  if (!userId || !(await isAdmin(userId))) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { orderIds, action, reason } = await req.json();

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return Response.json(
      { error: "Order IDs array is required" },
      { status: 400 }
    );
  }

  if (!action || !["approve", "reject"].includes(action)) {
    return Response.json(
      { error: "Valid action (approve/reject) is required" },
      { status: 400 }
    );
  }

  if (action === "reject" && !reason) {
    return Response.json(
      { error: "Rejection reason is required" },
      { status: 400 }
    );
  }

  try {
    // Verify all orders exist and are pending
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        status: "pending_verification",
      },
    });

    if (orders.length === 0) {
      return Response.json(
        { error: "No valid pending orders found" },
        { status: 404 }
      );
    }

    if (orders.length !== orderIds.length) {
      return Response.json(
        {
          error: `Only ${orders.length} of ${orderIds.length} orders can be processed`,
        },
        { status: 400 }
      );
    }

    // Update all orders
    const updateData =
      action === "approve"
        ? {
            status: "processing",
            isPaid: true,
            verifiedBy: userId,
            verifiedAt: new Date(),
            rejectionReason: null,
          }
        : {
            status: "cancelled",
            rejectionReason: reason,
            verifiedBy: userId,
            verifiedAt: new Date(),
          };

    const result = await prisma.order.updateMany({
      where: { id: { in: orders.map((o) => o.id) } },
      data: updateData,
    });

    return Response.json({
      success: true,
      message: `Successfully ${
        action === "approve" ? "approved" : "rejected"
      } ${result.count} order(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error in bulk verification:", error);
    return Response.json(
      { error: "Failed to process bulk verification" },
      { status: 500 }
    );
  }
}
