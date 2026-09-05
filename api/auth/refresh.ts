import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { unauthorized } from "../_lib/errors";
import type { PublicUser } from "./_schemas";
import { signAccessToken } from "./_lib/tokens";
import { generateRefreshToken, readRefreshCookie, setRefreshCookie } from "./_lib/cookies";
import { findActiveRefreshToken, revokeRefreshToken, storeRefreshToken } from "./_lib/repository";

const REFRESH_TTL_DAYS = Number(process.env["REFRESH_TOKEN_TTL_DAYS"] ?? 30);

/**
 * Rotating refresh: each call revokes the presented token and issues a new one.
 * Reuse of a revoked token revokes the entire session family (detected via
 * "active=false" lookup succeeding on a non-revoked token — here we just
 * reject when the token is not active).
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST" } });
    return;
  }
  const token = readRefreshCookie({ headers: req.headers });
  if (!token) throw unauthorized("Missing refresh cookie");
  const record = await findActiveRefreshToken(token);
  if (!record) throw unauthorized("Invalid refresh token");
  // rotate: revoke the presented token, mint a new one
  await revokeRefreshToken(token);
  const rows = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);
  const user = rows[0];
  if (!user) throw unauthorized("User no longer exists");
  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency as PublicUser["preferredCurrency"],
    createdAt: user.createdAt.toISOString(),
  };
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency as PublicUser["preferredCurrency"],
  });
  const { token: newRefresh } = generateRefreshToken();
  await storeRefreshToken({
    userId: user.id,
    token: newRefresh,
    expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
  });
  setRefreshCookie(res, newRefresh);
  res.status(200).json({ user: publicUser, accessToken });
}