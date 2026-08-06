/**
 * The Payment API: domain types (`Payment` and its `PaymentTransaction`
 * history, both keyed to an order via a bare FK string — see
 * `types/payment.types.ts`), DTOs + Zod validation schemas (built from
 * reusable field-level schemas in `schemas/`), the repository contract
 * plus its Prisma implementation, the payment-provider abstraction
 * (Stripe/SSLCommerz/bKash/Nagad skeletons — no real SDK/gateway call
 * anywhere in them — plus cash on delivery modeled as a gateway-free
 * `manual` provider — see `providers/`), the mapper/currency/reference/
 * status utilities that support it all, and the controller/routes
 * exposing it at `/api/v1/payments`. Authenticated users only —
 * creating a payment reuses `modules/order` (via `OrderLookupProvider`)
 * rather than reimplementing order validation. No real gateway
 * integration or refund processing live here — see `providers/`'s doc
 * comments and this module's `PaymentService`.
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
  PAYMENT_STATUS_TRANSITIONS,
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

export {
  cancelPaymentSchema,
  createPaymentSchema,
  paymentIdParamsSchema,
  paymentOrderIdParamsSchema,
  refundPaymentSchema,
  retryPaymentSchema,
  transactionIdParamsSchema,
  verifyPaymentSchema,
} from "./validation";
export type {
  CancelPaymentDto,
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentTransactionResponseDto,
  RefundPaymentDto,
  RetryPaymentDto,
  VerifyPaymentDto,
} from "./dto";

export type {
  OrderLookupProvider,
  OrderPaymentSnapshot,
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
  canTransitionPaymentStatus,
  formatMoney,
  formatPaymentReference,
  getPaymentReferencePrefix,
  getRefundableAmount,
  isCancellable,
  isRefundable,
  isSuccessful,
  parsePaymentReference,
} from "./utils";

export { PaymentPrismaRepository } from "./repository";
export type { PaymentRepository } from "./repository";

export { PaymentService } from "./service";

export { PaymentController } from "./controller";

export { paymentRouter } from "./routes";
