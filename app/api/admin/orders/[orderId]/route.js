import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/orders/[orderId]
 * Get single order details (admin only)
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        address: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                deliveryType: true,
              },
            },
          },
        },
        deliveredCodes: true,
        walletTransaction: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
