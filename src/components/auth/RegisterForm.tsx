"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/store/useToastStore";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

/**
 * Enterprise Register Form Component
 * Strictly validated with Yup schema and React Hook Form
 */
export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register: registerAuth, isLoading, error: authError, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    clearError();

    const result = await registerAuth({
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (result.success) {
      toast.success(
        "Account created! Check your email for confirmation.",
        "Registration Complete"
      );
      router.push("/");
    } else {
      setServerError(result.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Inline Error Notice */}
      {(serverError || authError) && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{serverError || authError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider"
          >
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="username"
              type="text"
              {...register("username")}
              placeholder="e.g. alexmorgan"
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                errors.username
                  ? "border-rose-500/60 bg-rose-500/[0.03]"
                  : "border-border/60 hover:border-border"
              }`}
            />
          </div>
          {errors.username && (
            <p className="text-[11px] font-medium text-rose-400 pt-0.5">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="name@aurabank.io"
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                errors.email
                  ? "border-rose-500/60 bg-rose-500/[0.03]"
                  : "border-border/60 hover:border-border"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] font-medium text-rose-400 pt-0.5">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••••••"
              disabled={isLoading}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                errors.password
                  ? "border-rose-500/60 bg-rose-500/[0.03]"
                  : "border-border/60 hover:border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password Strength Meter */}
          <PasswordStrengthMeter password={passwordValue} />

          {errors.password && (
            <p className="text-[11px] font-medium text-rose-400 pt-0.5">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••••••"
              disabled={isLoading}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                errors.confirmPassword
                  ? "border-rose-500/60 bg-rose-500/[0.03]"
                  : "border-border/60 hover:border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] font-medium text-rose-400 pt-0.5">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Security Checkpoint */}
        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Encrypted using bcrypt hashing and SHA-256 JWT keys</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-spatial-glow-emerald disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Creating Security Credentials...</span>
            </>
          ) : (
            <>
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login link */}
      <div className="pt-4 border-t border-border/40 text-center text-xs text-muted-foreground">
        Already have an AURA account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
