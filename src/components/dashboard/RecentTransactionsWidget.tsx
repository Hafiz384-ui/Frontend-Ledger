"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Zap,
  ArrowRight,
  RefreshCw,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { transactionService } from "@/services/transaction.service";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { toast } from "@/store/useToastStore";
import type { Transaction, TransactionAccountRef } from "@/types/transaction";

export function RecentTransactionsWidget() {
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await transactionService.getTransactionHistory({ limit: 5 });
      setRecentTx(res.transactions || []);
    } catch {
      // Quiet fail on widget
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.info(`${label} copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAccId = (acc: string | TransactionAccountRef) => {
    return typeof acc === "object" && acc ? acc._id : String(acc);
  };

  return (
    <div className="rounded-3xl spatial-card border border-border/60 p-5 sm:p-6 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Recent Activity & Transfers
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Live double-entry settlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRecent}
            disabled={isLoading}
            className="p-1.5 rounded-xl border border-border/40 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pl-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Body content */}
      {isLoading ? (
        <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
          <span>Syncing latest ledger entries...</span>
        </div>
      ) : recentTx.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground mx-auto">
            <Layers className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">No recent activity</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Transfers you send or receive will appear here automatically in real time.
            </p>
          </div>
          <Link
            href="/transfers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all"
          >
            <span>Transfer Funds</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recentTx.map((tx) => {
            const isSent = tx.direction === "SENT";
            const isReceived = tx.direction === "RECEIVED";
            const isSelf = tx.direction === "SELF";

            const counterpartName = isSent
              ? typeof tx.toAccount === "object" && tx.toAccount?.user?.username
                ? tx.toAccount.user.username
                : `Vault ${maskAccountNumber(getAccId(tx.toAccount))}`
              : typeof tx.fromAccount === "object" && tx.fromAccount?.user?.username
              ? tx.fromAccount.user.username
              : `Vault ${maskAccountNumber(getAccId(tx.fromAccount))}`;

            return (
              <div
                key={tx._id}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between p-3 rounded-2xl bg-card/40 border border-border/50 hover:bg-muted/40 hover:border-border transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isSent
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : isReceived
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    }`}
                  >
                    {isSent ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : isReceived ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : isSelf ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {isSent
                        ? `Sent to ${counterpartName}`
                        : isReceived
                        ? `Received from ${counterpartName}`
                        : isSelf
                        ? "Vault Transfer"
                        : "System Credit"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-extrabold font-mono ${
                      isSent
                        ? "text-rose-400"
                        : isReceived
                        ? "text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {isSent ? "-" : isReceived ? "+" : ""}
                    {formatCurrency(tx.amount, "INR")}
                  </p>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/80 font-mono">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-sm rounded-3xl spatial-card border border-border/80 p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">
                  Transaction Receipt
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 px-4 rounded-xl bg-card/60 border border-border/50">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                {selectedTx.direction === "SENT" ? "Debited" : "Credited"}
              </span>
              <p
                className={`text-2xl font-extrabold font-mono mt-0.5 ${
                  selectedTx.direction === "SENT"
                    ? "text-rose-400"
                    : selectedTx.direction === "RECEIVED"
                    ? "text-emerald-400"
                    : "text-foreground"
                }`}
              >
                {selectedTx.direction === "SENT" ? "-" : selectedTx.direction === "RECEIVED" ? "+" : ""}
                {formatCurrency(selectedTx.amount, "INR")}
              </p>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between p-2 rounded-lg bg-muted/40 font-mono">
                <span className="text-muted-foreground">ID</span>
                <span className="text-foreground font-semibold">{maskAccountNumber(selectedTx._id)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/40 font-mono">
                <span className="text-muted-foreground">Source Vault</span>
                <span className="text-foreground">{maskAccountNumber(getAccId(selectedTx.fromAccount))}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/40 font-mono">
                <span className="text-muted-foreground">Recipient Vault</span>
                <span className="text-foreground">{maskAccountNumber(getAccId(selectedTx.toAccount))}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/40 font-mono">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{new Date(selectedTx.createdAt).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/transactions"
                className="flex-1 py-2 rounded-xl spatial-glass border border-border/60 text-center text-xs font-semibold text-foreground hover:bg-muted/60"
              >
                Full Ledger
              </Link>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentTransactionsWidget;
