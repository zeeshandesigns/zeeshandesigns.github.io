import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/products/featured
 * Get featured/best-selling gift cards (top rated products)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    // Fetch products with their ratings
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        availableCodes: { gt: 0 },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
          },
        },
        rating: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating and sort
    const productsWithRating = products.map((product) => {
      const ratings = product.rating;
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
          : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: ratings.length,
        rating: undefined,
      };
    });

    // Sort by rating count (popularity), then by average rating
    const featured = productsWithRating
      .sort((a, b) => {
        if (b.ratingCount === a.ratingCount) {
          return b.avgRating - a.avgRating;
        }
        return b.ratingCount - a.ratingCount;
      })
      .slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        count: featured.length,
        products: featured,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured products",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
