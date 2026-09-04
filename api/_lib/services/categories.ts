import { z } from "zod";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { expectFound, requireUuid } from "../path";
import { categoryKindSchema } from "../../_schemas";
import type { VercelRequest } from "@vercel/node";

const createSchema = z.object({
  name: z.string().trim().min(1).max(40),
  kind: categoryKindSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#64748b"),
  icon: z.string().min(1).max(40).default("tag"),
});
const updateSchema = createSchema.partial();

const getId = (req: VercelRequest): string | null => {
  const params = (req as unknown as { params?: Record<string, string | undefined> }).params;
  return params?.["id"] ?? null;
};

function userId(req: VercelRequest): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

/**
 * List categories owned by the user plus the system defaults (userId IS NULL).
 * Users cannot mutate system categories but can see them.
 */
export async function listCategories(req: VercelRequest): Promise<unknown> {
  const uid = userId(req);
  const rows = await db
    .select()
    .from(categories)
    .where(or(eq(categories.userId, uid), isNull(categories.userId)))
    .orderBy(categories.kind, categories.name);
  return { data: rows };
}

export async function createCategory(req: VercelRequest): Promise<unknown> {
  const body = createSchema.parse(req.body);
  const inserted = await db
    .insert(categories)
    .values({
      userId: userId(req),
      name: body.name,
      kind: body.kind,
      color: body.color,
      icon: body.icon,
    })
    .returning();
  const created = inserted[0];
  if (!created) throw new Error("Failed to create category");
  return { data: created };
}

export async function updateCategory(req: VercelRequest): Promise<unknown> {
  const id = requireUuid(getId(req), "Category id");
  const patch = updateSchema.parse(req.body);
  const set: Record<string, unknown> = {};
  if (patch.name !== undefined) set["name"] = patch.name;
  if (patch.kind !== undefined) set["kind"] = patch.kind;
  if (patch.color !== undefined) set["color"] = patch.color;
  if (patch.icon !== undefined) set["icon"] = patch.icon;
  const updated = await db
    .update(categories)
    .set(set)
    .where(and(eq(categories.id, id), eq(categories.userId, userId(req))))
    .returning();
  return { data: expectFound(updated, "Category") };
}

export async function deleteCategory(req: VercelRequest): Promise<null> {
  const id = requireUuid(getId(req), "Category id");
  const deleted = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId(req))))
    .returning({ id: categories.id });
  if (deleted.length === 0) {
    expectFound([], "Category");
  }
  return null;
}