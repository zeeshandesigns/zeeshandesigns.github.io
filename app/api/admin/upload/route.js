import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/middlewares/admin";
import { auth } from "@clerk/nextjs/server";
import imagekit from "@/configs/imagekit";

/**
 * POST /api/admin/upload
 * Upload an image to ImageKit
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(userId);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "pak-cards";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: base64,
      fileName: file.name,
      folder: folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file: " + error.message },
      { status: 500 }
    );
  }
}
