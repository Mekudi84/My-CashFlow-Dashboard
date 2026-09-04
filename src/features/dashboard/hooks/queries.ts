import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction, TransactionDraft } from "@/types";
import {
  createTransaction,
  deleteTransaction,
  getCashFlow,
  getSpendingByCategory,
  getSummary,
  listAccounts,
  listBudgets,
  listCategories,
  listGoals,
  listTransactions,
  updateTransaction,
} from "@/api/mock";

export const qk = {
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
  transactions: ["transactions"] as const,
  budgets: ["budgets"] as const,
  goals: ["goals"] as const,
  summary: ["summary"] as const,
  cashFlow: (range: string) => ["cash-flow", range] as const,
  spending: ["spending-by-category"] as const,
};

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: listCategories });
}

export function useAccounts() {
  return useQuery({ queryKey: qk.accounts, queryFn: listAccounts });
}

export function useTransactions() {
  return useQuery({ queryKey: qk.transactions, queryFn: listTransactions });
}

export function useBudgets() {
  return useQuery({ queryKey: qk.budgets, queryFn: listBudgets });
}

export function useGoals() {
  return useQuery({ queryKey: qk.goals, queryFn: listGoals });
}

export function useSummary() {
  return useQuery({ queryKey: qk.summary, queryFn: getSummary });
}

export function useCashFlow(range: string) {
  return useQuery({
    queryKey: qk.cashFlow(range),
    queryFn: () => getCashFlow(range as Parameters<typeof getCashFlow>[0]),
  });
}

export function useSpendingByCategory() {
  return useQuery({ queryKey: qk.spending, queryFn: getSpendingByCategory });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionDraft) => createTransaction(input),
    onSuccess: (tx: Transaction) => {
      qc.setQueryData<Transaction[]>(qk.transactions, (prev) => [tx, ...(prev ?? [])]);
      qc.invalidateQueries({ queryKey: qk.summary });
      qc.invalidateQueries({ queryKey: qk.spending });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TransactionDraft> }) =>
      updateTransaction(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.transactions });
      qc.invalidateQueries({ queryKey: qk.summary });
      qc.invalidateQueries({ queryKey: qk.spending });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.transactions });
      qc.invalidateQueries({ queryKey: qk.summary });
      qc.invalidateQueries({ queryKey: qk.spending });
    },
  });
}