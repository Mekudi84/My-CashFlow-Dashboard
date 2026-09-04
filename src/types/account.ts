import type { CurrencyCode } from "./currency";

export type AccountType = "checking" | "savings" | "cash" | "credit";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balanceCents: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}