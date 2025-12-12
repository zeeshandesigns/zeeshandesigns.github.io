import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/admin/orders/[orderId]/upload-codes
 * Upload codes for manual delivery orders
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(userId);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const { codes } = body; // Array of codes like ["CODE1", "CODE2"]

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of codes" },
        { status: 400 }
      );
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is paid and requires manual delivery
    if (!order.isPaid) {
      return NextResponse.json(
        { error: "Order is not paid yet" },
        { status: 400 }
      );
    }

    // Find manual delivery products
    const manualProducts = order.orderItems.filter(
      (item) => item.product.deliveryType === "manual"
    );

    if (manualProducts.length === 0) {
      return NextResponse.json(
        { error: "No manual delivery products in this order" },
        { status: 400 }
      );
    }

    // Get total quantity needed
    const totalQuantity = manualProducts.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (codes.length !== totalQuantity) {
      return NextResponse.json(
        {
          error: `Please provide exactly ${totalQuantity} codes (${codes.length} provided)`,
        },
        { status: 400 }
      );
    }

    // Create DeliveredCode records for each code
    let codeIndex = 0;
    const deliveredCodes = [];

    for (const item of manualProducts) {
      for (let i = 0; i < item.quantity; i++) {
        const code = codes[codeIndex];
        const deliveredCode = await prisma.deliveredCode.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            userId: order.userId,
            code: code,
            deliveredAt: new Date(),
          },
        });
        deliveredCodes.push(deliveredCode);
        codeIndex++;
      }
    }

    // Update order status to CODE_DELIVERED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CODE_DELIVERED",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${codes.length} codes`,
      order: updatedOrder,
      deliveredCodes: deliveredCodes.length,
    });
  } catch (error) {
    console.error("Error uploading codes:", error);
    return NextResponse.json(
      { error: "Failed to upload codes: " + error.message },
      { status: 500 }
    );
  }
}
