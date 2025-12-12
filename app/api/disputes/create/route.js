import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import imagekit from "@/configs/imagekit";
import {
  createNotification,
  notifyAdmins,
  notificationTemplates,
} from "@/lib/notifications";

/**
 * POST /api/disputes/create
 * Create a dispute for an order
 * Can only create dispute within 24 hours of order creation
 * Can only create one dispute per order
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const orderId = formData.get("orderId");
    const reason = formData.get("reason");
    const description = formData.get("description");
    const imageFiles = formData.getAll("images");

    // Validate required fields
    if (!orderId || !reason || !description) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, reason, description" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        disputes: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "You can only dispute your own orders" },
        { status: 403 }
      );
    }

    // Check if dispute already exists for this order
    if (order.disputes && order.disputes.length > 0) {
      return NextResponse.json(
        { error: "A dispute already exists for this order" },
        { status: 400 }
      );
    }

    // Check if order is within 24 hours
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (orderAge > twentyFourHours) {
      return NextResponse.json(
        {
          error:
            "Disputes can only be opened within 24 hours of order creation",
          orderAge: Math.floor(orderAge / (60 * 60 * 1000)), // hours
        },
        { status: 400 }
      );
    }

    // Upload images to ImageKit if provided
    const imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file.size > 0) {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString("base64");

            const result = await imagekit.upload({
              file: base64,
              fileName: file.name,
              folder: "pak-cards/disputes",
              useUniqueFileName: true,
            });

            imageUrls.push(result.url);
          } catch (error) {
            console.error("Error uploading image:", error);
            // Continue even if image upload fails
          }
        }
      }
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        userId,
        reason,
        description,
        images: imageUrls,
        status: "OPEN",
      },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Send notifications
    try {
      // Notify user
      const userTemplate = notificationTemplates.disputeUpdate(
        dispute.orderId.substring(0, 8).toUpperCase(),
        "Your dispute has been created and is under review"
      );
      await createNotification(
        userId,
        userTemplate.type,
        userTemplate.title,
        userTemplate.message,
        userTemplate.actionUrl
      );

      // Notify admins
      const adminTemplate = notificationTemplates.adminNewDispute(
        dispute.orderId.substring(0, 8).toUpperCase()
      );
      await notifyAdmins(
        adminTemplate.type,
        adminTemplate.title,
        adminTemplate.message,
        adminTemplate.actionUrl
      );
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Dispute created successfully",
        dispute: {
          id: dispute.id,
          orderId: dispute.orderId,
          reason: dispute.reason,
          status: dispute.status,
          createdAt: dispute.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    );
  }
}
