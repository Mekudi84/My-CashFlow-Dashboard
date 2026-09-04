import { useReducer, useEffect, useMemo } from "react";
import {
  getIncome,
  getExpenses,
  getBalance,
  getSavingsRate,
  getCategoryExpenses,
  filterTransactions,
  sortTransactions,
  findTransaction,
} from "../utils/transactions";
import { getBudgetSpent, getBudgetStatus } from "../utils/budget";

const STORAGE_KEY_TRANSACTIONS = "financeflow_transactions";
const STORAGE_KEY_BUDGETS = "financeflow_budgets";

const TODAY = () => new Date().toISOString().split("T")[0];

function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

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
      return {
        ...state,
        transactions: [],
        budgets: [],
        editingId: null,
        toast: "All data cleared.",
      };
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
    default:
      return state;
  }
}

export function useFinanceData() {
  const [state, dispatch] = useReducer(financeReducer, undefined, () => ({
    ...initialState,
    transactions: loadFromStorage(STORAGE_KEY_TRANSACTIONS, []),
    budgets: loadFromStorage(STORAGE_KEY_BUDGETS, []),
  }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(state.transactions));
    } catch (error) {
      console.error("Could not save transactions:", error);
    }
  }, [state.transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(state.budgets));
    } catch (error) {
      console.error("Could not save budgets:", error);
    }
  }, [state.budgets]);

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
      const spent = getBudgetSpent(state.transactions, budget.category);
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
    TODAY,
  };
}
