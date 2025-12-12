import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/disputes/messages/send
 * Send a message in a dispute chat
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const disputeId = formData.get("disputeId");
    const message = formData.get("message");
    const attachmentFiles = formData.getAll("attachments");

    // Validation
    if (!disputeId || !message) {
      return NextResponse.json(
        { error: "Dispute ID and message are required" },
        { status: 400 }
      );
    }

    // Verify dispute exists
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: true },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Check if dispute is closed
    if (dispute.status === "CLOSED") {
      return NextResponse.json(
        { error: "Cannot send messages to a closed dispute" },
        { status: 400 }
      );
    }

    // Verify user is authorized (either the customer or an admin)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const isCustomer = dispute.userId === userId;
    const isAdmin = user.isAdmin;

    if (!isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to send messages in this dispute" },
        { status: 403 }
      );
    }

    // Upload attachments if any
    const attachmentUrls = [];
    for (const file of attachmentFiles) {
      if (file && file.size > 0) {
        try {
          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadFormData = new FormData();
          uploadFormData.append("file", new Blob([buffer]), file.name);
          uploadFormData.append(
            "fileName",
            `dispute_${disputeId}_${Date.now()}_${file.name}`
          );
          uploadFormData.append("folder", "/disputes/attachments");

          const uploadResponse = await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${Buffer.from(
                  process.env.IMAGEKIT_PRIVATE_KEY + ":"
                ).toString("base64")}`,
              },
              body: uploadFormData,
            }
          );

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
            attachmentUrls.push(
              `${urlEndpoint}/tr:q-auto,f-webp,w-1200${uploadResult.filePath}`
            );
          }
        } catch (uploadError) {
          console.error("Attachment upload error:", uploadError);
        }
      }
    }

    // Create message
    const disputeMessage = await prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: userId,
        senderType: isAdmin ? "ADMIN" : "CUSTOMER",
        message,
        attachments: attachmentUrls,
      },
      include: {
        dispute: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update dispute status if needed
    if (isAdmin && dispute.status === "OPEN") {
      await prisma.dispute.update({
        where: { id: disputeId },
        data: { status: "UNDER_REVIEW" },
      });
    }

    return NextResponse.json({
      success: true,
      message: disputeMessage,
    });
  } catch (error) {
    console.error("Error sending dispute message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
