import { PRODUCT_STATUSES } from "../../modules/product/constants";
import { createTestProduct } from "../factories";

/** A small, deterministic set of pre-built products — see
 * `user.fixtures.ts`'s comment for why this exists alongside
 * `factories/product.factory.ts` rather than instead of it. */
export const SAMPLE_PRODUCTS = [
  createTestProduct({ name: "Wireless Mouse", sku: "WM-001", price: 2999 }),
  createTestProduct({ name: "Mechanical Keyboard", sku: "MK-002", price: 8999 }),
  createTestProduct({
    name: "Discontinued Widget",
    sku: "DW-003",
    status: PRODUCT_STATUSES.ARCHIVED,
  }),
];
