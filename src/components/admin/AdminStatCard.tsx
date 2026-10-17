import React from "react";

interface AdminStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}

/**
 * Metric stat card for administrative dashboard
 */
export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon: Icon,
  label,
  value,
  accent,
}) => {
  return (
    <div
      className={`spatial-card rounded-2xl p-5 border ${accent} flex items-start gap-4`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent
          .replace("border-", "bg-")
          .replace("/30", "/10")}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground tracking-wider uppercase">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};

export default AdminStatCard;
