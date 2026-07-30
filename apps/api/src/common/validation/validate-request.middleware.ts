import { ZodError, type ZodType } from "zod";

import { BadRequestError } from "../../errors";

import type { NextFunction, Request, Response } from "express";

export interface RequestValidationSchemas<TBody = unknown, TQuery = unknown, TParams = unknown> {
  body?: ZodType<TBody>;
  query?: ZodType<TQuery>;
  params?: ZodType<TParams>;
}

/**
 * Validates `req.body`/`query`/`params` against the given Zod schemas and
 * replaces each with its parsed (coerced, defaulted) result, so
 * downstream handlers only ever see already-valid data.
 *
 * Reassigning `req.query`/`req.params` needs a cast: Express types both
 * as `qs.ParsedQs`, which a schema's parsed output (e.g. a coerced
 * number) is never structurally assignable to. This is the same cast
 * every Express + Zod integration needs; Express 4 (pinned here) still
 * allows the reassignment at runtime, unlike Express 5's read-only
 * getters for these properties.
 *
 * Throws a `BadRequestError` — handled uniformly by the existing global
 * error middleware — instead of responding directly, so validation
 * failures land on the same error path as every other 4xx.
 */
export function validateRequest<TBody = unknown, TQuery = unknown, TParams = unknown>(
  schemas: RequestValidationSchemas<TBody, TQuery, TParams>,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as unknown as Request["query"];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as unknown as Request["params"];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError("Request validation failed", error.flatten()));
        return;
      }
      next(error);
    }
  };
}
