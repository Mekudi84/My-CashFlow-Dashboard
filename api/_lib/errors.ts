/**
 * Centralized error type + helpers.
 * The error-handling middleware converts `ApiError` instances to JSON
 * responses; unknown errors become 500s without leaking stack traces.
 */
export class ApiError extends Error {
  override readonly name = "ApiError";
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new ApiError(400, code, message, details);

export const unauthorized = (message = "Authentication required") =>
  new ApiError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Forbidden") => new ApiError(403, "FORBIDDEN", message);

export const notFound = (resource = "Resource") =>
  new ApiError(404, "NOT_FOUND", `${resource} not found`);

export const conflict = (code: string, message: string) => new ApiError(409, code, message);

export const tooManyRequests = (retryAfterSec?: number) =>
  new ApiError(429, "RATE_LIMITED", "Too many requests", { retryAfterSec });