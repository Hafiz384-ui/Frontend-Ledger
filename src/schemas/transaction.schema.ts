import * as yup from "yup";

/**
 * Transaction & Money Transfer Validation Schemas
 * Enforces ObjectId integrity, positive balances, self-transfer prevention, and idempotency.
 * Strictly prevents amounts starting with 0 (e.g. 084787, 0, 0.5) for both users and admins.
 */

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const VALID_AMOUNT_REGEX = /^[1-9]\d*(\.\d+)?$/;

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
    .mixed()
    .required("Amount is required")
    .test(
      "valid-transfer-amount",
      "Amount must start with 1 or greater and cannot start with 0",
      function (value) {
        const raw = String(this.originalValue ?? value ?? "").trim();
        if (!raw) return false;
        if (!VALID_AMOUNT_REGEX.test(raw)) return false;
        const num = Number(raw);
        return !isNaN(num) && num >= 1;
      }
    ),
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
    .mixed()
    .required("Amount is required")
    .test(
      "valid-seed-amount",
      "Amount must start with 1 or greater and cannot start with 0",
      function (value) {
        const raw = String(this.originalValue ?? value ?? "").trim();
        if (!raw) return false;
        if (!VALID_AMOUNT_REGEX.test(raw)) return false;
        const num = Number(raw);
        return !isNaN(num) && num >= 1 && num <= 10000000;
      }
    ),
  idempotencyKey: yup
    .string()
    .trim()
    .required("Idempotency key is required to guarantee duplicate safety"),
});

export type SeedFundsFormData = yup.InferType<typeof seedFundsSchema>;
