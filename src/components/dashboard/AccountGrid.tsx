import React from "react";
import { Plus } from "lucide-react";
import AccountCard from "./AccountCard";
import { AccountCardSkeleton } from "@/components/ui/SkeletonLoaders";
import type { Account } from "@/types/account";

interface AccountGridProps {
  accounts: Account[];
  isCreating: boolean;
  hideBalances: boolean;
  onCreateAccount: () => void;
  onOpenDetails: (account: Account) => void;
  onSendMoney: (account: Account) => void;
}

/**
 * Grid presentation for all bank account cards with shimmer loading states
 */
export const AccountGrid: React.FC<AccountGridProps> = ({
  accounts,
  isCreating,
  hideBalances,
  onCreateAccount,
  onOpenDetails,
  onSendMoney,
}) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Your Bank Accounts
          </h2>
          <p className="text-xs text-muted-foreground">
            Click any account to make it your primary vault or perform actions
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateAccount}
          disabled={isCreating}
          className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Open Another Account</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* If creating an account, show a shimmering skeleton placeholder */}
        {isCreating && <AccountCardSkeleton />}

        {accounts.map((acc) => (
          <AccountCard
            key={acc._id}
            account={acc}
            hideBalance={hideBalances}
            onOpenDetails={onOpenDetails}
            onSendMoney={onSendMoney}
          />
        ))}
      </div>
    </section>
  );
};

export default AccountGrid;
