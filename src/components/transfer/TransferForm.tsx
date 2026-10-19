"use client";

import React, { useState, useEffect, useId } from "react";
import {
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Send,
  ClipboardPaste,
  Wallet,
  Sparkles,
  ArrowUpRight,
  Layers,
  HelpCircle,
  RotateCcw,
  Loader2,
  FileText,
  TerminalSquare,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccountStore } from "@/store/useAccountStore";
import { toast } from "@/store/useToastStore";
import { transactionApi } from "@/lib/api";
import { generateIdempotencyKey, isValidObjectId } from "@/lib/idempotency";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type { Account } from "@/types/account";
import type { Transaction } from "@/types/transaction";

interface TransferFormProps {
  initialFromAccountId?: string;
  onSuccess?: (transaction: Transaction) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function TransferForm({
  initialFromAccountId,
  onSuccess,
  onCancel,
  isModal = false,
}: TransferFormProps) {
  const { user } = useAuthStore();
  const isSystemUser = Boolean(user?.systemUser);

  const {
    accounts,
    activeAccount,
    balances,
    fetchAccounts,
    fetchBalance,
    isLoading: isStoreLoading,
  } = useAccountStore();

  // Form Fields
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Idempotency Key State
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Status & Validation States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<number | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Success Receipt State
  const [completedTransaction, setCompletedTransaction] = useState<{
    txId: string;
    fromAccount: string;
    toAccount: string;
    amount: number;
    idempotencyKey: string;
    timestamp: string;
  } | null>(null);

  // Initialize Idempotency Key and default source account
  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

  // Set default fromAccount on mount or when accounts change
  useEffect(() => {
    if (initialFromAccountId) {
      setFromAccount(initialFromAccountId);
      return;
    }
    if (!fromAccount && accounts.length > 0) {
      const preferred =
        activeAccount && activeAccount.status === "ACTIVE"
          ? activeAccount._id
          : accounts.find((a) => a.status === "ACTIVE")?._id || accounts[0]._id;
      setFromAccount(preferred);
    }
  }, [accounts, activeAccount, initialFromAccountId, fromAccount]);

  // Ensure balance for selected source account is loaded
  useEffect(() => {
    if (fromAccount && balances[fromAccount] === undefined) {
      fetchBalance(fromAccount);
    }
  }, [fromAccount, balances, fetchBalance]);

  // Selected sender account object and balance
  const selectedAccount: Account | undefined = accounts.find(
    (a) => a._id === fromAccount
  );
  const availableBalance =
    selectedAccount && balances[selectedAccount._id] !== undefined
      ? balances[selectedAccount._id]
      : 0;

  const numericAmount = parseFloat(amount) || 0;
  const remainingBalance = availableBalance - numericAmount;

  // Handle regenerating a new idempotency key manually or after conflict
  const handleRegenerateKey = () => {
    const newKey = generateIdempotencyKey();
    setIdempotencyKey(newKey);
    setServerError(null);
    setServerStatus(null);
    toast.info("A new unique Idempotency Key has been generated.", "Key Refreshed");
  };

  // Copy idempotency key to clipboard
  const handleCopyKey = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(idempotencyKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.info("Idempotency Key copied to clipboard.");
    }
  };

  // Paste recipient ID from clipboard
  const handlePasteRecipient = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        const trimmed = text.trim();
        setToAccount(trimmed);
        validateField("toAccount", trimmed);
        toast.info("Recipient Account ID pasted from clipboard.");
      }
    } catch {
      toast.warning("Clipboard access denied. Please paste manually.", "Notice");
    }
  };

  // Quick Amount Selectors
  const quickAmounts = [500, 1000, 5000, 10000];
  const handleSetQuickAmount = (val: number) => {
    setAmount(val.toString());
    validateField("amount", val.toString());
  };

  const handleSetMaxAmount = () => {
    if (availableBalance > 0) {
      setAmount(availableBalance.toString());
      validateField("amount", availableBalance.toString());
    }
  };

  // Field Level Validation
  const validateField = (field: string, value: string): boolean => {
    const errors = { ...clientErrors };

    if (field === "fromAccount") {
      const acc = accounts.find((a) => a._id === value);
      if (!value) {
        errors.fromAccount = "Please select a source account";
      } else if (!acc) {
        errors.fromAccount = "Selected source account not found";
      } else if (acc.status !== "ACTIVE") {
        errors.fromAccount = `Account is ${acc.status}. Only ACTIVE accounts can transfer funds.`;
      } else {
        delete errors.fromAccount;
      }
    }

    if (field === "toAccount") {
      const trimmed = value.trim();
      if (!trimmed) {
        errors.toAccount = "Recipient account ID is required";
      } else if (trimmed === fromAccount) {
        errors.toAccount = "Sender and recipient accounts cannot be identical";
      } else if (!isValidObjectId(trimmed)) {
        errors.toAccount = "Recipient must be a valid 24-character hexadecimal Account ID";
      } else {
        delete errors.toAccount;
      }
    }

    if (field === "amount") {
      const val = parseFloat(value);
      if (!value || isNaN(val)) {
        errors.amount = "Please enter a valid amount";
      } else if (val < 1) {
        errors.amount = "Amount must be at least ₹1";
      } else if (val > availableBalance) {
        errors.amount = `Insufficient ledger funds. Available balance: ${formatCurrency(
          availableBalance,
          selectedAccount?.currency || "INR"
        )}`;
      } else {
        delete errors.amount;
      }
    }

    setClientErrors(errors);
    return !errors[field];
  };

  // Comprehensive Form Validation before submit
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. All fields filled
    if (!fromAccount) {
      errors.fromAccount = "Source account is required";
    } else {
      const acc = accounts.find((a) => a._id === fromAccount);
      if (!acc) {
        errors.fromAccount = "Invalid source account";
      } else if (acc.status !== "ACTIVE") {
        errors.fromAccount = `Source account is ${acc.status}. Only ACTIVE accounts can send money.`;
      }
    }

    if (!toAccount.trim()) {
      errors.toAccount = "Recipient account ID is required";
    } else if (toAccount.trim() === fromAccount) {
      errors.toAccount = "Sender and recipient accounts cannot be identical";
    } else if (!isValidObjectId(toAccount.trim())) {
      errors.toAccount = "Recipient must be a 24-character hexadecimal Account ID";
    }

    const val = parseFloat(amount);
    if (!amount || isNaN(val)) {
      errors.amount = "Transfer amount is required";
    } else if (val < 1) {
      errors.amount = "Minimum transfer amount is ₹1";
    } else if (val > availableBalance) {
      errors.amount = `Insufficient ledger balance. Available: ${formatCurrency(
        availableBalance,
        selectedAccount?.currency || "INR"
      )}`;
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form to clean state
  const handleResetForm = () => {
    setAmount("");
    setToAccount("");
    setNote("");
    setClientErrors({});
    setServerError(null);
    setServerStatus(null);
    setPendingNotice(null);
    setInfoNotice(null);
    setCompletedTransaction(null);
    // Automatically generate a fresh idempotency key
    setIdempotencyKey(generateIdempotencyKey());
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerStatus(null);
    setPendingNotice(null);
    setInfoNotice(null);

    // Frontend validations
    if (!validateForm()) {
      toast.warning("Please resolve form validation issues before submitting.", "Form Incomplete");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fromAccount: fromAccount.trim(),
        toAccount: toAccount.trim(),
        amount: parseFloat(amount),
        idempotencyKey: idempotencyKey.trim(),
      };

      const response = await transactionApi.createTransaction(payload);
      const status = response.status;
      const data = response.data;

      // Handle 201 (COMPLETED)
      if (status === 201) {
        const tx = (data.transaction || data) as Transaction;
        const txId = tx._id || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        setCompletedTransaction({
          txId,
          fromAccount,
          toAccount: toAccount.trim(),
          amount: parseFloat(amount),
          idempotencyKey,
          timestamp: new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "medium",
          }),
        });

        toast.success(
          `Successfully transferred ${formatCurrency(
            parseFloat(amount),
            "INR"
          )} to Account ${maskAccountNumber(toAccount)}.`,
          "Transaction Completed"
        );

        // Update account balances in store
        await Promise.all([
          fetchBalance(fromAccount),
          fetchAccounts(),
        ]);

        if (onSuccess && tx) {
          onSuccess(tx);
        }

        // Generate next key for subsequent transfers
        setIdempotencyKey(generateIdempotencyKey());
      }
      // Handle 200 (Already Completed)
      else if (status === 200) {
        setInfoNotice(
          data.message ||
            "This transaction was already completed with this idempotency key. No duplicate debit occurred."
        );
        toast.info("This transaction was already completed.", "Duplicate Handled");

        // Refresh balance and prepare new key
        await fetchBalance(fromAccount);
        setIdempotencyKey(generateIdempotencyKey());
      }
      // Handle 202 (PENDING)
      else if (status === 202) {
        setPendingNotice(
          data.message ||
            "Your transaction is currently being processed by the double-entry ledger. Please allow a few moments for final clearance."
        );
        toast.info("Your transaction is being processed...", "Pending Clearance");

        await fetchBalance(fromAccount);
        setIdempotencyKey(generateIdempotencyKey());
      } else {
        toast.info(`Transaction response status: ${status}`, "Server Notification");
      }
    } catch (err: unknown) {
      const errorObj = err as {
        status?: number;
        message?: string;
        data?: { message?: string };
      };
      const statusCode = errorObj.status || 500;
      const errorMessage =
        errorObj.data?.message ||
        errorObj.message ||
        "An unexpected error occurred during the transfer.";

      setServerStatus(statusCode);

      // Handle 400 (Insufficient Balance / Inactive Account / Missing Fields)
      if (statusCode === 400) {
        setServerError(
          errorMessage || "Invalid transaction request. Please verify account balances and statuses."
        );
        toast.error(errorMessage, "Transfer Rejected (400)");
      }
      // Handle 409 (Duplicate/Failed Key)
      else if (statusCode === 409) {
        // Automatically generate a new idempotency key
        const freshKey = generateIdempotencyKey();
        setIdempotencyKey(freshKey);

        const conflictMsg =
          "Idempotency conflict detected (409): The previous request key was already processed or failed. A new unique key has been automatically generated. Please retry now.";
        setServerError(conflictMsg);
        toast.warning(conflictMsg, "Key Conflict — Ready to Retry");
      }
      // Handle 500 / Network Error
      else {
        const fallbackMsg =
          statusCode === 0
            ? "Banking server unreachable. Please check your network connection."
            : errorMessage || "Internal ledger error. Please try again or contact support.";
        setServerError(fallbackMsg);
        toast.error(fallbackMsg, "System Error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN / RECEIPT MODAL
  if (completedTransaction) {
    return (
      <div className="relative rounded-3xl spatial-glass p-6 sm:p-8 border border-emerald-500/40 shadow-2xl animate-scaleIn space-y-6">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-spatial-glow-emerald">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-wide uppercase">
            Ledger Verified & Cleared
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Transfer Successful
          </h2>
          <p className="text-xs text-muted-foreground">
            Funds have been debited and balanced in the double-entry core.
          </p>
        </div>

        {/* Amount Badge */}
        <div className="text-center py-4 px-6 rounded-2xl bg-card/60 border border-border/60">
          <span className="text-xs text-muted-foreground block font-medium">Amount Transferred</span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight mt-1">
            {formatCurrency(completedTransaction.amount, "INR")}
          </div>
        </div>

        {/* Transaction Receipt Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-muted-foreground">Transaction Reference</span>
            <span className="font-mono font-semibold text-foreground select-all">
              {completedTransaction.txId}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-muted-foreground">Debited From Account</span>
            <span className="font-mono font-semibold text-foreground">
              {maskAccountNumber(completedTransaction.fromAccount)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-muted-foreground">Credited Recipient</span>
            <span className="font-mono font-semibold text-foreground">
              {maskAccountNumber(completedTransaction.toAccount)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-muted-foreground">Timestamp</span>
            <span className="font-mono text-muted-foreground">
              {completedTransaction.timestamp}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Idempotency Key</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Guaranteed Unique
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground break-all block select-all">
              {completedTransaction.idempotencyKey}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Make Another Transfer</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl spatial-glass border border-border/80 text-xs font-semibold text-foreground hover:bg-muted/60 transition-all"
            >
              <span>Done</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl spatial-glass p-6 sm:p-8 border border-border/80 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-spatial-glow-emerald">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Peer-to-Peer Transfer
            </h2>
            <p className="text-xs text-muted-foreground">
              Instant double-entry transaction with cryptographic idempotency
            </p>
          </div>
        </div>

        {/* Idempotency Protection Indicator Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Idempotent Flow</span>
        </div>
      </div>

      {/* Server Notice Banners */}
      {infoNotice && (
        <div className="p-4 rounded-2xl border border-sky-500/40 bg-sky-500/10 text-sky-200 text-xs flex items-start space-x-3 animate-fadeIn">
          <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Duplicate Transaction Handled (200)</span>
            <p className="leading-relaxed">{infoNotice}</p>
          </div>
        </div>
      )}

      {pendingNotice && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs flex items-start space-x-3 animate-fadeIn">
          <Loader2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
          <div className="space-y-1">
            <span className="font-bold block">Transaction Processing (202 PENDING)</span>
            <p className="leading-relaxed">{pendingNotice}</p>
          </div>
        </div>
      )}

      {serverError && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 animate-fadeIn ${
            serverStatus === 409
              ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          {serverStatus === 409 ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 flex-1">
            <span className="font-bold block">
              {serverStatus === 409
                ? "Conflict Detected (409)"
                : serverStatus === 400
                ? "Validation Failed (400)"
                : "Transfer Error"}
            </span>
            <p className="leading-relaxed">{serverError}</p>
            {serverStatus === 409 && (
              <span className="text-[11px] text-amber-300 font-semibold block mt-1">
                ✓ A new Idempotency Key has been generated automatically. You can safely retry.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Transfer Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Source Account (fromAccount) Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/90 flex items-center space-x-1.5">
              <span>Source Account</span>
              <span className="text-rose-500">*</span>
            </label>
            {selectedAccount && (
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(availableBalance, selectedAccount.currency || "INR")}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <select
              value={fromAccount}
              onChange={(e) => {
                setFromAccount(e.target.value);
                validateField("fromAccount", e.target.value);
              }}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-2xl spatial-glass text-xs font-mono border appearance-none transition-all outline-none focus:ring-2 ${
                clientErrors.fromAccount
                  ? "border-rose-500/60 focus:ring-rose-500/30"
                  : "border-border/70 hover:border-border focus:ring-emerald-500/40"
              }`}
            >
              {accounts.length === 0 ? (
                <option value="">No accounts available</option>
              ) : (
                accounts.map((acc) => {
                  const bal = balances[acc._id] ?? 0;
                  return (
                    <option key={acc._id} value={acc._id} className="bg-card text-foreground">
                      Account {maskAccountNumber(acc._id)} ({acc.status}) — Balance: ₹
                      {bal.toLocaleString("en-IN")}
                    </option>
                  );
                })
              )}
            </select>

            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted-foreground">
              <Layers className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Account Status Indicator */}
          {selectedAccount && (
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-muted-foreground font-mono">
                Full ID: <span className="select-all text-foreground">{selectedAccount._id}</span>
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase border ${
                  selectedAccount.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : selectedAccount.status === "FROZEN"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {selectedAccount.status}
              </span>
            </div>
          )}

          {clientErrors.fromAccount && (
            <p className="text-xs text-rose-400 flex items-center space-x-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{clientErrors.fromAccount}</span>
            </p>
          )}
        </div>

        {/* Recipient Account (toAccount) Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/90 flex items-center space-x-1.5">
              <span>Recipient Account ID</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              24-character hexadecimal ObjectId
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={toAccount}
              onChange={(e) => {
                const val = e.target.value.trim();
                setToAccount(val);
                validateField("toAccount", val);
              }}
              placeholder="e.g. 68f812a9c510b64d081e2891"
              disabled={isSubmitting}
              className={`w-full pl-4 pr-24 py-3 rounded-2xl spatial-glass text-xs font-mono border transition-all outline-none focus:ring-2 ${
                clientErrors.toAccount
                  ? "border-rose-500/60 focus:ring-rose-500/30"
                  : "border-border/70 hover:border-border focus:ring-emerald-500/40"
              }`}
            />

            {/* Paste Button & Clean Action */}
            <div className="absolute right-2 flex items-center space-x-1">
              {toAccount && (
                <button
                  type="button"
                  onClick={() => {
                    setToAccount("");
                    validateField("toAccount", "");
                  }}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Clear recipient"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePasteRecipient}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl spatial-glass border border-border/80 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>
          </div>

          {clientErrors.toAccount && (
            <p className="text-xs text-rose-400 flex items-center space-x-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{clientErrors.toAccount}</span>
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/90 flex items-center space-x-1.5">
              <span>Transfer Amount (INR — ₹)</span>
              <span className="text-rose-500">*</span>
            </label>

            {/* Live Remaining Balance Calculation */}
            {numericAmount > 0 && (
              <span
                className={`text-[11px] font-mono font-medium ${
                  remainingBalance < 0
                    ? "text-rose-400"
                    : remainingBalance === 0
                    ? "text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                Remaining: {formatCurrency(Math.max(0, remainingBalance), "INR")}
              </span>
            )}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-bold text-emerald-400">
              ₹
            </span>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                validateField("amount", e.target.value);
              }}
              placeholder="0.00"
              disabled={isSubmitting}
              className={`w-full pl-9 pr-4 py-3 rounded-2xl spatial-glass text-base font-mono font-extrabold border transition-all outline-none focus:ring-2 ${
                clientErrors.amount
                  ? "border-rose-500/60 focus:ring-rose-500/30"
                  : "border-border/70 hover:border-border focus:ring-emerald-500/40"
              }`}
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSetQuickAmount(q)}
                disabled={isSubmitting || q > availableBalance}
                className="px-2.5 py-1 rounded-xl spatial-glass border border-border/60 text-[11px] font-mono font-semibold text-muted-foreground hover:text-foreground hover:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                +₹{q.toLocaleString("en-IN")}
              </button>
            ))}

            <button
              type="button"
              onClick={handleSetMaxAmount}
              disabled={isSubmitting || availableBalance <= 0}
              className="px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-mono font-bold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              MAX (₹{availableBalance.toLocaleString("en-IN")})
            </button>
          </div>

          {clientErrors.amount && (
            <p className="text-xs text-rose-400 flex items-center space-x-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{clientErrors.amount}</span>
            </p>
          )}
        </div>

        {/* Optional Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Transfer Memo / Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Invoice settlement, Rent, Dinner split"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-2xl spatial-glass text-xs border border-border/70 hover:border-border outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {/* Cryptographic Idempotency Key Strip */}
        <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-foreground">
                Idempotency Protection (RFC 4122 v4)
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleCopyKey}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Copy Idempotency Key"
              >
                {copiedKey ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleRegenerateKey}
                disabled={isSubmitting}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
                title="Generate new Idempotency Key"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span className="truncate pr-2 select-all">{idempotencyKey || "Generating key..."}</span>
            <span className="text-[10px] text-emerald-400 font-semibold shrink-0">Auto-Guarded</span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-2xl spatial-glass border border-border/80 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              accounts.length === 0 ||
              selectedAccount?.status !== "ACTIVE" ||
              availableBalance <= 0
            }
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <>
                <span>Send {numericAmount > 0 ? formatCurrency(numericAmount, "INR") : "Funds"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransferForm;
