import type { NextFunction, Request, Response } from "express";

/**
 * Standard async Express request handler signature. Used by the
 * async-handler utility to correctly type wrapped route handlers.
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;
