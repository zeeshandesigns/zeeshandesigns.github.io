import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/products/[productId]/ratings
 * Fetch all ratings for a product with pagination
 * Query params: page (default 1), limit (default 10), sortBy (newest|highest|lowest)
 */
export async function GET(request, { params }) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pagination parameters. Limit must be 1-50",
        },
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

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch ratings with pagination
    const [ratings, totalCount] = await Promise.all([
      prisma.rating.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rating.count({ where: { productId } }),
    ]);

    // Calculate rating statistics
    const ratingStats = await prisma.rating.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingStats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    // Calculate average rating
    const avgRatingResult = await prisma.rating.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    const avgRating = avgRatingResult._avg.rating || 0;

    return NextResponse.json(
      {
        success: true,
        product: {
          id: product.id,
          name: product.name,
        },
        statistics: {
          totalRatings: totalCount,
          averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          distribution: ratingDistribution,
        },
        ratings: ratings.map((rating) => ({
          id: rating.id,
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.createdAt,
          updatedAt: rating.updatedAt,
          user: {
            id: rating.user.id,
            name: rating.user.name,
            image: rating.user.image,
          },
          isVerifiedPurchase: true, // All ratings are from verified purchases
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch ratings",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
