import type {
  Account,
  Budget,
  CashFlowPoint,
  CategoryTotal,
  DashboardSummary,
  DateRangeKey,
  SavingsGoal,
  Transaction,
  TransactionDraft,
} from "@/types";
import {
  DEMO_USER_ID,
  MOCK_ACCOUNTS,
  MOCK_BUDGETS,
  MOCK_CATEGORIES,
  MOCK_GOALS,
  MOCK_SUMMARY,
  MOCK_TRANSACTIONS,
  makeAccountId,
  makeBudgetId,
  makeTransactionId,
} from "@/features/dashboard/data/seed";

const LATENCY_MS = 220;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Store = {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
};

declare global {
  // eslint-disable-next-line no-var
  var __FINANCE_STORE__: Store | undefined;
}

function getStore(): Store {
  if (!globalThis.__FINANCE_STORE__) {
    globalThis.__FINANCE_STORE__ = {
      accounts: [...MOCK_ACCOUNTS],
      transactions: [...MOCK_TRANSACTIONS],
      budgets: [...MOCK_BUDGETS],
      goals: [...MOCK_GOALS],
    };
  }
  return globalThis.__FINANCE_STORE__;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function listCategories(): Promise<typeof MOCK_CATEGORIES> {
  await sleep(LATENCY_MS);
  return MOCK_CATEGORIES;
}

export async function listAccounts(): Promise<Account[]> {
  await sleep(LATENCY_MS);
  return [...getStore().accounts];
}

export async function listTransactions(): Promise<Transaction[]> {
  await sleep(LATENCY_MS);
  return [...getStore().transactions].sort((a, b) =>
    a.occurredOn < b.occurredOn ? 1 : a.occurredOn > b.occurredOn ? -1 : 0,
  );
}

export async function listBudgets(): Promise<Budget[]> {
  await sleep(LATENCY_MS);
  return [...getStore().budgets];
}

export async function listGoals(): Promise<SavingsGoal[]> {
  await sleep(LATENCY_MS);
  return [...getStore().goals];
}

export async function getSummary(): Promise<DashboardSummary> {
  await sleep(LATENCY_MS);
  return MOCK_SUMMARY;
}

export async function getCashFlow(range: DateRangeKey): Promise<CashFlowPoint[]> {
  await sleep(LATENCY_MS);
  const months = { "7D": 1, "30D": 1, "3M": 3, "6M": 6, "1Y": 12 }[range];
  const baseIncome = [4100, 4300, 4250, 6800, 4500, 5100, 4400, 5200, 4300, 7400, 4600, 7250];
  const baseExpenses = [3800, 3920, 4050, 4100, 4200, 4400, 4080, 4180, 4150, 4250, 4280, 4100];
  const out: CashFlowPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const idx = 11 - i;
    const noise = Math.round(Math.sin((idx + 1) * 1.3) * 220);
    const income = Math.max(1500, (baseIncome[idx] ?? 4500) + noise);
    const expenses = Math.max(1200, (baseExpenses[idx] ?? 4100) - noise);
    out.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      incomeCents: Math.round(income) * 100,
      expensesCents: Math.round(expenses) * 100,
      netCents: (Math.round(income) - Math.round(expenses)) * 100,
    });
  }
  return out;
}

export async function getSpendingByCategory(): Promise<CategoryTotal[]> {
  await sleep(LATENCY_MS);
  const byId = new Map<string, number>();
  for (const t of getStore().transactions) {
    if (t.kind !== "expense" || !t.categoryId) continue;
    byId.set(t.categoryId, (byId.get(t.categoryId) ?? 0) + t.amountCents);
  }
  return MOCK_CATEGORIES.filter((c) => c.kind === "expense")
    .map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      color: c.color,
      totalCents: byId.get(c.id) ?? 0,
    }))
    .filter((c) => c.totalCents > 0)
    .sort((a, b) => b.totalCents - a.totalCents);
}

export async function createTransaction(input: TransactionDraft): Promise<Transaction> {
  await sleep(LATENCY_MS);
  if (input.amount <= 0) {
    throw new ApiError(400, "INVALID_AMOUNT", "Amount must be greater than zero");
  }
  const tx: Transaction = {
    id: makeTransactionId(),
    userId: DEMO_USER_ID,
    accountId: input.accountId,
    categoryId: input.categoryId,
    kind: input.kind,
    amountCents: Math.round(input.amount * 100),
    currency: input.currency,
    occurredOn: input.occurredOn,
    description: input.description.trim(),
    status: input.status,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  getStore().transactions = [tx, ...getStore().transactions];
  return tx;
}

export async function updateTransaction(
  id: string,
  patch: Partial<TransactionDraft>,
): Promise<Transaction> {
  await sleep(LATENCY_MS);
  const store = getStore();
  const idx = store.transactions.findIndex((t) => t.id === id);
  if (idx === -1) throw new ApiError(404, "NOT_FOUND", "Transaction not found");
  const current = store.transactions[idx];
  if (!current) throw new ApiError(404, "NOT_FOUND", "Transaction not found");
  const next: Transaction = {
    ...current,
    ...(patch.amount !== undefined ? { amountCents: Math.round(patch.amount * 100) } : {}),
    ...(patch.description !== undefined ? { description: patch.description.trim() } : {}),
    ...(patch.categoryId !== undefined ? { categoryId: patch.categoryId } : {}),
    ...(patch.kind !== undefined ? { kind: patch.kind } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.occurredOn !== undefined ? { occurredOn: patch.occurredOn } : {}),
    updatedAt: nowIso(),
  };
  store.transactions[idx] = next;
  return next;
}

export async function deleteTransaction(id: string): Promise<void> {
  await sleep(LATENCY_MS);
  const store = getStore();
  store.transactions = store.transactions.filter((t) => t.id !== id);
}

export async function createAccount(
  input: Pick<Account, "name" | "type" | "currency">,
): Promise<Account> {
  await sleep(LATENCY_MS);
  const a: Account = {
    id: makeAccountId(),
    userId: DEMO_USER_ID,
    name: input.name,
    type: input.type,
    currency: input.currency,
    balanceCents: 0,
    archivedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  getStore().accounts = [a, ...getStore().accounts];
  return a;
}

export async function createBudget(
  input: Pick<Budget, "categoryId" | "period" | "limitCents" | "currency" | "startsOn">,
): Promise<Budget> {
  await sleep(LATENCY_MS);
  const b: Budget = {
    id: makeBudgetId(),
    userId: DEMO_USER_ID,
    categoryId: input.categoryId,
    period: input.period,
    limitCents: input.limitCents,
    currency: input.currency,
    startsOn: input.startsOn,
    endsOn: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  getStore().budgets = [b, ...getStore().budgets];
  return b;
}

export async function updateGoal(
  id: string,
  patch: Partial<Pick<SavingsGoal, "name" | "targetCents" | "currentCents" | "targetDate">>,
): Promise<SavingsGoal> {
  await sleep(LATENCY_MS);
  const store = getStore();
  const idx = store.goals.findIndex((g) => g.id === id);
  if (idx === -1) throw new ApiError(404, "NOT_FOUND", "Savings goal not found");
  const current = store.goals[idx];
  if (!current) throw new ApiError(404, "NOT_FOUND", "Savings goal not found");
  const next: SavingsGoal = { ...current, ...patch, updatedAt: nowIso() };
  store.goals[idx] = next;
  return next;
}

export class ApiError extends Error {
  override readonly name = "ApiError";
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}