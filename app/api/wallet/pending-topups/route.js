import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/wallet/pending-topups
 * Get user's pending wallet top-up requests
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending wallet top-ups
    const pendingTopups = await prisma.walletTopUp.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      pendingTopups,
    });
  } catch (error) {
    console.error("Error fetching pending top-ups:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending top-ups" },
      { status: 500 }
    );
  }
}
