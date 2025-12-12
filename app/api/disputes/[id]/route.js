import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/disputes/[id]
 * Get dispute details
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const dispute = await prisma.dispute.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return NextResponse.json(
      { error: "Failed to fetch dispute" },
      { status: 500 }
    );
  }
}
