"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function AdminRedirect({ children }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();

        if (data.isAdmin) {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
  }, [user, isLoaded, router]);

  return <>{children}</>;
}
