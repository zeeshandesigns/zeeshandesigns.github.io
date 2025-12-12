import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/products/[productId]
 * Get single product details with store info and ratings
 */
export async function GET(request, { params }) { // 
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Fetch product with all related data
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
            description: true,
            status: true,
          },
        },
        rating: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // Calculate average rating
    const ratings = product.rating;
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
        : 0;

    // Parse digital codes to get available count (don't expose actual codes)
    const digitalCodes = product.digitalCodes
      ? JSON.parse(product.digitalCodes)
      : [];
    const actualAvailableCodes = digitalCodes.filter((c) => !c.used).length;

    const productResponse = {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: ratings.length,
      ratings: product.rating,
      actualAvailableCodes, // For verification
      digitalCodes: undefined, // Don't expose codes
    };

    return NextResponse.json(
      {
        success: true,
        product: productResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
