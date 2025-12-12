import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/middlewares/admin";

/**
 * GET /api/admin/customers/[id]
 * Get a single customer with full details
 */
export async function GET(request, { params }) {
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

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        buyerOrders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            paymentMethod: true,
          },
        },
        ratings: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Address: true,
        _count: {
          select: {
            buyerOrders: true,
            ratings: true,
            Address: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/customers/[id]
 * Update customer (e.g., toggle admin status)
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

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Prevent removing your own admin status
    if (id === userId && body.isAdmin === false) {
      return NextResponse.json(
        { error: "You cannot remove your own admin status" },
        { status: 400 }
      );
    }

    const customer = await prisma.user.update({
      where: { id },
      data: {
        isAdmin:
          body.isAdmin !== undefined ? body.isAdmin : existingCustomer.isAdmin,
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete a customer (with safety checks)
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

    // Prevent self-deletion
    if (id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if customer exists and has orders
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            buyerOrders: true,
            ratings: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if customer has orders
    if (customer._count.buyerOrders > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete customer with ${customer._count.buyerOrders} orders. Consider deactivating instead.`,
        },
        { status: 400 }
      );
    }

    // Delete ratings and addresses first
    await prisma.rating.deleteMany({
      where: { userId: id },
    });

    await prisma.address.deleteMany({
      where: { userId: id },
    });

    // Delete customer
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
