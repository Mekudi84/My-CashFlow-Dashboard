import { describe, expect, it } from "vitest";
import {
  budgetStatus,
  cashFlowByMonth,
  monthlyTotals,
  rangeWindow,
  spendingByCategory,
} from "@/api/_lib/analytics";
import type { Transaction } from "@/types";

const baseTx = (over: Partial<Transaction>): Partial<Transaction> => ({
  kind: "expense",
  amountCents: 0,
  status: "completed",
  occurredOn: "2025-01-15",
  ...over,
});

describe("monthlyTotals", () => {
  it("sums income/expense, ignores pending", () => {
    const totals = monthlyTotals([
      baseTx({ kind: "income", amountCents: 100_00 }) as any,
      baseTx({ kind: "expense", amountCents: 30_00 }) as any,
      baseTx({ kind: "expense", amountCents: 20_00, status: "pending" }) as any,
    ]);
    expect(totals.incomeCents).toBe(100_00);
    expect(totals.expensesCents).toBe(30_00);
    expect(totals.netCents).toBe(70_00);
  });
});

describe("budgetStatus", () => {
  it("classifies thresholds", () => {
    expect(budgetStatus(50)).toBe("ok");
    expect(budgetStatus(85)).toBe("near");
    expect(budgetStatus(120)).toBe("over");
  });
});

describe("cashFlowByMonth", () => {
  it("emits one bucket per month in the range and zero-fills", () => {
    const to = new Date();
    const monthKey = (d: Date) => d.toLocaleString("en-US", { month: "short" });
    const out = cashFlowByMonth(
      [
        baseTx({ kind: "income", amountCents: 50_00, occurredOn: to.toISOString().slice(0, 10) }) as any,
        baseTx({ kind: "expense", amountCents: 20_00, occurredOn: to.toISOString().slice(0, 10) }) as any,
      ],
      "3M",
    );
    expect(out.length).toBe(3);
    const last = out.find((p) => p.month === monthKey(to))!;
    expect(last.incomeCents).toBe(50_00);
    expect(last.expensesCents).toBe(20_00);
    const others = out.filter((p) => p.month !== monthKey(to));
    expect(others.every((p) => p.incomeCents === 0 && p.expensesCents === 0)).toBe(true);
  });
});

describe("spendingByCategory", () => {
  it("aggregates by category and sorts desc", () => {
    const map = new Map([
      ["c1", { name: "Food", color: "#f00" }],
      ["c2", { name: "Rent", color: "#0f0" }],
    ]);
    const out = spendingByCategory(
      [
        baseTx({ amountCents: 100_00, categoryId: "c1" }) as any,
        baseTx({ amountCents: 500_00, categoryId: "c2" }) as any,
        baseTx({ kind: "income", amountCents: 999_00, categoryId: "c1" }) as any,
        baseTx({ amountCents: 200_00, categoryId: "c1", status: "pending" }) as any,
      ],
      map,
    );
    expect(out).toEqual([
      { categoryId: "c2", categoryName: "Rent", color: "#0f0", totalCents: 500_00 },
      { categoryId: "c1", categoryName: "Food", color: "#f00", totalCents: 100_00 },
    ]);
  });
});

describe("rangeWindow", () => {
  it("returns inclusive window for 7D and 6M", () => {
    const w7 = rangeWindow("7D");
    const w6 = rangeWindow("6M");
    expect(w7.months).toBe(1);
    expect(w6.months).toBe(6);
    expect(w7.from.getHours()).toBe(0);
    expect(w6.to.getTime()).toBeGreaterThan(w6.from.getTime());
  });
});