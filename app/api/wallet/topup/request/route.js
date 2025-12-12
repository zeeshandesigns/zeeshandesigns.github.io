import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/wallet/topup/request
 * Request a new wallet top-up (initiates the process)
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum top-up amount is PKR 100" },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: "Maximum top-up amount is PKR 100,000" },
        { status: 400 }
      );
    }

    // Create top-up request
    const topUp = await prisma.walletTopUp.create({
      data: {
        userId,
        amount,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        topUp,
        message: "Top-up request created. Please upload payment proof.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating top-up request:", error);
    return NextResponse.json(
      { error: "Failed to create top-up request" },
      { status: 500 }
    );
  }
}
