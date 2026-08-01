import type {
  CreateProductVariantInput,
  ProductVariant,
  UpdateProductVariantInput,
} from "../types";

/**
 * Persistence contract for `ProductVariant`. The service depends on
 * this interface, never on a concrete implementation directly.
 */
export interface ProductVariantRepository {
  findById(id: string): Promise<ProductVariant | null>;
  findByProductId(productId: string): Promise<ProductVariant[]>;
  existsBySku(sku: string): Promise<boolean>;
  create(data: CreateProductVariantInput): Promise<ProductVariant>;
  update(id: string, data: UpdateProductVariantInput): Promise<ProductVariant>;
  delete(id: string): Promise<void>;
}
