import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/coupons/validate
 * Validate a coupon code and calculate discount
 * Body: { code: string, orderTotal: number }
 */
export async function POST(request) {
  try {
    // Check authentication (optional - you may want anonymous users to check coupons)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, orderTotal } = body;

    // Validate input
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!orderTotal || orderTotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid order total is required" },
        { status: 400 }
      );
    }

    // Find coupon by code (case-insensitive)
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: code.trim().toUpperCase(),
          mode: "insensitive",
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coupon code",
          isValid: false,
        },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "This coupon is no longer active",
          isValid: false,
        },
        { status: 400 }
      );
    }

    // Check expiry date
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: "This coupon has expired",
          isValid: false,
          expiredAt: coupon.expiresAt,
        },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        {
          success: false,
          error: "This coupon has reached its usage limit",
          isValid: false,
        },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of ₨${coupon.minOrderAmount} required to use this coupon`,
          isValid: false,
          minOrderAmount: coupon.minOrderAmount,
        },
        { status: 400 }
      );
    }

    // Check if user has already used this coupon (if oneTimePerUser is true)
    if (coupon.oneTimePerUser) {
      const hasUsedCoupon = await prisma.order.findFirst({
        where: {
          userId,
          couponId: coupon.id,
        },
      });

      if (hasUsedCoupon) {
        return NextResponse.json(
          {
            success: false,
            error: "You have already used this coupon",
            isValid: false,
          },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue) / 100;

      // Apply maximum discount cap if set
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;

      // Discount can't exceed order total
      if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
      }
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, orderTotal - discountAmount);

    return NextResponse.json(
      {
        success: true,
        isValid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discount: {
          amount: discountAmount,
          type: coupon.discountType,
          value: coupon.discountValue,
        },
        orderSummary: {
          originalAmount: orderTotal,
          discountAmount,
          finalAmount,
          savings: discountAmount,
          savingsPercentage: Math.round((discountAmount / orderTotal) * 100),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate coupon",
        message: error.message,
        isValid: false,
      },
      { status: 500 }
    );
  }
}
