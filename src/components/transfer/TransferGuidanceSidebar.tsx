import React from "react";
import { ShieldCheck, CheckCircle2, HelpCircle } from "lucide-react";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type { Account } from "@/types/account";

interface TransferGuidanceSidebarProps {
  accounts: Account[];
  balances: Record<string, number>;
}

/**
 * Architectural Security and Recipient guidance sidebar for the transfer view
 */
export const TransferGuidanceSidebar: React.FC<TransferGuidanceSidebarProps> = ({
  accounts,
  balances,
}) => {
  return (
    <div className="space-y-6">
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
            Recipient IDs are 24-character hexadecimal strings (e.g.{" "}
            <span className="font-mono text-foreground text-[11px]">65fa3b...</span>).
          </li>
          <li>
            Use the <strong>Paste</strong> button in the recipient field to populate copied accounts with one click.
          </li>
          <li>Funds cannot be transferred to the same source account.</li>
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
  );
};

export default TransferGuidanceSidebar;
