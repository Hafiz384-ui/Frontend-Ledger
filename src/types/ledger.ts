/**
 * Ledger Type Definitions
 * Represents the immutable double-entry bookkeeping records
 */

export type LedgerType = "CREDIT" | "DEBIT";

export interface LedgerEntry {
  _id: string;
  account: string;
  amount: number;
  transaction: string;
  type: LedgerType;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerListResponse {
  ledgerEntries: LedgerEntry[];
  total?: number;
}
