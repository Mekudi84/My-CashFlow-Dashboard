import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { conflict, badRequest } from "../_lib/errors";
import { registerSchema, type PublicUser } from "./_schemas";
import { hashPassword } from "./_lib/passwords";
import { signAccessToken } from "./_lib/tokens";
import { generateRefreshToken, setRefreshCookie } from "./_lib/cookies";
import { storeRefreshToken } from "./_lib/repository";

const REFRESH_TTL_DAYS = Number(process.env["REFRESH_TOKEN_TTL_DAYS"] ?? 30);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST" } });
    return;
  }
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest("VALIDATION_ERROR", "Invalid registration payload", parsed.error.issues);
    throw parsed.error;
  }
  const { email, name, password, preferredCurrency } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw conflict("EMAIL_TAKEN", "An account with this email already exists");
  }
  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ email, name, passwordHash, preferredCurrency })
    .returning();
  const user = inserted[0];
  if (!user) throw new Error("Failed to create user");

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
  res.status(201).json({ user: publicUser, accessToken });
}