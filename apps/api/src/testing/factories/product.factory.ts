import { PRODUCT_STATUSES, PRODUCT_VISIBILITIES } from "../../modules/product/constants";
import { randomTestId } from "../utils";

import { createFactory } from "./factory.util";

import type { Product } from "../../modules/product/types";

export const createTestProduct = createFactory<Product>(() => ({
  id: randomTestId("product"),
  name: "Test Product",
  slug: "test-product",
  description: null,
  sku: randomTestId("sku").toUpperCase(),
  price: 1999,
  currency: "USD",
  status: PRODUCT_STATUSES.ACTIVE,
  visibility: PRODUCT_VISIBILITIES.PUBLIC,
  categoryId: null,
  tags: [],
  seoTitle: null,
  seoDescription: null,
  seoKeywords: [],
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));
