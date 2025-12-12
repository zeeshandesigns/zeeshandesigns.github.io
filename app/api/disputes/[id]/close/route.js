import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/disputes/[id]/close
 * Close a dispute (admin for full refunds, user for half refunds or no refund)
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            isAdmin: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Check authorization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    const isAdmin = user?.isAdmin || false;
    const isOwner = dispute.userId === userId;

    // Closure rules:
    // - Full refund: Only admin can close
    // - Half refund or no refund: Only user can close
    if (dispute.canAdminClose && !isAdmin) {
      return NextResponse.json(
        {
          error: "This dispute has a full refund. Only admin can close it.",
        },
        { status: 403 }
      );
    }

    if (!dispute.canAdminClose && !isOwner) {
      return NextResponse.json(
        {
          error:
            "This dispute has a partial or no refund. Only the customer can close it.",
        },
        { status: 403 }
      );
    }

    // Close the dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: "CLOSED",
        closedBy: userId,
        closedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dispute closed successfully",
      dispute: updatedDispute,
    });
  } catch (error) {
    console.error("Error closing dispute:", error);
    return NextResponse.json(
      { error: "Failed to close dispute: " + error.message },
      { status: 500 }
    );
  }
}
