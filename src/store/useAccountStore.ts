import { create } from "zustand";
import type { Account } from "@/types/account";
import { accountApi } from "@/lib/api";
import { useAuthStore } from "./useAuthStore";
import { toast } from "./useToastStore";

interface AccountState {
  accounts: Account[];
  activeAccount: Account | null;
  balances: Record<string, number>;
  isLoading: boolean;
  isCreating: boolean;
  isBalanceLoading: Record<string, boolean>; // Per-account loading state
  error: string | null;

  // Actions
  fetchAccounts: () => Promise<void>;
  setActiveAccount: (account: Account) => void;
  fetchBalance: (accountId: string) => Promise<number | null>;
  createAccount: () => Promise<Account | null>;
  clearAccountState: () => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  activeAccount: null,
  balances: {},
  isLoading: false,
  isCreating: false,
  isBalanceLoading: {},
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await accountApi.getMyAccounts();
      const accounts = response.account || [];
      const currentActive = get().activeAccount;

      // Keep current active or pick first active/available
      const selectedActive =
        accounts.find((acc) => acc._id === currentActive?._id) ||
        accounts.find((acc) => acc.status === "ACTIVE") ||
        accounts[0] ||
        null;

      set({
        accounts,
        activeAccount: selectedActive,
        isLoading: false,
      });

      // Fetch balance for all returned accounts in parallel
      accounts.forEach((acc) => {
        get().fetchBalance(acc._id);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch accounts";
      set({ error: message, isLoading: false });
    }
  },

  setActiveAccount: (account: Account) => {
    set({ activeAccount: account });
    get().fetchBalance(account._id);
  },

  fetchBalance: async (accountId: string) => {
    set((state) => ({
      isBalanceLoading: { ...state.isBalanceLoading, [accountId]: true },
    }));
    try {
      const data = await accountApi.getAccountBalance(accountId);
      const balance = typeof data?.balance === "number" ? data.balance : 0;

      set((state) => ({
        balances: {
          ...state.balances,
          [accountId]: balance,
        },
        isBalanceLoading: { ...state.isBalanceLoading, [accountId]: false },
      }));
      return balance;
    } catch (err: unknown) {
      console.warn(`Balance fetch failed for account ${accountId}:`, err);
      set((state) => ({
        isBalanceLoading: { ...state.isBalanceLoading, [accountId]: false },
      }));
      return null;
    }
  },

  createAccount: async () => {
    // Hard restriction: System user (Admin) is not allowed to open new accounts
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.systemUser) {
      toast.error(
        "System users (Admins) are not allowed to open new accounts. System user account is reserved for initial funds seeding.",
        "Operation Restricted"
      );
      set({
        error: "System users (Admins) cannot open new accounts.",
        isCreating: false,
      });
      return null;
    }

    set({ isCreating: true, error: null });
    try {
      const data = await accountApi.createAccount();
      const newAccount = data.account;

      set((state) => {
        const updatedAccounts = [newAccount, ...state.accounts];
        return {
          accounts: updatedAccounts,
          activeAccount: newAccount,
          isCreating: false,
        };
      });

      // Initialize balance for newly created account
      await get().fetchBalance(newAccount._id);
      return newAccount;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      set({ error: message, isCreating: false });
      return null;
    }
  },

  clearAccountState: () => {
    set({
      accounts: [],
      activeAccount: null,
      balances: {},
      isLoading: false,
      isCreating: false,
      isBalanceLoading: {},
      error: null,
    });
  },
}));

// Clear accounts when unauthorized event fires
if (typeof window !== "undefined") {
  window.addEventListener("banking:unauthorized", () => {
    useAccountStore.getState().clearAccountState();
  });
}
