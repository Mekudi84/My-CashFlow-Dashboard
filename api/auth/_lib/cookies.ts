import { createHash, randomBytes } from "node:crypto";
import type { VercelResponse } from "@vercel/node";

const REFRESH_COOKIE = "rt";
const REFRESH_TTL_DAYS = Number(process.env["REFRESH_TOKEN_TTL_DAYS"] ?? 30);
const SECURE = process.env["NODE_ENV"] === "production";

export interface RefreshCookieOptions {
  secure?: boolean;
}

export function setRefreshCookie(res: VercelResponse, token: string, opts: RefreshCookieOptions = {}): void {
  const secure = opts.secure ?? SECURE;
  const maxAge = REFRESH_TTL_DAYS * 24 * 60 * 60;
  const parts = [
    `${REFRESH_COOKIE}=${token}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearRefreshCookie(res: VercelResponse): void {
  res.setHeader(
    "Set-Cookie",
    `${REFRESH_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${SECURE ? "; Secure" : ""}`,
  );
}

export function readRefreshCookie(req: { headers: { [k: string]: string | string[] | undefined } }): string | null {
  const raw = req.headers["cookie"];
  if (typeof raw !== "string") return null;
  for (const piece of raw.split(";")) {
    const [name, ...rest] = piece.trim().split("=");
    if (name === REFRESH_COOKIE) return rest.join("=");
  }
  return null;
}

export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(48).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}