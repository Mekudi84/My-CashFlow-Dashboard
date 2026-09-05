import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { savingsGoals } from "@/db/schema";
import { expectFound, requireUuid } from "../path";
import { currencySchema, isoDateSchema, paginationSchema } from "../../_schemas";
import type { VercelRequest } from "@vercel/node";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  target: z.number().positive().max(1_000_000_000_00),
  current: z.number().min(0).max(1_000_000_000_00).default(0),
  currency: currencySchema.default("USD"),
  targetDate: isoDateSchema.nullable().optional(),
});
const updateSchema = createSchema.partial();

const getId = (req: VercelRequest): string | null => {
  const params = (req as unknown as { params?: Record<string, string | undefined> }).params;
  return params?.["id"] ?? null;
};

function userId(req: VercelRequest): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

export async function listGoals(req: VercelRequest): Promise<unknown> {
  const params = paginationSchema.parse(req.query ?? {});
  const offset = (params.page - 1) * params.pageSize;
  const rows = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, userId(req)))
    .orderBy(desc(savingsGoals.createdAt))
    .limit(params.pageSize)
    .offset(offset);
  return { data: rows, page: params.page, pageSize: params.pageSize };
}

export async function createGoal(req: VercelRequest): Promise<unknown> {
  const body = createSchema.parse(req.body);
  const inserted = await db
    .insert(savingsGoals)
    .values({
      userId: userId(req),
      name: body.name,
      targetCents: Math.round(body.target * 100),
      currentCents: Math.round(body.current * 100),
      currency: body.currency,
      targetDate: body.targetDate ?? null,
    })
    .returning();
  const created = inserted[0];
  if (!created) throw new Error("Failed to create goal");
  return { data: created };
}

export async function updateGoal(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Goal id");
  const patch = updateSchema.parse(req.body);
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.name !== undefined) set["name"] = patch.name;
  if (patch.target !== undefined) set["targetCents"] = Math.round(patch.target * 100);
  if (patch.current !== undefined) set["currentCents"] = Math.round(patch.current * 100);
  if (patch.currency !== undefined) set["currency"] = patch.currency;
  if (patch.targetDate !== undefined) set["targetDate"] = patch.targetDate;
  const updated = await db
    .update(savingsGoals)
    .set(set)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId(req))))
    .returning();
  return { data: expectFound(updated, "Goal") };
}

export async function deleteGoal(req: VercelRequest): Promise<null> {
  const id = requireUuid(getId(req), "Goal id");
  const deleted = await db
    .delete(savingsGoals)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId(req))))
    .returning({ id: savingsGoals.id });
  if (deleted.length === 0) {
    expectFound([], "Goal");
  }
  return null;
}