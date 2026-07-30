import { HTTP_STATUS } from "../constants";

import { buildSuccessResponse } from "./success-response";

import type { PaginationMeta } from "../types";
import type { Response } from "express";

/**
 * Sends a list response wrapped in the standard success envelope, with
 * pagination metadata attached under `meta.pagination` — the only
 * difference from a plain `sendSuccess` call for a single resource.
 */
export function sendPaginatedResponse<T>(
  res: Response,
  items: T[],
  pagination: PaginationMeta,
): void {
  res.status(HTTP_STATUS.OK).json(buildSuccessResponse(items, res.req.id, pagination));
}
