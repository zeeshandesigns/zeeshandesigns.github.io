import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/wallet
 * Get user's wallet balance and recent transactions
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Auto-create wallet for new users
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: "PKR",
        },
      });
    }

    // Get recent transactions (last 20)
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      wallet,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
