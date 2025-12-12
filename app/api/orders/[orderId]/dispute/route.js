import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/orders/[orderId]/dispute
 * Check if order has a dispute
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const dispute = await prisma.dispute.findFirst({
      where: {
        orderId,
        userId,
      },
      select: {
        id: true,
        status: true,
        reason: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error("Error checking dispute:", error);
    return NextResponse.json(
      { error: "Failed to check dispute" },
      { status: 500 }
    );
  }
}
