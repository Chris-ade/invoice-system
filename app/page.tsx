"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function Page() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isAuthenticated) {
      // Use transition to prevent blocking updates
      startTransition(() => {
        router.push(`/dashboard`);
      });
    } else {
      // Redirect to login if not authenticated
      router.replace(`/auth/login`);
    }
  }, [user]);
}
