import * as yup from "yup";

/**
 * Account Validation Schemas
 * Validation for opening new bank accounts
 */

export const createAccountSchema = yup.object({
  currency: yup
    .string()
    .trim()
    .default("INR")
    .oneOf(["INR", "USD", "EUR", "GBP"], "Invalid currency selected"),
});

export type CreateAccountFormData = yup.InferType<typeof createAccountSchema>;
