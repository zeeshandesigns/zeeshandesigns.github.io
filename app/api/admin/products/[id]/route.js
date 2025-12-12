import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/products/[id]
 * Get a single product
 */
export async function GET(request, { params }) {
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

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryRelation: true,
        regionRelation: true,
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
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[id]
 * Update a product
 */
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Parse digital codes if provided
    let updateData = { ...body };

    if (body.digitalCodes !== undefined) {
      let codesArray = [];

      if (typeof body.digitalCodes === "string") {
        codesArray = body.digitalCodes
          .split("\n")
          .map((code) => code.trim())
          .filter((code) => code.length > 0);
      } else if (Array.isArray(body.digitalCodes)) {
        codesArray = body.digitalCodes;
      }

      updateData.digitalCodes = codesArray;
      updateData.availableCodes = codesArray.length;
    }

    // Convert price to float if provided
    if (body.price) {
      updateData.price = parseFloat(body.price);
    }

    if (body.mrp) {
      updateData.mrp = parseFloat(body.mrp);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete a product
 */
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            ratings: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has orders
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete product with existing orders (${product._count.orderItems}). Consider marking it as out of stock instead.`,
        },
        { status: 400 }
      );
    }

    // Delete ratings first
    if (product._count.ratings > 0) {
      await prisma.rating.deleteMany({
        where: { productId: id },
      });
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
