import apiClient from "./api-client";
import type {
  CreateTransactionRequest,
  SeedFundsRequest,
  SeedFundsResponse,
  Transaction,
  TransactionListResponse,
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
   * Retrieve full paginated transaction history with sent/received direction and metadata
   */
  getTransactionHistory: async (params?: TransactionQueryParams): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse | Transaction[]>("/api/transactions", {
      params,
    });

    if (Array.isArray(response.data)) {
      return {
        success: true,
        transactions: response.data,
      };
    }
    return response.data as TransactionListResponse;
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
