import type { CurrencyCode, PaymentTransactionStatus, PaymentTransactionType } from "../constants";

/** The public-facing shape of a PaymentTransaction. Adds
 * `formattedAmount`, computed the same way as `PaymentResponseDto`'s. */
export interface PaymentTransactionResponseDto {
  id: string;
  paymentId: string;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  amount: number;
  currency: CurrencyCode;
  formattedAmount: string;
  providerRef: string | null;
  errorMessage: string | null;
  createdAt: Date;
}
