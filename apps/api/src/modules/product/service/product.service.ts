import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CreateProductDto, UpdateProductDto } from "../dto";
import type { ProductFilterOptions } from "../interfaces";
import type { ProductRepository } from "../repository";
import type { Product } from "../types";

/**
 * Skeleton product service — the operations a concrete implementation
 * will expose once product persistence exists. Depends on
 * `ProductRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations or business rules (SKU uniqueness, pricing, status
 * transitions, etc.) happen in this foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes (audit logging, `createdBy`/`updatedBy`) without
 * every call site's signature changing later. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findById(id: string): Promise<Product | null> {
    throw new NotImplementedError(`ProductService.findById is not implemented yet (id: ${id})`);
  }

  async findBySku(sku: string): Promise<Product | null> {
    throw new NotImplementedError(`ProductService.findBySku is not implemented yet (sku: ${sku})`);
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: ProductFilterOptions,
  ): Promise<PaginatedResult<Product>> {
    throw new NotImplementedError("ProductService.findAll is not implemented yet");
  }

  async create(_dto: CreateProductDto, _actor: AuthenticatedUser): Promise<Product> {
    throw new NotImplementedError("ProductService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateProductDto, _actor: AuthenticatedUser): Promise<Product> {
    throw new NotImplementedError(`ProductService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(`ProductService.delete is not implemented yet (id: ${id})`);
  }
}
