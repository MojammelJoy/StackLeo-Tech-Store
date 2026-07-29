import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Assigns a unique ID to every request — reusing one from an inbound
 * header when a caller/gateway already set it, so traces stay correlated
 * end-to-end. Attached to `req.id` and echoed back on the response.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header(REQUEST_ID_HEADER);
  req.id = incomingId && incomingId.length > 0 ? incomingId : uuidv4();
  res.setHeader(REQUEST_ID_HEADER, req.id);
  next();
}
