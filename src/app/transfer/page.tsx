"use client";

import React, { useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TransferForm from "@/components/transfer/TransferForm";
import TransferPageHeader from "@/components/transfer/TransferPageHeader";
import TransferGuidanceSidebar from "@/components/transfer/TransferGuidanceSidebar";
import { useAccountStore } from "@/store/useAccountStore";

/**
 * Clean Single-Responsibility Transfer Page Orchestrator
 */
export default function TransferPage() {
  const { accounts, activeAccount, balances, fetchAccounts } = useAccountStore();

  useEffect(() => {
    if (accounts.length === 0) {
      fetchAccounts();
    }
  }, [accounts.length, fetchAccounts]);

  const activeBalance = activeAccount ? balances[activeAccount._id] ?? 0 : 0;

  return (
    <ProtectedRoute>
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <TransferPageHeader
          activeAccount={activeAccount}
          activeBalance={activeBalance}
        />

        {/* Transfer Grid: Form on Left/Center, Security & Insights on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <TransferForm />
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <TransferGuidanceSidebar
              accounts={accounts}
              balances={balances}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
