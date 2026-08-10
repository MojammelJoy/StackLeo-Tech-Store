import { describe, expect, it, vi } from "vitest";

import { PRODUCT_STATUSES, PRODUCT_VISIBILITIES } from "../constants";

import { ProductService } from "./product.service";

import type { AuthenticatedUser } from "../../../auth";
import type {
  ProductDisplayImage,
  ProductImageLookupRepository,
  ProductRepository,
  ProductSpecificationRepository,
  ProductVariantRepository,
} from "../repository";
import type { Product } from "../types";

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-1",
    name: "Test Product",
    slug: "test-product",
    description: null,
    sku: "SKU-1",
    price: 1000,
    currency: "USD",
    status: PRODUCT_STATUSES.ACTIVE,
    visibility: PRODUCT_VISIBILITIES.PUBLIC,
    categoryId: null,
    tags: [],
    seoTitle: null,
    seoDescription: null,
    seoKeywords: [],
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildProductRepository(overrides: Partial<ProductRepository> = {}): ProductRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    findManyByIds: vi.fn().mockResolvedValue([]),
    findAll: vi.fn(),
    findAllCursor: vi.fn(),
    existsBySku: vi.fn().mockResolvedValue(false),
    existsBySlug: vi.fn().mockResolvedValue(false),
    createWithRelations: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    updateVisibility: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    ...overrides,
  };
}

function buildVariantRepository(
  overrides: Partial<ProductVariantRepository> = {},
): ProductVariantRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByProductId: vi.fn().mockResolvedValue([]),
    existsBySku: vi.fn().mockResolvedValue(false),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

function buildSpecificationRepository(
  overrides: Partial<ProductSpecificationRepository> = {},
): ProductSpecificationRepository {
  return {
    findByProductId: vi.fn().mockResolvedValue([]),
    replaceAll: vi.fn(),
    ...overrides,
  };
}

function buildImageLookupRepository(
  overrides: Partial<ProductImageLookupRepository> = {},
): ProductImageLookupRepository {
  return {
    findDisplayImagesByProductIds: vi.fn().mockResolvedValue(new Map()),
    ...overrides,
  };
}

function buildService(overrides: {
  productRepository?: ProductRepository;
  imageLookup?: ProductImageLookupRepository;
}): ProductService {
  return new ProductService(
    overrides.productRepository ?? buildProductRepository(),
    buildVariantRepository(),
    buildSpecificationRepository(),
    overrides.imageLookup ?? buildImageLookupRepository(),
  );
}

const ANONYMOUS: AuthenticatedUser | null = null;

describe("ProductService", () => {
  describe("listByIds", () => {
    it("returns visible products for an anonymous caller", async () => {
      const productRepository = buildProductRepository({
        findManyByIds: vi
          .fn()
          .mockResolvedValue([
            buildProduct({ id: "p1" }),
            buildProduct({ id: "p2", sku: "SKU-2", slug: "test-product-2" }),
          ]),
      });
      const service = buildService({ productRepository });

      const result = await service.listByIds(["p1", "p2"], ANONYMOUS);

      expect(result.map((product) => product.id)).toEqual(["p1", "p2"]);
    });

    it("returns products in the order ids were requested, not repository order", async () => {
      // Repository intentionally returns p2 before p1.
      const productRepository = buildProductRepository({
        findManyByIds: vi
          .fn()
          .mockResolvedValue([
            buildProduct({ id: "p2", sku: "SKU-2", slug: "test-product-2" }),
            buildProduct({ id: "p1" }),
          ]),
      });
      const service = buildService({ productRepository });

      const result = await service.listByIds(["p1", "p2"], ANONYMOUS);

      expect(result.map((product) => product.id)).toEqual(["p1", "p2"]);
    });

    it("collapses duplicate ids to a single result", async () => {
      const productRepository = buildProductRepository({
        findManyByIds: vi.fn().mockResolvedValue([buildProduct({ id: "p1" })]),
      });
      const service = buildService({ productRepository });

      const result = await service.listByIds(["p1", "p1", "p1"], ANONYMOUS);

      expect(result).toHaveLength(1);
      expect(productRepository.findManyByIds).toHaveBeenCalledWith(["p1"], expect.anything());
    });

    it("omits missing ids instead of failing the whole request", async () => {
      const productRepository = buildProductRepository({
        // "missing-id" was requested but the repository never returns it.
        findManyByIds: vi.fn().mockResolvedValue([buildProduct({ id: "p1" })]),
      });
      const service = buildService({ productRepository });

      const result = await service.listByIds(["p1", "missing-id"], ANONYMOUS);

      expect(result.map((product) => product.id)).toEqual(["p1"]);
    });

    it("hides a draft/private product from an anonymous caller", async () => {
      const productRepository = buildProductRepository({
        findManyByIds: vi
          .fn()
          .mockResolvedValue([
            buildProduct({ id: "p1" }),
            buildProduct({ id: "p2", status: "draft", visibility: "private" }),
          ]),
      });
      const service = buildService({ productRepository });

      const result = await service.listByIds(["p1", "p2"], ANONYMOUS);

      expect(result.map((product) => product.id)).toEqual(["p1"]);
    });

    it("calls findManyByIds and findDisplayImagesByProductIds exactly once, regardless of how many ids are requested", async () => {
      const manyIds = Array.from({ length: 25 }, (_, index) => `p${index}`);
      const productRepository = buildProductRepository({
        findManyByIds: vi
          .fn()
          .mockResolvedValue(
            manyIds.map((id) => buildProduct({ id, sku: `SKU-${id}`, slug: `slug-${id}` })),
          ),
      });
      const imageLookup = buildImageLookupRepository();
      const service = buildService({ productRepository, imageLookup });

      await service.listByIds(manyIds, ANONYMOUS);

      expect(productRepository.findManyByIds).toHaveBeenCalledTimes(1);
      expect(imageLookup.findDisplayImagesByProductIds).toHaveBeenCalledTimes(1);
    });

    it("attaches the resolved display image when one exists", async () => {
      const productRepository = buildProductRepository({
        findManyByIds: vi.fn().mockResolvedValue([buildProduct({ id: "p1" })]),
      });
      const image: ProductDisplayImage = {
        id: "media-1",
        url: "https://example.com/a.jpg",
        altText: "A widget",
      };
      const imageLookup = buildImageLookupRepository({
        findDisplayImagesByProductIds: vi.fn().mockResolvedValue(new Map([["p1", image]])),
      });
      const service = buildService({ productRepository, imageLookup });

      const result = await service.listByIds(["p1"], ANONYMOUS);

      expect(result[0]?.image).toEqual(image);
    });

    it("returns image: null for a product with no qualifying image", async () => {
      const productRepository = buildProductRepository({
        findManyByIds: vi.fn().mockResolvedValue([buildProduct({ id: "p1" })]),
      });
      const service = buildService({ productRepository });

      const result = await service.listByIds(["p1"], ANONYMOUS);

      expect(result[0]?.image).toBeNull();
    });
  });
});
