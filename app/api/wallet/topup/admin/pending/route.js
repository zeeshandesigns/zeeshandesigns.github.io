import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { createNotification, notificationTemplates } from "@/lib/notifications";

/**
 * GET /api/wallet/topup/admin/pending
 * Get all pending top-up requests (Admin only)
 */
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PAYMENT_SUBMITTED";

    const topUps = await prisma.walletTopUp.findMany({
      where: {
        status: status === "all" ? undefined : status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ topUps });
  } catch (error) {
    console.error("Error fetching pending top-ups:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-ups" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/topup/admin/pending
 * Verify or reject a top-up request (Admin only)
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { topUpId, action, rejectionReason } = await request.json();

    // Validation
    if (!topUpId || !action) {
      return NextResponse.json(
        { error: "Top-up ID and action are required" },
        { status: 400 }
      );
    }

    if (!["verify", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'verify' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Get top-up request
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id: topUpId },
      include: { user: true },
    });

    if (!topUp) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    if (topUp.status !== "PAYMENT_SUBMITTED") {
      return NextResponse.json(
        { error: `Cannot process top-up with status: ${topUp.status}` },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Reject the top-up
      const rejectedTopUp = await prisma.walletTopUp.update({
        where: { id: topUpId },
        data: {
          status: "REJECTED",
          rejectionReason,
          verifiedBy: userId,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        topUp: rejectedTopUp,
        message: "Top-up request rejected",
      });
    }

    // Verify and add balance
    const result = await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: topUp.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: topUp.userId,
            balance: 0,
          },
        });
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + topUp.amount;

      // Create wallet transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          userId: topUp.userId,
          type: "TOP_UP",
          amount: topUp.amount,
          balanceBefore,
          balanceAfter,
          status: "COMPLETED",
          description: `Wallet top-up: PKR ${topUp.amount}`,
          topUpId: topUp.id,
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: topUp.userId },
        data: { balance: balanceAfter },
      });

      // Update top-up status
      const verifiedTopUp = await tx.walletTopUp.update({
        where: { id: topUpId },
        data: {
          status: "VERIFIED",
          verifiedBy: userId,
          verifiedAt: new Date(),
          transactionId: transaction.id,
        },
      });

      return { transaction, wallet: updatedWallet, topUp: verifiedTopUp };
    });

    // Send notification to user
    try {
      const template = notificationTemplates.walletTopupApproved(topUp.amount);
      await createNotification(
        topUp.userId,
        template.type,
        template.title,
        template.message,
        template.actionUrl
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      ...result,
      message: `Successfully added PKR ${topUp.amount} to user's wallet`,
    });
  } catch (error) {
    console.error("Error processing top-up:", error);
    return NextResponse.json(
      { error: "Failed to process top-up" },
      { status: 500 }
    );
  }
}
