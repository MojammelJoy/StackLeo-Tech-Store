import { ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { PERMISSIONS, userHasPermission } from "../../rbac";
import { PRODUCT_STATUSES, PRODUCT_VISIBILITIES } from "../constants";
import { productMapper } from "../mapper";
import { generateUniqueSlug } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type {
  CursorPaginatedResult,
  CursorPaginationParams,
  PaginatedResult,
  ParsedQuery,
} from "../../../common";
import type {
  BulkProductResponseDto,
  CreateProductDto,
  CreateProductVariantDto,
  ProductResponseDto,
  ProductSpecificationResponseDto,
  ProductSummaryResponseDto,
  ProductVariantResponseDto,
  ReplaceProductSpecificationsDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateProductVariantDto,
  UpdateProductVisibilityDto,
} from "../dto";
import type { ProductFilterOptions } from "../interfaces";
import type {
  ProductImageLookupRepository,
  ProductRepository,
  ProductSpecificationRepository,
  ProductVariantRepository,
} from "../repository";
import type { Product } from "../types";

/**
 * Implements every Product API operation: CRUD, soft delete + restore,
 * status/visibility transitions, listing (page and cursor pagination,
 * filtering, sorting, search), variants, and specifications. Depends on
 * `ProductRepository`/`ProductVariantRepository`/
 * `ProductSpecificationRepository` (interfaces only; see `repository/`),
 * never on Prisma directly.
 *
 * `actor: AuthenticatedUser | null` on every read method is this
 * module's visibility enforcement hook: a caller without
 * `product:read` (i.e. every anonymous storefront request, and any
 * authenticated caller who isn't staff) only ever sees `ACTIVE` +
 * `PUBLIC`, non-deleted products, regardless of what filters they pass
 * — see `scopeFiltersForActor`/`isVisibleTo`. Write methods take
 * `actor: AuthenticatedUser` (never null) since every mutating route
 * requires authentication + `product:*` permission at the route layer;
 * this service still receives the actor to attribute changes in logs.
 */
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly variantRepository: ProductVariantRepository,
    private readonly specificationRepository: ProductSpecificationRepository,
    private readonly productImageLookup: ProductImageLookupRepository,
  ) {}

  async list(
    query: ParsedQuery,
    filters: ProductFilterOptions,
    actor: AuthenticatedUser | null,
  ): Promise<PaginatedResult<ProductSummaryResponseDto>> {
    const scoped = this.scopeFiltersForActor(filters, actor);
    const result = await this.productRepository.findAll(query, scoped);
    return { items: productMapper.toSummaryList(result.items), meta: result.meta };
  }

  async listCursor(
    params: CursorPaginationParams,
    query: Pick<ParsedQuery, "sort" | "search">,
    filters: ProductFilterOptions,
    actor: AuthenticatedUser | null,
  ): Promise<CursorPaginatedResult<ProductSummaryResponseDto>> {
    const scoped = this.scopeFiltersForActor(filters, actor);
    const result = await this.productRepository.findAllCursor(params, query, scoped);
    return { items: productMapper.toSummaryList(result.items), meta: result.meta };
  }

  async getById(id: string, actor: AuthenticatedUser | null): Promise<ProductResponseDto> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const product = await this.productRepository.findById(id, { includeDeleted: canBypass });
    if (!product || !this.isVisibleTo(product, canBypass)) {
      throw new NotFoundError("Product not found");
    }
    return this.toFullResponse(product);
  }

  async getBySlug(slug: string, actor: AuthenticatedUser | null): Promise<ProductResponseDto> {
    const canBypass = this.canBypassVisibilityScope(actor);
    const product = await this.productRepository.findBySlug(slug, { includeDeleted: canBypass });
    if (!product || !this.isVisibleTo(product, canBypass)) {
      throw new NotFoundError("Product not found");
    }
    return this.toFullResponse(product);
  }

  /**
   * Resolves multiple products by id in one query
   * (`ProductRepository.findManyByIds`) plus one query for their display
   * images (`ProductImageLookupRepository.findDisplayImagesByProductIds`)
   * — never one query per product, regardless of how many ids are
   * requested. Duplicate ids collapse to a single entry. An id that
   * doesn't exist, or isn't visible to `actor`, is silently omitted
   * rather than failing the whole request — storefront consumers
   * (cart, wishlist) need "whatever's still available," not an
   * all-or-nothing lookup. Returned in the order `ids` first mentions
   * each product, not database order.
   */
  async listByIds(
    ids: string[],
    actor: AuthenticatedUser | null,
  ): Promise<BulkProductResponseDto[]> {
    const uniqueIds = [...new Set(ids)];
    const canBypass = this.canBypassVisibilityScope(actor);

    const products = await this.productRepository.findManyByIds(uniqueIds, {
      includeDeleted: canBypass,
    });
    const visible = canBypass
      ? products
      : products.filter((product) => this.isVisibleTo(product, false));

    if (visible.length === 0) {
      return [];
    }

    const images = await this.productImageLookup.findDisplayImagesByProductIds(
      visible.map((product) => product.id),
    );

    const byId = new Map(visible.map((product) => [product.id, product]));
    const ordered: Product[] = [];
    for (const id of uniqueIds) {
      const product = byId.get(id);
      if (product) {
        ordered.push(product);
      }
    }

    return ordered.map((product) => ({
      ...productMapper.toSummaryDto(product),
      image: images.get(product.id) ?? null,
    }));
  }

  async create(dto: CreateProductDto, actor: AuthenticatedUser): Promise<ProductResponseDto> {
    await this.assertSkuAvailable(dto.sku);

    const variantInputs = dto.variants ?? [];
    for (const variant of variantInputs) {
      await this.assertSkuAvailable(variant.sku, dto.sku);
    }

    const slug = await generateUniqueSlug(dto.name, (candidate) =>
      this.productRepository.existsBySlug(candidate),
    );

    const product = await this.productRepository.createWithRelations(
      {
        name: dto.name,
        slug,
        description: dto.description,
        sku: dto.sku,
        price: dto.price,
        currency: dto.currency,
        status: dto.status,
        visibility: dto.visibility,
        categoryId: dto.categoryId,
        tags: dto.tags,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords,
      },
      variantInputs,
      dto.specifications ?? [],
    );

    logger.info({ productId: product.id, actorId: actor.id }, "Product created");
    return this.toFullResponse(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    actor: AuthenticatedUser,
  ): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const updated = await this.productRepository.update(id, dto);
    logger.info({ productId: id, actorId: actor.id }, "Product updated");
    return this.toFullResponse(updated);
  }

  async updateStatus(
    id: string,
    dto: UpdateProductStatusDto,
    actor: AuthenticatedUser,
  ): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const updated = await this.productRepository.updateStatus(id, dto.status);
    logger.info({ productId: id, status: dto.status, actorId: actor.id }, "Product status changed");
    return this.toFullResponse(updated);
  }

  async updateVisibility(
    id: string,
    dto: UpdateProductVisibilityDto,
    actor: AuthenticatedUser,
  ): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    const updated = await this.productRepository.updateVisibility(id, dto.visibility);
    logger.info(
      { productId: id, visibility: dto.visibility, actorId: actor.id },
      "Product visibility changed",
    );
    return this.toFullResponse(updated);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product not found");
    }

    await this.productRepository.softDelete(id);
    logger.info({ productId: id, actorId: actor.id }, "Product soft-deleted");
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new NotFoundError("Product not found");
    }
    if (!existing.deletedAt) {
      throw new ConflictError("Product is not deleted");
    }

    await this.productRepository.restore(id);
    const restored = await this.productRepository.findById(id);
    if (!restored) {
      throw new NotFoundError("Product not found");
    }

    logger.info({ productId: id, actorId: actor.id }, "Product restored");
    return this.toFullResponse(restored);
  }

  async addVariant(
    productId: string,
    dto: CreateProductVariantDto,
    actor: AuthenticatedUser,
  ): Promise<ProductVariantResponseDto> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await this.assertSkuAvailable(dto.sku, product.sku);

    const variant = await this.variantRepository.create({ productId, ...dto });
    logger.info({ productId, variantId: variant.id, actorId: actor.id }, "Product variant added");
    return productMapper.toVariantResponseDto(variant);
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
    actor: AuthenticatedUser,
  ): Promise<ProductVariantResponseDto> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await this.findOwnedVariant(productId, variantId);

    const updated = await this.variantRepository.update(variantId, dto);
    logger.info({ productId, variantId, actorId: actor.id }, "Product variant updated");
    return productMapper.toVariantResponseDto(updated);
  }

  async removeVariant(
    productId: string,
    variantId: string,
    actor: AuthenticatedUser,
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await this.findOwnedVariant(productId, variantId);

    await this.variantRepository.delete(variantId);
    logger.info({ productId, variantId, actorId: actor.id }, "Product variant removed");
  }

  async replaceSpecifications(
    productId: string,
    dto: ReplaceProductSpecificationsDto,
    actor: AuthenticatedUser,
  ): Promise<ProductSpecificationResponseDto[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const specifications = await this.specificationRepository.replaceAll(
      productId,
      dto.specifications,
    );
    logger.info(
      { productId, count: specifications.length, actorId: actor.id },
      "Product specifications replaced",
    );
    return specifications.map(productMapper.toSpecificationResponseDto);
  }

  private async findOwnedVariant(productId: string, variantId: string) {
    const variant = await this.variantRepository.findById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Product variant not found");
    }
    return variant;
  }

  /** Rejects a SKU that collides with the product's own SKU (when
   * checking a variant's SKU — `productSku` is omitted when checking a
   * product's own new SKU) or with any SKU already persisted (across
   * both `products` and `product_variants` — the two share one
   * identifier namespace). Nested variants created alongside a new
   * product can't collide *with each other*: `createProductSchema`'s
   * `superRefine` already rejects duplicate SKUs within that batch. */
  private async assertSkuAvailable(sku: string, productSku?: string): Promise<void> {
    if (productSku !== undefined && sku === productSku) {
      throw new ConflictError(`Variant SKU "${sku}" conflicts with the product's own SKU`);
    }

    const exists = await this.productRepository.existsBySku(sku);
    if (exists) {
      throw new ConflictError(`A product or variant with SKU "${sku}" already exists`);
    }
  }

  private canBypassVisibilityScope(actor: AuthenticatedUser | null): boolean {
    return actor !== null && userHasPermission(actor, PERMISSIONS.PRODUCT_READ);
  }

  private isVisibleTo(product: Product, canBypass: boolean): boolean {
    if (canBypass) {
      return true;
    }
    return (
      product.status === PRODUCT_STATUSES.ACTIVE &&
      product.visibility === PRODUCT_VISIBILITIES.PUBLIC
    );
  }

  private scopeFiltersForActor(
    filters: ProductFilterOptions,
    actor: AuthenticatedUser | null,
  ): ProductFilterOptions {
    if (this.canBypassVisibilityScope(actor)) {
      return filters;
    }
    return {
      ...filters,
      status: PRODUCT_STATUSES.ACTIVE,
      visibility: PRODUCT_VISIBILITIES.PUBLIC,
      includeDeleted: false,
    };
  }

  private async toFullResponse(product: Product): Promise<ProductResponseDto> {
    const [variants, specifications] = await Promise.all([
      this.variantRepository.findByProductId(product.id),
      this.specificationRepository.findByProductId(product.id),
    ]);
    return productMapper.toResponseDto(product, variants, specifications);
  }
}
