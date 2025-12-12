import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";

// GET /api/admin/regions - Get all regions
export async function GET(req) {
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
    const regions = await prisma.region.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ regions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/regions - Create new region
export async function POST(req) {
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
    const { code, name, flag, currency, order, isActive } = await req.json();

    // Validate required fields
    if (!code || !name || !flag || !currency) {
      return NextResponse.json(
        { error: "Code, name, flag, and currency are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.region.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Region code already exists" },
        { status: 400 }
      );
    }

    const region = await prisma.region.create({
      data: {
        code,
        name,
        flag,
        currency,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ region }, { status: 201 });
  } catch (error) {
    console.error("Error creating region:", error);
    return NextResponse.json(
      { error: "Failed to create region" },
      { status: 500 }
    );
  }
}
