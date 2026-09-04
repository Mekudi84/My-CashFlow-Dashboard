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
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import health from "./health";
import ready from "./ready";
import register from "./auth/register";
import login from "./auth/login";
import refresh from "./auth/refresh";
import logout from "./auth/logout";
import me from "./auth/me";
import accounts from "./accounts";
import categories from "./categories";
import transactions from "./transactions";
import budgets from "./budgets";
import goals from "./goals";
import { requestId, requestLogger } from "./_lib/request";
import { notFoundHandler, errorHandler } from "./_lib/middleware";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;

function adapt(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(
      handler(req as unknown as VercelRequest, res as unknown as VercelResponse),
    ).catch(next);
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
app.post("/api/auth/register", adapt(register));
app.post("/api/auth/login", adapt(login));
app.post("/api/auth/refresh", adapt(refresh));
app.post("/api/auth/logout", adapt(logout));
app.get("/api/auth/me", adapt(me));

function mount(base: string, handler: Handler): void {
  app.all(`${base}`, adapt(handler));
  app.all(`${base}/:id`, adapt(handler));
}
mount("/api/accounts", accounts as Handler);
mount("/api/categories", categories as Handler);
mount("/api/transactions", transactions as Handler);
mount("/api/budgets", budgets as Handler);
mount("/api/goals", goals as Handler);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env["PORT"] ?? 3001);
app.listen(port, () => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level: "info", msg: "api listening", port }));
});