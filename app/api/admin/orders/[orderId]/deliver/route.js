import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/admin/orders/[orderId]/deliver
 * Automatically deliver codes for instant delivery orders (admin only)
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch order with items and products
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is paid
    if (!order.isPaid) {
      return NextResponse.json(
        { error: "Order must be paid before delivering codes" },
        { status: 400 }
      );
    }

    // Check if order is already delivered
    if (order.status === "CODE_DELIVERED") {
      return NextResponse.json(
        { error: "Codes already delivered for this order" },
        { status: 400 }
      );
    }

    // Collect all codes to deliver
    const deliveredCodes = [];
    const updatedProducts = [];

    for (const item of order.items) {
      const product = item.product;

      console.log("Processing product:", {
        name: product.name,
        deliveryType: product.deliveryType,
        digitalCodes: product.digitalCodes,
        availableCodes: product.availableCodes,
      });

      // Only process instant delivery products
      if (product.deliveryType === "instant") {
        // Parse digital codes (can be array of strings or array of objects)
        let availableCodes = [];
        try {
          const codes =
            typeof product.digitalCodes === "string"
              ? JSON.parse(product.digitalCodes)
              : product.digitalCodes;

          availableCodes = Array.isArray(codes) ? codes : [];
        } catch (e) {
          console.error("Error parsing codes:", e);
          availableCodes = [];
        }

        // Get required number of codes
        const codesNeeded = item.quantity;
        const codesToDeliver = availableCodes.slice(0, codesNeeded);

        if (codesToDeliver.length < codesNeeded) {
          return NextResponse.json(
            {
              error: `Insufficient codes for ${product.name}. Need ${codesNeeded}, have ${codesToDeliver.length}`,
            },
            { status: 400 }
          );
        }

        // Add codes to delivered list
        codesToDeliver.forEach((code) => {
          const codeString =
            typeof code === "string" ? code : code.code || code;
          deliveredCodes.push(codeString);
        });

        // Update product: remove delivered codes
        const remainingCodes = availableCodes.slice(codesNeeded);
        updatedProducts.push({
          id: product.id,
          digitalCodes: remainingCodes,
          availableCodes: remainingCodes.length,
          inStock: remainingCodes.length > 0,
        });
      }
    }

    if (deliveredCodes.length === 0) {
      return NextResponse.json(
        { error: "No instant delivery items found in this order" },
        { status: 400 }
      );
    }

    // Update products in a transaction
    await prisma.$transaction([
      // Update each product
      ...updatedProducts.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: {
            digitalCodes: p.digitalCodes,
            availableCodes: p.availableCodes,
            inStock: p.inStock,
          },
        })
      ),
      // Update order status
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CODE_DELIVERED",
          deliveredCodes: deliveredCodes,
          deliveredAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      deliveredCodes,
      message: `Successfully delivered ${deliveredCodes.length} code(s) to ${order.user.email}`,
    });
  } catch (error) {
    console.error("Error delivering codes:", error);
    return NextResponse.json(
      { error: "Failed to deliver codes: " + error.message },
      { status: 500 }
    );
  }
}
