import { z } from "zod";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { accounts } from "@/db/schema";
import { badRequest, expectFound, requireUuid } from "../path";
import { accountTypeSchema, currencySchema, paginationSchema } from "../../_schemas";
import type { VercelRequest } from "@vercel/node";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: accountTypeSchema,
  currency: currencySchema.default("USD"),
  balanceCents: z.number().int().min(-1_000_000_00).max(1_000_000_000_00).default(0),
});
const updateSchema = createSchema.partial().extend({
  archived: z.boolean().optional(),
});

function userId(req: VercelRequest): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

export async function listAccounts(req: VercelRequest): Promise<unknown> {
  const params = paginationSchema.parse(req.query ?? {});
  const offset = (params.page - 1) * params.pageSize;
  const rows = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId(req)), isNull(accounts.archivedAt)))
    .orderBy(desc(accounts.createdAt))
    .limit(params.pageSize)
    .offset(offset);
  return { data: rows, page: params.page, pageSize: params.pageSize };
}

export async function createAccount(req: VercelRequest): Promise<unknown> {
  const body = createSchema.parse(req.body);
  const inserted = await db
    .insert(accounts)
    .values({
      userId: userId(req),
      name: body.name,
      type: body.type,
      currency: body.currency,
      balanceCents: body.balanceCents,
    })
    .returning();
  const created = inserted[0];
  if (!created) throw badRequest("CREATE_FAILED", "Could not create account");
  return { data: created };
}

const getId = (req: VercelRequest): string | null => {
  const params = (req as unknown as { params?: Record<string, string | undefined> }).params;
  return params?.["id"] ?? null;
};

export async function getAccount(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Account id");
  const rows = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId(req))))
    .limit(1);
  return { data: expectFound(rows, "Account") };
}

export async function updateAccount(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Account id");
  const patch = updateSchema.parse(req.body);
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.name !== undefined) set["name"] = patch.name;
  if (patch.type !== undefined) set["type"] = patch.type;
  if (patch.currency !== undefined) set["currency"] = patch.currency;
  if (patch.balanceCents !== undefined) set["balanceCents"] = patch.balanceCents;
  if (patch.archived !== undefined) {
    set["archivedAt"] = patch.archived ? new Date() : null;
  }
  const updated = await db
    .update(accounts)
    .set(set)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId(req))))
    .returning();
  return { data: expectFound(updated, "Account") };
}

export async function deleteAccount(req: VercelRequest): Promise<null> {
  const id = requireUuid(getId(req), "Account id");
  const updated = await db
    .update(accounts)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId(req))))
    .returning({ id: accounts.id });
  if (updated.length === 0) {
    expectFound([], "Account");
  }
  return null;
}