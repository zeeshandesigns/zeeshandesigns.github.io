import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createNotification, notificationTemplates } from "@/lib/notifications";

/**
 * POST /api/disputes/[id]/refund
 * Issue refund for dispute (admin only)
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { refundType, resolution } = body; // refundType: "HALF" | "FULL"

    if (!refundType || !["HALF", "FULL"].includes(refundType)) {
      return NextResponse.json(
        { error: "Invalid refund type. Use HALF or FULL" },
        { status: 400 }
      );
    }

    // Get dispute with order details
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.refundIssued) {
      return NextResponse.json(
        { error: "Refund already issued for this dispute" },
        { status: 400 }
      );
    }

    // Calculate refund amount
    const refundAmount =
      refundType === "FULL" ? dispute.order.total : dispute.order.total / 2;

    // Get user's wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: dispute.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: dispute.userId,
          balance: 0,
        },
      });
    }

    // Process refund in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create wallet transaction for refund
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          userId: dispute.userId,
          type: "REFUND",
          amount: refundAmount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + refundAmount,
          status: "COMPLETED",
          description: `Refund for Order #${dispute.orderId.substring(
            0,
            8
          )} - ${refundType} refund`,
          disputeId: dispute.id,
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { userId: dispute.userId },
        data: {
          balance: wallet.balance + refundAmount,
        },
      });

      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id },
        data: {
          refundAmount,
          refundIssued: true,
          refundedAt: new Date(),
          status: "RESOLVED",
          resolution:
            resolution ||
            `${refundType} refund of ₨${refundAmount.toFixed(2)} issued`,
          resolvedBy: userId,
          resolvedAt: new Date(),
          // Only allow admin to close if FULL refund
          canAdminClose: refundType === "FULL",
        },
      });

      return { updatedDispute, walletTransaction };
    });

    // Send notification to user
    try {
      const template = notificationTemplates.refundIssued(
        refundAmount,
        dispute.orderId.substring(0, 8).toUpperCase()
      );
      await createNotification(
        dispute.userId,
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
      message: `${refundType} refund of ₨${refundAmount.toFixed(
        2
      )} issued successfully`,
      dispute: result.updatedDispute,
      refundAmount,
    });
  } catch (error) {
    console.error("Error issuing refund:", error);
    return NextResponse.json(
      { error: "Failed to issue refund: " + error.message },
      { status: 500 }
    );
  }
}
