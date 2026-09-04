import type { CurrencyCode } from "./currency";

export type TransactionKind = "income" | "expense" | "transfer";
export type TransactionStatus = "pending" | "completed";

export interface Transaction {
  id: string;
  userId: string;
  accountId: string | null;
  categoryId: string | null;
  kind: TransactionKind;
  amountCents: number;
  currency: CurrencyCode;
  occurredOn: string;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDraft {
  accountId: string | null;
  categoryId: string | null;
  kind: TransactionKind;
  amount: number;
  currency: CurrencyCode;
  occurredOn: string;
  description: string;
  status: TransactionStatus;
}