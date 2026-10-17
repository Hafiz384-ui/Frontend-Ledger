import React, { useState } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  TrendingUp,
  Send,
  Layers,
  Shield,
} from "lucide-react";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type { Account } from "@/types/account";

interface PortfolioSummaryCardProps {
  accounts: Account[];
  activeAccount: Account | null;
  totalNetWorth: number;
  onSendFunds: (account: Account) => void;
  onViewDetails: (account: Account) => void;
}

/**
 * Hero Spatial Card: Cumulative Portfolio Summary with Balance Privacy Toggle
 */
export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({
  accounts,
  activeAccount,
  totalNetWorth,
  onSendFunds,
  onViewDetails,
}) => {
  const [hideBalances, setHideBalances] = useState(false);

  const targetAccount = activeAccount || accounts[0];

  return (
    <section className="relative overflow-hidden rounded-3xl spatial-card p-6 sm:p-10 border border-emerald-500/25 shadow-spatial-lg">
      {/* Radial glow background light */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Balance Stats */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3" />
              <span>PRIMARY LIQUIDITY VAULT</span>
            </div>

            <span className="text-xs text-muted-foreground font-mono">
              {activeAccount
                ? `Account ${maskAccountNumber(activeAccount._id)}`
                : `${accounts.length} Active Accounts`}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Total Available Portfolio</span>
              <button
                type="button"
                onClick={() => setHideBalances(!hideBalances)}
                className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                title={hideBalances ? "Show Balances" : "Hide Balances"}
              >
                {hideBalances ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-mono text-foreground">
              {hideBalances ? "••••••••" : formatCurrency(totalNetWorth, "INR")}
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>Double-Entry Verified</span>
            </div>
            <span>•</span>
            <span>{accounts.length} Total Bank Vaults</span>
          </div>
        </div>

        {/* Hero Quick Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <button
            type="button"
            onClick={() => targetAccount && onSendFunds(targetAccount)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send Funds</span>
          </button>

          <button
            type="button"
            onClick={() => targetAccount && onViewDetails(targetAccount)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl spatial-glass border border-border/80 font-bold text-xs hover:bg-muted/80 text-foreground transition-all shadow-spatial-sm"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Vault Details</span>
          </button>
        </div>
      </div>

      {/* Bottom Assurance Strip */}
      <div className="mt-8 pt-6 border-t border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Default Currency</span>
          <span className="font-semibold text-foreground mt-0.5 block">INR (₹ — Indian Rupee)</span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block">Ledger Method</span>
          <span className="font-semibold text-foreground mt-0.5 block">Balanced Debit/Credit</span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block">Database Index</span>
          <span className="font-semibold text-emerald-400 mt-0.5 block">
            B+ Tree Compound (User + Status)
          </span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block">Security</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
            <Shield className="w-3.5 h-3.5" />
            Token Blacklist Guard
          </span>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSummaryCard;
