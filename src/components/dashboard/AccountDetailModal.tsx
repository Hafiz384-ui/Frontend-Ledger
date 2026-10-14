"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Send,
  Calendar,
  Layers,
  CheckCircle2,
  Lock,
  AlertOctagon,
  AlertCircle,
} from "lucide-react";
import type { Account, AccountStatus } from "@/types/account";
import { useAccountStore } from "@/store/useAccountStore";
import { toast } from "@/store/useToastStore";
import { formatCurrency } from "@/lib/utils";

interface AccountDetailModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMoney: (account: Account) => void;
}

export function AccountDetailModal({
  account,
  isOpen,
  onClose,
  onSendMoney,
}: AccountDetailModalProps) {
  const { balances, isBalanceLoading, fetchBalance } = useAccountStore();
  const [copied, setCopied] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && account?._id) {
      setFetchError(null);
      fetchBalance(account._id).then((val) => {
        if (val === null) {
          setFetchError("Unable to retrieve balance for this account.");
          toast.error("Account balance details could not be retrieved.", "API Error");
        }
      });
    }
  }, [isOpen, account, fetchBalance]);

  if (!isOpen || !account) return null;

  const currentBalance = balances[account._id] ?? 0;
  const isLoading = isBalanceLoading[account._id] || false;

  const handleCopyId = () => {
    navigator.clipboard.writeText(account._id);
    setCopied(true);
    toast.success("Account ID copied to clipboard", "Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setFetchError(null);
    const fresh = await fetchBalance(account._id);
    if (fresh !== null) {
      toast.success(
        `Balance updated: ${formatCurrency(fresh, account.currency || "INR")}`,
        "Refreshed"
      );
    } else {
      setFetchError("Account not found or ledger unreachable.");
      toast.error("Could not fetch updated balance.", "Error");
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE VAULT
          </span>
        );
      case "FROZEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            FROZEN
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl spatial-glass p-6 sm:p-8 border border-border/80 shadow-2xl animate-scaleIn space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-spatial-glow-emerald">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Account Details & Vault
              </h3>
              <p className="text-xs text-muted-foreground">
                Verified Ledger Identity and Live Balance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification if 404 or failed */}
        {fetchError && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{fetchError}</span>
          </div>
        )}

        {/* Hero Balance Showcase */}
        <div className="rounded-2xl p-6 spatial-card border border-emerald-500/20 bg-emerald-500/[0.03] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Available Ledger Balance
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh Live Balance"
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Fetching..." : "Refresh"}</span>
            </button>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight font-mono text-foreground">
            {formatCurrency(currentBalance, account.currency || "INR")}
          </h2>

          <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Double-entry ledger balance guaranteed by MongoDB B+ tree index</span>
          </div>
        </div>

        {/* Account Attribute Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Account ID Tile */}
          <div className="p-3.5 rounded-xl spatial-glass border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Unique Account ID
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-foreground truncate max-w-[170px]">
                {account._id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 text-muted-foreground hover:text-emerald-400 transition-colors"
                title="Copy Account ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status Tile */}
          <div className="p-3.5 rounded-xl spatial-glass border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Status
            </span>
            <div>{getStatusBadge(account.status)}</div>
          </div>

          {/* Base Currency */}
          <div className="p-3.5 rounded-xl spatial-glass border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Currency
            </span>
            <span className="font-semibold text-foreground text-xs block">
              {account.currency || "INR"} (Indian Rupee)
            </span>
          </div>

          {/* Creation Date */}
          <div className="p-3.5 rounded-xl spatial-glass border border-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Created On
            </span>
            <span className="font-medium text-foreground text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {account.createdAt
                ? new Date(account.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Active"}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl spatial-glass border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSendMoney(account);
            }}
            disabled={account.status !== "ACTIVE"}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailModal;
