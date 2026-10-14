export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export interface Account {
  _id: string;
  user: string;
  status: AccountStatus;
  currency: string;
  createdAt: string;
  updatedAt: string;
  balance?: number;
}

export interface AccountListResponse {
  account: Account[];
}

export interface CreateAccountResponse {
  account: Account;
}

export interface BalanceResponse {
  message: string;
  balance: number;
  accountId: string;
}
