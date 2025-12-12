import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/products
 * Fetch all gift cards with optional filters
 * Query params: category, region, deliveryType, search, minPrice, maxPrice, inStock
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const deliveryType = searchParams.get("deliveryType");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    // Build where clause
    const where = {};

    if (category) {
      where.category = category;
    }

    if (region) {
      where.regionId = region;
    }

    if (deliveryType) {
      where.deliveryType = deliveryType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock === "true") {
      where.inStock = true;
      where.availableCodes = { gt: 0 };
    }

    // Fetch products (no store - single admin system)
    const products = await prisma.product.findMany({
      where,
      include: {
        rating: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const ratings = product.rating || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
          : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        ratingCount: ratings.length,
        rating: ratings, // Keep rating array for frontend compatibility
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: productsWithRating.length,
        products: productsWithRating,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
