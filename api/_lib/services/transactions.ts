import { z } from "zod";
import { and, eq, gte, lte, desc, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import { expectFound, requireUuid } from "../path";
import {
  currencySchema,
  isoDateSchema,
  paginationSchema,
  txKindSchema,
  txStatusSchema,
} from "../../_schemas";
import type { VercelRequest } from "@vercel/node";

const listQuerySchema = paginationSchema.extend({
  kind: txKindSchema.optional(),
  status: txStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  q: z.string().trim().max(80).optional(),
});

const createSchema = z.object({
  accountId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  kind: txKindSchema,
  amount: z.number().positive().max(1_000_000_00),
  currency: currencySchema.default("USD"),
  occurredOn: isoDateSchema,
  description: z.string().trim().max(120).default(""),
  status: txStatusSchema.default("completed"),
});

const updateSchema = createSchema.partial();

const getId = (req: VercelRequest): string | null => {
  const params = (req as unknown as { params?: Record<string, string | undefined> }).params;
  return params?.["id"] ?? null;
};

function userId(req: VercelRequest): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

export async function listTransactions(req: VercelRequest): Promise<unknown> {
  const params = listQuerySchema.parse(req.query ?? {});
  const uid = userId(req);

  const conditions: SQL[] = [eq(transactions.userId, uid)];
  if (params.kind) conditions.push(eq(transactions.kind, params.kind));
  if (params.status) conditions.push(eq(transactions.status, params.status));
  if (params.categoryId) conditions.push(eq(transactions.categoryId, params.categoryId));
  if (params.accountId) conditions.push(eq(transactions.accountId, params.accountId));
  if (params.from) conditions.push(gte(transactions.occurredOn, params.from));
  if (params.to) conditions.push(lte(transactions.occurredOn, params.to));
  if (params.q) conditions.push(ilike(transactions.description, `%${params.q}%`));

  const offset = (params.page - 1) * params.pageSize;
  const rows = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.occurredOn), desc(transactions.createdAt))
    .limit(params.pageSize)
    .offset(offset);

  return {
    data: rows,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function createTransaction(req: VercelRequest): Promise<unknown> {
  const body = createSchema.parse(req.body);
  const inserted = await db
    .insert(transactions)
    .values({
      userId: userId(req),
      accountId: body.accountId ?? null,
      categoryId: body.categoryId ?? null,
      kind: body.kind,
      amountCents: Math.round(body.amount * 100),
      currency: body.currency,
      occurredOn: body.occurredOn,
      description: body.description,
      status: body.status,
    })
    .returning();
  const created = inserted[0];
  if (!created) throw new Error("Failed to create transaction");
  return { data: created };
}

export async function getTransaction(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Transaction id");
  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId(req))))
    .limit(1);
  return { data: expectFound(rows, "Transaction") };
}

export async function updateTransaction(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Transaction id");
  const patch = updateSchema.parse(req.body);
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.accountId !== undefined) set["accountId"] = patch.accountId ?? null;
  if (patch.categoryId !== undefined) set["categoryId"] = patch.categoryId ?? null;
  if (patch.kind !== undefined) set["kind"] = patch.kind;
  if (patch.amount !== undefined) set["amountCents"] = Math.round(patch.amount * 100);
  if (patch.currency !== undefined) set["currency"] = patch.currency;
  if (patch.occurredOn !== undefined) set["occurredOn"] = patch.occurredOn;
  if (patch.description !== undefined) set["description"] = patch.description;
  if (patch.status !== undefined) set["status"] = patch.status;
  const updated = await db
    .update(transactions)
    .set(set)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId(req))))
    .returning();
  return { data: expectFound(updated, "Transaction") };
}

export async function deleteTransaction(req: VercelRequest): Promise<null> {
  const id = requireUuid(getId(req), "Transaction id");
  const deleted = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId(req))))
    .returning({ id: transactions.id });
  if (deleted.length === 0) {
    expectFound([], "Transaction");
  }
  return null;
}