/**
 * Legacy API Proxy Layer
 * Bridges existing imports directly to the new enterprise modular service architecture:
 * @see "@/services/api-client"
 * @see "@/services/auth.service"
 * @see "@/services/account.service"
 * @see "@/services/transaction.service"
 */

import { apiClient } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import { accountService } from "@/services/account.service";
import { transactionService } from "@/services/transaction.service";

export { apiClient };

export const authApi = authService;
export const accountApi = accountService;
export const transactionApi = {
  createTransaction: transactionService.createTransaction,
  getTransactions: transactionService.getTransactions,
};
export const systemApi = {
  seedInitialFunds: transactionService.seedInitialFunds,
};

export default apiClient;
