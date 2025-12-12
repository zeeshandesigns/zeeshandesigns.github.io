import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/middlewares/admin";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/disputes
 * Get all disputes (admin only)
 */
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const [disputes, totalCount] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          order: {
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true,
              paymentMethod: true,
              orderItems: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    // Get counts by status
    const [openCount, underReviewCount, resolvedCount] = await Promise.all([
      prisma.dispute.count({ where: { status: "OPEN" } }),
      prisma.dispute.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.dispute.count({ where: { status: "RESOLVED" } }),
    ]);

    return NextResponse.json({
      success: true,
      disputes,
      stats: {
        open: openCount,
        underReview: underReviewCount,
        resolved: resolvedCount,
        total: totalCount,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}
