"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRightLeft,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TransferForm from "@/components/transfer/TransferForm";
import { useAccountStore } from "@/store/useAccountStore";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";

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
        {/* Navigation Breadcrumb & Page Header */}
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

        {/* Transfer Grid: Form on Left/Center, Security & Insights on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Transfer Form Column */}
          <div className="lg:col-span-7 xl:col-span-8">
            <TransferForm />
          </div>

          {/* Side Guidance & Architectural Security Column */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Double-Entry Security Card */}
            <div className="rounded-3xl spatial-card p-6 border border-emerald-500/20 space-y-4 shadow-spatial-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Ledger Guarantees</h3>
                  <span className="text-[10px] text-muted-foreground">ACID-compliant verification</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Zero Duplicate Charges:</strong> Every request is locked with a unique UUID v4 idempotency key.
                  </p>
                </div>

                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Double-Entry Balancing:</strong> Debit and credit records are created simultaneously within a single database transaction.
                  </p>
                </div>

                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-foreground">Compound Indexing:</strong> Queries leverage high-performance compound indices for instant balance resolution.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips for Recipients */}
            <div className="rounded-3xl spatial-glass p-6 border border-border/80 space-y-3">
              <div className="flex items-center space-x-2 text-foreground font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Recipient Account ID Tips</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  Recipient IDs are 24-character hexadecimal strings (e.g. <span className="font-mono text-foreground text-[11px]">65fa3b...</span>).
                </li>
                <li>
                  Use the <strong>Paste</strong> button in the recipient field to populate copied accounts with one click.
                </li>
                <li>
                  Funds cannot be transferred to the same source account.
                </li>
              </ul>
            </div>

            {/* Your Active Vaults List */}
            <div className="rounded-3xl spatial-glass p-6 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Your Bank Vaults
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {accounts.length} Total
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const bal = balances[acc._id] ?? 0;
                  return (
                    <div
                      key={acc._id}
                      className="p-3 rounded-2xl bg-card/50 border border-border/40 flex items-center justify-between text-xs hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono font-semibold text-foreground block">
                          {maskAccountNumber(acc._id)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            acc.status === "ACTIVE"
                              ? "text-emerald-400"
                              : acc.status === "FROZEN"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {acc.status}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(bal, acc.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
