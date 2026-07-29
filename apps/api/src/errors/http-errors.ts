import { AppError } from "./app-error";

/**
 * Generic, reusable HTTP error taxonomy. Deliberately not domain-specific
 * — business modules will throw these (or their own subclasses of
 * AppError) once they exist.
 */

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, 409, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: unknown) {
    super(message, 500, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", details?: unknown) {
    super(message, 503, details);
  }
}
