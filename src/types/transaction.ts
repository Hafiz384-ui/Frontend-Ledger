/**
 * Transaction Type Definitions
 * Represents financial transfers, state transitions, and seeding payloads
 */

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILURE"
  | "FAILED"
  | "REVERSED"
  | "REJECTED"
  | "ROLLED_BACK";

export type TransactionDirection =
  | "SENT"
  | "RECEIVED"
  | "SELF"
  | "TRANSFER"
  | "SYSTEM_AUDIT";

export interface TransactionAccountRef {
  _id: string;
  status: string;
  currency: string;
  user?: {
    _id?: string;
    username: string;
    email: string;
  };
}

export interface Transaction {
  _id: string;
  fromAccount: string | TransactionAccountRef;
  toAccount: string | TransactionAccountRef;
  amount: number;
  idempotencyKey: string;
  status: TransactionStatus;
  direction?: TransactionDirection;
  isSender?: boolean;
  isReceiver?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  idempotencyKey: string;
}

export interface TransactionResponse {
  message: string;
  transaction?: Transaction;
  status?: TransactionStatus | string;
  accountId?: string;
  balance?: number;
  [key: string]: unknown;
}

export interface SeedFundsRequest {
  toAccount: string;
  amount: number;
  idempotencyKey: string;
}

export interface SeedFundsResponse {
  message: string;
  transaction?: Transaction | Record<string, unknown>;
}

export interface TransactionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TransactionListResponse {
  success: boolean;
  transactions: Transaction[];
  pagination?: TransactionPagination;
  message?: string;
}

export interface TransactionQueryParams {
  accountId?: string;
  page?: number;
  limit?: number;
  skip?: number;
  status?: TransactionStatus;
  all?: boolean | string;
}
