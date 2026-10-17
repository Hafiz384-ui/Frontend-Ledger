import * as yup from "yup";

/**
 * Authentication Validation Schemas
 * Strict validation for User Authentication with clear UX error messages
 */

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9_ ]+$/,
      "Username can only contain alphanumeric characters and underscores"
    ),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;
