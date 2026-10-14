"use client";

import React from "react";
import { Wallet, Plus, ShieldCheck, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useAccountStore } from "@/store/useAccountStore";
import { toast } from "@/store/useToastStore";

interface EmptyAccountStateProps {
  onAccountCreated?: () => void;
}

export function EmptyAccountState({ onAccountCreated }: EmptyAccountStateProps) {
  const { createAccount, isCreating } = useAccountStore();

  const handleCreate = async () => {
    const newAcc = await createAccount();
    if (newAcc) {
      toast.success(
        `Account created successfully! ID: ${newAcc._id}`,
        "Vault Opened"
      );
      if (onAccountCreated) onAccountCreated();
    } else {
      toast.error("Failed to create account. Please try again.", "Error");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl spatial-card p-8 sm:p-14 text-center border border-dashed border-emerald-500/30 bg-card/40 shadow-spatial-md">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        {/* Animated Vault Emblem */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-30" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1px] shadow-spatial-glow-emerald">
            <div className="w-full h-full rounded-[15px] bg-background/90 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NO ACTIVE ACCOUNTS DETECTED</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Open Your First Primary Vault
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Create an Indian Rupee (INR) account to begin receiving funds, initiating
            instant peer-to-peer transfers, and inspecting your real-time double-entry
            ledger.
          </p>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Balance Opening</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Ledger Verification</span>
          </div>
        </div>

        {/* Prominent Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-all shadow-spatial-glow-emerald disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Double-Entry Vault...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Open New Account</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmptyAccountState;
