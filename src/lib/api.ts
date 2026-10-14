import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { AuthResponse, LoginCredentials, LogoutResponse, RegisterCredentials } from "@/types/auth";
import type { AccountListResponse, BalanceResponse, CreateAccountResponse } from "@/types/account";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * Dynamically attaches the Bearer token to all outgoing requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("banking_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Intercepts responses globally: handles 401 (token expired/blacklisted),
 * 403 (forbidden/system-only action), network failures, and normalizes errors.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message?: string }>) => {
    if (!error.response) {
      // Network disconnected or server offline
      const networkError = new Error(
        "Banking server unreachable. Please check your network connection or server status."
      );
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;
    const serverMessage = data?.message || "An unexpected error occurred.";

    switch (status) {
      case 401: {
        // Token blacklisted or session expired
        if (typeof window !== "undefined") {
          localStorage.removeItem("banking_token");
          localStorage.removeItem("banking_user");
          document.cookie = "banking_token=; path=/; max-age=0";

          // Dispatch event so stores and components can react immediately
          window.dispatchEvent(
            new CustomEvent("banking:unauthorized", {
              detail: { message: serverMessage || "Session expired. Please log in again." },
            })
          );

          // Redirect to login if not already on an auth page
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
            window.location.href = `/login?expired=true&message=${encodeURIComponent(serverMessage || "Session expired. Please log in again.")}`;
          }
        }
        break;
      }

      case 403: {
        // Forbidden - access denied (e.g. systemUser action)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("banking:forbidden", {
              detail: { message: serverMessage || "Access denied. Insufficient permissions." },
            })
          );
        }
        break;
      }

      case 404: {
        // Resource not found
        break;
      }

      case 500:
      default: {
        // Internal server error
        break;
      }
    }

    const customError = new Error(serverMessage);
    (customError as unknown as { status: number }).status = status;
    return Promise.reject(customError);
  }
);

/**
 * Type-Safe API Services
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/register", credentials);
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/api/auth/logout");
    return response.data;
  },
};

export const accountApi = {
  getMyAccounts: async (): Promise<AccountListResponse> => {
    const response = await apiClient.get<AccountListResponse>("/api/accounts/my-accounts");
    return response.data;
  },

  getAccountBalance: async (accountId: string): Promise<BalanceResponse> => {
    const response = await apiClient.get<BalanceResponse>(`/api/accounts/balance/${accountId}`);
    return response.data;
  },

  createAccount: async (): Promise<CreateAccountResponse> => {
    const response = await apiClient.post<CreateAccountResponse>("/api/accounts/");
    return response.data;
  },
};

export default apiClient;
