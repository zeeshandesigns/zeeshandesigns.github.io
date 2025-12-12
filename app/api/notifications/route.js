import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/notifications - Get user's notifications
export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to latest 50 notifications
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(req) {
  try {
    const { userId, type, title, message, actionUrl } = await req.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
      },
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
