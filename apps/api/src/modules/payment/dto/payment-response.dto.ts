import type { CurrencyCode, PaymentMethod, PaymentProviderName, PaymentStatus } from "../constants";

/** The public-facing shape of a Payment. Adds `formattedAmount` — a
 * human-readable rendering of `amount`/`currency` computed by `mapper/`
 * (via `utils/money.util.ts`), never stored. */
export interface PaymentResponseDto {
  id: string;
  orderId: string;
  userId: string | null;
  method: PaymentMethod;
  provider: PaymentProviderName;
  status: PaymentStatus;
  amount: number;
  currency: CurrencyCode;
  formattedAmount: string;
  providerRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}
