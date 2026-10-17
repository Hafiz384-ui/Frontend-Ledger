/**
 * Authentication Type Definitions
 * DTOs and entity representations for users and session management
 */

export interface User {
  _id: string;
  username: string;
  email: string;
  systemUser: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LogoutResponse {
  message: string;
}
