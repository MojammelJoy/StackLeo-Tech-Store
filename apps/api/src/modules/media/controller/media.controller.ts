import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { MEDIA_FILTERABLE_FIELDS, MEDIA_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { MediaOwnerType, MediaPurpose, MediaStatus, StorageProviderName } from "../constants";
import type { UpdateMediaAssetDto, UploadMediaFieldsDto } from "../dto";
import type { MediaFilterOptions } from "../interfaces";
import type { MediaService } from "../service";
import type { UploadableFile } from "../types";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}

function toUploadableFile(file: Express.Multer.File): UploadableFile {
  return {
    fileName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    buffer: file.buffer,
  };
}

/** Combines `common/`'s generic `parsed.filters` (purpose/ownerType/
 * ownerId/status/provider) into one typed `MediaFilterOptions` —
 * mirrors `modules/product`/`modules/category`/`modules/brand`/
 * `modules/inventory`'s `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): MediaFilterOptions {
  const filters: MediaFilterOptions = {};

  const purpose = parsed.filters.purpose;
  if (purpose) {
    filters.purpose = String(purpose.value) as MediaPurpose;
  }

  const ownerType = parsed.filters.ownerType;
  if (ownerType) {
    filters.ownerType = String(ownerType.value) as MediaOwnerType;
  }

  const ownerId = parsed.filters.ownerId;
  if (ownerId) {
    filters.ownerId = String(ownerId.value);
  }

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as MediaStatus;
  }

  const provider = parsed.filters.provider;
  if (provider) {
    filters.provider = String(provider.value) as StorageProviderName;
  }

  return filters;
}

/**
 * Express handlers for every Media API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/media.routes.ts` can reference `mediaController.x` directly),
 * and does only three things: read the request, call one
 * `MediaService` method, and send the response — no business logic
 * lives here. Read endpoints pass `req.user ?? null` through as the
 * actor (populated by `extractCurrentUser`, never `authenticate` — see
 * `routes/media.routes.ts`), since anonymous storefront browsing (a
 * product page's images) is a first-class case the service itself
 * scopes down to `READY` assets.
 */
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: MEDIA_SORTABLE_FIELDS,
      filterableFields: MEDIA_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.mediaService.list(parsed, filters, req.user ?? null);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const asset = await this.mediaService.getById(id, req.user ?? null);
    sendSuccess(res, { asset });
  });

  getByOwner = asyncHandler(async (req, res) => {
    const ownerType = requireParam(req, "ownerType") as MediaOwnerType;
    const ownerId = requireParam(req, "ownerId");
    const purposeQuery = req.query.purpose;
    const purpose = typeof purposeQuery === "string" ? (purposeQuery as MediaPurpose) : undefined;
    const assets = await this.mediaService.getByOwner(
      ownerType,
      ownerId,
      purpose,
      req.user ?? null,
    );
    sendSuccess(res, { assets });
  });

  upload = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    if (!req.file) {
      throw new BadRequestError('A file is required in the "file" form field');
    }
    const dto = req.body as UploadMediaFieldsDto;
    const asset = await this.mediaService.upload(toUploadableFile(req.file), dto, actor);
    sendSuccess(res, { asset }, { statusCode: HTTP_STATUS.CREATED });
  });

  uploadMultiple = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      throw new BadRequestError('At least one file is required in the "files" form field');
    }
    const dto = req.body as UploadMediaFieldsDto;
    const assets = await this.mediaService.uploadMultiple(files.map(toUploadableFile), dto, actor);
    sendSuccess(res, { assets }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateMediaAssetDto;
    const asset = await this.mediaService.update(id, dto, actor);
    sendSuccess(res, { asset });
  });

  delete = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    await this.mediaService.delete(id, actor);
    sendSuccess(res, { message: "Media asset deleted" });
  });

  restore = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const asset = await this.mediaService.restore(id, actor);
    sendSuccess(res, { asset });
  });
}
