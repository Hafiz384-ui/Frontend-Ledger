import React from "react";

interface PasswordStrengthMeterProps {
  password?: string;
}

/**
 * Visual password strength indicator bar with adaptive color gradation
 */
export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password = "",
}) => {
  if (!password) return null;

  const getScore = (pass: string): number => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  };

  const score = getScore(password);

  return (
    <div className="pt-1.5 space-y-1 animate-fadeIn">
      <div className="flex items-center gap-1.5">
        <div
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            score >= 1
              ? score === 1
                ? "bg-rose-500"
                : score === 2
                ? "bg-amber-400"
                : "bg-emerald-400"
              : "bg-muted"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            score >= 2
              ? score === 2
                ? "bg-amber-400"
                : "bg-emerald-400"
              : "bg-muted"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            score >= 3 ? "bg-emerald-400" : "bg-muted"
          }`}
        />
      </div>
      <span className="text-[10px] text-muted-foreground block text-right font-medium">
        {score === 1 && "Weak (add mixed cases or digits)"}
        {score === 2 && "Good password"}
        {score === 3 && "Strong password"}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
