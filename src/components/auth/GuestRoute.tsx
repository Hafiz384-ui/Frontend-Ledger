"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import GlobalLoader from "@/components/ui/GlobalLoader";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, hasHydrated, token } = useAuthStore();
  const isExpired = Boolean(searchParams.get("expired"));

  useEffect(() => {
    // If not expired and actually authenticated, redirect to app
    if (hasHydrated && isAuthenticated && token && !isExpired) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
    }
  }, [hasHydrated, isAuthenticated, token, isExpired, router, searchParams]);

  if (!hasHydrated || (isAuthenticated && token && !isExpired)) {
    return (
      <GlobalLoader message="Authenticated session active. Redirecting to dashboard..." />
    );
  }

  return <>{children}</>;
}

export default GuestRoute;
