"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, ToastType } from "@/store/useToastStore";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
};

const borderAndBg: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-emerald-950/40 text-emerald-200",
  error: "border-rose-500/30 bg-rose-950/40 text-rose-200",
  warning: "border-amber-500/30 bg-amber-950/40 text-amber-200",
  info: "border-sky-500/30 bg-sky-950/40 text-sky-200",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl spatial-glass border shadow-spatial-lg backdrop-blur-xl animate-fadeIn ${
            borderAndBg[t.type]
          }`}
        >
          <div className="flex items-start space-x-3 pr-2">
            {icons[t.type]}
            <div className="space-y-0.5">
              {t.title && (
                <h5 className="text-xs font-bold tracking-tight text-foreground">
                  {t.title}
                </h5>
              )}
              <p className="text-xs font-medium leading-relaxed">{t.message}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
