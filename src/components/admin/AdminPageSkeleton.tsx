import React from "react";
import { Skeleton } from "@/components/ui/SkeletonLoaders";

/**
 * Skeleton loader state for Admin Panel
 */
export const AdminPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="w-48 h-5" />
        <Skeleton className="w-80 h-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
};

export default AdminPageSkeleton;
