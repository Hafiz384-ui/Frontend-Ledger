import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type { Account } from "@/types/account";

interface TransferPageHeaderProps {
  activeAccount: Account | null;
  activeBalance: number;
}

/**
 * Breadcrumbs and Header banner for the Funds Transfer page
 */
export const TransferPageHeader: React.FC<TransferPageHeaderProps> = ({
  activeAccount,
  activeBalance,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Spatial Ledger Transfer
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Transfer Funds
        </h1>
        <p className="text-xs text-muted-foreground">
          Execute cryptographically idempotent peer-to-peer transfers with real-time balance clearance.
        </p>
      </div>

      {/* Quick Active Vault Status Pill */}
      {activeAccount && (
        <div className="flex items-center space-x-3 p-3 rounded-2xl spatial-glass border border-emerald-500/25 self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Primary Vault ({maskAccountNumber(activeAccount._id)})
            </span>
            <span className="text-sm font-mono font-extrabold text-foreground">
              {formatCurrency(activeBalance, activeAccount.currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPageHeader;
