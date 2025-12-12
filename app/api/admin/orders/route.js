import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

// GET /api/admin/orders - Get all orders with filters
export async function GET(req) {
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

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
                  requiresApproval: true,
                },
              },
            },
          },
          deliveredCodes: true,
          _count: {
            select: { orderItems: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      {
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
