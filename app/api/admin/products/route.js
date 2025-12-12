import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/products
 * Get all products with filters
 */
export async function GET(request) {
  try {
    // Check admin authorization (server-side via Clerk)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(userId);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const deliveryType = searchParams.get("deliveryType");
    const inStock = searchParams.get("inStock");

    // Build where clause
    const where = {};

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (region && region !== "all") {
      where.regionId = region;
    }

    if (deliveryType && deliveryType !== "all") {
      where.deliveryType = deliveryType;
    }

    if (inStock === "true") {
      where.inStock = true;
    } else if (inStock === "false") {
      where.inStock = false;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        categoryRelation: true,
        regionRelation: true,
        _count: {
          select: { rating: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 */
export async function POST(request) {
  try {
    // Check admin authorization (server-side via Clerk)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(userId);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      mrp,
      price,
      images,
      logo,
      category,
      categoryId,
      regionId,
      deliveryType,
      digitalCodes,
      requiresApproval,
      stockType,
      inStock,
    } = body;

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, price" },
        { status: 400 }
      );
    }

    // Parse digital codes if provided
    let codesArray = [];
    let availableCodes = 0;

    if (digitalCodes) {
      if (typeof digitalCodes === "string") {
        // Split by newlines and filter empty lines
        codesArray = digitalCodes
          .split("\n")
          .map((code) => code.trim())
          .filter((code) => code.length > 0);
      } else if (Array.isArray(digitalCodes)) {
        codesArray = digitalCodes;
      }
      availableCodes = codesArray.length;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp: mrp || price,
        price: parseFloat(price),
        images: images || [],
        logo: logo || null,
        category: category || "gaming",
        categoryId: categoryId || null,
        regionId: regionId || null,
        deliveryType: deliveryType || "instant",
        digitalCodes: codesArray,
        requiresApproval: requiresApproval || false,
        stockType: stockType || "unlimited",
        availableCodes,
        inStock: inStock !== undefined ? inStock : true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
