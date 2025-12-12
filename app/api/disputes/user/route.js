import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/disputes/user
 * Get all disputes for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const disputes = await prisma.dispute.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
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
    });

    return NextResponse.json({
      success: true,
      disputes,
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}
