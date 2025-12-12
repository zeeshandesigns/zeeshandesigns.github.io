import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/orders/user
 * Get authenticated user's order history
 */
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // Optional filter by status
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where = { userId };
    if (status) {
      where.status = status;
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                images: true,
                logo: true,
                category: true,
                categoryId: true,
                deliveryType: true,
              },
            },
          },
        },
        deliveredCodes: {
          select: {
            id: true,
            productId: true,
            code: true,
            deliveredAt: true,
            viewedAt: true,
          },
        },
        address: {
          select: {
            id: true,
            name: true,
            phone: true,
            street: true,
            city: true,
            state: true,
            zip: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where });

    // Format orders
    const formattedOrders = orders.map((order) => {
      return {
        id: order.id,
        orderNumber: order.id.substring(0, 8).toUpperCase(),
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalPrice: order.total,
        createdAt: order.createdAt,
        address: order.address,

        // Items
        items: order.orderItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productDescription: item.product.description,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.quantity * item.price,
          images: item.product.images,
          logo: item.product.logo,
          category: item.product.category,
          deliveryType: item.product.deliveryType,
        })),
      };
    });

    return NextResponse.json(
      {
        orders: formattedOrders,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}
