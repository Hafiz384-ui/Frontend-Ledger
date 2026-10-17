import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

/**
 * Enterprise Axios API Client Instance
 * Configured with standard base URL, timeout, and CORS credentials
 */
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
 * Injects the JWT bearer token from localStorage into outgoing HTTP headers
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
 * Handles session revocation (401), unauthorized privilege barriers (403),
 * network disconnects, and normalizes error objects for UI consumption.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      const networkError = new Error(
        "Banking server unreachable. Please check your network connection or server status."
      );
      (networkError as unknown as { status: number }).status = 0;
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;
    const serverMessage = data?.message || "An unexpected error occurred.";

    switch (status) {
      case 401: {
        // Token expired, malformed, or blacklisted
        if (typeof window !== "undefined") {
          localStorage.removeItem("banking_token");
          localStorage.removeItem("banking_user");
          document.cookie = "banking_token=; path=/; max-age=0";

          // Notify global Zustand stores and subscribers
          window.dispatchEvent(
            new CustomEvent("banking:unauthorized", {
              detail: { message: serverMessage || "Session expired. Please log in again." },
            })
          );

          // Redirect to login screen if outside auth flows
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
            window.location.href = `/login?expired=true&message=${encodeURIComponent(
              serverMessage || "Session expired. Please log in again."
            )}`;
          }
        }
        break;
      }

      case 403: {
        // Forbidden - access denied (e.g. non-systemUser accessing admin endpoints)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("banking:forbidden", {
              detail: { message: serverMessage || "Access denied. Insufficient permissions." },
            })
          );
        }
        break;
      }

      default:
        break;
    }

    // Return a standardized error object containing status code and payload
    const customError = new Error(serverMessage);
    (customError as unknown as { status: number; data?: unknown; response?: unknown }).status = status;
    (customError as unknown as { status: number; data?: unknown; response?: unknown }).data = data;
    (customError as unknown as { status: number; data?: unknown; response?: unknown }).response = error.response;
    return Promise.reject(customError);
  }
);

export default apiClient;
