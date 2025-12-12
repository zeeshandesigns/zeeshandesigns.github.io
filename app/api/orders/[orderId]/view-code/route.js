import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/orders/[orderId]/view-code
 * Mark a delivered code as viewed (track viewedAt timestamp)
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required",
        },
        { status: 400 }
      );
    }

    // Get code ID from request body
    const body = await request.json();
    const { codeId } = body;

    if (!codeId) {
      return NextResponse.json(
        {
          error: "Code ID is required",
        },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        {
          error: "You don't have permission to access this order",
        },
        { status: 403 }
      );
    }

    // Verify code belongs to this order
    const deliveredCode = await prisma.deliveredCode.findUnique({
      where: { id: codeId },
      select: {
        orderId: true,
        viewedAt: true,
        code: true,
      },
    });

    if (!deliveredCode) {
      return NextResponse.json(
        {
          error: "Code not found",
        },
        { status: 404 }
      );
    }

    if (deliveredCode.orderId !== orderId) {
      return NextResponse.json(
        {
          error: "Code does not belong to this order",
        },
        { status: 403 }
      );
    }

    // Update viewedAt if not already viewed
    if (!deliveredCode.viewedAt) {
      await prisma.deliveredCode.update({
        where: { id: codeId },
        data: {
          viewedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Code view tracked",
        code: {
          id: codeId,
          viewedAt: deliveredCode.viewedAt || new Date(),
          wasAlreadyViewed: !!deliveredCode.viewedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking code view:", error);
    return NextResponse.json(
      {
        error: "Failed to track code view",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
