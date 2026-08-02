import { Router } from "express";

import { authenticate, extractCurrentUser } from "../../../auth";
import { validateRequest } from "../../../common";
import { config } from "../../../config";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { STORAGE_PROVIDERS } from "../constants";
import { MediaController } from "../controller";
import { uploadMultipleFiles, uploadSingleFile } from "../middleware";
import { LocalUploadProvider } from "../providers";
import { MediaPrismaRepository } from "../repository";
import { MediaService } from "../service";
import {
  mediaIdParamsSchema,
  mediaOwnerParamsSchema,
  updateMediaAssetSchema,
  uploadMediaFieldsSchema,
} from "../validation";

import type { StorageProviderName } from "../constants";
import type { UploadProvider } from "../providers";

const mediaRepository = new MediaPrismaRepository();

const localProvider = new LocalUploadProvider({
  baseDirectory: config.media.localStorageDir,
  publicBaseUrl: config.media.localPublicUrlPath,
});
// A registry keyed by provider name — see `service/media.service.ts`'s
// class doc comment. `CLOUDINARY` is deliberately absent: no working
// `CloudinaryUploadProvider` exists (real Cloudinary integration is out
// of scope), so registering it here would let a caller select a
// provider that can only ever throw. Adding real Cloudinary support
// later is exactly one more entry in this object, never a service change.
const uploadProviders: Partial<Record<StorageProviderName, UploadProvider>> = {
  [STORAGE_PROVIDERS.LOCAL]: localProvider,
};

const mediaService = new MediaService(mediaRepository, uploadProviders, STORAGE_PROVIDERS.LOCAL);
const mediaController = new MediaController(mediaService);

/**
 * The full Media API surface, mounted at `/api/v1/media` (see
 * `routes/v1/index.ts`). Read endpoints use `extractCurrentUser` (never
 * `authenticate`) so anonymous storefront browsing works — a product
 * page's images are public — the service itself scopes results down to
 * `READY` assets for anyone without `media:read` (see
 * `service/media.service.ts`). Every mutating endpoint requires
 * authentication plus the matching `media:*` permission. Both upload
 * routes run multer (`uploadSingleFile`/`uploadMultipleFiles`) *before*
 * `validateRequest` — multer is what populates `req.body` from the
 * multipart form's non-file fields in the first place.
 */
export const mediaRouter: Router = Router();

mediaRouter.get("/", extractCurrentUser, mediaController.list);
mediaRouter.get(
  "/owner/:ownerType/:ownerId",
  extractCurrentUser,
  validateRequest({ params: mediaOwnerParamsSchema }),
  mediaController.getByOwner,
);

mediaRouter.post(
  "/upload",
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_CREATE),
  uploadSingleFile,
  validateRequest({ body: uploadMediaFieldsSchema }),
  mediaController.upload,
);
mediaRouter.post(
  "/upload-multiple",
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_CREATE),
  uploadMultipleFiles,
  validateRequest({ body: uploadMediaFieldsSchema }),
  mediaController.uploadMultiple,
);

mediaRouter.get(
  "/:id",
  extractCurrentUser,
  validateRequest({ params: mediaIdParamsSchema }),
  mediaController.getById,
);
mediaRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_UPDATE),
  validateRequest({ params: mediaIdParamsSchema, body: updateMediaAssetSchema }),
  mediaController.update,
);
mediaRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_DELETE),
  validateRequest({ params: mediaIdParamsSchema }),
  mediaController.delete,
);
mediaRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_DELETE),
  validateRequest({ params: mediaIdParamsSchema }),
  mediaController.restore,
);
