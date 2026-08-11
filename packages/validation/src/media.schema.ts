import { z } from "zod";

import type {
  MediaAsset,
  MediaByOwnerResponse,
  MediaOwnerType,
  MediaPurpose,
  MediaStatus,
  StorageProviderName,
} from "@stackleo/types";

const mediaPurposeSchema = z.enum([
  "product_image",
  "gallery_image",
  "brand_logo",
  "category_image",
  "user_avatar",
  "pdf_manual",
  "warranty_document",
  "video",
]) satisfies z.ZodType<MediaPurpose>;

const mediaOwnerTypeSchema = z.enum([
  "product",
  "brand",
  "category",
  "user",
]) satisfies z.ZodType<MediaOwnerType>;

const mediaStatusSchema = z.enum([
  "pending",
  "ready",
  "failed",
  "deleted",
]) satisfies z.ZodType<MediaStatus>;

const storageProviderNameSchema = z.enum([
  "cloudinary",
  "local",
]) satisfies z.ZodType<StorageProviderName>;

/** Validates one asset as returned by `GET /api/v1/media/owner/:ownerType/:ownerId` —
 * same pattern as `product.schema.ts`'s `bulkProductLookupItemSchema`. */
export const mediaAssetSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileExtension: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  formattedSize: z.string(),
  url: z.string(),
  provider: storageProviderNameSchema,
  purpose: mediaPurposeSchema,
  ownerType: mediaOwnerTypeSchema.nullable(),
  ownerId: z.string().nullable(),
  altText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  durationSeconds: z.number().nullable(),
  status: mediaStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<MediaAsset>;

/** Validates the `data` payload of `GET /api/v1/media/owner/:ownerType/:ownerId`. */
export const mediaByOwnerResponseSchema = z.object({
  assets: z.array(mediaAssetSchema),
}) satisfies z.ZodType<MediaByOwnerResponse>;
