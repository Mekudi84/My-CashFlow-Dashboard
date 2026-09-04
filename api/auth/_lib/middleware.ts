import type { VercelRequest } from "@vercel/node";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "./tokens";
import { unauthorized } from "../../_lib/errors";
import type { PublicUser } from "../_schemas";

export interface AuthedRequest extends VercelRequest {
  user: PublicUser;
}

export async function requireAuth(req: VercelRequest): Promise<PublicUser> {
  const header = req.headers["authorization"];
  const token = typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : "";
  if (!token) throw unauthorized();
  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    throw unauthorized("Invalid or expired token");
  }
  // verify user still exists and matches token claims
  const rows = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  const user = rows[0];
  if (!user) throw unauthorized("User no longer exists");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency as PublicUser["preferredCurrency"],
    createdAt: user.createdAt.toISOString(),
  };
}