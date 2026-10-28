"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="py-20 text-center text-xs text-muted-foreground animate-fadeIn">
      Redirecting to Accounts Dashboard...
    </div>
  );
}

