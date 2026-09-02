import { useEffect, useReducer, useMemo, useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getIncome,
  getExpenses,
  getBalance,
  getSavingsRate,
  filterTransactions,
  sortTransactions,
} from "../utils/transactions";
import { getBudgetStatus } from "../utils/budget";

const initialState = {
  transactions: [],
  budgets: [],
  editingId: null,
  toast: null,
  search: "",
  filterType: "all",
  filterCategory: "all",
  sortBy: "newest",
};

function financeReducer(state, action) {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "SET_BUDGETS":
      return { ...state, budgets: action.payload };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        editingId: null,
        toast: "Transaction added.",
      };
    case "EDIT_TRANSACTION": {
      const updated = state.transactions.map((t) =>
        t.id === action.payload.id ? action.payload : t
      );
      return { ...state, transactions: updated, editingId: null, toast: "Transaction updated." };
    }
    case "DELETE_TRANSACTION": {
      const filtered = state.transactions.filter((t) => t.id !== action.payload);
      if (state.editingId === action.payload) {
        return { ...state, transactions: filtered, editingId: null, toast: "Transaction deleted." };
      }
      return { ...state, transactions: filtered, toast: "Transaction deleted." };
    }
    case "ADD_BUDGET": {
      const existing = state.budgets.find((b) => b.category === action.payload.category);
      if (existing) {
        const updated = state.budgets.map((b) =>
          b.category === action.payload.category ? { ...b, limit: action.payload.limit } : b
        );
        return { ...state, budgets: updated, toast: "Budget updated." };
      }
      return { ...state, budgets: [...state.budgets, action.payload], toast: "Budget created." };
    }
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload),
        toast: "Budget removed.",
      };
    case "CLEAR_ALL":
      return { ...state, transactions: [], budgets: [], editingId: null, toast: "All data cleared." };
    case "START_EDIT":
      return { ...state, editingId: action.payload };
    case "CANCEL_EDIT":
      return { ...state, editingId: null };
    case "DISMISS_TOAST":
      return { ...state, toast: null };
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_FILTER_TYPE":
      return { ...state, filterType: action.payload };
    case "SET_FILTER_CATEGORY":
      return { ...state, filterCategory: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const TODAY = () => new Date().toISOString().split("T")[0];

export function useFinanceData() {
  const { supabase, user } = useAuth();
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = user?.id || null;

  useEffect(() => {
    let cancelled = false;

    if (!supabase || !userId) {
      dispatch({ type: "RESET" });
      setLoading(false);
      return undefined;
    }

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [txResult, budgetResult] = await Promise.all([
          supabase
            .from("transactions")
            .select("id, type, category, amount, description, date, created_at")
            .eq("user_id", userId)
            .order("date", { ascending: false }),
          supabase
            .from("budgets")
            .select("id, category, amount, period, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;
        if (txResult.error) throw txResult.error;
        if (budgetResult.error) throw budgetResult.error;

        const normalizedTransactions = (txResult.data || []).map((row) => ({
          id: row.id,
          type: row.type,
          category: row.category,
          amount: Number(row.amount) || 0,
          description: row.description || "",
          date: row.date,
        }));
        const normalizedBudgets = (budgetResult.data || []).map((row) => ({
          id: row.id,
          category: row.category,
          limit: Number(row.amount) || 0,
          period: row.period || "monthly",
        }));

        dispatch({ type: "SET_TRANSACTIONS", payload: normalizedTransactions });
        dispatch({ type: "SET_BUDGETS", payload: normalizedBudgets });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load your data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  const addTransaction = useCallback(
    async (data) => {
      if (!supabase || !userId) return;
      const payload = {
        user_id: userId,
        type: data.type,
        category: data.category,
        amount: Number(data.amount) || 0,
        description: (data.description || "").trim(),
        date: data.date || TODAY(),
      };
      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert(payload)
        .select("id, type, category, amount, description, date")
        .single();
      if (insertError) throw insertError;
      dispatch({ type: "ADD_TRANSACTION", payload: { ...data, id: inserted.id } });
      return inserted;
    },
    [supabase, userId]
  );

  const editTransaction = useCallback(
    async (transaction) => {
      if (!supabase || !userId) return;
      const payload = {
        type: transaction.type,
        category: transaction.category,
        amount: Number(transaction.amount) || 0,
        description: (transaction.description || "").trim(),
        date: transaction.date,
        updated_at: new Date().toISOString(),
      };
      const { error: updateError } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", transaction.id)
        .eq("user_id", userId);
      if (updateError) throw updateError;
      dispatch({ type: "EDIT_TRANSACTION", payload: transaction });
    },
    [supabase, userId]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      if (!supabase || !userId) return;
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    },
    [supabase, userId]
  );

  const addBudget = useCallback(
    async (budget) => {
      if (!supabase || !userId) return;
      const existing = state.budgets.find((b) => b.category === budget.category);
      if (existing) {
        const { error: updateError } = await supabase
          .from("budgets")
          .update({ amount: Number(budget.limit) || 0, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .eq("user_id", userId);
        if (updateError) throw updateError;
        dispatch({ type: "ADD_BUDGET", payload: budget });
        return;
      }
      const { data: inserted, error: insertError } = await supabase
        .from("budgets")
        .insert({
          user_id: userId,
          category: budget.category,
          amount: Number(budget.limit) || 0,
          period: "monthly",
        })
        .select("id, category, amount")
        .single();
      if (insertError) throw insertError;
      dispatch({ type: "ADD_BUDGET", payload: { ...budget, id: inserted.id } });
    },
    [supabase, userId, state.budgets]
  );

  const deleteBudget = useCallback(
    async (id) => {
      if (!supabase || !userId) return;
      const { error: deleteError } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;
      dispatch({ type: "DELETE_BUDGET", payload: id });
    },
    [supabase, userId]
  );

  const clearAll = useCallback(async () => {
    if (!supabase || !userId) return;
    const { error: txError } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);
    if (txError) throw txError;
    const { error: budgetError } = await supabase
      .from("budgets")
      .delete()
      .eq("user_id", userId);
    if (budgetError) throw budgetError;
    dispatch({ type: "CLEAR_ALL" });
  }, [supabase, userId]);

  const summary = useMemo(() => {
    const income = getIncome(state.transactions);
    const expenses = getExpenses(state.transactions);
    const balance = getBalance(state.transactions);
    const savingsRate = getSavingsRate(state.transactions);
    return { income, expenses, balance, savingsRate };
  }, [state.transactions]);

  const categories = useMemo(() => {
    return [...new Set(state.transactions.map(({ category }) => category))].sort();
  }, [state.transactions]);

  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(
      state.transactions,
      state.search,
      state.filterType,
      state.filterCategory
    );
    return sortTransactions(filtered, state.sortBy);
  }, [state.transactions, state.search, state.filterType, state.filterCategory, state.sortBy]);

  const budgetStats = useMemo(() => {
    return state.budgets.map((budget) => {
      const spent = state.transactions
        .filter(({ type, category }) => type === "expense" && category === budget.category)
        .reduce((total, { amount }) => total + Number(amount), 0);
      const percent = budget.limit ? (spent / budget.limit) * 100 : 0;
      const width = Math.min(percent, 100);
      const status = getBudgetStatus(budget.limit, spent);
      const remaining = budget.limit - spent;
      return { ...budget, spent, percent, width, status, remaining };
    });
  }, [state.budgets, state.transactions]);

  const insights = useMemo(() => {
    const expenses = state.transactions.filter(({ type }) => type === "expense");
    const categoryTotals = expenses.reduce((result, transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + Number(transaction.amount);
      return result;
    }, {});

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];
    const average =
      expenses.length > 0
        ? expenses.reduce((sum, { amount }) => sum + Number(amount), 0) / expenses.length
        : 0;

    return { topCategory, average, categoryTotals, expenseCount: expenses.length };
  }, [state.transactions]);

  return {
    state,
    dispatch,
    summary,
    categories,
    filteredTransactions,
    budgetStats,
    insights,
    loading,
    error,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addBudget,
    deleteBudget,
    clearAll,
    TODAY,
  };
}
