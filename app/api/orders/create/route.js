import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { clerkClient } from "@clerk/nextjs/server";
import {
  createNotification,
  notifyAdmins,
  notificationTemplates,
} from "@/lib/notifications";

/**
 * POST /api/orders/create
 * Create order with payment proof upload
 */
export async function POST(request) {
  try {
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }

    // Ensure user exists in database (sync from Clerk if not)
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // User not in database yet, fetch from Clerk and create
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        user = await prisma.user.create({
          data: {
            id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name:
              `${clerkUser.firstName || ""} ${
                clerkUser.lastName || ""
              }`.trim() || "User",
            image: clerkUser.imageUrl,
          },
        });
      } catch (syncError) {
        console.error("Error syncing user from Clerk:", syncError);
        return NextResponse.json(
          { error: "Failed to sync user data. Please try again." },
          { status: 500 }
        );
      }
    }

    // Get form data
    const formData = await request.formData();
    const itemsJson = formData.get("items");
    const addressJson = formData.get("address");

    // Validate required fields
    if (!itemsJson || !addressJson) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["items", "address"],
        },
        { status: 400 }
      );
    }

    // Parse items and address
    let items, address;
    try {
      items = JSON.parse(itemsJson);
      address = JSON.parse(addressJson);
    } catch (e) {
      return NextResponse.json(
        {
          error: "Invalid JSON format for items or address",
        },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          error: "Cart is empty",
        },
        { status: 400 }
      );
    }

    // Fetch all products to validate
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Create product map
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all items and calculate totals
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            error: `Product not found: ${item.productId}`,
          },
          { status: 400 }
        );
      }

      // Check stock availability
      if (!product.inStock) {
        return NextResponse.json(
          {
            error: `Product out of stock: ${product.name}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Check wallet balance
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
      });
    }

    if (wallet.balance < totalPrice) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance",
          required: totalPrice,
          available: wallet.balance,
          shortfall: totalPrice - wallet.balance,
        },
        { status: 400 }
      );
    }

    // Determine initial order status based on product availability
    let orderStatus;
    const hasInstantDelivery = orderItems.some((item) => {
      const product = productMap.get(item.productId);
      return (
        product.deliveryType === "instant" &&
        product.availableCodes >= item.quantity
      );
    });

    const hasManualDelivery = orderItems.some((item) => {
      const product = productMap.get(item.productId);
      return product.deliveryType === "manual";
    });

    if (hasInstantDelivery && !hasManualDelivery) {
      // All products are instant delivery with codes available
      orderStatus = "PROCESSING";
    } else if (hasManualDelivery) {
      // Has manual delivery items - need admin to upload codes
      orderStatus = "ORDER_PLACED";
    } else {
      // Instant items but no codes available
      orderStatus = "ORDER_PLACED";
    }

    // Create order with wallet deduction in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create address
      const createdAddress = await tx.address.create({
        data: {
          userId,
          name: address.name || "Default",
          email: address.email || "",
          phone: address.phone || "",
          street: address.street || address.address || "",
          city: address.city || "",
          state: address.state || "",
          zip: address.zip || "",
          country: address.country || "Pakistan",
        },
      });

      // 2. Deduct from wallet and create transaction
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - totalPrice;

      const walletTransaction = await tx.walletTransaction.create({
        data: {
          userId,
          type: "PURCHASE",
          amount: totalPrice,
          balanceBefore,
          balanceAfter,
          status: "COMPLETED",
          description: `Order payment: PKR ${totalPrice}`,
        },
      });

      // 3. Update wallet balance
      await tx.wallet.update({
        where: { userId },
        data: { balance: balanceAfter },
      });

      // 4. Create order
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId: createdAddress.id,
          total: totalPrice,
          status: orderStatus,
          isPaid: true, // Always true for wallet payments
          paymentMethod: "WALLET",
          walletTransactionId: walletTransaction.id,
        },
      });

      // 5. Create order items
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      // 6. For instant delivery products, allocate codes immediately
      for (const item of orderItems) {
        const product = productMap.get(item.productId);

        // Check if product has instant delivery and available codes
        if (
          product.deliveryType === "instant" &&
          product.availableCodes >= item.quantity
        ) {
          // Parse digitalCodes - handle both array of strings and array of objects
          let codes = [];
          try {
            const parsed =
              typeof product.digitalCodes === "string"
                ? JSON.parse(product.digitalCodes)
                : product.digitalCodes;
            codes = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error("Error parsing digitalCodes:", e);
            codes = [];
          }

          // Handle both formats: simple strings or {code, used} objects
          const availableCodes = codes.filter((c) => {
            if (typeof c === "string") return true;
            if (typeof c === "object" && c.code) return !c.used;
            return false;
          });

          const codesToDeliver = availableCodes.slice(0, item.quantity);
          const remainingCodes = availableCodes.slice(item.quantity);

          // Create delivered code records
          for (const codeData of codesToDeliver) {
            const codeString =
              typeof codeData === "string" ? codeData : codeData.code;

            await tx.deliveredCode.create({
              data: {
                orderId: createdOrder.id,
                productId: product.id,
                userId,
                code: codeString,
              },
            });
          }

          // Update product with remaining codes
          await tx.product.update({
            where: { id: product.id },
            data: {
              digitalCodes: JSON.stringify(remainingCodes),
              availableCodes: remainingCodes.length,
              inStock: remainingCodes.length > 0,
            },
          });
        }
      }

      return {
        order: createdOrder,
        walletTransaction,
        address: createdAddress,
      };
    });

    // Fetch complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: result.order.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                deliveryType: true,
                requiresApproval: true,
              },
            },
          },
        },
        deliveredCodes: true,
      },
    });

    // Check if codes were delivered immediately
    const hasDeliveredCodes = completeOrder.deliveredCodes.length > 0;

    // Update order status if codes were delivered
    if (hasDeliveredCodes) {
      await prisma.order.update({
        where: { id: completeOrder.id },
        data: { status: "CODE_DELIVERED" },
      });
    }

    // Send notifications
    try {
      // Notify user about order placement
      const template = notificationTemplates.orderPlaced(
        completeOrder.id.substring(0, 8).toUpperCase()
      );
      await createNotification(
        userId,
        template.type,
        template.title,
        template.message,
        template.actionUrl
      );

      // Notify admins about new order
      const adminTemplate = notificationTemplates.adminNewOrder(
        completeOrder.id.substring(0, 8).toUpperCase(),
        completeOrder.total
      );
      await notifyAdmins(
        adminTemplate.type,
        adminTemplate.title,
        adminTemplate.message,
        adminTemplate.actionUrl
      );
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // Don't fail the order if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: {
          id: completeOrder.id,
          orderNumber: completeOrder.id.substring(0, 8).toUpperCase(),
          status: hasDeliveredCodes ? "CODE_DELIVERED" : orderStatus,
          totalPrice: completeOrder.total,
          paymentMethod: "WALLET",
          itemCount: completeOrder.orderItems.length,
          codesDelivered: hasDeliveredCodes,
          codes: hasDeliveredCodes
            ? completeOrder.deliveredCodes.map((dc) => dc.code)
            : [],
          deliveryInfo: hasDeliveredCodes
            ? "Digital codes have been delivered instantly"
            : "Your order is being processed. Codes will be delivered once available.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to format delivery information
 */
function getDeliveryInfo(orderItems) {
  const instantDelivery = orderItems.filter(
    (item) => item.product.deliveryType === "auto_delivery"
  );
  const onDemand = orderItems.filter(
    (item) => item.product.deliveryType !== "auto_delivery"
  );

  if (onDemand.length === 0) {
    return "All codes delivered instantly";
  } else if (instantDelivery.length === 0) {
    return "Codes will be delivered once purchased by admin";
  } else {
    return "Some codes delivered instantly, others will be delivered soon";
  }
}
