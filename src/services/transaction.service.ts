import apiClient from "./api-client";
import type {
  CreateTransactionRequest,
  SeedFundsRequest,
  SeedFundsResponse,
  Transaction,
  TransactionQueryParams,
  TransactionResponse,
} from "@/types/transaction";

/**
 * Transaction Service Layer
 * Handles atomic money transfers, transaction history queries, and system-level initial fund seeding
 */
export const transactionService = {
  /**
   * Execute an atomic, double-entry transfer between two accounts
   */
  createTransaction: async (
    payload: CreateTransactionRequest
  ): Promise<{ status: number; data: TransactionResponse }> => {
    const response = await apiClient.post<TransactionResponse>("/api/transactions", payload);
    return {
      status: response.status,
      data: response.data,
    };
  },

  /**
   * Retrieve historical transactions, optionally filtered by accountId or pagination limit
   */
  getTransactions: async (params?: TransactionQueryParams): Promise<Transaction[]> => {
    const response = await apiClient.get<{ transactions: Transaction[] } | Transaction[]>("/api/transactions", {
      params,
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as { transactions?: Transaction[] }).transactions || [];
  },

  /**
   * Seed initial funds into any user account (Restricted to systemUser privilege)
   */
  seedInitialFunds: async (payload: SeedFundsRequest): Promise<SeedFundsResponse> => {
    const response = await apiClient.post<SeedFundsResponse>(
      "/api/transactions/system/initial-funds",
      payload
    );
    return response.data;
  },
};

export default transactionService;
