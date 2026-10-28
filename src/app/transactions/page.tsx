"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Layers,
  ShieldCheck,
  Send,
  Zap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  CreditCard,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccountStore } from "@/store/useAccountStore";
import { transactionService } from "@/services/transaction.service";
import { toast } from "@/store/useToastStore";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type {
  Transaction,
  TransactionAccountRef,
} from "@/types/transaction";

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { accounts } = useAccountStore();
  const isSystemUser = Boolean(user?.systemUser);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterDirection, setFilterDirection] = useState<"ALL" | "SENT" | "RECEIVED">("ALL");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Receipt Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number | boolean> = {
          page,
          limit: 15,
        };

        if (selectedAccountId !== "ALL") {
          params.accountId = selectedAccountId;
        }

        if (isSystemUser) {
          params.all = true;
        }

        const response = await transactionService.getTransactionHistory(params);
        if (response.success) {
          setTransactions(response.transactions || []);
          if (response.pagination) {
            setCurrentPage(response.pagination.page);
            setTotalPages(response.pagination.totalPages);
            setTotalCount(response.pagination.total);
          } else {
            setTotalCount(response.transactions?.length || 0);
          }
        } else {
          toast.error(response.message || "Failed to load transactions", "Error");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(
          error?.response?.data?.message || "Failed to load transaction history.",
          "Error"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAccountId, isSystemUser]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.info(`${label} copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to extract account ID string
  const getAccId = (acc: string | TransactionAccountRef) => {
    return typeof acc === "object" && acc ? acc._id : String(acc);
  };

  // Helper to extract counterpart user name/email
  const getCounterpartInfo = (tx: Transaction) => {
    if (tx.direction === "SENT") {
      const toObj = typeof tx.toAccount === "object" ? tx.toAccount : null;
      return {
        label: "Sent to",
        name: toObj?.user?.username || `Account ${maskAccountNumber(getAccId(tx.toAccount))}`,
        email: toObj?.user?.email || null,
        accountId: getAccId(tx.toAccount),
      };
    } else if (tx.direction === "RECEIVED") {
      const fromObj = typeof tx.fromAccount === "object" ? tx.fromAccount : null;
      return {
        label: "Received from",
        name: fromObj?.user?.username || `Account ${maskAccountNumber(getAccId(tx.fromAccount))}`,
        email: fromObj?.user?.email || null,
        accountId: getAccId(tx.fromAccount),
      };
    } else if (tx.direction === "SELF") {
      return {
        label: "Vault Transfer",
        name: "Internal Account Transfer",
        email: null,
        accountId: getAccId(tx.toAccount),
      };
    }
    return {
      label: "System Transfer",
      name: `To ${maskAccountNumber(getAccId(tx.toAccount))}`,
      email: null,
      accountId: getAccId(tx.toAccount),
    };
  };

  // Filter based on tab and search
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Tab filter
      if (filterDirection === "SENT" && tx.direction !== "SENT") return false;
      if (filterDirection === "RECEIVED" && tx.direction !== "RECEIVED") return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = tx._id.toLowerCase().includes(q);
        const idempotencyMatch = tx.idempotencyKey?.toLowerCase().includes(q);
        const fromMatch = getAccId(tx.fromAccount).toLowerCase().includes(q);
        const toMatch = getAccId(tx.toAccount).toLowerCase().includes(q);
        const info = getCounterpartInfo(tx);
        const nameMatch = info.name.toLowerCase().includes(q);
        return idMatch || idempotencyMatch || fromMatch || toMatch || nameMatch;
      }

      return true;
    });
  }, [transactions, filterDirection, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    let sentSum = 0;
    let receivedSum = 0;
    transactions.forEach((tx) => {
      if (tx.direction === "SENT") sentSum += tx.amount || 0;
      if (tx.direction === "RECEIVED") receivedSum += tx.amount || 0;
    });
    return { sentSum, receivedSum, total: totalCount };
  }, [transactions, totalCount]);

  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 px-2 sm:px-0">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 rounded-3xl spatial-card border border-border/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <span>Double-Entry Ledger</span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live History
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  Audit-cleared transaction history: view incoming credits and outgoing debits settled in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {!isSystemUser && (
              <Link
                href="/transfers"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Money</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => fetchHistory(currentPage)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl spatial-glass border border-border/70 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
              title="Refresh ledger records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl spatial-glass border border-border/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Settlements
              </span>
              <p className="text-lg sm:text-xl font-extrabold font-mono text-foreground">
                {stats.total} Record{stats.total === 1 ? "" : "s"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border/40 flex items-center justify-center text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="p-4 rounded-2xl spatial-glass border border-border/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400/80">
                Total Sent (Debits)
              </span>
              <p className="text-lg sm:text-xl font-extrabold font-mono text-rose-400">
                -{formatCurrency(stats.sentSum, "INR")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl spatial-glass border border-border/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80">
                Total Received (Credits)
              </span>
              <p className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400">
                +{formatCurrency(stats.receivedSum, "INR")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Sent / Received Tabs */}
          <div className="flex items-center p-1 rounded-2xl spatial-glass border border-border/60 w-full sm:w-fit overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterDirection("ALL")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterDirection === "ALL"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Activity
            </button>
            <button
              type="button"
              onClick={() => setFilterDirection("SENT")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                filterDirection === "SENT"
                  ? "bg-rose-500 text-slate-950 shadow-spatial-glow-rose"
                  : "text-muted-foreground hover:text-rose-400"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sent (Debits)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterDirection("RECEIVED")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                filterDirection === "RECEIVED"
                  ? "bg-emerald-500 text-slate-950 shadow-spatial-glow-emerald"
                  : "text-muted-foreground hover:text-emerald-400"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Received (Credits)</span>
            </button>
          </div>

          {/* Account selector and Search */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {accounts.length > 1 && (
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl spatial-glass text-xs font-mono font-semibold border border-border/60 outline-none focus:ring-2 focus:ring-emerald-500/40 text-foreground cursor-pointer"
              >
                <option value="ALL">All Vault Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    Vault {maskAccountNumber(acc._id)}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient, account, or ID..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl spatial-glass text-xs border border-border/60 outline-none focus:ring-2 focus:ring-emerald-500/40 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
        </div>

        {/* Ledger Records Container */}
        <div className="rounded-3xl spatial-glass border border-border/60 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Settled Double-Entry Logs ({filteredTransactions.length} of {totalCount})</span>
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Fetching double-entry transaction records...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center space-y-4 px-4">
              <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground mx-auto">
                <Layers className="w-7 h-7 text-muted-foreground/60" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">No transactions found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {filterDirection === "SENT"
                    ? "You haven't sent any money yet."
                    : filterDirection === "RECEIVED"
                    ? "You haven't received any transfers yet."
                    : "No ledger records match the selected filter or search query."}
                </p>
              </div>
              {!isSystemUser && (
                <Link
                  href="/transfers"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transfer Funds Now</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* 1. Mobile Responsive Card List View (< md) */}
              <div className="md:hidden divide-y divide-border/30">
                {filteredTransactions.map((tx) => {
                  const info = getCounterpartInfo(tx);
                  const isSent = tx.direction === "SENT";
                  const isReceived = tx.direction === "RECEIVED";
                  const isSelf = tx.direction === "SELF";

                  return (
                    <div
                      key={tx._id}
                      onClick={() => setSelectedTx(tx)}
                      className="p-4 space-y-3 hover:bg-muted/30 transition-colors cursor-pointer active:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSent
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : isReceived
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}
                          >
                            {isSent ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : isReceived ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : isSelf ? (
                              <RotateCcw className="w-5 h-5" />
                            ) : (
                              <Zap className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground line-clamp-1">
                              {info.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {info.label} • Acc {maskAccountNumber(info.accountId)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`text-sm font-extrabold font-mono ${
                              isSent
                                ? "text-rose-400"
                                : isReceived
                                ? "text-emerald-400"
                                : "text-sky-400"
                            }`}
                          >
                            {isSent ? "-" : isReceived ? "+" : ""}
                            {formatCurrency(tx.amount, "INR")}
                          </p>
                          <span className="text-[9px] uppercase font-bold text-muted-foreground font-mono">
                            {tx.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                        <span className="font-mono">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span>View Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Desktop High-Density Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                    <tr>
                      <th className="py-3.5 px-5">Type / Direction</th>
                      <th className="py-3.5 px-5">Counterpart Party</th>
                      <th className="py-3.5 px-5">Source Vault</th>
                      <th className="py-3.5 px-5">Recipient Vault</th>
                      <th className="py-3.5 px-5">Amount (INR)</th>
                      <th className="py-3.5 px-5">Timestamp</th>
                      <th className="py-3.5 px-5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredTransactions.map((tx) => {
                      const info = getCounterpartInfo(tx);
                      const isSent = tx.direction === "SENT";
                      const isReceived = tx.direction === "RECEIVED";
                      const isSelf = tx.direction === "SELF";

                      return (
                        <tr
                          key={tx._id}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={() => setSelectedTx(tx)}
                        >
                          {/* Direction Badge */}
                          <td className="py-4 px-5">
                            {isSent ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                SENT (DEBIT)
                              </span>
                            ) : isReceived ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                RECEIVED (CREDIT)
                              </span>
                            ) : isSelf ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                <RotateCcw className="w-3.5 h-3.5" />
                                VAULT TRANSFER
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                <Zap className="w-3.5 h-3.5" />
                                SYSTEM SEED
                              </span>
                            )}
                          </td>

                          {/* Counterpart */}
                          <td className="py-4 px-5 font-mono">
                            <div className="font-semibold text-foreground">
                              {info.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {info.label} • {maskAccountNumber(info.accountId)}
                            </div>
                          </td>

                          {/* From Account */}
                          <td className="py-4 px-5 font-mono text-[11px] text-muted-foreground">
                            {maskAccountNumber(getAccId(tx.fromAccount))}
                          </td>

                          {/* To Account */}
                          <td className="py-4 px-5 font-mono text-[11px] text-muted-foreground">
                            {maskAccountNumber(getAccId(tx.toAccount))}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-5">
                            <span
                              className={`font-mono text-sm font-extrabold ${
                                isSent
                                  ? "text-rose-400"
                                  : isReceived
                                  ? "text-emerald-400"
                                  : "text-sky-400"
                              }`}
                            >
                              {isSent ? "-" : isReceived ? "+" : ""}
                              {formatCurrency(tx.amount, "INR")}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-4 px-5 text-muted-foreground font-mono text-[11px]">
                            {new Date(tx.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          {/* Action Receipt */}
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTx(tx);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl spatial-glass border border-border/60 text-muted-foreground hover:text-emerald-400 text-[11px] font-semibold transition-colors"
                            >
                              <span>Receipt</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchHistory(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl spatial-glass border border-border/60 text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchHistory(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl spatial-glass border border-border/60 text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Digital Bank Receipt Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
            <div
              className="relative w-full max-w-md rounded-3xl spatial-card border border-border/80 p-6 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Official Bank Receipt
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Double-entry verified & cleared on ledger
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount Banner */}
              <div className="text-center py-4 px-6 rounded-2xl bg-card/60 border border-border/60 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                  {selectedTx.direction === "SENT"
                    ? "Funds Debited (Outflow)"
                    : selectedTx.direction === "RECEIVED"
                    ? "Funds Credited (Inflow)"
                    : "Settlement Amount"}
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold font-mono ${
                    selectedTx.direction === "SENT"
                      ? "text-rose-400"
                      : selectedTx.direction === "RECEIVED"
                      ? "text-emerald-400"
                      : "text-foreground"
                  }`}
                >
                  {selectedTx.direction === "SENT" ? "-" : selectedTx.direction === "RECEIVED" ? "+" : ""}
                  {formatCurrency(selectedTx.amount, "INR")}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  Status: {selectedTx.status}
                </div>
              </div>

              {/* Key details list */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-foreground text-[11px]">
                      {maskAccountNumber(selectedTx._id)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTx._id, "Transaction ID")}
                      className="text-muted-foreground hover:text-emerald-400 p-0.5"
                    >
                      {copiedId === "Transaction ID" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Source Vault (Debit)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-foreground text-[11px]">
                      {maskAccountNumber(getAccId(selectedTx.fromAccount))}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(getAccId(selectedTx.fromAccount), "Source Vault")}
                      className="text-muted-foreground hover:text-emerald-400 p-0.5"
                    >
                      {copiedId === "Source Vault" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Recipient Vault (Credit)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-foreground text-[11px]">
                      {maskAccountNumber(getAccId(selectedTx.toAccount))}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(getAccId(selectedTx.toAccount), "Recipient Vault")}
                      className="text-muted-foreground hover:text-emerald-400 p-0.5"
                    >
                      {copiedId === "Recipient Vault" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Timestamp (IST)</span>
                  <span className="font-mono text-muted-foreground text-[11px]">
                    {new Date(selectedTx.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Idempotency Key (RFC 4122 v4)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTx.idempotencyKey, "Idempotency Key")}
                      className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      {copiedId === "Idempotency Key" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground break-all block select-all">
                    {selectedTx.idempotencyKey}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
