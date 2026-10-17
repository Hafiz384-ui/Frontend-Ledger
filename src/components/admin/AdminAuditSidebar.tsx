import React from "react";
import { Info, Shield, Terminal } from "lucide-react";

/**
 * Administrative Audit Sidebar with Operation Guide, Security Notice, and API Spec
 */
export const AdminAuditSidebar: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Operation Guide */}
      <div className="spatial-card rounded-2xl border border-border/60 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          Operation Guide
        </h3>
        <ul className="space-y-3">
          {[
            {
              step: "01",
              title: "Find Account ID",
              desc: "Locate the recipient's 24-char MongoDB ObjectId from the user management console.",
            },
            {
              step: "02",
              title: "Set Amount",
              desc: "Enter the seed amount in INR. Max ₹1 crore per single operation.",
            },
            {
              step: "03",
              title: "Verify Key",
              desc: "The UUID v4 idempotency key is auto-generated. Regenerate if retrying a failed op.",
            },
            {
              step: "04",
              title: "Submit & Audit",
              desc: "Submit to credit funds. The transaction is permanently recorded in the ledger.",
            },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-3 text-xs">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                {step}
              </span>
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground/90">{title}</p>
                <p className="text-muted-foreground/60 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Security Notice */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400/80 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Security Notice
        </h3>
        <ul className="space-y-2">
          {[
            "All fund seedings are cryptographically logged.",
            "Idempotency keys prevent duplicate transactions.",
            "This panel is inaccessible to standard users.",
            "Unauthorized access attempts are flagged.",
          ].map((note) => (
            <li
              key={note}
              className="flex items-start gap-2 text-[11px] text-rose-300/70 leading-relaxed"
            >
              <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* API Reference */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          API Reference
        </h3>
        <div className="space-y-2 text-[11px] font-mono">
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">POST</span>
            <span className="text-foreground/70 break-all">
              /api/transactions/system/initial-funds
            </span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 space-y-1 text-muted-foreground/60">
            <p>
              <span className="text-sky-400">toAccount</span>: ObjectId (string)
            </p>
            <p>
              <span className="text-sky-400">amount</span>: number (INR)
            </p>
            <p>
              <span className="text-sky-400">idempotencyKey</span>: UUID v4
            </p>
          </div>
          <div className="space-y-1 text-muted-foreground/50">
            <p>
              <span className="text-emerald-400">201</span> — Funds credited successfully
            </p>
            <p>
              <span className="text-rose-400">400</span> — Invalid payload
            </p>
            <p>
              <span className="text-rose-400">403</span> — Access denied
            </p>
            <p>
              <span className="text-rose-400">500</span> — Server error
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditSidebar;
