"use client";

import React, { useState, useEffect } from "react";
import { Shield, Clock, Zap, Banknote } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { SystemRoute } from "@/components/auth/SystemRoute";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SeedFundsForm from "@/components/admin/SeedFundsForm";
import AdminAuditSidebar from "@/components/admin/AdminAuditSidebar";
import AdminPageSkeleton from "@/components/admin/AdminPageSkeleton";

/**
 * Main Admin Panel Content
 */
function AdminPanelContent() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const now = new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <AdminPageSkeleton />;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Page Header */}
      <AdminPageHeader user={user} />

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          icon={Shield}
          label="Access Level"
          value="System Operator"
          accent="border-rose-500/30 text-rose-400"
        />
        <AdminStatCard
          icon={Clock}
          label="Session Time (IST)"
          value={now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
          accent="border-sky-500/30 text-sky-400"
        />
        <AdminStatCard
          icon={Zap}
          label="API Endpoint"
          value="POST /api/transactions/system/initial-funds"
          accent="border-amber-500/30 text-amber-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Seed Funds Form Container */}
        <div className="lg:col-span-3 spatial-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-r from-card/80 to-emerald-950/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Banknote className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Seed Initial Funds
                </h2>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Inject initial capital into any user account
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <SeedFundsForm />
          </div>
        </div>

        {/* Security & Audit Sidebar */}
        <div className="lg:col-span-2">
          <AdminAuditSidebar />
        </div>
      </div>
    </div>
  );
}

/**
 * Clean Single-Responsibility Admin Page Orchestrator
 * Protected by SystemRoute Privilege Guard
 */
export default function AdminPage() {
  return (
    <SystemRoute>
      <AdminPanelContent />
    </SystemRoute>
  );
}
