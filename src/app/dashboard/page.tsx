"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccountStore } from "@/store/useAccountStore";
import { toast } from "@/store/useToastStore";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PortfolioSummaryCard from "@/components/dashboard/PortfolioSummaryCard";
import AccountGrid from "@/components/dashboard/AccountGrid";
import EmptyAccountState from "@/components/dashboard/EmptyAccountState";
import AccountDetailModal from "@/components/dashboard/AccountDetailModal";
import SendMoneyModal from "@/components/dashboard/SendMoneyModal";
import RecentTransactionsWidget from "@/components/dashboard/RecentTransactionsWidget";
import { DashboardGridSkeleton } from "@/components/ui/SkeletonLoaders";
import type { Account } from "@/types/account";

/**
 * Clean Single-Responsibility Dashboard Page Orchestrator
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isSystemUser = Boolean(user?.systemUser);

  const {
    accounts,
    activeAccount,
    balances,
    isLoading,
    isCreating,
    fetchAccounts,
    createAccount,
  } = useAccountStore();

  const [detailModalAccount, setDetailModalAccount] = useState<Account | null>(null);
  const [sendModalAccount, setSendModalAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Calculate cumulative net worth across all user vaults
  const totalNetWorth = accounts.reduce((acc, account) => {
    const bal = balances[account._id] ?? 0;
    return acc + bal;
  }, 0);

  const handleCreateAccount = async () => {
    if (isSystemUser) {
      toast.error(
        "System users (Admins) are not allowed to open new accounts.",
        "Operation Blocked"
      );
      return;
    }

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

  const handleInitiateSend = (account: Account) => {
    if (isSystemUser) {
      toast.info(
        "System users cannot perform simple peer-to-peer transfers. Redirecting to Seed Funds panel...",
        "Admin Seeding"
      );
      router.push("/admin");
      return;
    }
    setSendModalAccount(account);
  };

  const handleRefreshAll = async () => {
    await fetchAccounts();
    toast.info("All accounts and ledger balances refreshed.", "Synced");
  };

  return (
    <ProtectedRoute>
      <div className="space-y-10 animate-fadeIn">
        {/* Top Header & Greeting */}
        <DashboardHeader
          user={user}
          isLoading={isLoading}
          isCreating={isCreating}
          onRefresh={handleRefreshAll}
          onCreateAccount={handleCreateAccount}
        />

        {/* Loading Skeleton during initial fetch */}
        {isLoading && accounts.length === 0 ? (
          <DashboardGridSkeleton />
        ) : accounts.length === 0 ? (
          <EmptyAccountState onAccountCreated={fetchAccounts} />
        ) : (
          <>
            {/* Hero Portfolio Net Worth Card */}
            <PortfolioSummaryCard
              accounts={accounts}
              activeAccount={activeAccount}
              totalNetWorth={totalNetWorth}
              isSystemUser={isSystemUser}
              onSendFunds={handleInitiateSend}
              onViewDetails={(account) => setDetailModalAccount(account)}
            />

            {/* All Bank Accounts Grid */}
            <AccountGrid
              accounts={accounts}
              isCreating={isCreating}
              isSystemUser={isSystemUser}
              hideBalances={false}
              onCreateAccount={handleCreateAccount}
              onOpenDetails={(account) => setDetailModalAccount(account)}
              onSendMoney={handleInitiateSend}
            />

            {/* Live Activity & Transaction History Widget */}
            <RecentTransactionsWidget />
          </>
        )}

        {/* Action Modals */}
        <AccountDetailModal
          account={detailModalAccount}
          isOpen={!!detailModalAccount}
          isSystemUser={isSystemUser}
          onClose={() => setDetailModalAccount(null)}
          onSendMoney={(account) => {
            setDetailModalAccount(null);
            handleInitiateSend(account);
          }}
        />

        {!isSystemUser && (
          <SendMoneyModal
            account={sendModalAccount}
            isOpen={!!sendModalAccount}
            availableBalance={sendModalAccount ? balances[sendModalAccount._id] ?? 0 : 0}
            onClose={() => setSendModalAccount(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
