import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";

/**
 * POST /api/disputes/close
 * Close a dispute with resolution
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { disputeId, resolution, refundAmount } = await request.json();

    // Validation
    if (!disputeId) {
      return NextResponse.json(
        { error: "Dispute ID is required" },
        { status: 400 }
      );
    }

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: true,
        user: true,
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const userIsAdmin = await isAdmin(userId);
    const isCustomer = dispute.userId === userId;

    // Check authorization based on closure rules
    if (dispute.canAdminClose && !userIsAdmin) {
      // Only admin can close if canAdminClose is true (full refund)
      return NextResponse.json(
        {
          error:
            "Only admin can close this dispute (full refund has been issued)",
        },
        { status: 403 }
      );
    }

    if (!userIsAdmin && !isCustomer) {
      return NextResponse.json(
        { error: "You are not authorized to close this dispute" },
        { status: 403 }
      );
    }

    // If admin is closing and issuing a refund
    if (userIsAdmin && refundAmount > 0) {
      const result = await prisma.$transaction(async (tx) => {
        // Get wallet
        let wallet = await tx.wallet.findUnique({
          where: { userId: dispute.userId },
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: dispute.userId, balance: 0 },
          });
        }

        const balanceBefore = wallet.balance;
        const balanceAfter = balanceBefore + refundAmount;

        // Create refund transaction
        const walletTransaction = await tx.walletTransaction.create({
          data: {
            userId: dispute.userId,
            type: "REFUND",
            amount: refundAmount,
            balanceBefore,
            balanceAfter,
            status: "COMPLETED",
            description: `Refund for dispute #${dispute.id.substring(0, 8)}`,
            disputeId: dispute.id,
          },
        });

        // Update wallet balance
        await tx.wallet.update({
          where: { userId: dispute.userId },
          data: { balance: balanceAfter },
        });

        // Determine closure rules
        const isFullRefund = refundAmount >= dispute.order.total;
        const canAdminClose = isFullRefund;

        // Update dispute
        const updatedDispute = await tx.dispute.update({
          where: { id: disputeId },
          data: {
            status: canAdminClose ? "CLOSED" : "RESOLVED",
            resolution,
            resolvedBy: userId,
            resolvedAt: new Date(),
            refundAmount,
            refundIssued: true,
            refundedAt: new Date(),
            canAdminClose,
            closedBy: canAdminClose ? userId : null,
            closedAt: canAdminClose ? new Date() : null,
          },
        });

        // Add system message
        await tx.disputeMessage.create({
          data: {
            disputeId,
            senderType: "SYSTEM",
            message: `Admin issued a refund of PKR ${refundAmount}. ${
              canAdminClose
                ? "Dispute closed automatically."
                : "Please review and close the dispute if satisfied."
            }`,
          },
        });

        return { dispute: updatedDispute, transaction: walletTransaction };
      });

      return NextResponse.json({
        success: true,
        ...result,
        message: "Refund issued successfully",
      });
    }

    // Customer closing dispute (accepting resolution)
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "CLOSED",
        closedBy: userId,
        closedAt: new Date(),
      },
    });

    // Add system message
    await prisma.disputeMessage.create({
      data: {
        disputeId,
        senderType: "SYSTEM",
        message: "Dispute closed by customer.",
      },
    });

    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
      message: "Dispute closed successfully",
    });
  } catch (error) {
    console.error("Error closing dispute:", error);
    return NextResponse.json(
      { error: "Failed to close dispute" },
      { status: 500 }
    );
  }
}
