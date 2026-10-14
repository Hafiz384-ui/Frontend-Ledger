"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function GlobalLoader({
  message = "Securing session & syncing ledger...",
  fullScreen = true,
  className,
}: GlobalLoaderProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      {/* Spatial Glowing Concentric Rings */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Outer pulsating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-30" />
        
        {/* Middle rotating dash ring */}
        <div className="absolute inset-1 rounded-full border-2 border-dashed border-emerald-500/40 animate-[spin_8s_linear_infinite]" />
        
        {/* Inner high-speed spinning gradient ring */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-emerald-400 border-r-teal-500 animate-[spin_1.5s_linear_infinite]" />
        
        {/* Center glowing core emblem */}
        <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 shadow-spatial-glow-emerald backdrop-blur-md">
          <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Modern Spatial Text */}
      <div className="text-center space-y-1.5">
        <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground/90">
          Spatial Banking Core
        </h4>
        <p className="text-xs text-muted-foreground animate-pulse font-medium">
          {message}
        </p>
      </div>

      {/* Progress Line */}
      <div className="w-48 h-1 bg-muted/40 rounded-full overflow-hidden mt-5">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 w-full animate-shimmer bg-[length:200%_100%]" />
      </div>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="spatial-glass rounded-2xl p-6 max-w-sm w-full mx-4 border border-border/60 shadow-2xl">
        {content}
      </div>
    </div>
  );
}

export default GlobalLoader;
