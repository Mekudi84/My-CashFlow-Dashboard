import type { CurrencyCode } from "./currency";

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetCents: number;
  currentCents: number;
  currency: CurrencyCode;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}