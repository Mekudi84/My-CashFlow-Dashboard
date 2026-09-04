import type { CurrencyCode } from "./currency";

export type BudgetPeriod = "monthly" | "weekly";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  period: BudgetPeriod;
  limitCents: number;
  currency: CurrencyCode;
  startsOn: string;
  endsOn: string | null;
  createdAt: string;
  updatedAt: string;
}