/**
 * Audit Log Type Definitions
 * Strictly tracks immutable compliance records for both customers and system operators.
 */

export type AuditAction =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "ACCOUNT_CREATED"
  | "ACCOUNT_STATUS_CHANGED"
  | "MONEY_TRANSFER"
  | "SYSTEM_INITIAL_FUNDS";

export interface AuditUserRef {
  _id: string;
  username: string;
  email: string;
  systemUser?: boolean;
}

export interface AuditLog {
  _id: string;
  user: AuditUserRef | string;
  action: AuditAction;
  targetResource: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditLogResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: AuditPagination;
  message?: string;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
  targetResource?: string;
  startDate?: string;
  endDate?: string;
}

