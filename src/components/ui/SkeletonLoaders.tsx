"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/60 skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

/**
 * AccountCardSkeleton
 * Mimics high-end spatial credit/debit/savings cards
 */
export function AccountCardSkeleton() {
  return (
    <div className="spatial-card rounded-2xl p-6 h-52 flex flex-col justify-between border border-border/40 bg-card/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="w-28 h-3" />
        <Skeleton className="w-48 h-8 rounded-lg" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <Skeleton className="w-32 h-3" />
        <Skeleton className="w-12 h-4 rounded" />
      </div>
    </div>
  );
}

/**
 * BalanceDisplaySkeleton
 * Mimics hero account balance block
 */
export function BalanceDisplaySkeleton() {
  return (
    <div className="spatial-card rounded-2xl p-6 sm:p-8 space-y-4 border border-border/40 bg-card/40">
      <div className="flex items-center justify-between">
        <Skeleton className="w-36 h-4" />
        <Skeleton className="w-24 h-6 rounded-full" />
      </div>
      <Skeleton className="w-64 h-12 rounded-xl" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="w-28 h-8 rounded-lg" />
        <Skeleton className="w-28 h-8 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * TransactionRowSkeleton
 * Mimics table/list row for ledger entries
 */
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-card/30">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="w-24 h-4 ml-auto" />
        <Skeleton className="w-16 h-3 ml-auto" />
      </div>
    </div>
  );
}

/**
 * DashboardGridSkeleton
 * Composite skeleton loader for full dashboard loading state
 */
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Skeleton */}
      <BalanceDisplaySkeleton />

      {/* Account Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AccountCardSkeleton />
          <AccountCardSkeleton />
          <AccountCardSkeleton />
        </div>
      </div>

      {/* Recent Ledger Transactions */}
      <div className="space-y-3 pt-2">
        <Skeleton className="w-40 h-5" />
        <div className="space-y-2.5">
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
          <TransactionRowSkeleton />
        </div>
      </div>
    </div>
  );
}
