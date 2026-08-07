import { NotFoundError } from "../errors";

import type { NextFunction, Request, Response } from "express";

/**
 * Catches any request that reached this point without matching a route.
 * Delegates to the global error handler via `next` rather than responding
 * directly, so 404s are formatted identically to every other error.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}
