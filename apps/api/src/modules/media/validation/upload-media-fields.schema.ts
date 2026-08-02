import { z } from "zod";

import { MEDIA_OWNER_TYPES, MEDIA_PURPOSES } from "../constants";
import { altTextSchema } from "../schemas";

/**
 * Validates the non-file form fields of a multipart upload request
 * (`middleware/upload.middleware.ts` is what reads the file itself into
 * `req.file`/`req.files`) — the `purpose`/`ownerType`/`ownerId`/
 * `altText` a caller supplies alongside it. Deliberately has no
 * `url`/`provider`/`providerRef` fields: those are computed by
 * whichever `UploadProvider` actually stores the file
 * (`service/media.service.ts`), never supplied by the caller, unlike
 * `create-media-asset.schema.ts`'s metadata-registration flow.
 */
export const uploadMediaFieldsSchema = z
  .object({
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
    ownerId: z.string().trim().min(1).optional(),
    altText: altTextSchema.optional(),
  })
  .refine((data) => (data.ownerType === undefined) === (data.ownerId === undefined), {
    message: "ownerType and ownerId must be provided together",
    path: ["ownerId"],
  });
