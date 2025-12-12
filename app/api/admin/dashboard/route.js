import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/dashboard
 * Fetch admin dashboard statistics and metrics
 * Admin only - platform-wide overview
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

    // Fetch all statistics in parallel
    const [
      totalOrders,
      pendingVerificationOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      // Order statistics
      prisma.order.count(),
      prisma.order.count({ where: { status: "PAYMENT_SUBMITTED" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),

      // Revenue (sum of completed orders)
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true },
      }),

      // User and product counts
      prisma.user.count(),
      prisma.product.count(),

      // Recent activity (last 10 orders)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Calculate today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: "DELIVERED",
        },
        _sum: { total: true },
      }),
    ]);

    // Calculate this month's statistics
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [monthOrders, monthRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: firstDayOfMonth },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: firstDayOfMonth },
          status: "DELIVERED",
        },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        dashboard: {
          // Order metrics
          orders: {
            total: totalOrders,
            pendingVerification: pendingVerificationOrders,
            processing: processingOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            completionRate:
              totalOrders > 0
                ? Math.round((completedOrders / totalOrders) * 100)
                : 0,
          },

          // Revenue metrics
          revenue: {
            total: totalRevenue._sum.total || 0,
            today: todayRevenue._sum.total || 0,
            thisMonth: monthRevenue._sum.total || 0,
          },

          // Platform metrics
          platform: {
            totalUsers,
            totalProducts,
          },

          // Today's activity
          today: {
            orders: todayOrders,
            revenue: todayRevenue._sum.total || 0,
          },

          // This month's activity
          thisMonth: {
            orders: monthOrders,
            revenue: monthRevenue._sum.total || 0,
          },

          // Recent activity
          recentActivity: {
            orders: recentOrders.map((order) => ({
              id: order.id,
              totalAmount: order.total,
              status: order.status,
              paymentMethod: order.paymentMethod,
              createdAt: order.createdAt,
              user: order.user,
            })),
          },

          // Alerts (things needing attention)
          alerts: {
            pendingPaymentVerifications: pendingVerificationOrders,
            needsAttention: pendingVerificationOrders > 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
