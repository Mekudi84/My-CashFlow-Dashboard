import type { CurrencyCode } from "./currency";

export interface DashboardSummary {
  totalBalanceCents: number;
  monthlyIncomeCents: number;
  monthlyExpensesCents: number;
  totalSavingsCents: number;
  deltas: {
    balance: number;
    income: number;
    expenses: number;
    savings: number;
  };
  currency: CurrencyCode;
  asOf: string;
}

export interface CashFlowPoint {
  month: string;
  incomeCents: number;
  expensesCents: number;
  netCents: number;
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  color: string;
  totalCents: number;
}

export interface DashboardAnalytics {
  cashFlow: CashFlowPoint[];
  byCategory: CategoryTotal[];
  range: DateRangeKey;
}

export type DateRangeKey = "7D" | "30D" | "3M" | "6M" | "1Y";