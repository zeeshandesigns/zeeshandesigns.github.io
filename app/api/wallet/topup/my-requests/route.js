import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/wallet/topup/my-requests
 * Get user's top-up requests
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topUps = await prisma.walletTopUp.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ topUps });
  } catch (error) {
    console.error("Error fetching top-up requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-up requests" },
      { status: 500 }
    );
  }
}
