import multer, { MulterError } from "multer";

import { BadRequestError } from "../../../errors";
import { MAX_VIDEO_SIZE_BYTES, MEDIA_MAX_BULK_UPLOAD_FILES } from "../constants";

import type { NextFunction, Request, RequestHandler, Response } from "express";

/** The multipart field name every upload endpoint reads a single file
 * from. */
const SINGLE_FILE_FIELD = "file";
/** The multipart field name the bulk-upload endpoint reads its files
 * from. */
const MULTIPLE_FILES_FIELD = "files";

const upload = multer({
  storage: multer.memoryStorage(),
  // The largest of `MEDIA_PURPOSE_MAX_SIZE_BYTES` (video) — a coarse
  // upper bound multer can enforce before any purpose is even known
  // (multer parses the file stream and the `purpose` form field
  // together; it can't apply a per-purpose limit mid-stream). The
  // real, purpose-specific limit is enforced afterward by
  // `service/media.service.ts` via `mapper/file-validation.utils.ts`'s
  // `validateFileForPurpose`.
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES, files: MEDIA_MAX_BULK_UPLOAD_FILES },
});

/** Maps a `MulterError`'s machine-readable `code` to a message safe to
 * return to a client — multer's own `.message` is already reasonable
 * for most codes, but names the multipart field, not the business
 * concept, for the two limits this module actually cares about. */
function describeMulterError(error: MulterError): string {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return "File exceeds the maximum allowed size";
    case "LIMIT_FILE_COUNT":
    case "LIMIT_UNEXPECTED_FILE":
      return `Cannot upload more than ${MEDIA_MAX_BULK_UPLOAD_FILES} files in a single request`;
    default:
      return error.message;
  }
}

/** Wraps a multer middleware so a `MulterError` (file too large, too
 * many files, wrong field name) reaches this app's global error handler
 * as a `BadRequestError` — a plain `MulterError` has no `statusCode`,
 * so without this it would fall through as an unhandled 500 instead of
 * the 400 it actually is (see `middlewares/error-handler.middleware.ts`). */
function wrapMulterErrors(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      next(err instanceof MulterError ? new BadRequestError(describeMulterError(err)) : err);
    });
  };
}

/** Reads a single multipart file field (`"file"`) into memory —
 * `req.file` — never to disk directly; `service/media.service.ts`
 * hands the resulting buffer to whichever `UploadProvider` is active.
 * Must run *before* `common/`'s `validateRequest` in a route's
 * middleware chain: multer is what populates `req.body` from the
 * multipart form's non-file fields in the first place. */
export const uploadSingleFile: RequestHandler = wrapMulterErrors(upload.single(SINGLE_FILE_FIELD));

/** Same as `uploadSingleFile`, for the multi-file field `"files"` —
 * bounded to `MEDIA_MAX_BULK_UPLOAD_FILES` files per request. */
export const uploadMultipleFiles: RequestHandler = wrapMulterErrors(
  upload.array(MULTIPLE_FILES_FIELD, MEDIA_MAX_BULK_UPLOAD_FILES),
);
