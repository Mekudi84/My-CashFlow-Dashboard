import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import { requireAuth } from "../auth/_lib/middleware";
import { badRequest } from "../_lib/errors";
import { cashFlowByMonth, rangeWindow } from "../_lib/analytics";
import type { DateRangeKey, Transaction } from "@/types";

const rangeSchema = z.enum(["7D", "30D", "3M", "6M", "1Y"]);

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Use GET" } });
    return;
  }
  const user = await requireAuth(req);
  const raw = (req.query as Record<string, string | undefined>)["range"] ?? "6M";
  const parsed = rangeSchema.safeParse(raw);
  if (!parsed.success) {
    throw badRequest("INVALID_RANGE", "range must be one of 7D|30D|3M|6M|1Y");
  }
  const range: DateRangeKey = parsed.data;
  const { from, to } = rangeWindow(range);
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, user.id),
        gte(transactions.occurredOn, fromIso),
        lte(transactions.occurredOn, toIso),
      ),
    );
  const data = cashFlowByMonth(rows as unknown as Array<Pick<Transaction, "kind" | "amountCents" | "status" | "occurredOn">>, range);
  res.status(200).json({ data });
}