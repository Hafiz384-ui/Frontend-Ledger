import apiClient from "./api-client";
import type {
  AccountListResponse,
  BalanceResponse,
  CreateAccountResponse,
} from "@/types/account";

/**
 * Account Service Layer
 * Encapsulates bank account retrieval, balance fetching, and account creation
 */
export const accountService = {
  /**
   * Fetch all accounts belonging to the authenticated user
   */
  getMyAccounts: async (): Promise<AccountListResponse> => {
    const response = await apiClient.get<AccountListResponse>("/api/accounts/my-accounts");
    return response.data;
  },

  /**
   * Fetch real-time balance for a specific account via double-entry ledger calculation
   */
  getAccountBalance: async (accountId: string): Promise<BalanceResponse> => {
    const response = await apiClient.get<BalanceResponse>(`/api/accounts/balance/${accountId}`);
    return response.data;
  },

  /**
   * Create a new bank account for the authenticated user
   */
  createAccount: async (): Promise<CreateAccountResponse> => {
    const response = await apiClient.post<CreateAccountResponse>("/api/accounts/");
    return response.data;
  },
};

export default accountService;
