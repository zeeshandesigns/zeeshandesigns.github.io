import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";

/**
 * GET /api/admin/customers
 * Get all customers with filters
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
    const search = searchParams.get("search");
    const adminFilter = searchParams.get("adminFilter"); // all, admins, customers

    // Build where clause
    const where = {};

    if (adminFilter === "admins") {
      where.isAdmin = true;
    } else if (adminFilter === "customers") {
      where.isAdmin = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            buyerOrders: true,
            ratings: true,
            Address: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
