"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldOff, Lock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface SystemRouteProps {
  children: React.ReactNode;
}

/**
 * SystemRoute — Client-side guard for privileged admin routes.
 * Renders children ONLY when the authenticated user has `systemUser: true`.
 * Regular users see a styled 403 Access Denied screen instead.
 */
export function SystemRoute({ children }: SystemRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  console.log(user);
  // Track mount state to prevent SSR/hydration flicker
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 1: Await Zustand hydration + component mount
  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
            <div className="w-14 h-14 rounded-full border-2 border-emerald-500/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse">
            Verifying privileges…
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Not authenticated at all → redirect to login
  if (!isAuthenticated || !user) {
    router.replace("/login?redirect=/admin");
    return null;
  }

  // Step 3: Authenticated but NOT a system user → render 403
  if (!user.systemUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full space-y-8 text-center">
          {/* Icon cluster */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]">
                <ShieldOff className="w-10 h-10 text-rose-400" />
              </div>
              {/* Floating lock badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
          </div>

          {/* Status code */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-rose-500/80 uppercase">
              Error 403
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Access Denied
            </h1>
          </div>

          {/* Description card */}
          <div className="spatial-glass rounded-2xl p-6 border border-rose-500/20 bg-rose-950/10 space-y-3 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You do not have{" "}
              <span className="text-rose-400 font-semibold">System Administrator</span>{" "}
              privileges required to access this restricted panel.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] text-rose-400/80 font-mono">
                Privilege: <code>systemUser</code> required
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-rose-500/15">
              <p className="text-[11px] text-muted-foreground/60">
                Logged in as:{" "}
                <span className="text-foreground/80 font-medium">
                  {user.username}
                </span>{" "}
                &nbsp;·&nbsp; Role:{" "}
                <span className="text-amber-400 font-medium">Standard User</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-mono text-rose-400/80">
              Request ID: {Math.random().toString(36).slice(2, 10).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: System user — grant access
  return <>{children}</>;
}

export default SystemRoute;
