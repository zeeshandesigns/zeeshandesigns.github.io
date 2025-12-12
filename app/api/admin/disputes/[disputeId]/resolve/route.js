import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/middlewares/admin";
import prisma from "@/lib/prisma";

/**
 * PUT /api/admin/disputes/[disputeId]/resolve
 * Resolve a dispute (admin only)
 * Body: { status, adminResponse, resolution, refundAmount?, refundIssued? }
 */
export async function PUT(request, { params }) {
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

    const { disputeId } = await params;
    const body = await request.json();
    const { status, adminResponse, resolution, refundAmount, refundIssued } =
      body;

    // Validate required fields
    if (!status || !adminResponse) {
      return NextResponse.json(
        { error: "Missing required fields: status, adminResponse" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "UNDER_REVIEW",
      "AWAITING_RESPONSE",
      "RESOLVED",
      "CLOSED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status", validStatuses },
        { status: 400 }
      );
    }

    // Update dispute
    const updateData = {
      status,
      adminResponse,
      resolution,
      updatedAt: new Date(),
    };

    if (status === "RESOLVED" || status === "CLOSED") {
      updateData.resolvedBy = userId;
      updateData.resolvedAt = new Date();
    }

    if (refundAmount !== undefined) {
      updateData.refundAmount = parseFloat(refundAmount);
    }

    if (refundIssued !== undefined) {
      updateData.refundIssued = refundIssued;
      if (refundIssued) {
        updateData.refundedAt = new Date();
      }
    }

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dispute updated successfully",
      dispute,
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
