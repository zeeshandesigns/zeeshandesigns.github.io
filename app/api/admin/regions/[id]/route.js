import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

// PUT /api/admin/regions/[id] - Update region
export async function PUT(req, { params }) {
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

  try {
    const { id } = await params;
    const { code, name, flag, currency, order, isActive } = await req.json();

    // Check if region exists
    const existing = await prisma.region.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    // If code is being updated, check for conflicts
    if (code && code !== existing.code) {
      const codeExists = await prisma.region.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Region code already exists" },
          { status: 400 }
        );
      }
    }

    const region = await prisma.region.update({
      where: { id },
      data: {
        code: code || existing.code,
        name: name || existing.name,
        flag: flag || existing.flag,
        currency: currency || existing.currency,
        order: order !== undefined ? order : existing.order,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return NextResponse.json({ region }, { status: 200 });
  } catch (error) {
    console.error("Error updating region:", error);
    return NextResponse.json(
      { error: "Failed to update region" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/regions/[id] - Delete region
export async function DELETE(req, { params }) {
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

  try {
    const { id } = await params;

    // Check if region has products
    const productCount = await prisma.product.count({
      where: { regionId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete region with ${productCount} products. Please reassign products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.region.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Region deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting region:", error);
    return NextResponse.json(
      { error: "Failed to delete region" },
      { status: 500 }
    );
  }
}
