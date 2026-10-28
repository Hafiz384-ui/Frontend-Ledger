"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Globe,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Terminal,
  Activity,
  Layers,
  Eye,
  X,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { auditLogService } from "@/services/auditLog.service";
import { toast } from "@/store/useToastStore";
import type { AuditLog } from "@/types/auditLog";

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  USER_REGISTERED: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  USER_LOGIN: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/30",
  },
  USER_LOGOUT: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
  },
  ACCOUNT_CREATED: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/30",
  },
  ACCOUNT_STATUS_CHANGED: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  MONEY_TRANSFER: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  SYSTEM_INITIAL_FUNDS: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
};

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const isSystemUser = Boolean(user?.systemUser);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [viewScope, setViewScope] = useState<"system" | "mine">(
    isSystemUser ? "system" : "mine"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Inspect Modal
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: 15,
        };

        if (selectedAction !== "ALL") {
          params.action = selectedAction;
        }

        let response;
        if (isSystemUser && viewScope === "system") {
          response = await auditLogService.getSystemAuditLogs(params);
        } else {
          response = await auditLogService.getMyAuditLogs(params);
        }

        if (response.success) {
          setLogs(response.logs || []);
          setCurrentPage(response.pagination?.page || 1);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalCount(response.pagination?.total || 0);
        } else {
          toast.error(response.message || "Failed to load audit records", "Audit Error");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(
          error?.response?.data?.message || "Failed to connect to audit logging service.",
          "Error"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isSystemUser, viewScope, selectedAction]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.info("Copied to clipboard.");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filter logs by search query (Client-side fast search over returned batch)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const actionMatch = log.action.toLowerCase().includes(q);
      const ipMatch = log.ipAddress?.toLowerCase().includes(q);
      const resourceMatch = log.targetResource?.toLowerCase().includes(q);
      const userMatch =
        typeof log.user === "object" && log.user
          ? log.user.username?.toLowerCase().includes(q) ||
            log.user.email?.toLowerCase().includes(q)
          : false;
      return actionMatch || ipMatch || resourceMatch || userMatch;
    });
  }, [logs, searchQuery]);

  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 px-2 sm:px-0">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 rounded-3xl spatial-card border border-border/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <span>Regulatory Compliance Audit Trail</span>
                  {isSystemUser && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      System Operator
                    </span>
                  )}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isSystemUser && viewScope === "system"
                    ? "Global immutable ledger of all administrative seedings, transfers, and security events."
                    : "Cryptographically verifiable record of your personal banking activities and security events."}
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => fetchLogs(currentPage)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl spatial-glass border border-border/70 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* System Operator Scope Switcher (Admins Only) */}
        {isSystemUser && (
          <div className="flex items-center p-1 rounded-2xl spatial-glass border border-border/60 w-full sm:w-fit overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewScope("system")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                viewScope === "system"
                  ? "bg-rose-500 text-slate-950 shadow-spatial-glow-rose"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>All Users (System Audit Trail)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewScope("mine")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                viewScope === "mine"
                  ? "bg-emerald-500 text-slate-950 shadow-spatial-glow-emerald"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Operator Actions Only</span>
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-7 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, IP address, user email, or resource..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl spatial-glass text-xs border border-border/60 outline-none focus:ring-2 focus:ring-emerald-500/40 text-foreground"
            />
          </div>

          {/* Action Filter */}
          <div className="sm:col-span-5 relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl spatial-glass text-xs font-semibold border border-border/60 outline-none focus:ring-2 focus:ring-emerald-500/40 text-foreground appearance-none cursor-pointer"
            >
              <option value="ALL">All Event Types</option>
              <option value="MONEY_TRANSFER">Money Transfers</option>
              <option value="SYSTEM_INITIAL_FUNDS">System Initial Funds</option>
              <option value="ACCOUNT_CREATED">Account Created</option>
              <option value="USER_LOGIN">User Logins</option>
              <option value="USER_LOGOUT">User Logouts</option>
              <option value="USER_REGISTERED">User Registrations</option>
            </select>
          </div>
        </div>

        {/* Audit Log Container */}
        <div className="rounded-3xl spatial-glass border border-border/60 overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Event Records ({filteredLogs.length} of {totalCount})
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                Verifying and loading immutable audit logs...
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-4">
              <AlertCircle className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-bold text-foreground">No audit logs found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No matching records found for the current query parameters.
              </p>
            </div>
          ) : (
            <>
              {/* 1. Mobile Responsive Card List View (< md) */}
              <div className="md:hidden divide-y divide-border/30">
                {filteredLogs.map((log) => {
                  const style =
                    ACTION_COLORS[log.action] || {
                      bg: "bg-slate-500/10",
                      text: "text-slate-400",
                      border: "border-slate-500/20",
                    };
                  const userObj = typeof log.user === "object" ? log.user : null;

                  return (
                    <div
                      key={log._id}
                      onClick={() => setInspectLog(log)}
                      className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer active:bg-muted/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {log.action}
                        </span>

                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          {userObj ? (
                            <span className="font-semibold text-foreground">
                              {userObj.username}{" "}
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ({userObj.email})
                              </span>
                            </span>
                          ) : (
                            <span className="font-mono text-muted-foreground text-[11px]">
                              User: {String(log.user).slice(0, 10)}...
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                          {log.targetResource}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Globe className="w-3 h-3 text-muted-foreground/60" />
                          {log.ipAddress}
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <span>Inspect Payload</span>
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Desktop High-Density Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                    <tr>
                      <th className="py-3.5 px-5">Action Event</th>
                      <th className="py-3.5 px-5">Subject User</th>
                      <th className="py-3.5 px-5">Target Resource</th>
                      <th className="py-3.5 px-5">Client IP</th>
                      <th className="py-3.5 px-5">Timestamp (IST)</th>
                      <th className="py-3.5 px-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredLogs.map((log) => {
                      const style =
                        ACTION_COLORS[log.action] || {
                          bg: "bg-slate-500/10",
                          text: "text-slate-400",
                          border: "border-slate-500/20",
                        };
                      const userObj = typeof log.user === "object" ? log.user : null;

                      return (
                        <tr
                          key={log._id}
                          className="hover:bg-muted/30 transition-colors group cursor-pointer"
                          onClick={() => setInspectLog(log)}
                        >
                          {/* Action Badge */}
                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {log.action}
                            </span>
                          </td>

                          {/* Subject User */}
                          <td className="py-4 px-5 font-mono">
                            {userObj ? (
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>{userObj.username}</span>
                                  {userObj.systemUser && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-bold">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {userObj.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground select-all text-[11px]">
                                {String(log.user).slice(0, 10)}...
                              </span>
                            )}
                          </td>

                          {/* Target Resource */}
                          <td className="py-4 px-5">
                            <span className="font-mono text-[11px] text-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
                              {log.targetResource}
                            </span>
                          </td>

                          {/* IP Address */}
                          <td className="py-4 px-5 font-mono text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-muted-foreground/60" />
                              <span>{log.ipAddress}</span>
                            </div>
                          </td>

                          {/* Timestamp */}
                          <td className="py-4 px-5 text-muted-foreground font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </td>

                          {/* Inspect Action */}
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectLog(log);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl spatial-glass border border-border/60 text-muted-foreground hover:text-emerald-400 transition-colors text-[11px] font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchLogs(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl spatial-glass border border-border/60 text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchLogs(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl spatial-glass border border-border/60 text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inspect Modal Drawer */}
        {inspectLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl spatial-card border border-border/70 p-6 space-y-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Audit Entry Details
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Cryptographically verified & tamper-proof record
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectLog(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-card/60 border border-border/50 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Action
                  </span>
                  <p className="font-bold text-foreground font-mono">
                    {inspectLog.action}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-card/60 border border-border/50 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Client IP
                  </span>
                  <p className="font-bold text-foreground font-mono">
                    {inspectLog.ipAddress}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-card/60 border border-border/50 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Timestamp
                  </span>
                  <p className="font-semibold text-foreground text-[11px]">
                    {new Date(inspectLog.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Immutable Payload JSON */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Audit Payload Record
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(inspectLog, null, 2))}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-emerald-400 transition-colors"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border border-border/60 max-h-64 leading-relaxed">
                  {JSON.stringify(inspectLog, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectLog(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
