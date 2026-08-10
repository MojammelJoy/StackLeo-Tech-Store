import { z } from "zod";

import type {
  AddCartItemRequest,
  Cart,
  CartItem,
  CartResponse,
  CartStatus,
  CartSummary,
  UpdateCartItemRequest,
} from "@stackleo/types";

/** Mirrors apps/api's `CART_ITEM_MIN_QUANTITY`/`CART_ITEM_MAX_QUANTITY`
 * (apps/api/src/modules/cart/constants/cart.constants.ts). */
const CART_ITEM_MIN_QUANTITY = 1;
const CART_ITEM_MAX_QUANTITY = 99;

const cartItemQuantitySchema = z
  .number()
  .int()
  .min(CART_ITEM_MIN_QUANTITY)
  .max(CART_ITEM_MAX_QUANTITY);

/** Mirrors apps/api's `addCartItemSchema` exactly — deliberately no
 * `unitPrice` field; the server always prices the item itself. */
export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  quantity: cartItemQuantitySchema,
}) satisfies z.ZodType<AddCartItemRequest>;

/** Mirrors apps/api's `updateCartItemSchema` exactly — both fields
 * optional, same quantity bounds as adding. */
export const updateCartItemSchema = z
  .object({
    quantity: cartItemQuantitySchema,
    selected: z.boolean(),
  })
  .partial() satisfies z.ZodType<UpdateCartItemRequest>;

const cartStatusSchema = z.enum([
  "active",
  "merged",
  "abandoned",
  "converted",
]) satisfies z.ZodType<CartStatus>;

const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
  selected: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<CartItem>;

const cartSummarySchema = z.object({
  itemCount: z.number(),
  subtotal: z.number(),
  discountTotal: z.number(),
  taxTotal: z.number(),
  shippingTotal: z.number(),
  total: z.number(),
  currency: z.string(),
}) satisfies z.ZodType<CartSummary>;

/** Validates a `Cart` object as returned by every Cart API endpoint —
 * same pattern as `category.schema.ts`'s `categorySchema`. */
export const cartSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  guestToken: z.string().nullable(),
  currency: z.string(),
  status: cartStatusSchema,
  items: z.array(cartItemSchema),
  summary: cartSummarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Cart>;

/** Validates the `data` payload of every Cart endpoint response — same
 * pattern as `auth.schema.ts`'s `authResponseSchema`. */
export const cartResponseSchema = z.object({
  cart: cartSchema,
}) satisfies z.ZodType<CartResponse>;
