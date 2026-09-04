import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unauthorized, tooManyRequests } from "../_lib/errors";
import { loginSchema, type PublicUser } from "./_schemas";
import { verifyPassword } from "./_lib/passwords";
import { signAccessToken } from "./_lib/tokens";
import { generateRefreshToken, setRefreshCookie } from "./_lib/cookies";
import { storeRefreshToken } from "./_lib/repository";
import { rateLimit, clientIp } from "../_lib/rate-limit";

const REFRESH_TTL_DAYS = Number(process.env["REFRESH_TOKEN_TTL_DAYS"] ?? 30);
const LIMIT = { capacity: 5, refillPerSec: 5 / 60 };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST" } });
    return;
  }
  const ip = clientIp(req.headers);
  const rl = rateLimit(`login:${ip}`, LIMIT);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    throw tooManyRequests(rl.retryAfterSec);
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw parsed.error;
  const { email, password } = parsed.data;

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  // Always run verifyPassword to mitigate timing-based user enumeration
  const stored = user?.passwordHash ?? "pbkdf2-sha256$100000$AAAA$AAAA";
  const ok = await verifyPassword(password, stored);
  if (!user || !ok) throw unauthorized("Invalid email or password");

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency as PublicUser["preferredCurrency"],
  });
  const { token: refreshToken } = generateRefreshToken();
  await storeRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
  });
  setRefreshCookie(res, refreshToken);

  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency as PublicUser["preferredCurrency"],
    createdAt: user.createdAt.toISOString(),
  };
  res.status(200).json({ user: publicUser, accessToken });
}