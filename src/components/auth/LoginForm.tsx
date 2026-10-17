"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/store/useToastStore";

/**
 * Enterprise Login Form Component
 * Powered by React Hook Form & Yup with strict validation & spatial glassmorphism UI
 */
export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error: authError, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check if redirected due to session expiration (401 from interceptor)
  useEffect(() => {
    const expired = searchParams.get("expired");
    const message = searchParams.get("message");
    if (expired) {
      setSessionExpiredNotice(
        message || "Your session has expired or the token was invalidated. Please log in again."
      );
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSessionExpiredNotice(null);
    clearError();

    const result = await login({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (result.success) {
      toast.success("Welcome back to your financial vault!", "Authenticated");
      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
    } else {
      setServerError(result.message || "Invalid email or password.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Expired Notice */}
      {sessionExpiredNotice && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{sessionExpiredNotice}</span>
        </div>
      )}

      {/* Server Error Alert */}
      {(serverError || authError) && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{serverError || authError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          {errors.password && (
            <p className="text-[11px] font-medium text-rose-400 pt-0.5">
              {errors.password.message}
            </p>
          )}
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
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Vault</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register link */}
      <div className="pt-4 border-t border-border/40 text-center text-xs text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
