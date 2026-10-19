"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  CreditCard,
  Layers,
  Menu,
  X,
  PlusCircle,
  TerminalSquare,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccountStore } from "@/store/useAccountStore";
import { useToastStore, toast } from "@/store/useToastStore";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { accounts, activeAccount, balances, setActiveAccount, createAccount } =
    useAccountStore();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBalance = activeAccount ? balances[activeAccount._id] ?? 0 : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 spatial-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1px] shadow-spatial-glow-emerald transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[11px] bg-background/90 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-emerald-400 bg-clip-text text-transparent">
                  AURA BANK
                </span>
                <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Spatial Banking
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-foreground hover:bg-muted/50 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/accounts"
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Accounts
              </Link>
              <Link
                href="/transactions"
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Ledger
              </Link>
              <Link
                href="/transfers"
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Transfers
              </Link>
              {/* Admin Panel -- only visible to system users */}
              {user?.systemUser && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center gap-1.5"
                >
                  <TerminalSquare className="w-3 h-3" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Active Account Pill + Theme Toggle + User Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Active Account Switcher */}
            {isAuthenticated && (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => {
                    setAccountDropdownOpen(!accountDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors text-xs"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground block leading-none">
                      {activeAccount
                        ? `Acc ${maskAccountNumber(activeAccount._id)}`
                        : "No Account"}
                    </span>
                    <span className="font-semibold text-emerald-400 block leading-tight">
                      {formatCurrency(activeBalance, activeAccount?.currency || "INR")}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {/* Account Switcher Dropdown */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl spatial-glass p-2 shadow-2xl border border-border/80 z-50 animate-fadeIn">
                    <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Select Active Account
                    </div>
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {accounts.length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">
                          No accounts found.
                        </div>
                      ) : (
                        accounts.map((acc) => (
                          <button
                            key={acc._id}
                            type="button"
                            onClick={() => {
                              setActiveAccount(acc);
                              setAccountDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                              activeAccount?._id === acc._id
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-mono">{maskAccountNumber(acc._id)}</span>
                            </div>
                            <span>
                              {formatCurrency(balances[acc._id] ?? 0, acc.currency)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="pt-2 mt-1 border-t border-border/40">
                      {user?.systemUser ? (
                        <Link
                          href="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <TerminalSquare className="w-3.5 h-3.5" />
                          <span>Admin Seed Panel</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await createAccount();
                            setAccountDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Open New Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-border/40 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all shadow-spatial-sm"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* User Profile / Auth Action */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setAccountDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 p-1 pl-2 rounded-xl border border-border/50 bg-card/50 hover:bg-muted/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center justify-center border border-emerald-500/30">
                    {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-foreground pr-1 max-w-[100px] truncate">
                    {user?.username || "Account"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:inline" />
                </button>

                {/* Profile Menu Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl spatial-glass p-3 shadow-2xl border border-border/80 z-50 animate-fadeIn">
                    <div className="pb-3 border-b border-border/40">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {user?.username}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user?.email}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Verified Active Session
                      </div>
                      {user?.systemUser && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <TerminalSquare className="w-2.5 h-2.5" />
                          System Operator
                        </div>
                      )}
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Security & Profile</span>
                      </Link>
                      {/* Admin Panel link -- system users only */}
                      {user?.systemUser && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold"
                        >
                          <TerminalSquare className="w-3.5 h-3.5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await logout();
                          toast.info("You have been securely signed out.", "Session Ended");
                          router.push("/login");
                        }}
                        className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-foreground hover:bg-muted/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-spatial-glow-emerald transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 spatial-glass px-4 py-3 space-y-2 animate-fadeIn">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50"
          >
            Dashboard
          </Link>
          <Link
            href="/accounts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            Accounts
          </Link>
          <Link
            href="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            Ledger
          </Link>
          <Link
            href="/transfers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            Transfers
          </Link>
          {/* Admin Panel -- only visible to system users */}
          {user?.systemUser && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
            >
              <TerminalSquare className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
