import React from "react";
import Link from "next/link";
import { RefreshCw, Plus, Loader2, TerminalSquare, ShieldAlert } from "lucide-react";
import type { User } from "@/types/auth";

interface DashboardHeaderProps {
  user: User | null;
  isLoading: boolean;
  isCreating: boolean;
  onRefresh: () => void;
  onCreateAccount: () => void;
}

/**
 * Top Greeting and Global Header actions for the Banking Dashboard
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isLoading,
  isCreating,
  onRefresh,
  onCreateAccount,
}) => {
  const isSystemUser = Boolean(user?.systemUser);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isSystemUser ? "bg-rose-400" : "bg-emerald-400"
            }`}
          />
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isSystemUser ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {isSystemUser ? "System Reserve Operator" : "Spatial Banking Network"}
          </span>
          {isSystemUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              SEEDING ONLY
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Welcome back,{" "}
          <span
            className={`bg-gradient-to-r ${
              isSystemUser
                ? "from-foreground via-rose-300 to-rose-400"
                : "from-foreground via-foreground/90 to-emerald-400"
            } bg-clip-text text-transparent`}
          >
            {user?.username || "Commander"}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground">
          {isSystemUser
            ? "Administrative Account: Designated solely to seed initial reserve funds to users."
            : "Monitor your active vaults, peer-to-peer transfers, and ledger status."}
        </p>
      </div>

      {/* Top Quick Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl spatial-glass border border-border/60 hover:bg-muted/80 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-spatial-sm"
          title="Refresh All Accounts"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isLoading
                ? isSystemUser
                  ? "animate-spin text-rose-400"
                  : "animate-spin text-emerald-400"
                : ""
            }`}
          />
          <span className="hidden sm:inline">Sync Ledger</span>
        </button>

        {isSystemUser ? (
          <Link
            href="/admin"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-bold text-xs hover:opacity-90 shadow-spatial-glow-rose transition-all group"
            title="Open Admin Seed Funds Panel"
          >
            <TerminalSquare className="w-4 h-4 text-slate-950" />
            <span>Seed Initial Funds</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onCreateAccount}
            disabled={isCreating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Opening Vault...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Open New Account</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
