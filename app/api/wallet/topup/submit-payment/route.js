import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notifyAdmins, notificationTemplates } from "@/lib/notifications";

/**
 * POST /api/wallet/topup/submit-payment
 * Submit payment proof for a top-up request
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const topUpId = formData.get("topUpId");
    const paymentProofFile = formData.get("paymentProof");
    const paymentReference = formData.get("paymentReference") || "";

    // Validation
    if (!topUpId) {
      return NextResponse.json(
        { error: "Top-up ID is required" },
        { status: 400 }
      );
    }

    if (!paymentProofFile) {
      return NextResponse.json(
        { error: "Payment proof image is required" },
        { status: 400 }
      );
    }

    // Verify top-up exists and belongs to user
    const topUp = await prisma.walletTopUp.findUnique({
      where: { id: topUpId },
    });

    if (!topUp) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    if (topUp.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: This top-up request belongs to another user" },
        { status: 403 }
      );
    }

    if (topUp.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Cannot submit payment for top-up with status: ${topUp.status}`,
        },
        { status: 400 }
      );
    }

    // Upload to ImageKit using REST API
    let paymentProofUrl = "";

    try {
      // Convert file to buffer
      const bytes = await paymentProofFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadFormData = new FormData();
      uploadFormData.append("file", new Blob([buffer]), paymentProofFile.name);
      uploadFormData.append(
        "fileName",
        `topup_${topUpId}_${Date.now()}_${paymentProofFile.name}`
      );
      uploadFormData.append("folder", "/wallet-topups");

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

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("ImageKit upload failed:", errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
      paymentProofUrl = `${urlEndpoint}/tr:q-auto,f-webp,w-1200${uploadResult.filePath}`;
    } catch (uploadError) {
      console.error("Payment proof upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload payment proof. Please try again." },
        { status: 500 }
      );
    }

    // Update top-up with payment proof
    const updatedTopUp = await prisma.walletTopUp.update({
      where: { id: topUpId },
      data: {
        paymentProof: paymentProofUrl,
        paymentReference,
        status: "PAYMENT_SUBMITTED",
      },
    });

    // Notify admins about payment submission
    try {
      const template = notificationTemplates.adminPaymentSubmitted(
        updatedTopUp.amount
      );
      await notifyAdmins(
        template.type,
        template.title,
        template.message,
        template.actionUrl
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      topUp: updatedTopUp,
      message:
        "Payment proof submitted successfully. Awaiting admin verification.",
    });
  } catch (error) {
    console.error("Error submitting payment proof:", error);
    return NextResponse.json(
      { error: "Failed to submit payment proof" },
      { status: 500 }
    );
  }
}
