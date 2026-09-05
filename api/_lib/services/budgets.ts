import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { budgets } from "@/db/schema";
import { expectFound, requireUuid } from "../path";
import { budgetPeriodSchema, currencySchema, isoDateSchema, paginationSchema } from "../../_schemas";
import type { VercelRequest } from "@vercel/node";

const createSchema = z.object({
  categoryId: z.string().uuid(),
  period: budgetPeriodSchema.default("monthly"),
  limit: z.number().positive().max(1_000_000_00),
  currency: currencySchema.default("USD"),
  startsOn: isoDateSchema,
  endsOn: isoDateSchema.nullable().optional(),
});
const updateSchema = createSchema.partial();

const getId = (req: VercelRequest): string | null => {
  const params = (req as unknown as { params?: Record<string, string | undefined> }).params;
  return params?.["id"] ?? null;
};

function userId(req: VercelRequest): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

export async function listBudgets(req: VercelRequest): Promise<unknown> {
  const params = paginationSchema.parse(req.query ?? {});
  const offset = (params.page - 1) * params.pageSize;
  const rows = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId(req)))
    .orderBy(desc(budgets.startsOn))
    .limit(params.pageSize)
    .offset(offset);
  return { data: rows, page: params.page, pageSize: params.pageSize };
}

export async function createBudget(req: VercelRequest): Promise<unknown> {
  const body = createSchema.parse(req.body);
  const inserted = await db
    .insert(budgets)
    .values({
      userId: userId(req),
      categoryId: body.categoryId,
      period: body.period,
      limitCents: Math.round(body.limit * 100),
      currency: body.currency,
      startsOn: body.startsOn,
      endsOn: body.endsOn ?? null,
    })
    .returning();
  const created = inserted[0];
  if (!created) throw new Error("Failed to create budget");
  return { data: created };
}

export async function updateBudget(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Budget id");
  const patch = updateSchema.parse(req.body);
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.categoryId !== undefined) set["categoryId"] = patch.categoryId;
  if (patch.period !== undefined) set["period"] = patch.period;
  if (patch.limit !== undefined) set["limitCents"] = Math.round(patch.limit * 100);
  if (patch.currency !== undefined) set["currency"] = patch.currency;
  if (patch.startsOn !== undefined) set["startsOn"] = patch.startsOn;
  if (patch.endsOn !== undefined) set["endsOn"] = patch.endsOn;
  const updated = await db
    .update(budgets)
    .set(set)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId(req))))
    .returning();
  return { data: expectFound(updated, "Budget") };
}

export async function deleteBudget(req: VercelRequest): Promise<null> {
  const id = requireUuid(getId(req), "Budget id");
  const deleted = await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId(req))))
    .returning({ id: budgets.id });
  if (deleted.length === 0) {
    expectFound([], "Budget");
  }
  return null;
}