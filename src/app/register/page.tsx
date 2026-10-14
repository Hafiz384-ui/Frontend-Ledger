"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
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
import GuestRoute from "@/components/auth/GuestRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/store/useToastStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error: authError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Email format validation
  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  // Live password strength calculator (0 = empty, 1 = weak, 2 = medium, 3 = strong)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
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

    if (!validate()) return;

    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
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
                Create Banking Account
              </h1>
              <p className="text-xs text-muted-foreground">
                Join AURA Spatial Financial OS with double-entry security
              </p>
            </div>

            {/* Inline Error Notice */}
            {(serverError || authError) && (
              <div className="mb-6 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{serverError || authError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. alexmorgan"
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl spatial-glass text-xs font-medium placeholder:text-muted-foreground/50 border transition-all outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 ${
                      fieldErrors.username
                        ? "border-rose-500/60 bg-rose-500/[0.03]"
                        : "border-border/60 hover:border-border"
                    }`}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="text-[11px] font-medium text-rose-400 pt-0.5">
                    {fieldErrors.username}
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= 1
                            ? passwordStrength === 1
                              ? "bg-rose-500"
                              : passwordStrength === 2
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                            : "bg-muted"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= 2
                            ? passwordStrength === 2
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                            : "bg-muted"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= 3 ? "bg-emerald-400" : "bg-muted"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block text-right font-medium">
                      {passwordStrength === 1 && "Weak (add mixed cases or digits)"}
                      {passwordStrength === 2 && "Good password"}
                      {passwordStrength === 3 && "Strong password"}
                    </span>
                  </div>
                )}

                {fieldErrors.password && (
                  <p className="text-[11px] font-medium text-rose-400 pt-0.5">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Security Protocol Check */}
              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Encrypted using bcrypt hashing and SHA-256 JWT keys</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-spatial-glow-emerald disabled:opacity-60 disabled:cursor-not-allowed group"
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

            {/* Footer switch to Login */}
            <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
              Already have an AURA account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
