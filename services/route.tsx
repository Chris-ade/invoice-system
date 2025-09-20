"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import ActivityIndicator from "@/components/common/activity-indicator";

interface PrivateRouteProps {
  children: ReactNode;
  showFooter?: boolean;
}

const PrivateRoute = ({ children, showFooter }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === undefined || isAuthenticated === null) {
    return <ActivityIndicator isFull={true} />;
  }

  if (!isAuthenticated) {
    return null; // or loading if redirecting
  }

  return <>{children}</>;
};

export default PrivateRoute;
