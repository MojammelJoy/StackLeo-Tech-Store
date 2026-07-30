import { z } from "zod";

import { config } from "../../../config";
import {
  MEDIA_OWNER_TYPES,
  MEDIA_PURPOSE_MAX_SIZE_BYTES,
  MEDIA_PURPOSE_MIME_TYPES,
  MEDIA_PURPOSES,
  STORAGE_PROVIDERS,
} from "../constants";
import { altTextSchema, fileNameSchema, mimeTypeSchema } from "../schemas";

/**
 * Validates a media asset registration payload — assumed to run *after*
 * the file has already been stored by an `UploadProvider` (see
 * `providers/`), since `url`/`provider`/`providerRef` are its outputs,
 * not something a client invents. Three cross-field rules:
 *
 * - `mimeType` must be one of `MEDIA_PURPOSE_MIME_TYPES[purpose]`.
 * - `sizeBytes` must not exceed `MEDIA_PURPOSE_MAX_SIZE_BYTES[purpose]`.
 * - `provider` must be `cloudinary` in production — the same
 *   prod-vs-dev split `modules/brand`'s URL schema and
 *   `modules/inventory`'s movement schema already use elsewhere in this
 *   app. Local disk storage is fine for development/testing but isn't
 *   durable across deploys or shared across instances, so it's rejected
 *   once `config.isProduction` is true.
 */
export const createMediaAssetSchema = z
  .object({
    fileName: fileNameSchema,
    mimeType: mimeTypeSchema,
    sizeBytes: z.number().int().positive(),
    url: z.string().url(),
    provider: z.enum([STORAGE_PROVIDERS.CLOUDINARY, STORAGE_PROVIDERS.LOCAL]),
    providerRef: z.string().min(1),
    purpose: z.enum([
      MEDIA_PURPOSES.PRODUCT_IMAGE,
      MEDIA_PURPOSES.GALLERY_IMAGE,
      MEDIA_PURPOSES.BRAND_LOGO,
      MEDIA_PURPOSES.CATEGORY_IMAGE,
      MEDIA_PURPOSES.USER_AVATAR,
      MEDIA_PURPOSES.PDF_MANUAL,
      MEDIA_PURPOSES.WARRANTY_DOCUMENT,
      MEDIA_PURPOSES.VIDEO,
    ]),
    ownerType: z
      .enum([
        MEDIA_OWNER_TYPES.PRODUCT,
        MEDIA_OWNER_TYPES.BRAND,
        MEDIA_OWNER_TYPES.CATEGORY,
        MEDIA_OWNER_TYPES.USER,
      ])
      .optional(),
    ownerId: z.string().min(1).optional(),
    altText: altTextSchema.optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    durationSeconds: z.number().int().positive().optional(),
  })
  .refine((data) => MEDIA_PURPOSE_MIME_TYPES[data.purpose]?.includes(data.mimeType), {
    message: "MIME type is not allowed for the given purpose",
    path: ["mimeType"],
  })
  .refine(
    (data) => {
      const maxSize = MEDIA_PURPOSE_MAX_SIZE_BYTES[data.purpose];
      return maxSize === undefined || data.sizeBytes <= maxSize;
    },
    {
      message: "File size exceeds the limit for the given purpose",
      path: ["sizeBytes"],
    },
  )
  .refine((data) => !config.isProduction || data.provider === STORAGE_PROVIDERS.CLOUDINARY, {
    message: "Local storage is not permitted in production; use Cloudinary",
    path: ["provider"],
  });
