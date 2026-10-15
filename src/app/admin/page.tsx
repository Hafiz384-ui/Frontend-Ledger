"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Terminal,
  Banknote,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  Database,
  Zap,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { SystemRoute } from "@/components/auth/SystemRoute";
import { generateIdempotencyKey, isValidObjectId } from "@/lib/idempotency";
import { apiClient } from "@/lib/api";
import { toast } from "@/store/useToastStore";
import { Skeleton } from "@/components/ui/SkeletonLoaders";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SeedFundsPayload {
  toAccount: string;
  amount: number;
  idempotencyKey: string;
}

interface SeedFundsResponse {
  message: string;
  transaction?: {
    _id: string;
    toAccount: string;
    amount: number;
    type: string;
    status: string;
    idempotencyKey: string;
    createdAt: string;
  };
}

// ---------------------------------------------------------------------------
// Helper: Format INR
// ---------------------------------------------------------------------------
function formatINR(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
}

// ---------------------------------------------------------------------------
// Sub-component: Stat Card
// ---------------------------------------------------------------------------
function AdminStatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className={`spatial-card rounded-2xl p-5 border ${accent} flex items-start gap-4`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent.replace("border-", "bg-").replace("/30", "/10")}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground tracking-wider uppercase">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Seed Funds Form
// ---------------------------------------------------------------------------
function SeedFundsForm() {
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    txId?: string;
  } | null>(null);

  // Validation state
  const [accountError, setAccountError] = useState("");
  const [amountError, setAmountError] = useState("");

  // Generate a fresh idempotency key on mount
  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

  const regenerateKey = useCallback(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

  const copyKey = useCallback(() => {
    navigator.clipboard.writeText(idempotencyKey).then(() => {
      toast.info("Idempotency key copied to clipboard.", "Copied");
    });
  }, [idempotencyKey]);

  const validateFields = (): boolean => {
    let valid = true;
    setAccountError("");
    setAmountError("");

    if (!toAccount.trim()) {
      setAccountError("Target account ID is required.");
      valid = false;
    } else if (!isValidObjectId(toAccount.trim())) {
      setAccountError("Must be a valid 24-character MongoDB ObjectId.");
      valid = false;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Amount must be a positive number.");
      valid = false;
    } else if (parsedAmount > 10_000_000) {
      setAmountError("Maximum seed amount is ₹1,00,00,000 per operation.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsSubmitting(true);
    setLastResult(null);

    const payload: SeedFundsPayload = {
      toAccount: toAccount.trim(),
      amount: parseFloat(amount),
      idempotencyKey,
    };

    try {
      const response = await apiClient.post<SeedFundsResponse>(
        "/api/transactions/system/initial-funds",
        payload
      );

      const txId = response.data.transaction?._id;
      setLastResult({
        success: true,
        message:
          response.data.message ||
          `Successfully credited ${formatINR(payload.amount)} to account.`,
        txId,
      });

      toast.success(
        `${formatINR(payload.amount)} seeded to ${toAccount.slice(0, 8)}…${toAccount.slice(-4)} — Transaction confirmed.`,
        "Funds Seeded ✓"
      );

      // Reset form and generate new idempotency key for next operation
      setToAccount("");
      setAmount("");
      setIdempotencyKey(generateIdempotencyKey());
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }> & {
        status?: number;
      };
      const status =
        axiosErr.status ||
        (axiosErr as { response?: { status: number } }).response?.status ||
        500;
      const message =
        axiosErr.message ||
        (err instanceof Error ? err.message : "An unexpected error occurred.");

      let userMessage = message;
      if (status === 403) {
        userMessage =
          "Access denied. Only system users can seed initial funds.";
      } else if (status === 400) {
        userMessage = message || "Invalid account ID or missing required fields.";
      } else if (status === 404) {
        userMessage = "Target account not found. Please verify the Account ID.";
      } else if (status === 409) {
        userMessage =
          "Duplicate transaction detected. This idempotency key has already been used.";
        // Regenerate for them on idempotency conflict
        setIdempotencyKey(generateIdempotencyKey());
      }

      setLastResult({ success: false, message: userMessage });
      toast.error(userMessage, `Seed Failed (${status})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="seed-funds-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      {/* Target Account */}
      <div className="space-y-2">
        <label
          htmlFor="seed-to-account"
          className="flex items-center gap-2 text-xs font-semibold text-foreground/90 uppercase tracking-wider"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          Target Account ID
          <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            id="seed-to-account"
            type="text"
            value={toAccount}
            onChange={(e) => {
              setToAccount(e.target.value);
              if (accountError) setAccountError("");
            }}
            placeholder="e.g. 507f1f77bcf86cd799439011"
            maxLength={24}
            className={`w-full px-4 py-3 rounded-xl border bg-card/40 text-sm font-mono placeholder:text-muted-foreground/40 text-foreground
              focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all
              ${accountError ? "border-rose-500/60 focus:ring-rose-500/30" : "border-border/60 hover:border-border focus:border-emerald-500/50"}`}
            disabled={isSubmitting}
            autoComplete="off"
            spellCheck={false}
          />
          {toAccount.length > 0 && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium ${
                toAccount.length === 24
                  ? "text-emerald-400"
                  : "text-muted-foreground/50"
              }`}
            >
              {toAccount.length}/24
            </span>
          )}
        </div>
        {accountError && (
          <p className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {accountError}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          Enter the recipient&apos;s MongoDB ObjectId (24 hex characters). This
          account will receive the seeded funds.
        </p>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label
          htmlFor="seed-amount"
          className="flex items-center gap-2 text-xs font-semibold text-foreground/90 uppercase tracking-wider"
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          Seed Amount (INR — ₹)
          <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
            ₹
          </span>
          <input
            id="seed-amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (amountError) setAmountError("");
            }}
            placeholder="0.00"
            min={1}
            max={10000000}
            step={0.01}
            className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-card/40 text-sm font-semibold placeholder:text-muted-foreground/40 text-foreground
              focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all
              ${amountError ? "border-rose-500/60 focus:ring-rose-500/30" : "border-border/60 hover:border-border focus:border-emerald-500/50"}`}
            disabled={isSubmitting}
          />
          {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-emerald-400 font-medium">
              {formatINR(parseFloat(amount))}
            </span>
          )}
        </div>
        {amountError && (
          <p className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {amountError}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/60">
          Maximum per operation: ₹1,00,00,000
        </p>
      </div>

      {/* Idempotency Key (read-only + refresh/copy) */}
      <div className="space-y-2">
        <label
          htmlFor="seed-idempotency-key"
          className="flex items-center gap-2 text-xs font-semibold text-foreground/90 uppercase tracking-wider"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Idempotency Key
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
            Auto-generated
          </span>
        </label>
        <div className="flex gap-2">
          <input
            id="seed-idempotency-key"
            type="text"
            value={idempotencyKey}
            readOnly
            className="flex-1 px-4 py-3 rounded-xl border border-border/40 bg-muted/30 text-xs font-mono text-muted-foreground cursor-default select-all tracking-wider"
          />
          <button
            type="button"
            onClick={copyKey}
            title="Copy key"
            className="px-3 py-3 rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={regenerateKey}
            title="Regenerate key"
            className="px-3 py-3 rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground/60 leading-relaxed">
          <Info className="w-3 h-3 mt-0.5 shrink-0 text-sky-400/60" />
          UUID v4 auto-generated via Web Crypto API. Ensures exactly-once
          delivery and prevents duplicate fund seeding.
        </p>
      </div>

      {/* Result Banner */}
      {lastResult && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border animate-fadeIn ${
            lastResult.success
              ? "bg-emerald-950/30 border-emerald-500/25 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/25 text-rose-300"
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          )}
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-semibold">
              {lastResult.success ? "Transaction Confirmed" : "Operation Failed"}
            </p>
            <p className="text-[11px] opacity-80 leading-relaxed">
              {lastResult.message}
            </p>
            {lastResult.txId && (
              <p className="text-[10px] font-mono opacity-60 mt-1 truncate">
                TX ID: {lastResult.txId}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="seed-funds-submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl
          bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500
          text-sm font-bold text-slate-950 tracking-wide
          shadow-spatial-glow-emerald hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.6)]
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          hover:scale-[1.01] active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Seed Transaction…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Seed Initial Funds
          </>
        )}
      </button>

      {/* Warning notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300/80 leading-relaxed">
          <strong className="text-amber-300">Warning:</strong> This operation
          injects real ledger value into the specified account. All system-level
          transactions are permanently recorded and audited. Proceed with
          caution.
        </p>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Admin Panel Skeleton
// ---------------------------------------------------------------------------
function AdminPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="w-48 h-5" />
        <Skeleton className="w-80 h-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Admin Page
// ---------------------------------------------------------------------------
function AdminPanelContent() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const now = new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <AdminPageSkeleton />;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
          <Terminal className="w-3 h-3" />
          <span>System</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-400 font-medium">Admin Panel</span>
        </div>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-orange-400 p-[1.5px] shadow-[0_0_20px_-5px_rgba(244,63,94,0.5)]">
                <div className="w-full h-full rounded-[10px] bg-background/90 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  System Admin Panel
                </h1>
                <p className="text-[11px] text-muted-foreground/60 font-mono tracking-wider mt-0.5">
                  RESTRICTED — SYSTEM OPERATOR CONSOLE
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Privileged system-level operations for AURA Banking Network
              administrators. Actions performed here are immutably logged on the
              double-entry ledger.
            </p>
          </div>

          {/* Session badge */}
          <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-semibold text-rose-400">
              <Shield className="w-3.5 h-3.5" />
              System Operator
            </div>
            <p className="text-[10px] text-muted-foreground/50 font-mono">
              {user?.username} · {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          icon={Shield}
          label="Access Level"
          value="System Operator"
          accent="border-rose-500/30 text-rose-400"
        />
        <AdminStatCard
          icon={Clock}
          label="Session Time (IST)"
          value={now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
          accent="border-sky-500/30 text-sky-400"
        />
        <AdminStatCard
          icon={Zap}
          label="API Endpoint"
          value="POST /api/transactions/system/initial-funds"
          accent="border-amber-500/30 text-amber-400"
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Seed Funds Form — takes 3 cols */}
        <div className="lg:col-span-3 spatial-card rounded-2xl border border-border/60 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-r from-card/80 to-emerald-950/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Banknote className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Seed Initial Funds
                </h2>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Inject initial capital into any user account
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <SeedFundsForm />
          </div>
        </div>

        {/* Info sidebar — takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Operation Guide */}
          <div className="spatial-card rounded-2xl border border-border/60 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Operation Guide
            </h3>
            <ul className="space-y-3">
              {[
                {
                  step: "01",
                  title: "Find Account ID",
                  desc: "Locate the recipient's 24-char MongoDB ObjectId from the user management console.",
                },
                {
                  step: "02",
                  title: "Set Amount",
                  desc: "Enter the seed amount in INR. Max ₹1 crore per single operation.",
                },
                {
                  step: "03",
                  title: "Verify Key",
                  desc: "The UUID v4 idempotency key is auto-generated. Regenerate if retrying a failed op.",
                },
                {
                  step: "04",
                  title: "Submit & Audit",
                  desc: "Submit to credit funds. The transaction is permanently recorded in the ledger.",
                },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex gap-3 text-xs">
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                    {step}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground/90">{title}</p>
                    <p className="text-muted-foreground/60 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Notice */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400/80 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Security Notice
            </h3>
            <ul className="space-y-2">
              {[
                "All fund seedings are cryptographically logged.",
                "Idempotency keys prevent duplicate transactions.",
                "This panel is inaccessible to standard users.",
                "Unauthorized access attempts are flagged.",
              ].map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2 text-[11px] text-rose-300/70 leading-relaxed"
                >
                  <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* API Reference */}
          <div className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              API Reference
            </h3>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex gap-2">
                <span className="text-amber-400 font-bold">POST</span>
                <span className="text-foreground/70 break-all">
                  /api/transactions/system/initial-funds
                </span>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-muted-foreground/60">
                <p>
                  <span className="text-sky-400">toAccount</span>: ObjectId
                  (string)
                </p>
                <p>
                  <span className="text-sky-400">amount</span>: number (INR)
                </p>
                <p>
                  <span className="text-sky-400">idempotencyKey</span>: UUID v4
                </p>
              </div>
              <div className="space-y-1 text-muted-foreground/50">
                <p>
                  <span className="text-emerald-400">201</span> — Funds credited
                  successfully
                </p>
                <p>
                  <span className="text-rose-400">400</span> — Invalid payload
                </p>
                <p>
                  <span className="text-rose-400">403</span> — Access denied
                </p>
                <p>
                  <span className="text-rose-400">500</span> — Server error
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export — wrapped in SystemRoute guard
// ---------------------------------------------------------------------------
export default function AdminPage() {
  return (
    <SystemRoute>
      <AdminPanelContent />
    </SystemRoute>
  );
}
