import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/products/[productId]/rate
 * Submit a rating and review for a product
 * Body: { rating: number (1-5), review?: string }
 * Only users who purchased this product can rate it
 */
export async function POST(request, { params }) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { productId } = await params;
    const body = await request.json();
    const { rating, review } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: "completed", // Only completed orders count
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only rate products you have purchased",
        },
        { status: 403 }
      );
    }

    // Check if user already rated this product
    const existingRating = await prisma.rating.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingRating) {
      // Update existing rating
      const updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          review: review || null,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Rating updated successfully",
          rating: updatedRating,
        },
        { status: 200 }
      );
    } else {
      // Create new rating
      const newRating = await prisma.rating.create({
        data: {
          rating,
          review: review || null,
          userId,
          productId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Rating submitted successfully",
          rating: newRating,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit rating",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
