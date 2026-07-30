import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ProductFilterOptions } from "../interfaces";
import type { CreateProductInput, Product, UpdateProductInput } from "../types";

/**
 * Persistence contract for the Product domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `ProductPrismaRepository` for a test double (or
 * a different persistence layer entirely) never touches service code.
 */
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(query: ParsedQuery, filters?: ProductFilterOptions): Promise<PaginatedResult<Product>>;
  existsBySku(sku: string): Promise<boolean>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
}
