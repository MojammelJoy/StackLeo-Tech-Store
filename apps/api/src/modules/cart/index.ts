/**
 * Reusable cart infrastructure: domain types (cart + item + computed
 * summary), DTOs + Zod validation schemas (built from reusable field-
 * level schemas in `schemas/`), the repository contract (plus its
 * currently-skeletal Prisma implementation), a skeleton service, the
 * pluggable discount/tax/shipping price-calculator abstraction, and the
 * mapper/utility helpers that support it all. No controllers, routes,
 * CRUD implementation, or business logic (checkout/order/payment
 * concerns) live here.
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
  UpdateCartInput,
  UpdateCartItemInput,
} from "./types";

export { currencySchema, quantitySchema } from "./schemas";

export { addCartItemSchema, createCartSchema, updateCartItemSchema } from "./validation";
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

export { CartPrismaRepository } from "./repository";
export type { CartRepository } from "./repository";

export { CartService } from "./service";
