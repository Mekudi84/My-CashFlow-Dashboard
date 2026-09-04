import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "./logger";

declare module "express-serve-static-core" {
  interface Request {
    id: string;
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  req.id = incoming && /^[a-zA-Z0-9-]{8,128}$/.test(incoming) ? incoming : randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  res.on("finish", () => {
    const dur = Math.round(performance.now() - start);
    logger.info("http", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      status: res.statusCode,
      durationMs: dur,
    });
  });
  next();
}