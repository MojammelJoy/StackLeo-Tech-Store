/**
 * Reusable payment infrastructure: domain types (`Payment` and its
 * `PaymentTransaction` history, both keyed to an order via a bare FK
 * string — see `types/payment.types.ts`), DTOs + Zod validation schemas
 * (built from reusable field-level schemas in `schemas/`), the
 * repository contract (plus its currently-skeletal Prisma
 * implementation), a skeleton service, the payment-provider abstraction
 * (Stripe/SSLCommerz/bKash/Nagad skeletons, plus cash-on-delivery
 * modeled as a gateway-free `manual` provider — see `providers/`), and
 * the mapper/currency/reference/status utilities that support it all.
 * No controllers, routes, business logic, actual gateway integrations,
 * or webhook handlers live here.
 */
export {
  DEFAULT_CURRENCY,
  PAYMENT_FILTERABLE_FIELDS,
  PAYMENT_METHOD_PROVIDERS,
  PAYMENT_METHODS,
  PAYMENT_MIN_AMOUNT,
  PAYMENT_PROVIDERS,
  PAYMENT_REFERENCE_SEQUENCE_PAD_LENGTH,
  PAYMENT_REFUND_REASON_MAX_LENGTH,
  PAYMENT_SORTABLE_FIELDS,
  PAYMENT_STATUSES,
  PAYMENT_TRANSACTION_STATUSES,
  PAYMENT_TRANSACTION_TYPES,
  SUPPORTED_CURRENCIES,
} from "./constants";
export type {
  CurrencyCode,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
  PaymentTransactionStatus,
  PaymentTransactionType,
} from "./constants";

export type {
  CreatePaymentInput,
  CreatePaymentTransactionInput,
  Money,
  Payment,
  PaymentTransaction,
  UpdatePaymentInput,
} from "./types";

export { amountSchema, currencyCodeSchema } from "./schemas";

export { createPaymentSchema, refundPaymentSchema, verifyPaymentSchema } from "./validation";
export type {
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentTransactionResponseDto,
  RefundPaymentDto,
  VerifyPaymentDto,
} from "./dto";

export type {
  PaymentFilterOptions,
  PaymentMapper,
  PaymentWebhookEvent,
  RefundRequest,
} from "./interfaces";

export { BkashProvider, NagadProvider, SslcommerzProvider, StripeProvider } from "./providers";
export type {
  BkashProviderConfig,
  ChargeRequest,
  NagadProviderConfig,
  PaymentProvider,
  SslcommerzProviderConfig,
  StripeProviderConfig,
} from "./providers";

export { paymentMapper } from "./mapper";

export {
  formatMoney,
  formatPaymentReference,
  getPaymentReferencePrefix,
  getRefundableAmount,
  isRefundable,
  isSuccessful,
} from "./utils";

export { PaymentPrismaRepository } from "./repository";
export type { PaymentRepository } from "./repository";

export { PaymentService } from "./service";
