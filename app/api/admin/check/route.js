import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/check
 * Check if current user is an admin
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isAdmin: user.isAdmin,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
