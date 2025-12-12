import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/reviews/product/[productId]
 * Get all reviews for a product
 */
export async function GET(request, { params }) {
  try {
    const { productId } = await params;

    const reviews = await prisma.orderReview.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
