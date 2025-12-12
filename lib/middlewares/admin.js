import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * isAdmin
 * - If passed a string (clerk userId) returns a boolean indicating admin status.
 * - If passed a Request (or nothing), tries to authenticate via Clerk and
 *   returns an object { authorized: boolean, userId?: string, error?: string }
 * This dual behavior keeps backward compatibility with different call sites.
 */
export async function isAdmin(arg) {
  // If a string userId is provided, return a simple boolean
  if (typeof arg === "string") {
    const userId = arg;
    if (!userId) return false;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }, // User.id IS the Clerk userId
        select: { isAdmin: true },
      });
      return !!user?.isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Otherwise, assume a Request-like call (server API route)
  try {
    const { userId } = await auth();
    if (!userId) {
      return { authorized: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }, // User.id IS the Clerk userId
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return { authorized: false, userId, error: "Access denied. Admin only." };
    }

    return { authorized: true, userId };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { authorized: false, error: "Failed to verify admin status" };
  }
}
