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

export interface Transaction {
  _id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  idempotencyKey: string;
  status: TransactionStatus;
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

export interface TransactionQueryParams {
  accountId?: string;
  limit?: number;
  skip?: number;
  status?: TransactionStatus;
}
