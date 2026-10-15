"use client";

import React from "react";
import { X } from "lucide-react";
import type { Account } from "@/types/account";
import TransferForm from "@/components/transfer/TransferForm";

interface SendMoneyModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: number;
}

export function SendMoneyModal({
  account,
  isOpen,
  onClose,
}: SendMoneyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-xl spatial-glass border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <TransferForm
          initialFromAccountId={account?._id}
          onCancel={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
}

export default SendMoneyModal;
