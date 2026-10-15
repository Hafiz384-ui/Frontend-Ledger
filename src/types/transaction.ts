export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
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
