import { PRODUCT_STATUSES } from "../../modules/product/constants";
import { randomTestId } from "../utils";

import { createFactory } from "./factory.util";

import type { Product } from "../../modules/product/types";

export const createTestProduct = createFactory<Product>(() => ({
  id: randomTestId("product"),
  name: "Test Product",
  description: null,
  sku: randomTestId("sku").toUpperCase(),
  price: 1999,
  currency: "USD",
  status: PRODUCT_STATUSES.ACTIVE,
  categoryId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));
