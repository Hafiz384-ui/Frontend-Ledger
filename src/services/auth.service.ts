import apiClient from "./api-client";
import type {
  AuthResponse,
  LoginCredentials,
  LogoutResponse,
  RegisterCredentials,
} from "@/types/auth";

/**
 * Authentication Service Layer
 * Encapsulates all authentication endpoints, credentials transport, and session termination
 */
export const authService = {
  /**
   * Authenticate user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", credentials);
    return response.data;
  },

  /**
   * Register a new user account
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/register", credentials);
    return response.data;
  },

  /**
   * Terminate user session and blacklist current JWT token
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/api/auth/logout");
    return response.data;
  },
};

export default authService;
