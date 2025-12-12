import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/reviews/create
 * Submit a review for a purchased product
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, productId, rating, review } = await request.json();

    // Validation
    if (!orderId || !productId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, productId, rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "You can only review your own orders" },
        { status: 403 }
      );
    }

    // Verify order contains the product
    const orderItem = order.orderItems.find(
      (item) => item.productId === productId
    );
    if (!orderItem) {
      return NextResponse.json(
        { error: "Product not found in this order" },
        { status: 404 }
      );
    }

    // Verify order is delivered (can only review after receiving codes)
    const validStatuses = ["CODE_DELIVERED", "DELIVERED"];
    if (!validStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: "You can only review products after delivery" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.orderReview.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create review and update product rating
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const newReview = await tx.orderReview.create({
        data: {
          orderId,
          productId,
          userId,
          rating,
          review: review || null,
        },
      });

      // Update product average rating
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      const newTotalRatings = product.totalRatings + 1;
      const newAverageRating = (
        (product.averageRating * product.totalRatings + rating) /
        newTotalRatings
      ).toFixed(2);

      await tx.product.update({
        where: { id: productId },
        data: {
          totalRatings: newTotalRatings,
          averageRating: parseFloat(newAverageRating),
        },
      });

      return newReview;
    });

    return NextResponse.json(
      {
        success: true,
        review: result,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
