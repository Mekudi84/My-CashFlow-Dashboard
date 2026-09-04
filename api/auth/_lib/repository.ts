import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { refreshTokens } from "@/db/schema";
import { hashRefreshToken } from "./cookies";

export async function storeRefreshToken(opts: {
  userId: string;
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}): Promise<void> {
  await db.insert(refreshTokens).values({
    userId: opts.userId,
    tokenHash: hashRefreshToken(opts.token),
    expiresAt: opts.expiresAt,
    userAgent: opts.userAgent ?? null,
    ip: opts.ip ?? null,
  });
}

export async function findActiveRefreshToken(token: string) {
  const tokenHash = hashRefreshToken(token);
  const rows = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashRefreshToken(token);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.userId, userId));
}