"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  RefreshCw,
  Send,
  Layers,
  ShieldCheck,
  Lock,
  AlertOctagon,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import type { Account, AccountStatus } from "@/types/account";
import { useAccountStore } from "@/store/useAccountStore";
import { toast } from "@/store/useToastStore";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  onOpenDetails: (account: Account) => void;
  onSendMoney: (account: Account) => void;
  hideBalance?: boolean;
}

export function AccountCard({
  account,
  onOpenDetails,
  onSendMoney,
  hideBalance = false,
}: AccountCardProps) {
  const { balances, isBalanceLoading, fetchBalance, activeAccount, setActiveAccount } =
    useAccountStore();

  const [copied, setCopied] = useState(false);
  const isSelected = activeAccount?._id === account._id;
  const balance = balances[account._id] ?? 0;
  const isLoadingBalance = isBalanceLoading[account._id] || false;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account._id);
    setCopied(true);
    toast.success("Account ID copied to clipboard", "Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckBalance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const freshBalance = await fetchBalance(account._id);
    if (freshBalance !== null) {
      toast.info(
        `Balance for ${maskAccountNumber(account._id)} is ${formatCurrency(
          freshBalance,
          account.currency
        )}`,
        "Balance Refreshed"
      );
    } else {
      toast.error("Could not fetch balance. Please try again.", "Error");
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        );
      case "FROZEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Lock className="w-3 h-3 text-amber-400" />
            FROZEN
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => setActiveAccount(account)}
      className={`group relative rounded-3xl spatial-card p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer border ${
        isSelected
          ? "border-emerald-500/50 shadow-spatial-glow-emerald bg-emerald-500/[0.03]"
          : "border-border/60 hover:border-border/90"
      }`}
    >
      {/* Top Strip: Type, Status & 1-Click Copy ID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-muted/60 text-muted-foreground border border-border/40 group-hover:text-foreground"
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block tracking-tight">
                Primary Vault
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {account.currency || "INR"} Account
              </span>
            </div>
          </div>

          <div>{getStatusBadge(account.status)}</div>
        </div>

        {/* 1-Click Copy Account ID Pill */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-card/60 border border-border/40 text-xs">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              ID:
            </span>
            <span className="font-mono text-xs text-foreground/90 truncate max-w-[170px] sm:max-w-[200px]">
              {account._id}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            title="Copy Account ID"
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-muted/80 hover:bg-emerald-500/20 hover:text-emerald-400 text-muted-foreground transition-all shrink-0 border border-border/40"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center: Balance Display with Currency formatting */}
      <div className="my-6 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Ledger Balance
          </span>
          {isLoadingBalance && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 animate-pulse font-medium">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              Syncing...
            </span>
          )}
        </div>

        <h3 className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
          {hideBalance ? "••••••••" : formatCurrency(balance, account.currency || "INR")}
        </h3>
      </div>

      {/* Bottom: Quick Actions (Check Balance & Send Money) */}
      <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCheckBalance}
          disabled={isLoadingBalance}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl spatial-glass border border-border/60 hover:border-emerald-500/40 text-xs font-semibold text-foreground/90 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all shadow-spatial-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoadingBalance ? "animate-spin text-emerald-400" : ""}`}
          />
          <span>Check Balance</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSendMoney(account);
          }}
          disabled={account.status !== "ACTIVE"}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Money</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(account);
          }}
          title="Full Account Ledger Details"
          className="p-2 rounded-xl spatial-glass border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default AccountCard;
