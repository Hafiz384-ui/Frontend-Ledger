"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  Layers,
  Send,
  Loader2,
  TrendingUp,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccountStore } from "@/store/useAccountStore";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { toast } from "@/store/useToastStore";
import AccountCard from "@/components/dashboard/AccountCard";
import AccountDetailModal from "@/components/dashboard/AccountDetailModal";
import EmptyAccountState from "@/components/dashboard/EmptyAccountState";
import SendMoneyModal from "@/components/dashboard/SendMoneyModal";
import {
  DashboardGridSkeleton,
  AccountCardSkeleton,
} from "@/components/ui/SkeletonLoaders";
import type { Account } from "@/types/account";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    accounts,
    activeAccount,
    balances,
    isLoading,
    isCreating,
    fetchAccounts,
    createAccount,
    fetchBalance,
  } = useAccountStore();

  const [hideBalances, setHideBalances] = useState(false);
  const [detailModalAccount, setDetailModalAccount] = useState<Account | null>(null);
  const [sendModalAccount, setSendModalAccount] = useState<Account | null>(null);

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Calculate cumulative net worth
  const totalNetWorth = accounts.reduce((acc, account) => {
    const bal = balances[account._id] ?? 0;
    return acc + bal;
  }, 0);

  const activeBalance = activeAccount ? balances[activeAccount._id] ?? 0 : 0;

  const handleCreateAccount = async () => {
    const newAcc = await createAccount();
    if (newAcc) {
      toast.success(
        `New Vault opened! Account ID: ${newAcc._id}`,
        "Account Created"
      );
    } else {
      toast.error("Failed to create account. Please try again.", "Error");
    }
  };

  const handleRefreshAll = async () => {
    await fetchAccounts();
    toast.info("All accounts and ledger balances refreshed.", "Synced");
  };

  return (
    <ProtectedRoute>
      <div className="space-y-10 animate-fadeIn">
        {/* Top Header & Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Spatial Banking Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-emerald-400 bg-clip-text text-transparent">
                {user?.username || "Commander"}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor your active vaults, peer-to-peer transfers, and ledger status.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl spatial-glass border border-border/60 hover:bg-muted/80 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-spatial-sm"
              title="Refresh All Accounts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden sm:inline">Sync Ledger</span>
            </button>

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={isCreating}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Opening Vault...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Open New Account</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Skeleton during initial fetch */}
        {isLoading && accounts.length === 0 ? (
          <DashboardGridSkeleton />
        ) : accounts.length === 0 ? (
          <EmptyAccountState onAccountCreated={fetchAccounts} />
        ) : (
          <>
            {/* Hero Spatial Card: Cumulative Portfolio Summary */}
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
                        {hideBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
                    onClick={() => {
                      if (activeAccount) setSendModalAccount(activeAccount);
                      else if (accounts[0]) setSendModalAccount(accounts[0]);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Funds</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeAccount) setDetailModalAccount(activeAccount);
                      else if (accounts[0]) setDetailModalAccount(accounts[0]);
                    }}
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
                  <span className="font-semibold text-emerald-400 mt-0.5 block">B+ Tree Compound (User + Status)</span>
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

            {/* All Bank Accounts Grid */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Your Bank Accounts
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click any account to make it your primary vault or perform actions
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={isCreating}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Open Another Account</span>
                </button>
              </div>

              {/* Account Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* If creating an account, show a shimmering skeleton placeholder */}
                {isCreating && <AccountCardSkeleton />}

                {accounts.map((acc) => (
                  <AccountCard
                    key={acc._id}
                    account={acc}
                    hideBalance={hideBalances}
                    onOpenDetails={(account) => setDetailModalAccount(account)}
                    onSendMoney={(account) => setSendModalAccount(account)}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Modals */}
        <AccountDetailModal
          account={detailModalAccount}
          isOpen={!!detailModalAccount}
          onClose={() => setDetailModalAccount(null)}
          onSendMoney={(account) => {
            setDetailModalAccount(null);
            setSendModalAccount(account);
          }}
        />

        <SendMoneyModal
          account={sendModalAccount}
          isOpen={!!sendModalAccount}
          availableBalance={sendModalAccount ? balances[sendModalAccount._id] ?? 0 : 0}
          onClose={() => setSendModalAccount(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
