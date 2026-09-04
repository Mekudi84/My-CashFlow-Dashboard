import type { CategoryTotal, Transaction } from "@/types";

export interface MonthlyTotals {
  incomeCents: number;
  expensesCents: number;
  netCents: number;
}

export function monthlyTotals(transactions: Transaction[]): MonthlyTotals {
  let incomeCents = 0;
  let expensesCents = 0;
  for (const t of transactions) {
    if (t.status !== "completed") continue;
    if (t.kind === "income") incomeCents += t.amountCents;
    else if (t.kind === "expense") expensesCents += t.amountCents;
  }
  return { incomeCents, expensesCents, netCents: incomeCents - expensesCents };
}

export interface CategoryTotalsMap {
  byId: Map<string, number>;
  list: CategoryTotal[];
  totalCents: number;
  largest: CategoryTotal | null;
}

export function categoryTotals(transactions: Transaction[]): CategoryTotalsMap {
  const byId = new Map<string, number>();
  for (const t of transactions) {
    if (t.kind !== "expense" || !t.categoryId) continue;
    byId.set(t.categoryId, (byId.get(t.categoryId) ?? 0) + t.amountCents);
  }
  const list = Array.from(byId.entries())
    .map(([categoryId, totalCents]) => ({ categoryId, categoryName: categoryId, color: "", totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);
  const totalCents = list.reduce((s, c) => s + c.totalCents, 0);
  return { byId, list, totalCents, largest: list[0] ?? null };
}

export interface BudgetWithSpent {
  id: string;
  categoryId: string;
  categoryName: string;
  color: string;
  limitCents: number;
  spentCents: number;
  remainingCents: number;
  percent: number;
  status: "ok" | "near" | "over";
}

export type BudgetStatus = BudgetWithSpent["status"];

export function budgetStatus(percent: number): BudgetStatus {
  if (percent >= 100) return "over";
  if (percent >= 80) return "near";
  return "ok";
}

export function filterTransactions(
  list: Transaction[],
  opts: {
    query?: string;
    type?: "all" | "income" | "expense";
    categoryId?: string | "all";
    status?: "all" | "pending" | "completed";
  },
): Transaction[] {
  const { query = "", type = "all", categoryId = "all", status = "all" } = opts;
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    if (type !== "all" && t.kind !== type) return false;
    if (categoryId !== "all" && t.categoryId !== categoryId) return false;
    if (status !== "all" && t.status !== status) return false;
    if (q && !t.description.toLowerCase().includes(q)) return false;
    return true;
  });
}