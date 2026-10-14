"use client";

import React, { useState } from "react";
import { X, Send, ArrowRight, Layers, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Account } from "@/types/account";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { toast } from "@/store/useToastStore";

interface SendMoneyModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export function SendMoneyModal({
  account,
  isOpen,
  onClose,
  availableBalance,
}: SendMoneyModalProps) {
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (!recipientId.trim()) {
      setError("Recipient Account ID is required");
      return;
    }
    if (recipientId.trim() === account._id) {
      setError("Cannot transfer money to the same account");
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }
    if (numericAmount > availableBalance) {
      setError(
        `Insufficient ledger funds. Available balance is ${formatCurrency(
          availableBalance,
          account.currency
        )}`
      );
      return;
    }

    // Transfers integration will be completed in the Transaction Module
    toast.info(
      `Transfer flow initiated for ₹${numericAmount} to Account ${maskAccountNumber(recipientId)}. Ready for Transaction Module integration!`,
      "Transfer Request Prepared"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-3xl spatial-glass p-6 sm:p-8 border border-border/80 shadow-2xl animate-scaleIn space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Send Money</h3>
              <p className="text-xs text-muted-foreground">Peer-to-peer double-entry transfer</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Account Info Strip */}
        <div className="p-3 rounded-xl bg-card/60 border border-border/40 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Paying From</span>
              <span className="font-mono font-semibold text-foreground">
                {maskAccountNumber(account._id)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground block">Available</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatCurrency(availableBalance, account.currency)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider">
              Recipient Account ID
            </label>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="e.g. 68f812a9c510b64d081e2891"
              className="w-full px-3.5 py-2.5 rounded-xl spatial-glass text-xs font-mono border border-border/60 hover:border-border outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider">
              Amount (INR — ₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-muted-foreground">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl spatial-glass text-sm font-mono font-bold border border-border/60 hover:border-border outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Dinner split, Rent payment"
              className="w-full px-3.5 py-2 rounded-xl spatial-glass text-xs border border-border/60 hover:border-border outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl spatial-glass border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendMoneyModal;
