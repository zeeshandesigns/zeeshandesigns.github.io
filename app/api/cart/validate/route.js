import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/cart/validate
 * Validate cart items before checkout
 * Checks: stock availability, product exists, delivery type
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          error: "Cart is empty or invalid",
        },
        { status: 400 }
      );
    }

    const errors = [];
    const validatedItems = [];
    let totalPrice = 0;

    // Fetch all products in one query
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      // No store relation needed - single admin system
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate each item
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        errors.push({
          productId,
          error: "Invalid product ID or quantity",
        });
        continue;
      }

      const product = productMap.get(productId);

      if (!product) {
        errors.push({
          productId,
          error: "Product not found",
        });
        continue;
      }

      // No store validation needed - single admin system

      // Check if product is in stock
      if (!product.inStock) {
        errors.push({
          productId,
          productName: product.name,
          error: "Product is out of stock",
        });
        continue;
      }

      // Check available codes
      if (product.availableCodes < quantity) {
        errors.push({
          productId,
          productName: product.name,
          error: `Only ${product.availableCodes} codes available, you requested ${quantity}`,
          availableCodes: product.availableCodes,
        });
        continue;
      }

      // Item is valid
      const itemTotal = product.price * quantity;
      totalPrice += itemTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        itemTotal,
        deliveryType: product.deliveryType,
        requiresApproval: product.requiresApproval,
        image: product.images[0],
        // No storeId/storeName needed - single admin system
      });
    }

    const isValid = errors.length === 0;

    return NextResponse.json(
      {
        valid: isValid,
        errors: errors.length > 0 ? errors : undefined,
        items: validatedItems,
        summary: {
          totalItems: validatedItems.length,
          totalPrice,
          hasAutoDelivery: validatedItems.some(
            (item) => item.deliveryType === "auto_delivery"
          ),
          hasManualVerification: validatedItems.some(
            (item) => item.deliveryType === "manual_verification"
          ),
        },
      },
      { status: isValid ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Failed to validate cart",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
