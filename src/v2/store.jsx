import { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  MOCK_TRANSACTIONS,
  MOCK_BUDGETS,
  MOCK_SAVINGS_GOALS,
  MOCK_INSIGHTS,
  CATEGORIES,
} from "./data/mockData";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [budgets, setBudgets] = useState(MOCK_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState(MOCK_SAVINGS_GOALS);
  const [insights] = useState(MOCK_INSIGHTS);

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => [{ ...tx, id: `t${Date.now()}` }, ...prev]);
  }, []);

  const updateTransaction = useCallback((id, patch) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSavingsGoal = useCallback((id, patch) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      savingsGoals,
      insights,
      categories: CATEGORIES,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateSavingsGoal,
    }),
    [
      transactions,
      budgets,
      savingsGoals,
      insights,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateSavingsGoal,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
