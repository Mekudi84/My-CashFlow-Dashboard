import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import { requireAuth } from "../auth/_lib/middleware";
import { badRequest } from "../_lib/errors";
import { spendingByCategory } from "../_lib/analytics";
import type { Transaction } from "@/types";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use GET" } });
    return;
  }
  const user = await requireAuth(req);
  const parsed = querySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    throw badRequest("VALIDATION_ERROR", "Invalid query", parsed.error.issues);
  }
  const { from, to } = parsed.data;

  const conds = [eq(transactions.userId, user.id)];
  if (from) conds.push(gte(transactions.occurredOn, from));
  if (to) conds.push(lte(transactions.occurredOn, to));

  const [rows, cats] = await Promise.all([
    db.select().from(transactions).where(and(...conds)),
    db.select().from(categories).where(eq(categories.userId, user.id)),
  ]);

  const map = new Map<string, { name: string; color: string }>();
  for (const c of cats) map.set(c.id, { name: c.name, color: c.color });
  const data = spendingByCategory(
    rows as unknown as Array<Pick<Transaction, "kind" | "amountCents" | "status" | "categoryId">>,
    map,
  );
  res.status(200).json({ data });
}