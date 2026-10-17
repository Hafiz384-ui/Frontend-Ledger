import React from "react";
import { Shield, Terminal, ChevronRight } from "lucide-react";
import type { User } from "@/types/auth";

interface AdminPageHeaderProps {
  user: User | null;
}

/**
 * Administrative Console Page Header with System Operator badge
 */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ user }) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
        <Terminal className="w-3 h-3" />
        <span>System</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400 font-medium">Admin Panel</span>
      </div>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-orange-400 p-[1.5px] shadow-[0_0_20px_-5px_rgba(244,63,94,0.5)]">
              <div className="w-full h-full rounded-[10px] bg-background/90 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                System Admin Panel
              </h1>
              <p className="text-[11px] text-muted-foreground/60 font-mono tracking-wider mt-0.5">
                RESTRICTED — SYSTEM OPERATOR CONSOLE
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Privileged system-level operations for AURA Banking Network
            administrators. Actions performed here are immutably logged on the
            double-entry ledger.
          </p>
        </div>

        {/* Session badge */}
        <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-semibold text-rose-400">
            <Shield className="w-3.5 h-3.5" />
            System Operator
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-mono">
            {user?.username} · {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;
