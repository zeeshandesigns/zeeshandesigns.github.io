import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/orders/pending-verification
 * Fetch orders with pending payment verification (bank transfers)
 * Admin only - shows orders with status='pending_verification'
 */
export async function GET(request) {
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

    // Fetch orders pending verification
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "pending_verification",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
            store: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest first (FIFO)
      },
    });

    // Format response with additional info
    const formattedOrders = pendingOrders.map((order) => {
      const totalItems = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const waitingHours = Math.floor(
        (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60)
      );

      return {
        ...order,
        totalItems,
        waitingHours,
        needsUrgentReview: waitingHours > 24, // Flag if waiting more than 24 hours
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formattedOrders.length,
        orders: formattedOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pending orders",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
