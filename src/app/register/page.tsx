"use client";

import React, { Suspense } from "react";
import GuestRoute from "@/components/auth/GuestRoute";
import AuthCardHeader from "@/components/auth/AuthCardHeader";
import RegisterForm from "@/components/auth/RegisterForm";

/**
 * Clean Single-Responsibility Register Page Orchestrator with Suspense boundary
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-12rem)] flex items-center justify-center text-xs text-muted-foreground">Loading registration...</div>}>
      <GuestRoute>
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-6 sm:py-12">
          {/* Glow ambient background aura */}
          <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full max-w-md mx-auto">
            {/* Spatial Card Container */}
            <div className="spatial-card rounded-3xl p-6 sm:p-10 border border-border/80 shadow-spatial-lg">
              <AuthCardHeader
                title="Create Banking Account"
                subtitle="Join AURA Spatial Financial OS with double-entry security"
                badge="Zero Maintenance Fee"
              />
              <RegisterForm />
            </div>
          </div>
        </div>
      </GuestRoute>
    </Suspense>
  );
}
