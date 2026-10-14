"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import GuestRoute from "@/components/auth/GuestRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/store/useToastStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  // Check if redirected due to session expiration (401)
  useEffect(() => {
    const expired = searchParams.get("expired");
    const message = searchParams.get("message");
    if (expired) {
      setSessionExpiredNotice(
        message || "Your session has expired or the token was invalidated. Please log in again."
      );
    }
  }, [searchParams]);

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (serverError) setServerError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSessionExpiredNotice(null);

    if (!validate()) return;

    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
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
    <GuestRoute>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-6 sm:py-12">
        {/* Glow ambient background aura */}
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md mx-auto">
          {/* Card Container */}
          <div className="spatial-card rounded-3xl p-6 sm:p-10 border border-border/80 shadow-spatial-lg">
            {/* Header / Branding */}
            <div className="text-center space-y-2 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] mx-auto shadow-spatial-glow-emerald">
                <div className="w-full h-full rounded-[15px] bg-background/90 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-emerald-400 bg-clip-text text-transparent">
                Sign In to Vault
              </h1>
              <p className="text-xs text-muted-foreground">
                Authenticate your secure session to access your double-entry accounts
              </p>
            </div>

            {/* Session Expired Notice */}
            {sessionExpiredNotice && (
              <div className="mb-6 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium">{sessionExpiredNotice}</span>
              </div>
            )}

            {/* Server Error Alert */}
            {(serverError || authError) && (
              <div className="mb-6 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{serverError || authError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@aurabank.io"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                      fieldErrors.email
                        ? "border-rose-500/60 bg-rose-500/[0.03]"
                        : "border-border/60 hover:border-border"
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] font-medium text-rose-400 pt-0.5">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-foreground/90 uppercase tracking-wider"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                      fieldErrors.password
                        ? "border-rose-500/60 bg-rose-500/[0.03]"
                        : "border-border/60 hover:border-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] font-medium text-rose-400 pt-0.5">
                    {fieldErrors.password}
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

            {/* Footer switch to Register */}
            <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
