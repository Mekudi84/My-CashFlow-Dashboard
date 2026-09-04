import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pathSegments } from "./path";
import { notFound } from "./errors";
import { requireAuth } from "../auth/_lib/middleware";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

interface RequestWithParams extends VercelRequest {
  params?: Record<string, string>;
}

interface RequestWithUser extends VercelRequest {
  user: { id: string };
}

/**
 * A resource handler bundle exposes a list/get/create/update/delete method per
 * resource. The dispatcher below routes requests based on URL segments.
 */
export interface ResourceHandlers {
  list?: (req: VercelRequest) => Promise<unknown>;
  get?: (req: VercelRequest) => Promise<unknown>;
  create?: (req: VercelRequest) => Promise<unknown>;
  update?: (req: VercelRequest) => Promise<unknown>;
  delete?: (req: VercelRequest) => Promise<unknown>;
}

async function call(
  handler: ((req: VercelRequest) => Promise<unknown>) | undefined,
  req: VercelRequest,
  res: VercelResponse,
): Promise<boolean> {
  if (!handler) return false;
  const result = await handler(req);
  if (result === null || result === undefined) {
    res.status(204).end();
  } else {
    res.status(res.statusCode === 200 ? 200 : res.statusCode).json(result);
  }
  return true;
}

export function makeDispatcher(handlers: ResourceHandlers) {
  return async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    const user = await requireAuth(req);
    (req as RequestWithUser).user = user;
    const segments = pathSegments(req.url ?? "");
    const id = segments[1] ?? null;
    if (id) (req as RequestWithParams).params = { id };
    if (!segments[0]) throw notFound("Resource");
    const method = req.method ?? "GET";
    if (id) {
      if (method === "GET") {
        if (await call(handlers.get, req, res)) return;
      } else if (method === "PATCH" || method === "PUT") {
        if (await call(handlers.update, req, res)) return;
      } else if (method === "DELETE") {
        if (await call(handlers.delete, req, res)) return;
      }
      throw notFound(`${method} /${segments.join("/")}`);
    } else {
      if (method === "GET") {
        if (await call(handlers.list, req, res)) return;
      } else if (method === "POST") {
        if (await call(handlers.create, req, res)) return;
      }
      throw notFound(`${method} /${segments.join("/")}`);
    }
  };
}