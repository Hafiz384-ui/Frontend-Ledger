import apiClient from "./api-client";
import type {
  AuditLogResponse,
  AuditLogQueryParams,
} from "@/types/auditLog";

/**
 * Enterprise Audit Trail Service Layer
 * - Regular customers query their own immutable activity logs (/api/audit-logs/my-logs)
 * - System Users (Admins) query global enterprise compliance trails (/api/audit-logs/system)
 */
export const auditLogService = {
  /**
   * Retrieves paginated personal security & audit logs for the authenticated user
   */
  getMyAuditLogs: async (params?: AuditLogQueryParams): Promise<AuditLogResponse> => {
    const response = await apiClient.get<AuditLogResponse>("/api/audit-logs/my-logs", {
      params,
    });
    return response.data;
  },

  /**
   * Retrieves paginated system-wide compliance audit records (Admins only)
   */
  getSystemAuditLogs: async (params?: AuditLogQueryParams): Promise<AuditLogResponse> => {
    const response = await apiClient.get<AuditLogResponse>("/api/audit-logs/system", {
      params,
    });
    return response.data;
  },
};

export default auditLogService;

