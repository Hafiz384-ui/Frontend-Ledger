import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  setHasHydrated: (val: boolean) => void;
  clearError: () => void;
  handleUnauthorized: () => void;
}

const syncTokenToCookie = (token: string | null) => {
  if (typeof document === "undefined") return;
  if (token) {
    // 7 days expiration
    document.cookie = `banking_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = "banking_token=; path=/; max-age=0";
    document.cookie = "token=; path=/; max-age=0";
  }
};

/**
 * Checks if a JWT token is expired on the client side
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // Exp is in seconds; check with a 10s leeway
    return Date.now() >= (payload.exp * 1000 - 10000);
  } catch (_) {
    return true;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      error: null,

      setHasHydrated: (val: boolean) => set({ hasHydrated: val }),

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(credentials);
          console.log(data)
          localStorage.setItem("banking_token", data.token);
          syncTokenToCookie(data.token);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true, message: data.message };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to log in";
          set({ error: message, isLoading: false, isAuthenticated: false });
          return { success: false, message };
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(credentials);
          localStorage.setItem("banking_token", data.token);
          syncTokenToCookie(data.token);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true, message: data.message };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to register";
          set({ error: message, isLoading: false, isAuthenticated: false });
          return { success: false, message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (err) {
          console.warn("Backend logout notification warning:", err);
        } finally {
          localStorage.removeItem("banking_token");
          syncTokenToCookie(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setAuth: (user: User, token: string) => {
        localStorage.setItem("banking_token", token);
        syncTokenToCookie(token);
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      handleUnauthorized: () => {
        localStorage.removeItem("banking_token");
        localStorage.removeItem("banking_auth_store");
        syncTokenToCookie(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Session expired. Please log in again.",
        });
      },
    }),
    {
      name: "banking_auth_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If token exists but is expired, invalidate immediately upon rehydration
          if (state.token && isTokenExpired(state.token)) {
            state.handleUnauthorized();
            state.setHasHydrated(true);
            return;
          }

          state.setHasHydrated(true);
          // Sync existing token to cookie if exists
          if (state.token) {
            syncTokenToCookie(state.token);
          }
        }
      },
    }
  )
);

// Global event listener for 401 unauthorized interceptor
if (typeof window !== "undefined") {
  window.addEventListener("banking:unauthorized", () => {
    useAuthStore.getState().handleUnauthorized();
  });
}
