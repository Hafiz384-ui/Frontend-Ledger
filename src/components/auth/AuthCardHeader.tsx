import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthCardHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
}

/**
 * Reusable Auth Card Header with spatial gradient shield icon and modern typography
 */
export const AuthCardHeader: React.FC<AuthCardHeaderProps> = ({
  title,
  subtitle,
  badge,
}) => {
  return (
    <div className="text-center space-y-2 mb-8">
      {badge && (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{badge}</span>
        </div>
      )}

      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] mx-auto shadow-spatial-glow-emerald">
        <div className="w-full h-full rounded-[15px] bg-background/90 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-emerald-400 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default AuthCardHeader;
