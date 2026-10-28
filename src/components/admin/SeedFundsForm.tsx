"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Banknote,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { seedFundsSchema, type SeedFundsFormData } from "@/schemas/transaction.schema";
import { transactionService } from "@/services/transaction.service";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { toast } from "@/store/useToastStore";
import type { AxiosError } from "axios";

function formatINR(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Enterprise Seed Funds Form Component
 * Strictly validated with Yup and wired to transactionService.seedInitialFunds
 */
export const SeedFundsForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    txId?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeedFundsFormData>({
    resolver: yupResolver(seedFundsSchema),
    defaultValues: {
      toAccount: "",
      amount: undefined,
      idempotencyKey: "",
    },
  });

  const amountValue = watch("amount");
  const idempotencyKeyValue = watch("idempotencyKey");

  // Generate initial idempotency key on mount
  useEffect(() => {
    setValue("idempotencyKey", generateIdempotencyKey());
  }, [setValue]);

  const regenerateKey = useCallback(() => {
    const newKey = generateIdempotencyKey();
    setValue("idempotencyKey", newKey);
    toast.info("Generated new UUID v4 idempotency key.", "Refreshed");
  }, [setValue]);

  const copyKey = useCallback(() => {
    if (idempotencyKeyValue) {
      navigator.clipboard.writeText(idempotencyKeyValue).then(() => {
        toast.info("Idempotency key copied to clipboard.", "Copied");
      });
    }
  }, [idempotencyKeyValue]);

  const onSubmit = async (data: SeedFundsFormData) => {
    const amountStr = String(data.amount).trim();
    if (!/^[1-9]\d*(\.\d+)?$/.test(amountStr) || Number(amountStr) < 1) {
      toast.error(
        "Amount must start with 1 or greater and cannot start with 0.",
        "Validation Failed"
      );
      return;
    }

    setIsSubmitting(true);
    setLastResult(null);

    try {
      const response = await transactionService.seedInitialFunds({
        toAccount: data.toAccount.trim(),
        amount: Number(amountStr),
        idempotencyKey: data.idempotencyKey,
      });

      const txId = (response.transaction as { _id?: string })?._id;
      setLastResult({
        success: true,
        message:
          response.message ||
          `Successfully credited ${formatINR(Number(amountStr))} to account.`,
        txId,
      });

      toast.success(
        `Credited ${formatINR(Number(amountStr))} to ${data.toAccount.slice(0, 8)}...`,
        "Funds Seeded"
      );

      // Auto-regenerate idempotency key for subsequent operations
      setValue("idempotencyKey", generateIdempotencyKey());
      setValue("amount", undefined as unknown as number);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr.response?.status;
      const serverMsg =
        axiosErr.response?.data?.message || (err as Error).message || "Operation failed.";

      let displayMsg = serverMsg;
      if (status === 403) {
        displayMsg = "Access Denied: Only system operators can seed funds.";
      } else if (status === 404) {
        displayMsg = "Target account does not exist in the database.";
      } else if (status === 409) {
        displayMsg = "Transaction already processed with this idempotency key. Generated a new key.";
        regenerateKey();
      }

      setLastResult({
        success: false,
        message: displayMsg,
      });

      toast.error(displayMsg, "Seed Operation Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Target Account Field */}
      <div className="space-y-2">
        <label
          htmlFor="toAccount"
          className="flex items-center gap-2 text-xs font-semibold text-foreground/90 uppercase tracking-wider"
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          Target Account ID
          <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            id="toAccount"
            type="text"
            {...register("toAccount")}
            placeholder="e.g. 64aef1234567890abcdef123"
            maxLength={24}
            className={`w-full px-4 py-3 rounded-xl border bg-card/40 text-sm font-mono placeholder:text-muted-foreground/40 text-foreground
              focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all
              ${
                errors.toAccount
                  ? "border-rose-500/60 focus:ring-rose-500/30"
                  : "border-border/60 hover:border-border focus:border-emerald-500/50"
              }`}
            disabled={isSubmitting}
          />
        </div>
        {errors.toAccount && (
          <p className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors.toAccount.message}
          </p>
        )}
      </div>

      {/* Amount Field */}
      <div className="space-y-2">
        <label
          htmlFor="amount"
          className="flex items-center gap-2 text-xs font-semibold text-foreground/90 uppercase tracking-wider"
        >
          <span>₹</span>
          Seed Amount (INR)
          <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
            ₹
          </span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            {...register("amount")}
            placeholder="e.g. 5000"
            className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-card/40 text-sm font-semibold placeholder:text-muted-foreground/40 text-foreground
              focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all
              ${
                errors.amount
                  ? "border-rose-500/60 focus:ring-rose-500/30"
                  : "border-border/60 hover:border-border focus:border-emerald-500/50"
              }`}
            disabled={isSubmitting}
          />
          {amountValue &&
            !isNaN(Number(amountValue)) &&
            Number(amountValue) > 0 &&
            /^[1-9]\d*(\.\d+)?$/.test(String(amountValue).trim()) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-emerald-400 font-medium">
                {formatINR(Number(amountValue))}
              </span>
            )}
        </div>
        {errors.amount && (
          <p className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors.amount.message}
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
            {...register("idempotencyKey")}
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
          UUID v4 auto-generated via Web Crypto API. Ensures exactly-once delivery and prevents duplicate fund seeding.
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
          <strong className="text-amber-300">Warning:</strong> This operation injects real ledger value into the specified account. All system-level transactions are permanently recorded and audited. Proceed with caution.
        </p>
      </div>
    </form>
  );
};

export default SeedFundsForm;
