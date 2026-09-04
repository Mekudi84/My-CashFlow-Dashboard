/**
 * Local development entrypoint for the /api/* handlers.
 *
 * Vercel auto-routes /api/*.ts as serverless functions. Locally we boot an
 * Express server on PORT (default 3001) that proxies every request through
 * the Vercel handler shape. This keeps the API contract identical between
 * local dev and production without requiring the Vercel CLI.
 *
 * Run with: `npm run dev:api`
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import health from "./health";
import ready from "./ready";
import { requestId, requestLogger } from "./_lib/request";
import { notFoundHandler, errorHandler } from "./_lib/middleware";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;

function adapt(handler: Handler): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as unknown as VercelRequest, res as unknown as VercelResponse))
      .catch(next);
  };
}

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(requestId);
app.use(requestLogger);

app.get("/api/health", adapt(health));
app.get("/api/ready", adapt(ready));

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env["PORT"] ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ts: new Date().toISOString(), level: "info", msg: "api listening", port }));
});