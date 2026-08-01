export interface ProductVariantResponseDto {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number | null;
  currency: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
