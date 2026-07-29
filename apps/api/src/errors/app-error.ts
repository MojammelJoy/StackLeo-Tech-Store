/**
 * Base class for every operational error the API deliberately throws.
 * `isOperational: true` distinguishes expected, handleable failures (bad
 * input, not found, etc.) from unexpected programming errors, so the
 * global error handler can respond appropriately to each.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
