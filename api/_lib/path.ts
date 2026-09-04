import { badRequest, notFound } from "./errors";
export { badRequest, notFound };

/**
 * Parse a path string into segments, trimming a leading slash.
 * Returns [] for an empty path.
 */
export function pathSegments(path: string): string[] {
  return path.replace(/^\/+/, "").split("/").filter(Boolean);
}

/**
 * Extract the first path segment as the resource name, and the second as the
 * optional id. Trailing segments (if any) are treated as sub-resources.
 *
 * /api/accounts -> { resource: "accounts", id: null }
 * /api/accounts/abc -> { resource: "accounts", id: "abc" }
 */
export function parseResourcePath(path: string): { resource: string; id: string | null } {
  const segments = pathSegments(path);
  const resource = segments[0];
  const id = segments[1] ?? null;
  if (!resource) throw badRequest("INVALID_PATH", "Missing resource name");
  return { resource, id };
}

/**
 * Validate a UUID-shaped string, returning it or throwing 400.
 */
export function requireUuid(value: string | null, label = "id"): string {
  if (!value) throw badRequest("INVALID_ID", `${label} is required`);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw badRequest("INVALID_ID", `${label} must be a UUID`);
  }
  return value;
}

/**
 * Return notFound when an array is empty.
 */
export function expectFound<T>(rows: T[], resource = "Resource"): T {
  const first = rows[0];
  if (first === undefined) throw notFound(resource);
  return first;
}