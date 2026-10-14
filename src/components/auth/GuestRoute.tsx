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
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    }
  }, [hasHydrated, isAuthenticated, router, searchParams]);

  if (!hasHydrated || isAuthenticated) {
    return (
      <GlobalLoader message="Authenticated session active. Redirecting to dashboard..." />
    );
  }

  return <>{children}</>;
}

export default GuestRoute;
