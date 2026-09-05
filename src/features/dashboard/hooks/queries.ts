import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  AccountType,
  Budget,
  CashFlowPoint,
  Category,
  CategoryTotal,
  CurrencyCode,
  DashboardSummary,
  DateRangeKey,
  SavingsGoal,
  Transaction,
  TransactionDraft,
  TransactionKind,
  TransactionStatus,
} from "@/types";
import { api, type Paginated } from "@/lib/api-client";

export const qk = {
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
  transactions: ["transactions"] as const,
  budgets: ["budgets"] as const,
  goals: ["goals"] as const,
  cashFlow: (range: string) => ["cash-flow", range] as const,
  spending: ["spending-by-category"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: async () => {
      const { data } = await api.get<{ data: Category[] }>("/categories");
      return data;
    },
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: qk.accounts,
    queryFn: async () => {
      const res = await api.get<Paginated<Account>>("/accounts");
      return res.data;
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: qk.transactions,
    queryFn: async () => {
      const res = await api.get<Paginated<Transaction>>("/transactions");
      return res.data;
    },
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: qk.budgets,
    queryFn: async () => {
      const res = await api.get<Paginated<Budget>>("/budgets");
      return res.data;
    },
  });
}

export function useGoals() {
  return useQuery({
    queryKey: qk.goals,
    queryFn: async () => {
      const res = await api.get<Paginated<SavingsGoal>>("/goals");
      return res.data;
    },
  });
}

export interface CashFlowResponse {
  data: CashFlowPoint[];
}

export interface SpendingResponse {
  data: CategoryTotal[];
}

export interface SummaryResponse {
  data: DashboardSummary;
}

export function useCashFlow(range: DateRangeKey) {
  return useQuery({
    queryKey: qk.cashFlow(range),
    queryFn: async () => {
      const res = await api.get<CashFlowResponse>(`/dashboard/cashflow?range=${range}`);
      return res.data;
    },
    enabled: false, // Phase 6 wires this; for now return empty
  });
}

export function useSpendingByCategory() {
  return useQuery({
    queryKey: qk.spending,
    queryFn: async () => {
      const res = await api.get<SpendingResponse>("/dashboard/spending-by-category");
      return res.data;
    },
    enabled: false, // Phase 6
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const res = await api.get<SummaryResponse>("/dashboard/summary");
      return res.data;
    },
    enabled: false, // Phase 6
  });
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balanceCents?: number;
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      api.post<{ data: Account }>("/accounts", input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.accounts });
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionDraft) =>
      api
        .post<{ data: Transaction }>("/transactions", {
          ...input,
          amount: input.amount,
        })
        .then((r) => r.data),
    onSuccess: (tx) => {
      qc.setQueryData<Transaction[]>(qk.transactions, (prev) =>
        prev ? [tx, ...prev] : [tx],
      );
      qc.invalidateQueries({ queryKey: qk.transactions });
    },
  });
}

export interface UpdateTransactionInput {
  id: string;
  patch: Partial<TransactionDraft>;
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: UpdateTransactionInput) =>
      api.patch<{ data: Transaction }>(`/transactions/${id}`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.transactions });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<null>(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.transactions });
    },
  });
}

export interface CreateBudgetInput {
  categoryId: string;
  period: "monthly" | "weekly";
  limit: number;
  currency: CurrencyCode;
  startsOn: string;
  endsOn?: string | null;
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      api.post<{ data: Budget }>("/budgets", input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.budgets });
    },
  });
}

export interface UpdateBudgetInput {
  id: string;
  patch: Partial<CreateBudgetInput>;
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: UpdateBudgetInput) =>
      api.patch<{ data: Budget }>(`/budgets/${id}`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.budgets });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<null>(`/budgets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.budgets });
    },
  });
}

export interface CreateGoalInput {
  name: string;
  target: number;
  current: number;
  currency: CurrencyCode;
  targetDate?: string | null;
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      api.post<{ data: SavingsGoal }>("/goals", input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goals });
    },
  });
}

export interface UpdateGoalInput {
  id: string;
  patch: Partial<CreateGoalInput>;
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: UpdateGoalInput) =>
      api.patch<{ data: SavingsGoal }>(`/goals/${id}`, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goals });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<null>(`/goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goals });
    },
  });
}

export interface CreateCategoryInput {
  name: string;
  kind: "income" | "expense";
  color?: string;
  icon?: string;
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      api.post<{ data: Category }>("/categories", input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories });
    },
  });
}

export type {
  Account,
  Budget,
  Category,
  SavingsGoal,
  Transaction,
  TransactionKind,
  TransactionStatus,
};