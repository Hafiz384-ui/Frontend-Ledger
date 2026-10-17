import React from "react";
import { RefreshCw, Plus, Loader2 } from "lucide-react";
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
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Spatial Banking Network
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-emerald-400 bg-clip-text text-transparent">
            {user?.username || "Commander"}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor your active vaults, peer-to-peer transfers, and ledger status.
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
              isLoading ? "animate-spin text-emerald-400" : ""
            }`}
          />
          <span className="hidden sm:inline">Sync Ledger</span>
        </button>

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
      </div>
    </div>
  );
};

export default DashboardHeader;
