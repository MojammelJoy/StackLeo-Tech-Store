import type { AsyncRequestHandler } from "../types";
import type { NextFunction, Request, Response } from "express";

/**
 * Wraps an async Express route handler so a rejected promise is forwarded
 * to `next(err)` instead of crashing the process or hanging the request.
 */
export function asyncHandler(handler: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
