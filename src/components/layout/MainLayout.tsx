"use client";

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { AlertCircle, ShieldAlert, X } from "lucide-react";
import ToastContainer from "@/components/ui/Toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"warning" | "error">("error");

  useEffect(() => {
    // Listen for custom global API events dispatched by interceptors
    const handleUnauthorized = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setToastMessage(customEvent.detail?.message || "Session expired. Please log in.");
      setToastType("warning");
    };

    const handleForbidden = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setToastMessage(customEvent.detail?.message || "Access denied. Insufficient privileges.");
      setToastType("error");
    };

    window.addEventListener("banking:unauthorized", handleUnauthorized);
    window.addEventListener("banking:forbidden", handleForbidden);

    return () => {
      window.removeEventListener("banking:unauthorized", handleUnauthorized);
      window.removeEventListener("banking:forbidden", handleForbidden);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col spatial-ambient-mesh">
      {/* Top Navbar */}
      <Navbar />

      {/* Global Notification Banner if 401 or 403 occurs */}
      {toastMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-spatial-md animate-fadeIn ${
              toastType === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              {toastType === "warning" ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Page Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Spatial Banking Footer */}
      <footer className="border-t border-border/40 spatial-glass py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>End-to-End Encrypted Financial Core</span>
          </div>
          <p className="text-xs text-muted-foreground/80">
            &copy; {new Date().getFullYear()} AURA Banking Network. Double-entry verified.
          </p>
        </div>
      </footer>

      {/* Global Glassmorphic Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default MainLayout;
