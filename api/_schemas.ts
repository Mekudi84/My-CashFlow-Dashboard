import { z } from "zod";

export const currencySchema = z.enum(["USD", "NGN", "GBP", "EUR"]);

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const accountTypeSchema = z.enum(["checking", "savings", "cash", "credit"]);

export const categoryKindSchema = z.enum(["income", "expense"]);

export const txKindSchema = z.enum(["income", "expense", "transfer"]);
export const txStatusSchema = z.enum(["pending", "completed"]);

export const budgetPeriodSchema = z.enum(["monthly", "weekly"]);

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type Pagination = z.infer<typeof paginationSchema>;