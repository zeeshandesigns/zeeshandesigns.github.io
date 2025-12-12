import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

/**
 * PUT /api/admin/categories/[id]
 * Update a category
 */
export async function PUT(request, { params }) {
  try {
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
    const {
      slug,
      name,
      emoji,
      logo,
      description,
      gradient,
      image,
      order,
      isActive,
    } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        slug: slug || existingCategory.slug,
        name: name || existingCategory.name,
        emoji: emoji || existingCategory.emoji,
        logo: logo !== undefined ? logo : existingCategory.logo,
        description: description || existingCategory.description,
        gradient: gradient || existingCategory.gradient,
        image: image !== undefined ? image : existingCategory.image,
        order: order !== undefined ? order : existingCategory.order,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
 */
export async function DELETE(request, { params }) {
  try {
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

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${category._count.products} products. Please reassign or delete products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
