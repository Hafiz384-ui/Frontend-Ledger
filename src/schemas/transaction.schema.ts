import * as yup from "yup";

/**
 * Transaction & Money Transfer Validation Schemas
 * Enforces ObjectId integrity, positive balances, self-transfer prevention, and idempotency
 */

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const transferSchema = yup.object({
  fromAccount: yup
    .string()
    .trim()
    .required("Source account is required")
    .matches(OBJECT_ID_REGEX, "Invalid source account ID format (must be 24-char hexadecimal)"),
  toAccount: yup
    .string()
    .trim()
    .required("Recipient account is required")
    .matches(OBJECT_ID_REGEX, "Invalid recipient account ID format (must be 24-char hexadecimal)")
    .notOneOf([yup.ref("fromAccount")], "Cannot transfer money to the same account"),
  amount: yup
    .number()
    .typeError("Transfer amount must be a valid number")
    .required("Amount is required")
    .positive("Transfer amount must be greater than zero")
    .min(1, "Minimum transfer amount is ₹1"),
  idempotencyKey: yup
    .string()
    .trim()
    .optional(),
});

export type TransferFormData = yup.InferType<typeof transferSchema>;

export const seedFundsSchema = yup.object({
  toAccount: yup
    .string()
    .trim()
    .required("Target recipient account ID is required")
    .matches(OBJECT_ID_REGEX, "Must be a valid 24-character hexadecimal Account ObjectId"),
  amount: yup
    .number()
    .typeError("Amount must be a valid number")
    .required("Amount is required")
    .positive("Amount must be greater than zero")
    .min(1, "Minimum seed amount is ₹1"),
  idempotencyKey: yup
    .string()
    .trim()
    .required("Idempotency key is required to guarantee duplicate safety"),
});

export type SeedFundsFormData = yup.InferType<typeof seedFundsSchema>;
