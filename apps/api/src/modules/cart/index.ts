/**
 * The Cart API: domain types (cart + item + computed summary), DTOs +
 * Zod validation schemas (built from reusable field-level schemas in
 * `schemas/`), the repository contract plus its Prisma implementation
 * (cart/item persistence, plus a `ProductAvailabilityRepository` for
 * read-only product/inventory facts — see that interface's doc comment
 * for why), the pluggable discount/tax/shipping price-calculator
 * abstraction, the mapper/utility helpers that support it all, and the
 * controller/routes exposing it at `/api/v1/cart`. Checkout/order/
 * payment concerns are explicitly out of scope.
 */
export {
  CART_CURRENCY_CODE_LENGTH,
  CART_DEFAULT_CURRENCY,
  CART_FILTERABLE_FIELDS,
  CART_ITEM_MAX_QUANTITY,
  CART_ITEM_MIN_QUANTITY,
  CART_SORTABLE_FIELDS,
  CART_STATUSES,
} from "./constants";
export type { CartStatus } from "./constants";

export type {
  Cart,
  CartItem,
  CartSummary,
  CreateCartInput,
  CreateCartItemInput,
  MergeCartItemInput,
  MergeCartItemsParams,
  UpdateCartInput,
  UpdateCartItemInput,
} from "./types";

export { currencySchema, quantitySchema } from "./schemas";

export {
  addCartItemSchema,
  cartItemParamsSchema,
  createCartSchema,
  updateCartItemSchema,
} from "./validation";
export type {
  AddCartItemDto,
  CartItemResponseDto,
  CartResponseDto,
  CreateCartDto,
  UpdateCartItemDto,
} from "./dto";

export type {
  CartFilterOptions,
  CartMapper,
  CartPricingContext,
  DiscountCalculator,
  PriceCalculator,
  ShippingCalculator,
  TaxCalculator,
} from "./interfaces";

export {
  calculateCartSummary,
  calculateItemCount,
  calculateSubtotal,
  defaultPriceCalculator,
  getGuestCartExpiryDays,
  getSelectedItems,
  placeholderDiscountCalculator,
  placeholderShippingCalculator,
  placeholderTaxCalculator,
} from "./utils";

export { cartMapper } from "./mapper";

export { CartPrismaRepository, ProductAvailabilityPrismaRepository } from "./repository";
export type {
  CartRepository,
  ProductAvailabilityRepository,
  ProductAvailabilitySnapshot,
} from "./repository";

export { CartService } from "./service";

export { CartController } from "./controller";

export { cartRouter } from "./routes";
