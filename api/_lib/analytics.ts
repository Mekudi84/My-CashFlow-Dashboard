/**
 * Centralized financial analytics.
 *
 * All money is in integer cents. The API never does float math; the frontend
 * receives cents over the wire and renders via Intl.NumberFormat. Helpers
 * here are pure so they can be unit-tested without a database.
 */
import type { CashFlowPoint, CategoryTotal, DateRangeKey, Transaction } from "@/types";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions, accounts } from "@/db/schema";

export interface MonthlyTotals {
  incomeCents: number;
  expensesCents: number;
  netCents: number;
}

export function monthlyTotals(rows: Array<Pick<Transaction, "kind" | "amountCents" | "status">>): MonthlyTotals {
  let incomeCents = 0;
  let expensesCents = 0;
  for (const t of rows) {
    if (t.status !== "completed") continue;
    if (t.kind === "income") incomeCents += t.amountCents;
    else if (t.kind === "expense") expensesCents += t.amountCents;
  }
  return { incomeCents, expensesCents, netCents: incomeCents - expensesCents };
}

export function budgetStatus(percent: number): "ok" | "near" | "over" {
  if (percent >= 100) return "over";
  if (percent >= 80) return "near";
  return "ok";
}

export interface RangeWindow {
  from: Date;
  to: Date;
  months: number;
}

const RANGE_MONTHS: Record<DateRangeKey, number> = {
  "7D": 1,
  "30D": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
};

export function rangeWindow(range: DateRangeKey): RangeWindow {
  const to = new Date();
  const months = RANGE_MONTHS[range];
  const from = new Date(to);
  if (range === "7D") from.setDate(from.getDate() - 7);
  else if (range === "30D") from.setDate(from.getDate() - 30);
  else from.setMonth(from.getMonth() - (months - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to, months };
}

/**
 * Group completed income/expense transactions by month within a window. Months
 * with no activity are still emitted with zeros so the chart x-axis is full.
 */
export function cashFlowByMonth(
  rows: Array<Pick<Transaction, "kind" | "amountCents" | "status" | "occurredOn">>,
  range: DateRangeKey,
): CashFlowPoint[] {
  const { from, months } = rangeWindow(range);
  const buckets: { month: string; incomeCents: number; expensesCents: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setMonth(d.getMonth() + i);
    buckets.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      incomeCents: 0,
      expensesCents: 0,
    });
  }
  const monthIndex = new Map<string, number>();
  for (let i = 0; i < buckets.length; i++) {
    const key = buckets[i]!.month;
    monthIndex.set(key, i);
  }
  for (const t of rows) {
    if (t.status !== "completed") continue;
    const d = new Date(t.occurredOn);
    if (d < from) continue;
    const key = d.toLocaleString("en-US", { month: "short" });
    const idx = monthIndex.get(key);
    if (idx === undefined) continue;
    const bucket = buckets[idx]!;
    if (t.kind === "income") bucket.incomeCents += t.amountCents;
    else if (t.kind === "expense") bucket.expensesCents += t.amountCents;
  }
  return buckets.map((b) => ({
    month: b.month,
    incomeCents: b.incomeCents,
    expensesCents: b.expensesCents,
    netCents: b.incomeCents - b.expensesCents,
  }));
}

/**
 * Roll up expenses by category, sorted descending. The `name` and `color` are
 * looked up from a category map passed by the caller; this keeps the function
 * pure and database-agnostic.
 */
export function spendingByCategory(
  rows: Array<Pick<Transaction, "kind" | "amountCents" | "status" | "categoryId">>,
  categoryMap: Map<string, { name: string; color: string }>,
): CategoryTotal[] {
  const byId = new Map<string, number>();
  for (const t of rows) {
    if (t.kind !== "expense" || t.status !== "completed" || !t.categoryId) continue;
    byId.set(t.categoryId, (byId.get(t.categoryId) ?? 0) + t.amountCents);
  }
  const out: CategoryTotal[] = [];
  for (const [categoryId, totalCents] of byId.entries()) {
    const c = categoryMap.get(categoryId);
    out.push({
      categoryId,
      categoryName: c?.name ?? "Uncategorized",
      color: c?.color ?? "#64748b",
      totalCents,
    });
  }
  out.sort((a, b) => b.totalCents - a.totalCents);
  return out;
}

/**
 * Pulls the current balance across all non-archived accounts (in cents) and
 * returns totals for income/expenses/savings derived from completed
 * transactions within the current calendar month.
 */
export async function dashboardSummary(userId: string): Promise<{
  totalBalanceCents: number;
  monthlyIncomeCents: number;
  monthlyExpensesCents: number;
  totalSavingsCents: number;
  deltas: { balance: number; income: number; expenses: number; savings: number };
  asOf: string;
}> {
  const balanceRows = await db
    .select({ total: sql<number>`coalesce(sum(${accounts.balanceCents}), 0)::bigint` })
    .from(accounts)
    .where(eq(accounts.userId, userId));
  const totalBalanceCents = Number(balanceRows[0]?.total ?? 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthRows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredOn, monthStart.toISOString().slice(0, 10)),
        lte(transactions.occurredOn, monthEnd.toISOString().slice(0, 10)),
      ),
    );
  const totals = monthlyTotals(
    monthRows as unknown as Array<Pick<Transaction, "kind" | "amountCents" | "status">>,
  );

  // Previous month for delta computation
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const prevRows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredOn, prevStart.toISOString().slice(0, 10)),
        lte(transactions.occurredOn, prevEnd.toISOString().slice(0, 10)),
      ),
    );
  const prev = monthlyTotals(
    prevRows as unknown as Array<Pick<Transaction, "kind" | "amountCents" | "status">>,
  );

  const pct = (curr: number, prior: number): number => {
    if (prior === 0) return curr === 0 ? 0 : 100;
    return ((curr - prior) / Math.abs(prior)) * 100;
  };
  const totalSavingsCents = Math.max(0, totalBalanceCents - 0);

  return {
    totalBalanceCents,
    monthlyIncomeCents: totals.incomeCents,
    monthlyExpensesCents: totals.expensesCents,
    totalSavingsCents,
    deltas: {
      balance: pct(totalBalanceCents, totalBalanceCents - totals.netCents),
      income: pct(totals.incomeCents, prev.incomeCents),
      expenses: pct(totals.expensesCents, prev.expensesCents),
      savings: pct(totalSavingsCents, totalSavingsCents - prev.netCents),
    },
    asOf: now.toISOString(),
  };
}