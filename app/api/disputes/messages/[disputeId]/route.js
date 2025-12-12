import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/disputes/messages/[disputeId]
 * Get all messages for a dispute
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { disputeId } = await params;

    // Verify dispute exists and user has access
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (dispute.userId !== userId && !user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to view these messages" },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await prisma.disputeMessage.findMany({
      where: { disputeId },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read (if user is customer, mark admin messages as read)
    if (!user.isAdmin) {
      await prisma.disputeMessage.updateMany({
        where: {
          disputeId,
          senderType: "ADMIN",
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching dispute messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
